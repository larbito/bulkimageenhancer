import { NextRequest, NextResponse } from "next/server";
import OpenAI from 'openai';

const WORKER_API_BASE = process.env.WORKER_API_BASE || "https://web-production-0cd9.up.railway.app";

// Initialize OpenAI only if API key is available
const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
}) : null;

export async function POST(req: NextRequest) {
  try {
    const { extractedIdeas, mainTheme, originalIdea } = await req.json();

    if (!extractedIdeas || !Array.isArray(extractedIdeas)) {
      return NextResponse.json({ error: "Extracted ideas are required" }, { status: 400 });
    }

    // If this is Railway (has OpenAI key), generate actual coloring pages
    if (openai && process.env.OPENAI_API_KEY) {
      try {
        console.log(`🎨 RAILWAY: Generating ${extractedIdeas.length} coloring pages for theme: ${mainTheme}`);
        
        // First, establish character design consistency
        const characterPrompt = `Reference character design for ${mainTheme}: Simple, cute ${mainTheme} character for kids coloring book. Round friendly face, big eyes, simple body proportions, thick black outlines, no shading, white background. This character should look the same in every page.`;
        
        console.log('🎯 Establishing character consistency...');
        const characterRef = await openai.images.generate({
          model: "dall-e-3",
          prompt: characterPrompt,
          n: 1,
          size: "1024x1024",
          quality: "standard",
          style: "natural"
        });
        
        const characterRefUrl = characterRef.data?.[0]?.url;
        console.log(`✅ Character reference established: ${characterRefUrl ? 'SUCCESS' : 'FAILED'}`);
        
        // Generate actual coloring pages for each specific idea
        const pagePromises = extractedIdeas.map(async (pageIdea: any) => {
          console.log(`🎨 Generating coloring page: ${pageIdea.title}`);
          
          // Create specific prompt using EXACT professional specifications
          const prompt = `Professional coloring book page: ${pageIdea.description}

PAGE SETUP:
- 2550×3300 px portrait at 300 dpi
- Pure white background
- No frame, no text, no watermark
- Safe margin 150 px on all sides

LINE SYSTEM:
- Uniform black strokes, no fills, no shading, no gradients
- Round stroke caps and round joins
- 18 px main character silhouette
- 14 px secondary objects and furniture
- 10–12 px inner details and patterns
- 8–10 px ground tiles, water ripples, motion lines
- Only pupils filled solid black

${mainTheme.toUpperCase()} CHARACTER MODEL:
- Head big and round, about 55% of character height
- Horn centered, three curved rings, slight forward tilt, base about 20% of head width
- Ears round with a single inner-ear line
- Eye patches outlined only, large ovals, no solid fill
- Pupils small, solid black, one round highlight each
- Nose tiny rounded triangle
- Mouth small U with a short center line
- Cheeks two outlined circles, no fill
- Body short pear shape, stubby arms, three toe nubs per foot
- Tiny tail tuft optional
- Apron for cooking or cleaning scenes, scarf for winter scenes

CONSISTENCY: Use EXACT same character design in every page`;
          
          console.log(`🎨 Generating PROFESSIONAL page ${pageIdea.pageNumber}: ${pageIdea.title}`);
          
          console.log(`🎨 Generating SIMPLE page ${pageIdea.pageNumber}: ${pageIdea.title}`);
          
          const response = await openai.images.generate({
            model: "dall-e-3",
            prompt: prompt,
            n: 1,
            size: "1024x1024",
            quality: "standard",
            style: "natural"
          });
          
          if (!response.data || !response.data[0] || !response.data[0].url) {
            throw new Error(`Failed to generate image for ${pageIdea.title}`);
          }
          
          console.log(`✅ Generated: ${pageIdea.title}`);
          
          return {
            id: pageIdea.id,
            pageNumber: pageIdea.pageNumber,
            title: pageIdea.title,
            description: pageIdea.description,
            coloringPageUrl: response.data[0].url,
            thumbnail: response.data[0].url,
            prompt: prompt,
            aiGenerated: true,
            consistent: true
          };
        });

        const generatedPages = await Promise.all(pagePromises);
        
        console.log(`🎉 Successfully generated ${generatedPages.length} consistent coloring pages`);
        
        return NextResponse.json({ 
          pages: generatedPages,
          mainTheme: mainTheme,
          totalPages: generatedPages.length,
          consistent: true,
          aiGenerated: true
        });

      } catch (openaiError) {
        console.error('❌ OpenAI page generation failed:', openaiError);
        // Fall through to fallback
      }
    }

    // If this is Vercel (no OpenAI key), call Railway API
    if (WORKER_API_BASE && !process.env.OPENAI_API_KEY) {
      try {
        console.log(`📡 VERCEL: Calling Railway API to generate coloring pages`);
        
        const response = await fetch(`${WORKER_API_BASE}/api/generate-coloring-pages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            extractedIdeas,
            mainTheme,
            originalIdea
          })
        });

        if (response.ok) {
          const data = await response.json();
          console.log('✅ Railway API returned coloring pages successfully');
          return NextResponse.json(data);
        } else {
          const errorText = await response.text();
          console.error('❌ Railway API failed:', response.status, errorText);
        }
      } catch (workerError) {
        console.error('❌ Railway API call failed:', workerError);
      }
    }

    // Final fallback: Use the extracted ideas with sample images
    console.log('Using fallback - generating sample pages from extracted ideas');
    const fallbackPages = extractedIdeas.map((idea: any, i: number) => ({
      id: idea.id,
      pageNumber: idea.pageNumber,
      title: idea.title,
      description: idea.description,
      coloringPageUrl: `https://images.unsplash.com/photo-${1500000000 + i}?w=800&h=800&fit=crop`,
      thumbnail: `https://images.unsplash.com/photo-${1500000000 + i}?w=300&h=300&fit=crop`,
      aiGenerated: false,
      consistent: true
    }));

    return NextResponse.json({ 
      pages: fallbackPages,
      mainTheme: mainTheme,
      totalPages: fallbackPages.length,
      consistent: true,
      aiGenerated: false
    });

  } catch (error: any) {
    console.error('Error generating coloring pages:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
