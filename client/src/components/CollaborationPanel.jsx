import { useState, useEffect, useCallback } from 'react';

const ROLE_COLORS = {
  admin: { bg: 'rgba(139, 92, 246, 0.15)', color: '#a855f7', border: 'rgba(139, 92, 246, 0.3)' },
  editor: { bg: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6', border: 'rgba(59, 130, 246, 0.3)' },
  viewer: { bg: 'rgba(100, 116, 139, 0.15)', color: '#94a3b8', border: 'rgba(100, 116, 139, 0.3)' }
};

export default function CollaborationPanel({ projectId, socket, currentUser }) {
  const [users, setUsers] = useState([]);
  const [activities, setActivities] = useState([]);
  const [activeTab, setActiveTab] = useState('users');
  const [roleMenuUserId, setRoleMenuUserId] = useState(null);

  useEffect(() => {
    if (!socket || !projectId) return;

    const handleUserJoined = (data) => {
      setUsers(prev => {
        if (prev.find(u => u.userId === data.userId)) return prev;
        return [...prev, { userId: data.userId, color: data.color, role: data.role }];
      });
    };

    const handleUserLeft = (data) => {
      setUsers(prev => prev.filter(u => u.userId !== data.userId));
    };

    const handleRoleChanged = (data) => {
      setUsers(prev => prev.map(u =>
        u.userId === data.targetUserId ? { ...u, role: data.role } : u
      ));
    };

    socket.on('collab:user-joined', handleUserJoined);
    socket.on('collab:user-left', handleUserLeft);
    socket.on('collab:role-changed', handleRoleChanged);

    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/collaboration/${projectId}/users`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
      .then(r => r.json())
      .then(data => setUsers(data.users || []))
      .catch(() => {});

    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/collaboration/${projectId}/activity?limit=30`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
      .then(r => r.json())
      .then(data => setActivities(data.activities || []))
      .catch(() => {});

    return () => {
      socket.off('collab:user-joined', handleUserJoined);
      socket.off('collab:user-left', handleUserLeft);
      socket.off('collab:role-changed', handleRoleChanged);
    };
  }, [socket, projectId]);

  const handleRoleChange = useCallback((userId, role) => {
    if (!socket || !projectId) return;
    socket.emit('collab:set-role', { projectId, userId, role });
    setRoleMenuUserId(null);
  }, [socket, projectId]);

  const handleRemoveUser = useCallback((userId) => {
    if (!socket || !projectId) return;
    socket.emit('collab:remove-user', { projectId, userId });
    setRoleMenuUserId(null);
  }, [socket, projectId]);

  return (
    <div className="collab-panel">
      <div className="collab-header">
        <h3 className="collab-title">Collaboration</h3>
        <div className="collab-tabs">
          <button
            className={`collab-tab ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            Users ({users.length})
          </button>
          <button
            className={`collab-tab ${activeTab === 'activity' ? 'active' : ''}`}
            onClick={() => setActiveTab('activity')}
          >
            Activity
          </button>
        </div>
      </div>

      {activeTab === 'users' && (
        <div className="collab-users-list">
          {users.map(user => (
            <div key={user.userId} className="collab-user-row">
              <div
                className="collab-user-avatar"
                style={{ background: user.color || '#64748b' }}
              >
                {(user.displayName || user.userId || '?')[0].toUpperCase()}
              </div>
              <div className="collab-user-info">
                <span className="collab-user-name">{user.displayName || user.userId}</span>
                <span
                  className="collab-user-role"
                  style={{
                    background: ROLE_COLORS[user.role]?.bg,
                    color: ROLE_COLORS[user.role]?.color,
                    borderColor: ROLE_COLORS[user.role]?.border
                  }}
                >
                  {user.role}
                </span>
              </div>
              <div className="collab-user-status">
                <span className={`collab-status-dot ${user.online !== false ? 'online' : ''}`} />
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'activity' && (
        <div className="collab-activity-list">
          {activities.map(activity => (
            <div key={activity.id} className="collab-activity-row">
              <div className="collab-activity-icon">
                {activity.action === 'user_joined' && '→'}
                {activity.action === 'user_left' && '←'}
                {activity.action === 'state_update' && '✎'}
                {activity.action === 'role_changed' && '★'}
                {activity.action === 'user_removed' && '✕'}
              </div>
              <div className="collab-activity-info">
                <span className="collab-activity-text">
                  {activity.user || activity.userId}
                  {activity.action === 'user_joined' && ' joined'}
                  {activity.action === 'user_left' && ' left'}
                  {activity.action === 'state_update' && ` updated ${activity.field}`}
                  {activity.action === 'role_changed' && ` changed ${activity.targetUserId}'s role to ${activity.role}`}
                  {activity.action === 'user_removed' && ` removed ${activity.targetUserId}`}
                </span>
                <span className="collab-activity-time">
                  {formatRelativeTime(activity.timestamp)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function formatRelativeTime(timestamp) {
  const now = Date.now();
  const time = new Date(timestamp).getTime();
  const diff = now - time;

  if (diff < 60000) return 'just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return new Date(timestamp).toLocaleDateString();
}
