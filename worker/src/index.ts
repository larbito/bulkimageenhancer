import express from 'express';
import pino from 'pino';

const app = express();
const logger = pino();

app.use(express.json({ limit: '10mb' }));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Stubs for API surface
app.post('/api/projects', (req, res) => {
  res.json({ id: 'proj_123', title: req.body?.title ?? '', pagesRequested: req.body?.pagesRequested ?? 10 });
});

app.post('/api/projects/:id/styles', (_req, res) => {
  const candidates = Array.from({ length: 5 }).map((_, i) => ({
    id: `style_${i + 1}`,
    projectId: 'proj_123',
    promptText: 'Sample style prompt',
    params: { lineThickness: 'medium' },
    thumbnailUrl: 'https://placehold.co/512x512/FFFFFF/000000.svg?text=Style',
    selected: false,
  }));
  res.json({ candidates });
});

app.post('/api/projects/:id/styles/select', (_req, res) => {
  res.json({ ok: true });
});

app.post('/api/projects/:id/ideas', (_req, res) => {
  const ideas = Array.from({ length: 10 }).map((_, i) => ({ id: `idea_${i + 1}`, projectId: 'proj_123', index: i + 1, ideaText: `Scene ${i + 1}`, status: 'draft' }));
  res.json({ ideas });
});

app.put('/api/projects/:id/ideas', (_req, res) => {
  res.json({ ok: true });
});

app.post('/api/projects/:id/pages', (_req, res) => {
  res.json({ id: 'job_1', type: 'page_gen', projectId: 'proj_123', status: 'queued', payload: {} });
});

app.get('/api/jobs/:id', (_req, res) => {
  res.json({ id: 'job_1', type: 'page_gen', projectId: 'proj_123', status: 'running', payload: {} });
});

app.get('/api/projects/:id', (_req, res) => {
  res.json({ id: 'proj_123', title: 'Demo', pagesRequested: 10, ideas: [] });
});

app.post('/api/projects/:id/export', (_req, res) => {
  res.json({ url: 'https://example.com/book.zip' });
});

const port = process.env.PORT || 3000;
app.listen(port, () => logger.info({ port }, 'worker listening'));


