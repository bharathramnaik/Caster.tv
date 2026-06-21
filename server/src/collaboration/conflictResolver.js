export class ConflictResolver {
  constructor() {
    this.versions = new Map();
    this.conflicts = new Map();
  }

  checkConflict(projectId, field, clientVersion) {
    const versionKey = `${projectId}:${field}`;
    const currentVersion = this.versions.get(versionKey) || 0;

    if (clientVersion && clientVersion < currentVersion) {
      const conflict = {
        field,
        clientVersion,
        serverVersion: currentVersion,
        detectedAt: new Date().toISOString()
      };

      if (!this.conflicts.has(projectId)) {
        this.conflicts.set(projectId, []);
      }
      this.conflicts.get(projectId).push(conflict);

      return conflict;
    }

    this.versions.set(versionKey, (clientVersion || 0) + 1);
    return null;
  }

  resolveConflict(projectId, field, winnerValue, winnerVersion) {
    const versionKey = `${projectId}:${field}`;
    this.versions.set(versionKey, (winnerVersion || 0) + 1);

    if (this.conflicts.has(projectId)) {
      const conflicts = this.conflicts.get(projectId);
      const idx = conflicts.findIndex(c => c.field === field);
      if (idx !== -1) {
        conflicts.splice(idx, 1);
      }
    }

    return {
      resolved: true,
      field,
      value: winnerValue,
      version: (winnerVersion || 0) + 1,
      resolution: 'last-write-wins',
      resolvedAt: new Date().toISOString()
    };
  }

  getConflicts(projectId) {
    return this.conflicts.get(projectId) || [];
  }

  getVersion(projectId, field) {
    return this.versions.get(`${projectId}:${field}`) || 0;
  }

  cleanup() {
    this.versions.clear();
    this.conflicts.clear();
  }
}
