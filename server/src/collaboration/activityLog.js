const MAX_LOG_SIZE = 500;

export class ActivityLog {
  constructor() {
    this.logs = new Map();
  }

  log(projectId, entry) {
    if (!this.logs.has(projectId)) {
      this.logs.set(projectId, []);
    }

    const log = this.logs.get(projectId);
    log.push({
      id: `act_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      ...entry,
      timestamp: entry.timestamp || new Date().toISOString()
    });

    if (log.length > MAX_LOG_SIZE) {
      log.splice(0, log.length - MAX_LOG_SIZE);
    }
  }

  getLog(projectId) {
    return this.logs.get(projectId) || [];
  }

  getLogByUser(projectId, userId) {
    const log = this.logs.get(projectId) || [];
    return log.filter(entry => entry.userId === userId);
  }

  getLogByAction(projectId, action) {
    const log = this.logs.get(projectId) || [];
    return log.filter(entry => entry.action === action);
  }

  clearLog(projectId) {
    this.logs.set(projectId, []);
  }

  getLogCount(projectId) {
    return (this.logs.get(projectId) || []).length;
  }

  cleanup() {
    this.logs.clear();
  }
}
