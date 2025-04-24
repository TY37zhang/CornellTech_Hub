import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { neon } from "@neondatabase/serverless";
import { z } from "zod";

// Initialize the Neon client
const sql = neon(process.env.DATABASE_URL || "");

// Define the request schema
const reviewSchema = z.object({
    title: z
        .string()
        .min(2, { message: "Title must be at least 2 characters." }),
    professor: z
        .string()
        .min(2, { message: "Professor name must be at least 2 characters." }),
    category: z.string(),
    credits: z.number().min(1).max(6),
    difficulty: z.number().min(1).max(10),
    workload: z.number().min(1).max(10),
    value: z.number().min(1).max(10),
    review: z
        .string()
        .min(10, { message: "Review must be at least 10 characters." }),
});

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession();

        if (!session?.user?.email) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const body = await request.json();
        const validatedData = reviewSchema.parse(body);

        // First, get or create the course
        const courseResult = await sql`
            INSERT INTO courses (code, name, professor_id, department, semester, year, credits)
            VALUES (
                ${validatedData.title.toLowerCase().replace(/\s+/g, "-")},
                ${validatedData.title},
                (SELECT id FROM users WHERE email = ${session.user.email}),
                ${validatedData.category},
                'Spring',
                2024,
                ${validatedData.credits}
            )
            ON CONFLICT (code, semester, year) DO UPDATE
            SET name = EXCLUDED.name,
                credits = EXCLUDED.credits
            RETURNING id
        `;

        const courseId = courseResult[0].id;

        // Then create the review
        const reviewResult = await sql`
            INSERT INTO course_reviews (
                course_id,
                author_id,
                rating,
                difficulty,
                workload,
                content
            )
            VALUES (
                ${courseId},
                (SELECT id FROM users WHERE email = ${session.user.email}),
                ${validatedData.value},
                ${validatedData.difficulty},
                ${validatedData.workload},
                ${validatedData.review}
            )
            RETURNING *
        `;

        return NextResponse.json(reviewResult[0]);
    } catch (error) {
        console.error("Error creating course review:", error);
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: "Invalid request data", details: error.errors },
                { status: 400 }
            );
        }
        return NextResponse.json(
            { error: "Failed to create course review" },
            { status: 500 }
        );
    }
}
