import { useState, useEffect } from 'react';
import DataFeedCard from '../components/DataFeedCard';
import LiveScoreTicker from '../components/LiveScoreTicker';
import SocialFeedDisplay from '../components/SocialFeedDisplay';

const API = import.meta.env.VITE_API_URL || '';

function getAuthHeaders() {
  const token = localStorage.getItem('sc-token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

const FEED_TYPES = [
  { value: 'rss', label: 'RSS Feed', icon: '📰', desc: 'Fetch and parse RSS/Atom feeds' },
  { value: 'webhook', label: 'Webhook', icon: '🔗', desc: 'Receive data from external services' },
  { value: 'social', label: 'Social Media', icon: '💬', desc: 'Display social media content' },
  { value: 'score', label: 'Live Scores', icon: '🏏', desc: 'Aggregate live sports scores' }
];

export default function DataIntegrations() {
  const [feeds, setFeeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedType, setSelectedType] = useState('rss');
  const [formData, setFormData] = useState({
    url: '',
    platform: 'twitter',
    sport: 'cricket',
    keywords: '',
    pollInterval: 30,
    secret: '',
    path: '',
    category: 'general'
  });
  const [previewData, setPreviewData] = useState(null);
  const [transformInput, setTransformInput] = useState('');
  const [transformResult, setTransformResult] = useState(null);
  const [activeTab, setActiveTab] = useState('feeds');

  const fetchFeeds = async () => {
    try {
      const res = await fetch(`${API}/api/integrations`, { headers: getAuthHeaders() });
      if (res.ok) {
        const data = await res.json();
        setFeeds(data);
      }
    } catch (err) {
      console.error('Failed to fetch feeds:', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchFeeds();
  }, []);

  const addFeed = async () => {
    try {
      const config = {};
      if (selectedType === 'rss') {
        config.url = formData.url;
        config.pollInterval = parseInt(formData.pollInterval) || 30;
        config.maxItems = 20;
        config.category = formData.category;
      } else if (selectedType === 'webhook') {
        config.path = formData.path || 'data';
        config.method = 'POST';
        config.secret = formData.secret || null;
      } else if (selectedType === 'social') {
        config.platform = formData.platform;
        config.keywords = formData.keywords;
        config.pollInterval = parseInt(formData.pollInterval) || 30;
      } else if (selectedType === 'score') {
        config.sport = formData.sport;
        config.leagues = [];
        config.refreshInterval = parseInt(formData.pollInterval) || 30;
      }

      const res = await fetch(`${API}/api/integrations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ type: selectedType, config })
      });

      if (res.ok) {
        const feed = await res.json();
        setFeeds(prev => [...prev, { ...feed, dataCount: 0 }]);
        setShowAddForm(false);
        setFormData({
          url: '', platform: 'twitter', sport: 'cricket',
          keywords: '', pollInterval: 30, secret: '', path: '', category: 'general'
        });
      }
    } catch (err) {
      console.error('Failed to add feed:', err);
    }
  };

  const startFeed = async (feedId) => {
    await fetch(`${API}/api/integrations/${feedId}/start`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    fetchFeeds();
  };

  const stopFeed = async (feedId) => {
    await fetch(`${API}/api/integrations/${feedId}/stop`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    fetchFeeds();
  };

  const fetchPreview = async (feedId) => {
    try {
      const res = await fetch(`${API}/api/integrations/${feedId}/data`, {
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        setPreviewData(data.slice(0, 10));
      }
    } catch (err) {
      console.error('Failed to fetch preview:', err);
    }
  };

  const runTransform = async () => {
    try {
      const data = JSON.parse(transformInput);
      const res = await fetch(`${API}/api/integrations/transform`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ data, options: { toOverlay: true } })
      });
      if (res.ok) {
        const result = await res.json();
        setTransformResult(JSON.stringify(result, null, 2));
      }
    } catch (err) {
      setTransformResult(`Error: ${err.message}`);
    }
  };

  const scoreFeeds = feeds.filter(f => f.type === 'score');
  const socialFeeds = feeds.filter(f => f.type === 'social');

  return (
    <div className="page integrations-hub">
      <div className="container" style={{ padding: '24px' }}>
        <div className="integrations-header">
          <h1>
            <span className="gradient-text">Data Integrations</span>
          </h1>
          <p style={{ color: 'var(--text-400)', margin: '8px 0 0' }}>
            Connect external data sources and display them in your broadcasts
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="integrations-tabs">
          <button
            className={`integrations-tab ${activeTab === 'feeds' ? 'active' : ''}`}
            onClick={() => setActiveTab('feeds')}
          >
            📡 Feeds ({feeds.length})
          </button>
          <button
            className={`integrations-tab ${activeTab === 'scores' ? 'active' : ''}`}
            onClick={() => setActiveTab('scores')}
          >
            🏏 Live Scores
          </button>
          <button
            className={`integrations-tab ${activeTab === 'social' ? 'active' : ''}`}
            onClick={() => setActiveTab('social')}
          >
            💬 Social Feed
          </button>
          <button
            className={`integrations-tab ${activeTab === 'transform' ? 'active' : ''}`}
            onClick={() => setActiveTab('transform')}
          >
            🔧 Transform
          </button>
        </div>

        {/* Feeds Tab */}
        {activeTab === 'feeds' && (
          <div className="integrations-section">
            <div className="integrations-toolbar">
              <button
                className="btn btn-primary"
                onClick={() => setShowAddForm(!showAddForm)}
              >
                {showAddForm ? 'Cancel' : '+ Add Feed'}
              </button>
              <button className="btn btn-secondary" onClick={fetchFeeds}>
                Refresh
              </button>
            </div>

            {/* Add Feed Form */}
            {showAddForm && (
              <div className="card add-feed-form">
                <h3 style={{ marginBottom: 16 }}>Add New Feed</h3>
                <div className="feed-type-selector">
                  {FEED_TYPES.map(ft => (
                    <button
                      key={ft.value}
                      className={`feed-type-btn ${selectedType === ft.value ? 'active' : ''}`}
                      onClick={() => setSelectedType(ft.value)}
                    >
                      <span className="feed-type-icon">{ft.icon}</span>
                      <span className="feed-type-label">{ft.label}</span>
                      <span className="feed-type-desc">{ft.desc}</span>
                    </button>
                  ))}
                </div>

                <div className="feed-form-fields">
                  {selectedType === 'rss' && (
                    <>
                      <label>Feed URL</label>
                      <input
                        type="url"
                        value={formData.url}
                        onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                        placeholder="https://example.com/rss"
                        className="form-input"
                      />
                      <label>Poll Interval (seconds)</label>
                      <input
                        type="number"
                        value={formData.pollInterval}
                        onChange={(e) => setFormData({ ...formData, pollInterval: e.target.value })}
                        min="5"
                        max="300"
                        className="form-input"
                      />
                      <label>Category</label>
                      <input
                        type="text"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        placeholder="sports"
                        className="form-input"
                      />
                    </>
                  )}

                  {selectedType === 'webhook' && (
                    <>
                      <label>Webhook Path</label>
                      <input
                        type="text"
                        value={formData.path}
                        onChange={(e) => setFormData({ ...formData, path: e.target.value })}
                        placeholder="data"
                        className="form-input"
                      />
                      <label>HMAC Secret (optional)</label>
                      <input
                        type="text"
                        value={formData.secret}
                        onChange={(e) => setFormData({ ...formData, secret: e.target.value })}
                        placeholder="Optional secret for signature validation"
                        className="form-input"
                      />
                    </>
                  )}

                  {selectedType === 'social' && (
                    <>
                      <label>Platform</label>
                      <select
                        value={formData.platform}
                        onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                        className="form-input"
                      >
                        <option value="twitter">Twitter</option>
                        <option value="instagram">Instagram</option>
                        <option value="youtube">YouTube</option>
                      </select>
                      <label>Keywords (comma-separated)</label>
                      <input
                        type="text"
                        value={formData.keywords}
                        onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                        placeholder="cricket, live, sports"
                        className="form-input"
                      />
                    </>
                  )}

                  {selectedType === 'score' && (
                    <>
                      <label>Sport</label>
                      <select
                        value={formData.sport}
                        onChange={(e) => setFormData({ ...formData, sport: e.target.value })}
                        className="form-input"
                      >
                        <option value="all">All Sports</option>
                        <option value="cricket">Cricket</option>
                        <option value="football">Football</option>
                        <option value="basketball">Basketball</option>
                      </select>
                      <label>Refresh Interval (seconds)</label>
                      <input
                        type="number"
                        value={formData.pollInterval}
                        onChange={(e) => setFormData({ ...formData, pollInterval: e.target.value })}
                        min="10"
                        max="120"
                        className="form-input"
                      />
                    </>
                  )}

                  <button
                    className="btn btn-primary"
                    onClick={addFeed}
                    style={{ marginTop: 12 }}
                    disabled={!formData.url && selectedType === 'rss'}
                  >
                    Create Feed
                  </button>
                </div>
              </div>
            )}

            {/* Feed List */}
            {loading ? (
              <p style={{ color: 'var(--text-400)' }}>Loading feeds...</p>
            ) : feeds.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '40px 20px' }}>
                <p style={{ color: 'var(--text-400)' }}>
                  No data feeds configured. Click "Add Feed" to get started.
                </p>
              </div>
            ) : (
              <div className="feed-card-grid">
                {feeds.map(feed => (
                  <DataFeedCard
                    key={feed.id}
                    feed={feed}
                    onUpdate={fetchFeeds}
                  />
                ))}
              </div>
            )}

            {/* Data Preview */}
            {previewData && (
              <div className="card data-preview" style={{ marginTop: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <h3>Data Preview</h3>
                  <button className="btn btn-sm btn-secondary" onClick={() => setPreviewData(null)}>Close</button>
                </div>
                <div className="data-preview-table-wrapper">
                  <table className="data-preview-table">
                    <thead>
                      <tr>
                        {previewData.length > 0 && Object.keys(previewData[0]).slice(0, 6).map(key => (
                          <th key={key}>{key}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {previewData.map((row, idx) => (
                        <tr key={idx}>
                          {Object.values(row).slice(0, 6).map((val, i) => (
                            <td key={i}>{typeof val === 'object' ? JSON.stringify(val) : String(val)}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Scores Tab */}
        {activeTab === 'scores' && (
          <div className="integrations-section">
            <LiveScoreTicker />
          </div>
        )}

        {/* Social Tab */}
        {activeTab === 'social' && (
          <div className="integrations-section">
            <SocialFeedDisplay />
          </div>
        )}

        {/* Transform Tab */}
        {activeTab === 'transform' && (
          <div className="integrations-section">
            <div className="card transform-panel">
              <h3 style={{ marginBottom: 16 }}>Data Transformer</h3>
              <p style={{ color: 'var(--text-400)', marginBottom: 16, fontSize: '0.9rem' }}>
                Transform raw data into overlay-compatible format. Paste JSON data below.
              </p>
              <div className="transform-grid">
                <div className="transform-col">
                  <label>Input (JSON)</label>
                  <textarea
                    className="form-input transform-input"
                    value={transformInput}
                    onChange={(e) => setTransformInput(e.target.value)}
                    placeholder='{"sport": "cricket", "team": "India", "score": "250/5"}'
                    rows={10}
                  />
                  <button className="btn btn-primary" onClick={runTransform} style={{ marginTop: 8 }}>
                    Transform →
                  </button>
                </div>
                <div className="transform-col">
                  <label>Overlay Variables Output</label>
                  <pre className="transform-output">
                    {transformResult || '// Output will appear here'}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
