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
    try {
        const result = await pool.query(query, params);
        return result;
    } catch (error) {
        throw error;
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
