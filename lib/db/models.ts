import { executeQuery, executeServerlessQuery } from "./utils";

// Type definitions
export interface User {
    id: string;
    email: string;
    name: string;
    avatar_url: string | null;
    created_at: Date;
    updated_at: Date;
}

export interface ForumCategory {
    id: string;
    name: string;
    description: string | null;
    slug: string;
    created_at: Date;
}

export interface ForumPost {
    id: string;
    title: string;
    content: string;
    author_id: string;
    category_id: string;
    status: string;
    created_at: Date;
    updated_at: Date;
}

export interface ForumComment {
    id: string;
    content: string;
    post_id: string;
    author_id: string;
    parent_id: string | null;
    created_at: Date;
    updated_at: Date;
}

// User operations
export const userOperations = {
    async create(
        user: Omit<User, "id" | "created_at" | "updated_at">
    ): Promise<User> {
        const query = `
      INSERT INTO users (email, name, avatar_url)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
        const result = await executeQuery<User>(query, [
            user.email,
            user.name,
            user.avatar_url,
        ]);
        return result.rows[0];
    },

    async findById(id: string): Promise<User | null> {
        const query = "SELECT * FROM users WHERE id = $1";
        const result = await executeQuery<User>(query, [id]);
        return result.rows[0] || null;
    },

    async findByEmail(email: string): Promise<User | null> {
        const query = "SELECT * FROM users WHERE email = $1";
        const result = await executeQuery<User>(query, [email]);
        return result.rows[0] || null;
    },
};

// Forum operations
export const forumOperations = {
    async createPost(
        post: Omit<ForumPost, "id" | "created_at" | "updated_at">
    ): Promise<ForumPost> {
        const query = `
      INSERT INTO forum_posts (title, content, author_id, category_id, status)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
        const result = await executeQuery<ForumPost>(query, [
            post.title,
            post.content,
            post.author_id,
            post.category_id,
            post.status,
        ]);
        return result.rows[0];
    },

    async createComment(
        comment: Omit<ForumComment, "id" | "created_at" | "updated_at">
    ): Promise<ForumComment> {
        const query = `
      INSERT INTO forum_comments (content, post_id, author_id, parent_id)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
        const result = await executeQuery<ForumComment>(query, [
            comment.content,
            comment.post_id,
            comment.author_id,
            comment.parent_id,
        ]);
        return result.rows[0];
    },

    async getPostsByCategory(
        categoryId: string,
        limit = 10,
        offset = 0
    ): Promise<ForumPost[]> {
        const query = `
      SELECT * FROM forum_posts
      WHERE category_id = $1 AND status = 'active'
      ORDER BY created_at DESC
      LIMIT $2 OFFSET $3
    `;
        const result = await executeQuery<ForumPost>(query, [
            categoryId,
            limit,
            offset,
        ]);
        return result.rows;
    },

    async getCommentsByPost(postId: string): Promise<ForumComment[]> {
        const query = `
      SELECT * FROM forum_comments
      WHERE post_id = $1
      ORDER BY created_at ASC
    `;
        const result = await executeQuery<ForumComment>(query, [postId]);
        return result.rows;
    },
};
