import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sql } from "@/lib/db";

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        // Fetch the specific post from the database
        const post = await sql`
            SELECT 
                p.id,
                p.title,
                p.content,
                p.created_at,
                p.updated_at,
                p.category,
                p.slug,
                p.author_id
            FROM forum_posts p
            WHERE p.id = ${params.id} AND p.author_id = ${session.user.id}
        `;

        if (!post || post.length === 0) {
            return new NextResponse("Post not found", { status: 404 });
        }

        return NextResponse.json(post[0]);
    } catch (error) {
        console.error("Error fetching post:", error);
        return NextResponse.json(
            { error: "Failed to fetch post" },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        const { id: postId } = await Promise.resolve(params);

        if (!session?.user?.id) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        // First delete all notification preferences
        await sql`
            DELETE FROM forum_notification_preferences
            WHERE post_id = ${postId}
        `;

        // Then delete all saved posts
        await sql`
            DELETE FROM forum_saved
            WHERE post_id = ${postId}
        `;

        // Then delete all post tags
        await sql`
            DELETE FROM forum_post_tags
            WHERE post_id = ${postId}
        `;

        // Then delete all likes associated with the post
        await sql`
            DELETE FROM forum_likes
            WHERE post_id = ${postId}
        `;

        // Then delete all comments associated with the post
        await sql`
            DELETE FROM forum_comments
            WHERE post_id = ${postId}
        `;

        // Finally delete the post
        const result = await sql`
            DELETE FROM forum_posts
            WHERE id = ${postId} AND author_id = ${session.user.id}
            RETURNING id
        `;

        if (!result || result.length === 0) {
            return new NextResponse("Post not found", { status: 404 });
        }

        return new NextResponse(null, { status: 204 });
    } catch (error) {
        console.error("Error deleting post:", error);
        return NextResponse.json(
            { error: "Failed to delete post" },
            { status: 500 }
        );
    }
}
