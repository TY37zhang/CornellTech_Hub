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
    // Build dynamic WHERE clause for multiple patterns
    const whereClauses = patterns
        .map(
            (_, i) =>
                `(LOWER(code) LIKE LOWER($${i + 1}) OR LOWER(name) LIKE LOWER($${i + 1}) OR LOWER(description) LIKE LOWER($${i + 1}))`
        )
        .join(" OR ");
    const sqlQuery = `
        WITH base_courses AS (
            SELECT DISTINCT ON (name, professor_id)
                id,
                name,
                professor_id,
                credits,
                semester,
                year,
                description
            FROM courses
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
            bc.professor_id
        FROM base_courses bc
        ORDER BY bc.name
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

        // Determine if the query is product management related
        const isProductMgmtQuery = PRODUCT_MGMT_KEYWORDS.some((kw) =>
            query.toLowerCase().includes(kw.toLowerCase())
        );

        // Build expanded search patterns
        let searchPatterns = [`%${query}%`];
        if (isProductMgmtQuery) {
            searchPatterns = PRODUCT_MGMT_KEYWORDS.map((kw) => `%${kw}%`);
        }

        // Log the incoming query and expanded patterns
        console.log("[CourseSearch] Query:", query);
        console.log("[CourseSearch] Search patterns:", searchPatterns);

        // First, try the main/expanded search
        let rows = await runSearch(searchPatterns);
        console.log("[CourseSearch] Raw DB response (main):", rows);

        // If no results and this was a product management query, try a fallback with broader keywords
        if (rows.length === 0 && !isProductMgmtQuery) {
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
