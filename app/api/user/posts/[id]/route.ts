import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";

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
        const post = await prisma.forum_posts.findFirst({
            where: { id: params.id, author_id: session.user.id },
            include: { forum_categories: { select: { name: true } } },
        });

        if (!post) {
            return new NextResponse("Post not found", { status: 404 });
        }

        return NextResponse.json({
            id: post.id,
            title: post.title,
            content: post.content,
            created_at: post.created_at,
            updated_at: post.updated_at,
            category: post.forum_categories?.name ?? null,
            author_id: post.author_id,
        });
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

        // Perform cascading deletes manually in a transaction
        const deleteResult = await prisma.$transaction(async (tx) => {
            await tx.forum_notification_preferences.deleteMany({
                where: { post_id: postId },
            });

            await tx.forum_saved.deleteMany({ where: { post_id: postId } });

            await tx.forum_post_tags.deleteMany({ where: { post_id: postId } });

            await tx.forum_likes.deleteMany({ where: { post_id: postId } });

            await tx.forum_comments.deleteMany({ where: { post_id: postId } });

            const res = await tx.forum_posts.deleteMany({
                where: { id: postId, author_id: session.user.id },
            });
            return res.count;
        });

        if (deleteResult === 0) {
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
