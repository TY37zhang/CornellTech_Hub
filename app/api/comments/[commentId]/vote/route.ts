import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

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

        // Check if user has already voted
        const existingVote = await sql`
            SELECT action
            FROM comment_votes
            WHERE comment_id = ${params.commentId}
            AND user_id = ${userId}
        `;

        // Get the parent post ID for revalidation
        const postResult = await sql`
            SELECT post_id
            FROM forum_comments
            WHERE id = ${params.commentId}
        `;

        const postId = postResult.rows[0]?.post_id;

        if (existingVote.rows.length > 0) {
            const currentAction = existingVote.rows[0].action;

            if (currentAction === action) {
                // Remove the vote if clicking the same action
                await sql`
                    DELETE FROM comment_votes
                    WHERE comment_id = ${params.commentId}
                    AND user_id = ${userId}
                `;

                // Update counts
                if (action === "like") {
                    await sql`
                        UPDATE forum_comments
                        SET like_count = like_count - 1
                        WHERE id = ${params.commentId}
                    `;
                } else {
                    await sql`
                        UPDATE forum_comments
                        SET dislike_count = dislike_count - 1
                        WHERE id = ${params.commentId}
                    `;
                }
            } else {
                // Change vote from like to dislike or vice versa
                await sql`
                    UPDATE comment_votes
                    SET action = ${action}
                    WHERE comment_id = ${params.commentId}
                    AND user_id = ${userId}
                `;

                // Update counts
                if (action === "like") {
                    await sql`
                        UPDATE forum_comments
                        SET like_count = like_count + 1,
                            dislike_count = dislike_count - 1
                        WHERE id = ${params.commentId}
                    `;
                } else {
                    await sql`
                        UPDATE forum_comments
                        SET like_count = like_count - 1,
                            dislike_count = dislike_count + 1
                        WHERE id = ${params.commentId}
                    `;
                }
            }
        } else {
            // Add new vote
            await sql`
                INSERT INTO comment_votes (comment_id, user_id, action)
                VALUES (${params.commentId}, ${userId}, ${action})
            `;

            // Update counts
            if (action === "like") {
                await sql`
                    UPDATE forum_comments
                    SET like_count = like_count + 1
                    WHERE id = ${params.commentId}
                `;
            } else {
                await sql`
                    UPDATE forum_comments
                    SET dislike_count = dislike_count + 1
                    WHERE id = ${params.commentId}
                `;
            }
        }

        // Get updated counts
        const updatedCounts = await sql`
            SELECT like_count, dislike_count
            FROM forum_comments
            WHERE id = ${params.commentId}
        `;

        if (postId) {
            revalidatePath(`/forum/${postId}`);
        }

        return NextResponse.json({
            success: true,
            likeCount: updatedCounts.rows[0].like_count,
            dislikeCount: updatedCounts.rows[0].dislike_count,
        });
    } catch (error) {
        console.error("Error processing vote:", error);
        return NextResponse.json(
            { success: false, error: "Failed to process vote" },
            { status: 500 }
        );
    }
}
