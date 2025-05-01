import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sql } from "@/lib/db";

export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        // Fetch user's posts from the database
        const posts = await sql`
            SELECT 
                fp.id,
                fp.title,
                fp.content,
                fp.author_id,
                fp.category_id,
                fp.status,
                fp.created_at,
                fp.updated_at,
                fp.notify_on_reply,
                fc.name as category_name,
                CONCAT(
                    LOWER(REGEXP_REPLACE(fp.title, '[^a-zA-Z0-9]+', '-', 'g')),
                    '-',
                    fp.id
                ) as slug
            FROM forum_posts fp
            LEFT JOIN forum_categories fc ON fp.category_id = fc.id
            WHERE fp.author_id = ${session.user.id}
            ORDER BY fp.created_at DESC
        `;

        // Transform the data to match the expected format
        const transformedPosts = posts.map((post) => ({
            id: post.id,
            title: post.title,
            content: post.content,
            authorId: post.author_id,
            category: post.category_name,
            status: post.status,
            createdAt: post.created_at,
            updatedAt: post.updated_at,
            notifyOnReply: post.notify_on_reply,
            slug: post.slug,
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
