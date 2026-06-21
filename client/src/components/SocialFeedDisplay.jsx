import { useState, useEffect } from 'react';

const API = import.meta.env.VITE_API_URL || '';

function getAuthHeaders() {
  const token = localStorage.getItem('sc-token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

const PLATFORM_ICONS = {
  twitter: '🐦',
  instagram: '📸',
  youtube: '📺'
};

const PLATFORM_COLORS = {
  twitter: '#1da1f2',
  instagram: '#e4405f',
  youtube: '#ff0000'
};

/**
 * SocialFeedDisplay - Card grid displaying social media posts.
 * Supports filtering by platform and keyword.
 */
export default function SocialFeedDisplay({ refreshInterval = 60 }) {
  const [posts, setPosts] = useState([]);
  const [platform, setPlatform] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set('query', searchQuery);
      if (platform !== 'all') params.set('platform', platform);
      const qs = params.toString();
      const url = `${API}/api/integrations/social/search${qs ? `?${qs}` : ''}`;
      const res = await fetch(url, { headers: getAuthHeaders() });
      if (res.ok) {
        const data = await res.json();
        setPosts(data.results || []);
      }
    } catch (err) {
      console.error('Failed to fetch social posts:', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPosts();
    const interval = setInterval(fetchPosts, refreshInterval * 1000);
    return () => clearInterval(interval);
  }, [platform, searchQuery, refreshInterval]);

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const diff = Math.floor((Date.now() - new Date(timestamp).getTime()) / 60000);
    if (diff < 1) return 'Just now';
    if (diff < 60) return `${diff}m ago`;
    const hours = Math.floor(diff / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const formatNumber = (n) => {
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
    return String(n);
  };

  return (
    <div className="social-feed-container">
      <div className="social-feed-header">
        <div className="social-feed-filters">
          {['all', 'twitter', 'instagram', 'youtube'].map(p => (
            <button
              key={p}
              className={`btn btn-sm ${platform === p ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setPlatform(p)}
            >
              {p === 'all' ? 'All' : `${PLATFORM_ICONS[p] || ''} ${p.charAt(0).toUpperCase() + p.slice(1)}`}
            </button>
          ))}
        </div>
        <input
          type="text"
          className="social-search-input"
          placeholder="Search posts..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {loading && posts.length === 0 ? (
        <div className="social-loading">Loading social posts...</div>
      ) : posts.length === 0 ? (
        <div className="social-empty">
          No social posts found. Configure a social feed to see content here.
        </div>
      ) : (
        <div className="social-feed-grid">
          {posts.map(post => (
            <div key={post.id} className="social-post-card">
              <div className="social-post-header">
                <img
                  src={post.author?.avatar || ''}
                  alt=""
                  className="social-post-avatar"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
                <div className="social-post-author">
                  <span className="social-post-name">{post.author?.name || 'Unknown'}</span>
                  <span className="social-post-handle">{post.author?.handle || ''}</span>
                </div>
                <span
                  className="social-post-platform"
                  style={{ color: PLATFORM_COLORS[post.platform] || '#999' }}
                >
                  {PLATFORM_ICONS[post.platform] || '📱'}
                </span>
              </div>

              <p className="social-post-content">{post.content}</p>

              {post.image && (
                <img
                  src={post.image}
                  alt=""
                  className="social-post-image"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              )}

              <div className="social-post-meta">
                <span className="social-post-time">{formatTime(post.timestamp)}</span>
                <div className="social-post-stats">
                  <span title="Likes">❤️ {formatNumber(post.likes || 0)}</span>
                  <span title="Shares">🔄 {formatNumber(post.shares || 0)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
