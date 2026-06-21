/**
 * ContextManager
 * Per-user context tracking for the Spark bot.
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, '..', 'data');
const CONTEXT_FILE = join(DATA_DIR, 'botContext.json');

function ensureDataDir() {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
}

function loadContext() {
  try {
    if (existsSync(CONTEXT_FILE)) {
      return JSON.parse(readFileSync(CONTEXT_FILE, 'utf-8'));
    }
  } catch {}
  return {};
}

function saveContext(data) {
  ensureDataDir();
  writeFileSync(CONTEXT_FILE, JSON.stringify(data, null, 2));
}

export class ContextManager {
  constructor() {
    this.contexts = loadContext();
  }

  /**
   * Get user context.
   * @param {string} userId
   * @returns {object}
   */
  getContext(userId) {
    if (!this.contexts[userId]) {
      this.contexts[userId] = this._defaultContext();
    }
    return { ...this.contexts[userId] };
  }

  /**
   * Update user context with partial data.
   * @param {string} userId
   * @param {object} update
   */
  updateContext(userId, update) {
    if (!this.contexts[userId]) {
      this.contexts[userId] = this._defaultContext();
    }
    Object.assign(this.contexts[userId], update, {
      lastInteraction: Date.now()
    });
    this._persist();
  }

  /**
   * Clear user context entirely.
   * @param {string} userId
   */
  clearContext(userId) {
    delete this.contexts[userId];
    this._persist();
  }

  /**
   * Get page-specific context hints.
   * @param {string} page
   * @returns {object}
   */
  getPageContext(page) {
    const pageHints = {
      dashboard: { canStartMatch: true, canStartStream: true, showQuickStats: true },
      matches: { canCreateMatch: true, canScore: true, canExport: true },
      switcher: { canSwitchScene: true, canRecord: true, showTally: true },
      scenes: { canCreateScene: true, canEditScene: true, canExport: true },
      templates: { canCreateTemplate: true, canBrowse: true, canFilter: true },
      streaming: { canStartStream: true, canStopStream: true, showHealth: true },
      recording: { canRecord: true, canPause: true, canSchedule: true },
      audio: { canMute: true, canSetVolume: true, canSolo: true },
      collaboration: { canInvite: true, canShare: true, showActivity: true },
      data: { canSubscribe: true, canGetScores: true, canFilter: true },
      exports: { canExport: true, canDownload: true },
      projects: { canCreate: true, canShare: true }
    };
    return pageHints[page] || {};
  }

  _persist() {
    saveContext(this.contexts);
  }

  _defaultContext() {
    return {
      currentPage: 'dashboard',
      currentProject: null,
      recentActions: [],
      preferences: { theme: 'dark', language: 'en' },
      activeMatch: null,
      activeScene: null,
      lastInteraction: Date.now()
    };
  }
}
