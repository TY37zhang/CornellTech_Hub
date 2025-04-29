import { NextRequest } from "next/server";
import { sql } from "@/lib/db/config";
import { getCommentVoteStatus } from "@/app/forum/actions";

export async function GET(
    request: NextRequest,
    { params }: { params: { commentId: string } }
) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get("userId");
        const resolvedParams = await Promise.resolve(params);
        const commentId = resolvedParams.commentId;

        if (!userId) {
            return new Response(
                JSON.stringify({
                    success: false,
                    error: "User ID is required",
                }),
                { status: 400 }
            );
        }

        const result = await getCommentVoteStatus(commentId, userId);

        return new Response(
            JSON.stringify({
                success: true,
                voteType: result.voteType,
            })
        );
    } catch (error) {
        console.error("Error getting vote status:", error);
        return new Response(
            JSON.stringify({
                success: false,
                error: error instanceof Error ? error.message : "Unknown error",
            }),
            { status: 500 }
        );
    }
}
