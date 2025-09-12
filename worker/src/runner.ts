import type pino from 'pino';
import { prisma } from './db';

async function processPageGen(jobId: string, projectId: string, logger: pino.Logger) {
  logger.info({ jobId, projectId }, 'processing page_gen');
  // Mark running
  await prisma.job.update({ where: { id: jobId }, data: { status: 'running' } });

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { ideas: { orderBy: { index: 'asc' } } },
  });
  if (!project) throw new Error('project_not_found');

  // Simulate rendering each page with placeholder images
  for (const idea of project.ideas) {
    const url = `https://placehold.co/2550x3300/ffffff/000000?text=Page+${idea.index}`;
    await prisma.pageImage.create({
      data: {
        pageIdeaId: idea.id,
        stage: 'upscaled',
        url,
        width: 2550,
        height: 3300,
        meta: {},
      },
    });
    // small delay to simulate work
    await new Promise((r) => setTimeout(r, 150));
  }

  await prisma.job.update({ where: { id: jobId }, data: { status: 'done' } });
}

async function processZip(jobId: string, projectId: string, logger: pino.Logger) {
  logger.info({ jobId, projectId }, 'processing zip');
  await prisma.job.update({ where: { id: jobId }, data: { status: 'running' } });
  // Simulate building zip
  await new Promise((r) => setTimeout(r, 1000));
  await prisma.job.update({ where: { id: jobId }, data: { status: 'done' } });
}

export function startRunner(logger: pino.Logger) {
  const intervalMs = Number(process.env.RUNNER_INTERVAL_MS || 1500);
  let busy = false;
  setInterval(async () => {
    if (busy) return;
    busy = true;
    try {
      const job = await prisma.job.findFirst({
        where: { status: 'queued' },
        orderBy: { createdAt: 'asc' },
      });
      if (!job) return;
      if (job.type === 'page_gen') {
        await processPageGen(job.id, job.projectId, logger);
      } else if (job.type === 'zip') {
        await processZip(job.id, job.projectId, logger);
      } else {
        await prisma.job.update({ where: { id: job.id }, data: { status: 'error', errorText: 'unsupported_job' } });
      }
    } catch (e: any) {
      logger.error(e);
    } finally {
      busy = false;
    }
  }, intervalMs);
  logger.info({ intervalMs }, 'runner started');
}


