import { neon } from "@neondatabase/serverless";
import { prisma } from "@/lib/db/prisma";

if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set in environment variables");
}

export const sql = neon(process.env.DATABASE_URL);

let isConnected = false;

export async function isDatabaseConnected() {
    if (isConnected) return true;

    try {
        // Use Prisma to test the connection for consistency
        await prisma.$queryRaw`SELECT 1`;
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
        // Use Prisma to test the connection for consistency
        await prisma.$queryRaw`SELECT 1`;
        return true;
    } catch (error) {
        console.error("Prisma database connection test failed:", error);
        return false;
    }
}
