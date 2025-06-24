import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: courseId } = await params;

        // First try to find by exact UUID (if courseId is a valid UUID)
        let courseInstances = [];

        // Check if courseId looks like a UUID
        const uuidRegex =
            /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

        if (uuidRegex.test(courseId)) {
            // If it's a UUID, search by ID
            courseInstances = await prisma.courses.findMany({
                where: { id: courseId },
                select: {
                    professor_id: true,
                    semester: true,
                    year: true,
                    name: true,
                },
            });
        }

        // If no results or courseId is not a UUID, search by code and name
        if (courseInstances.length === 0) {
            courseInstances = await prisma.courses.findMany({
                where: {
                    OR: [
                        { code: { contains: courseId, mode: "insensitive" } },
                        { name: { contains: courseId, mode: "insensitive" } },
                    ],
                },
                select: {
                    professor_id: true,
                    semester: true,
                    year: true,
                    name: true,
                },
            });
        }

        // Extract unique professors, excluding "Unknown Professor"
        const professors = courseInstances
            .map((course) => course.professor_id)
            .filter(Boolean)
            .filter((prof) => prof !== "Unknown Professor") // Filter out "Unknown Professor"
            .filter((prof, index, arr) => arr.indexOf(prof) === index)
            .map((prof) => ({
                id: prof,
                name: prof || "Unknown Professor",
            }));

        return NextResponse.json(professors);
    } catch (error) {
        console.error("Error fetching professors:", error);
        return NextResponse.json(
            { error: "Failed to fetch professors" },
            { status: 500 }
        );
    }
}
