import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const query = searchParams.get("q");

        if (!query) {
            return NextResponse.json([]);
        }

        const searchPattern = `%${query}%`;
        const { rows } = await sql`
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
                WHERE 
                    credits IS NOT NULL AND
                    (
                        LOWER(code) LIKE LOWER(${searchPattern}) OR 
                        LOWER(name) LIKE LOWER(${searchPattern})
                    )
                ORDER BY name, professor_id, code
                LIMIT 10
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
