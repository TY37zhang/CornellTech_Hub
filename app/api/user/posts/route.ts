import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        console.log("Session data:", session);

        if (!session || !session.user) {
            console.log("No session or user found");
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const userEmail = session.user.email;
        console.log("User email:", userEmail);

        if (!userEmail) {
            console.log("No email found in session");
            return NextResponse.json(
                { error: "User email not found" },
                { status: 400 }
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

        console.log("Found posts:", posts);

        // Return empty array if no posts found
        if (!posts || posts.length === 0) {
            console.log("No posts found for user");
            return NextResponse.json([]);
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
