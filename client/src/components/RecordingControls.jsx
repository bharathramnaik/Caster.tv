import { useState, useEffect, useCallback } from 'react';

const API = 'http://localhost:3001/api';

const FORMATS = [
  { id: 'mp4', name: 'MP4' },
  { id: 'webm', name: 'WebM' },
  { id: 'mkv', name: 'MKV' },
];

const QUALITIES = [
  { id: 'ultra', name: 'Ultra (4K)' },
  { id: 'high', name: 'High (1080p)' },
  { id: 'medium', name: 'Medium (720p)' },
  { id: 'low', name: 'Low (480p)' },
  { id: 'mobile', name: 'Mobile (360p)' },
];

function formatTime(seconds) {
  const h = String(Math.floor(seconds / 3600)).padStart(2, '0');
  const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
  const s = String(seconds % 60).padStart(2, '0');
  return `${h}:${m}:${s}`;
}

function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

export default function RecordingControls() {
  const [status, setStatus] = useState({ state: 'idle', duration: 0, fileSize: 0, format: null });
  const [format, setFormat] = useState('mp4');
  const [quality, setQuality] = useState('high');
  const [error, setError] = useState(null);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch(`${API}/recording/status`);
      if (res.ok) {
        const data = await res.json();
        setStatus(data);
      }
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 1000);
    return () => clearInterval(interval);
  }, [fetchStatus]);

  const handleStart = async () => {
    setError(null);
    try {
      const res = await fetch(`${API}/recording/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ format, quality }),
      });
      if (!res.ok) {
        const err = await res.json();
        setError(err.error);
        return;
      }
      fetchStatus();
    } catch (err) {
      setError('Failed to start recording');
    }
  };

  const handleStop = async () => {
    setError(null);
    try {
      await fetch(`${API}/recording/stop`, { method: 'POST' });
      fetchStatus();
    } catch (err) {
      setError('Failed to stop recording');
    }
  };

  const handlePause = async () => {
    setError(null);
    try {
      await fetch(`${API}/recording/pause`, { method: 'POST' });
      fetchStatus();
    } catch (err) {
      setError('Failed to pause recording');
    }
  };

  const handleResume = async () => {
    setError(null);
    try {
      await fetch(`${API}/recording/resume`, { method: 'POST' });
      fetchStatus();
    } catch (err) {
      setError('Failed to resume recording');
    }
  };

  const isRecording = status.state === 'recording' || status.state === 'preparing';
  const isPaused = status.state === 'paused';

  return (
    <div className="recording-controls">
      <div className="recording-controls-header">
        <h3>Recording</h3>
        {isRecording && (
          <span className="recording-indicator">
            <span className="recording-dot"></span>
            {isPaused ? 'PAUSED' : 'REC'}
          </span>
        )}
      </div>

      <div className="recording-timer">{formatTime(status.duration)}</div>

      <div className="recording-controls-row">
        <button
          className="btn btn-danger btn-lg"
          onClick={handleStart}
          disabled={isRecording}
        >
          <span className="rec-icon">&#9679;</span>
          Record
        </button>

        <button
          className="btn btn-secondary"
          onClick={handleStop}
          disabled={!isRecording && !isPaused}
        >
          <span className="stop-icon">&#9632;</span>
          Stop
        </button>

        {isRecording && !isPaused && (
          <button className="btn btn-secondary" onClick={handlePause}>
            Pause
          </button>
        )}

        {isPaused && (
          <button className="btn btn-primary" onClick={handleResume}>
            Resume
          </button>
        )}
      </div>

      <div className="recording-options">
        <div className="recording-option">
          <label className="label">Format</label>
          <select
            className="select"
            value={format}
            onChange={(e) => setFormat(e.target.value)}
            disabled={isRecording}
          >
            {FORMATS.map((f) => (
              <option key={f.id} value={f.id}>{f.name}</option>
            ))}
          </select>
        </div>

        <div className="recording-option">
          <label className="label">Quality</label>
          <select
            className="select"
            value={quality}
            onChange={(e) => setQuality(e.target.value)}
            disabled={isRecording}
          >
            {QUALITIES.map((q) => (
              <option key={q.id} value={q.id}>{q.name}</option>
            ))}
          </select>
        </div>
      </div>

      {status.fileSize > 0 && (
        <div className="recording-meta">
          Size: {formatFileSize(status.fileSize)}
        </div>
      )}

      {error && <div className="recording-error">{error}</div>}
    </div>
  );
}
