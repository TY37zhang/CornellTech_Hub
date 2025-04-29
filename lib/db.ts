import { PrismaClient } from "@prisma/client";

declare global {
    var prisma: PrismaClient | undefined;
}

let prisma: PrismaClient;

if (process.env.NODE_ENV === "production") {
    console.log("Initializing Prisma client in production mode");
    prisma = new PrismaClient({
        log: ["error", "warn"],
        errorFormat: "pretty",
    });
} else {
    console.log("Initializing Prisma client in development mode");
    if (!global.prisma) {
        console.log("Creating new Prisma instance");
        global.prisma = new PrismaClient({
            log: ["query", "error", "warn"],
            errorFormat: "pretty",
        });
    } else {
        console.log("Reusing existing Prisma instance");
    }
    prisma = global.prisma;
}

// Add connection state tracking
let isConnected = false;

export const db = prisma;

// Test the database connection and retry if needed
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

async function connectWithRetry(retries = MAX_RETRIES): Promise<void> {
    try {
        if (!isConnected) {
            console.log("Testing database connection...");
            // Test the connection with a simple query
            await db.$queryRaw`SELECT 1`;
            isConnected = true;
            console.log("Successfully connected to the database");
        }
    } catch (error) {
        console.error(
            `Failed to connect to the database (attempts left: ${retries}):`,
            error
        );
        if (retries > 0) {
            console.log(`Retrying in ${RETRY_DELAY}ms...`);
            await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
            return connectWithRetry(retries - 1);
        } else {
            console.error(
                "Max retries reached. Could not connect to database."
            );
            throw error;
        }
    }
}

// Initialize connection
connectWithRetry().catch((error) => {
    console.error("Fatal database connection error:", error);
    // Don't exit the process in development mode
    if (process.env.NODE_ENV === "production") {
        process.exit(1);
    }
});

// Handle cleanup
process.on("beforeExit", async () => {
    if (isConnected) {
        await db.$disconnect();
        isConnected = false;
        console.log("Database connection closed");
    }
});

// Export connection check function
export function isDatabaseConnected() {
    return isConnected;
}

// Add function to test database connection
export async function testDatabaseConnection() {
    try {
        console.log("Testing database connection...");
        const result =
            await db.$queryRaw`SELECT current_database(), current_user, version()`;
        console.log("Database connection test result:", result);
        return true;
    } catch (error) {
        console.error("Database connection test failed:", error);
        return false;
    }
}
