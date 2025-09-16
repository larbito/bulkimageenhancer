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

        // Step 2: Extract specific page ideas
        console.log(`📝 Extracting ${pageCount} specific page ideas...`);
        const pageExtraction = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [{
            role: "system",
            content: `You are extracting specific coloring page ideas from a user's description. The user wants ${pageCount} pages. Extract specific scenes/activities mentioned in their description. If they don't provide enough specific ideas, create similar ones that fit their theme. Return a JSON array of objects with: {"pageNumber": 1, "title": "Short Title", "description": "Detailed description of what to draw"}. Focus on single scenes that would work well as coloring pages.`
          }, {
            role: "user", 
            content: `Extract ${pageCount} specific coloring page ideas from this description: "${idea}"`
          }],
          max_tokens: 800,
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

        // Ensure we have the right number of pages
        while (extractedPages.length < pageCount) {
          extractedPages.push({
            pageNumber: extractedPages.length + 1,
            title: `${mainTheme} Adventure ${extractedPages.length + 1}`,
            description: `A coloring page showing ${mainTheme} in an interesting scene or activity`
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
