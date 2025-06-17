import { prisma } from "@/lib/db/prisma";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

export async function POST(
    request: Request,
    { params }: { params: { commentId: string } }
) {
    try {
        const { userId, action } = await request.json();

        if (!userId || !action) {
            return NextResponse.json(
                { success: false, error: "User ID and action are required" },
                { status: 400 }
            );
        }

        // Use Prisma transaction for consistency
        const result = await prisma.$transaction(async (tx) => {
            const commentId = params.commentId;
            const voteValue = action === "like" ? "upvote" : "downvote";

            // Find existing vote
            const existing = await tx.comment_votes.findFirst({
                where: { comment_id: commentId, user_id: userId },
            });

            let likeIncrement = 0;
            let dislikeIncrement = 0;

            if (existing) {
                if (existing.action_type === voteValue) {
                    // Remove vote
                    await tx.comment_votes.delete({
                        where: { id: existing.id },
                    });
                    if (voteValue === "upvote") likeIncrement = -1;
                    else dislikeIncrement = -1;
                } else {
                    // Change vote
                    await tx.comment_votes.update({
                        where: { id: existing.id },
                        data: {
                            action_type: voteValue,
                            updated_at: new Date(),
                        },
                    });
                    if (voteValue === "upvote") {
                        likeIncrement = 1;
                        dislikeIncrement = -1;
                    } else {
                        likeIncrement = -1;
                        dislikeIncrement = 1;
                    }
                }
            } else {
                // Add new vote
                await tx.comment_votes.create({
                    data: {
                        comment_id: commentId,
                        user_id: userId,
                        action_type: voteValue,
                    },
                });
                if (voteValue === "upvote") likeIncrement = 1;
                else dislikeIncrement = 1;
            }

            // Update counts if needed
            if (likeIncrement !== 0 || dislikeIncrement !== 0) {
                await tx.forum_comments.update({
                    where: { id: commentId },
                    data: {
                        like_count: { increment: likeIncrement },
                        dislike_count: { increment: dislikeIncrement },
                    },
                });
            }

            // Fetch updated counts & post id for revalidation
            const updatedComment = await tx.forum_comments.findUnique({
                where: { id: commentId },
                select: {
                    like_count: true,
                    dislike_count: true,
                    post_id: true,
                },
            });

            return updatedComment;
        });

        if (result?.post_id) {
            revalidatePath(`/forum/${result.post_id}`);
        }

        return NextResponse.json({
            success: true,
            likeCount: result?.like_count ?? 0,
            dislikeCount: result?.dislike_count ?? 0,
        });
    } catch (error) {
        console.error("Error processing vote:", error);
        return NextResponse.json(
            { success: false, error: "Failed to process vote" },
            { status: 500 }
        );
    }
}
