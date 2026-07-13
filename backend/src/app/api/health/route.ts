import { NextResponse } from "next/server";
import { pool } from "@/db";

export async function GET() {
  try {
    const result = await pool.query("SELECT 1 AS ok");
    return NextResponse.json({
      status: "healthy",
      database: result.rows[0].ok === 1 ? "connected" : "error",
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    return NextResponse.json(
      {
        status: "unhealthy",
        database: "disconnected",
        error: err instanceof Error ? err.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}
