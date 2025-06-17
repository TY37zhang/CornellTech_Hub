import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";

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

        const review = await prisma.course_reviews.findUnique({
            where: { id: reviewId, author_id: session.user.id },
        });

        if (!review) {
            return NextResponse.json(
                { error: "Review not found or unauthorized" },
                { status: 404 }
            );
        }

        await prisma.course_reviews.delete({
            where: { id: reviewId },
        });

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

        const review = await prisma.course_reviews.findUnique({
            where: { id: reviewId, author_id: session.user.id },
        });

        if (!review) {
            return NextResponse.json(
                { error: "Review not found or unauthorized" },
                { status: 404 }
            );
        }

        const updatedReview = await prisma.course_reviews.update({
            where: { id: reviewId },
            data: {
                difficulty: validatedData.difficulty,
                workload: validatedData.workload,
                rating: validatedData.value,
                overall_rating: validatedData.overall_rating,
                content: validatedData.content,
                grade: validatedData.grade,
                updated_at: new Date(),
            },
        });

        return NextResponse.json(updatedReview);
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

        const review = await prisma.course_reviews.findUnique({
            where: { id: reviewId, author_id: session.user.id },
            include: {
                courses: {
                    select: {
                        name: true,
                        code: true,
                    },
                },
            },
        });

        if (!review) {
            return NextResponse.json(
                { error: "Review not found or unauthorized" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            id: review.id,
            content: review.content,
            overall_rating: Number(review.overall_rating),
            difficulty: Number(review.difficulty),
            workload: Number(review.workload),
            value: Number(review.rating),
            courseName: review.courses.name,
            courseCode: review.courses.code,
        });
    } catch (error) {
        console.error("Error fetching review:", error);
        return NextResponse.json(
            { error: "Failed to fetch review" },
            { status: 500 }
        );
    }
}
