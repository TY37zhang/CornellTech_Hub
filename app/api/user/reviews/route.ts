import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        // Fetch user's reviews with detailed course information
        const reviews = await prisma.course_reviews.findMany({
            where: { author_id: session.user.id },
            include: {
                courses: {
                    select: {
                        name: true,
                        code: true,
                        department: true,
                        professor_id: true,
                        semester: true,
                        year: true,
                        credits: true,
                    },
                },
            },
            orderBy: { created_at: "desc" },
        });

        // Transform the data to match the frontend interface
        const transformedReviews = reviews.map((review) => ({
            id: review.id,
            courseId: review.course_id,
            courseName: review.courses.name,
            courseCode: review.courses.code,
            category: review.courses.department,
            content: review.content,
            createdAt: review.created_at,
            updatedAt: review.updated_at,
            rating: Number(review.overall_rating) || 0,
            value: Number(review.rating) || 0,
            difficulty: Number(review.difficulty) || 0,
            workload: Number(review.workload) || 0,
            grade: review.grade || undefined,
            professor: review.courses.professor_id || "Unknown Professor",
            semester: review.courses.semester,
            year: review.courses.year,
            credits: review.courses.credits,
            crossListed: null, // Cross-listed info not available in Prisma query
        }));

        return NextResponse.json(transformedReviews);
    } catch (error) {
        console.error("Error fetching user reviews:", error);
        return NextResponse.json(
            { error: "Failed to fetch user reviews" },
            { status: 500 }
        );
    }
}
