import express from 'express';
import pino from 'pino';

const app = express();
const logger = pino();

app.use(express.json({ limit: '10mb' }));

app.get('/health', (_req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'coloring-book-worker'
  });
});

app.get('/', (_req, res) => {
  res.json({ 
    name: 'Coloring Book Worker', 
    status: 'running',
    timestamp: new Date().toISOString()
  });
});

// Mock API endpoints for testing
app.post('/api/projects', (req, res) => {
  const { title, pagesRequested } = req.body ?? {};
  const project = {
    id: 'proj_' + Date.now(),
    userId: 'anon',
    title: String(title || ''),
    pagesRequested: Number(pagesRequested || 10),
    status: 'draft',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  logger.info({ project }, 'Created project');
  res.json(project);
});

app.post('/api/projects/:id/styles', (req, res) => {
  const projectId = String(req.params.id);
  const candidates = Array.from({ length: 5 }).map((_, i) => ({
    id: `style_${i + 1}`,
    projectId,
    promptText: `Style ${i + 1}: Black and white coloring page with clean lines`,
    params: { lineThickness: ['thin', 'medium', 'thick', 'thin', 'medium'][i] },
    thumbnailUrl: `https://placehold.co/512x512/ffffff/000000?text=Style+${i + 1}`,
    selected: false,
  }));
  logger.info({ projectId, count: candidates.length }, 'Generated style candidates');
  res.json({ candidates });
});

app.post('/api/projects/:id/styles/select', (req, res) => {
  const projectId = String(req.params.id);
  const { id: styleId } = req.body ?? {};
  logger.info({ projectId, styleId }, 'Selected style');
  res.json({ ok: true });
});

app.post('/api/projects/:id/ideas', (req, res) => {
  const projectId = String(req.params.id);
  const ideas = Array.from({ length: 10 }).map((_, i) => ({
    id: `idea_${i + 1}`,
    projectId,
    index: i + 1,
    ideaText: `Scene ${i + 1}: A magical moment in the story`,
    status: 'draft'
  }));
  logger.info({ projectId, count: ideas.length }, 'Generated ideas');
  res.json({ ideas });
});

app.put('/api/projects/:id/ideas', (req, res) => {
  const projectId = String(req.params.id);
  logger.info({ projectId }, 'Updated ideas');
  res.json({ ok: true });
});

app.post('/api/projects/:id/pages', (req, res) => {
  const projectId = String(req.params.id);
  const job = {
    id: 'job_' + Date.now(),
    type: 'page_gen',
    projectId,
    payload: {},
    status: 'queued',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  logger.info({ job }, 'Created page generation job');
  res.json(job);
});

app.get('/api/jobs/:id', (req, res) => {
  const jobId = String(req.params.id);
  const job = {
    id: jobId,
    type: 'page_gen',
    projectId: 'proj_123',
    status: 'done',
    payload: {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  logger.info({ jobId }, 'Retrieved job status');
  res.json(job);
});

app.get('/api/projects/:id', (req, res) => {
  const projectId = String(req.params.id);
  const project = {
    id: projectId,
    title: 'Demo Project',
    pagesRequested: 10,
    status: 'active',
    ideas: Array.from({ length: 10 }).map((_, i) => ({
      id: `idea_${i + 1}`,
      projectId,
      index: i + 1,
      ideaText: `Scene ${i + 1}`,
      status: 'approved',
      images: [{
        id: `img_${i + 1}`,
        pageIdeaId: `idea_${i + 1}`,
        stage: 'upscaled',
        url: `https://placehold.co/2550x3300/ffffff/000000?text=Page+${i + 1}`,
        width: 2550,
        height: 3300,
        meta: {}
      }]
    }))
  };
  logger.info({ projectId }, 'Retrieved project');
  res.json(project);
});

app.post('/api/projects/:id/export', (req, res) => {
  const projectId = String(req.params.id);
  logger.info({ projectId }, 'Exported project');
  res.json({ url: 'https://example.com/book.zip' });
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
});