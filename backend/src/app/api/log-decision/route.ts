import { NextResponse } from "next/server";
import { z } from "zod";
import { pool } from "@/db";
import { logDecision } from "@/lib/hash";

const logDecisionSchema = z.object({
  decision_type: z.string().min(1),
  input_summary: z.string().min(1),
  output_summary: z.string().min(1),
  justification: z.string().optional(),
  actor: z.string().min(1),
});

/**
 * POST /api/log-decision
 * Public-facing endpoint for logging AI decisions.
 * Authenticates via x-api-key header (matches org's demo_api_key).
 */
export async function POST(request: Request) {
  try {
    // Extract API key
    const apiKey = request.headers.get("x-api-key");
    if (!apiKey) {
      return NextResponse.json(
        { error: "Missing x-api-key header" },
        { status: 401 }
      );
    }

    // Look up org by demo_api_key
    const orgResult = await pool.query(
      "SELECT id FROM organizations WHERE demo_api_key = $1",
      [apiKey]
    );
    if (orgResult.rows.length === 0) {
      return NextResponse.json(
        { error: "Invalid API key" },
        { status: 401 }
      );
    }
    const orgId = orgResult.rows[0].id;

    // Validate body
    const body = await request.json();
    const parsed = logDecisionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { decision_type, input_summary, output_summary, justification, actor } = parsed.data;

    // Log the decision
    const result = await logDecision({
      orgId,
      decisionType: decision_type,
      inputSummary: input_summary,
      outputSummary: output_summary,
      justification,
      actor,
    });

    return NextResponse.json(
      { id: result.id, row_hash: result.rowHash },
      { status: 201 }
    );
  } catch (err) {
    console.error("POST /api/log-decision error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}
