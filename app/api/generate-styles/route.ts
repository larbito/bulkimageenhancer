import { NextRequest, NextResponse } from "next/server";
import OpenAI from 'openai';

const WORKER_API_BASE = process.env.WORKER_API_BASE || "https://web-production-0cd9.up.railway.app";

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

    // If this is Railway (has OpenAI key), generate directly with OpenAI
    if (openai && process.env.OPENAI_API_KEY) {
      try {
        console.log(`🎨 RAILWAY: Generating 5 coloring page styles with OpenAI for: ${idea}`);
        
        // Step 1: Enhance the user prompt to extract key elements
        console.log('🧠 Enhancing user prompt...');
        const promptEnhancement = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [{
            role: "system",
            content: "You are a prompt enhancer for coloring book generation. Extract the main subject/character from the user's description and create a clean, simple description suitable for coloring pages. Return only the main subject and theme, nothing else. Example: User says 'I want a coloring book about unicorn life with unicorns playing with princesses and making pancakes' -> You return 'unicorn adventures'"
          }, {
            role: "user", 
            content: `Extract the main subject for coloring pages from this user description: "${idea}"`
          }],
          max_tokens: 50,
          temperature: 0.3
        });
        
        const enhancedIdea = promptEnhancement.choices[0]?.message?.content?.trim() || idea;
        console.log(`✨ Enhanced idea: "${enhancedIdea}" (from original: "${idea.substring(0, 50)}...")`);
        
        // Define the 5 different styles we want to generate
        const styleDefinitions = [
          {
            id: 1,
            name: 'Bold Cartoon Style',
            description: 'Thick lines, simple shapes, kid-friendly',
            lineThickness: 'thick',
            complexity: 'simple',
            characterStyle: 'cartoon',
            prompt: `Coloring book page of ${enhancedIdea}, cartoon style, thick black outline only, simple line art, no filled black areas, no shading, no solid black shapes, only outlines to color, white background, single A4 page, coloring sheet format`
          },
          {
            id: 2,
            name: 'Detailed Realistic',
            description: 'Fine lines, intricate details, realistic proportions',
            lineThickness: 'fine',
            complexity: 'detailed',
            characterStyle: 'realistic',
            prompt: `Coloring book page of ${enhancedIdea}, realistic style, fine black outline only, detailed line art, no filled black areas, no shading, no solid black shapes, only outlines to color, white background, single A4 page, coloring sheet format`
          },
          {
            id: 3,
            name: 'Medium Line Art',
            description: 'Balanced lines, moderate detail, versatile',
            lineThickness: 'medium',
            complexity: 'moderate',
            characterStyle: 'semi-realistic',
            prompt: `Coloring book page of ${enhancedIdea}, medium black outline only, balanced detail, moderate complexity, no filled black areas, no shading, no solid black shapes, only outlines to color, white background, single A4 page, coloring sheet format`
          },
          {
            id: 4,
            name: 'Whimsical Fantasy',
            description: 'Flowing lines, magical elements, dreamy style',
            lineThickness: 'varied',
            complexity: 'moderate',
            characterStyle: 'fantasy',
            prompt: `Coloring book page of ${enhancedIdea}, whimsical fantasy style, flowing black outline only, magical elements, no filled black areas, no shading, no solid black shapes, only outlines to color, white background, single A4 page, coloring sheet format`
          },
          {
            id: 5,
            name: 'Minimalist Clean',
            description: 'Very thin lines, geometric, modern style',
            lineThickness: 'thin',
            complexity: 'simple',
            characterStyle: 'geometric',
            prompt: `Coloring book page of ${enhancedIdea}, minimalist style, thin black outline only, geometric shapes, simple design, no filled black areas, no shading, no solid black shapes, only outlines to color, white background, single A4 page, coloring sheet format`
          }
        ];

        // Generate all 5 styles in parallel
        const imagePromises = styleDefinitions.map(async (style) => {
          console.log(`🎨 Generating ${style.name}...`);
          
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
          
          console.log(`✅ Generated ${style.name}`);
          
          return {
            ...style,
            coloringPageUrl: response.data[0].url,
            stylePrompt: style.prompt
          };
        });

        const generatedStyles = await Promise.all(imagePromises);
        
        console.log(`🎉 Successfully generated ${generatedStyles.length} coloring page styles with OpenAI`);
        
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
        console.error('❌ OpenAI generation failed:', openaiError);
        // Fall through to fallback
      }
    }

    // If this is Vercel (no OpenAI key), call Railway API
    console.log(`🔍 Environment check: OPENAI_API_KEY=${process.env.OPENAI_API_KEY ? 'SET' : 'NOT_SET'}, WORKER_API_BASE=${WORKER_API_BASE}`);
    
    if (WORKER_API_BASE && !process.env.OPENAI_API_KEY) {
      try {
        console.log(`📡 VERCEL: Calling Railway API to generate styles for: ${idea}`);
        console.log(`Railway URL: ${WORKER_API_BASE}/api/generate-styles`);
        
        const response = await fetch(`${WORKER_API_BASE}/api/generate-styles`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            idea,
            pageCount,
            regenerate: regenerate || false
          })
        });

        console.log(`Railway API response status: ${response.status}`);
        
        if (response.ok) {
          const data = await response.json();
          console.log('✅ Railway API returned styles successfully');
          return NextResponse.json(data);
        } else {
          const errorText = await response.text();
          console.error('❌ Railway API failed:', response.status, errorText);
        }
      } catch (workerError) {
        console.error('❌ Railway API call failed:', workerError);
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