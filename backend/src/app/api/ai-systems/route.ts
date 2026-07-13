import { NextResponse } from "next/server";
import { z } from "zod";
import { pool } from "@/db";

const createAiSystemSchema = z.object({
  orgId: z.string().uuid(),
  name: z.string().min(1),
  category: z.string().optional(),
  aiProvider: z.string().optional(),
  affectsPeople: z.boolean().optional().default(false),
  description: z.string().min(1),
});

/**
 * POST /api/ai-systems
 * Creates a new AI system in "ready_for_analysis" state (no embedding yet).
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = createAiSystemSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { orgId, name, category, aiProvider, affectsPeople, description } = parsed.data;

    const result = await pool.query(
      `INSERT INTO business_ai_use_cases (org_id, name, description, category, ai_provider, affects_people, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'ready_for_analysis')
       RETURNING id, org_id, name, description, category, ai_provider, affects_people, status, created_at`,
      [orgId, name, description, category ?? null, aiProvider ?? null, affectsPeople]
    );

    const row = result.rows[0];
    return NextResponse.json(
      {
        id: row.id,
        orgId: row.org_id,
        name: row.name,
        description: row.description,
        category: row.category,
        aiProvider: row.ai_provider,
        affectsPeople: row.affects_people,
        status: row.status,
        createdAt: row.created_at,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("POST /api/ai-systems error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/ai-systems?orgId=
 * Lists AI systems for an org, including match counts.
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

    const result = await pool.query(
      `SELECT
         b.id, b.org_id, b.name, b.description, b.category,
         b.ai_provider, b.affects_people, b.status, b.created_at,
         COALESCE(mc.match_count, 0) AS match_count
       FROM business_ai_use_cases b
       LEFT JOIN (
         SELECT use_case_id, count(*) AS match_count
         FROM matched_rules
         GROUP BY use_case_id
       ) mc ON mc.use_case_id = b.id
       WHERE b.org_id = $1
       ORDER BY b.created_at DESC`,
      [orgId]
    );

    const systems = result.rows.map((r) => ({
      id: r.id,
      orgId: r.org_id,
      name: r.name,
      description: r.description,
      category: r.category,
      aiProvider: r.ai_provider,
      affectsPeople: r.affects_people,
      status: r.status,
      matchCount: parseInt(r.match_count, 10),
      createdAt: r.created_at,
    }));

    return NextResponse.json(systems);
  } catch (err) {
    console.error("GET /api/ai-systems error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}
