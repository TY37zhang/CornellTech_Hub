import { neon } from "@neondatabase/serverless";

// Create a serverless connection for edge functions
const sql = neon(process.env.DATABASE_URL || "");

// This is a simplified version of a Prisma client
// In a real application, you would use the actual Prisma client
const prisma = {
    post: {
        findMany: async ({ where, orderBy, select }: any) => {
            try {
                // Map camelCase fields to snake_case database columns
                const fieldMapping: { [key: string]: string } = {
                    id: "fp.id",
                    title: "fp.title",
                    content: "fp.content",
                    createdAt: "fp.created_at",
                    category: "fc.name as category",
                    slug: "fc.slug",
                };

                const selectedFields = Object.keys(select)
                    .map((field) => fieldMapping[field])
                    .join(", ");

                let query = `
                    SELECT ${selectedFields}
                    FROM forum_posts fp
                    LEFT JOIN forum_categories fc ON fp.category_id = fc.id
                    LEFT JOIN users u ON fp.author_id = u.id
                `;

                const params: any[] = [];

                if (where) {
                    const conditions = [];
                    if (where.authorEmail) {
                        conditions.push(`u.email = $${params.length + 1}`);
                        params.push(where.authorEmail);
                    }
                    if (where.id) {
                        conditions.push(`fp.id = $${params.length + 1}`);
                        params.push(where.id);
                    }
                    // Add status condition to only get active posts
                    conditions.push("fp.status = 'active'");

                    if (conditions.length > 0) {
                        query += ` WHERE ${conditions.join(" AND ")}`;
                    }
                }

                if (orderBy) {
                    const orderMapping: { [key: string]: string } = {
                        createdAt: "fp.created_at",
                    };

                    const orderClauses = [];
                    for (const [field, direction] of Object.entries(orderBy)) {
                        const mappedField = orderMapping[field] || field;
                        orderClauses.push(`${mappedField} ${direction}`);
                    }
                    if (orderClauses.length > 0) {
                        query += ` ORDER BY ${orderClauses.join(", ")}`;
                    }
                }

                console.log("Executing query:", query, "with params:", params); // Debug query

                // Execute the query with parameters
                const result = await sql(query, params);

                // Transform the result to match the expected format
                return result.map((row: any) => ({
                    ...row,
                    createdAt: row.created_at, // Convert snake_case to camelCase
                }));
            } catch (error) {
                console.error("Error in prisma.post.findMany:", error);
                throw error;
            }
        },
        delete: async ({ where }: any) => {
            try {
                let query = `
                    UPDATE forum_posts
                    SET status = 'deleted'
                    WHERE id = $1
                `;

                const params = [where.id];

                console.log(
                    "Executing delete query:",
                    query,
                    "with params:",
                    params
                );

                // Execute the query with parameters
                await sql(query, params);

                return { success: true };
            } catch (error) {
                console.error("Error in prisma.post.delete:", error);
                throw error;
            }
        },
    },
};

export default prisma;
