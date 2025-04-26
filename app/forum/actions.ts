"use server";

import { sql } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { neon } from "@neondatabase/serverless";

export async function createThread({
    title,
    content,
    category,
    tags,
    authorId,
    notifyOnReply,
}: {
    title: string;
    content: string;
    category: string;
    tags: string[];
    authorId: string;
    notifyOnReply: boolean;
}) {
    try {
        console.log("Creating thread with data:", {
            title,
            content,
            category,
            tags,
            authorId,
        });

        // Check if forum_posts table exists
        console.log("Checking forum_posts table structure");
        const tableExists = await sql`
            SELECT EXISTS (
                SELECT 1 
                FROM information_schema.tables 
                WHERE table_name = 'forum_posts'
            );
        `;

        if (!tableExists[0]?.exists) {
            throw new Error("forum_posts table does not exist");
        }

        // Validate UUID format
        if (
            !authorId.match(
                /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
            )
        ) {
            throw new Error("Invalid author ID format");
        }

        // First, ensure the forum_categories table exists and has the category
        console.log("Checking if category exists:", category);
        const categoryExists = await sql`
            SELECT EXISTS (
                SELECT 1 FROM forum_categories WHERE slug = ${category}
            );
        `;

        if (!categoryExists[0]?.exists) {
            console.log("Category doesn't exist, creating it:", category);
            // Create the category if it doesn't exist
            await sql`
                INSERT INTO forum_categories (name, slug, description)
                VALUES (
                    ${category.charAt(0).toUpperCase() + category.slice(1)},
                    ${category},
                    ${`Discussions about ${category}`}
                )
                ON CONFLICT (slug) DO NOTHING;
            `;
        }

        // Get the category ID from the forum_categories table
        console.log("Fetching category ID for:", category);
        const categoryResult = await sql`
            SELECT id FROM forum_categories WHERE slug = ${category};
        `;
        console.log("Category result:", categoryResult);

        if (!categoryResult?.length || !categoryResult[0]?.id) {
            throw new Error(`Invalid category: ${category}`);
        }

        const categoryId = categoryResult[0].id;
        console.log("Found category ID:", categoryId);

        // Insert the thread into forum_posts table
        console.log("Inserting thread into forum_posts");
        const result = await sql`
            INSERT INTO forum_posts (
                title,
                content,
                author_id,
                category_id,
                status,
                created_at,
                updated_at
            ) VALUES (
                ${title},
                ${content},
                ${authorId},
                ${categoryId},
                'active',
                CURRENT_TIMESTAMP,
                CURRENT_TIMESTAMP
            ) RETURNING id;
        `;
        console.log("Thread insert result:", result);

        const postId = result[0].id;
        console.log("Created post with ID:", postId);

        // Insert tags for the post
        console.log("Inserting tags:", tags);
        for (const tag of tags) {
            console.log("Inserting tag:", tag);
            await sql`
                INSERT INTO forum_post_tags (post_id, tag)
                VALUES (${postId}, ${tag})
                ON CONFLICT (post_id, tag) DO NOTHING;
            `;
        }
        console.log("Tags inserted successfully");

        // Revalidate the forum page to show the new thread
        revalidatePath("/forum");

        return { success: true, threadId: result[0].id };
    } catch (error) {
        console.error("Error creating thread:", error);
        if (error instanceof Error) {
            console.error("Error details:", {
                name: error.name,
                message: error.message,
                stack: error.stack,
            });
        }
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : "Failed to create thread",
        };
    }
}

interface ForumPostResponse {
    id: string;
    title: string;
    content: string;
    created_at: string;
    updated_at: string;
    category_name: string;
    category_slug: string;
    author_name: string;
    author_avatar: string | null;
    author_id: string;
    reply_count: number;
    like_count: number;
    view_count: number;
    tags: string[];
}

export async function getForumPosts(): Promise<ForumPostResponse[]> {
    try {
        const posts = await sql`
            SELECT 
                fp.id,
                fp.title,
                fp.content,
                fp.created_at,
                fp.updated_at,
                fc.name as category_name,
                fc.slug as category_slug,
                u.name as author_name,
                u.avatar_url as author_avatar,
                u.id as author_id,
                COUNT(DISTINCT fc2.id) as reply_count,
                COUNT(DISTINCT fl.id) as like_count,
                COUNT(DISTINCT fv.id) as view_count
            FROM forum_posts fp
            LEFT JOIN forum_categories fc ON fp.category_id = fc.id
            LEFT JOIN users u ON fp.author_id = u.id
            LEFT JOIN forum_comments fc2 ON fp.id = fc2.post_id
            LEFT JOIN forum_likes fl ON fp.id = fl.post_id
            LEFT JOIN forum_views fv ON fp.id = fv.post_id
            WHERE fp.status = 'active'
            GROUP BY fp.id, fc.name, fc.slug, u.name, u.avatar_url, u.id
            ORDER BY fp.created_at DESC
        `;

        // Get tags for each post
        const postsWithTags = await Promise.all(
            posts.map(async (post) => {
                const tags = await sql`
                    SELECT tag
                    FROM forum_post_tags
                    WHERE post_id = ${post.id}
                `;
                return {
                    ...post,
                    tags: tags.map((t) => t.tag),
                };
            })
        );

        return postsWithTags;
    } catch (error) {
        console.error("Error fetching forum posts:", error);
        throw error;
    }
}

export async function getForumPostsByCategory(
    categorySlug: string
): Promise<ForumPostResponse[]> {
    try {
        const posts = await sql`
            SELECT 
                fp.id,
                fp.title,
                fp.content,
                fp.created_at,
                fp.updated_at,
                fc.name as category_name,
                fc.slug as category_slug,
                u.name as author_name,
                NULL as author_avatar,
                u.id as author_id,
                COUNT(DISTINCT fc2.id) as reply_count,
                COUNT(DISTINCT fl.id) as like_count,
                COUNT(DISTINCT fv.id) as view_count
            FROM forum_posts fp
            LEFT JOIN forum_categories fc ON fp.category_id = fc.id
            LEFT JOIN users u ON fp.author_id = u.id
            LEFT JOIN forum_comments fc2 ON fp.id = fc2.post_id
            LEFT JOIN forum_likes fl ON fp.id = fl.post_id
            LEFT JOIN forum_views fv ON fp.id = fv.post_id
            WHERE fc.slug = ${categorySlug}
            AND fp.status = 'active'
            GROUP BY fp.id, fc.name, fc.slug, u.name, u.id
            ORDER BY fp.created_at DESC
        `;

        // Get tags for each post
        const postsWithTags = await Promise.all(
            posts.map(async (post) => {
                const tags = await sql`
                    SELECT tag
                    FROM forum_post_tags
                    WHERE post_id = ${post.id}
                `;
                return {
                    ...post,
                    tags: tags.map((t) => t.tag),
                };
            })
        );

        return postsWithTags;
    } catch (error) {
        console.error("Error fetching category posts:", error);
        throw error;
    }
}

export async function getForumPostById(
    id: string
): Promise<ForumPostResponse | null> {
    try {
        const post = await sql`
            SELECT 
                fp.id,
                fp.title,
                fp.content,
                fp.created_at,
                fp.updated_at,
                fc.name as category_name,
                fc.slug as category_slug,
                u.name as author_name,
                u.avatar_url as author_avatar,
                u.id as author_id,
                COUNT(DISTINCT fc2.id) as reply_count,
                COUNT(DISTINCT fl.id) as like_count,
                COUNT(DISTINCT fv.id) as view_count
            FROM forum_posts fp
            LEFT JOIN forum_categories fc ON fp.category_id = fc.id
            LEFT JOIN users u ON fp.author_id = u.id
            LEFT JOIN forum_comments fc2 ON fp.id = fc2.post_id
            LEFT JOIN forum_likes fl ON fp.id = fl.post_id
            LEFT JOIN forum_views fv ON fp.id = fv.post_id
            WHERE fp.id = ${id}
            AND fp.status = 'active'
            GROUP BY fp.id, fc.name, fc.slug, u.name, u.avatar_url, u.id
        `;

        if (!post || post.length === 0) {
            return null;
        }

        // Get tags for the post
        const tags = await sql`
            SELECT tag
            FROM forum_post_tags
            WHERE post_id = ${id}
        `;

        // For view count, we'll just return the current data without incrementing
        // since we need a valid user ID for the foreign key constraint

        return {
            ...post[0],
            tags: tags.map((t) => t.tag),
        };
    } catch (error) {
        console.error("Error fetching forum post:", error);
        throw error;
    }
}

interface ForumCommentResponse {
    id: string;
    content: string;
    created_at: string;
    author_name: string;
    author_avatar: string | null;
    author_id: string;
    like_count: number;
}

export async function getForumComments(
    postId: string
): Promise<ForumCommentResponse[]> {
    try {
        const comments = await sql`
            SELECT 
                fc.id,
                fc.content,
                fc.created_at,
                u.name as author_name,
                u.avatar_url as author_avatar,
                u.id as author_id,
                (
                    SELECT COUNT(*)
                    FROM forum_likes fl
                    WHERE fl.post_id = fc.id
                ) as like_count
            FROM forum_comments fc
            LEFT JOIN users u ON fc.author_id = u.id
            WHERE fc.post_id = ${postId}
            ORDER BY fc.created_at ASC
        `;

        return comments;
    } catch (error) {
        console.error("Error fetching forum comments:", error);
        throw error;
    }
}

export async function createForumComment({
    content,
    postId,
    authorId,
}: {
    content: string;
    postId: string;
    authorId: string;
}) {
    try {
        // Insert the comment into forum_comments table
        const result = await sql`
            INSERT INTO forum_comments (
                content,
                post_id,
                author_id,
                created_at,
                updated_at
            ) VALUES (
                ${content},
                ${postId},
                ${authorId},
                CURRENT_TIMESTAMP,
                CURRENT_TIMESTAMP
            ) RETURNING id;
        `;

        // Revalidate the thread page to show the new comment
        revalidatePath(`/forum/${postId}`);

        return { success: true, commentId: result[0].id };
    } catch (error) {
        console.error("Error creating comment:", error);
        if (error instanceof Error) {
            console.error("Error details:", {
                name: error.name,
                message: error.message,
                stack: error.stack,
            });
        }
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : "Failed to create comment",
        };
    }
}

export async function toggleForumLike(postId: string, userId: string) {
    try {
        // Check if the user has already liked the post
        const existingLike = await sql`
            SELECT id FROM forum_likes 
            WHERE post_id = ${postId} AND user_id = ${userId}
        `;

        if (existingLike.length > 0) {
            // Unlike: Remove the like record
            await sql`
                DELETE FROM forum_likes 
                WHERE post_id = ${postId} AND user_id = ${userId}
            `;

            revalidatePath(`/forum/${postId}`);

            // Get the new like count
            const likeCount = await sql`
                SELECT COUNT(*) as count 
                FROM forum_likes 
                WHERE post_id = ${postId}
            `;

            return {
                success: true,
                action: "unliked",
                newCount: parseInt(likeCount[0].count),
            };
        } else {
            // Like: Create new like record
            await sql`
                INSERT INTO forum_likes (post_id, user_id) 
                VALUES (${postId}, ${userId})
            `;

            revalidatePath(`/forum/${postId}`);

            // Get the new like count
            const likeCount = await sql`
                SELECT COUNT(*) as count 
                FROM forum_likes 
                WHERE post_id = ${postId}
            `;

            return {
                success: true,
                action: "liked",
                newCount: parseInt(likeCount[0].count),
            };
        }
    } catch (error) {
        console.error("Error toggling forum like:", error);
        return { success: false, error: "Failed to update like status" };
    }
}

export async function checkUserLikeStatus(postId: string, userId: string) {
    try {
        const existingLike = await sql`
            SELECT id FROM forum_likes 
            WHERE post_id = ${postId} AND user_id = ${userId}
        `;

        return { hasLiked: existingLike.length > 0 };
    } catch (error) {
        console.error("Error checking like status:", error);
        return { hasLiked: false };
    }
}
