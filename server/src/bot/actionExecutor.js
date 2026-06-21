/**
 * ActionExecutor
 * Maps intents to actual API/store calls and executes them.
 */
import { nanoid } from 'nanoid';

/** @typedef {{ intent: string, entities: object, params: object }} Action */

export class ActionExecutor {
  constructor() {
    /** @type {Map<string, Function>} */
    this.handlers = new Map();
    /** @type {Array<{userId: string, action: string, params: object, result: object, timestamp: number}>} */
    this.auditLog = [];
    this._registerDefaults();
  }

  /**
   * Execute an action based on classified intent.
   * @param {string} userId
   * @param {Action} action
   * @param {object} [deps] - External dependencies (store, streamManager, etc.)
   * @returns {Promise<{success: boolean, result?: object, error?: string}>}
   */
  async executeAction(userId, action, deps = {}) {
    const { intent, entities = {}, params = {} } = action;
    const handler = this.handlers.get(intent);

    if (!handler) {
      return { success: false, error: `No handler for action: ${intent}` };
    }

    try {
      const mergedParams = { ...entities, ...params };
      const result = await handler(userId, mergedParams, deps);

      this._audit(userId, intent, mergedParams, { success: true, result });
      return { success: true, result };
    } catch (err) {
      const errorResult = { success: false, error: err.message };
      this._audit(userId, intent, params, errorResult);
      return errorResult;
    }
  }

  /**
   * Register a custom action handler.
   * @param {string} intentName
   * @param {Function} handler
   */
  registerHandler(intentName, handler) {
    this.handlers.set(intentName, handler);
  }

  /**
   * Get audit log.
   * @param {string} [userId]
   * @param {number} [limit=50]
   * @returns {Array}
   */
  getAuditLog(userId, limit = 50) {
    let logs = this.auditLog;
    if (userId) logs = logs.filter(l => l.userId === userId);
    return logs.slice(-limit);
  }

  _audit(userId, action, params, result) {
    this.auditLog.push({
      userId,
      action,
      params,
      result,
      timestamp: Date.now()
    });
    if (this.auditLog.length > 500) {
      this.auditLog = this.auditLog.slice(-500);
    }
  }

  _registerDefaults() {
    // Navigation
    this.handlers.set('go_to_page', async (userId, params) => {
      return { page: params.page || 'dashboard', navigated: true };
    });

    this.handlers.set('open_section', async (userId, params) => {
      return { section: params.section, opened: true };
    });

    this.handlers.set('show_overlay', async (userId, params) => {
      return { overlayType: params.overlayType, shown: true };
    });

    this.handlers.set('show_scoreboard', async (userId, params) => {
      return { overlay: 'scoreboard', shown: true };
    });

    // Match
    this.handlers.set('create_match', async (userId, params, deps) => {
      const matchId = `m_${nanoid(8)}`;
      const match = {
        matchId,
        teamA: params.teamA || 'Team A',
        teamB: params.teamB || 'Team B',
        matchType: params.matchType || 'T20',
        maxOvers: params.maxOvers || 20,
        venue: params.venue || '',
        tournamentName: params.tournamentName || '',
        status: 'upcoming'
      };
      return { matchId, match, created: true };
    });

    // Template
    this.handlers.set('create_template', async (userId, params) => {
      const templateId = `tpl_${nanoid(8)}`;
      return {
        templateId,
        name: params.name || 'New Template',
        category: params.category || params.templateType || 'general',
        created: true
      };
    });

    this.handlers.set('edit_template', async (userId, params) => {
      return { templateId: params.templateId, edited: true };
    });

    // Streaming
    this.handlers.set('start_stream', async (userId, params) => {
      return { started: true, outputType: params.outputType || 'rtmp' };
    });

    this.handlers.set('stop_stream', async (userId, params) => {
      return { stopped: true };
    });

    this.handlers.set('start_rtmp', async (userId, params) => {
      return { started: true, type: 'rtmp', url: params.url };
    });

    this.handlers.set('show_health', async (userId, params) => {
      return {
        health: {
          bitrate: 6000,
          fps: 30,
          latency: 120,
          dropped: 0,
          status: 'healthy'
        }
      };
    });

    this.handlers.set('change_bitrate', async (userId, params) => {
      return { bitrate: params.bitrate || 6000, changed: true };
    });

    // Recording
    this.handlers.set('start_recording', async (userId, params) => {
      return {
        recordingId: `rec_${nanoid(8)}`,
        format: params.format || 'mp4',
        quality: params.quality || 'high',
        started: true
      };
    });

    this.handlers.set('stop_record', async (userId, params) => {
      return { stopped: true };
    });

    this.handlers.set('pause_record', async (userId, params) => {
      return { paused: true };
    });

    this.handlers.set('schedule_record', async (userId, params) => {
      return {
        scheduled: true,
        time: params.time || 'ASAP',
        date: params.date || 'today'
      };
    });

    // Scene
    this.handlers.set('switch_scene', async (userId, params) => {
      return {
        sceneId: params.sceneId || params.sceneNumber,
        transitionType: params.transitionType || 'cut',
        switched: true
      };
    });

    this.handlers.set('add_scene', async (userId, params) => {
      const sceneId = `scene_${nanoid(8)}`;
      return {
        sceneId,
        name: params.sceneName || 'New Scene',
        created: true
      };
    });

    // Audio
    this.handlers.set('toggle_mute', async (userId, params) => {
      return {
        channel: params.channel || 'master',
        muted: params.muteAction === 'mute',
        toggled: true
      };
    });

    this.handlers.set('set_volume', async (userId, params) => {
      return {
        channel: params.channel || 'master',
        level: params.level || 75,
        set: true
      };
    });

    // Control
    this.handlers.set('change_quality', async (userId, params) => {
      return { quality: params.quality || '1080p', changed: true };
    });

    this.handlers.set('toggle_theme', async (userId, params) => {
      return { theme: params.theme || 'dark', toggled: true };
    });

    // Collaboration
    this.handlers.set('invite_user', async (userId, params) => {
      return {
        invited: true,
        userId: params.userId || params.email || 'user',
        role: params.role || 'editor'
      };
    });

    this.handlers.set('share_template', async (userId, params) => {
      return { shared: true, templateId: params.templateId };
    });

    this.handlers.set('show_activity', async (userId, params) => {
      return { activity: [], shown: true };
    });

    // Query (pass-through, no action needed)
    this.handlers.set('get_status', async () => ({ status: 'ok' }));
    this.handlers.set('get_scores', async () => ({ scores: [] }));
    this.handlers.set('get_matches', async () => ({ matches: [] }));
    this.handlers.set('get_templates', async () => ({ templates: [] }));
    this.handlers.set('list_scenes', async () => ({ scenes: [] }));
    this.handlers.set('show_help', async () => ({ help: true }));
    this.handlers.set('export_overlay', async (userId, params) => ({
      exported: true,
      format: params.format || 'html'
    }));
  }
}
