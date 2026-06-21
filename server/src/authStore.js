/**
 * In-memory store for users, projects, templates, scenes, playlists, and live state.
 * Follows the same persistence pattern as matchStore.js.
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { nanoid } from 'nanoid';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, '..', 'data');
const DATA_FILE = join(DATA_DIR, 'authStore.json');

if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });

let data = { users: {}, projects: {}, templates: {}, scenes: {}, playlists: {}, liveState: null };
try {
  if (existsSync(DATA_FILE)) {
    data = JSON.parse(readFileSync(DATA_FILE, 'utf-8'));
    console.log(`📂 Loaded ${Object.keys(data.users).length} users, ${Object.keys(data.templates).length} templates, ${Object.keys(data.scenes).length} scenes`);
  }
} catch (e) {
  console.warn('⚠ Failed to load auth store:', e.message);
}

const users = new Map(Object.entries(data.users || {}));
const projects = new Map(Object.entries(data.projects || {}));
const templates = new Map(Object.entries(data.templates || {}));
const scenes = new Map(Object.entries(data.scenes || {}));
const playlists = new Map(Object.entries(data.playlists || {}));
let liveState = data.liveState || {
  id: 'current',
  sceneId: null,
  activeLayers: [],
  graphicsState: {},
  updatedAt: new Date().toISOString()
};

let saveTimer = null;
function persist() {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    try {
      writeFileSync(DATA_FILE, JSON.stringify({
        users: Object.fromEntries(users),
        projects: Object.fromEntries(projects),
        templates: Object.fromEntries(templates),
        scenes: Object.fromEntries(scenes),
        playlists: Object.fromEntries(playlists),
        liveState
      }, null, 2), 'utf-8');
    } catch (e) {
      console.error('⚠ Failed to persist auth store:', e.message);
    }
  }, 500);
}

export const authStore = {
  // ── Users ──────────────────────────────────────────────────
  createUser(user) {
    users.set(user.id, user);
    persist();
    return user;
  },
  getUser(id) { return users.get(id) || null; },
  getUserByEmail(email) {
    for (const u of users.values()) {
      if (u.email === email) return u;
    }
    return null;
  },
  getAllUsers() { return Array.from(users.values()); },
  updateUser(id, updates) {
    const u = users.get(id);
    if (!u) return null;
    const updated = { ...u, ...updates, id };
    users.set(id, updated);
    persist();
    return updated;
  },
  deleteUser(id) {
    users.delete(id);
    persist();
  },

  // ── Templates ──────────────────────────────────────────────
  createTemplate(template) {
    templates.set(template.id, template);
    persist();
    return template;
  },
  getTemplate(id) { return templates.get(id) || null; },
  getAllTemplates(filters = {}) {
    let result = Array.from(templates.values());
    if (filters.category) result = result.filter(t => t.category === filters.category);
    if (filters.sport) result = result.filter(t => t.sport === filters.sport);
    if (filters.createdBy) result = result.filter(t => t.createdBy === filters.createdBy);
    if (filters.isPublic !== undefined) result = result.filter(t => t.isPublic === filters.isPublic);
    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(t => t.name.toLowerCase().includes(q));
    }
    return result;
  },
  updateTemplate(id, updates) {
    const t = templates.get(id);
    if (!t) return null;
    const updated = { ...t, ...updates, id, updatedAt: new Date().toISOString() };
    templates.set(id, updated);
    persist();
    return updated;
  },
  deleteTemplate(id) {
    const existed = templates.has(id);
    templates.delete(id);
    if (existed) persist();
    return existed;
  },

  // ── Scenes ─────────────────────────────────────────────────
  createScene(scene) {
    scenes.set(scene.id, scene);
    persist();
    return scene;
  },
  getScene(id) { return scenes.get(id) || null; },
  getAllScenes(filters = {}) {
    let result = Array.from(scenes.values());
    if (filters.createdBy) result = result.filter(s => s.createdBy === filters.createdBy);
    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(s => s.name.toLowerCase().includes(q));
    }
    return result;
  },
  updateScene(id, updates) {
    const s = scenes.get(id);
    if (!s) return null;
    const updated = { ...s, ...updates, id, updatedAt: new Date().toISOString() };
    scenes.set(id, updated);
    persist();
    return updated;
  },
  deleteScene(id) {
    const existed = scenes.has(id);
    scenes.delete(id);
    if (existed) persist();
    return existed;
  },

  // ── Playlists ──────────────────────────────────────────────
  createPlaylist(playlist) {
    playlists.set(playlist.id, playlist);
    persist();
    return playlist;
  },
  getPlaylist(id) { return playlists.get(id) || null; },
  getAllPlaylists(filters = {}) {
    let result = Array.from(playlists.values());
    if (filters.createdBy) result = result.filter(p => p.createdBy === filters.createdBy);
    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(p => p.name.toLowerCase().includes(q));
    }
    return result;
  },
  updatePlaylist(id, updates) {
    const p = playlists.get(id);
    if (!p) return null;
    const updated = { ...p, ...updates, id, updatedAt: new Date().toISOString() };
    playlists.set(id, updated);
    persist();
    return updated;
  },
  deletePlaylist(id) {
    const existed = playlists.has(id);
    playlists.delete(id);
    if (existed) persist();
    return existed;
  },

  // ── Projects ───────────────────────────────────────────────
  createProject(project) {
    projects.set(project.id, project);
    persist();
    return project;
  },
  getProject(id) { return projects.get(id) || null; },
  getAllProjects(filters = {}) {
    let result = Array.from(projects.values());
    if (filters.ownerId) result = result.filter(p => p.ownerId === filters.ownerId);
    if (filters.memberId) {
      result = result.filter(p =>
        p.ownerId === filters.memberId ||
        (p.members || []).some(m => m.userId === filters.memberId)
      );
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(p => p.name.toLowerCase().includes(q));
    }
    return result;
  },
  updateProject(id, updates) {
    const p = projects.get(id);
    if (!p) return null;
    const updated = { ...p, ...updates, id, updatedAt: new Date().toISOString() };
    projects.set(id, updated);
    persist();
    return updated;
  },
  deleteProject(id) {
    const existed = projects.has(id);
    projects.delete(id);
    if (existed) persist();
    return existed;
  },

  // ── Live State ─────────────────────────────────────────────
  getLiveState() { return liveState; },
  updateLiveState(updates) {
    liveState = { ...liveState, ...updates, updatedAt: new Date().toISOString() };
    persist();
    return liveState;
  }
};
