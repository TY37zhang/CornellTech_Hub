import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { neon } from "@neondatabase/serverless";
import { z } from "zod";

const sql = neon(process.env.DATABASE_URL || "");

export async function DELETE(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const { id: reviewId } = await params;

        // First verify the review belongs to the user
        const review = await sql`
            SELECT id 
            FROM course_reviews 
            WHERE id = ${reviewId} 
            AND author_id = ${session.user.id}
        `;

        if (!review || review.length === 0) {
            return NextResponse.json(
                { error: "Review not found or unauthorized" },
                { status: 404 }
            );
        }

        // Delete the review
        await sql`
            DELETE FROM course_reviews 
            WHERE id = ${reviewId}
        `;

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting review:", error);
        return NextResponse.json(
            { error: "Failed to delete review" },
            { status: 500 }
        );
    }
}

export async function PUT(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const { id: reviewId } = params;
        const body = await req.json();

        // Validate the request body
        const requestSchema = z.object({
            difficulty: z.number().min(1).max(5),
            workload: z.number().min(1).max(5),
            value: z.number().min(1).max(5),
            overall_rating: z.number().min(1).max(5),
            content: z
                .string()
                .min(10, "Review must be at least 10 characters"),
            grade: z.string().nullable().optional(),
        });

        const validatedData = requestSchema.parse(body);

        // First verify the review belongs to the user
        const review = await sql`
            SELECT id 
            FROM course_reviews 
            WHERE id = ${reviewId} 
            AND author_id = ${session.user.id}
        `;

        if (!review || review.length === 0) {
            return NextResponse.json(
                { error: "Review not found or unauthorized" },
                { status: 404 }
            );
        }

        // Update the review
        const updatedReview = await sql`
            UPDATE course_reviews 
            SET 
                difficulty = ${validatedData.difficulty},
                workload = ${validatedData.workload},
                rating = ${validatedData.value},
                overall_rating = ${validatedData.overall_rating},
                content = ${validatedData.content},
                grade = ${validatedData.grade},
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ${reviewId}
            RETURNING *
        `;

        return NextResponse.json(updatedReview[0]);
    } catch (error) {
        console.error("Error updating review:", error);
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: "Validation error", details: error.errors },
                { status: 400 }
            );
        }
        return NextResponse.json(
            { error: "Failed to update review" },
            { status: 500 }
        );
    }
}

export async function GET(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const { id: reviewId } = params;

        // Fetch the review with course details
        const reviewResult = await sql`
            SELECT 
                cr.id,
                cr.content,
                cr.overall_rating,
                cr.difficulty,
                cr.workload,
                cr.rating as value,
                c.name as course_name,
                c.code as course_code
            FROM course_reviews cr
            JOIN courses c ON cr.course_id = c.id
            WHERE cr.id = ${reviewId} 
            AND cr.author_id = ${session.user.id}
        `;

        if (!reviewResult || reviewResult.length === 0) {
            return NextResponse.json(
                { error: "Review not found or unauthorized" },
                { status: 404 }
            );
        }

        const review = reviewResult[0];

        return NextResponse.json({
            id: review.id,
            content: review.content,
            overall_rating: Number(review.overall_rating),
            difficulty: Number(review.difficulty),
            workload: Number(review.workload),
            value: Number(review.value),
            courseName: review.course_name,
            courseCode: review.course_code,
        });
    } catch (error) {
        console.error("Error fetching review:", error);
        return NextResponse.json(
            { error: "Failed to fetch review" },
            { status: 500 }
        );
    }
}
