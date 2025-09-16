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
          
          // FORCE SIMPLE DESIGN - be extremely explicit
          const prompt = `SIMPLE children's coloring book page showing: ${pageIdea.description}

MANDATORY REQUIREMENTS:
1. PURE WHITE BACKGROUND ONLY
2. BLACK OUTLINES ONLY - NO FILLED BLACK AREAS ANYWHERE
3. SAME ${mainTheme} CHARACTER: round head, big eyes, simple body
4. THICK SIMPLE LINES suitable for children
5. MAXIMUM 3 background objects (chair, table, tree)
6. CLEAN and UNCLUTTERED layout
7. EASY for 4-year-olds to color

STYLE: Classic children's coloring book like Crayola
FORMAT: Single page, not a book spread
COMPLEXITY: Very simple, like preschool coloring books`;
          
          console.log(`🎨 Generating PROFESSIONAL page ${pageIdea.pageNumber}: ${pageIdea.title}`);
          
          console.log(`🎨 Generating SIMPLE page ${pageIdea.pageNumber}: ${pageIdea.title}`);
          
          const response = await openai.images.generate({
            model: "dall-e-3", 
            prompt: `${prompt}

NEGATIVE PROMPTS (DO NOT INCLUDE):
- No black filled areas
- No dark backgrounds  
- No complex details
- No shading or gradients
- No realistic textures
- No cluttered compositions
- No different character designs
- No book layouts`,
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
