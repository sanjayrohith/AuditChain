import crypto from "crypto";
import { pool } from "@/db";

const GENESIS_HASH = "0".repeat(64);

/**
 * Canonical JSON serialization: sorted keys, no extra whitespace.
 */
function canonicalize(obj: Record<string, unknown>): string {
  return JSON.stringify(obj, Object.keys(obj).sort());
}

/**
 * Compute sha256(prevHash + canonicalPayload).
 */
function computeHash(prevHash: string, payload: Record<string, unknown>): string {
  const data = prevHash + canonicalize(payload);
  return crypto.createHash("sha256").update(data).digest("hex");
}

export interface LogDecisionInput {
  orgId: string;
  decisionType: string;
  inputSummary: string;
  outputSummary: string;
  justification?: string;
  actor: string;
}

/**
 * Append a new entry to the tamper-evident audit log.
 * Fetches the previous hash (or GENESIS_HASH if first entry),
 * computes the new row_hash, and inserts.
 */
export async function logDecision(input: LogDecisionInput): Promise<{ id: string; rowHash: string }> {
  // Get the last row's hash for this org
  const lastResult = await pool.query(
    `SELECT row_hash FROM ai_decision_log WHERE org_id = $1 ORDER BY created_at DESC LIMIT 1`,
    [input.orgId]
  );
  const prevHash = lastResult.rows.length > 0 ? lastResult.rows[0].row_hash : GENESIS_HASH;

  // Build payload for hashing (excludes prevHash and rowHash themselves)
  const payload: Record<string, unknown> = {
    org_id: input.orgId,
    decision_type: input.decisionType,
    input_summary: input.inputSummary,
    output_summary: input.outputSummary,
    actor: input.actor,
  };
  if (input.justification) {
    payload.justification = input.justification;
  }

  const rowHash = computeHash(prevHash, payload);

  const insertResult = await pool.query(
    `INSERT INTO ai_decision_log (org_id, decision_type, input_summary, output_summary, justification, actor, prev_hash, row_hash)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING id`,
    [
      input.orgId,
      input.decisionType,
      input.inputSummary,
      input.outputSummary,
      input.justification ?? null,
      input.actor,
      prevHash,
      rowHash,
    ]
  );

  return { id: insertResult.rows[0].id, rowHash };
}

/**
 * Verify the entire audit chain for an org.
 * Refetches all entries in order, recomputes every hash, and checks continuity.
 */
export async function verifyChain(orgId: string): Promise<{
  ok: boolean;
  total: number;
  brokenAtIndex?: number;
}> {
  const result = await pool.query(
    `SELECT id, org_id, decision_type, input_summary, output_summary, justification, actor, prev_hash, row_hash, created_at
     FROM ai_decision_log
     WHERE org_id = $1
     ORDER BY created_at ASC`,
    [orgId]
  );

  const rows = result.rows;
  if (rows.length === 0) {
    return { ok: true, total: 0 };
  }

  let expectedPrevHash = GENESIS_HASH;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];

    // Check prev_hash matches expected
    if (row.prev_hash !== expectedPrevHash) {
      return { ok: false, total: rows.length, brokenAtIndex: i };
    }

    // Recompute row_hash
    const payload: Record<string, unknown> = {
      org_id: row.org_id,
      decision_type: row.decision_type,
      input_summary: row.input_summary,
      output_summary: row.output_summary,
      actor: row.actor,
    };
    if (row.justification) {
      payload.justification = row.justification;
    }

    const expectedRowHash = computeHash(expectedPrevHash, payload);
    if (row.row_hash !== expectedRowHash) {
      return { ok: false, total: rows.length, brokenAtIndex: i };
    }

    expectedPrevHash = row.row_hash;
  }

  return { ok: true, total: rows.length };
}
