/**
 * Run after drizzle-kit push to add HNSW indexes that Drizzle ORM
 * can't express natively (pgvector cosine similarity indexes).
 */
import dotenv from "dotenv";
import pg from "pg";

dotenv.config({ path: ".env.local" });

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

async function main() {
  try {
    // HNSW index on law_chunks.embedding for cosine similarity search
    await pool.query(`
      CREATE INDEX IF NOT EXISTS law_chunks_embedding_hnsw_idx
      ON law_chunks
      USING hnsw (embedding vector_cosine_ops)
      WITH (m = 16, ef_construction = 64);
    `);
    console.log("✓ HNSW index created on law_chunks.embedding");

    // HNSW index on business_ai_use_cases.embedding (for potential reverse lookups)
    await pool.query(`
      CREATE INDEX IF NOT EXISTS business_ai_use_cases_embedding_hnsw_idx
      ON business_ai_use_cases
      USING hnsw (embedding vector_cosine_ops)
      WITH (m = 16, ef_construction = 64);
    `);
    console.log("✓ HNSW index created on business_ai_use_cases.embedding");

    console.log("\n✓ All post-migration indexes applied");
  } catch (err) {
    console.error("✗ Post-migration failed:", err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
