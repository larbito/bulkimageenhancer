import { NextRequest, NextResponse } from "next/server";
import OpenAI from 'openai';

const WORKER_API_BASE = process.env.WORKER_API_BASE || "https://web-production-0cd9.up.railway.app";

// Initialize OpenAI only if API key is available
const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
}) : null;

export async function POST(req: NextRequest) {
  try {
    const { idea, pageCount } = await req.json();

    if (!idea) {
      return NextResponse.json({ error: "Idea is required" }, { status: 400 });
    }

    // If this is Railway (has OpenAI key), extract page ideas with OpenAI
    if (openai && process.env.OPENAI_API_KEY) {
      try {
        console.log(`🎨 RAILWAY: Extracting ${pageCount} page ideas from: ${idea}`);
        
        // Step 1: Extract main theme
        console.log('🧠 Extracting main theme...');
        const themeExtraction = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [{
            role: "system",
            content: "Extract the main character/subject from the user's coloring book description. Return only the main subject (e.g., 'unicorn', 'dinosaur', 'princess'). Keep it simple and singular."
          }, {
            role: "user", 
            content: `Extract the main subject from: "${idea}"`
          }],
          max_tokens: 20,
          temperature: 0.3
        });
        
        const mainTheme = themeExtraction.choices[0]?.message?.content?.trim() || "character";
        console.log(`✨ Main theme: "${mainTheme}"`);

        // Step 2: Extract specific page ideas with rich details
        console.log(`📝 Extracting ${pageCount} detailed page ideas...`);
        const pageExtraction = await openai.chat.completions.create({
          model: "gpt-4",
          messages: [{
            role: "system",
            content: `You are creating detailed coloring page descriptions for a professional coloring book. The user wants ${pageCount} pages about "${mainTheme}". 

IMPORTANT: Create RICH, DETAILED descriptions with lots of background elements, just like this example:
"Pandacorn flips pancakes on a pan. Include stove, stack on a plate, fruit bowl, fridge with magnets, wall clock, window with sun, hanging utensils, checkered floor."

For each page:
1. Start with the main action/scene
2. Add 6-8 specific background elements 
3. Include furniture, decorations, nature elements, small details
4. Make it rich enough for a professional coloring book

Return ONLY a JSON array: [{"title": "Short title", "description": "Main action. Include element1, element2, element3, element4, element5, element6, element7."}]

Create ${pageCount} different daily life scenes for ${mainTheme} with rich backgrounds and details.`
          }, {
            role: "user", 
            content: `Create ${pageCount} detailed coloring page scenes for: "${idea}". Each page should have rich backgrounds with 6-8 specific elements like furniture, decorations, nature items, etc.`
          }],
          max_tokens: 2000,
          temperature: 0.7
        });
        
        let extractedPages = [];
        try {
          const pageContent = pageExtraction.choices[0]?.message?.content?.trim();
          extractedPages = JSON.parse(pageContent || '[]');
        } catch (parseError) {
          console.log('Failed to parse page ideas, using fallback');
          extractedPages = [];
        }

        // Ensure we have the right number of pages with specific scenes
        const additionalScenes = [
          `${mainTheme} playing in a garden`,
          `${mainTheme} having breakfast`,
          `${mainTheme} meeting friends`,
          `${mainTheme} going on adventure`,
          `${mainTheme} reading a book`,
          `${mainTheme} playing with toys`,
          `${mainTheme} in a magical forest`,
          `${mainTheme} celebrating birthday`,
          `${mainTheme} learning something new`,
          `${mainTheme} helping others`,
          `${mainTheme} exploring new places`,
          `${mainTheme} having fun outdoors`
        ];

        while (extractedPages.length < pageCount) {
          const sceneIndex = extractedPages.length % additionalScenes.length;
          extractedPages.push({
            title: additionalScenes[sceneIndex],
            description: `A detailed coloring page showing ${additionalScenes[sceneIndex]} with clear outlines and fun details`
          });
        }

        // Format for frontend
        const formattedPages = extractedPages.slice(0, pageCount).map((page: any, index: number) => ({
          id: index + 1,
          pageNumber: index + 1,
          title: page.title || `Page ${index + 1}`,
          description: page.description || `A coloring page featuring ${mainTheme}`,
          editable: true
        }));

        console.log(`🎉 Successfully extracted ${formattedPages.length} page ideas`);
        
        return NextResponse.json({ 
          pageIdeas: formattedPages,
          enhancedPrompt: mainTheme,
          originalPrompt: idea,
          extracted: true
        });

      } catch (openaiError) {
        console.error('❌ OpenAI extraction failed:', openaiError);
        // Fall through to fallback
      }
    }

    // If this is Vercel (no OpenAI key), call Railway API
    if (WORKER_API_BASE && !process.env.OPENAI_API_KEY) {
      try {
        console.log(`📡 VERCEL: Calling Railway API to extract page ideas for: ${idea}`);
        
        const response = await fetch(`${WORKER_API_BASE}/api/extract-page-ideas`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            idea,
            pageCount
          })
        });

        if (response.ok) {
          const data = await response.json();
          console.log('✅ Railway API returned page ideas successfully');
          return NextResponse.json(data);
        } else {
          const errorText = await response.text();
          console.error('❌ Railway API failed:', response.status, errorText);
        }
      } catch (workerError) {
        console.error('❌ Railway API call failed:', workerError);
      }
    }

    // Final fallback: Generate simple page ideas
    console.log('Using fallback page idea generation');
    const fallbackIdeas = Array.from({length: pageCount}, (_, i) => ({
      id: i + 1,
      pageNumber: i + 1,
      title: `Page ${i + 1}`,
      description: `A coloring page related to: ${idea}`,
      editable: true
    }));

    return NextResponse.json({ 
      pageIdeas: fallbackIdeas,
      enhancedPrompt: idea,
      originalPrompt: idea,
      extracted: false
    });

  } catch (error: any) {
    console.error('Error extracting page ideas:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
