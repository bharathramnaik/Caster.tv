/**
 * Socket.IO event handlers for real-time match scoring and broadcast control.
 */
import { store } from './matchStore.js';
import { authStore } from './authStore.js';
import { applyBall, startInnings, changeBowler, endInnings, updateMatchMeta } from './cricketEngine.js';
import { createScene, validateScene } from './sceneManager/sceneModel.js';
import { nanoid } from 'nanoid';

// Track connected users and their project rooms
const connectedUsers = new Map(); // socketId -> { userId, projectIds: Set }

export function registerHandlers(io, socket) {

  // ── Match Events ──────────────────────────────────────────

  // Join a match room to receive live updates
  socket.on('match:join', (matchId) => {
    socket.join(matchId);
    const match = store.getMatch(matchId);
    if (match) {
      socket.emit('match:state', match);
    } else {
      socket.emit('match:error', { message: 'Match not found' });
    }
  });

  socket.on('match:leave', (matchId) => {
    socket.leave(matchId);
  });

  // Start a new innings
  socket.on('innings:start', ({ matchId, battingTeam, batter1, batter2, bowler }) => {
    const match = store.getMatch(matchId);
    if (!match) return socket.emit('match:error', { message: 'Match not found' });

    store.pushUndo(matchId, match);
    const updated = startInnings(match, { battingTeam, batter1, batter2, bowler });
    store.updateMatch(matchId, updated);
    io.to(matchId).emit('match:state', updated);
  });

  // Apply a ball (runs, extras, wicket)
  socket.on('score:update', ({ matchId, type, runs, newBatter, wicketType }) => {
    const match = store.getMatch(matchId);
    if (!match) return socket.emit('match:error', { message: 'Match not found' });

    store.pushUndo(matchId, match);
    const updated = applyBall(match, { type, runs, newBatter, wicketType });
    store.updateMatch(matchId, updated);
    io.to(matchId).emit('match:state', updated);

    // Auto-emit milestone flashes
    if (type === 'normal' && runs === 4) {
      io.to(matchId).emit('overlay:command', { command: 'milestone', payload: { type: 'FOUR' } });
    }
    if (type === 'normal' && runs === 6) {
      io.to(matchId).emit('overlay:command', { command: 'milestone', payload: { type: 'SIX' } });
    }
    if (type === 'wicket') {
      io.to(matchId).emit('overlay:command', { command: 'milestone', payload: { type: 'WICKET' } });
    }
  });

  // Undo last action
  socket.on('score:undo', ({ matchId }) => {
    const prev = store.popUndo(matchId);
    if (!prev) return socket.emit('match:error', { message: 'Nothing to undo' });

    store.updateMatch(matchId, prev);
    io.to(matchId).emit('match:state', prev);
  });

  // Change current bowler
  socket.on('bowler:change', ({ matchId, bowlerName }) => {
    const match = store.getMatch(matchId);
    if (!match) return socket.emit('match:error', { message: 'Match not found' });

    store.pushUndo(matchId, match);
    const updated = changeBowler(match, { bowlerName });
    store.updateMatch(matchId, updated);
    io.to(matchId).emit('match:state', updated);
  });

  // End current innings manually
  socket.on('innings:end', ({ matchId }) => {
    const match = store.getMatch(matchId);
    if (!match) return socket.emit('match:error', { message: 'Match not found' });

    store.pushUndo(matchId, match);
    const updated = endInnings(match);
    store.updateMatch(matchId, updated);
    io.to(matchId).emit('match:state', updated);
  });

  // Update match metadata (only before innings start)
  socket.on('match:update', ({ matchId, updates }) => {
    const match = store.getMatch(matchId);
    if (!match) return socket.emit('match:error', { message: 'Match not found' });

    const updated = updateMatchMeta(match, updates);
    store.updateMatch(matchId, updated);
    io.to(matchId).emit('match:state', updated);
  });

  // Forward overlay commands to all clients in the match room
  socket.on('overlay:command', ({ matchId, command, payload }) => {
    io.to(matchId).emit('overlay:command', { command, payload });
  });

  // ── Scene Events ──────────────────────────────────────────

  socket.on('scene:create', (data) => {
    try {
      const scene = createScene({
        name: data.name || 'Untitled Scene',
        layers: data.layers || [],
        transitions: data.transitions,
        canvas: data.canvas
      });
      scene.createdBy = data.userId || null;

      authStore.createScene(scene);
      socket.emit('scene:created', scene);
      io.emit('scene:list-update', { action: 'create', sceneId: scene.id });
    } catch (err) {
      socket.emit('scene:error', { message: err.message });
    }
  });

  socket.on('scene:update', (data) => {
    const { sceneId, updates } = data;
    if (!sceneId) return socket.emit('scene:error', { message: 'sceneId required' });

    const existing = authStore.getScene(sceneId);
    if (!existing) return socket.emit('scene:error', { message: 'Scene not found' });

    const merged = { ...existing, ...updates, id: sceneId, updatedAt: new Date().toISOString() };
    const validation = validateScene(merged);
    if (!validation.valid) {
      return socket.emit('scene:error', { message: 'Validation failed', details: validation.errors });
    }

    const updated = authStore.updateScene(sceneId, updates);
    io.emit('scene:updated', updated);
  });

  socket.on('scene:delete', (data) => {
    const { sceneId } = data;
    if (!sceneId) return socket.emit('scene:error', { message: 'sceneId required' });

    authStore.deleteScene(sceneId);
    io.emit('scene:deleted', { sceneId });
  });

  // ── Live Control Events ───────────────────────────────────

  socket.on('live:scene-switch', (data) => {
    const { sceneId } = data;
    if (!sceneId) return socket.emit('live:error', { message: 'sceneId required' });

    const scene = authStore.getScene(sceneId);
    if (!scene) return socket.emit('live:error', { message: 'Scene not found' });

    const state = authStore.updateLiveState({
      sceneId,
      activeLayers: (scene.layers || []).filter(l => l.visible).map(l => l.id),
      graphicsState: {}
    });

    io.emit('live:state-update', state);
  });

  socket.on('live:layer-update', (data) => {
    const { sceneId, layerId, updates } = data;
    if (!sceneId || !layerId) {
      return socket.emit('live:error', { message: 'sceneId and layerId required' });
    }

    const scene = authStore.getScene(sceneId);
    if (!scene) return socket.emit('live:error', { message: 'Scene not found' });

    const layer = scene.layers.find(l => l.id === layerId);
    if (!layer) return socket.emit('live:error', { message: 'Layer not found' });

    Object.assign(layer, updates);
    if (updates.data) layer.data = { ...layer.data, ...updates.data };

    authStore.updateScene(sceneId, { layers: scene.layers, updatedAt: new Date().toISOString() });

    const liveState = authStore.getLiveState();
    if (liveState.sceneId === sceneId) {
      authStore.updateLiveState({
        activeLayers: scene.layers.filter(l => l.visible).map(l => l.id)
      });
    }

    io.emit('live:layer-changed', { sceneId, layerId, layer });
  });

  socket.on('live:transition', (data) => {
    const { sceneId, transitionType, duration } = data;

    const state = authStore.updateLiveState({
      transitionPending: true,
      pendingSceneId: sceneId || null,
      transitionType: transitionType || 'fade',
      transitionDuration: duration || 0.5
    });

    io.emit('live:transition-start', state);
  });

  // ── Collaboration Events ──────────────────────────────────

  socket.on('user:join-project', (data) => {
    const { projectId, userId } = data;
    if (!projectId || !userId) return;

    const room = `project:${projectId}`;
    socket.join(room);

    const userInfo = connectedUsers.get(socket.id) || { userId, projectIds: new Set() };
    userInfo.userId = userId;
    userInfo.projectIds.add(projectId);
    connectedUsers.set(socket.id, userInfo);

    io.to(room).emit('user:joined', {
      userId,
      socketId: socket.id,
      timestamp: new Date().toISOString()
    });
  });

  socket.on('user:leave-project', (data) => {
    const { projectId, userId } = data;
    if (!projectId) return;

    const room = `project:${projectId}`;
    socket.leave(room);

    const userInfo = connectedUsers.get(socket.id);
    if (userInfo) {
      userInfo.projectIds.delete(projectId);
      if (userInfo.projectIds.size === 0) {
        connectedUsers.delete(socket.id);
      }
    }

    io.to(room).emit('user:left', {
      userId,
      socketId: socket.id,
      timestamp: new Date().toISOString()
    });
  });

  socket.on('cursor:move', (data) => {
    const { projectId, userId, x, y, targetId } = data;
    if (!projectId) return;

    const room = `project:${projectId}`;
    socket.to(room).emit('cursor:moved', {
      userId,
      socketId: socket.id,
      x,
      y,
      targetId,
      timestamp: new Date().toISOString()
    });
  });

  // ── Cleanup on disconnect ─────────────────────────────────

  const origDisconnect = socket.listeners('disconnect')[0];
  socket.on('disconnect', (reason) => {
    const userInfo = connectedUsers.get(socket.id);
    if (userInfo) {
      for (const projectId of userInfo.projectIds) {
        io.to(`project:${projectId}`).emit('user:left', {
          userId: userInfo.userId,
          socketId: socket.id,
          timestamp: new Date().toISOString()
        });
      }
      connectedUsers.delete(socket.id);
    }
  });
}
