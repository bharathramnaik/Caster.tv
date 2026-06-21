import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { nanoid } from 'nanoid';
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { store } from './matchStore.js';
import { createMatchState, updateMatchMeta } from './cricketEngine.js';
import { registerHandlers } from './socketHandlers.js';
import { requireAuth, legacyAuth } from './middleware/auth.js';

import usersRouter from './routes/users.js';
import templatesRouter from './routes/templates.js';
import scenesRouter from './routes/scenes.js';
import playlistsRouter from './routes/playlists.js';
import liveRouter from './routes/live.js';
import projectsRouter from './routes/projects.js';
import previewsRouter from './routes/previews.js';
import exportsRouter from './routes/exports.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load .env if present
try {
  const envPath = join(__dirname, '..', '.env');
  const envContent = readFileSync(envPath, 'utf-8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx > 0) {
      const key = trimmed.slice(0, eqIdx).trim();
      const val = trimmed.slice(eqIdx + 1).trim();
      if (!process.env[key]) process.env[key] = val;
    }
  }
} catch {}

const app = express();
const server = createServer(app);

const PORT = process.env.PORT || 3001;
const CORS_ORIGINS = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',').map(s => s.trim())
  : ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'];

const io = new Server(server, {
  cors: {
    origin: CORS_ORIGINS,
    methods: ['GET', 'POST']
  },
  pingInterval: 10000,
  pingTimeout: 5000
});

app.use(cors());
app.use(express.json());

// Auth middleware for mutation endpoints (backward compatibility)
const protect = legacyAuth;

// ── Serve production build (client/dist) ─────────────────────
const clientDist = join(__dirname, '..', '..', 'client', 'dist');
const indexPath = join(clientDist, 'index.html');
if (existsSync(clientDist)) {
  app.use(express.static(clientDist));
  console.log(`📁 Serving production build from ${clientDist}`);
}

// ── REST API ────────────────────────────────────────────────────

app.post('/api/matches', protect, (req, res) => {
  const matchId = `m_${nanoid(8)}`;
  const match = createMatchState({ matchId, ...req.body });
  store.createMatch(match);
  console.log(`Match created: ${matchId} — ${req.body.teamA} vs ${req.body.teamB}`);
  res.json(match);
});

app.get('/api/matches', (_req, res) => {
  res.json(store.getAllMatches());
});

app.get('/api/matches/:matchId', (req, res) => {
  const match = store.getMatch(req.params.matchId);
  if (!match) return res.status(404).json({ error: 'Match not found' });
  res.json(match);
});

app.put('/api/matches/:matchId', protect, (req, res) => {
  const match = store.getMatch(req.params.matchId);
  if (!match) return res.status(404).json({ error: 'Match not found' });
  const updated = updateMatchMeta(match, req.body);
  store.updateMatch(req.params.matchId, updated);
  res.json(updated);
});

app.delete('/api/matches/:matchId', protect, (req, res) => {
  store.deleteMatch(req.params.matchId);
  res.json({ ok: true });
});

// ── CSV Export ───────────────────────────────────────────────
app.get('/api/matches/:matchId/export/csv', (req, res) => {
  const match = store.getMatch(req.params.matchId);
  if (!match) return res.status(404).json({ error: 'Match not found' });

  const lines = [];
  lines.push('SportsCaster Match Export');
  lines.push(`Tournament,${match.tournamentName || ''}`);
  lines.push(`Teams,"${match.teams.a.name} vs ${match.teams.b.name}"`);
  lines.push(`Type,${match.matchType}`);
  lines.push(`Overs,${match.maxOvers}`);
  lines.push(`Venue,${match.venue || ''}`);
  lines.push(`Status,${match.status}`);
  if (match.result) lines.push(`Result,${match.result}`);
  lines.push('');

  for (let i = 0; i < match.innings.length; i++) {
    const inn = match.innings[i];
    const batTeam = match.teams[inn.battingTeam];
    lines.push(`Innings ${i + 1} - ${batTeam.name} Batting`);
    lines.push('Batter,Runs,Balls,4s,6s,SR,Status');
    for (const b of inn.batters) {
      lines.push(`${b.name},${b.runs},${b.balls},${b.fours},${b.sixes},${b.strikeRate},${b.status}`);
    }
    lines.push('');
    lines.push('Bowler,Overs,Maidens,Runs,Wickets,Economy');
    for (const bw of inn.bowlers) {
      lines.push(`${bw.name},${bw.overs}.${bw.balls},${bw.maidens},${bw.runs},${bw.wickets},${bw.economy}`);
    }
    lines.push('');
    lines.push(`Total,${inn.runs}/${inn.wickets} (${inn.overs}.${inn.balls} ov)`);
    lines.push(`Extras,Wides:${inn.extras.wides},NoBalls:${inn.extras.noBalls},Byes:${inn.extras.byes},LegByes:${inn.extras.legByes}`);
    if (inn.fallOfWickets.length > 0) {
      lines.push('Fall of Wickets');
      for (const fw of inn.fallOfWickets) {
        lines.push(`${fw.score}/${fw.wicketNum} (${fw.overStr}) ${fw.batter}`);
      }
    }
    lines.push('');
  }

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="match-${match.matchId}.csv"`);
  res.send(lines.join('\n'));
});

// ── Teams ─────────────────────────────────────────────────────

app.post('/api/teams', protect, (req, res) => {
  const { name, short, primaryColor, secondaryColor } = req.body;
  const teamId = `t_${nanoid(6)}`;
  const team = {
    teamId,
    name: name || '',
    short: short || (name || '').substring(0, 3).toUpperCase(),
    primaryColor: primaryColor || '#1a237e',
    secondaryColor: secondaryColor || '#ffd700',
    createdAt: new Date().toISOString()
  };
  store.registerTeam(team);
  console.log(`Team registered: ${team.short} — ${team.name}`);
  res.json(team);
});

app.get('/api/teams', (_req, res) => {
  res.json(store.getAllTeams());
});

app.get('/api/teams/:teamId', (req, res) => {
  const team = store.getTeam(req.params.teamId);
  if (!team) return res.status(404).json({ error: 'Team not found' });
  res.json(team);
});

app.put('/api/teams/:teamId', protect, (req, res) => {
  const updated = store.updateTeam(req.params.teamId, req.body);
  if (!updated) return res.status(404).json({ error: 'Team not found' });
  res.json(updated);
});

app.delete('/api/teams/:teamId', protect, (req, res) => {
  store.deleteTeam(req.params.teamId);
  res.json({ ok: true });
});

// ── Points Table ──────────────────────────────────────────────

app.get('/api/points', (_req, res) => {
  res.json(store.getPointsTable());
});

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

// ── New API Routes ─────────────────────────────────────────────

app.use('/api/users', usersRouter);
app.use('/api/templates', templatesRouter);
app.use('/api/scenes', scenesRouter);
app.use('/api/playlists', playlistsRouter);
app.use('/api/live', liveRouter);
app.use('/api/projects', projectsRouter);
app.use('/api/preview', previewsRouter);
app.use('/api/exports', exportsRouter);

// ── Socket.IO ───────────────────────────────────────────────────

io.on('connection', (socket) => {
  console.log(`⚡ Client connected: ${socket.id}`);
  registerHandlers(io, socket);

  socket.on('disconnect', (reason) => {
    console.log(`⚡ Client disconnected: ${socket.id} (${reason})`);
  });
});

// ── Start ───────────────────────────────────────────────────────

// SPA catch-all — serve index.html for non-API, non-Socket.IO routes
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/') || req.path.startsWith('/socket.io')) {
    return res.status(404).json({ error: 'Not found' });
  }
  if (existsSync(indexPath)) return res.sendFile(indexPath);
  res.status(404).json({ error: 'Not found' });
});

server.listen(PORT, () => {
  console.log(`\n🏏 SportsCaster server running on http://localhost:${PORT}\n`);
});
