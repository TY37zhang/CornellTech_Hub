import { pool, sql } from "./config";

// Type for database query result
export type QueryResult<T> = {
    rows: T[];
    rowCount: number;
};

// Execute a query using the connection pool
export async function executeQuery<T>(
    query: string,
    params?: any[]
): Promise<QueryResult<T>> {
    let client;
    try {
        client = await pool.connect();
        const result = await client.query(query, params);
        return result;
    } catch (error) {
        console.error("Database query error:", error);
        if (error.code === "ECONNREFUSED") {
            throw new Error(
                "Database connection refused. Please try again later."
            );
        } else if (error.code === "ETIMEDOUT") {
            throw new Error("Database connection timed out. Please try again.");
        }
        throw error;
    } finally {
        if (client) {
            client.release();
        }
    }
}

// Execute a query using the serverless connection
export async function executeServerlessQuery<T>(
    query: string,
    params?: any[]
): Promise<T[]> {
    try {
        const result = await sql(query, params);
        return result;
    } catch (error) {
        console.error("Serverless query error:", error);
        if (error.code === "ECONNREFUSED") {
            throw new Error(
                "Database connection refused. Please try again later."
            );
        } else if (error.code === "ETIMEDOUT") {
            throw new Error("Database connection timed out. Please try again.");
        }
        throw error;
    }
}

// Helper function to safely escape values for SQL queries
export function escapeValue(value: any): string {
    if (value === null) return "NULL";
    if (typeof value === "number") return value.toString();
    if (typeof value === "boolean") return value.toString();
    return `'${value.toString().replace(/'/g, "''")}'`;
}

// Helper function to build WHERE clause
export function buildWhereClause(conditions: Record<string, any>): string {
    const clauses = Object.entries(conditions)
        .map(([key, value]) => `${key} = ${escapeValue(value)}`)
        .join(" AND ");
    return clauses ? `WHERE ${clauses}` : "";
}
