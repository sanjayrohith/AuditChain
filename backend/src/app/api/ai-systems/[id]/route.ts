import { NextResponse } from "next/server";
import { z } from "zod";
import { pool } from "@/db";

const updateAiSystemSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  category: z.string().optional(),
  aiProvider: z.string().optional(),
  affectsPeople: z.boolean().optional(),
});

/**
 * PATCH /api/ai-systems/:id
 * Edit an existing AI system.
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = updateAiSystemSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const updates = parsed.data;
    const setClauses: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    if (updates.name !== undefined) {
      setClauses.push(`name = $${paramIndex++}`);
      values.push(updates.name);
    }
    if (updates.description !== undefined) {
      setClauses.push(`description = $${paramIndex++}`);
      values.push(updates.description);
      // Reset to ready_for_analysis if description changed (needs re-embedding)
      setClauses.push(`status = $${paramIndex++}`);
      values.push("ready_for_analysis");
      setClauses.push(`embedding = NULL`);
    }
    if (updates.category !== undefined) {
      setClauses.push(`category = $${paramIndex++}`);
      values.push(updates.category);
    }
    if (updates.aiProvider !== undefined) {
      setClauses.push(`ai_provider = $${paramIndex++}`);
      values.push(updates.aiProvider);
    }
    if (updates.affectsPeople !== undefined) {
      setClauses.push(`affects_people = $${paramIndex++}`);
      values.push(updates.affectsPeople);
    }

    if (setClauses.length === 0) {
      return NextResponse.json(
        { error: "No fields to update" },
        { status: 400 }
      );
    }

    values.push(id);
    const result = await pool.query(
      `UPDATE business_ai_use_cases SET ${setClauses.join(", ")}
       WHERE id = $${paramIndex}
       RETURNING id, org_id, name, description, category, ai_provider, affects_people, status, created_at`,
      values
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "AI system not found" },
        { status: 404 }
      );
    }

    const row = result.rows[0];
    return NextResponse.json({
      id: row.id,
      orgId: row.org_id,
      name: row.name,
      description: row.description,
      category: row.category,
      aiProvider: row.ai_provider,
      affectsPeople: row.affects_people,
      status: row.status,
      createdAt: row.created_at,
    });
  } catch (err) {
    console.error("PATCH /api/ai-systems/:id error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/ai-systems/:id
 */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Delete matched rules first (FK constraint)
    await pool.query("DELETE FROM matched_rules WHERE use_case_id = $1", [id]);

    const result = await pool.query(
      "DELETE FROM business_ai_use_cases WHERE id = $1 RETURNING id",
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "AI system not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ deleted: true, id });
  } catch (err) {
    console.error("DELETE /api/ai-systems/:id error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}
