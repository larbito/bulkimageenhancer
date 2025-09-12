const express = require('express');
const pino = require('pino');

const app = express();
const logger = pino();

app.use(express.json({ limit: '10mb' }));

// In-memory storage for testing
const projects = new Map();
const jobs = new Map();

app.get('/health', (req, res) => {
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

app.get('/', (req, res) => {
  res.json({ 
    name: 'Coloring Book Worker', 
    status: 'running',
    timestamp: new Date().toISOString()
  });
});

// Create project
app.post('/api/projects', (req, res) => {
  try {
    const { title, pagesRequested } = req.body || {};
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
    
    projects.set(project.id, project);
    logger.info({ projectId: project.id, title: project.title }, 'Created project');
    res.json(project);
  } catch (error) {
    logger.error({ error }, 'Failed to create project');
    res.status(500).json({ error: 'Failed to create project' });
  }
});

// Generate style candidates (mock for now)
app.post('/api/projects/:id/styles', (req, res) => {
  try {
    const projectId = String(req.params.id);
    const project = projects.get(projectId);
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    const candidates = [
      {
        id: 'style_1',
        projectId,
        promptText: 'Thin clean outlines, full body view, minimal background',
        params: { lineThickness: 'thin', stroke: 'clean', framing: 'full body' },
        thumbnailUrl: 'https://placehold.co/512x512/ffffff/000000?text=Thin+Clean',
        selected: false
      },
      {
        id: 'style_2', 
        projectId,
        promptText: 'Medium weight outlines, half body view, simple scene',
        params: { lineThickness: 'medium', stroke: 'clean', framing: 'half body' },
        thumbnailUrl: 'https://placehold.co/512x512/ffffff/000000?text=Medium+Detail',
        selected: false
      },
      {
        id: 'style_3',
        projectId,
        promptText: 'Thick bold outlines, full body view, simple shapes',
        params: { lineThickness: 'thick', stroke: 'clean', framing: 'full body' },
        thumbnailUrl: 'https://placehold.co/512x512/ffffff/000000?text=Thick+Bold',
        selected: false
      },
      {
        id: 'style_4',
        projectId,
        promptText: 'Thin sketchy outlines, half body view, artistic style',
        params: { lineThickness: 'thin', stroke: 'sketchy', framing: 'half body' },
        thumbnailUrl: 'https://placehold.co/512x512/ffffff/000000?text=Thin+Sketchy',
        selected: false
      },
      {
        id: 'style_5',
        projectId,
        promptText: 'Medium clean outlines, full body view, scene background',
        params: { lineThickness: 'medium', stroke: 'clean', framing: 'full body' },
        thumbnailUrl: 'https://placehold.co/512x512/ffffff/000000?text=Medium+Scene',
        selected: false
      }
    ];
    
    logger.info({ projectId, candidateCount: candidates.length }, 'Generated style candidates');
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
    const { id: styleId } = req.body || {};
    
    const project = projects.get(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    project.selectedStyleId = styleId;
    project.status = 'style_selected';
    projects.set(projectId, project);
    
    logger.info({ projectId, styleId }, 'Style selected');
    res.json({ ok: true });
  } catch (error) {
    logger.error({ error }, 'Failed to select style');
    res.status(500).json({ error: 'Failed to select style' });
  }
});

// Generate ideas
app.post('/api/projects/:id/ideas', (req, res) => {
  try {
    const projectId = String(req.params.id);
    const project = projects.get(projectId);
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    const ideas = [];
    for (let i = 0; i < project.pagesRequested; i++) {
      ideas.push({
        id: `idea_${i + 1}`,
        projectId,
        index: i + 1,
        ideaText: `${project.title} scene ${i + 1}`,
        status: 'draft'
      });
    }
    
    project.ideas = ideas;
    project.status = 'ideas_generated';
    projects.set(projectId, project);
    
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
    const { count, ideas } = req.body || {};
    
    const project = projects.get(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    if (typeof count === 'number') {
      project.pagesRequested = count;
    }
    
    if (Array.isArray(ideas)) {
      project.ideas = ideas.map((idea, index) => ({
        id: idea.id || `idea_${index + 1}`,
        projectId,
        index: index + 1,
        ideaText: idea.ideaText,
        status: 'approved'
      }));
    }
    
    project.status = 'ideas_approved';
    projects.set(projectId, project);
    
    logger.info({ projectId }, 'Updated ideas');
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
    const project = projects.get(projectId);
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    const job = {
      id: 'job_' + Date.now(),
      type: 'page_gen',
      projectId,
      payload: {},
      status: 'queued',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    jobs.set(job.id, job);
    
    // Simulate job processing
    setTimeout(() => {
      const updatedJob = jobs.get(job.id);
      if (updatedJob) {
        updatedJob.status = 'running';
        jobs.set(job.id, updatedJob);
        
        setTimeout(() => {
          const finalJob = jobs.get(job.id);
          if (finalJob) {
            finalJob.status = 'done';
            jobs.set(job.id, finalJob);
            
            // Add mock images to project
            const mockImages = project.ideas.map((idea, i) => ({
              ideaId: idea.id,
              baseUrl: `https://placehold.co/1024x1024/ffffff/000000?text=Page+${i + 1}`,
              upscaledUrl: `https://placehold.co/2048x2048/ffffff/000000?text=Page+${i + 1}`,
              width: 2048,
              height: 2048
            }));
            
            project.images = mockImages;
            projects.set(projectId, project);
          }
        }, 5000);
      }
    }, 1000);
    
    logger.info({ jobId: job.id, projectId }, 'Created page generation job');
    res.json(job);
  } catch (error) {
    logger.error({ error }, 'Failed to create job');
    res.status(500).json({ error: 'Failed to create job' });
  }
});

// Get job status
app.get('/api/jobs/:id', (req, res) => {
  try {
    const jobId = String(req.params.id);
    const job = jobs.get(jobId);
    
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }
    
    res.json(job);
  } catch (error) {
    logger.error({ error }, 'Failed to get job');
    res.status(500).json({ error: 'Failed to get job' });
  }
});

// Get project
app.get('/api/projects/:id', (req, res) => {
  try {
    const projectId = String(req.params.id);
    const project = projects.get(projectId);
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    // Format response for frontend
    const response = {
      ...project,
      ideas: project.ideas ? project.ideas.map(idea => ({
        ...idea,
        images: project.images ? project.images.filter(img => img.ideaId === idea.id).map(img => ({
          id: `img_${idea.id}`,
          pageIdeaId: idea.id,
          stage: 'upscaled',
          url: img.upscaledUrl,
          width: img.width,
          height: img.height,
          meta: {}
        })) : []
      })) : []
    };
    
    res.json(response);
  } catch (error) {
    logger.error({ error }, 'Failed to get project');
    res.status(500).json({ error: 'Failed to get project' });
  }
});

// Export project
app.post('/api/projects/:id/export', (req, res) => {
  try {
    const projectId = String(req.params.id);
    const project = projects.get(projectId);
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
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
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error({ reason, promise }, 'Unhandled rejection');
});

app.listen(port, '0.0.0.0', () => {
  logger.info({ port }, 'worker listening on 0.0.0.0:' + port);
});