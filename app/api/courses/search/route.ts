import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const query = searchParams.get("q");

        if (!query) {
            return NextResponse.json([]);
        }

        const rowsRaw = await prisma.courses.findMany({
            where: {
                OR: [
                    { code: { contains: query, mode: "insensitive" } },
                    { name: { contains: query, mode: "insensitive" } },
                ],
            },
            orderBy: [
                { name: "asc" },
                { professor_id: "asc" },
                { code: "asc" },
            ],
            take: 100, // fetch extra for grouping, will slice later
        });

        // Group by name+professor to mimic DISTINCT ON behavior
        const groupMap = new Map<string, Array<(typeof rowsRaw)[number]>>();
        for (const course of rowsRaw) {
            const key = `${course.name}|${course.professor_id}`;
            if (!groupMap.has(key)) {
                groupMap.set(key, [] as any);
            }
            (groupMap.get(key) as any[]).push(course);
        }

        const groups = Array.from(groupMap.values())
            .slice(0, 10) // limit 10 groups
            .map((group) => {
                const first = group[0];
                return {
                    id: first.id,
                    code: group
                        .map((c) => c.code)
                        .sort()
                        .join(", "),
                    name: first.name,
                    credits: first.credits,
                    description: first.description,
                    department: Array.from(
                        new Set(group.map((c) => c.department))
                    )
                        .sort()
                        .join(", "),
                    semester: first.semester,
                    year: first.year,
                    professor_id: first.professor_id,
                };
            });

        const transformedRows = groups.map((row) => ({
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
