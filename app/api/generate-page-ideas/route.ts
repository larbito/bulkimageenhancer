import { NextRequest, NextResponse } from "next/server";
import OpenAI from 'openai';

const WORKER_API_BASE = process.env.WORKER_API_BASE || "";

// Initialize OpenAI only if API key is available
const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
}) : null;

export async function POST(req: NextRequest) {
  try {
    const { idea, pageCount, style } = await req.json();

    if (!idea || !style) {
      return NextResponse.json({ error: "Idea and style are required" }, { status: 400 });
    }

    // Try to generate actual coloring pages with OpenAI first
    if (openai && process.env.OPENAI_API_KEY) {
      try {
        console.log(`Generating ${pageCount} coloring pages for: ${idea} in ${style.name} style`);
        
        // Generate page ideas based on the selected style
        const pageThemes = [
          'Main character introduction',
          'Adventure begins',
          'Meeting new friends', 
          'Facing challenges',
          'Discovering magic',
          'Working together',
          'Overcoming obstacles',
          'Learning lessons',
          'Celebration scene',
          'Journey continues',
          'Special moments',
          'Happy ending'
        ];

        // Generate actual coloring pages for each theme
        const pagePromises = Array.from({length: pageCount}, async (_, i) => {
          const pageNumber = i + 1;
          const themeIndex = i % pageThemes.length;
          const baseTheme = pageThemes[themeIndex];
          
          const prompt = `${baseTheme} featuring ${idea}, ${style.stylePrompt}, page ${pageNumber} of coloring book, black and white line art only, no shading, clean white background`;
          
          const response = await openai.images.generate({
            model: "dall-e-3",
            prompt: prompt,
            n: 1,
            size: "1024x1024",
            quality: "standard",
            style: "natural"
          });
          
          if (!response.data || !response.data[0] || !response.data[0].url) {
            throw new Error(`Failed to generate image for page ${pageNumber}`);
          }
          
          return {
            id: pageNumber,
            title: `${idea} - Page ${pageNumber}`,
            description: `${baseTheme} featuring ${idea} in ${style.name} style`,
            thumbnail: response.data[0].url,
            coloringPageUrl: response.data[0].url,
            prompt: prompt,
            styleConsistency: style.id,
            pageNumber: pageNumber,
            aiGenerated: true
          };
        });

        const generatedPages = await Promise.all(pagePromises);
        
        console.log(`Successfully generated ${generatedPages.length} coloring pages`);
        
        return NextResponse.json({ 
          pageIdeas: generatedPages,
          style: style,
          totalPages: pageCount,
          basedOnIdea: idea,
          generated: true,
          aiGenerated: true
        });

      } catch (openaiError) {
        console.error('OpenAI page generation failed:', openaiError);
        // Fall through to worker API or fallback
      }
    }

    // Try to call worker API if OpenAI failed or not configured
    if (WORKER_API_BASE) {
      try {
        const response = await fetch(`${WORKER_API_BASE}/api/generate-page-ideas`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            idea,
            pageCount,
            style
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

    // Fallback: Generate sample page ideas based on the user's idea and selected style
    const samplePageIdeas = Array.from({length: pageCount}, (_, i) => {
      const pageNumber = i + 1;
      const pageThemes = [
        `Main character introduction`,
        `Adventure begins`,
        `Meeting new friends`,
        `Facing challenges`,
        `Discovering magic`,
        `Working together`,
        `Overcoming obstacles`,
        `Learning lessons`,
        `Celebration scene`,
        `Journey continues`,
        `Special moments`,
        `Happy ending`
      ];
      
      const themeIndex = i % pageThemes.length;
      const baseTheme = pageThemes[themeIndex];
      
      return {
        id: pageNumber,
        title: `${idea} - Page ${pageNumber}`,
        description: `${baseTheme} featuring ${idea} in ${style.name} style with ${style.lineThickness} lines and ${style.complexity} detail level`,
        thumbnail: `https://images.unsplash.com/photo-${1500000000 + i}?w=300&h=300&fit=crop`,
        prompt: `${baseTheme}, ${idea}, ${style.stylePrompt}, coloring book page, black and white line art`,
        styleConsistency: style.id,
        pageNumber: pageNumber
      };
    });

    return NextResponse.json({ 
      pageIdeas: samplePageIdeas,
      style: style,
      totalPages: pageCount,
      basedOnIdea: idea,
      generated: true
    });
  } catch (error: any) {
    console.error('Error generating page ideas:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
