import { PresenceManager } from './presenceManager.js';
import { PermissionManager } from './permissionManager.js';
import { ActivityLog } from './activityLog.js';
import { ConflictResolver } from './conflictResolver.js';

export class CollaborationManager {
  constructor(io) {
    this.io = io;
    this.projects = new Map();
    this.presence = new PresenceManager();
    this.permissions = new PermissionManager();
    this.activityLog = new ActivityLog();
    this.conflictResolver = new ConflictResolver();
  }

  joinProject(projectId, userId, socketId, userInfo = {}) {
    if (!this.projects.has(projectId)) {
      this.projects.set(projectId, { state: {}, lockedFields: new Map() });
    }

    const role = this.permissions.getRole(projectId, userId) || 'viewer';
    const color = this.presence.getUserColor(projectId, userId);
    this.presence.addUser(projectId, userId, { ...userInfo, socketId, role, color });

    this.activityLog.log(projectId, {
      action: 'user_joined',
      userId,
      user: userInfo.displayName || userId,
      role,
      timestamp: new Date().toISOString()
    });

    this.io.to(`project:${projectId}`).emit('collab:user-joined', {
      userId,
      role,
      color,
      timestamp: Date.now()
    });

    return { users: this.presence.getUsers(projectId), color, role };
  }

  leaveProject(projectId, userId) {
    this.presence.removeUser(projectId, userId);

    this.activityLog.log(projectId, {
      action: 'user_left',
      userId,
      timestamp: new Date().toISOString()
    });

    this.io.to(`project:${projectId}`).emit('collab:user-left', {
      userId,
      timestamp: Date.now()
    });
  }

  getUsers(projectId) {
    return this.presence.getUsers(projectId);
  }

  getProjectState(projectId) {
    const project = this.projects.get(projectId);
    return project ? project.state : null;
  }

  updateProjectState(projectId, userId, field, value, version) {
    const role = this.permissions.getRole(projectId, userId);
    if (!this.permissions.checkPermission(role, 'edit')) {
      return { error: 'Insufficient permissions' };
    }

    const project = this.projects.get(projectId);
    if (!project) return { error: 'Project not found' };

    const conflict = this.conflictResolver.checkConflict(projectId, field, version);
    if (conflict) {
      return { conflict, currentVersion: project.state[field]?.version || 0 };
    }

    project.state[field] = {
      value,
      version: (version || 0) + 1,
      updatedBy: userId,
      updatedAt: new Date().toISOString()
    };

    this.activityLog.log(projectId, {
      action: 'state_update',
      userId,
      field,
      timestamp: new Date().toISOString()
    });

    this.io.to(`project:${projectId}`).emit('collab:state-updated', {
      field,
      value,
      version: project.state[field].version,
      updatedBy: userId,
      timestamp: Date.now()
    });

    return { success: true, version: project.state[field].version };
  }

  broadcast(projectId, event, data) {
    this.io.to(`project:${projectId}`).emit(event, data);
  }

  getActivityLog(projectId) {
    return this.activityLog.getLog(projectId);
  }

  setRole(projectId, targetUserId, role, setByUserId) {
    const result = this.permissions.setRole(projectId, targetUserId, role, setByUserId);
    if (result.success) {
      this.activityLog.log(projectId, {
        action: 'role_changed',
        userId: setByUserId,
        targetUserId,
        role,
        timestamp: new Date().toISOString()
      });
      this.io.to(`project:${projectId}`).emit('collab:role-changed', {
        targetUserId,
        role,
        setBy: setByUserId,
        timestamp: Date.now()
      });
    }
    return result;
  }

  removeUser(projectId, targetUserId, removedByUserId) {
    const result = this.permissions.removeUser(projectId, targetUserId, removedByUserId);
    if (result.success) {
      this.leaveProject(projectId, targetUserId);
      this.activityLog.log(projectId, {
        action: 'user_removed',
        userId: removedByUserId,
        targetUserId,
        timestamp: new Date().toISOString()
      });
    }
    return result;
  }
}
