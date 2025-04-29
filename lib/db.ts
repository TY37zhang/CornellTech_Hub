import { neon } from "@neondatabase/serverless";

if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set in environment variables");
}

export const sql = neon(process.env.DATABASE_URL);

let isConnected = false;

export async function isDatabaseConnected() {
    if (isConnected) return true;

    try {
        // Try a simple query to test the connection
        await sql`SELECT 1`;
        isConnected = true;
        return true;
    } catch (error) {
        console.error("Database connection error:", error);
        isConnected = false;
        return false;
    }
}

export async function testDatabaseConnection() {
    try {
        await sql`SELECT 1`;
        console.log("Database connection successful");
        return true;
    } catch (error) {
        console.error("Database connection test failed:", error);
        return false;
    }
}
