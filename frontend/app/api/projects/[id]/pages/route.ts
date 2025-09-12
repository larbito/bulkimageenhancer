import { NextRequest, NextResponse } from "next/server";

const WORKER_API_BASE = process.env.WORKER_API_BASE || "";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  if (!WORKER_API_BASE) {
    return NextResponse.json({ error: "WORKER_API_BASE not configured" }, { status: 500 });
  }

  try {
    const body = await req.json();
    const response = await fetch(`${WORKER_API_BASE}/api/projects/${params.id}/pages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
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
