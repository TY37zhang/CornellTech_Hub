import { neon } from "@neondatabase/serverless";
import { Pool } from "@neondatabase/serverless";

// Create a connection pool for better performance
const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
});

// Create a serverless connection for edge functions
const sql = neon(process.env.POSTGRES_URL!);

export { pool, sql };
