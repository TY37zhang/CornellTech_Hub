"use server";

import { revalidatePath } from "next/cache";
import { neon } from "@neondatabase/serverless";
import { sendForumReplyNotification } from "@/lib/email/forum-notifications";
import { sql } from "@/lib/db/config";

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
        // Validate UUID format
        if (
            !authorId.match(
                /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
            )
        ) {
            throw new Error("Invalid author ID format");
        }

        // First, ensure the forum_categories table exists and has the category
        const categoryQuery = `
            INSERT INTO forum_categories (name, slug, description)
            VALUES ($1, $2, $3)
            ON CONFLICT (slug) DO NOTHING
            RETURNING id
        `;
        const categoryName =
            category.charAt(0).toUpperCase() + category.slice(1);
        const categoryResult = await sql(categoryQuery, [
            categoryName,
            category,
            `Discussions about ${category}`,
        ]);

        if (!categoryResult || !categoryResult[0]?.id) {
            // If no result from insert, try to get existing category
            const existingCategoryQuery = `
                SELECT id FROM forum_categories WHERE slug = $1
            `;
            const existingCategory = await sql(existingCategoryQuery, [
                category,
            ]);
            if (!existingCategory || !existingCategory[0]?.id) {
                throw new Error(
                    `Failed to create or find category: ${category}`
                );
            }
            categoryResult[0] = existingCategory[0];
        }

        const categoryId = categoryResult[0].id;

        // Insert the thread into forum_posts table
        const postQuery = `
            INSERT INTO forum_posts (title, content, author_id, category_id, status, notify_on_reply)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id
        `;
        const postResult = await sql(postQuery, [
            title,
            content,
            authorId,
            categoryId,
            "active",
            notifyOnReply,
        ]);

        if (!postResult || !postResult[0]?.id) {
            throw new Error("Failed to create forum post");
        }

        const postId = postResult[0].id;

        // Insert tags for the post
        if (tags.length > 0) {
            const tagValues = tags
                .map((_, index) => `($1, $${index + 2}, $${tags.length + 2})`)
                .join(", ");
            const tagQuery = `
                INSERT INTO forum_post_tags (post_id, tag, created_at)
                VALUES ${tagValues}
                ON CONFLICT (post_id, tag) DO NOTHING
            `;
            const tagParams = [postId, ...tags, new Date()];
            await sql(tagQuery, tagParams);
        }

        // Store notification preference if needed
        if (notifyOnReply) {
            const notificationQuery = `
                INSERT INTO forum_notification_preferences (post_id, user_id, notify_on_reply)
                VALUES ($1, $2, true)
                ON CONFLICT (post_id, user_id) DO UPDATE
                SET notify_on_reply = true
            `;
            await sql(notificationQuery, [postId, authorId]);
        }

        // Revalidate the forum page to show the new thread
        revalidatePath("/forum");

        return { success: true, threadId: postId };
    } catch (error) {
        console.error("Error creating thread:", error);
        if (error instanceof Error) {
            console.error("Error details:", {
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
    author_post_count: number;
    author_total_likes: number;
}

export async function getForumPosts(
    search = "",
    limit = 10,
    offset = 0
): Promise<{ posts: ForumPostResponse[]; total: number }> {
    try {
        console.log("Starting getForumPosts with params:", {
            search,
            limit,
            offset,
        });

        // Build the search condition
        let searchCondition = "";
        let params: any[] = [];
        if (search) {
            searchCondition = `
                AND (
                    fp.title ILIKE $1
                    OR fp.content ILIKE $1
                    OR u.name ILIKE $1
                )
            `;
            params.push(`%${search}%`);
        }

        // Get total count
        const countQuery = `
            SELECT COUNT(DISTINCT fp.id) as total
            FROM forum_posts fp
            JOIN users u ON fp.author_id = u.id
            WHERE fp.status = 'active'
            ${searchCondition}
        `;
        const countResult = await sql(countQuery, params);
        const total = parseInt(countResult[0].total);

        // Get posts with all related data
        const postsQuery = `
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
                COUNT(DISTINCT fv.id) as view_count,
                ARRAY_AGG(DISTINCT fpt.tag) as tags
            FROM forum_posts fp
            JOIN users u ON fp.author_id = u.id
            JOIN forum_categories fc ON fp.category_id = fc.id
            LEFT JOIN forum_comments fc2 ON fp.id = fc2.post_id
            LEFT JOIN forum_likes fl ON fp.id = fl.post_id
            LEFT JOIN forum_views fv ON fp.id = fv.post_id
            LEFT JOIN forum_post_tags fpt ON fp.id = fpt.post_id
            WHERE fp.status = 'active'
            ${searchCondition}
            GROUP BY fp.id, fc.name, fc.slug, u.name, u.avatar_url, u.id
            ORDER BY fp.created_at DESC
            LIMIT $${params.length + 1} OFFSET $${params.length + 2}
        `;
        params.push(limit, offset);
        const posts = await sql(postsQuery, params);

        // Format the response
        const formattedPosts: ForumPostResponse[] = posts.map((post) => ({
            id: post.id,
            title: post.title,
            content: post.content,
            created_at:
                post.created_at?.toISOString() || new Date().toISOString(),
            updated_at:
                post.updated_at?.toISOString() || new Date().toISOString(),
            category_name: post.category_name,
            category_slug: post.category_slug,
            author_name: post.author_name,
            author_avatar: post.author_avatar,
            author_id: post.author_id,
            reply_count: parseInt(post.reply_count),
            like_count: parseInt(post.like_count),
            view_count: parseInt(post.view_count),
            tags: post.tags.filter(Boolean), // Remove null values from tags array
        }));

        return {
            posts: formattedPosts,
            total,
        };
    } catch (error) {
        console.error("Error in getForumPosts:", error);
        if (error instanceof Error) {
            console.error("Error details:", {
                message: error.message,
                stack: error.stack,
            });
        }
        throw error;
    }
}

export async function getForumPostsByCategory(
    categorySlug: string,
    limit = 10,
    offset = 0
): Promise<{ posts: ForumPostResponse[]; total: number }> {
    try {
        // Get total count
        const countQuery = `
            SELECT COUNT(DISTINCT fp.id) as total
            FROM forum_posts fp
            JOIN forum_categories fc ON fp.category_id = fc.id
            WHERE fp.status = 'active' AND fc.slug = $1
        `;
        const countResult = await sql(countQuery, [categorySlug]);
        const total = parseInt(countResult[0].total);

        // Get posts with all related data
        const postsQuery = `
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
                COUNT(DISTINCT fv.id) as view_count,
                ARRAY_AGG(DISTINCT fpt.tag) as tags
            FROM forum_posts fp
            JOIN users u ON fp.author_id = u.id
            JOIN forum_categories fc ON fp.category_id = fc.id
            LEFT JOIN forum_comments fc2 ON fp.id = fc2.post_id
            LEFT JOIN forum_likes fl ON fp.id = fl.post_id
            LEFT JOIN forum_views fv ON fp.id = fv.post_id
            LEFT JOIN forum_post_tags fpt ON fp.id = fpt.post_id
            WHERE fp.status = 'active' AND fc.slug = $1
            GROUP BY fp.id, fc.name, fc.slug, u.name, u.avatar_url, u.id
            ORDER BY fp.created_at DESC
            LIMIT $2 OFFSET $3
        `;
        const posts = await sql(postsQuery, [categorySlug, limit, offset]);

        // Format the response
        const formattedPosts: ForumPostResponse[] = posts.map((post) => ({
            id: post.id,
            title: post.title,
            content: post.content,
            created_at:
                post.created_at?.toISOString() || new Date().toISOString(),
            updated_at:
                post.updated_at?.toISOString() || new Date().toISOString(),
            category_name: post.category_name,
            category_slug: post.category_slug,
            author_name: post.author_name,
            author_avatar: post.author_avatar,
            author_id: post.author_id,
            reply_count: parseInt(post.reply_count) || 0,
            like_count: parseInt(post.like_count) || 0,
            view_count: parseInt(post.view_count) || 0,
            tags: post.tags.filter(Boolean),
        }));

        return { posts: formattedPosts, total };
    } catch (error) {
        console.error("Error fetching forum posts by category:", error);
        throw error;
    }
}

export async function getForumPostById(
    id: string
): Promise<ForumPostResponse | null> {
    try {
        // Extract UUID from slug if it contains one
        const uuidMatch = id.match(
            /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i
        );
        const postId = uuidMatch ? uuidMatch[0] : id;

        // Check if we found a UUID
        const isUUID =
            /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
                postId
            );

        let query: string;
        let params: any[];

        if (isUUID) {
            // If it's a UUID, query by post ID
            query = `
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
                    COUNT(DISTINCT fv.id) as view_count,
                    ARRAY_AGG(DISTINCT fpt.tag) as tags,
                    (
                        SELECT COUNT(*) FROM forum_posts fp2 WHERE fp2.author_id = u.id AND fp2.status = 'active'
                    ) as author_post_count,
                    (
                        SELECT COUNT(*) FROM forum_likes fl2
                        JOIN forum_posts fp2 ON fl2.post_id = fp2.id
                        WHERE fp2.author_id = u.id
                    ) as author_total_likes
                FROM forum_posts fp
                JOIN users u ON fp.author_id = u.id
                JOIN forum_categories fc ON fp.category_id = fc.id
                LEFT JOIN forum_comments fc2 ON fp.id = fc2.post_id
                LEFT JOIN forum_likes fl ON fp.id = fl.post_id
                LEFT JOIN forum_views fv ON fp.id = fv.post_id
                LEFT JOIN forum_post_tags fpt ON fp.id = fpt.post_id
                WHERE fp.id = $1 AND fp.status = 'active'
                GROUP BY fp.id, fc.name, fc.slug, u.name, u.avatar_url, u.id
            `;
            params = [postId];
        } else {
            // If it's not a UUID, assume it's a category slug and get the first post from that category
            query = `
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
                    COUNT(DISTINCT fv.id) as view_count,
                    ARRAY_AGG(DISTINCT fpt.tag) as tags,
                    (
                        SELECT COUNT(*) FROM forum_posts fp2 WHERE fp2.author_id = u.id AND fp2.status = 'active'
                    ) as author_post_count,
                    (
                        SELECT COUNT(*) FROM forum_likes fl2
                        JOIN forum_posts fp2 ON fl2.post_id = fp2.id
                        WHERE fp2.author_id = u.id
                    ) as author_total_likes
                FROM forum_posts fp
                JOIN users u ON fp.author_id = u.id
                JOIN forum_categories fc ON fp.category_id = fc.id
                LEFT JOIN forum_comments fc2 ON fp.id = fc2.post_id
                LEFT JOIN forum_likes fl ON fp.id = fl.post_id
                LEFT JOIN forum_views fv ON fp.id = fv.post_id
                LEFT JOIN forum_post_tags fpt ON fp.id = fpt.post_id
                WHERE fc.slug = $1 AND fp.status = 'active'
                GROUP BY fp.id, fc.name, fc.slug, u.name, u.avatar_url, u.id
                ORDER BY fp.created_at DESC
                LIMIT 1
            `;
            params = [id];
        }

        const result = await sql(query, params);
        if (!result || result.length === 0) {
            return null;
        }

        const post = result[0];
        return {
            id: post.id,
            title: post.title,
            content: post.content,
            created_at:
                post.created_at?.toISOString() || new Date().toISOString(),
            updated_at:
                post.updated_at?.toISOString() || new Date().toISOString(),
            category_name: post.category_name,
            category_slug: post.category_slug,
            author_name: post.author_name,
            author_avatar: post.author_avatar,
            author_id: post.author_id,
            reply_count: parseInt(post.reply_count),
            like_count: parseInt(post.like_count),
            view_count: parseInt(post.view_count),
            tags: post.tags.filter(Boolean), // Remove null values from tags array
            author_post_count: parseInt(post.author_post_count) || 0,
            author_total_likes: parseInt(post.author_total_likes) || 0,
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
    dislike_count: number;
}

export async function getForumComments(
    postId: string
): Promise<ForumCommentResponse[]> {
    try {
        // Check if the input is a valid UUID
        const isUUID =
            /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
                postId
            );

        let actualPostId = postId;

        if (!isUUID) {
            // If it's not a UUID, assume it's a category slug and get the first post from that category
            const postQuery = `
                SELECT fp.id
                FROM forum_posts fp
                JOIN forum_categories fc ON fp.category_id = fc.id
                WHERE fc.slug = $1 AND fp.status = 'active'
                ORDER BY fp.created_at DESC
                LIMIT 1
            `;
            const postResult = await sql(postQuery, [postId]);
            if (!postResult || postResult.length === 0) {
                return [];
            }
            actualPostId = postResult[0].id;
        }

        // Get comments with author information and counts
        const commentsQuery = `
            SELECT 
                fc.id,
                fc.content,
                fc.created_at,
                fc.like_count,
                fc.dislike_count,
                u.name as author_name,
                u.avatar_url as author_avatar,
                u.id as author_id
            FROM forum_comments fc
            JOIN users u ON fc.author_id = u.id
            WHERE fc.post_id = $1
            ORDER BY fc.created_at ASC
        `;
        const comments = await sql(commentsQuery, [actualPostId]);

        return comments.map((comment) => ({
            id: comment.id,
            content: comment.content,
            created_at:
                comment.created_at?.toISOString() || new Date().toISOString(),
            author_name: comment.author_name,
            author_avatar: comment.author_avatar,
            author_id: comment.author_id,
            like_count: parseInt(comment.like_count) || 0,
            dislike_count: parseInt(comment.dislike_count) || 0,
        }));
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
        const commentQuery = `
            INSERT INTO forum_comments (content, post_id, author_id, created_at, updated_at)
            VALUES ($1, $2, $3, NOW(), NOW())
            RETURNING id
        `;
        const result = await sql(commentQuery, [content, postId, authorId]);

        if (!result || !result[0]?.id) {
            throw new Error("Failed to create comment");
        }

        const commentId = result[0].id;

        // Send notification
        await sendForumReplyNotification(postId, commentId, authorId);

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
        const checkLikeQuery = `
            SELECT id FROM forum_likes
            WHERE post_id = $1 AND user_id = $2
        `;
        const existingLike = await sql(checkLikeQuery, [postId, userId]);

        if (existingLike && existingLike.length > 0) {
            // Unlike: Remove the like record
            const deleteLikeQuery = `
                DELETE FROM forum_likes
                WHERE id = $1
            `;
            await sql(deleteLikeQuery, [existingLike[0].id]);

            revalidatePath(`/forum/${postId}`);

            // Get the new like count
            const countQuery = `
                SELECT COUNT(*) as count
                FROM forum_likes
                WHERE post_id = $1
            `;
            const countResult = await sql(countQuery, [postId]);
            const likeCount = parseInt(countResult[0].count);

            return {
                success: true,
                action: "unliked",
                newCount: likeCount,
            };
        } else {
            // Like: Create new like record
            const createLikeQuery = `
                INSERT INTO forum_likes (post_id, user_id, created_at)
                VALUES ($1, $2, NOW())
            `;
            await sql(createLikeQuery, [postId, userId]);

            revalidatePath(`/forum/${postId}`);

            // Get the new like count
            const countQuery = `
                SELECT COUNT(*) as count
                FROM forum_likes
                WHERE post_id = $1
            `;
            const countResult = await sql(countQuery, [postId]);
            const likeCount = parseInt(countResult[0].count);

            return {
                success: true,
                action: "liked",
                newCount: likeCount,
            };
        }
    } catch (error) {
        console.error("Error toggling forum like:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
}

export async function getForumStats() {
    try {
        const statsQuery = `
            SELECT 
                (SELECT COUNT(*) FROM forum_posts WHERE status = 'active') as total_threads,
                (SELECT COUNT(*) FROM forum_comments) as total_comments,
                (SELECT COUNT(*) FROM forum_posts 
                 WHERE status = 'active' 
                 AND created_at >= CURRENT_DATE) as new_today
        `;

        const result = await sql(statsQuery);
        const stats = result[0];

        return {
            totalThreads: parseInt(stats.total_threads),
            totalPosts:
                parseInt(stats.total_threads) + parseInt(stats.total_comments),
            newToday: parseInt(stats.new_today),
        };
    } catch (error) {
        console.error("Error fetching forum stats:", error);
        return {
            totalThreads: 0,
            totalPosts: 0,
            newToday: 0,
        };
    }
}

interface TopContributor {
    id: string;
    name: string;
    avatar_url: string | null;
    post_count: number;
}

export async function getTopContributors(): Promise<TopContributor[]> {
    try {
        const contributorsQuery = `
            WITH user_contributions AS (
                SELECT 
                    u.id,
                    u.name,
                    u.avatar_url,
                    (SELECT COUNT(*) FROM forum_posts WHERE author_id = u.id) as posts_count,
                    (SELECT COUNT(*) FROM forum_comments WHERE author_id = u.id) as comments_count
                FROM users u
            )
            SELECT 
                id,
                name,
                avatar_url,
                (posts_count + comments_count) as post_count
            FROM user_contributions
            ORDER BY post_count DESC
            LIMIT 3
        `;

        const contributors = await sql(contributorsQuery);

        return contributors.map((contributor) => ({
            id: contributor.id,
            name: contributor.name,
            avatar_url: contributor.avatar_url,
            post_count: parseInt(contributor.post_count),
        }));
    } catch (error) {
        console.error("Error fetching top contributors:", error);
        return [];
    }
}

export async function toggleForumCommentLike(
    commentId: string,
    userId: string
) {
    try {
        // Check if the user has already liked the comment
        const checkLikeQuery = `
            SELECT id FROM forum_comment_likes
            WHERE comment_id = $1 AND user_id = $2
        `;
        const existingLike = await sql(checkLikeQuery, [commentId, userId]);

        if (existingLike && existingLike.length > 0) {
            // Unlike: Remove the like record
            const deleteLikeQuery = `
                DELETE FROM forum_comment_likes
                WHERE id = $1
            `;
            await sql(deleteLikeQuery, [existingLike[0].id]);

            revalidatePath(`/forum/${commentId}`);

            // Get the new like count
            const countQuery = `
                SELECT COUNT(*) as count
                FROM forum_comment_likes
                WHERE comment_id = $1
            `;
            const countResult = await sql(countQuery, [commentId]);
            const likeCount = parseInt(countResult[0].count);

            return {
                success: true,
                action: "unliked",
                newCount: likeCount,
            };
        } else {
            // Like: Create new like record
            const createLikeQuery = `
                INSERT INTO forum_comment_likes (comment_id, user_id, created_at)
                VALUES ($1, $2, NOW())
            `;
            await sql(createLikeQuery, [commentId, userId]);

            revalidatePath(`/forum/${commentId}`);

            // Get the new like count
            const countQuery = `
                SELECT COUNT(*) as count
                FROM forum_comment_likes
                WHERE comment_id = $1
            `;
            const countResult = await sql(countQuery, [commentId]);
            const likeCount = parseInt(countResult[0].count);

            return {
                success: true,
                action: "liked",
                newCount: likeCount,
            };
        }
    } catch (error) {
        console.error("Error toggling forum comment like:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
}

export async function getRelatedPosts(
    postId: string,
    category: string,
    limit = 5
): Promise<ForumPostResponse[]> {
    try {
        // Extract UUID from slug if it contains one
        const uuidMatch = postId.match(
            /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i
        );
        const actualPostId = uuidMatch ? uuidMatch[0] : postId;

        const query = `
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
                COUNT(DISTINCT fv.id) as view_count,
                ARRAY_AGG(DISTINCT fpt.tag) as tags
            FROM forum_posts fp
            JOIN users u ON fp.author_id = u.id
            JOIN forum_categories fc ON fp.category_id = fc.id
            LEFT JOIN forum_comments fc2 ON fp.id = fc2.post_id
            LEFT JOIN forum_likes fl ON fp.id = fl.post_id
            LEFT JOIN forum_views fv ON fp.id = fv.post_id
            LEFT JOIN forum_post_tags fpt ON fp.id = fpt.post_id
            WHERE fp.status = 'active' 
            AND fc.slug = $1
            AND fp.id != $2
            GROUP BY fp.id, fc.name, fc.slug, u.name, u.avatar_url, u.id
            ORDER BY fp.created_at DESC
            LIMIT $3
        `;

        const posts = await sql(query, [category, actualPostId, limit]);

        // Format the response
        return posts.map((post) => ({
            id: post.id,
            title: post.title,
            content: post.content,
            created_at:
                post.created_at?.toISOString() || new Date().toISOString(),
            updated_at:
                post.updated_at?.toISOString() || new Date().toISOString(),
            category_name: post.category_name,
            category_slug: post.category_slug,
            author_name: post.author_name,
            author_avatar: post.author_avatar,
            author_id: post.author_id,
            reply_count: parseInt(post.reply_count) || 0,
            like_count: parseInt(post.like_count) || 0,
            view_count: parseInt(post.view_count) || 0,
            tags: post.tags.filter(Boolean),
        }));
    } catch (error) {
        console.error("Error fetching related posts:", error);
        return [];
    }
}

export async function checkUserLikeStatus(
    postId: string,
    userId: string
): Promise<{ hasLiked: boolean }> {
    try {
        const query = `
            SELECT EXISTS (
                SELECT 1 FROM forum_likes
                WHERE post_id = $1 AND user_id = $2
            ) as has_liked
        `;
        const result = await sql(query, [postId, userId]);
        return { hasLiked: result[0]?.has_liked || false };
    } catch (error) {
        console.error("Error checking user like status:", error);
        return { hasLiked: false };
    }
}

export async function checkUserSaveStatus(postId: string, userId: string) {
    try {
        const query = `
            SELECT EXISTS (
                SELECT 1 FROM forum_saved
                WHERE post_id = $1 AND user_id = $2
            ) as has_saved
        `;
        const result = await sql(query, [postId, userId]);
        return result[0]?.has_saved || false;
    } catch (error) {
        console.error("Error checking user save status:", error);
        return false;
    }
}

export async function toggleForumSave(postId: string, userId: string) {
    try {
        // Check if the user has already saved the post
        const checkSaveQuery = `
            SELECT id FROM forum_saved
            WHERE post_id = $1 AND user_id = $2
        `;
        const existingSave = await sql(checkSaveQuery, [postId, userId]);

        if (existingSave && existingSave.length > 0) {
            // Unsave: Remove the save record
            const deleteSaveQuery = `
                DELETE FROM forum_saved
                WHERE id = $1
            `;
            await sql(deleteSaveQuery, [existingSave[0].id]);

            revalidatePath(`/forum/${postId}`);
            revalidatePath("/forum/saved");

            return {
                success: true,
                action: "unsaved",
            };
        } else {
            // Save: Create new save record
            const createSaveQuery = `
                INSERT INTO forum_saved (post_id, user_id, created_at)
                VALUES ($1, $2, NOW())
            `;
            await sql(createSaveQuery, [postId, userId]);

            revalidatePath(`/forum/${postId}`);
            revalidatePath("/forum/saved");

            return {
                success: true,
                action: "saved",
            };
        }
    } catch (error) {
        console.error("Error toggling forum save:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
}

export async function getCommentVoteStatus(commentId: string, userId: string) {
    try {
        const query = `
            SELECT action_type as vote_type
            FROM comment_votes
            WHERE comment_id = $1 AND user_id = $2
        `;
        const result = await sql(query, [commentId, userId]);
        return { voteType: result[0]?.vote_type || null };
    } catch (error) {
        console.error("Error getting vote status:", error);
        return { voteType: null };
    }
}

export async function toggleCommentLike(
    commentId: string,
    userId: string,
    voteType: "upvote" | "downvote"
) {
    try {
        // Check if user has already voted on this comment
        const existingVoteQuery = `
            SELECT id, action_type
            FROM comment_votes
            WHERE comment_id = $1 AND user_id = $2
        `;
        const existingVote = await sql(existingVoteQuery, [commentId, userId]);

        if (existingVote && existingVote.length > 0) {
            if (existingVote[0].action_type === voteType) {
                // Remove vote if clicking the same button
                const deleteQuery = `
                    DELETE FROM comment_votes
                    WHERE id = $1
                `;
                await sql(deleteQuery, [existingVote[0].id]);

                // Get updated counts
                const updatedCounts = await getCommentVoteCounts(commentId);
                return {
                    success: true,
                    action: "removed",
                    ...updatedCounts,
                };
            } else {
                // Update vote if changing vote type
                const updateQuery = `
                    UPDATE comment_votes
                    SET action_type = $1, updated_at = NOW()
                    WHERE id = $2
                `;
                await sql(updateQuery, [voteType, existingVote[0].id]);

                // Get updated counts
                const updatedCounts = await getCommentVoteCounts(commentId);
                return {
                    success: true,
                    action: "changed",
                    ...updatedCounts,
                };
            }
        } else {
            // Create new vote
            const insertQuery = `
                INSERT INTO comment_votes (comment_id, user_id, action_type)
                VALUES ($1, $2, $3)
            `;
            await sql(insertQuery, [commentId, userId, voteType]);

            // Get updated counts
            const updatedCounts = await getCommentVoteCounts(commentId);
            return {
                success: true,
                action: "added",
                ...updatedCounts,
            };
        }
    } catch (error) {
        console.error("Error voting on comment:", error);
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : "Failed to vote on comment",
        };
    }
}

async function getCommentVoteCounts(commentId: string) {
    const query = `
        SELECT like_count, dislike_count
        FROM forum_comments
        WHERE id = $1
    `;
    const result = await sql(query, [commentId]);
    return {
        likeCount: parseInt(result[0].like_count) || 0,
        dislikeCount: parseInt(result[0].dislike_count) || 0,
    };
}

export async function getUserSavedPosts(
    userId: string
): Promise<ForumPostResponse[]> {
    try {
        const query = `
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
                COUNT(DISTINCT fv.id) as view_count,
                ARRAY_AGG(DISTINCT fpt.tag) as tags
            FROM forum_posts fp
            JOIN users u ON fp.author_id = u.id
            JOIN forum_categories fc ON fp.category_id = fc.id
            LEFT JOIN forum_comments fc2 ON fp.id = fc2.post_id
            LEFT JOIN forum_likes fl ON fp.id = fl.post_id
            LEFT JOIN forum_views fv ON fp.id = fv.post_id
            LEFT JOIN forum_post_tags fpt ON fp.id = fpt.post_id
            JOIN forum_saved fs ON fp.id = fs.post_id
            WHERE fs.user_id = $1 AND fp.status = 'active'
            GROUP BY fp.id, fc.name, fc.slug, u.name, u.avatar_url, u.id, fs.created_at
            ORDER BY fs.created_at DESC
        `;

        const posts = await sql(query, [userId]);

        return posts.map((post) => ({
            id: post.id,
            title: post.title,
            content: post.content,
            created_at:
                post.created_at?.toISOString() || new Date().toISOString(),
            updated_at:
                post.updated_at?.toISOString() || new Date().toISOString(),
            category_name: post.category_name,
            category_slug: post.category_slug,
            author_name: post.author_name,
            author_avatar: post.author_avatar,
            author_id: post.author_id,
            reply_count: parseInt(post.reply_count),
            like_count: parseInt(post.like_count),
            view_count: parseInt(post.view_count),
            tags: post.tags.filter(Boolean),
        }));
    } catch (error) {
        console.error("Error in getUserSavedPosts:", error);
        throw error;
    }
}
