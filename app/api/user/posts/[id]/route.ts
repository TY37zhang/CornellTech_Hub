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

        const { id } = await params;

        // Fetch the specific post from the database
        const post = await prisma.forum_posts.findFirst({
            where: { id, author_id: session.user.id },
            include: { 
                forum_categories: { select: { name: true } },
                forum_post_tags: { select: { tag: true } },
            },
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
            tags: post.forum_post_tags.map((t) => t.tag),
        });
    } catch (error) {
        console.error("Error fetching post:", error);
        return NextResponse.json(
            { error: "Failed to fetch post" },
            { status: 500 }
        );
    }
}

export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { id } = await params;
        const { title, content, category, tags } = await request.json();

        // Validate required fields
        if (!title || !content || !category) {
            return NextResponse.json(
                { error: "Title, content, and category are required" },
                { status: 400 }
            );
        }

        // Validate title and content length
        if (title.trim().length < 4) {
            return NextResponse.json(
                { error: "Title must be at least 4 characters long" },
                { status: 400 }
            );
        }

        if (content.trim().length < 20) {
            return NextResponse.json(
                { error: "Content must be at least 20 characters long" },
                { status: 400 }
            );
        }

        // Validate tags
        if (tags && Array.isArray(tags) && tags.length > 5) {
            return NextResponse.json(
                { error: "Maximum 5 tags allowed" },
                { status: 400 }
            );
        }

        // Update post in a transaction
        const updatedPost = await prisma.$transaction(async (tx) => {
            // Check if the post exists and belongs to the user
            const existingPost = await tx.forum_posts.findFirst({
                where: { id, author_id: session.user.id },
            });

            if (!existingPost) {
                throw new Error("Post not found or access denied");
            }

            // Get or create category
            const categoryName = category.charAt(0).toUpperCase() + category.slice(1);
            const categorySlug = category.toLowerCase().replace(/[^a-z0-9]/g, '-');
            
            const categoryRecord = await tx.forum_categories.upsert({
                where: { slug: categorySlug },
                update: {},
                create: {
                    name: categoryName,
                    slug: categorySlug,
                    description: `Discussions about ${category}`,
                },
            });

            // Update the post
            const post = await tx.forum_posts.update({
                where: { id },
                data: {
                    title: title.trim(),
                    content: content.trim(),
                    category_id: categoryRecord.id,
                    updated_at: new Date(),
                },
            });

            // Update tags
            if (tags && Array.isArray(tags)) {
                // Remove existing tags
                await tx.forum_post_tags.deleteMany({
                    where: { post_id: id },
                });

                // Add new tags
                if (tags.length > 0) {
                    await tx.forum_post_tags.createMany({
                        data: tags.map((tag: string) => ({
                            post_id: id,
                            tag: tag.trim(),
                            created_at: new Date(),
                        })),
                        skipDuplicates: true,
                    });
                }
            }

            return post;
        });

        return NextResponse.json({
            id: updatedPost.id,
            title: updatedPost.title,
            content: updatedPost.content,
            updated_at: updatedPost.updated_at,
        });
    } catch (error) {
        console.error("Error updating post:", error);
        const message = error instanceof Error ? error.message : "Failed to update post";
        return NextResponse.json(
            { error: message },
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
