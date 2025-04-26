import { neon } from "@neondatabase/serverless";
import { NextResponse } from "next/server";

// Initialize the Neon client
const sql = neon(process.env.DATABASE_URL || "");

interface RouteParams {
    params: { commentId: string };
}

export async function GET(request: Request, { params }: RouteParams) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get("userId");

        if (!userId) {
            return NextResponse.json(
                { success: false, error: "User ID is required" },
                { status: 400 }
            );
        }

        const result = await sql`
            SELECT action_type as vote_type
            FROM comment_votes
            WHERE comment_id = ${params.commentId}
            AND user_id = ${userId}
        `;

        if (result.length === 0) {
            return NextResponse.json({
                success: true,
                voteType: null,
            });
        }

        return NextResponse.json({
            success: true,
            voteType: result[0].vote_type,
        });
    } catch (error) {
        console.error("Error checking vote status:", error);
        return NextResponse.json(
            { success: false, error: "Failed to check vote status" },
            { status: 500 }
        );
    }
}
