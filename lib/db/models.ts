import { prisma } from "./prisma";

// Import Prisma-generated types for better type safety
import type {
    users as PrismaUser,
    forum_posts as PrismaForumPost,
    forum_comments as PrismaForumComment,
} from "@prisma/client";

// Preserve previous type names for external imports
export type User = PrismaUser;
export type ForumPost = PrismaForumPost;
export type ForumComment = PrismaForumComment;

// User operations implemented with Prisma
export const userOperations = {
    create: (
        user: Omit<User, "id" | "created_at" | "updated_at">
    ): Promise<User> =>
        prisma.users.create({
            data: {
                email: user.email,
                name: user.name,
                avatar_url: user.avatar_url,
            },
        }),

    findById: (id: string): Promise<User | null> =>
        prisma.users.findUnique({ where: { id } }),

    findByEmail: (email: string): Promise<User | null> =>
        prisma.users.findUnique({ where: { email } }),
};

// Forum operations implemented with Prisma
export const forumOperations = {
    createPost: (
        post: Omit<ForumPost, "id" | "created_at" | "updated_at">
    ): Promise<ForumPost> =>
        prisma.forum_posts.create({
            data: {
                title: post.title,
                content: post.content,
                author_id: post.author_id,
                category_id: post.category_id,
                status: post.status,
            },
        }),

    createComment: (
        comment: Omit<ForumComment, "id" | "created_at" | "updated_at">
    ): Promise<ForumComment> =>
        prisma.forum_comments.create({
            data: {
                content: comment.content,
                post_id: comment.post_id,
                author_id: comment.author_id,
                parent_id: comment.parent_id,
            },
        }),

    getPostsByCategory: (
        categoryId: string,
        limit = 10,
        offset = 0
    ): Promise<ForumPost[]> =>
        prisma.forum_posts.findMany({
            where: { category_id: categoryId, status: "active" },
            orderBy: { created_at: "desc" },
            take: limit,
            skip: offset,
        }),

    getCommentsByPost: (postId: string): Promise<ForumComment[]> =>
        prisma.forum_comments.findMany({
            where: { post_id: postId },
            orderBy: { created_at: "asc" },
        }),
};
