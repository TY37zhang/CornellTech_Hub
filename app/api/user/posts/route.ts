import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";

export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        // Fetch user's posts from the database
        const posts = await prisma.forum_posts.findMany({
            where: { author_id: session.user.id },
            include: {
                forum_categories: { select: { name: true } },
            },
            orderBy: { created_at: "desc" },
        });

        const slugify = (title: string, id: string) =>
            `${title
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/^-|-$/g, "")}-${id}`;

        const transformedPosts = posts.map((post) => ({
            id: post.id,
            title: post.title,
            content: post.content,
            authorId: post.author_id,
            category: post.forum_categories?.name ?? null,
            status: post.status,
            createdAt: post.created_at,
            updatedAt: post.updated_at,
            notifyOnReply: post.notify_on_reply,
            slug: slugify(post.title, post.id),
        }));

        return NextResponse.json(transformedPosts);
    } catch (error) {
        console.error("Error fetching user posts:", error);
        return NextResponse.json(
            { error: "Failed to fetch user posts" },
            { status: 500 }
        );
    }
}
