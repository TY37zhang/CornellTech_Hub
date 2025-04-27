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
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        // Fetch user's posts from the database
        const posts = await prisma.post.findMany({
            where: {
                authorEmail: userEmail,
            },
            orderBy: {
                createdAt: "desc",
            },
            select: {
                id: true,
                title: true,
                content: true,
                createdAt: true,
                category: true,
                slug: true,
            },
        });

        if (!posts || posts.length === 0) {
            return NextResponse.json(
                { posts: [] },
                { status: 200, headers: { "Content-Type": "application/json" } }
            );
        }

        return NextResponse.json(posts);
    } catch (error) {
        console.error("Error fetching user posts:", error);
        // Return a more specific error message
        const message =
            error instanceof Error
                ? error.message
                : "Failed to fetch user posts";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
