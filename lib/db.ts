import { neon, neonConfig } from "@neondatabase/serverless";
import { Pool } from "@neondatabase/serverless";

if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set in environment variables");
}

// Configure Neon with more reliable settings
neonConfig.fetchConnectionCache = true;
neonConfig.wsProxy = (host) => `${host}:5432/v1`;
neonConfig.useSecureWebSocket = true;
neonConfig.pipelineTLS = true;
neonConfig.pipelineConnect = false;
neonConfig.debug = process.env.NODE_ENV === "development";
neonConfig.connectionTimeout = 10000;
neonConfig.keepAlive = true;
neonConfig.keepAliveInterval = 30000;

// Create a connection pool with more reliable settings
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
    maxUses: 7500,
    ssl: {
        rejectUnauthorized: false, // Required for Neon's SSL connection
    },
});

// Create a serverless connection with SSL
export const sql = neon(process.env.DATABASE_URL, {
    ssl: {
        rejectUnauthorized: false,
    },
});

let isConnected = false;
let connectionAttempts = 0;
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

export async function isDatabaseConnected() {
    if (isConnected) return true;

    try {
        await sql`SELECT 1`;
        isConnected = true;
        connectionAttempts = 0;
        return true;
    } catch (error) {
        console.error("Database connection error:", {
            error,
            message: error instanceof Error ? error.message : "Unknown error",
            code: (error as any).code,
        });
        isConnected = false;
        return false;
    }
}

export async function testDatabaseConnection() {
    try {
        const client = await pool.connect();
        try {
            await client.query("SELECT 1");
            return true;
        } finally {
            client.release();
        }
    } catch (error) {
        console.error("Database connection test failed:", {
            error,
            message: error instanceof Error ? error.message : "Unknown error",
            code: (error as any).code,
        });
        return false;
    }
}

export async function executeQuery<T>(
    query: string,
    params: any[] = []
): Promise<T[]> {
    if (params && params.some((p) => p === undefined)) {
        throw new Error(
            `SQL query parameter is undefined. Query: ${query}, Params: ${JSON.stringify(params)}`
        );
    }
    let retries = 0;
    let lastError: unknown;

    while (retries < MAX_RETRIES) {
        try {
            // Try serverless connection first
            try {
                const result = await sql(query, params);
                return result as T[];
            } catch (serverlessError) {
                console.log("Serverless query failed, falling back to pool:", {
                    error: serverlessError,
                    message:
                        serverlessError instanceof Error
                            ? serverlessError.message
                            : "Unknown error",
                    code: (serverlessError as any).code,
                });

                // Fall back to pool connection
                const client = await pool.connect();
                try {
                    const result = await client.query(query, params);
                    return result.rows as T[];
                } finally {
                    client.release();
                }
            }
        } catch (error) {
            lastError = error;
            retries++;
            console.error(
                `Query execution failed (attempt ${retries}/${MAX_RETRIES}):`,
                {
                    error,
                    message:
                        error instanceof Error
                            ? error.message
                            : "Unknown error",
                    code: (error as any).code,
                    query,
                    params,
                }
            );

            if (retries === MAX_RETRIES) {
                throw new Error(
                    `Failed to execute query after ${MAX_RETRIES} attempts: ${
                        lastError instanceof Error
                            ? lastError.message
                            : "Unknown error"
                    }`
                );
            }

            // Exponential backoff with jitter
            const delay =
                RETRY_DELAY * Math.pow(2, retries - 1) * (0.5 + Math.random());
            await new Promise((resolve) => setTimeout(resolve, delay));
        }
    }

    throw new Error("Query execution failed after all retries");
}

// Graceful shutdown
process.on("SIGINT", async () => {
    try {
        await pool.end();
        console.log("Database pool has ended");
        process.exit(0);
    } catch (err) {
        console.error("Error during pool shutdown:", err);
        process.exit(1);
    }
});
