import { prisma } from "@/lib/db/prisma";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

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

        if (!content || typeof content !== 'string') {
            return NextResponse.json(
                { success: false, error: "Content is required" },
                { status: 400 }
            );
        }

        const trimmedContent = content.trim();
        
        if (trimmedContent.length < 1) {
            return NextResponse.json(
                { success: false, error: "Comment cannot be empty" },
                { status: 400 }
            );
        }

        if (trimmedContent.length > 2000) {
            return NextResponse.json(
                { success: false, error: "Comment must be less than 2000 characters" },
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
                content: trimmedContent,
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
            }
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
        const { userId } = await request.json();

        if (!userId) {
            return NextResponse.json(
                { success: false, error: "User ID is required" },
                { status: 400 }
            );
        }

        const comment = await prisma.forum_comments.findUnique({
            where: { id: params.commentId },
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

        if (comment.author_id !== userId) {
            return NextResponse.json(
                {
                    success: false,
                    error: "You are not authorized to delete this comment",
                },
                { status: 403 }
            );
        }

        await prisma.forum_comments.delete({ where: { id: params.commentId } });

        // Revalidate the thread page so the deleted comment is removed from cache
        if (comment.post_id) {
            revalidatePath(`/forum/${comment.post_id}`);
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting comment:", error);
        return NextResponse.json(
            { success: false, error: "Failed to delete comment" },
            { status: 500 }
        );
    }
}
