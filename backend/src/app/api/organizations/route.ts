import { NextResponse } from "next/server";
import { z } from "zod";
import { pool } from "@/db";
import crypto from "crypto";

const createOrgSchema = z.object({
  name: z.string().min(1),
  industry: z.string().min(1),
  companySize: z.string().optional(),
  states: z.array(z.string()).min(1),
  email: z.string().email(),
});

/**
 * POST /api/organizations
 * Creates a new organization + admin user.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = createOrgSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { name, industry, companySize, states, email } = parsed.data;
    const demoApiKey = `ct_demo_${crypto.randomUUID().replace(/-/g, "")}`;

    // Insert org
    const orgResult = await pool.query(
      `INSERT INTO organizations (name, industry, company_size, states, demo_api_key)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, industry, company_size, states, subscription_tier, demo_api_key, created_at`,
      [name, industry, companySize ?? null, states, demoApiKey]
    );
    const org = orgResult.rows[0];

    // Insert admin user
    await pool.query(
      `INSERT INTO users (org_id, email, role)
       VALUES ($1, $2, 'admin')`,
      [org.id, email]
    );

    return NextResponse.json(
      {
        id: org.id,
        name: org.name,
        industry: org.industry,
        companySize: org.company_size,
        states: org.states,
        subscriptionTier: org.subscription_tier,
        demoApiKey: org.demo_api_key,
        createdAt: org.created_at,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("POST /api/organizations error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/organizations
 * List all organizations.
 */
export async function GET() {
  try {
    const result = await pool.query(
      `SELECT id, name, industry, company_size, states, subscription_tier, created_at
       FROM organizations ORDER BY created_at DESC`
    );

    const orgs = result.rows.map((r) => ({
      id: r.id,
      name: r.name,
      industry: r.industry,
      companySize: r.company_size,
      states: r.states,
      subscriptionTier: r.subscription_tier,
      createdAt: r.created_at,
    }));

    return NextResponse.json(orgs);
  } catch (err) {
    console.error("GET /api/organizations error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}
