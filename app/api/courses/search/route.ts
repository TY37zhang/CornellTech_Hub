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
            SELECT id, code, name, credits, description, department, semester, year 
            FROM courses 
            WHERE 
                credits IS NOT NULL AND
                (
                    LOWER(code) LIKE LOWER(${searchPattern}) OR 
                    LOWER(name) LIKE LOWER(${searchPattern})
                )
            ORDER BY code ASC
            LIMIT 10
        `;

        return NextResponse.json(rows);
    } catch (error) {
        console.error("Error searching courses:", error);
        return NextResponse.json(
            { error: "Failed to search courses" },
            { status: 500 }
        );
    }
}
