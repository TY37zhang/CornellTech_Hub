"use server";

import { sql } from "@/lib/db";
import { revalidatePath } from "next/cache";

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
