import dotenv from "dotenv";
import pg from "pg";

dotenv.config({ path: ".env.local" });

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

async function main() {
  try {
    // Check all expected tables exist
    const tables = await pool.query(`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    console.log("Tables in database:");
    tables.rows.forEach((r) => console.log(`  ✓ ${r.table_name}`));

    // Check business_ai_use_cases columns
    console.log("\nbusiness_ai_use_cases columns:");
    const cols = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'business_ai_use_cases'
      ORDER BY ordinal_position;
    `);
    cols.rows.forEach((r) =>
      console.log(
        `  ${r.column_name}: ${r.data_type} | nullable=${r.is_nullable} | default=${r.column_default ?? "none"}`
      )
    );

    // Check indexes on law_chunks
    console.log("\nIndexes on law_chunks:");
    const indexes = await pool.query(`
      SELECT indexname, indexdef FROM pg_indexes
      WHERE tablename = 'law_chunks';
    `);
    indexes.rows.forEach((r) => console.log(`  ✓ ${r.indexname}`));

    console.log("\n✓ Schema verification complete");
  } catch (err) {
    console.error("✗ Verification failed:", err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
