import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

// Initialize the Neon client
const sql = neon(process.env.DATABASE_URL || "");

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const resolvedParams = await Promise.resolve(params);
        const courseId = resolvedParams.id;

        // Fetch the course's name and professor by code
        const baseResult = await sql`
            SELECT name, professor_id FROM courses WHERE code = ${courseId} LIMIT 1
        `;
        if (baseResult.length === 0) {
            return NextResponse.json(
                { error: "Course not found" },
                { status: 404 }
            );
        }
        const { name, professor_id } = baseResult[0];

        // Fetch all cross-listed courses (same name and professor)
        const crossListResult = await sql`
            SELECT 
                c.id,
                c.code,
                c.name as title,
                c.department as category,
                c.professor_id as professor,
                c.semester,
                c.year,
                c.credits,
                COUNT(cr.id) as review_count,
                ROUND(AVG(cr.overall_rating)::numeric, 1) as rating,
                ROUND(AVG(cr.difficulty)::numeric, 1) as difficulty,
                ROUND(AVG(cr.workload)::numeric, 1) as workload,
                ROUND(AVG(cr.rating)::numeric, 1) as value
            FROM courses c
            LEFT JOIN course_reviews cr ON c.id = cr.course_id
            WHERE c.name = ${name} AND c.professor_id = ${professor_id}
            GROUP BY c.id, c.code, c.name, c.department, c.professor_id, c.semester, c.year, c.credits
        `;

        // Aggregate codes and departments
        const codes = crossListResult.map((c: any) => c.code);
        const departments = [
            ...new Set(crossListResult.map((c: any) => c.category)),
        ];
        // Use the first course as the primary
        const course = crossListResult[0];

        // Fetch reviews for all cross-listed courses
        const courseIds = crossListResult.map((c: any) => c.id);
        const reviewsResult = await sql`
            SELECT 
                cr.id,
                cr.content,
                cr.overall_rating as rating,
                cr.difficulty,
                cr.workload,
                cr.rating as value,
                cr.created_at,
                u.name as author,
                u.avatar_url
            FROM course_reviews cr
            JOIN users u ON cr.author_id = u.id
            WHERE cr.course_id = ANY(${courseIds})
            ORDER BY cr.created_at DESC
        `;

        // Transform the data
        const transformedCourse = {
            id: codes[0],
            title: course.title.split(", ")[0],
            professor: course.professor || "Unknown Professor",
            departments: [
                ...new Set(crossListResult.map((c: any) => c.category)),
            ],
            semester: course.semester,
            year: course.year,
            credits: course.credits,
            rating: Number(course.rating) || 0,
            reviewCount: Number(course.review_count) || 0,
            difficulty: Number(course.difficulty) || 0,
            workload: Number(course.workload) || 0,
            value: Number(course.value) || 0,
            categoryColor: getCategoryColor(departments[0]?.toLowerCase()),
            reviews: reviewsResult.map((review: any) => ({
                id: review.id,
                content: review.content,
                rating: Number(review.rating) || 0,
                difficulty: Number(review.difficulty) || 0,
                workload: Number(review.workload) || 0,
                value: Number(review.value) || 0,
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
        arch: "bg-cyan-100 text-cyan-800 hover:bg-cyan-100 dark:bg-cyan-800/20 dark:text-cyan-400",
        cee: "bg-lime-100 text-lime-800 hover:bg-lime-100 dark:bg-lime-800/20 dark:text-lime-400",
        cmbp: "bg-emerald-100 text-emerald-800 hover:bg-emerald-100 dark:bg-emerald-800/20 dark:text-emerald-400",
        cmpb: "bg-amber-100 text-amber-800 hover:bg-amber-100 dark:bg-amber-800/20 dark:text-amber-400",
        ctiv: "bg-rose-100 text-rose-800 hover:bg-rose-100 dark:bg-rose-800/20 dark:text-rose-400",
        design: "bg-violet-100 text-violet-800 hover:bg-violet-100 dark:bg-violet-800/20 dark:text-violet-400",
        hbds: "bg-fuchsia-100 text-fuchsia-800 hover:bg-fuchsia-100 dark:bg-fuchsia-800/20 dark:text-fuchsia-400",
        hinf: "bg-sky-100 text-sky-800 hover:bg-sky-100 dark:bg-sky-800/20 dark:text-sky-400",
        hpec: "bg-amber-100 text-amber-800 hover:bg-amber-100 dark:bg-amber-800/20 dark:text-amber-400",
        iamp: "bg-rose-100 text-rose-800 hover:bg-rose-100 dark:bg-rose-800/20 dark:text-rose-400",
        nba: "bg-indigo-100 text-indigo-800 hover:bg-indigo-100 dark:bg-indigo-800/20 dark:text-indigo-400",
        nbay: "bg-blue-100 text-blue-800 hover:bg-blue-100 dark:bg-blue-800/20 dark:text-blue-400",
        pbsb: "bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-800/20 dark:text-green-400",
        phar: "bg-purple-100 text-purple-800 hover:bg-purple-100 dark:bg-purple-800/20 dark:text-purple-400",
        tpcm: "bg-orange-100 text-orange-800 hover:bg-orange-100 dark:bg-orange-800/20 dark:text-orange-400",
    };
    return (
        colors[category] ||
        "bg-gray-100 text-gray-800 hover:bg-gray-100 dark:bg-gray-800/20 dark:text-gray-400"
    );
}
