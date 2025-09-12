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

app.post('/api/projects/:id/styles', async (req, res) => {
  try {
    const projectId = String(req.params.id);
    const idea = (await prisma.project.findUnique({ where: { id: projectId } }))?.title || 'Your idea';
    const variants = [
      { line: 'thin', stroke: 'clean', framing: 'full body', bg: 'minimal', detail: 'low' },
      { line: 'medium', stroke: 'clean', framing: 'half body', bg: 'simple scene', detail: 'medium' },
      { line: 'thick', stroke: 'clean', framing: 'full body', bg: 'minimal', detail: 'low' },
      { line: 'thin', stroke: 'sketchy', framing: 'half body', bg: 'minimal', detail: 'low' },
      { line: 'medium', stroke: 'clean', framing: 'full body', bg: 'simple scene', detail: 'low' },
    ];
    const candidates = variants.map((v, i) => ({
      id: `style_${i + 1}`,
      projectId,
      promptText: `Black and white coloring page, ${v.line} lines, ${v.stroke} outlines, ${v.framing}, ${v.bg}, ${v.detail} detail. Idea: ${idea}`,
      params: v,
      thumbnailUrl: `https://placehold.co/512x512/ffffff/000000?text=Style+${i + 1}`,
      selected: false,
    }));
    res.json({ candidates });
  } catch (e: any) {
    logger.error(e);
    res.status(500).json({ error: 'failed_to_sample_styles' });
  }
});

app.post('/api/projects/:id/styles/select', async (req, res) => {
  try {
    const projectId = String(req.params.id);
    const { id: candidateId } = req.body ?? {};
    // In lieu of persisted candidates, derive params from candidate id
    const map: Record<string, any> = {
      style_1: { line: 'thin', framing: 'full body' },
      style_2: { line: 'medium', framing: 'half body' },
      style_3: { line: 'thick', framing: 'full body' },
      style_4: { line: 'thin', framing: 'half body' },
      style_5: { line: 'medium', framing: 'full body' },
    };
    const params = map[String(candidateId)] ?? { line: 'medium', framing: 'full body' };
    const stylePrompt = [
      'black and white coloring page',
      'clean bold outlines',
      'no shading no gray fills',
      'white background',
      'high contrast ink look',
      'centered main subject',
      'avoid text and logos',
      'safe margins for trim',
    ].join(', ');
    const profile = await prisma.styleProfile.upsert({
      where: { projectId },
      create: { projectId, stylePrompt, params, seed: null, characterRef: null },
      update: { stylePrompt, params },
    });
    res.json(profile);
  } catch (e: any) {
    logger.error(e);
    res.status(500).json({ error: 'failed_to_select_style' });
  }
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

app.post('/api/projects/:id/pages', async (req, res) => {
  try {
    const projectId = String(req.params.id);
    const job = await prisma.job.create({
      data: { type: 'page_gen', projectId, payload: {}, status: 'queued' },
    });
    res.json(job);
  } catch (e: any) {
    logger.error(e);
    res.status(500).json({ error: 'failed_to_queue_pages' });
  }
});

app.get('/api/jobs/:id', async (req, res) => {
  try {
    const jobId = String(req.params.id);
    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job) return res.status(404).json({ error: 'not_found' });
    res.json(job);
  } catch (e: any) {
    logger.error(e);
    res.status(500).json({ error: 'failed_to_get_job' });
  }
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

app.post('/api/projects/:id/export', async (req, res) => {
  try {
    const projectId = String(req.params.id);
    await prisma.job.create({ data: { type: 'zip', projectId, payload: {}, status: 'queued' } });
    // Placeholder: would return a generated URL after job completes
    res.json({ url: 'https://example.com/book.zip' });
  } catch (e: any) {
    logger.error(e);
    res.status(500).json({ error: 'failed_to_queue_zip' });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => logger.info({ port }, 'worker listening'));


