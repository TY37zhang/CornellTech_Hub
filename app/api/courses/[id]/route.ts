import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

// Initialize the Neon client
const sql = neon(process.env.DATABASE_URL || "");

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const courseId = params.id;

        // Fetch the specific course with its details
        const courseResult = await sql`
            SELECT 
                c.id,
                c.code,
                c.name as title,
                c.department as category,
                c.semester,
                c.year,
                c.credits,
                u.name as professor,
                COUNT(cr.id) as review_count,
                ROUND(AVG(cr.rating)::numeric, 1) as rating,
                ROUND(AVG(cr.difficulty)::numeric, 1) as difficulty,
                ROUND(AVG(cr.workload)::numeric, 1) as workload,
                ROUND(AVG(cr.rating)::numeric, 1) as value
            FROM courses c
            LEFT JOIN course_reviews cr ON c.id = cr.course_id
            LEFT JOIN users u ON c.professor_id = u.id
            WHERE c.code = ${courseId}
            GROUP BY c.id, c.code, c.name, c.department, c.semester, c.year, c.credits, u.name
        `;

        if (courseResult.length === 0) {
            return NextResponse.json(
                { error: "Course not found" },
                { status: 404 }
            );
        }

        const course = courseResult[0];

        // Fetch reviews for this course
        const reviewsResult = await sql`
            SELECT 
                cr.id,
                cr.content,
                cr.rating,
                cr.difficulty,
                cr.workload,
                cr.created_at,
                u.name as author,
                u.avatar_url
            FROM course_reviews cr
            JOIN users u ON cr.author_id = u.id
            WHERE cr.course_id = ${course.id}
            ORDER BY cr.created_at DESC
        `;

        // Transform the data
        const transformedCourse = {
            id: course.code,
            title: course.title,
            professor: course.professor || "Unknown Professor",
            category: course.category.toLowerCase(),
            semester: course.semester,
            year: course.year,
            credits: course.credits,
            rating: Number(course.rating) || 0,
            reviewCount: Number(course.review_count) || 0,
            difficulty: Number(course.difficulty) || 0,
            workload: Number(course.workload) || 0,
            value: Number(course.value) || 0,
            categoryColor: getCategoryColor(course.category.toLowerCase()),
            reviews: reviewsResult.map((review: any) => ({
                id: review.id,
                content: review.content,
                rating: Number(review.rating) || 0,
                difficulty: Number(review.difficulty) || 0,
                workload: Number(review.workload) || 0,
                createdAt: review.created_at,
                author: review.author,
                avatarUrl: review.avatar_url,
            })),
        };

        return NextResponse.json(transformedCourse);
    } catch (error) {
        console.error("Error fetching course:", error);
        return NextResponse.json(
            { error: "Failed to fetch course" },
            { status: 500 }
        );
    }
}

// Helper function to get category color
function getCategoryColor(category: string): string {
    const colors: { [key: string]: string } = {
        ceee: "bg-blue-100 text-blue-800 hover:bg-blue-100 dark:bg-blue-800/20 dark:text-blue-400",
        cs: "bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-800/20 dark:text-red-400",
        ece: "bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-800/20 dark:text-green-400",
        hadm: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100 dark:bg-yellow-800/20 dark:text-yellow-400",
        info: "bg-purple-100 text-purple-800 hover:bg-purple-100 dark:bg-purple-800/20 dark:text-purple-400",
        law: "bg-indigo-100 text-indigo-800 hover:bg-indigo-100 dark:bg-indigo-800/20 dark:text-indigo-400",
        orie: "bg-pink-100 text-pink-800 hover:bg-pink-100 dark:bg-pink-800/20 dark:text-pink-400",
        tech: "bg-orange-100 text-orange-800 hover:bg-orange-100 dark:bg-orange-800/20 dark:text-orange-400",
        techie: "bg-teal-100 text-teal-800 hover:bg-teal-100 dark:bg-teal-800/20 dark:text-teal-400",
    };
    return (
        colors[category] ||
        "bg-gray-100 text-gray-800 hover:bg-gray-100 dark:bg-gray-800/20 dark:text-gray-400"
    );
}
