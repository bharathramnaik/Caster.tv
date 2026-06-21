import { useState } from 'react';

const API = import.meta.env.VITE_API_URL || '';

function getAuthHeaders() {
  const token = localStorage.getItem('sc-token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

const TYPE_ICONS = {
  rss: '📰',
  webhook: '🔗',
  social: '💬',
  score: '🏏'
};

const STATUS_CLASSES = {
  active: 'feed-status-active',
  stopped: 'feed-status-stopped',
  error: 'feed-status-error'
};

/**
 * DataFeedCard - Compact card showing a single data feed's status and controls.
 */
export default function DataFeedCard({ feed, onUpdate }) {
  const [loading, setLoading] = useState(false);

  const toggleFeed = async () => {
    setLoading(true);
    try {
      const action = feed.status === 'active' ? 'stop' : 'start';
      await fetch(`${API}/api/integrations/${feed.id}/${action}`, {
        method: 'POST',
        headers: getAuthHeaders()
      });
      if (onUpdate) onUpdate();
    } catch (err) {
      console.error('Failed to toggle feed:', err);
    }
    setLoading(false);
  };

  const removeFeed = async () => {
    if (!confirm('Remove this feed?')) return;
    setLoading(true);
    try {
      await fetch(`${API}/api/integrations/${feed.id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (onUpdate) onUpdate();
    } catch (err) {
      console.error('Failed to remove feed:', err);
    }
    setLoading(false);
  };

  const timeAgo = feed.lastUpdated
    ? `${Math.floor((Date.now() - new Date(feed.lastUpdated).getTime()) / 60000)}m ago`
    : 'Never';

  return (
    <div className={`feed-card ${feed.status === 'error' ? 'feed-card-error' : ''}`}>
      <div className="feed-card-header">
        <span className="feed-card-icon">{TYPE_ICONS[feed.type] || '📦'}</span>
        <div className="feed-card-info">
          <h4 className="feed-card-title">
            {feed.config?.url?.substring(0, 30) || feed.config?.platform || feed.config?.sport || feed.path || feed.type}
          </h4>
          <span className="feed-card-type">{feed.type.toUpperCase()}</span>
        </div>
        <span className={`feed-status ${STATUS_CLASSES[feed.status] || ''}`}>
          {feed.status}
        </span>
      </div>

      <div className="feed-card-meta">
        <span className="feed-card-items">{feed.dataCount || feed.data?.length || 0} items</span>
        <span className="feed-card-time">{timeAgo}</span>
      </div>

      <div className="feed-controls">
        <button
          className={`btn btn-sm ${feed.status === 'active' ? 'btn-warning' : 'btn-primary'}`}
          onClick={toggleFeed}
          disabled={loading}
        >
          {loading ? '...' : feed.status === 'active' ? 'Stop' : 'Start'}
        </button>
        <button
          className="btn btn-sm btn-danger"
          onClick={removeFeed}
          disabled={loading}
        >
          Remove
        </button>
      </div>
    </div>
  );
}
