import { NextResponse } from "next/server";
import { z } from "zod";
import { pool } from "@/db";
import { generateText, draftDisclosurePrompt } from "@/ai";

const DISCLAIMER = "Draft for review by counsel — not legal advice.";

const createDisclosureSchema = z.object({
  orgId: z.string().uuid(),
  jurisdictionId: z.string().uuid(),
  disclosureType: z.string().min(1),
  useCaseId: z.string().uuid().optional(),
});

/**
 * POST /api/disclosures
 * Generates a disclosure grounded in the closest law_chunk for the jurisdiction.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = createDisclosureSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { orgId, jurisdictionId, disclosureType, useCaseId } = parsed.data;

    // Get org name
    const orgResult = await pool.query(
      "SELECT name FROM organizations WHERE id = $1",
      [orgId]
    );
    if (orgResult.rows.length === 0) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }
    const orgName = orgResult.rows[0].name;

    // Get jurisdiction info
    const jurisdictionResult = await pool.query(
      "SELECT id, state, law_name, citation FROM jurisdictions WHERE id = $1",
      [jurisdictionId]
    );
    if (jurisdictionResult.rows.length === 0) {
      return NextResponse.json({ error: "Jurisdiction not found" }, { status: 404 });
    }
    const jurisdiction = jurisdictionResult.rows[0];

    // Get use case description if provided
    let useCaseDescription = "General AI system usage";
    if (useCaseId) {
      const ucResult = await pool.query(
        "SELECT description FROM business_ai_use_cases WHERE id = $1",
        [useCaseId]
      );
      if (ucResult.rows.length > 0) {
        useCaseDescription = ucResult.rows[0].description;
      }
    }

    // Find the closest law_chunk for this jurisdiction
    const chunkResult = await pool.query(
      `SELECT id, chunk_text, chunk_index
       FROM law_chunks
       WHERE jurisdiction_id = $1
       ORDER BY chunk_index ASC
       LIMIT 1`,
      [jurisdictionId]
    );

    if (chunkResult.rows.length === 0) {
      return NextResponse.json(
        { error: "No law chunks found for this jurisdiction" },
        { status: 404 }
      );
    }

    const chunk = chunkResult.rows[0];

    // Generate disclosure text
    const prompt = draftDisclosurePrompt({
      organizationName: orgName,
      useCaseDescription,
      lawName: jurisdiction.law_name,
      lawCitation: jurisdiction.citation,
      chunkText: chunk.chunk_text,
      disclosureType,
    });

    const draftText = await generateText(prompt);

    // Insert disclosure with provenance
    const insertResult = await pool.query(
      `INSERT INTO disclosures (org_id, jurisdiction_id, use_case_id, disclosure_type, draft_text, source_chunk_id, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'draft')
       RETURNING id, org_id, jurisdiction_id, use_case_id, disclosure_type, draft_text, source_chunk_id, status, created_at`,
      [orgId, jurisdictionId, useCaseId ?? null, disclosureType, draftText, chunk.id]
    );

    const row = insertResult.rows[0];

    return NextResponse.json(
      {
        id: row.id,
        orgId: row.org_id,
        jurisdictionId: row.jurisdiction_id,
        useCaseId: row.use_case_id,
        disclosureType: row.disclosure_type,
        draftText: row.draft_text,
        source: {
          chunkId: row.source_chunk_id,
          lawName: jurisdiction.law_name,
          citation: jurisdiction.citation,
          state: jurisdiction.state,
        },
        status: row.status,
        createdAt: row.created_at,
        disclaimer: DISCLAIMER,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("POST /api/disclosures error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/disclosures?orgId=
 * Lists all disclosures for an organization.
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
         d.id, d.org_id, d.jurisdiction_id, d.use_case_id,
         d.disclosure_type, d.draft_text, d.source_chunk_id, d.status, d.created_at,
         j.state, j.law_name, j.citation
       FROM disclosures d
       JOIN jurisdictions j ON j.id = d.jurisdiction_id
       WHERE d.org_id = $1
       ORDER BY d.created_at DESC`,
      [orgId]
    );

    const disclosures = result.rows.map((r) => ({
      id: r.id,
      orgId: r.org_id,
      jurisdictionId: r.jurisdiction_id,
      useCaseId: r.use_case_id,
      disclosureType: r.disclosure_type,
      draftText: r.draft_text,
      source: {
        chunkId: r.source_chunk_id,
        lawName: r.law_name,
        citation: r.citation,
        state: r.state,
      },
      status: r.status,
      createdAt: r.created_at,
      disclaimer: DISCLAIMER,
    }));

    return NextResponse.json(disclosures);
  } catch (err) {
    console.error("GET /api/disclosures error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}
