/**
 * Production hardening: REVOKE UPDATE and DELETE on ai_decision_log.
 * This enforces the append-only guarantee at the DB level,
 * not just application convention.
 *
 * NOTE: This revokes from the 'postgres' role used by the app.
 * In production, use a dedicated app role instead.
 */
import dotenv from "dotenv";
import pg from "pg";

dotenv.config({ path: ".env.local" });

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

async function main() {
  try {
    // Get current user (role) the app connects as
    const whoami = await pool.query("SELECT current_user");
    const appRole = whoami.rows[0].current_user;

    console.log(`Current DB role: ${appRole}`);
    console.log(
      "\n⚠️  Revoking UPDATE and DELETE on ai_decision_log..."
    );
    console.log(
      "   This makes the audit log truly append-only at the database level."
    );
    console.log(
      "   To undo (for testing): GRANT UPDATE, DELETE ON ai_decision_log TO postgres;\n"
    );

    await pool.query(
      `REVOKE UPDATE, DELETE ON ai_decision_log FROM ${appRole}`
    );

    console.log(`✓ REVOKE UPDATE, DELETE ON ai_decision_log FROM ${appRole}`);
    console.log("\nThe audit log is now tamper-resistant at the DB level.");
    console.log(
      "Any attempt to UPDATE or DELETE rows will fail with a permission error."
    );
  } catch (err) {
    console.error("✗ Hardening failed:", err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
