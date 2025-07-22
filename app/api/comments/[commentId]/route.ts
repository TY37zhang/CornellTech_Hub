import { prisma } from "@/lib/db/prisma";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sanitizeContent } from "@/lib/sanitization";

// Helper function to recursively clean up deleted parent comments that have no remaining replies
async function cleanupDeletedParentComments(parentId: string) {
    const parentComment = await prisma.forum_comments.findUnique({
        where: { id: parentId },
        select: {
            id: true,
            is_deleted: true,
            parent_id: true,
            other_forum_comments: {
                select: { id: true }
            }
        }
    });

    if (!parentComment) {
        return; // Parent comment doesn't exist, nothing to clean up
    }

    // Only clean up if the parent is deleted and has no remaining replies
    if (parentComment.is_deleted && parentComment.other_forum_comments.length === 0) {
        const grandparentId = parentComment.parent_id;
        
        // Delete the parent comment completely
        await prisma.forum_comments.delete({
            where: { id: parentId }
        });
        
        // Recursively check if grandparent should be cleaned up
        if (grandparentId) {
            await cleanupDeletedParentComments(grandparentId);
        }
    }
}

export async function PUT(
    request: Request,
    { params }: { params: { commentId: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                { success: false, error: "Unauthorized" },
                { status: 401 }
            );
        }

        const { content } = await request.json();

        if (!content || typeof content !== "string") {
            return NextResponse.json(
                { success: false, error: "Content is required" },
                { status: 400 }
            );
        }

        // Sanitize and validate content
        const sanitizationResult = sanitizeContent(content.trim(), 'text');
        
        if (!sanitizationResult.isValid) {
            return NextResponse.json(
                { 
                    success: false, 
                    error: "Content violates community guidelines",
                    violations: sanitizationResult.violations
                },
                { status: 400 }
            );
        }

        const sanitizedContent = sanitizationResult.sanitized;

        if (sanitizedContent.length < 1) {
            return NextResponse.json(
                { success: false, error: "Comment cannot be empty" },
                { status: 400 }
            );
        }

        if (sanitizedContent.length > 2000) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Comment must be less than 2000 characters",
                },
                { status: 400 }
            );
        }

        const { commentId } = await params;

        const comment = await prisma.forum_comments.findUnique({
            where: { id: commentId },
            select: {
                author_id: true,
                post_id: true,
            },
        });

        if (!comment) {
            return NextResponse.json(
                { success: false, error: "Comment not found" },
                { status: 404 }
            );
        }

        if (comment.author_id !== session.user.id) {
            return NextResponse.json(
                {
                    success: false,
                    error: "You are not authorized to edit this comment",
                },
                { status: 403 }
            );
        }

        const updatedComment = await prisma.forum_comments.update({
            where: { id: commentId },
            data: {
                content: sanitizedContent,
                updated_at: new Date(),
            },
        });

        // Revalidate the thread page so the updated comment is refreshed
        if (comment.post_id) {
            revalidatePath(`/forum/${comment.post_id}`);
        }

        return NextResponse.json({
            success: true,
            comment: {
                id: updatedComment.id,
                content: updatedComment.content,
                updated_at: updatedComment.updated_at,
            },
        });
    } catch (error) {
        console.error("Error updating comment:", error);
        return NextResponse.json(
            { success: false, error: "Failed to update comment" },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: { commentId: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                { success: false, error: "Unauthorized" },
                { status: 401 }
            );
        }

        const userId = session.user.id;

        const { commentId } = await params;
        
        const comment = await prisma.forum_comments.findUnique({
            where: { id: commentId },
            select: {
                author_id: true,
                post_id: true,
                parent_id: true,
                other_forum_comments: {
                    select: { id: true },
                },
            },
        });

        if (!comment) {
            return NextResponse.json(
                { success: false, error: "Comment not found" },
                { status: 404 }
            );
        }

        if (comment.author_id !== userId) {
            return NextResponse.json(
                {
                    success: false,
                    error: "You are not authorized to delete this comment",
                },
                { status: 403 }
            );
        }

        // Check if comment has replies
        const hasReplies =
            comment.other_forum_comments &&
            comment.other_forum_comments.length > 0;

        if (hasReplies) {
            // Soft delete: Mark as deleted but keep the record to preserve thread structure
            await prisma.forum_comments.update({
                where: { id: commentId },
                data: {
                    is_deleted: true,
                    updated_at: new Date(),
                },
            });
        } else {
            // Hard delete: Remove completely since no replies depend on it
            await prisma.forum_comments.delete({
                where: { id: commentId },
            });
            
            // After deleting, check if parent comment should be cleaned up
            if (comment.parent_id) {
                await cleanupDeletedParentComments(comment.parent_id);
            }
        }

        // Revalidate the thread page so the deleted comment is updated in cache
        if (comment.post_id) {
            revalidatePath(`/forum/${comment.post_id}`);
        }

        return NextResponse.json({
            success: true,
            deletionType: hasReplies ? "soft" : "hard",
        });
    } catch (error) {
        console.error("Error deleting comment:", error);
        return NextResponse.json(
            { success: false, error: "Failed to delete comment" },
            { status: 500 }
        );
    }
}
