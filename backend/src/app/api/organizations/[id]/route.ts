import { NextResponse } from "next/server";
import { pool } from "@/db";

/**
 * GET /api/organizations/:id
 * Returns a single organization by ID.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const result = await pool.query(
      `SELECT id, name, industry, company_size, states, subscription_tier, demo_api_key, created_at
       FROM organizations WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 }
      );
    }

    const org = result.rows[0];
    return NextResponse.json({
      id: org.id,
      name: org.name,
      industry: org.industry,
      companySize: org.company_size,
      states: org.states,
      subscriptionTier: org.subscription_tier,
      demoApiKey: org.demo_api_key,
      createdAt: org.created_at,
    });
  } catch (err) {
    console.error("GET /api/organizations/:id error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}
