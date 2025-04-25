import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const userEmail = session.user.email;

        if (!userEmail) {
            return NextResponse.json(
                { error: "User email not found" },
                { status: 400 }
            );
        }

        // Fetch user's reviews from the database
        const reviews = await prisma.review.findMany({
            where: {
                author_id: session.user.id,
            },
            orderBy: {
                createdAt: "desc",
            },
            select: {
                id: true,
                content: true,
                rating: true,
                createdAt: true,
                courseId: true,
                courseName: true,
                courseCode: true,
            },
        });

        return NextResponse.json(reviews);
    } catch (error) {
        console.error("Error fetching user reviews:", error);
        return NextResponse.json(
            { error: "Failed to fetch user reviews" },
            { status: 500 }
        );
    }
}
