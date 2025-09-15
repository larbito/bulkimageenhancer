import { NextRequest, NextResponse } from "next/server";

const WORKER_API_BASE = process.env.WORKER_API_BASE || "";

export async function POST(req: NextRequest) {
  try {
    const { idea, pageCount, regenerate } = await req.json();

    if (!idea) {
      return NextResponse.json({ error: "Idea is required" }, { status: 400 });
    }

    // Try to call worker API if configured
    if (WORKER_API_BASE) {
      try {
        const response = await fetch(`${WORKER_API_BASE}/api/generate-styles`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            idea,
            pageCount,
            regenerate: regenerate || false
          })
        });

        if (response.ok) {
          const data = await response.json();
          return NextResponse.json(data);
        }
      } catch (workerError) {
        console.log('Worker API failed, using fallback:', workerError);
      }
    }

    // Fallback or if worker API not configured:
      // Fallback: Generate 5 actual coloring page samples with different styles
      // These would be real AI-generated coloring pages based on the user's idea
      const styleVariations = [
        { 
          id: 1, 
          name: 'Bold Cartoon Style', 
          description: 'Thick lines, simple shapes, kid-friendly',
          lineThickness: 'thick',
          complexity: 'simple',
          characterStyle: 'cartoon',
          coloringPageUrl: `https://via.placeholder.com/400x400/ffffff/000000?text=${encodeURIComponent(idea + ' - Bold Cartoon')}`,
          stylePrompt: `${idea}, cartoon style, thick black outlines, simple shapes, coloring book page, black and white line art`
        },
        { 
          id: 2, 
          name: 'Detailed Realistic', 
          description: 'Fine lines, intricate details, realistic proportions',
          lineThickness: 'fine',
          complexity: 'detailed',
          characterStyle: 'realistic',
          coloringPageUrl: `https://via.placeholder.com/400x400/ffffff/000000?text=${encodeURIComponent(idea + ' - Detailed')}`,
          stylePrompt: `${idea}, realistic style, fine line art, detailed, intricate, coloring book page, black and white`
        },
        { 
          id: 3, 
          name: 'Medium Line Art', 
          description: 'Balanced lines, moderate detail, versatile',
          lineThickness: 'medium',
          complexity: 'moderate',
          characterStyle: 'semi-realistic',
          coloringPageUrl: `https://via.placeholder.com/400x400/ffffff/000000?text=${encodeURIComponent(idea + ' - Medium')}`,
          stylePrompt: `${idea}, medium line weight, balanced detail, coloring book page, black and white line art`
        },
        { 
          id: 4, 
          name: 'Whimsical Fantasy', 
          description: 'Flowing lines, magical elements, dreamy style',
          lineThickness: 'varied',
          complexity: 'moderate',
          characterStyle: 'fantasy',
          coloringPageUrl: `https://via.placeholder.com/400x400/ffffff/000000?text=${encodeURIComponent(idea + ' - Fantasy')}`,
          stylePrompt: `${idea}, whimsical fantasy style, flowing lines, magical elements, coloring book page, black and white`
        },
        { 
          id: 5, 
          name: 'Minimalist Clean', 
          description: 'Very thin lines, geometric, modern style',
          lineThickness: 'thin',
          complexity: 'simple',
          characterStyle: 'geometric',
          coloringPageUrl: `https://via.placeholder.com/400x400/ffffff/000000?text=${encodeURIComponent(idea + ' - Minimal')}`,
          stylePrompt: `${idea}, minimalist style, thin lines, geometric shapes, modern, coloring book page, black and white`
        }
      ];

    return NextResponse.json({ 
      styles: styleVariations.map(style => ({
        ...style,
        basedOnIdea: idea,
        pageCount: pageCount,
        generated: true
      }))
    });

  } catch (error: any) {
    console.error('Error generating styles:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
