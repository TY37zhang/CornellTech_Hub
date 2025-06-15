import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL || "");

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const courseId = params.id;

        // Fetch reviews for the specified course with author information
        const reviews = await sql`
      SELECT 
        cr.id,
        cr.rating as value,
        cr.difficulty,
        cr.workload,
        cr.content,
        cr.created_at,
        cr.updated_at,
        cr.overall_rating as rating,
        cr.grade,
        u.name as author_name,
        u.image as author_image
      FROM course_reviews cr
      JOIN users u ON cr.author_id = u.id
      WHERE cr.course_id = ${courseId}
      ORDER BY cr.created_at DESC
    `;

        if (reviews.length === 0) {
            return NextResponse.json({ reviews: [] });
        }

        // Transform the data to match the frontend interface
        const transformedReviews = reviews.map((review) => ({
            id: review.id,
            content: review.content,
            createdAt: review.created_at,
            updatedAt: review.updated_at,
            rating: Number(review.rating) || 0,
            value: Number(review.value) || 0,
            difficulty: Number(review.difficulty) || 0,
            workload: Number(review.workload) || 0,
            grade: review.grade || undefined,
            author: {
                name: review.author_name || "Anonymous",
                image: review.author_image || null,
            },
        }));

        return NextResponse.json({ reviews: transformedReviews });
    } catch (error) {
        console.error("Error fetching course reviews:", error);
        return NextResponse.json(
            { error: "Failed to fetch course reviews" },
            { status: 500 }
        );
    }
}
