import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL || "");

export async function DELETE(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const reviewId = params.id;

        // First verify the review belongs to the user
        const review = await sql`
            SELECT id 
            FROM course_reviews 
            WHERE id = ${reviewId} 
            AND author_id = ${session.user.id}
        `;

        if (!review || review.length === 0) {
            return NextResponse.json(
                { error: "Review not found or unauthorized" },
                { status: 404 }
            );
        }

        // Delete the review
        await sql`
            DELETE FROM course_reviews 
            WHERE id = ${reviewId}
        `;

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting review:", error);
        return NextResponse.json(
            { error: "Failed to delete review" },
            { status: 500 }
        );
    }
}
