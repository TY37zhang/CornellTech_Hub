import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL || "");

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        // Fetch user's reviews from the database
        const reviews = await sql`
            SELECT 
                cr.id,
                cr.course_id,
                cr.rating,
                cr.difficulty,
                cr.workload,
                cr.content,
                cr.created_at,
                cr.updated_at,
                cr.overall_rating,
                c.name as course_name,
                c.code as course_code
            FROM course_reviews cr
            JOIN courses c ON cr.course_id = c.id
            WHERE cr.author_id = ${session.user.id}
            ORDER BY cr.created_at DESC
        `;

        return NextResponse.json(reviews);
    } catch (error) {
        console.error("Error fetching user reviews:", error);
        return NextResponse.json(
            { error: "Failed to fetch user reviews" },
            { status: 500 }
        );
    }
}
