import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { neon } from "@neondatabase/serverless";
import { z } from "zod";

// Initialize the Neon client
const sql = neon(process.env.DATABASE_URL || "");

// Define the request schema
const requestSchema = z.object({
    title: z.string().min(1, "Title is required"),
    professor: z.string().min(1, "Professor is required"),
    category: z.string().optional(),
    difficulty: z.number().min(1).max(5),
    workload: z.number().min(1).max(5),
    value: z.number().min(1).max(5),
    overall_rating: z.number().min(1).max(5),
    review: z.string().min(1, "Review is required"),
    courseId: z.string().min(1, "Course ID is required"),
});

export async function POST(request: Request) {
    try {
        const session = await getServerSession();

        if (!session?.user?.email) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const body = await request.json();
        const validatedData = requestSchema.parse(body);

        // Create or update the course
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
                ${validatedData.title.toLowerCase().replace(/\s+/g, "-")},
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
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: "Validation error", details: error.errors },
                { status: 400 }
            );
        }
        return NextResponse.json(
            { error: "Failed to create course review" },
            { status: 500 }
        );
    }
}
