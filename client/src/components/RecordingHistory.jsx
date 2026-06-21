import { useState, useEffect, useCallback } from 'react';

const API = 'http://localhost:3001/api';

function formatDuration(seconds) {
  const h = String(Math.floor(seconds / 3600)).padStart(2, '0');
  const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
  const s = String(seconds % 60).padStart(2, '0');
  return `${h}:${m}:${s}`;
}

function formatFileSize(bytes) {
  if (!bytes) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

function formatDate(iso) {
  if (!iso) return '-';
  const d = new Date(iso);
  return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function RecordingHistory() {
  const [recordings, setRecordings] = useState([]);
  const [filterFormat, setFilterFormat] = useState('all');
  const [sortBy, setSortBy] = useState('date');

  const fetchRecordings = useCallback(async () => {
    try {
      const res = await fetch(`${API}/recording/recordings`);
      if (res.ok) setRecordings(await res.json());
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    fetchRecordings();
    const interval = setInterval(fetchRecordings, 5000);
    return () => clearInterval(interval);
  }, [fetchRecordings]);

  const handleDownload = async (id) => {
    try {
      const res = await fetch(`${API}/recording/recordings/${id}/download`);
      if (res.ok) {
        const data = await res.json();
        alert(data.message || `Download: ${data.downloadUrl}`);
      }
    } catch { /* ignore */ }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this recording?')) return;
    try {
      await fetch(`${API}/recording/recordings/${id}`, { method: 'DELETE' });
      fetchRecordings();
    } catch { /* ignore */ }
  };

  let filtered = recordings;
  if (filterFormat !== 'all') {
    filtered = filtered.filter((r) => r.format === filterFormat);
  }
  if (sortBy === 'duration') {
    filtered = [...filtered].sort((a, b) => (b.duration || 0) - (a.duration || 0));
  } else if (sortBy === 'size') {
    filtered = [...filtered].sort((a, b) => (b.fileSize || 0) - (a.fileSize || 0));
  }

  return (
    <div className="recording-history">
      <div className="recording-history-header">
        <h3>Recording History</h3>
        <span className="recording-count">{filtered.length} recordings</span>
      </div>

      <div className="recording-filters">
        <select
          className="select"
          value={filterFormat}
          onChange={(e) => setFilterFormat(e.target.value)}
        >
          <option value="all">All Formats</option>
          <option value="mp4">MP4</option>
          <option value="webm">WebM</option>
          <option value="mkv">MKV</option>
        </select>

        <select
          className="select"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="date">Sort by Date</option>
          <option value="duration">Sort by Duration</option>
          <option value="size">Sort by Size</option>
        </select>
      </div>

      <div className="recording-list">
        {filtered.map((rec) => (
          <div key={rec.id} className="recording-item">
            <div className="recording-item-info">
              <div className="recording-item-name">
                <span className={`recording-format-badge ${rec.format}`}>{rec.format.toUpperCase()}</span>
                Recording {rec.id}
              </div>
              <div className="recording-item-meta">
                {formatDate(rec.createdAt)} &bull; {formatDuration(rec.duration)} &bull; {formatFileSize(rec.fileSize)}
              </div>
              <div className="recording-item-status">
                <span className={`recording-status-chip ${rec.state}`}>{rec.state}</span>
              </div>
            </div>
            <div className="recording-item-actions">
              <button className="btn btn-sm btn-secondary" onClick={() => handleDownload(rec.id)}>
                Download
              </button>
              <button className="btn btn-sm btn-danger" onClick={() => handleDelete(rec.id)}>
                Delete
              </button>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="recording-list-empty">
            <p>No recordings found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
