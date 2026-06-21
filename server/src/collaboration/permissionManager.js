import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, '..', '..', 'data');
const PERMISSIONS_FILE = join(DATA_DIR, 'permissions.json');

const ROLE_HIERARCHY = { admin: 3, editor: 2, viewer: 1 };

const PERMISSIONS = {
  admin: ['edit', 'delete', 'manage_users', 'manage_settings', 'view'],
  editor: ['edit', 'view'],
  viewer: ['view']
};

export class PermissionManager {
  constructor() {
    this.data = this.load();
  }

  load() {
    try {
      if (!existsSync(DATA_DIR)) {
        mkdirSync(DATA_DIR, { recursive: true });
      }
      if (existsSync(PERMISSIONS_FILE)) {
        return JSON.parse(readFileSync(PERMISSIONS_FILE, 'utf-8'));
      }
    } catch (err) {
      console.error('Failed to load permissions:', err.message);
    }
    return {};
  }

  save() {
    try {
      if (!existsSync(DATA_DIR)) {
        mkdirSync(DATA_DIR, { recursive: true });
      }
      writeFileSync(PERMISSIONS_FILE, JSON.stringify(this.data, null, 2));
    } catch (err) {
      console.error('Failed to save permissions:', err.message);
    }
  }

  setRole(projectId, userId, role, setByUserId) {
    if (!ROLE_HIERARCHY[role]) {
      return { error: 'Invalid role. Must be admin, editor, or viewer' };
    }

    if (!this.data[projectId]) {
      this.data[projectId] = {};
    }

    const setterRole = this.data[projectId][setByUserId] || 'viewer';
    if (ROLE_HIERARCHY[setterRole] <= ROLE_HIERARCHY[role]) {
      return { error: 'Cannot assign a role equal to or higher than your own' };
    }

    this.data[projectId][userId] = role;
    this.save();
    return { success: true, role };
  }

  getRole(projectId, userId) {
    return this.data[projectId]?.[userId] || null;
  }

  checkPermission(role, permission) {
    const perms = PERMISSIONS[role] || [];
    return perms.includes(permission);
  }

  getProjectUsers(projectId) {
    const projectRoles = this.data[projectId] || {};
    return Object.entries(projectRoles).map(([userId, role]) => ({
      userId,
      role
    }));
  }

  removeUser(projectId, userId, removedByUserId) {
    const removerRole = this.data[projectId]?.[removedByUserId] || 'viewer';
    if (removerRole !== 'admin') {
      return { error: 'Only admins can remove users' };
    }

    if (this.data[projectId]) {
      delete this.data[projectId][userId];
      this.save();
    }
    return { success: true };
  }
}
