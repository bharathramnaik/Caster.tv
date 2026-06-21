/**
 * Socket.IO event handlers for real-time match scoring and broadcast control.
 */
import { store } from './matchStore.js';
import { authStore } from './authStore.js';
import { applyBall, startInnings, changeBowler, endInnings, updateMatchMeta } from './cricketEngine.js';
import { createScene, validateScene } from './sceneManager/sceneModel.js';
import { nanoid } from 'nanoid';
import { feedManager } from './integrations/index.js';
import { streamManager } from './routes/streaming.js';
import { CollaborationManager } from './collaboration/index.js';
import { SparkBot } from './bot/index.js';

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

  let collabManager = null;
  try {
    collabManager = io.engine?.opts?._collabManager || null;
  } catch {}

  socket.on('user:join-project', (data) => {
    const { projectId, userId, displayName } = data;
    if (!projectId || !userId) return;

    const room = `project:${projectId}`;
    socket.join(room);

    const userInfo = connectedUsers.get(socket.id) || { userId, projectIds: new Set() };
    userInfo.userId = userId;
    userInfo.projectIds.add(projectId);
    connectedUsers.set(socket.id, userInfo);

    const color = `hsl(${(userId.charCodeAt(0) * 37) % 360}, 70%, 60%)`;
    const role = 'viewer';

    io.to(room).emit('collab:user-joined', {
      userId,
      displayName: displayName || userId,
      socketId: socket.id,
      color,
      role,
      timestamp: Date.now()
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

    io.to(room).emit('collab:user-left', {
      userId,
      socketId: socket.id,
      timestamp: Date.now()
    });
  });

  socket.on('cursor:move', (data) => {
    const { projectId, userId, x, y, targetId } = data;
    if (!projectId) return;

    const room = `project:${projectId}`;
    socket.to(room).emit('collab:cursor-moved', {
      userId,
      socketId: socket.id,
      x,
      y,
      targetId,
      timestamp: Date.now()
    });
  });

  socket.on('collab:set-role', (data) => {
    const { projectId, userId, role } = data;
    if (!projectId || !userId || !role) return;

    const room = `project:${projectId}`;
    io.to(room).emit('collab:role-changed', {
      targetUserId: userId,
      role,
      setBy: connectedUsers.get(socket.id)?.userId,
      timestamp: Date.now()
    });
  });

  socket.on('collab:remove-user', (data) => {
    const { projectId, userId } = data;
    if (!projectId || !userId) return;

    const room = `project:${projectId}`;
    io.to(room).emit('collab:user-removed', {
      targetUserId: userId,
      removedBy: connectedUsers.get(socket.id)?.userId,
      timestamp: Date.now()
    });
  });

  socket.on('collab:state-update', (data) => {
    const { projectId, field, value, version } = data;
    if (!projectId || !field) return;

    const room = `project:${projectId}`;
    io.to(room).emit('collab:state-updated', {
      field,
      value,
      version: (version || 0) + 1,
      updatedBy: connectedUsers.get(socket.id)?.userId,
      timestamp: Date.now()
    });
  });

  // ── Switcher Events ────────────────────────────────────

  socket.on('switcher:switch', (data) => {
    const { inputId, transition } = data;
    if (!inputId) return socket.emit('switcher:error', { message: 'inputId required' });

    try {
      io.emit('switcher:state', { type: 'switch', inputId, transition: transition || 'cut', timestamp: Date.now() });
      io.emit('switcher:tally', { program: inputId, timestamp: Date.now() });
    } catch (err) {
      socket.emit('switcher:error', { message: err.message });
    }
  });

  socket.on('switcher:preview', (data) => {
    const { inputId } = data;
    if (!inputId) return socket.emit('switcher:error', { message: 'inputId required' });

    io.emit('switcher:state', { type: 'preview', inputId, timestamp: Date.now() });
    io.emit('switcher:tally', { preview: inputId, timestamp: Date.now() });
  });

  socket.on('switcher:transition', (data) => {
    const { type, duration } = data;
    io.emit('switcher:state', { type: 'transition', transitionType: type, duration, timestamp: Date.now() });
  });

  socket.on('switcher:macro-record', (data) => {
    const { recording } = data;
    io.emit('switcher:state', { type: 'macro-record', recording, timestamp: Date.now() });
  });

  socket.on('switcher:macro-play', (data) => {
    const { macroId } = data;
    io.emit('switcher:macro-play', { macroId, timestamp: Date.now() });
  });

  // ── Streaming Events ──────────────────────────────────────

  socket.on('stream:start', async (data) => {
    const { outputId } = data;
    if (!outputId) return socket.emit('stream:error', { message: 'outputId required' });

    try {
      await streamManager.startOutput(outputId);
      socket.emit('stream:status', { outputId, state: 'active' });
      io.emit('stream:status', { outputId, state: 'active' });
    } catch (err) {
      socket.emit('stream:error', { message: err.message });
    }
  });

  socket.on('stream:stop', (data) => {
    const { outputId } = data;
    if (!outputId) return socket.emit('stream:error', { message: 'outputId required' });

    try {
      streamManager.stopOutput(outputId);
      socket.emit('stream:status', { outputId, state: 'stopped' });
      io.emit('stream:status', { outputId, state: 'stopped' });
    } catch (err) {
      socket.emit('stream:error', { message: err.message });
    }
  });

  socket.on('stream:scene-switch', (data) => {
    const { sceneId } = data;
    if (!sceneId) return socket.emit('stream:error', { message: 'sceneId required' });

    streamManager.switchScene(sceneId);
    io.emit('stream:scene-switch', { sceneId });
  });

  // Handle WebRTC signaling
  socket.on('webrtc:viewer-join', (data) => {
    const { outputId, viewerId } = data;
    const output = streamManager.getOutput(outputId);
    if (!output || output.type !== 'webrtc') {
      return socket.emit('stream:error', { message: 'Invalid WebRTC output' });
    }

    const added = streamManager.addViewer(outputId, viewerId, socket.id);
    if (added) {
      io.emit('stream:viewers', { outputId, count: streamManager.getOutput(outputId)?.viewers || 0 });
    }
  });

  socket.on('webrtc:viewer-leave', (data) => {
    const { outputId, viewerId } = data;
    streamManager.removeViewer(outputId, viewerId);
    io.emit('stream:viewers', { outputId, count: streamManager.getOutput(outputId)?.viewers || 0 });
  });

  // ── Data Integration Events ──────────────────────────────

  // Subscribe to live feed data updates
  socket.on('data:subscribe', (feedId) => {
    if (feedId) {
      socket.join(`feed:${feedId}`);
    } else {
      socket.join('feed:all');
    }
  });

  socket.on('data:unsubscribe', (feedId) => {
    if (feedId) {
      socket.leave(`feed:${feedId}`);
    } else {
      socket.leave('feed:all');
    }
  });

  // Request current scores
  socket.on('data:get-scores', (data) => {
    try {
      const { sport } = data || {};
      const scoreFeeds = feedManager.getFeeds().filter(f => f.type === 'score');
      const scores = scoreFeeds
        .flatMap(f => f.data || [])
        .filter(s => !sport || s.sport === sport);
      socket.emit('data:scores-update', scores);
    } catch (err) {
      socket.emit('data:feed-error', { error: err.message });
    }
  });

  // ── Recording Events ─────────────────────────────────────

  socket.on('recording:start', (data) => {
    io.emit('recording:start', {
      ...data,
      timestamp: new Date().toISOString()
    });
  });

  socket.on('recording:stop', (data) => {
    io.emit('recording:stop', {
      ...data,
      timestamp: new Date().toISOString()
    });
  });

  socket.on('recording:pause', (data) => {
    io.emit('recording:pause', {
      ...data,
      timestamp: new Date().toISOString()
    });
  });

  socket.on('recording:status', (data) => {
    io.emit('recording:status', {
      ...data,
      timestamp: new Date().toISOString()
    });
  });

  // ── Audio Events ──────────────────────────────────────────

  socket.on('audio:mute', (data) => {
    io.emit('audio:mute', {
      ...data,
      timestamp: new Date().toISOString()
    });
  });

  socket.on('audio:solo', (data) => {
    io.emit('audio:solo', {
      ...data,
      timestamp: new Date().toISOString()
    });
  });

  // ── Bot Events ────────────────────────────────────────────

  const sparkBot = new SparkBot();

  socket.on('bot:message', async (data) => {
    const { message, context } = data;
    if (!message) return;

    const userId = data.userId || socket.id;
    socket.emit('bot:typing', { typing: true });

    try {
      const response = await sparkBot.processMessage(userId, message, context || {});
      socket.emit('bot:message', { response, userId });
    } catch (err) {
      socket.emit('bot:message', {
        response: { type: 'error', content: 'Something went wrong processing your message.' },
        userId
      });
    }

    socket.emit('bot:typing', { typing: false });
  });

  socket.on('bot:suggestion', (data) => {
    const userId = data.userId || socket.id;
    const context = sparkBot.getUserContext(userId);
    const suggestions = sparkBot.getSuggestion(context);
    socket.emit('bot:suggestion', { suggestions, userId });
  });

  socket.on('bot:action', async (data) => {
    const { actionId, params } = data;
    if (!actionId) return;

    const userId = data.userId || socket.id;
    try {
      const result = await sparkBot.handleAction(userId, actionId, params || {});
      socket.emit('bot:action', { actionId, result, userId });
      io.emit('bot:action', { actionId, result, userId, timestamp: Date.now() });
    } catch (err) {
      socket.emit('bot:action', { actionId, error: err.message, userId });
    }
  });

  // ── Cleanup on disconnect ─────────────────────────────────

  socket.on('disconnect', (reason) => {
    const userInfo = connectedUsers.get(socket.id);
    if (userInfo) {
      for (const projectId of userInfo.projectIds) {
        io.to(`project:${projectId}`).emit('collab:user-left', {
          userId: userInfo.userId,
          socketId: socket.id,
          timestamp: Date.now()
        });
      }
      connectedUsers.delete(socket.id);
    }
  });
}
