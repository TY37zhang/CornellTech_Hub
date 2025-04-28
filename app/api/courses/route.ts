import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

// Initialize the Neon client
const sql = neon(process.env.DATABASE_URL || "");

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get("search") || "";
        const category = searchParams.get("category") || "";
        const limit = parseInt(searchParams.get("limit") || "5", 10);
        const offset = parseInt(searchParams.get("offset") || "0", 10);

        let courses;
        let totalCount;

        // Build the WHERE clause based on search and category filters
        let whereClause = "";
        let params = [];

        if (search) {
            whereClause = `
                WHERE c.name ILIKE $1
                   OR c.professor_id ILIKE $1
                   OR c.code ILIKE $1
                   OR c.department ILIKE $1
            `;
            params.push(`%${search}%`);
        }

        if (category) {
            if (whereClause) {
                whereClause += ` AND c.department ILIKE $${params.length + 1}`;
            } else {
                whereClause = `WHERE c.department ILIKE $1`;
            }
            params.push(category);
        }

        // Get total count for pagination - count unique course name + professor combinations
        const countQuery = `
            SELECT COUNT(*) as count
            FROM (
                SELECT DISTINCT c.name, c.professor_id
                FROM courses c
                ${whereClause}
            ) as unique_courses
        `;

        const countResult = await sql(countQuery, params);
        totalCount = countResult[0].count;

        // Get courses with filters - group by name and professor
        const coursesQuery = `
            WITH course_data AS (
                SELECT 
                    c.name,
                    c.professor_id,
                    STRING_AGG(c.code, ', ') as codes,
                    STRING_AGG(c.department, ', ') as departments,
                    COUNT(DISTINCT cr.id) as review_count,
                    ROUND(AVG(cr.overall_rating)::numeric, 1) as rating,
                    ROUND(AVG(cr.difficulty)::numeric, 1) as difficulty,
                    ROUND(AVG(cr.workload)::numeric, 1) as workload,
                    ROUND(AVG(cr.rating)::numeric, 1) as value,
                    (
                        SELECT content 
                        FROM course_reviews 
                        WHERE course_id IN (
                            SELECT id FROM courses 
                            WHERE name = c.name AND professor_id = c.professor_id
                        )
                        ORDER BY created_at DESC 
                        LIMIT 1
                    ) as latest_review
                FROM courses c
                LEFT JOIN course_reviews cr ON c.id = cr.course_id
                ${whereClause}
                GROUP BY c.name, c.professor_id
            )
            SELECT 
                codes as code,
                name as title,
                professor_id as professor,
                departments as category,
                review_count,
                rating,
                difficulty,
                workload,
                value,
                latest_review
            FROM course_data
            ORDER BY rating DESC NULLS LAST
            LIMIT $${params.length + 1} OFFSET $${params.length + 2}
        `;

        courses = await sql(coursesQuery, [...params, limit, offset]);

        // Transform the data to match the frontend interface
        const transformedCourses = courses.map((course) => {
            // For category color, use the first department in the list
            const primaryCategory = course.category
                .split(",")[0]
                .trim()
                .toLowerCase();

            return {
                id: course.code.split(",")[0].trim(), // Use the first code as the primary ID
                title: course.title,
                professor: course.professor || "Unknown Professor",
                category: primaryCategory,
                rating: Number(course.rating) || 0,
                reviewCount: Number(course.review_count) || 0,
                difficulty: Number(course.difficulty) || 0,
                workload: Number(course.workload) || 0,
                value: Number(course.value) || 0,
                review: course.latest_review || "No reviews yet",
                categoryColor: getCategoryColor(primaryCategory),
                // Add additional fields for cross-listed information
                crossListed: course.code.includes(",")
                    ? {
                          codes: course.code
                              .split(",")
                              .map((code) => code.trim()),
                          departments: course.category
                              .split(",")
                              .map((dept) => dept.trim()),
                      }
                    : null,
            };
        });

        return NextResponse.json({
            courses: transformedCourses,
            total: totalCount,
        });
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
