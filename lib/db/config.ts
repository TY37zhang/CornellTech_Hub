import { neon } from "@neondatabase/serverless";
import { Pool } from "@neondatabase/serverless";

if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set in environment variables");
}

// Create a connection pool for better performance
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

// Create a serverless connection for edge functions
const sql = neon(process.env.DATABASE_URL);

export { pool, sql };
