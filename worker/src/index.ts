import express from 'express';
import pino from 'pino';
import { prisma } from './db';

const app = express();
const logger = pino();

app.use(express.json({ limit: '10mb' }));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Stubs for API surface
app.post('/api/projects', async (req, res) => {
  try {
    const { title, pagesRequested } = req.body ?? {};
    const project = await prisma.project.create({
      data: {
        userId: 'anon',
        title: String(title || ''),
        pagesRequested: Number(pagesRequested || 10),
        status: 'draft',
      },
    });
    res.json(project);
  } catch (e: any) {
    logger.error(e);
    res.status(500).json({ error: 'failed_to_create_project' });
  }
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

app.post('/api/projects/:id/ideas', async (req, res) => {
  try {
    const projectId = String(req.params.id);
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    const count = project?.pagesRequested ?? 10;
    const created = await prisma.$transaction(
      Array.from({ length: count }).map((_, i) =>
        prisma.pageIdea.create({ data: { projectId, index: i + 1, ideaText: `Scene ${i + 1}`, status: 'draft' } })
      )
    );
    res.json({ ideas: created });
  } catch (e: any) {
    logger.error(e);
    res.status(500).json({ error: 'failed_to_generate_ideas' });
  }
});

app.put('/api/projects/:id/ideas', async (req, res) => {
  try {
    const projectId = String(req.params.id);
    const { count, ideas } = req.body ?? {};
    if (typeof count === 'number') {
      await prisma.project.update({ where: { id: projectId }, data: { pagesRequested: count } });
    }
    if (Array.isArray(ideas)) {
      for (const i of ideas) {
        if (i?.id && typeof i.ideaText === 'string') {
          await prisma.pageIdea.update({ where: { id: i.id }, data: { ideaText: i.ideaText } });
        }
      }
    }
    res.json({ ok: true });
  } catch (e: any) {
    logger.error(e);
    res.status(500).json({ error: 'failed_to_update_ideas' });
  }
});

app.post('/api/projects/:id/pages', (_req, res) => {
  res.json({ id: 'job_1', type: 'page_gen', projectId: 'proj_123', status: 'queued', payload: {} });
});

app.get('/api/jobs/:id', (_req, res) => {
  res.json({ id: 'job_1', type: 'page_gen', projectId: 'proj_123', status: 'running', payload: {} });
});

app.get('/api/projects/:id', async (req, res) => {
  try {
    const projectId = String(req.params.id);
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { styleProfile: true, ideas: { include: { images: true }, orderBy: { index: 'asc' } } },
    });
    if (!project) return res.status(404).json({ error: 'not_found' });
    res.json(project);
  } catch (e: any) {
    logger.error(e);
    res.status(500).json({ error: 'failed_to_get_project' });
  }
});

app.post('/api/projects/:id/export', (_req, res) => {
  res.json({ url: 'https://example.com/book.zip' });
});

const port = process.env.PORT || 3000;
app.listen(port, () => logger.info({ port }, 'worker listening'));


