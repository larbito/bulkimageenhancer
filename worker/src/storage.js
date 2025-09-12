import { writeFile, mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Simple local file storage (replace with S3/Vercel Blob later)
const STORAGE_ROOT = join(__dirname, '..', 'storage');

export async function ensureDir(path) {
  try {
    await mkdir(path, { recursive: true });
  } catch (error) {
    // Directory might already exist, ignore error
  }
}

export async function downloadAndSaveImage(imageUrl, filename, logger) {
  try {
    logger.info({ imageUrl, filename }, 'Downloading image');
    
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to download image: ${response.status}`);
    }
    
    const buffer = await response.arrayBuffer();
    const uint8Array = new Uint8Array(buffer);
    
    const filePath = join(STORAGE_ROOT, filename);
    await ensureDir(dirname(filePath));
    await writeFile(filePath, uint8Array);
    
    // Return a public URL (in production, this would be your CDN/storage URL)
    const publicUrl = `${process.env.PUBLIC_STORAGE_BASE || '/storage'}/${filename}`;
    
    logger.info({ filePath, publicUrl }, 'Image saved');
    return publicUrl;
    
  } catch (error) {
    logger.error({ error, imageUrl, filename }, 'Failed to save image');
    throw error;
  }
}

export function getStoragePath(projectId, stage, filename) {
  return `projects/${projectId}/${stage}/${filename}`;
}

export async function saveProjectImage(projectId, stage, imageUrl, index, logger) {
  const filename = `page-${String(index).padStart(3, '0')}.png`;
  const storagePath = getStoragePath(projectId, stage, filename);
  
  try {
    const publicUrl = await downloadAndSaveImage(imageUrl, storagePath, logger);
    return {
      filename,
      storagePath,
      publicUrl,
      originalUrl: imageUrl
    };
  } catch (error) {
    logger.error({ error, projectId, stage, index }, 'Failed to save project image');
    // Return original URL as fallback
    return {
      filename,
      storagePath,
      publicUrl: imageUrl,
      originalUrl: imageUrl
    };
  }
}
