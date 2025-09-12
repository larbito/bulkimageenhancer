import OpenAI from 'openai';
import Replicate from 'replicate';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

// Style prompt templates
const STYLE_TEMPLATES = [
  {
    id: 'style_1',
    name: 'Thin & Clean',
    params: { lineThickness: 'thin', stroke: 'clean', framing: 'full body' },
    prompt: 'black and white coloring page, thin clean outlines, full body view, minimal background, no shading, white background, high contrast'
  },
  {
    id: 'style_2', 
    name: 'Medium & Detailed',
    params: { lineThickness: 'medium', stroke: 'clean', framing: 'half body' },
    prompt: 'black and white coloring page, medium weight outlines, half body view, simple scene background, no shading, white background, detailed features'
  },
  {
    id: 'style_3',
    name: 'Thick & Bold', 
    params: { lineThickness: 'thick', stroke: 'clean', framing: 'full body' },
    prompt: 'black and white coloring page, thick bold outlines, full body view, minimal background, no shading, white background, simple shapes'
  },
  {
    id: 'style_4',
    name: 'Thin & Sketchy',
    params: { lineThickness: 'thin', stroke: 'sketchy', framing: 'half body' },
    prompt: 'black and white coloring page, thin sketchy outlines, half body view, minimal background, no shading, white background, artistic style'
  },
  {
    id: 'style_5',
    name: 'Medium & Scene',
    params: { lineThickness: 'medium', stroke: 'clean', framing: 'full body' },
    prompt: 'black and white coloring page, medium clean outlines, full body view, simple scene background, no shading, white background, centered subject'
  }
];

export async function generateStyleSamples(projectTitle, logger) {
  logger.info({ projectTitle }, 'Generating style samples');
  
  const samples = [];
  
  for (const template of STYLE_TEMPLATES) {
    try {
      const prompt = `${template.prompt}. Subject: ${projectTitle}. Coloring book style, black lines only, no color, no text, safe margins.`;
      
      logger.info({ templateId: template.id, prompt }, 'Generating style sample');
      
      const response = await openai.images.generate({
        model: "dall-e-3",
        prompt: prompt,
        size: "1024x1024",
        quality: "standard",
        n: 1,
      });
      
      const imageUrl = response.data[0]?.url;
      if (imageUrl) {
        samples.push({
          id: template.id,
          name: template.name,
          promptText: prompt,
          params: template.params,
          thumbnailUrl: imageUrl,
          selected: false
        });
        logger.info({ templateId: template.id, imageUrl }, 'Style sample generated');
      }
    } catch (error) {
      logger.error({ error, templateId: template.id }, 'Failed to generate style sample');
      // Add placeholder on error
      samples.push({
        id: template.id,
        name: template.name,
        promptText: template.prompt,
        params: template.params,
        thumbnailUrl: `https://placehold.co/512x512/ffffff/000000?text=${template.name.replace(' ', '+')}`,
        selected: false
      });
    }
  }
  
  return samples;
}

export async function generatePageImage(pageIdea, styleTemplate, projectTitle, logger) {
  logger.info({ pageIdea, styleTemplate }, 'Generating page image');
  
  try {
    const prompt = `${styleTemplate.prompt}. Scene: ${pageIdea}. Theme: ${projectTitle}. Black and white coloring page, clean outlines, no color, no shading, white background, centered composition, safe margins for printing.`;
    
    // Generate base image at 1024x1024 first
    const response = await openai.images.generate({
      model: "dall-e-3", 
      prompt: prompt,
      size: "1024x1024",
      quality: "standard",
      n: 1,
    });
    
    const baseImageUrl = response.data[0]?.url;
    if (!baseImageUrl) {
      throw new Error('No image URL returned from OpenAI');
    }
    
    logger.info({ baseImageUrl }, 'Base image generated');
    
    // Upscale with Replicate Real-ESRGAN
    const upscaleResponse = await replicate.run(
      "nightmareai/real-esrgan:42fed1c4974146d4d2414e2be2c5277c7fcf05fcc3a73abf41610695738c1d7b",
      {
        input: {
          image: baseImageUrl,
          scale: 2,
          face_enhance: false
        }
      }
    );
    
    const upscaledUrl = Array.isArray(upscaleResponse) ? upscaleResponse[0] : upscaleResponse;
    logger.info({ upscaledUrl }, 'Image upscaled');
    
    return {
      baseUrl: baseImageUrl,
      upscaledUrl: upscaledUrl,
      width: 2048, // 1024 * 2
      height: 2048
    };
    
  } catch (error) {
    logger.error({ error, pageIdea }, 'Failed to generate page image');
    throw error;
  }
}

export function generatePageIdeas(projectTitle, pageCount, logger) {
  logger.info({ projectTitle, pageCount }, 'Generating page ideas');
  
  // For now, generate simple themed ideas
  // TODO: Use OpenAI to generate more creative ideas
  const themes = {
    'unicorn': ['unicorn in a magical forest', 'unicorn by a rainbow', 'unicorn with fairy friends', 'unicorn in a castle garden', 'unicorn flying through clouds'],
    'ocean': ['dolphin jumping', 'sea turtle swimming', 'octopus in coral reef', 'whale song', 'seahorse dance'],
    'space': ['rocket ship launch', 'astronaut floating', 'alien planet landscape', 'space station', 'meteor shower'],
    'forest': ['woodland animals gathering', 'fairy house in tree', 'deer in clearing', 'owl on branch', 'mushroom village'],
    'adventure': ['treasure map', 'pirate ship', 'mountain climbing', 'cave exploration', 'jungle expedition']
  };
  
  // Find matching theme or use generic
  const themeKey = Object.keys(themes).find(key => 
    projectTitle.toLowerCase().includes(key)
  );
  
  const baseIdeas = themes[themeKey] || [
    'main character introduction',
    'setting the scene', 
    'meeting new friends',
    'facing a challenge',
    'discovering something magical',
    'helping others',
    'learning a lesson',
    'celebrating success',
    'peaceful moment',
    'happy ending'
  ];
  
  const ideas = [];
  for (let i = 0; i < pageCount; i++) {
    const baseIdea = baseIdeas[i % baseIdeas.length];
    const variation = Math.floor(i / baseIdeas.length) + 1;
    const ideaText = variation > 1 ? `${baseIdea} (variation ${variation})` : baseIdea;
    
    ideas.push({
      id: `idea_${i + 1}`,
      index: i + 1,
      ideaText: ideaText,
      status: 'draft'
    });
  }
  
  return ideas;
}
