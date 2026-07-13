import dotenv from "dotenv";
import pg from "pg";

dotenv.config({ path: ".env.local" });

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

async function main() {
  try {
    const result = await pool.query("SELECT 1 AS ok");
    console.log("✓ Database connection successful:", result.rows[0]);

    // Check if pgvector extension is available
    const extResult = await pool.query(
      "SELECT * FROM pg_available_extensions WHERE name = 'vector'"
    );
    if (extResult.rows.length > 0) {
      console.log("✓ pgvector extension available");
    } else {
      console.log("✗ pgvector extension NOT available");
    }

    // Check if pgcrypto extension is available
    const cryptoResult = await pool.query(
      "SELECT * FROM pg_available_extensions WHERE name = 'pgcrypto'"
    );
    if (cryptoResult.rows.length > 0) {
      console.log("✓ pgcrypto extension available");
    } else {
      console.log("✗ pgcrypto extension NOT available");
    }
  } catch (err) {
    console.error("✗ Database connection failed:", err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
