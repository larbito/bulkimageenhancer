import { NextRequest, NextResponse } from "next/server";
import OpenAI from 'openai';

const WORKER_API_BASE = process.env.WORKER_API_BASE || "";

// Initialize OpenAI only if API key is available
const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
}) : null;

export async function POST(req: NextRequest) {
  try {
    const { idea, pageCount, regenerate } = await req.json();

    if (!idea) {
      return NextResponse.json({ error: "Idea is required" }, { status: 400 });
    }

    // Try to generate actual coloring pages with OpenAI first
    if (openai && process.env.OPENAI_API_KEY) {
      try {
        console.log(`Generating 5 coloring page styles for: ${idea}`);
        
        // Define the 5 different styles we want to generate
        const styleDefinitions = [
          {
            id: 1,
            name: 'Bold Cartoon Style',
            description: 'Thick lines, simple shapes, kid-friendly',
            lineThickness: 'thick',
            complexity: 'simple',
            characterStyle: 'cartoon',
            prompt: `${idea}, cartoon style coloring page, thick black outlines, simple shapes, bold lines, kid-friendly design, black and white line art only, no shading, clean white background`
          },
          {
            id: 2,
            name: 'Detailed Realistic',
            description: 'Fine lines, intricate details, realistic proportions',
            lineThickness: 'fine',
            complexity: 'detailed',
            characterStyle: 'realistic',
            prompt: `${idea}, realistic detailed coloring page, fine thin lines, intricate details, realistic proportions, complex line art, black and white only, no shading, clean white background`
          },
          {
            id: 3,
            name: 'Medium Line Art',
            description: 'Balanced lines, moderate detail, versatile',
            lineThickness: 'medium',
            complexity: 'moderate',
            characterStyle: 'semi-realistic',
            prompt: `${idea}, medium line weight coloring page, balanced detail level, moderate complexity, clean line art, black and white only, no shading, clean white background`
          },
          {
            id: 4,
            name: 'Whimsical Fantasy',
            description: 'Flowing lines, magical elements, dreamy style',
            lineThickness: 'varied',
            complexity: 'moderate',
            characterStyle: 'fantasy',
            prompt: `${idea}, whimsical fantasy coloring page, flowing curved lines, magical elements, dreamy artistic style, varied line weights, black and white line art only, no shading, clean white background`
          },
          {
            id: 5,
            name: 'Minimalist Clean',
            description: 'Very thin lines, geometric, modern style',
            lineThickness: 'thin',
            complexity: 'simple',
            characterStyle: 'geometric',
            prompt: `${idea}, minimalist coloring page, very thin clean lines, geometric shapes, modern simple design, minimal detail, black and white line art only, no shading, clean white background`
          }
        ];

        // Generate all 5 styles in parallel
        const imagePromises = styleDefinitions.map(async (style) => {
          const response = await openai.images.generate({
            model: "dall-e-3",
            prompt: style.prompt,
            n: 1,
            size: "1024x1024",
            quality: "standard",
            style: "natural"
          });
          
          if (!response.data || !response.data[0] || !response.data[0].url) {
            throw new Error(`Failed to generate image for style ${style.name}`);
          }
          
          return {
            ...style,
            coloringPageUrl: response.data[0].url,
            stylePrompt: style.prompt
          };
        });

        const generatedStyles = await Promise.all(imagePromises);
        
        console.log(`Successfully generated ${generatedStyles.length} coloring page styles`);
        
        return NextResponse.json({ 
          styles: generatedStyles.map(style => ({
            ...style,
            basedOnIdea: idea,
            pageCount: pageCount,
            generated: true,
            aiGenerated: true
          }))
        });

      } catch (openaiError) {
        console.error('OpenAI generation failed:', openaiError);
        // Fall through to worker API or fallback
      }
    }

    // Try worker API if OpenAI failed or not configured
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

    // Final fallback: Use sample images (only if both OpenAI and Worker API fail)
    console.log('Using fallback sample images - configure OPENAI_API_KEY for real generation');
    const styleVariations = [
      { 
        id: 1, 
        name: 'Bold Cartoon Style', 
        description: 'Thick lines, simple shapes, kid-friendly',
        lineThickness: 'thick',
        complexity: 'simple',
        characterStyle: 'cartoon',
        coloringPageUrl: `https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop&crop=center&q=80&auto=format`,
        stylePrompt: `${idea}, cartoon style, thick black outlines, simple shapes, coloring book page, black and white line art`
      },
      { 
        id: 2, 
        name: 'Detailed Realistic', 
        description: 'Fine lines, intricate details, realistic proportions',
        lineThickness: 'fine',
        complexity: 'detailed',
        characterStyle: 'realistic',
        coloringPageUrl: `https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=400&fit=crop&crop=center&q=80&auto=format`,
        stylePrompt: `${idea}, realistic style, fine line art, detailed, intricate, coloring book page, black and white`
      },
      { 
        id: 3, 
        name: 'Medium Line Art', 
        description: 'Balanced lines, moderate detail, versatile',
        lineThickness: 'medium',
        complexity: 'moderate',
        characterStyle: 'semi-realistic',
        coloringPageUrl: `https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=400&fit=crop&crop=center&q=80&auto=format`,
        stylePrompt: `${idea}, medium line weight, balanced detail, coloring book page, black and white line art`
      },
      { 
        id: 4, 
        name: 'Whimsical Fantasy', 
        description: 'Flowing lines, magical elements, dreamy style',
        lineThickness: 'varied',
        complexity: 'moderate',
        characterStyle: 'fantasy',
        coloringPageUrl: `https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop&crop=center&q=80&auto=format&sat=-100&con=50`,
        stylePrompt: `${idea}, whimsical fantasy style, flowing lines, magical elements, coloring book page, black and white`
      },
      { 
        id: 5, 
        name: 'Minimalist Clean', 
        description: 'Very thin lines, geometric, modern style',
        lineThickness: 'thin',
        complexity: 'simple',
        characterStyle: 'geometric',
        coloringPageUrl: `https://images.unsplash.com/photo-1509909756405-be0199881695?w=400&h=400&fit=crop&crop=center&q=80&auto=format&sat=-100`,
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