/**
 * Recording API Routes
 * Recording management, scheduling, and quality controls.
 */
import { Router } from 'express';
import { RecordingManager } from '../recording/recordingManager.js';
import { RecordingScheduler } from '../recording/recordingScheduler.js';
import { QualityManager } from '../recording/qualityManager.js';
import { legacyAuth } from '../middleware/auth.js';

const router = Router();

const recordingManager = new RecordingManager();
const scheduler = new RecordingScheduler();
const qualityManager = new QualityManager();

// ── Recording Routes ──────────────────────────────────────────

// POST /api/recording/start
router.post('/start', legacyAuth, (req, res) => {
  try {
    const { format, quality } = req.body;
    const recording = recordingManager.startRecording({ format, quality });
    res.json(recording);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// POST /api/recording/stop
router.post('/stop', legacyAuth, (req, res) => {
  try {
    const recording = recordingManager.stopRecording();
    if (!recording) return res.status(400).json({ error: 'No active recording' });
    res.json(recording);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// POST /api/recording/pause
router.post('/pause', legacyAuth, (req, res) => {
  try {
    const recording = recordingManager.pauseRecording();
    if (!recording) return res.status(400).json({ error: 'No active recording' });
    res.json(recording);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// POST /api/recording/resume
router.post('/resume', legacyAuth, (req, res) => {
  try {
    const recording = recordingManager.resumeRecording();
    if (!recording) return res.status(400).json({ error: 'No paused recording' });
    res.json(recording);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET /api/recording/status
router.get('/status', (req, res) => {
  res.json(recordingManager.getRecordingStatus());
});

// GET /api/recording/recordings
router.get('/recordings', (req, res) => {
  res.json(recordingManager.getRecordings());
});

// DELETE /api/recording/recordings/:id
router.delete('/recordings/:id', legacyAuth, (req, res) => {
  try {
    const deleted = recordingManager.deleteRecording(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Recording not found' });
    res.json({ ok: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET /api/recording/recordings/:id/download
router.get('/recordings/:id/download', (req, res) => {
  const recordings = recordingManager.getRecordings();
  const rec = recordings.find(r => r.id === req.params.id);
  if (!rec) return res.status(404).json({ error: 'Recording not found' });
  res.json({
    id: rec.id,
    format: rec.format,
    downloadUrl: `/downloads/recording-${rec.id}.${rec.format}`,
    message: 'Mock download - recording file would be served here',
  });
});

// ── Schedule Routes ──────────────────────────────────────────

// POST /api/recording/schedule
router.post('/schedule', (req, res) => {
  try {
    const scheduled = scheduler.schedule(req.body);
    res.json(scheduled);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET /api/recording/schedule
router.get('/schedule', (req, res) => {
  res.json(scheduler.getScheduled());
});

// DELETE /api/recording/schedule/:id
router.delete('/schedule/:id', (req, res) => {
  const cancelled = scheduler.cancel(req.params.id);
  if (!cancelled) return res.status(404).json({ error: 'Schedule not found' });
  res.json({ ok: true });
});

// ── Quality Routes ──────────────────────────────────────────

// GET /api/recording/quality/presets
router.get('/quality/presets', (req, res) => {
  res.json(qualityManager.getPresets());
});

// GET /api/recording/quality/current
router.get('/quality/current', (req, res) => {
  res.json(qualityManager.getCurrentQuality());
});

// PUT /api/recording/quality
router.put('/quality', (req, res) => {
  const { preset } = req.body;
  if (!preset) return res.status(400).json({ error: 'Preset name required' });
  const result = qualityManager.setQuality(preset);
  if (!result) return res.status(400).json({ error: 'Invalid preset' });
  res.json(result);
});

// POST /api/recording/quality/custom
router.post('/quality/custom', (req, res) => {
  const { name, ...config } = req.body;
  if (!name) return res.status(400).json({ error: 'Preset name required' });
  const preset = qualityManager.createCustomPreset(name, config);
  res.json(preset);
});

// GET /api/recording/quality/recommended
router.get('/quality/recommended', (req, res) => {
  const { width = 1920, height = 1080, framerate = 30 } = req.query;
  const result = qualityManager.getRecommendedBitrate(
    { width: parseInt(width, 10), height: parseInt(height, 10) },
    parseInt(framerate, 10)
  );
  res.json(result);
});

export default router;
