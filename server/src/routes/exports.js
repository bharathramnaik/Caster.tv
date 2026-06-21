/**
 * Export API Routes
 * POST /api/exports/html - Export as HTML
 * POST /api/exports/image - Export as image
 * POST /api/exports/video - Export as video
 * POST /api/exports/batch - Batch export
 * GET /api/exports/status/:jobId - Check export status
 * GET /api/exports/download/:jobId - Download export
 */
import { Router } from 'express';
import { nanoid } from 'nanoid';
import { requireAuth, optionalAuth } from '../middleware/auth.js';
import { processExportJob } from '../export/worker.js';

const router = Router();

const jobs = new Map();

function createJob(type, options) {
  const jobId = `job_${nanoid(8)}`;
  const job = {
    id: jobId,
    type,
    options,
    status: 'pending',
    progress: 0,
    result: null,
    error: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  jobs.set(jobId, job);
  return job;
}

function updateJob(jobId, patch) {
  const job = jobs.get(jobId);
  if (!job) return null;
  Object.assign(job, patch, { updatedAt: new Date().toISOString() });
  return job;
}

// POST /api/exports/html
router.post('/html', requireAuth, async (req, res) => {
  try {
    const { sourceData, sourceType, htmlFormat = 'static', width = 1920, height = 1080, background = 'transparent', title = 'Export' } = req.body;

    const job = createJob('html', { sourceData, sourceType, htmlFormat, width, height, background, title });
    updateJob(job.id, { status: 'processing', progress: 20 });

    const result = await processExportJob(job);

    updateJob(job.id, { status: 'completed', progress: 100, result });

    const contentTypes = {
      html: 'text/html',
      obs: 'text/html',
      vmix: 'text/html',
      wirecast: 'text/html',
      embed: 'text/html',
      zip: 'application/zip',
    };

    if (result.zip) {
      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', `attachment; filename="${result.filename || 'export.zip'}"`);
      res.send(result.zip);
    } else {
      res.json({
        jobId: job.id,
        content: result.content,
        filename: result.filename,
        mimeType: contentTypes[htmlFormat] || 'text/html',
        downloadUrl: `/api/exports/download/${job.id}`,
      });
    }
  } catch (err) {
    console.error('HTML export error:', err);
    res.status(500).json({ error: 'Failed to export HTML' });
  }
});

// POST /api/exports/image
router.post('/image', requireAuth, async (req, res) => {
  try {
    const { sourceData, sourceType, imageFormat = 'png', quality = 80, width = 1920, height = 1080, transparent = true } = req.body;

    const job = createJob('image', { sourceData, sourceType, imageFormat, quality, width, height, transparent });
    updateJob(job.id, { status: 'processing', progress: 20 });

    const result = await processExportJob(job);

    updateJob(job.id, { status: 'completed', progress: 100, result });

    res.json({
      jobId: job.id,
      content: result.content,
      filename: result.filename,
      mimeType: result.mimeType,
      downloadUrl: `/api/exports/download/${job.id}`,
    });
  } catch (err) {
    console.error('Image export error:', err);
    res.status(500).json({ error: 'Failed to export image' });
  }
});

// POST /api/exports/video
router.post('/video', requireAuth, async (req, res) => {
  try {
    const { sourceData, sourceType, videoFormat = 'mp4', quality = 80, width = 1920, height = 1080, fps = 30, duration = 5, loop = false } = req.body;

    const job = createJob('video', { sourceData, sourceType, videoFormat, quality, width, height, fps, duration, loop });
    updateJob(job.id, { status: 'processing', progress: 10 });

    const result = await processExportJob(job);

    updateJob(job.id, { status: 'completed', progress: 100, result });

    res.json({
      jobId: job.id,
      content: result.content,
      filename: result.filename,
      mimeType: result.mimeType,
      downloadUrl: `/api/exports/download/${job.id}`,
    });
  } catch (err) {
    console.error('Video export error:', err);
    res.status(500).json({ error: 'Failed to export video' });
  }
});

// POST /api/exports/batch
router.post('/batch', requireAuth, async (req, res) => {
  try {
    const { exports: exportList } = req.body;

    if (!Array.isArray(exportList) || exportList.length === 0) {
      return res.status(400).json({ error: 'No exports specified' });
    }

    const batchJobId = `batch_${nanoid(8)}`;
    const batchJobs = [];

    for (const exp of exportList) {
      const job = createJob(exp.type || 'html', { ...exp, batchId: batchJobId });
      batchJobs.push(job);
    }

    const results = [];
    for (const job of batchJobs) {
      updateJob(job.id, { status: 'processing', progress: 20 });
      try {
        const result = await processExportJob(job);
        updateJob(job.id, { status: 'completed', progress: 100, result });
        results.push({ jobId: job.id, status: 'completed', ...result });
      } catch (err) {
        updateJob(job.id, { status: 'failed', error: err.message });
        results.push({ jobId: job.id, status: 'failed', error: err.message });
      }
    }

    res.json({ batchJobId, results });
  } catch (err) {
    console.error('Batch export error:', err);
    res.status(500).json({ error: 'Batch export failed' });
  }
});

// GET /api/exports/status/:jobId
router.get('/status/:jobId', optionalAuth, (req, res) => {
  const job = jobs.get(req.params.jobId);
  if (!job) return res.status(404).json({ error: 'Job not found' });

  res.json({
    id: job.id,
    type: job.type,
    status: job.status,
    progress: job.progress,
    error: job.error,
    createdAt: job.createdAt,
    updatedAt: job.updatedAt,
  });
});

// GET /api/exports/download/:jobId
router.get('/download/:jobId', optionalAuth, (req, res) => {
  const job = jobs.get(req.params.jobId);
  if (!job) return res.status(404).json({ error: 'Job not found' });
  if (job.status !== 'completed') return res.status(400).json({ error: 'Export not ready' });
  if (!job.result) return res.status(500).json({ error: 'No result available' });

  const mimeTypes = {
    html: 'text/html',
    image: 'image/png',
    video: 'video/mp4',
    gif: 'image/gif',
    webm: 'video/webm',
  };

  const mime = mimeTypes[job.type] || 'application/octet-stream';

  if (job.result.content) {
    res.setHeader('Content-Type', mime);
    res.setHeader('Content-Disposition', `attachment; filename="${job.result.filename || `export.${job.type}`}"`);
    res.send(job.result.content);
  } else if (job.result.buffer) {
    res.setHeader('Content-Type', mime);
    res.setHeader('Content-Disposition', `attachment; filename="${job.result.filename || `export.${job.type}`}"`);
    res.send(Buffer.from(job.result.buffer, 'base64'));
  } else {
    res.status(500).json({ error: 'Export data unavailable' });
  }
});

export default router;
