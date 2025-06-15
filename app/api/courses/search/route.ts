import { sql } from "@/lib/db";
import { NextResponse } from "next/server";

// Keywords relevant to product management
const PRODUCT_MGMT_KEYWORDS = [
    "product management",
    "product manager",
    "user experience",
    "UX",
    "design",
    "entrepreneurship",
    "market",
    "strategy",
    "project management",
    "user research",
    "business",
    "innovation",
    "startup",
    "customer",
    "agile",
    "lean",
    "marketing",
    "leadership",
    "team",
    "communication",
];

// Helper to run the search
async function runSearch(patterns: string[]) {
    const whereClauses = patterns
        .map(
            (_, i) => `
            LOWER(c.name) LIKE LOWER($${i + 1})
            OR LOWER(c.code) LIKE LOWER($${i + 1})
            OR LOWER(c.description) LIKE LOWER($${i + 1})
            OR LOWER(c.department) LIKE LOWER($${i + 1})
        `
        )
        .join(" OR ");

    const sqlQuery = `
        WITH course_reviews_summary AS (
            SELECT 
                c.id,
                COUNT(cr.id) as review_count,
                ROUND(AVG(cr.overall_rating)::numeric, 1) as avg_rating,
                ROUND(AVG(cr.difficulty)::numeric, 1) as avg_difficulty,
                ROUND(AVG(cr.workload)::numeric, 1) as avg_workload,
                MAX(cr.created_at) as latest_review_date
            FROM courses c
            LEFT JOIN course_reviews cr ON c.id = cr.course_id
            GROUP BY c.id
        ),
        base_courses AS (
            SELECT DISTINCT ON (name, professor_id)
                c.id,
                c.name,
                c.professor_id,
                c.credits,
                c.semester,
                c.year,
                c.description,
                crs.review_count,
                crs.avg_rating,
                crs.avg_difficulty,
                crs.avg_workload,
                crs.latest_review_date
            FROM courses c
            LEFT JOIN course_reviews_summary crs ON c.id = crs.id
            WHERE credits IS NOT NULL AND (${whereClauses})
            ORDER BY name, professor_id, code
            LIMIT 20
        )
        SELECT 
            bc.id,
            (
                SELECT STRING_AGG(c.code, ', ' ORDER BY c.code)
                FROM courses c 
                WHERE c.name = bc.name AND c.professor_id = bc.professor_id
            ) as code,
            bc.name,
            bc.credits,
            bc.description,
            (
                SELECT STRING_AGG(DISTINCT c.department, ', ' ORDER BY c.department)
                FROM courses c 
                WHERE c.name = bc.name AND c.professor_id = bc.professor_id
            ) as department,
            bc.semester,
            bc.year,
            bc.professor_id,
            bc.review_count,
            bc.avg_rating,
            bc.avg_difficulty,
            bc.avg_workload,
            bc.latest_review_date
        FROM base_courses bc
        ORDER BY 
            CASE 
                WHEN LOWER(bc.name) = LOWER($1) THEN 1
                WHEN LOWER(bc.name) LIKE LOWER($1) || '%' THEN 2
                WHEN LOWER(bc.name) LIKE '%' || LOWER($1) || '%' THEN 3
                ELSE 4
            END,
            bc.name ASC
    `;
    const rows = await sql(sqlQuery, patterns);
    return rows;
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const query = searchParams.get("q");

        if (!query) {
            console.log("[CourseSearch] No query provided");
            return NextResponse.json([]);
        }

        // Check if query matches a course code pattern
        const codeMatch = query.match(/^[A-Z]{2,4}\s*\d{4}$/i);
        let searchPatterns: string[];

        if (codeMatch) {
            // If it's a course code, search for exact match
            searchPatterns = [codeMatch[0].replace(/\s+/g, "")];
        } else {
            // For other queries, use flexible matching
            searchPatterns = [`%${query}%`];

            // If it's a product management related query, expand search patterns
            const isProductMgmtQuery = PRODUCT_MGMT_KEYWORDS.some((kw) =>
                query.toLowerCase().includes(kw.toLowerCase())
            );
            if (isProductMgmtQuery) {
                searchPatterns = PRODUCT_MGMT_KEYWORDS.map((kw) => `%${kw}%`);
            }
        }

        // Log the incoming query and expanded patterns
        console.log("[CourseSearch] Query:", query);
        console.log("[CourseSearch] Search patterns:", searchPatterns);

        // Run the search
        let rows = await runSearch(searchPatterns);
        console.log("[CourseSearch] Raw DB response:", rows);

        // If no results and this wasn't a course code search, try a fallback with broader keywords
        if (rows.length === 0 && !codeMatch) {
            console.log(
                "[CourseSearch] No results, running fallback with product management keywords"
            );
            rows = await runSearch(
                PRODUCT_MGMT_KEYWORDS.map((kw) => `%${kw}%`)
            );
            console.log("[CourseSearch] Raw DB response (fallback):", rows);
        }

        // Transform the data to handle cross-listed information
        const transformedRows = rows.map((row) => ({
            ...row,
            codes: row.code.split(", "),
            departments: row.department.split(", "),
            isCrossListed: row.code.includes(", "),
            reviewCount: Number(row.review_count) || 0,
            rating: Number(row.avg_rating) || 0,
            difficulty: Number(row.avg_difficulty) || 0,
            workload: Number(row.avg_workload) || 0,
            latestReviewDate: row.latest_review_date,
        }));

        return NextResponse.json(transformedRows);
    } catch (error) {
        console.error("Error searching courses:", error);
        return NextResponse.json(
            { error: "Failed to search courses" },
            { status: 500 }
        );
    }
}
