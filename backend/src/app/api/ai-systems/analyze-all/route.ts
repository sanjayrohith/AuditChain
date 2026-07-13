import { NextResponse } from "next/server";
import { z } from "zod";
import { pool } from "@/db";
import { embed, generateText, explainApplicabilityPrompt } from "@/ai";
import { config } from "@/lib/config";

const analyzeAllSchema = z.object({
  orgId: z.string().uuid(),
});

/**
 * POST /api/ai-systems/analyze-all
 * Analyzes all "ready_for_analysis" systems for an org.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = analyzeAllSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { orgId } = parsed.data;

    // Get org states
    const orgResult = await pool.query(
      "SELECT states FROM organizations WHERE id = $1",
      [orgId]
    );
    if (orgResult.rows.length === 0) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 }
      );
    }
    const orgStates: string[] = orgResult.rows[0].states ?? [];

    // Get all ready_for_analysis systems
    const systemsResult = await pool.query(
      `SELECT id, description FROM business_ai_use_cases
       WHERE org_id = $1 AND status = 'ready_for_analysis'`,
      [orgId]
    );

    if (systemsResult.rows.length === 0) {
      return NextResponse.json({
        analyzed: 0,
        message: "No systems pending analysis",
      });
    }

    const results = [];

    for (const system of systemsResult.rows) {
      // Embed
      const embedding = await embed(system.description);
      const embeddingStr = `[${embedding.join(",")}]`;

      // Update status
      await pool.query(
        `UPDATE business_ai_use_cases SET embedding = $1, status = 'analyzed' WHERE id = $2`,
        [embeddingStr, system.id]
      );

      // Clear old matches
      await pool.query("DELETE FROM matched_rules WHERE use_case_id = $1", [system.id]);

      // Vector search
      const similarityResult = await pool.query(
        `SELECT
           lc.id AS chunk_id, lc.chunk_text, lc.jurisdiction_id,
           j.state, j.law_name, j.citation,
           1 - (lc.embedding <=> $1::vector) AS similarity
         FROM law_chunks lc
         JOIN jurisdictions j ON j.id = lc.jurisdiction_id
         WHERE j.state = ANY($2)
         ORDER BY lc.embedding <=> $1::vector
         LIMIT $3`,
        [embeddingStr, orgStates, config.retrievalTopK]
      );

      const candidates = similarityResult.rows.filter(
        (r) => r.similarity >= config.similarityThreshold
      );

      // Generate explanations in parallel
      const explanations = await Promise.all(
        candidates.map(async (match) => {
          const prompt = explainApplicabilityPrompt({
            useCaseDescription: system.description,
            lawName: match.law_name,
            lawCitation: match.citation,
            chunkText: match.chunk_text,
          });
          const explanation = await generateText(prompt);
          return { ...match, explanation };
        })
      );

      // Insert matches
      for (const match of explanations) {
        await pool.query(
          `INSERT INTO matched_rules (use_case_id, law_chunk_id, jurisdiction_id, similarity_score, ai_explanation, status)
           VALUES ($1, $2, $3, $4, $5, 'flagged')`,
          [system.id, match.chunk_id, match.jurisdiction_id, match.similarity, match.explanation]
        );
      }

      results.push({
        id: system.id,
        matchCount: explanations.length,
      });
    }

    return NextResponse.json({
      analyzed: results.length,
      systems: results,
    });
  } catch (err) {
    console.error("POST /api/ai-systems/analyze-all error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}
