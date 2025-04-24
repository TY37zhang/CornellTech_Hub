import { neon } from "@neondatabase/serverless";
import { Pool } from "@neondatabase/serverless";

// Create a connection pool
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: true,
});

// Create a serverless connection
const sql = neon(process.env.DATABASE_URL!);

export { pool, sql };
