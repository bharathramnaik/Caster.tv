/**
 * SparkBot
 * Main bot class orchestrating all subsystems.
 */
import { EventEmitter } from 'events';
import { IntentClassifier } from './intentClassifier.js';
import { ActionExecutor } from './actionExecutor.js';
import { ContextManager } from './contextManager.js';
import { ConversationMemory } from './conversationMemory.js';
import { ResponseGenerator } from './responseGenerator.js';
import { PAGES, GUIDES, FAQ, PAGE_ACTIONS } from './knowledge.js';

/** @typedef {'idle'|'processing'|'responding'} BotState */

export class SparkBot extends EventEmitter {
  constructor() {
    super();
    this.classifier = new IntentClassifier();
    this.executor = new ActionExecutor();
    this.context = new ContextManager();
    this.memory = new ConversationMemory();
    this.responder = new ResponseGenerator();

    /** @type {Map<string, BotState>} */
    this.userStates = new Map();
    /** @type {Map<string, number[]>} */
    this.rateLimits = new Map();

    this.MAX_MESSAGES_PER_MINUTE = 30;
  }

  /**
   * Process a user message end-to-end.
   * @param {string} userId
   * @param {string} message
   * @param {object} [extraContext]
   * @returns {Promise<object>} Response object
   */
  async processMessage(userId, message, extraContext = {}) {
    // Rate limiting
    if (!this._checkRateLimit(userId)) {
      return this.responder.generateTextResponse(
        'You\'re sending messages too fast. Please wait a moment.'
      );
    }

    // State check
    const prevState = this.userStates.get(userId);
    if (prevState === 'processing') {
      return this.responder.generateTextResponse('I\'m still working on your last request...');
    }

    this.userStates.set(userId, 'processing');
    this.emit('bot:typing', { userId, typing: true });

    try {
      // Store user message
      this.memory.addMessage(userId, 'user', message);

      // Get user context
      const userContext = this.context.getContext(userId);
      const mergedContext = { ...userContext, ...extraContext };

      // Classify intent
      const classification = this.classifier.classify(message);
      const { intent, confidence, entities } = classification;

      // Track topic
      this.memory.trackTopic(userId, intent);

      // Handle help/greeting specially
      if (intent === 'show_help' && confidence < 0.6) {
        const topic = entities.topic || this._detectHelpTopic(message);
        if (topic) {
          const guide = GUIDES[topic];
          if (guide) {
            const response = this.responder.generateStepResponse(guide.steps);
            this.memory.addMessage(userId, 'bot', guide.title);
            this.userStates.set(userId, 'idle');
            this.emit('bot:response', { userId, response });
            return response;
          }
        }

        const response = this.responder.generateHelpResponse(mergedContext);
        this.memory.addMessage(userId, 'bot', 'Help');
        this.userStates.set(userId, 'idle');
        this.emit('bot:response', { userId, response });
        return response;
      }

      // Execute action
      const actionResult = await this.executor.executeAction(userId, {
        intent,
        entities,
        params: mergedContext
      });

      // Update context
      this.context.updateContext(userId, {
        currentPage: entities.page || userContext.currentPage,
        recentActions: [...(userContext.recentActions || []).slice(-9), {
          intent,
          timestamp: Date.now()
        }]
      });

      // Generate response
      let response;
      if (actionResult.success) {
        response = this._generateActionResponse(intent, actionResult.result, mergedContext);
      } else {
        response = this.responder.generateErrorResponse(actionResult.error);
      }

      this.memory.addMessage(userId, 'bot', response.content || JSON.stringify(response));
      this.userStates.set(userId, 'idle');

      this.emit('bot:response', { userId, response, intent, confidence });
      return response;
    } catch (err) {
      this.userStates.set(userId, 'idle');
      const response = this.responder.generateErrorResponse(err);
      this.emit('bot:error', { userId, error: err.message });
      return response;
    }
  }

  /**
   * Get contextual suggestions for the user.
   * @param {object} context
   * @returns {object}
   */
  getSuggestion(context = {}) {
    const page = context.currentPage || 'dashboard';
    const actions = PAGE_ACTIONS[page] || PAGE_ACTIONS.dashboard;

    // Check recent actions to avoid repeating
    const recentIntents = (context.recentActions || []).slice(-3).map(a => a.intent);
    const fresh = actions.filter(a => !recentIntents.includes(a.id));

    if (fresh.length === 0) {
      return this.responder.generateQuickActions(actions);
    }

    return this.responder.generateQuickActions(fresh.slice(0, 3));
  }

  /**
   * Get quick actions for a specific page.
   * @param {string} page
   * @returns {object}
   */
  getQuickActions(page) {
    const actions = PAGE_ACTIONS[page] || PAGE_ACTIONS.dashboard;
    return this.responder.generateQuickActions(actions);
  }

  /**
   * Handle a quick action button click.
   * @param {string} userId
   * @param {string} actionId
   * @param {object} [params]
   * @returns {Promise<object>}
   */
  async handleAction(userId, actionId, params = {}) {
    const intentMap = {
      create_match: 'create_match',
      create_template: 'create_template',
      start_stream: 'start_stream',
      start_recording: 'start_recording',
      switch_scene: 'switch_scene',
      add_scene: 'add_scene',
      edit_template: 'edit_template',
      export_overlay: 'export_overlay',
      get_status: 'get_status',
      get_scores: 'get_scores',
      get_matches: 'get_matches',
      get_templates: 'get_templates',
      list_scenes: 'list_scenes',
      show_help: 'show_help',
      toggle_mute: 'toggle_mute',
      set_volume: 'set_volume',
      change_quality: 'change_quality',
      toggle_theme: 'toggle_theme',
      invite_user: 'invite_user',
      share_template: 'share_template',
      show_activity: 'show_activity',
      start_rtmp: 'start_rtmp',
      stop_stream: 'stop_stream',
      show_health: 'show_health',
      change_bitrate: 'change_bitrate',
      stop_record: 'stop_record',
      pause_record: 'pause_record',
      schedule_record: 'schedule_record',
      view_matches: 'get_matches',
      view_scores: 'get_scores',
      show_categories: 'get_templates',
      show_tally: 'get_status'
    };

    const intent = intentMap[actionId] || actionId;
    return this.executor.executeAction(userId, {
      intent,
      entities: params,
      params
    });
  }

  /**
   * Get knowledge base content.
   * @returns {object}
   */
  getKnowledge() {
    return { pages: PAGES, guides: GUIDES, faq: FAQ };
  }

  /**
   * Get conversation history for a user.
   * @param {string} userId
   * @param {number} [limit]
   * @returns {Array}
   */
  getHistory(userId, limit) {
    return this.memory.getHistory(userId, limit);
  }

  /**
   * Clear conversation for a user.
   * @param {string} userId
   */
  clearConversation(userId) {
    this.memory.clearHistory(userId);
    this.context.clearContext(userId);
  }

  /**
   * Get current context for a user.
   * @param {string} userId
   * @returns {object}
   */
  getUserContext(userId) {
    return this.context.getContext(userId);
  }

  // ── Private ──────────────────────────────────────────────

  _checkRateLimit(userId) {
    const now = Date.now();
    const windowMs = 60 * 1000;

    if (!this.rateLimits.has(userId)) {
      this.rateLimits.set(userId, []);
    }

    const timestamps = this.rateLimits.get(userId);
    const recent = timestamps.filter(t => now - t < windowMs);
    this.rateLimits.set(userId, recent);

    if (recent.length >= this.MAX_MESSAGES_PER_MINUTE) {
      return false;
    }

    recent.push(now);
    return true;
  }

  _detectHelpTopic(message) {
    const lower = message.toLowerCase();
    if (/create|new|make/.test(lower) && /match|game/.test(lower)) return 'create_match';
    if (/stream|broadcast|live/.test(lower)) return 'start_streaming';
    if (/template|overlay|graphic/.test(lower)) return 'create_template';
    if (/switcher|switch|camera/.test(lower)) return 'use_switcher';
    if (/record/.test(lower)) return 'start_recording';
    if (/collaborat|invite|team/.test(lower)) return 'collaborate';
    return null;
  }

  _generateActionResponse(intent, result, context) {
    const actionLabels = {
      create_match: 'Match created',
      create_template: 'Template created',
      start_stream: 'Stream started',
      stop_stream: 'Stream stopped',
      start_recording: 'Recording started',
      stop_record: 'Recording stopped',
      pause_record: 'Recording paused',
      switch_scene: 'Scene switched',
      add_scene: 'Scene created',
      edit_template: 'Template updated',
      export_overlay: 'Overlay exported',
      toggle_mute: result?.muted ? 'Audio muted' : 'Audio unmuted',
      set_volume: `Volume set to ${result?.level || 75}%`,
      change_quality: `Quality changed to ${result?.quality || '1080p'}`,
      toggle_theme: `Theme set to ${result?.theme || 'dark'}`,
      invite_user: 'User invited',
      share_template: 'Template shared',
      start_rtmp: 'RTMP stream started',
      change_bitrate: `Bitrate set to ${result?.bitrate || 6000} kbps`,
      schedule_record: 'Recording scheduled',
      go_to_page: `Navigated to ${result?.page || context?.page || 'page'}`
    };

    const label = actionLabels[intent] || 'Action';

    if (result?.health) {
      const h = result.health;
      return this.responder.generateCardResponse(
        'Stream Health',
        `Bitrate: ${h.bitrate} kbps | FPS: ${h.fps} | Latency: ${h.latency}ms | Dropped: ${h.dropped}`,
        []
      );
    }

    return this.responder.generateSuccessResponse(label, result);
  }
}
