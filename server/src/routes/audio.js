/**
 * Audio API Routes
 * Audio mixer, levels, visualization, and effects management.
 */
import { Router } from 'express';
import { AudioMixer } from '../audio/audioMixer.js';
import { AudioVisualizer } from '../audio/audioVisualizer.js';
import { AudioProcessor } from '../audio/audioProcessor.js';

const router = Router();

const audioMixer = new AudioMixer();
const audioVisualizer = new AudioVisualizer();
const audioProcessor = new AudioProcessor();

// GET /api/audio/channels
router.get('/channels', (req, res) => {
  res.json(audioMixer.getChannels());
});

// POST /api/audio/channels
router.post('/channels', (req, res) => {
  try {
    const { name } = req.body;
    const channel = audioMixer.addChannel(name);
    res.json(channel);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/audio/channels/:id
router.delete('/channels/:id', (req, res) => {
  const deleted = audioMixer.removeChannel(req.params.id);
  if (!deleted) return res.status(404).json({ error: 'Channel not found' });
  res.json({ ok: true });
});

// PUT /api/audio/channels/:id/volume
router.put('/channels/:id/volume', (req, res) => {
  const { level } = req.body;
  const ch = audioMixer.setVolume(req.params.id, level);
  if (!ch) return res.status(404).json({ error: 'Channel not found' });
  res.json(ch);
});

// PUT /api/audio/channels/:id/mute
router.put('/channels/:id/mute', (req, res) => {
  const { mute } = req.body;
  const ch = audioMixer.setMute(req.params.id, mute);
  if (!ch) return res.status(404).json({ error: 'Channel not found' });
  res.json(ch);
});

// PUT /api/audio/channels/:id/solo
router.put('/channels/:id/solo', (req, res) => {
  const { solo } = req.body;
  const ch = audioMixer.setSolo(req.params.id, solo);
  if (!ch) return res.status(404).json({ error: 'Channel not found' });
  res.json(ch);
});

// PUT /api/audio/channels/:id/pan
router.put('/channels/:id/pan', (req, res) => {
  const { pan } = req.body;
  const ch = audioMixer.setPan(req.params.id, pan);
  if (!ch) return res.status(404).json({ error: 'Channel not found' });
  res.json(ch);
});

// GET /api/audio/master
router.get('/master', (req, res) => {
  res.json({ volume: audioMixer.getMasterVolume() });
});

// PUT /api/audio/master
router.put('/master', (req, res) => {
  const { level } = req.body;
  audioMixer.setMasterVolume(level);
  res.json({ volume: audioMixer.getMasterVolume() });
});

// GET /api/audio/levels
router.get('/levels', (req, res) => {
  const channelCount = audioMixer.getChannels().length || 1;
  res.json(audioVisualizer.getLevels(channelCount));
});

// GET /api/audio/visualizer
router.get('/visualizer', (req, res) => {
  const { channel = 0, type = 'spectrum' } = req.query;
  const ch = parseInt(channel, 10);
  if (type === 'waveform') {
    res.json({ waveform: audioVisualizer.getWaveform(ch) });
  } else {
    res.json(audioVisualizer.getSpectrum(ch));
  }
});

// GET /api/audio/effects/presets
router.get('/effects/presets', (req, res) => {
  res.json([
    { id: 'broadcast', ...audioProcessor.getPresetEffects('broadcast') },
    { id: 'podcast', ...audioProcessor.getPresetEffects('podcast') },
    { id: 'music', ...audioProcessor.getPresetEffects('music') },
    { id: 'voice', ...audioProcessor.getPresetEffects('voice') },
    { id: 'quiet', ...audioProcessor.getPresetEffects('quiet') },
  ]);
});

// GET /api/audio/mix
router.get('/mix', (req, res) => {
  res.json(audioMixer.getMixState());
});

export default router;
