import { NextResponse } from "next/server";
import { pool } from "@/db";
import { embed, generateText, explainApplicabilityPrompt } from "@/ai";
import { config } from "@/lib/config";

/**
 * POST /api/ai-systems/:id/analyze
 * Runs the RAG pipeline: embed → vector search → explain → store matches.
 */
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 1. Fetch the use case
    const ucResult = await pool.query(
      `SELECT b.id, b.org_id, b.description, o.states
       FROM business_ai_use_cases b
       JOIN organizations o ON o.id = b.org_id
       WHERE b.id = $1`,
      [id]
    );

    if (ucResult.rows.length === 0) {
      return NextResponse.json(
        { error: "AI system not found" },
        { status: 404 }
      );
    }

    const useCase = ucResult.rows[0];

    // 2. Embed the description
    const embedding = await embed(useCase.description);
    const embeddingStr = `[${embedding.join(",")}]`;

    // Update the row with embedding and flip status
    await pool.query(
      `UPDATE business_ai_use_cases
       SET embedding = $1, status = 'analyzed'
       WHERE id = $2`,
      [embeddingStr, id]
    );

    // 3. Delete prior matched_rules (idempotent re-analysis)
    await pool.query("DELETE FROM matched_rules WHERE use_case_id = $1", [id]);

    // 4. Cosine similarity search against law_chunks, filtered by org's states
    const orgStates: string[] = useCase.states ?? [];
    const similarityResult = await pool.query(
      `SELECT
         lc.id AS chunk_id,
         lc.chunk_text,
         lc.jurisdiction_id,
         j.state,
         j.law_name,
         j.citation,
         1 - (lc.embedding <=> $1::vector) AS similarity
       FROM law_chunks lc
       JOIN jurisdictions j ON j.id = lc.jurisdiction_id
       WHERE j.state = ANY($2)
       ORDER BY lc.embedding <=> $1::vector
       LIMIT $3`,
      [embeddingStr, orgStates, config.retrievalTopK]
    );

    // 5. Filter by threshold and generate explanations in parallel
    const candidates = similarityResult.rows.filter(
      (r) => r.similarity >= config.similarityThreshold
    );

    const explanations = await Promise.all(
      candidates.map(async (match) => {
        const prompt = explainApplicabilityPrompt({
          useCaseDescription: useCase.description,
          lawName: match.law_name,
          lawCitation: match.citation,
          chunkText: match.chunk_text,
        });
        const explanation = await generateText(prompt);
        return { ...match, explanation };
      })
    );

    // 6. Insert matched_rules
    const matches = [];
    for (const match of explanations) {
      const insertResult = await pool.query(
        `INSERT INTO matched_rules (use_case_id, law_chunk_id, jurisdiction_id, similarity_score, ai_explanation, status)
         VALUES ($1, $2, $3, $4, $5, 'flagged')
         RETURNING id, use_case_id, law_chunk_id, jurisdiction_id, similarity_score, ai_explanation, status, created_at`,
        [id, match.chunk_id, match.jurisdiction_id, match.similarity, match.explanation]
      );
      const row = insertResult.rows[0];
      matches.push({
        id: row.id,
        lawChunkId: row.law_chunk_id,
        jurisdictionId: row.jurisdiction_id,
        state: match.state,
        lawName: match.law_name,
        citation: match.citation,
        similarityScore: row.similarity_score,
        aiExplanation: row.ai_explanation,
        status: row.status,
        createdAt: row.created_at,
      });
    }

    return NextResponse.json({
      useCase: {
        id,
        status: "analyzed",
        matchCount: matches.length,
      },
      matches,
    });
  } catch (err) {
    console.error("POST /api/ai-systems/:id/analyze error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}
