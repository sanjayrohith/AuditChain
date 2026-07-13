import dotenv from "dotenv";
import pg from "pg";

dotenv.config({ path: ".env.local" });

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

async function main() {
  try {
    await pool.query("CREATE EXTENSION IF NOT EXISTS vector");
    console.log("✓ pgvector extension enabled");

    await pool.query("CREATE EXTENSION IF NOT EXISTS pgcrypto");
    console.log("✓ pgcrypto extension enabled");
  } catch (err) {
    console.error("✗ Failed to create extensions:", err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
