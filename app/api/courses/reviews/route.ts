import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { validationMiddleware } from "@/middleware/validation";
import { schemas } from "@/lib/validations/schemas";
import { prisma } from "@/lib/db/prisma";

export async function POST(request: Request) {
    try {
        const session = await getServerSession();

        if (!session?.user?.email) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        // Apply validation middleware
        const validatedRequest = await validationMiddleware(
            "course",
            "review"
        )(request);
        if (validatedRequest instanceof Response) {
            return validatedRequest;
        }

        const validatedData = (validatedRequest as any).validatedData;

        // Create or update the course with all departments
        const course = await prisma.courses.upsert({
            where: {
                code_semester_year: {
                    code: validatedData.courseId.substring(0, 20),
                    semester: "Spring",
                    year: 2024,
                },
            },
            update: {
                name: validatedData.title,
                professor_id: validatedData.professor || "Unknown Professor",
                department: validatedData.category,
            },
            create: {
                code: validatedData.courseId.substring(0, 20),
                name: validatedData.title,
                professor_id: validatedData.professor || "Unknown Professor",
                department: validatedData.category,
                semester: "Spring",
                year: 2024,
                credits: 3,
            },
        });

        const courseId = course.id;

        // Then create the review
        const user = await prisma.users.findUnique({
            where: { email: session.user.email },
        });

        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        const review = await prisma.course_reviews.create({
            data: {
                course_id: courseId,
                author_id: user.id,
                difficulty: validatedData.difficulty,
                workload: validatedData.workload,
                rating: validatedData.value,
                overall_rating: validatedData.overall_rating,
                content: validatedData.review,
                grade: validatedData.grade === "" || validatedData.grade === "none" ? null : validatedData.grade,
            },
        });

        return NextResponse.json(review);
    } catch (error) {
        console.error("Error creating course review:", error);
        return NextResponse.json(
            { error: "Failed to create course review" },
            { status: 500 }
        );
    }
}
