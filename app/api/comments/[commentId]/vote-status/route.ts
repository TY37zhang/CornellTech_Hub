import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

type Props = {
    params: {
        commentId: string;
    };
};

export async function GET(request: Request, { params }: Props) {
    const resolvedParams = await Promise.resolve(params);
    try {
        // Get the user session
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json(
                { success: false, error: "Unauthorized" },
                { status: 401 }
            );
        }

        const userId = session.user.id;
        const commentId = resolvedParams.commentId;

        // Get the user's vote status for this comment
        const result = await sql`
            SELECT action_type as vote_type
            FROM comment_votes
            WHERE comment_id = ${commentId}
            AND user_id = ${userId}
        `;

        return NextResponse.json({
            success: true,
            voteType: result[0]?.vote_type || null,
        });
    } catch (error) {
        console.error("Error getting vote status:", error);
        return NextResponse.json(
            { success: false, error: "Failed to get vote status" },
            { status: 500 }
        );
    }
}
