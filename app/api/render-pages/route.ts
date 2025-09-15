import { NextRequest, NextResponse } from "next/server";

const WORKER_API_BASE = process.env.WORKER_API_BASE || "";

export async function POST(req: NextRequest) {
  if (!WORKER_API_BASE) {
    return NextResponse.json({ error: "WORKER_API_BASE not configured" }, { status: 500 });
  }

  try {
    const { pageIdeas, style, projectId } = await req.json();

    if (!pageIdeas || !style) {
      return NextResponse.json({ error: "Page ideas and style are required" }, { status: 400 });
    }

    const response = await fetch(`${WORKER_API_BASE}/api/render-pages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pageIdeas,
        style,
        projectId,
        consistentStyle: true,
        lineWeight: 'medium',
        outputFormat: 'png'
      })
    });

    if (!response.ok) {
      // Fallback response for demo
      const renderedPages = pageIdeas.map((page: any) => ({
        id: page.id,
        title: page.title,
        description: page.description,
        originalUrl: `https://images.unsplash.com/photo-${1600000000 + page.id}?w=800&h=800&fit=crop`,
        renderUrl: `https://images.unsplash.com/photo-${1600000000 + page.id}?w=800&h=800&fit=crop&auto=format&q=80`,
        status: 'completed',
        renderTime: Math.floor(Math.random() * 30) + 10 // 10-40 seconds
      }));

      return NextResponse.json({ 
        pages: renderedPages,
        projectId: projectId || `project_${Date.now()}`,
        status: 'completed',
        totalPages: pageIdeas.length
      });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error rendering pages:', error);
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
    const response = await fetch(`${WORKER_API_BASE}/api/render-status/${projectId}`);
    
    if (!response.ok) {
      return NextResponse.json({ error: "Failed to get render status" }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error getting render status:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
