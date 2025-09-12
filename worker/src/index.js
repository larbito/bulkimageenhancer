import express from 'express';
import pino from 'pino';
import { generateStyleSamples, generatePageIdeas } from './services.js';
import { createJob, getJob, getProject, setProject, startJobRunner } from './jobs.js';

const app = express();
const logger = pino();

app.use(express.json({ limit: '10mb' }));

app.get('/health', (_req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'coloring-book-worker',
    apis: {
      openai: !!process.env.OPENAI_API_KEY,
      replicate: !!process.env.REPLICATE_API_TOKEN
    }
  });
});

app.get('/', (_req, res) => {
  res.json({ 
    name: 'Coloring Book Worker', 
    status: 'running',
    timestamp: new Date().toISOString()
  });
});

// Create project
app.post('/api/projects', (req, res) => {
  const { title, pagesRequested } = req.body ?? {};
  const project = {
    id: 'proj_' + Date.now(),
    userId: 'anon',
    title: String(title || ''),
    pagesRequested: Number(pagesRequested || 10),
    status: 'draft',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ideas: null,
    styleTemplate: null,
    images: null
  };
  
  setProject(project.id, project);
  logger.info({ project }, 'Created project');
  res.json(project);
});

// Generate style candidates
app.post('/api/projects/:id/styles', async (req, res) => {
  try {
    const projectId = String(req.params.id);
    const project = getProject(projectId);
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    logger.info({ projectId, title: project.title }, 'Generating styles');
    
    const candidates = await generateStyleSamples(project.title, logger);
    
    res.json({ candidates });
  } catch (error) {
    logger.error({ error }, 'Failed to generate styles');
    res.status(500).json({ error: 'Failed to generate styles' });
  }
});

// Select style
app.post('/api/projects/:id/styles/select', (req, res) => {
  try {
    const projectId = String(req.params.id);
    const { id: styleId } = req.body ?? {};
    
    const project = getProject(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    // Find the selected style template
    const STYLE_TEMPLATES = [
      { id: 'style_1', name: 'Thin & Clean', params: { lineThickness: 'thin', stroke: 'clean', framing: 'full body' }, prompt: 'black and white coloring page, thin clean outlines, full body view, minimal background, no shading, white background, high contrast' },
      { id: 'style_2', name: 'Medium & Detailed', params: { lineThickness: 'medium', stroke: 'clean', framing: 'half body' }, prompt: 'black and white coloring page, medium weight outlines, half body view, simple scene background, no shading, white background, detailed features' },
      { id: 'style_3', name: 'Thick & Bold', params: { lineThickness: 'thick', stroke: 'clean', framing: 'full body' }, prompt: 'black and white coloring page, thick bold outlines, full body view, minimal background, no shading, white background, simple shapes' },
      { id: 'style_4', name: 'Thin & Sketchy', params: { lineThickness: 'thin', stroke: 'sketchy', framing: 'half body' }, prompt: 'black and white coloring page, thin sketchy outlines, half body view, minimal background, no shading, white background, artistic style' },
      { id: 'style_5', name: 'Medium & Scene', params: { lineThickness: 'medium', stroke: 'clean', framing: 'full body' }, prompt: 'black and white coloring page, medium clean outlines, full body view, simple scene background, no shading, white background, centered subject' }
    ];
    
    const selectedTemplate = STYLE_TEMPLATES.find(t => t.id === styleId);
    if (!selectedTemplate) {
      return res.status(400).json({ error: 'Invalid style ID' });
    }
    
    project.styleTemplate = selectedTemplate;
    project.status = 'style_selected';
    setProject(projectId, project);
    
    logger.info({ projectId, styleId, styleName: selectedTemplate.name }, 'Style selected');
    res.json({ ok: true, style: selectedTemplate });
  } catch (error) {
    logger.error({ error }, 'Failed to select style');
    res.status(500).json({ error: 'Failed to select style' });
  }
});

// Generate ideas
app.post('/api/projects/:id/ideas', (req, res) => {
  try {
    const projectId = String(req.params.id);
    const project = getProject(projectId);
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    const ideas = generatePageIdeas(project.title, project.pagesRequested, logger);
    project.ideas = ideas;
    project.status = 'ideas_generated';
    setProject(projectId, project);
    
    logger.info({ projectId, ideaCount: ideas.length }, 'Generated ideas');
    res.json({ ideas });
  } catch (error) {
    logger.error({ error }, 'Failed to generate ideas');
    res.status(500).json({ error: 'Failed to generate ideas' });
  }
});

// Update ideas
app.put('/api/projects/:id/ideas', (req, res) => {
  try {
    const projectId = String(req.params.id);
    const { count, ideas } = req.body ?? {};
    
    const project = getProject(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    if (typeof count === 'number') {
      project.pagesRequested = count;
    }
    
    if (Array.isArray(ideas)) {
      project.ideas = ideas.map((idea, index) => ({
        id: idea.id || `idea_${index + 1}`,
        index: index + 1,
        ideaText: idea.ideaText,
        status: 'approved'
      }));
    }
    
    project.status = 'ideas_approved';
    setProject(projectId, project);
    
    logger.info({ projectId, ideaCount: project.ideas?.length }, 'Updated ideas');
    res.json({ ok: true });
  } catch (error) {
    logger.error({ error }, 'Failed to update ideas');
    res.status(500).json({ error: 'Failed to update ideas' });
  }
});

// Start page generation
app.post('/api/projects/:id/pages', (req, res) => {
  try {
    const projectId = String(req.params.id);
    const project = getProject(projectId);
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    if (!project.styleTemplate || !project.ideas) {
      return res.status(400).json({ error: 'Project not ready for page generation' });
    }
    
    const job = createJob('page_gen', projectId, {
      pageCount: project.ideas.length
    });
    
    logger.info({ jobId: job.id, projectId }, 'Created page generation job');
    res.json(job);
  } catch (error) {
    logger.error({ error }, 'Failed to create page generation job');
    res.status(500).json({ error: 'Failed to create job' });
  }
});

// Get job status
app.get('/api/jobs/:id', (req, res) => {
  try {
    const jobId = String(req.params.id);
    const job = getJob(jobId);
    
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }
    
    res.json(job);
  } catch (error) {
    logger.error({ error }, 'Failed to get job');
    res.status(500).json({ error: 'Failed to get job' });
  }
});

// Get project with all data
app.get('/api/projects/:id', (req, res) => {
  try {
    const projectId = String(req.params.id);
    const project = getProject(projectId);
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    // Format response to match frontend expectations
    const response = {
      ...project,
      ideas: project.ideas?.map(idea => ({
        ...idea,
        images: project.images?.filter(img => img.ideaId === idea.id).map(img => ({
          id: `img_${idea.id}`,
          pageIdeaId: idea.id,
          stage: 'upscaled',
          url: img.upscaledUrl,
          width: img.width,
          height: img.height,
          meta: {}
        })) || []
      })) || []
    };
    
    res.json(response);
  } catch (error) {
    logger.error({ error }, 'Failed to get project');
    res.status(500).json({ error: 'Failed to get project' });
  }
});

// Export project as ZIP
app.post('/api/projects/:id/export', (req, res) => {
  try {
    const projectId = String(req.params.id);
    const project = getProject(projectId);
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    // For now, return a placeholder ZIP URL
    // TODO: Implement actual ZIP generation
    const zipUrl = `https://example.com/exports/${projectId}/coloring-book.zip`;
    
    logger.info({ projectId, zipUrl }, 'Export requested');
    res.json({ url: zipUrl });
  } catch (error) {
    logger.error({ error }, 'Failed to export project');
    res.status(500).json({ error: 'Failed to export project' });
  }
});

const port = process.env.PORT || 3000;

process.on('uncaughtException', (error) => {
  logger.error({ error }, 'Uncaught exception');
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error({ reason, promise }, 'Unhandled rejection');
  process.exit(1);
});

app.listen(port, '0.0.0.0', () => {
  logger.info({ port }, 'worker listening on 0.0.0.0:' + port);
  startJobRunner(logger);
});