import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { neon } from "@neondatabase/serverless";
import { validationMiddleware } from "@/middleware/validation";
import { schemas } from "@/lib/validations/schemas";

// Initialize the Neon client
const sql = neon(process.env.DATABASE_URL || "");

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
        const courseResult = await sql`
            INSERT INTO courses (
                code,
                name,
                professor_id,
                department,
                semester,
                year,
                credits
            ) VALUES (
                ${validatedData.courseId.substring(0, 20)},
                ${validatedData.title},
                ${validatedData.professor},
                ${validatedData.category},
                'Spring',
                2024,
                3
            )
            ON CONFLICT (code, semester, year) DO UPDATE
            SET name = EXCLUDED.name,
                professor_id = EXCLUDED.professor_id,
                department = EXCLUDED.department
            RETURNING id
        `;

        const courseId = courseResult[0].id;

        // Then create the review
        const reviewResult = await sql`
            INSERT INTO course_reviews (
                course_id,
                author_id,
                difficulty,
                workload,
                rating,
                overall_rating,
                content
            )
            VALUES (
                ${courseId},
                (SELECT id FROM users WHERE email = ${session.user.email}),
                ${validatedData.difficulty},
                ${validatedData.workload},
                ${validatedData.value},
                ${validatedData.overall_rating},
                ${validatedData.review}
            )
            RETURNING *
        `;

        return NextResponse.json(reviewResult[0]);
    } catch (error) {
        console.error("Error creating course review:", error);
        return NextResponse.json(
            { error: "Failed to create course review" },
            { status: 500 }
        );
    }
}
