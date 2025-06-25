"use server";

import { revalidatePath } from "next/cache";
import { sendForumReplyNotification } from "@/lib/email/forum-notifications";
import { prisma } from "@/lib/db/prisma";

// Helper to extract UUID from slug or return original if already UUID
function extractUUID(id: string): string {
    const match = id.match(
        /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i
    );
    return match ? match[0] : id;
}

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
        // Validate UUID format for author
        if (
            !authorId.match(
                /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
            )
        ) {
            throw new Error("Invalid author ID format");
        }

        // Perform all DB writes atomically
        const newPostId = await prisma.$transaction(async (tx) => {
            // 1. Ensure category exists (upsert)
            const categoryName =
                category.charAt(0).toUpperCase() + category.slice(1);

            const categoryRecord = await tx.forum_categories.upsert({
                where: { slug: category },
                update: {},
                create: {
                    name: categoryName,
                    slug: category,
                    description: `Discussions about ${category}`,
                },
            });

            // 2. Create the post
            const post = await tx.forum_posts.create({
                data: {
                    title,
                    content,
                    author_id: authorId,
                    category_id: categoryRecord.id,
                    status: "active",
                    notify_on_reply: notifyOnReply,
                },
            });

            // 3. Tags
            if (tags.length > 0) {
                await tx.forum_post_tags.createMany({
                    data: tags.map((tag) => ({
                        post_id: post.id,
                        tag,
                        created_at: new Date(),
                    })),
                    skipDuplicates: true,
                });
            }

            // 4. Notification preference
            if (notifyOnReply) {
                await tx.forum_notification_preferences.upsert({
                    where: {
                        post_id_user_id: {
                            post_id: post.id,
                            user_id: authorId,
                        },
                    },
                    update: {
                        notify_on_reply: true,
                    },
                    create: {
                        post_id: post.id,
                        user_id: authorId,
                        notify_on_reply: true,
                    },
                });
            }

            return post.id;
        });

        // Revalidate path so the new thread appears
        revalidatePath("/forum");

        return { success: true, threadId: newPostId };
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
    /**
     * The timestamp (ISO string) of when the currently authenticated user saved the post.
     * This will only be populated when fetching a user's saved posts.
     */
    saved_at?: string;
}

export async function getForumPosts(
    search = "",
    limit = 10,
    offset = 0
): Promise<{ posts: ForumPostResponse[]; total: number }> {
    try {
        const totalPromise = prisma.forum_posts.count({
            where: {
                status: "active",
                OR: search
                    ? [
                          { title: { contains: search, mode: "insensitive" } },
                          {
                              content: {
                                  contains: search,
                                  mode: "insensitive",
                              },
                          },
                          {
                              users: {
                                  name: {
                                      contains: search,
                                      mode: "insensitive",
                                  },
                              },
                          },
                      ]
                    : undefined,
            },
        });

        const postsPromise = prisma.forum_posts.findMany({
            where: {
                status: "active",
                OR: search
                    ? [
                          { title: { contains: search, mode: "insensitive" } },
                          {
                              content: {
                                  contains: search,
                                  mode: "insensitive",
                              },
                          },
                          {
                              users: {
                                  name: {
                                      contains: search,
                                      mode: "insensitive",
                                  },
                              },
                          },
                      ]
                    : undefined,
            },
            include: {
                users: {
                    select: { name: true, avatar_url: true, id: true },
                },
                forum_categories: {
                    select: { name: true, slug: true },
                },
                forum_post_tags: { select: { tag: true } },
                _count: {
                    select: {
                        forum_comments: true,
                        forum_likes: true,
                        forum_views: true,
                    },
                },
            },
            orderBy: { created_at: "desc" },
            take: limit * 3,
            skip: offset,
        });

        const [total, posts] = await Promise.all([totalPromise, postsPromise]);

        return {
            posts: posts.map((post) => ({
                id: post.id,
                title: post.title,
                content: post.content,
                created_at:
                    post.created_at?.toISOString() || new Date().toISOString(),
                updated_at:
                    post.updated_at?.toISOString() || new Date().toISOString(),
                category_name: post.forum_categories.name,
                category_slug: post.forum_categories.slug,
                author_name: post.users.name,
                author_avatar: post.users.avatar_url,
                author_id: post.users.id,
                reply_count: post._count.forum_comments,
                like_count: post._count.forum_likes,
                view_count: post._count.forum_views,
                tags: post.forum_post_tags.map((t: { tag: string }) => t.tag),
                author_post_count: 0, // Not available in Prisma query
                author_total_likes: 0, // Not available in Prisma query
            })),
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
        const [total, posts] = await Promise.all([
            prisma.forum_posts.count({
                where: {
                    status: "active",
                    forum_categories: { slug: categorySlug },
                },
            }),
            prisma.forum_posts.findMany({
                where: {
                    status: "active",
                    forum_categories: { slug: categorySlug },
                },
                include: {
                    users: {
                        select: { name: true, avatar_url: true, id: true },
                    },
                    forum_categories: { select: { name: true, slug: true } },
                    forum_comments: { select: { id: true } },
                    forum_likes: { select: { id: true } },
                    forum_views: { select: { id: true } },
                    forum_post_tags: { select: { tag: true } },
                },
                orderBy: { created_at: "desc" },
                take: limit,
                skip: offset,
            }),
        ]);

        const formattedPosts: ForumPostResponse[] = posts.map((post) => ({
            id: post.id,
            title: post.title,
            content: post.content,
            created_at:
                post.created_at?.toISOString() ?? new Date().toISOString(),
            updated_at:
                post.updated_at?.toISOString() ?? new Date().toISOString(),
            category_name: post.forum_categories.name,
            category_slug: post.forum_categories.slug,
            author_name: post.users.name,
            author_avatar: post.users.avatar_url,
            author_id: post.users.id,
            reply_count: post.forum_comments.length,
            like_count: post.forum_likes.length,
            view_count: post.forum_views.length,
            tags: post.forum_post_tags.map((t: { tag: string }) => t.tag),
            author_post_count: 0,
            author_total_likes: 0,
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
        // Identify if the provided identifier is a UUID
        const uuidRegex =
            /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;
        const uuidMatch = id.match(uuidRegex);
        const postIdOrSlug = uuidMatch ? uuidMatch[0] : id;
        const isUUID = uuidRegex.test(postIdOrSlug);

        let postRecord: any;

        if (isUUID) {
            // Fetch directly by post id
            postRecord = await prisma.forum_posts.findFirst({
                where: {
                    id: postIdOrSlug,
                    status: "active",
                },
                include: {
                    forum_categories: {
                        select: { name: true, slug: true },
                    },
                    users: {
                        select: { name: true, avatar_url: true, id: true },
                    },
                    forum_comments: { select: { id: true } },
                    forum_likes: { select: { id: true } },
                    forum_views: { select: { id: true } },
                    forum_post_tags: { select: { tag: true } },
                },
            });
        } else {
            // Treat it as a category slug and fetch the latest post in that category
            postRecord = await prisma.forum_posts.findFirst({
                where: {
                    status: "active",
                    forum_categories: {
                        slug: postIdOrSlug,
                    },
                },
                orderBy: { created_at: "desc" },
                include: {
                    forum_categories: {
                        select: { name: true, slug: true },
                    },
                    users: {
                        select: { name: true, avatar_url: true, id: true },
                    },
                    forum_comments: { select: { id: true } },
                    forum_likes: { select: { id: true } },
                    forum_views: { select: { id: true } },
                    forum_post_tags: { select: { tag: true } },
                },
            });
        }

        if (!postRecord) return null;

        // Additional author stats
        const [author_post_count, author_total_likes] =
            await prisma.$transaction([
                prisma.forum_posts.count({
                    where: {
                        author_id: postRecord.author_id,
                        status: "active",
                    },
                }),
                prisma.forum_likes.count({
                    where: {
                        forum_posts: {
                            author_id: postRecord.author_id,
                        },
                    },
                }),
            ]);

        return {
            id: postRecord.id,
            title: postRecord.title,
            content: postRecord.content,
            created_at: postRecord.created_at?.toISOString() ?? "",
            updated_at: postRecord.updated_at?.toISOString() ?? "",
            category_name: postRecord.forum_categories.name,
            category_slug: postRecord.forum_categories.slug,
            author_name: postRecord.users.name,
            author_avatar: postRecord.users.avatar_url,
            author_id: postRecord.users.id,
            reply_count: postRecord.forum_comments.length,
            like_count: postRecord.forum_likes.length,
            view_count: postRecord.forum_views.length,
            tags: postRecord.forum_post_tags.map((t: { tag: string }) => t.tag),
            author_post_count,
            author_total_likes,
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
        // Determine if the provided id is a UUID or a category slug
        const isUUID =
            /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
                postId
            );

        let actualPostId: string | null = postId;

        if (!isUUID) {
            // Treat it as a category slug and fetch the latest post in that category
            const latestPost = await prisma.forum_posts.findFirst({
                where: {
                    status: "active",
                    forum_categories: {
                        slug: postId,
                    },
                },
                orderBy: { created_at: "desc" },
                select: { id: true },
            });
            if (!latestPost) {
                return [];
            }
            actualPostId = latestPost.id;
        }

        // Fetch comments for the resolved post id
        const comments = await prisma.forum_comments.findMany({
            where: { post_id: actualPostId },
            orderBy: { created_at: "asc" },
            include: {
                users: {
                    select: {
                        name: true,
                        avatar_url: true,
                        id: true,
                    },
                },
            },
        });

        return comments.map((comment) => ({
            id: comment.id,
            content: comment.content,
            created_at: comment.created_at?.toISOString() ?? "",
            author_name: comment.users.name,
            author_avatar: comment.users.avatar_url,
            author_id: comment.users.id,
            like_count: comment.like_count,
            dislike_count: comment.dislike_count,
        }));
    } catch (error) {
        console.error("Error fetching forum comments:", error);
        return [];
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
        // Insert the comment into forum_comments table using Prisma
        const comment = await prisma.forum_comments.create({
            data: {
                content,
                post_id: postId,
                author_id: authorId,
            },
            select: {
                id: true,
            },
        });

        const commentId = comment.id;

        // Send notification
        await sendForumReplyNotification(postId, commentId, authorId);

        // Revalidate the thread page to show the new comment
        revalidatePath(`/forum/${postId}`);
        revalidatePath("/forum");

        return { success: true, commentId };
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
        // Check if a like already exists
        const actualId = extractUUID(postId);
        const existing = await prisma.forum_likes.findFirst({
            where: { post_id: actualId, user_id: userId },
            select: { id: true },
        });

        if (existing) {
            // Unlike – remove record
            await prisma.forum_likes.delete({ where: { id: existing.id } });

            revalidatePath(`/forum/${postId}`);
            revalidatePath("/forum");

            const likeCount = await prisma.forum_likes.count({
                where: { post_id: actualId },
            });

            return { success: true, action: "unliked", newCount: likeCount };
        }

        // Like – create new record
        await prisma.forum_likes.create({
            data: { post_id: actualId, user_id: userId },
        });

        revalidatePath(`/forum/${postId}`);
        revalidatePath("/forum");

        const likeCount = await prisma.forum_likes.count({
            where: { post_id: actualId },
        });

        return { success: true, action: "liked", newCount: likeCount };
    } catch (error) {
        console.error("Error toggling forum like:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
}

export async function checkUserLikeStatus(
    postId: string,
    userId: string
): Promise<{ hasLiked: boolean }> {
    try {
        const actualId = extractUUID(postId);
        const record = await prisma.forum_likes.findFirst({
            where: { post_id: actualId, user_id: userId },
            select: { id: true },
        });
        return { hasLiked: !!record };
    } catch (error) {
        console.error("Error checking user like status:", error);
        return { hasLiked: false };
    }
}

export async function getForumStats() {
    try {
        // Calculate midnight for the current day in the server timezone
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        const [totalThreads, totalComments, newToday] =
            await prisma.$transaction([
                prisma.forum_posts.count({
                    where: {
                        status: "active",
                    },
                }),
                prisma.forum_comments.count(),
                prisma.forum_posts.count({
                    where: {
                        status: "active",
                        created_at: {
                            gte: todayStart,
                        },
                    },
                }),
            ]);

        return {
            totalThreads,
            totalPosts: totalThreads + totalComments,
            newToday,
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
        // Get post counts per author
        const postCounts = await prisma.forum_posts.groupBy({
            by: ["author_id"],
            _count: { _all: true },
        });

        // Get comment counts per author
        const commentCounts = await prisma.forum_comments.groupBy({
            by: ["author_id"],
            _count: { _all: true },
        });

        // Merge counts into a single map<userId, count>
        const contributionMap = new Map<string, number>();

        postCounts.forEach((pc) => {
            contributionMap.set(pc.author_id, pc._count._all);
        });

        commentCounts.forEach((cc) => {
            contributionMap.set(
                cc.author_id,
                (contributionMap.get(cc.author_id) || 0) + cc._count._all
            );
        });

        // Sort by total contributions desc and take top 3
        const topEntries = Array.from(contributionMap.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3);

        if (topEntries.length === 0) return [];

        const userIds = topEntries.map(([id]) => id);
        const users = await prisma.users.findMany({
            where: { id: { in: userIds } },
            select: {
                id: true,
                name: true,
                avatar_url: true,
            },
        });

        // Build response preserving ranking order
        return topEntries.map(([id, count]) => {
            const user = users.find((u) => u.id === id);
            return {
                id,
                name: user?.name || "Unknown",
                avatar_url: user?.avatar_url || null,
                post_count: count,
            } as TopContributor;
        });
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
        // Perform all checks and updates atomically
        const result = await prisma.$transaction(async (tx) => {
            // Check if the user already up-voted this comment
            const existingUpvote = await tx.comment_votes.findFirst({
                where: {
                    comment_id: commentId,
                    user_id: userId,
                    action_type: "upvote",
                },
                select: { id: true },
            });

            if (existingUpvote) {
                // User is un-liking ⇒ remove the vote & decrement like_count
                await tx.comment_votes.delete({
                    where: { id: existingUpvote.id },
                });
                await tx.forum_comments.update({
                    where: { id: commentId },
                    data: { like_count: { decrement: 1 } },
                });

                const { like_count } =
                    await tx.forum_comments.findUniqueOrThrow({
                        where: { id: commentId },
                        select: { like_count: true },
                    });

                return { action: "unliked" as const, newCount: like_count };
            }

            // If the user previously down-voted, remove that downvote first
            const existingDownvote = await tx.comment_votes.findFirst({
                where: {
                    comment_id: commentId,
                    user_id: userId,
                    action_type: "downvote",
                },
                select: { id: true },
            });
            if (existingDownvote) {
                await tx.comment_votes.delete({
                    where: { id: existingDownvote.id },
                });
                await tx.forum_comments.update({
                    where: { id: commentId },
                    data: { dislike_count: { decrement: 1 } },
                });
            }

            // Add the up-vote & increment like_count
            await tx.comment_votes.create({
                data: {
                    comment_id: commentId,
                    user_id: userId,
                    action_type: "upvote",
                },
            });
            await tx.forum_comments.update({
                where: { id: commentId },
                data: { like_count: { increment: 1 } },
            });

            const { like_count } = await tx.forum_comments.findUniqueOrThrow({
                where: { id: commentId },
                select: { like_count: true },
            });

            return { action: "liked" as const, newCount: like_count };
        });

        // Revalidate paths so UI updates
        revalidatePath(`/forum/${commentId}`);
        revalidatePath("/forum");

        return {
            success: true,
            action: result.action,
            newCount: result.newCount,
        };
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
        const uuidRegex =
            /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;
        const uuidMatch = postId.match(uuidRegex);
        const actualPostId = uuidMatch ? uuidMatch[0] : postId;

        const related = await prisma.forum_posts.findMany({
            where: {
                status: "active",
                id: { not: actualPostId },
                forum_categories: {
                    slug: category,
                },
            },
            orderBy: { created_at: "desc" },
            take: limit,
            include: {
                forum_categories: { select: { name: true, slug: true } },
                users: { select: { name: true, avatar_url: true, id: true } },
                forum_comments: { select: { id: true } },
                forum_likes: { select: { id: true } },
                forum_views: { select: { id: true } },
                forum_post_tags: { select: { tag: true } },
            },
        });

        return related.map((post) => ({
            id: post.id,
            title: post.title,
            content: post.content,
            created_at: post.created_at?.toISOString() ?? "",
            updated_at: post.updated_at?.toISOString() ?? "",
            category_name: post.forum_categories.name,
            category_slug: post.forum_categories.slug,
            author_name: post.users.name,
            author_avatar: post.users.avatar_url,
            author_id: post.users.id,
            reply_count: post.forum_comments.length,
            like_count: post.forum_likes.length,
            view_count: post.forum_views.length,
            tags: post.forum_post_tags.map((t: { tag: string }) => t.tag),
            author_post_count: 0, // Not needed for related list
            author_total_likes: 0,
        }));
    } catch (error) {
        console.error("Error fetching related posts:", error);
        return [];
    }
}

export async function checkUserSaveStatus(postId: string, userId: string) {
    try {
        const actualId = extractUUID(postId);
        const record = await prisma.forum_saved.findFirst({
            where: { post_id: actualId, user_id: userId },
            select: { id: true },
        });
        return !!record;
    } catch (error) {
        console.error("Error checking user save status:", error);
        return false;
    }
}

export async function toggleForumSave(postId: string, userId: string) {
    try {
        const actualId = extractUUID(postId);
        const existing = await prisma.forum_saved.findFirst({
            where: { post_id: actualId, user_id: userId },
            select: { id: true },
        });

        if (existing) {
            // Unsave
            await prisma.forum_saved.delete({ where: { id: existing.id } });

            revalidatePath(`/forum/${postId}`);
            revalidatePath("/forum");

            return { success: true, action: "unsaved" };
        }

        // Save
        await prisma.forum_saved.create({
            data: { post_id: actualId, user_id: userId },
        });

        revalidatePath(`/forum/${postId}`);
        revalidatePath("/forum");

        return { success: true, action: "saved" };
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
        const record = await prisma.comment_votes.findFirst({
            where: { comment_id: commentId, user_id: userId },
            select: { action_type: true },
        });
        return {
            voteType: (record?.action_type as "upvote" | "downvote") ?? null,
        };
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
        // Check for existing vote
        const existing = await prisma.comment_votes.findFirst({
            where: { comment_id: commentId, user_id: userId },
            select: { id: true, action_type: true },
        });

        if (existing) {
            if (existing.action_type === voteType) {
                // Remove vote
                await prisma.comment_votes.delete({
                    where: { id: existing.id },
                });

                const updatedCounts = await getCommentVoteCounts(commentId);
                return { success: true, action: "removed", ...updatedCounts };
            }

            // Change vote type
            await prisma.comment_votes.update({
                where: { id: existing.id },
                data: { action_type: voteType, updated_at: new Date() },
            });

            const updatedCounts = await getCommentVoteCounts(commentId);
            return { success: true, action: "changed", ...updatedCounts };
        }

        // Add new vote
        await prisma.comment_votes.create({
            data: {
                comment_id: commentId,
                user_id: userId,
                action_type: voteType,
            },
        });

        const updatedCounts = await getCommentVoteCounts(commentId);
        return { success: true, action: "added", ...updatedCounts };
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
    const actualId = extractUUID(commentId);
    const comment = await prisma.forum_comments.findUnique({
        where: { id: actualId },
        select: { like_count: true, dislike_count: true },
    });
    return {
        likeCount: comment?.like_count ?? 0,
        dislikeCount: comment?.dislike_count ?? 0,
    };
}

export async function getUserSavedPosts(
    userId: string
): Promise<ForumPostResponse[]> {
    try {
        const saved = await prisma.forum_saved.findMany({
            where: { user_id: userId },
            orderBy: { created_at: "desc" },
            include: {
                forum_posts: {
                    include: {
                        users: {
                            select: { name: true, avatar_url: true, id: true },
                        },
                        forum_categories: {
                            select: { name: true, slug: true },
                        },
                        forum_comments: { select: { id: true } },
                        forum_likes: { select: { id: true } },
                        forum_views: { select: { id: true } },
                        forum_post_tags: { select: { tag: true } },
                    },
                },
            },
        });

        return saved.map((s) => {
            const post = s.forum_posts;
            return {
                id: post.id,
                title: post.title,
                content: post.content,
                created_at:
                    post.created_at?.toISOString() ?? new Date().toISOString(),
                updated_at:
                    post.updated_at?.toISOString() ?? new Date().toISOString(),
                category_name: post.forum_categories.name,
                category_slug: post.forum_categories.slug,
                author_name: post.users.name,
                author_avatar: post.users.avatar_url,
                author_id: post.users.id,
                reply_count: post.forum_comments.length,
                like_count: post.forum_likes.length,
                view_count: post.forum_views.length,
                tags: post.forum_post_tags.map((t: { tag: string }) => t.tag),
                author_post_count: 0,
                author_total_likes: 0,
                // Timestamp of when the user saved the post (used on /forum/saved page)
                saved_at:
                    s.created_at?.toISOString() ?? new Date().toISOString(),
            } as ForumPostResponse;
        });
    } catch (error) {
        console.error("Error in getUserSavedPosts:", error);
        throw error;
    }
}
