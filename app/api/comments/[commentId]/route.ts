import { prisma } from "@/lib/db/prisma";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

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
