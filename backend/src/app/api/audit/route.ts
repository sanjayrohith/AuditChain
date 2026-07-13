import { NextResponse } from "next/server";
import { pool } from "@/db";
import { verifyChain } from "@/lib/hash";

/**
 * GET /api/audit?orgId=
 * Returns the full audit chain + verification result.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orgId = searchParams.get("orgId");

    if (!orgId) {
      return NextResponse.json(
        { error: "orgId query parameter is required" },
        { status: 400 }
      );
    }

    // Fetch all entries
    const result = await pool.query(
      `SELECT id, org_id, decision_type, input_summary, output_summary, justification, actor, prev_hash, row_hash, created_at
       FROM ai_decision_log
       WHERE org_id = $1
       ORDER BY created_at ASC`,
      [orgId]
    );

    const entries = result.rows.map((r) => ({
      id: r.id,
      orgId: r.org_id,
      decisionType: r.decision_type,
      inputSummary: r.input_summary,
      outputSummary: r.output_summary,
      justification: r.justification,
      actor: r.actor,
      prevHash: r.prev_hash,
      rowHash: r.row_hash,
      createdAt: r.created_at,
    }));

    // Verify chain integrity
    const verification = await verifyChain(orgId);

    return NextResponse.json({
      entries,
      verification,
    });
  } catch (err) {
    console.error("GET /api/audit error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}
