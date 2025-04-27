import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

// Initialize the Neon client
const sql = neon(process.env.DATABASE_URL || "");

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get("search") || "";

        let courses;
        if (search) {
            courses = await sql`
                SELECT 
                    c.id,
                    c.code,
                    c.name as title,
                    c.department as category,
                    c.professor_id as professor,
                    COUNT(cr.id) as review_count,
                    ROUND(AVG(cr.overall_rating)::numeric, 1) as rating,
                    ROUND(AVG(cr.difficulty)::numeric, 1) as difficulty,
                    ROUND(AVG(cr.workload)::numeric, 1) as workload,
                    ROUND(AVG(cr.rating)::numeric, 1) as value,
                    (
                        SELECT content 
                        FROM course_reviews 
                        WHERE course_id = c.id 
                        ORDER BY created_at DESC 
                        LIMIT 1
                    ) as latest_review
                FROM courses c
                LEFT JOIN course_reviews cr ON c.id = cr.course_id
                WHERE c.name ILIKE ${"%" + search + "%"}
                   OR c.professor_id ILIKE ${"%" + search + "%"}
                   OR c.code ILIKE ${"%" + search + "%"}
                   OR c.department ILIKE ${"%" + search + "%"}
                GROUP BY c.id, c.code, c.name, c.department, c.professor_id
                HAVING COUNT(cr.id) > 0
                ORDER BY rating DESC NULLS LAST
            `;
        } else {
            courses = await sql`
                SELECT 
                    c.id,
                    c.code,
                    c.name as title,
                    c.department as category,
                    c.professor_id as professor,
                    COUNT(cr.id) as review_count,
                    ROUND(AVG(cr.overall_rating)::numeric, 1) as rating,
                    ROUND(AVG(cr.difficulty)::numeric, 1) as difficulty,
                    ROUND(AVG(cr.workload)::numeric, 1) as workload,
                    ROUND(AVG(cr.rating)::numeric, 1) as value,
                    (
                        SELECT content 
                        FROM course_reviews 
                        WHERE course_id = c.id 
                        ORDER BY created_at DESC 
                        LIMIT 1
                    ) as latest_review
                FROM courses c
                LEFT JOIN course_reviews cr ON c.id = cr.course_id
                GROUP BY c.id, c.code, c.name, c.department, c.professor_id
                HAVING COUNT(cr.id) > 0
                ORDER BY rating DESC NULLS LAST
            `;
        }

        // Transform the data to match the frontend interface
        const transformedCourses = courses.map((course) => ({
            id: course.code,
            title: course.title,
            professor: course.professor || "Unknown Professor",
            category: course.category.toLowerCase(),
            rating: Number(course.rating) || 0,
            reviewCount: Number(course.review_count) || 0,
            difficulty: Number(course.difficulty) || 0,
            workload: Number(course.workload) || 0,
            value: Number(course.value) || 0,
            review: course.latest_review || "No reviews yet",
            categoryColor: getCategoryColor(course.category.toLowerCase()),
        }));

        return NextResponse.json(transformedCourses);
    } catch (error) {
        console.error("Error fetching courses:", error);
        return NextResponse.json(
            { error: "Failed to fetch courses" },
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
