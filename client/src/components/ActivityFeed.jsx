import { useState, useEffect, useRef } from 'react';

const ACTION_ICONS = {
  user_joined: '→',
  user_left: '←',
  state_update: '✎',
  role_changed: '★',
  user_removed: '✕'
};

export default function ActivityFeed({ activities = [], maxItems = 50 }) {
  const listRef = useRef(null);
  const [displayActivities, setDisplayActivities] = useState([]);

  useEffect => {
    setDisplayActivities(activities.slice(0, maxItems));
  }, [activities, maxItems]);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = 0;
    }
  }, [displayActivities]);

  if (displayActivities.length === 0) {
    return (
      <div className="activity-feed">
        <div className="activity-empty">
          No activity yet
        </div>
      </div>
    );
  }

  return (
    <div className="activity-feed" ref={listRef}>
      {displayActivities.map(activity => (
        <div key={activity.id} className="activity-item">
          <div className="activity-icon">
            {ACTION_ICONS[activity.action] || '·'}
          </div>
          <div className="activity-content">
            <div className="activity-text">
              <span className="activity-user">{activity.user || activity.userId}</span>
              {activity.action === 'user_joined' && ' joined the project'}
              {activity.action === 'user_left' && ' left the project'}
              {activity.action === 'state_update' && (
                <> updated <span className="activity-field">{activity.field}</span></>
              )}
              {activity.action === 'role_changed' && (
                <>
                  {' '}changed <span className="activity-target">{activity.targetUserId}</span>
                  {' '}role to <span className="activity-role">{activity.role}</span>
                </>
              )}
              {activity.action === 'user_removed' && (
                <> removed <span className="activity-target">{activity.targetUserId}</span></>
              )}
            </div>
            <div className="activity-time">
              {formatRelativeTime(activity.timestamp)}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function formatRelativeTime(timestamp) {
  const now = Date.now();
  const time = new Date(timestamp).getTime();
  const diff = now - time;

  if (diff < 10000) return 'just now';
  if (diff < 60000) return `${Math.floor(diff / 1000)}s ago`;
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return new Date(timestamp).toLocaleDateString();
}
