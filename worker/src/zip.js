import archiver from 'archiver';
import { createWriteStream } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { ensureDir } from './storage.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export async function createProjectZip(project, logger) {
  logger.info({ projectId: project.id }, 'Creating project ZIP');
  
  try {
    const zipFilename = `${project.title.replace(/[^a-zA-Z0-9]/g, '-')}-coloring-book.zip`;
    const zipPath = join(__dirname, '..', 'storage', 'exports', zipFilename);
    
    await ensureDir(dirname(zipPath));
    
    const output = createWriteStream(zipPath);
    const archive = archiver('zip', { zlib: { level: 9 } });
    
    return new Promise((resolve, reject) => {
      output.on('close', () => {
        const publicUrl = `${process.env.PUBLIC_STORAGE_BASE || '/storage'}/exports/${zipFilename}`;
        logger.info({ zipPath, publicUrl, bytes: archive.pointer() }, 'ZIP created');
        resolve(publicUrl);
      });
      
      archive.on('error', (err) => {
        logger.error({ error: err }, 'ZIP creation failed');
        reject(err);
      });
      
      archive.pipe(output);
      
      // Add images to ZIP
      if (project.images && project.images.length > 0) {
        project.images.forEach((image, index) => {
          if (image.upscaledUrl && image.upscaledUrl.startsWith('http')) {
            // For now, just add a text file with the URL
            // In production, you'd download and add the actual image
            const filename = `page-${String(index + 1).padStart(3, '0')}.txt`;
            archive.append(image.upscaledUrl, { name: filename });
          }
        });
      }
      
      // Add project info
      const projectInfo = {
        title: project.title,
        pages: project.pagesRequested,
        style: project.styleTemplate?.name || 'Unknown',
        created: project.createdAt,
        ideas: project.ideas?.map(idea => idea.ideaText) || []
      };
      
      archive.append(JSON.stringify(projectInfo, null, 2), { name: 'project-info.json' });
      archive.append('# ' + project.title + '\n\nThis coloring book was generated with AI.\n\n## Pages:\n' + 
        (project.ideas?.map((idea, i) => `${i + 1}. ${idea.ideaText}`).join('\n') || ''), 
        { name: 'README.md' });
      
      archive.finalize();
    });
    
  } catch (error) {
    logger.error({ error, projectId: project.id }, 'Failed to create ZIP');
    throw error;
  }
}
