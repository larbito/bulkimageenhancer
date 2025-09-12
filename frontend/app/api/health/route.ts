import { NextRequest, NextResponse } from "next/server";

const WORKER_API_BASE = process.env.WORKER_API_BASE || "";

export async function GET() {
  if (!WORKER_API_BASE) {
    return NextResponse.json({ error: "WORKER_API_BASE not configured" }, { status: 500 });
  }

  try {
    const response = await fetch(`${WORKER_API_BASE}/api/health`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      return NextResponse.json({ error: `Worker returned ${response.status}` }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
