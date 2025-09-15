import { NextRequest, NextResponse } from "next/server";

const WORKER_API_BASE = process.env.WORKER_API_BASE || "";

export async function POST(req: NextRequest) {
  if (!WORKER_API_BASE) {
    return NextResponse.json({ error: "WORKER_API_BASE not configured" }, { status: 500 });
  }

  try {
    const { projectId, pageIds, upscaleFactor } = await req.json();

    if (!projectId) {
      return NextResponse.json({ error: "Project ID is required" }, { status: 400 });
    }

    const response = await fetch(`${WORKER_API_BASE}/api/upscale-pages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        projectId,
        pageIds: pageIds || 'all', // upscale all pages if not specified
        upscaleFactor: upscaleFactor || 2, // 2x upscaling by default
        outputFormat: 'png',
        quality: 'high'
      })
    });

    if (!response.ok) {
      return NextResponse.json({ error: `Upscaling failed: ${response.status}` }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error upscaling pages:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const projectId = url.searchParams.get('projectId');

  if (!projectId) {
    return NextResponse.json({ error: "Project ID is required" }, { status: 400 });
  }

  if (!WORKER_API_BASE) {
    return NextResponse.json({ error: "WORKER_API_BASE not configured" }, { status: 500 });
  }

  try {
    const response = await fetch(`${WORKER_API_BASE}/api/upscale-status/${projectId}`);
    
    if (!response.ok) {
      return NextResponse.json({ error: "Failed to get upscale status" }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error getting upscale status:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
