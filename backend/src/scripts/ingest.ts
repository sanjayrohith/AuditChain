/**
 * Law corpus ingestion script.
 * Truncates and reloads jurisdictions + law_chunks from data/laws/*.json,
 * embedding each chunk via the AI seam.
 *
 * Usage: pnpm ingest
 */
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import fs from "fs";
import path from "path";
import pg from "pg";
import { embed } from "../ai/local";

interface LawFile {
  state: string;
  law_name: string;
  citation: string;
  effective_date: string;
  summary: string;
  applies_to_industries: string[];
  chunks: string[];
}

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

async function main() {
  const dataDir = path.resolve(process.cwd(), "data/laws");
  const files = fs.readdirSync(dataDir).filter((f) => f.endsWith(".json"));

  console.log(`Found ${files.length} law files to ingest.\n`);

  // Truncate existing data (matched_rules references law_chunks, so cascade)
  console.log("Truncating existing jurisdiction and law_chunk data...");
  await pool.query("DELETE FROM matched_rules");
  await pool.query("DELETE FROM law_chunks");
  await pool.query("DELETE FROM jurisdictions");
  console.log("✓ Tables cleared.\n");

  let totalChunks = 0;

  for (const file of files) {
    const filePath = path.join(dataDir, file);
    const raw = fs.readFileSync(filePath, "utf-8");
    const law: LawFile = JSON.parse(raw);

    console.log(`Processing: ${law.law_name} (${law.state})`);

    // Insert jurisdiction
    const jurisdictionResult = await pool.query(
      `INSERT INTO jurisdictions (state, law_name, citation, effective_date, summary, applies_to_industries)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id`,
      [
        law.state,
        law.law_name,
        law.citation,
        law.effective_date,
        law.summary,
        law.applies_to_industries,
      ]
    );
    const jurisdictionId = jurisdictionResult.rows[0].id;

    // Embed and insert each chunk
    for (let i = 0; i < law.chunks.length; i++) {
      const chunkText = law.chunks[i];
      console.log(`  Embedding chunk ${i + 1}/${law.chunks.length}...`);

      const embedding = await embed(chunkText);

      await pool.query(
        `INSERT INTO law_chunks (jurisdiction_id, chunk_text, chunk_index, embedding)
         VALUES ($1, $2, $3, $4)`,
        [jurisdictionId, chunkText, i, `[${embedding.join(",")}]`]
      );

      totalChunks++;
    }

    console.log(`  ✓ ${law.chunks.length} chunks ingested.\n`);
  }

  // Verify
  const countResult = await pool.query("SELECT count(*) FROM law_chunks");
  const count = parseInt(countResult.rows[0].count, 10);

  console.log(`\n═══════════════════════════════════════`);
  console.log(`Total law chunks ingested: ${count}`);
  console.log(`Expected: ${totalChunks}`);
  console.log(`Match: ${count === totalChunks ? "✓ YES" : "✗ NO"}`);
  console.log(`═══════════════════════════════════════`);

  // Verify embeddings are non-null
  const nullCheck = await pool.query(
    "SELECT count(*) FROM law_chunks WHERE embedding IS NULL"
  );
  const nullCount = parseInt(nullCheck.rows[0].count, 10);
  console.log(`Null embeddings: ${nullCount} (should be 0)`);

  if (count > 0 && nullCount === 0) {
    console.log("\n✓ Phase 3 acceptance criteria met!");
  } else {
    console.log("\n✗ Acceptance criteria NOT met.");
    process.exit(1);
  }

  await pool.end();
}

main().catch((err) => {
  console.error("✗ Ingestion failed:", err);
  process.exit(1);
});
