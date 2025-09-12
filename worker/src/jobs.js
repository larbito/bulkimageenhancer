import { generatePageImage } from './services.js';

// In-memory job storage (replace with database later)
const jobs = new Map();
const projects = new Map();

export function createJob(type, projectId, payload = {}) {
  const job = {
    id: 'job_' + Date.now(),
    type,
    projectId,
    payload,
    status: 'queued',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    errorText: null
  };
  
  jobs.set(job.id, job);
  return job;
}

export function getJob(jobId) {
  return jobs.get(jobId);
}

export function updateJob(jobId, updates) {
  const job = jobs.get(jobId);
  if (job) {
    Object.assign(job, updates, { updatedAt: new Date().toISOString() });
    jobs.set(jobId, job);
  }
  return job;
}

export function getProject(projectId) {
  return projects.get(projectId);
}

export function setProject(projectId, project) {
  projects.set(projectId, project);
  return project;
}

export async function processPageGeneration(job, logger) {
  logger.info({ jobId: job.id, projectId: job.projectId }, 'Processing page generation job');
  
  try {
    updateJob(job.id, { status: 'running' });
    
    const project = getProject(job.projectId);
    if (!project) {
      throw new Error('Project not found');
    }
    
    const { ideas, styleTemplate, title } = project;
    if (!ideas || !styleTemplate) {
      throw new Error('Missing project data');
    }
    
    logger.info({ ideaCount: ideas.length }, 'Starting page generation');
    
    // Process each page idea
    const results = [];
    for (let i = 0; i < ideas.length; i++) {
      const idea = ideas[i];
      logger.info({ index: i + 1, ideaText: idea.ideaText }, 'Generating page');
      
      try {
        const imageResult = await generatePageImage(
          idea.ideaText,
          styleTemplate,
          title,
          logger
        );
        
        results.push({
          ideaId: idea.id,
          ...imageResult
        });
        
        logger.info({ index: i + 1, upscaledUrl: imageResult.upscaledUrl }, 'Page completed');
        
        // Small delay to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        logger.error({ error, index: i + 1 }, 'Failed to generate page');
        // Add placeholder on error
        results.push({
          ideaId: idea.id,
          baseUrl: `https://placehold.co/1024x1024/ffffff/000000?text=Page+${i + 1}`,
          upscaledUrl: `https://placehold.co/2048x2048/ffffff/000000?text=Page+${i + 1}`,
          width: 2048,
          height: 2048
        });
      }
    }
    
    // Update project with generated images
    project.images = results;
    setProject(job.projectId, project);
    
    updateJob(job.id, { 
      status: 'done',
      payload: { ...job.payload, results: results.length }
    });
    
    logger.info({ jobId: job.id, resultCount: results.length }, 'Page generation completed');
    
  } catch (error) {
    logger.error({ error, jobId: job.id }, 'Page generation failed');
    updateJob(job.id, { 
      status: 'error', 
      errorText: error.message 
    });
  }
}

// Simple job runner
let isProcessing = false;

export async function processJobs(logger) {
  if (isProcessing) return;
  isProcessing = true;
  
  try {
    // Find next queued job
    const queuedJob = Array.from(jobs.values()).find(job => job.status === 'queued');
    
    if (queuedJob) {
      logger.info({ jobId: queuedJob.id, type: queuedJob.type }, 'Processing job');
      
      if (queuedJob.type === 'page_gen') {
        await processPageGeneration(queuedJob, logger);
      } else if (queuedJob.type === 'style_gen') {
        // Handle style generation if needed
        updateJob(queuedJob.id, { status: 'done' });
      } else {
        updateJob(queuedJob.id, { 
          status: 'error', 
          errorText: 'Unknown job type' 
        });
      }
    }
  } catch (error) {
    logger.error({ error }, 'Job processing error');
  } finally {
    isProcessing = false;
  }
}

export function startJobRunner(logger) {
  setInterval(() => {
    processJobs(logger);
  }, 2000); // Check every 2 seconds
  
  logger.info('Job runner started');
}
