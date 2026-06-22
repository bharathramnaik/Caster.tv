import { Router } from 'express';
import { nanoid } from 'nanoid';

const router = Router();

const PRESET_SCENES = [
  {
    id: 'cricket-stadium',
    name: 'Cricket Stadium',
    sport: 'cricket',
    description: 'Immersive stadium view with scorecard overlay',
    camera: { position: [6, 4, 8], fov: 50 },
    lighting: { ambient: 0.5, directional: 1.2, point: 0.6 },
    elements: [
      { type: 'stadium', color: '#1a5e1f' },
      { type: 'scorecard', position: [0, 2, 0] },
      { type: 'floodlights', positions: [[-4, 5, -2], [4, 5, -2]] },
    ],
    tags: ['cricket', 'stadium', 'live'],
  },
  {
    id: 'cricket-scorecard',
    name: 'Cricket Scorecard',
    sport: 'cricket',
    description: 'Detailed 3D scorecard with player stats',
    camera: { position: [0, 1, 5], fov: 45 },
    lighting: { ambient: 0.4, directional: 0.8, point: 0.5 },
    elements: [
      { type: 'scorecard', position: [0, 0, 0], scale: 1.2 },
    ],
    tags: ['cricket', 'scorecard', 'stats'],
  },
  {
    id: 'cricket-player-spotlight',
    name: 'Player Spotlight',
    sport: 'cricket',
    description: 'Dramatic player spotlight scene',
    camera: { position: [3, 2, 4], fov: 40 },
    lighting: { ambient: 0.2, directional: 1.5, point: 0.8 },
    elements: [
      { type: 'spotlight-platform' },
      { type: 'player-card', position: [0, 1, 0] },
    ],
    tags: ['cricket', 'player', 'spotlight'],
  },
  {
    id: 'football-field',
    name: 'Football Field',
    sport: 'football',
    description: "Birds-eye football field with match stats",
    camera: { position: [0, 10, 5], fov: 60 },
    lighting: { ambient: 0.6, directional: 1, point: 0.4 },
    elements: [
      { type: 'field', color: '#16a34a' },
      { type: 'stats-board', position: [0, 3, 0] },
    ],
    tags: ['football', 'field', 'overview'],
  },
  {
    id: 'football-match-stats',
    name: 'Match Stats',
    sport: 'football',
    description: 'Side-by-side team comparison',
    camera: { position: [0, 1, 6], fov: 50 },
    lighting: { ambient: 0.4, directional: 0.8, point: 0.5 },
    elements: [
      { type: 'stats-comparison', position: [0, 0, 0] },
    ],
    tags: ['football', 'stats', 'comparison'],
  },
  {
    id: 'football-goal-replay',
    name: 'Goal Replay',
    sport: 'football',
    description: 'Goal replay with trajectory visualization',
    camera: { position: [5, 3, 5], fov: 55 },
    lighting: { ambient: 0.5, directional: 1, point: 0.6 },
    elements: [
      { type: 'field-segment' },
      { type: 'trajectory', color: '#f7c948' },
    ],
    tags: ['football', 'replay', 'goal'],
  },
  {
    id: 'basketball-court',
    name: 'Basketball Court',
    sport: 'basketball',
    description: 'Full basketball court view',
    camera: { position: [6, 6, 6], fov: 55 },
    lighting: { ambient: 0.5, directional: 1, point: 0.5 },
    elements: [
      { type: 'court', color: '#c2410c' },
      { type: 'scoreboard', position: [0, 4, 0] },
    ],
    tags: ['basketball', 'court', 'live'],
  },
  {
    id: 'basketball-quarter-stats',
    name: 'Quarter Stats',
    sport: 'basketball',
    description: 'Quarter-by-quarter breakdown',
    camera: { position: [0, 1, 5], fov: 45 },
    lighting: { ambient: 0.4, directional: 0.8, point: 0.4 },
    elements: [
      { type: 'quarter-chart', position: [0, 0, 0] },
    ],
    tags: ['basketball', 'stats', 'quarters'],
  },
  {
    id: 'basketball-player-comparison',
    name: 'Player Comparison',
    sport: 'basketball',
    description: 'Head-to-head player comparison',
    camera: { position: [0, 1.5, 5], fov: 45 },
    lighting: { ambient: 0.4, directional: 0.9, point: 0.5 },
    elements: [
      { type: 'player-compare', positions: [[-1.5, 0, 0], [1.5, 0, 0]] },
    ],
    tags: ['basketball', 'player', 'comparison'],
  },
  {
    id: 'universal-scoreboard',
    name: 'Universal Scoreboard',
    sport: 'generic',
    description: 'Multi-sport 3D scoreboard',
    camera: { position: [0, 1, 5], fov: 45 },
    lighting: { ambient: 0.4, directional: 1, point: 0.5 },
    elements: [
      { type: 'universal-score', position: [0, 0, 0] },
    ],
    tags: ['generic', 'scoreboard', 'multi-sport'],
  },
];

const customScenes = new Map();

router.get('/presets', (req, res) => {
  const { sport } = req.query;
  let scenes = [...PRESET_SCENES];
  if (sport && sport !== 'all') {
    scenes = scenes.filter((s) => s.sport === sport);
  }
  res.json({ scenes, total: scenes.length });
});

router.get('/presets/:id', (req, res) => {
  const scene = PRESET_SCENES.find((s) => s.id === req.params.id);
  if (!scene) return res.status(404).json({ error: 'Preset scene not found' });
  res.json(scene);
});

router.post('/render', (req, res) => {
  try {
    const { scene, width = 1920, height = 1080 } = req.body;
    if (!scene) return res.status(400).json({ error: 'Scene configuration required' });

    const elementsHtml = (scene.elements || []).map((el) => {
      switch (el.type) {
        case 'stadium':
          return `<div class="stadium-ground" style="background:${el.color || '#1a5e1f'};width:100%;height:60%;position:absolute;bottom:0;border-radius:50% 50% 0 0;"></div>`;
        case 'scorecard':
        case 'universal-score':
          return `<div class="scorecard" style="position:absolute;top:20%;left:50%;transform:translateX(-50%);background:rgba(10,14,26,0.9);border:1px solid rgba(247,201,72,0.3);border-radius:12px;padding:20px 40px;text-align:center;"><div style="color:#f7c948;font-size:14px;letter-spacing:3px;">LIVE SCORE</div><div style="color:#fff;font-size:48px;font-weight:900;margin:10px 0;">142/5</div><div style="color:#94a3b8;font-size:14px;">15.3 overs</div></div>`;
        case 'field':
          return `<div class="field" style="background:${el.color || '#16a34a'};width:80%;height:50%;position:absolute;bottom:10%;left:10%;border-radius:8px;border:2px solid rgba(255,255,255,0.3);"></div>`;
        case 'court':
          return `<div class="court" style="background:${el.color || '#c2410c'};width:70%;height:45%;position:absolute;bottom:15%;left:15%;border-radius:4px;border:2px solid rgba(255,255,255,0.2);"></div>`;
        case 'floodlights':
          return (el.positions || []).map((pos, i) =>
            `<div class="floodlight" style="position:absolute;left:${30 + i * 40}%;top:10%;width:4px;height:80px;background:#475569;"><div style="width:20px;height:8px;background:#f7c948;margin-left:-8px;box-shadow:0 0 20px #f7c948;"></div></div>`
          ).join('');
        default:
          return '';
      }
    }).join('');

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${scene.name || '3D Scene'} - SportsCaster</title>
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { background: #050810; overflow: hidden; font-family: 'Segoe UI', sans-serif; }
.scene { width: ${width}px; height: ${height}px; position: relative; overflow: hidden; background: linear-gradient(180deg, #0a0e1a 0%, #050810 100%); }
</style>
</head>
<body>
<div class="scene">${elementsHtml}</div>
</body>
</html>`;

    res.json({ html, width, height });
  } catch (err) {
    res.status(500).json({ error: 'Failed to render scene' });
  }
});

router.post('/export', (req, res) => {
  try {
    const { scene, format = 'json' } = req.body;
    if (!scene) return res.status(400).json({ error: 'Scene configuration required' });

    const exportData = {
      id: scene.id || `scene_${nanoid(8)}`,
      name: scene.name || 'Untitled Scene',
      sport: scene.sport || 'generic',
      camera: scene.camera || { position: [0, 1, 5], fov: 45 },
      lighting: scene.lighting || { ambient: 0.4, directional: 1, point: 0.5 },
      elements: scene.elements || [],
      exportedAt: new Date().toISOString(),
      version: '1.0',
    };

    if (format === 'json') {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="${exportData.id}.json"`);
      res.json(exportData);
    } else if (format === 'html') {
      const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>${exportData.name} - SportsCaster 3D</title>
<script type="importmap">
{ "imports": { "@react-three/fiber": "https://esm.sh/@react-three/fiber", "@react-three/drei": "https://esm.sh/@react-three/drei", "three": "https://esm.sh/three" } }
</script>
<style>* { margin:0; padding:0; } body { background:#050810; }</style>
</head>
<body>
<div id="root" style="width:100vw;height:100vh;"></div>
<script type="module">
import React from 'https://esm.sh/react@18';
import { createRoot } from 'https://esm.sh/react-dom@18/client';
const scene = ${JSON.stringify(exportData)};
document.getElementById('root').textContent = JSON.stringify(scene, null, 2);
</script>
</body>
</html>`;
      res.setHeader('Content-Type', 'text/html');
      res.setHeader('Content-Disposition', `attachment; filename="${exportData.id}.html"`);
      res.send(html);
    } else {
      res.status(400).json({ error: 'Unsupported format. Use json or html.' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to export scene' });
  }
});

export default router;
