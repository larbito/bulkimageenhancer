import { NextRequest, NextResponse } from "next/server";

const WORKER_API_BASE = process.env.WORKER_API_BASE || "";

export async function POST(req: NextRequest) {
  if (!WORKER_API_BASE) {
    return NextResponse.json({ error: "WORKER_API_BASE not configured" }, { status: 500 });
  }

  try {
    const { idea, pageCount, style } = await req.json();

    if (!idea || !style) {
      return NextResponse.json({ error: "Idea and style are required" }, { status: 400 });
    }

    const response = await fetch(`${WORKER_API_BASE}/api/generate-page-ideas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        idea,
        pageCount,
        style
      })
    });

    if (!response.ok) {
      // Fallback to sample page ideas if worker API fails
      const samplePageIdeas = Array.from({length: pageCount}, (_, i) => ({
        id: i + 1,
        title: `${idea} - Page ${i + 1}`,
        description: `A coloring page featuring ${idea} in ${style.name} style`,
        thumbnail: `https://images.unsplash.com/photo-${1500000000 + i}?w=300&h=300&fit=crop`,
        prompt: `${idea}, ${style.stylePrompt}, coloring book page, black and white line art`,
        styleConsistency: style.id
      }));

      return NextResponse.json({ 
        pageIdeas: samplePageIdeas,
        style: style,
        totalPages: pageCount
      });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error generating page ideas:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
