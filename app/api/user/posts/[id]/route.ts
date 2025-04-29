import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL || "");

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
            FROM posts p
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

        if (!session?.user?.id) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        // Delete the post from the database
        const result = await sql`
            DELETE FROM posts
            WHERE id = ${params.id} AND author_id = ${session.user.id}
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
