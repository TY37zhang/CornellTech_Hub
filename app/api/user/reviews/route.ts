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

        // Fetch user's reviews with detailed course information
        const reviews = await sql`
            WITH review_data AS (
                SELECT 
                    cr.id,
                    cr.course_id,
                    cr.rating as value,
                    cr.difficulty,
                    cr.workload,
                    cr.content,
                    cr.created_at,
                    cr.updated_at,
                    cr.overall_rating as rating,
                    cr.grade,
                    c.name as course_name,
                    c.code as course_code,
                    c.department as category,
                    c.professor_id,
                    c.semester,
                    c.year,
                    c.credits
                FROM course_reviews cr
                JOIN courses c ON cr.course_id = c.id
                WHERE cr.author_id = ${session.user.id}
            )
            SELECT 
                rd.*,
                STRING_AGG(DISTINCT c2.code, ', ') as cross_listed_codes,
                STRING_AGG(DISTINCT c2.department, ', ') as departments
            FROM review_data rd
            LEFT JOIN courses c2 ON c2.name = rd.course_name AND c2.professor_id = rd.professor_id
            GROUP BY 
                rd.id, rd.course_id, rd.value, rd.difficulty, rd.workload, 
                rd.content, rd.created_at, rd.updated_at, rd.rating, 
                rd.grade,
                rd.course_name, rd.course_code, rd.category, rd.professor_id,
                rd.semester, rd.year, rd.credits
            ORDER BY rd.created_at DESC
        `;

        // Transform the data to match the frontend interface
        const transformedReviews = reviews.map((review) => ({
            id: review.id,
            courseId: review.course_id,
            courseName: review.course_name,
            courseCode: review.course_code,
            category: review.category,
            content: review.content,
            createdAt: review.created_at,
            updatedAt: review.updated_at,
            rating: Number(review.rating) || 0,
            value: Number(review.value) || 0,
            difficulty: Number(review.difficulty) || 0,
            workload: Number(review.workload) || 0,
            grade: review.grade || undefined,
            // Additional course information
            professor: review.professor_id || "Unknown Professor",
            semester: review.semester,
            year: review.year,
            credits: review.credits,
            // Cross-listed information
            crossListed: review.cross_listed_codes
                ? {
                      codes: review.cross_listed_codes.split(", "),
                      departments: review.departments.split(", "),
                  }
                : null,
        }));

        return NextResponse.json(transformedReviews);
    } catch (error) {
        console.error("Error fetching user reviews:", error);
        return NextResponse.json(
            { error: "Failed to fetch user reviews" },
            { status: 500 }
        );
    }
}
