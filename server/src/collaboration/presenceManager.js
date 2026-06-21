const AVATAR_COLORS = [
  '#ef4444', '#f97316', '#eab308', '#22c55e',
  '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899',
  '#f43f5e', '#14b8a6', '#a855f7', '#6366f1'
];

const HEARTBEAT_INTERVAL = 30000;

export class PresenceManager {
  constructor() {
    this.projects = new Map();
    this.colorAssignments = new Map();
    this.heartbeatTimers = new Map();
  }

  addUser(projectId, userId, info = {}) {
    if (!this.projects.has(projectId)) {
      this.projects.set(projectId, new Map());
    }

    const projectUsers = this.projects.get(projectId);
    projectUsers.set(userId, {
      userId,
      displayName: info.displayName || userId,
      avatar: info.avatar || null,
      color: this.getUserColor(projectId, userId),
      cursor: null,
      online: true,
      joinedAt: new Date().toISOString(),
      lastHeartbeat: Date.now(),
      socketId: info.socketId || null,
      role: info.role || 'viewer'
    });

    this.startHeartbeat(projectId, userId);
    return projectUsers.get(userId);
  }

  removeUser(projectId, userId) {
    const projectUsers = this.projects.get(projectId);
    if (projectUsers) {
      projectUsers.delete(userId);
      if (projectUsers.size === 0) {
        this.projects.delete(projectId);
        this.stopHeartbeat(projectId);
      }
    }
  }

  updateCursor(projectId, userId, x, y, targetId = null) {
    const projectUsers = this.projects.get(projectId);
    if (!projectUsers) return null;

    const user = projectUsers.get(userId);
    if (!user) return null;

    user.cursor = { x, y, targetId, updatedAt: Date.now() };
    user.lastHeartbeat = Date.now();
    return user;
  }

  getUsers(projectId) {
    const projectUsers = this.projects.get(projectId);
    if (!projectUsers) return [];
    return Array.from(projectUsers.values());
  }

  getUserColor(projectId, userId) {
    const key = `${projectId}:${userId}`;
    if (this.colorAssignments.has(key)) {
      return this.colorAssignments.get(key);
    }

    const projectUsers = this.projects.get(projectId);
    const usedColors = projectUsers
      ? Array.from(projectUsers.values()).map(u => u.color)
      : [];

    const availableColors = AVATAR_COLORS.filter(c => !usedColors.includes(c));
    const color = availableColors.length > 0
      ? availableColors[0]
      : AVATAR_COLORS[userId.charCodeAt(0) % AVATAR_COLORS.length];

    this.colorAssignments.set(key, color);
    return color;
  }

  isOnline(projectId, userId) {
    const projectUsers = this.projects.get(projectId);
    if (!projectUsers) return false;
    const user = projectUsers.get(userId);
    return user ? user.online : false;
  }

  startHeartbeat(projectId, userId) {
    const timerKey = `${projectId}:${userId}`;
    this.stopHeartbeat(projectId, userId);

    const timer = setInterval(() => {
      const projectUsers = this.projects.get(projectId);
      if (!projectUsers) {
        this.stopHeartbeat(projectId, userId);
        return;
      }

      const user = projectUsers.get(userId);
      if (!user) {
        this.stopHeartbeat(projectId, userId);
        return;
      }

      if (Date.now() - user.lastHeartbeat > HEARTBEAT_INTERVAL * 2) {
        user.online = false;
      }
    }, HEARTBEAT_INTERVAL);

    this.heartbeatTimers.set(timerKey, timer);
  }

  stopHeartbeat(projectId, userId) {
    const timerKey = `${projectId}:${userId}`;
    const timer = this.heartbeatTimers.get(timerKey);
    if (timer) {
      clearInterval(timer);
      this.heartbeatTimers.delete(timerKey);
    }
  }

  cleanup() {
    for (const [timerKey, timer] of this.heartbeatTimers) {
      clearInterval(timer);
    }
    this.heartbeatTimers.clear();
    this.projects.clear();
    this.colorAssignments.clear();
  }
}
