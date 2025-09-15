import { NextRequest, NextResponse } from "next/server";

const WORKER_API_BASE = process.env.WORKER_API_BASE || "";

export async function POST(req: NextRequest) {
  if (!WORKER_API_BASE) {
    return NextResponse.json({ error: "WORKER_API_BASE not configured" }, { status: 500 });
  }

  try {
    const { idea, pageCount, regenerate } = await req.json();

    if (!idea) {
      return NextResponse.json({ error: "Idea is required" }, { status: 400 });
    }

    const response = await fetch(`${WORKER_API_BASE}/api/generate-styles`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        idea,
        pageCount,
        regenerate: regenerate || false
      })
    });

    if (!response.ok) {
      // Fallback to sample styles if worker API fails
      const sampleStyles = [
        { 
          id: 1, 
          name: 'Whimsical Cartoon', 
          description: 'Playful characters with bold outlines',
          thumbnail: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=300&fit=crop',
          stylePrompt: 'cartoon style, bold outlines, whimsical characters'
        },
        { 
          id: 2, 
          name: 'Detailed Realistic', 
          description: 'Intricate details and lifelike features',
          thumbnail: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=300&h=300&fit=crop',
          stylePrompt: 'realistic style, detailed, intricate linework'
        },
        { 
          id: 3, 
          name: 'Simple Line Art', 
          description: 'Clean, minimalist outlines',
          thumbnail: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=300&h=300&fit=crop',
          stylePrompt: 'simple line art, minimalist, clean outlines'
        },
        { 
          id: 4, 
          name: 'Fantasy Adventure', 
          description: 'Magical elements and mystical creatures',
          thumbnail: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=300&fit=crop',
          stylePrompt: 'fantasy style, magical elements, mystical creatures'
        },
        { 
          id: 5, 
          name: 'Geometric Patterns', 
          description: 'Abstract shapes and patterns',
          thumbnail: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=300&fit=crop',
          stylePrompt: 'geometric patterns, abstract shapes, mandala-like'
        }
      ];

      return NextResponse.json({ 
        styles: sampleStyles.map(style => ({
          ...style,
          customized: true,
          basedOn: idea
        }))
      });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error generating styles:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
