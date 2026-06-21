import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { io } from 'socket.io-client';
import StreamingHealth from '../components/StreamingHealth';

const API = import.meta.env.VITE_API_URL || '';
const SERVER_URL = import.meta.env.VITE_API_URL || '';

export default function StreamingDashboard() {
  const [outputs, setOutputs] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [connected, setConnected] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedOutput, setSelectedOutput] = useState(null);
  const socketRef = useRef(null);

  // Fetch outputs
  const fetchOutputs = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/streaming`);
      const data = await res.json();
      setOutputs(data);
    } catch (err) {
      console.error('Failed to fetch outputs:', err);
    }
  }, []);

  // Fetch alerts
  const fetchAlerts = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/streaming/alerts`);
      const data = await res.json();
      setAlerts(data);
    } catch (err) {
      console.error('Failed to fetch alerts:', err);
    }
  }, []);

  // Socket.IO connection
  useEffect(() => {
    const socket = io(SERVER_URL || window.location.origin, {
      transports: ['websocket', 'polling']
    });
    socketRef.current = socket;

    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));

    socket.on('stream:status', (data) => {
      setOutputs(prev => prev.map(o =>
        o.id === data.outputId ? { ...o, state: data.state } : o
      ));
    });

    socket.on('stream:viewers', (data) => {
      setOutputs(prev => prev.map(o =>
        o.id === data.outputId ? { ...o, viewers: data.count } : o
      ));
    });

    socket.on('stream:health', (data) => {
      setOutputs(prev => prev.map(o =>
        o.id === data.outputId ? { ...o, metrics: data.health } : o
      ));
    });

    return () => socket.disconnect();
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchOutputs();
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 5000);
    return () => clearInterval(interval);
  }, [fetchOutputs, fetchAlerts]);

  // Start output
  const handleStart = async (id) => {
    try {
      await fetch(`${API}/api/streaming/${id}/start`, { method: 'POST' });
      fetchOutputs();
    } catch (err) {
      console.error('Failed to start output:', err);
    }
  };

  // Stop output
  const handleStop = async (id) => {
    try {
      await fetch(`${API}/api/streaming/${id}/stop`, { method: 'POST' });
      fetchOutputs();
    } catch (err) {
      console.error('Failed to stop output:', err);
    }
  };

  // Remove output
  const handleRemove = async (id) => {
    if (!confirm('Remove this output?')) return;
    try {
      await fetch(`${API}/api/streaming/${id}`, { method: 'DELETE' });
      fetchOutputs();
    } catch (err) {
      console.error('Failed to remove output:', err);
    }
  };

  // Add output
  const handleAdd = async (type, config) => {
    try {
      await fetch(`${API}/api/streaming`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, config })
      });
      fetchOutputs();
      setShowAddModal(false);
    } catch (err) {
      console.error('Failed to add output:', err);
    }
  };

  const getStatusColor = (state) => {
    switch (state) {
      case 'active': return 'var(--green)';
      case 'connecting':
      case 'reconnecting': return 'var(--orange)';
      case 'error': return 'var(--red)';
      default: return 'var(--text-500)';
    }
  };

  return (
    <div className="page container streaming-dashboard" style={{ paddingTop: 20, paddingBottom: 40, maxWidth: 1200, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <Link to="/" style={{ fontSize: '0.85rem', color: 'var(--text-500)', display: 'block', marginBottom: 8 }}>← Home</Link>
          <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-100)' }}>
            Streaming Outputs
          </h1>
          <p style={{ margin: '4px 0 0', color: 'var(--text-400)', fontSize: '0.85rem' }}>
            Manage your broadcast destinations
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span className={`conn-dot ${connected ? 'on' : 'off'}`} />
          <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
            + Add Output
          </button>
        </div>
      </div>

      {/* Alert Banner */}
      {alerts.length > 0 && (
        <div className="alert-banner" style={{
          background: 'rgba(239, 68, 68, 0.15)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: 'var(--radius-md)',
          padding: '12px 16px',
          marginBottom: 16,
          display: 'flex',
          alignItems: 'center',
          gap: 12
        }}>
          <span style={{ color: 'var(--red)', fontWeight: 600 }}>⚠ Alerts:</span>
          {alerts.slice(0, 3).map((alert, i) => (
            <span key={i} style={{ color: 'var(--text-200)', fontSize: '0.85rem' }}>
              {alert.message}{i < Math.min(alerts.length, 3) - 1 ? ' · ' : ''}
            </span>
          ))}
          {alerts.length > 3 && (
            <span style={{ color: 'var(--text-400)', fontSize: '0.8rem' }}>+{alerts.length - 3} more</span>
          )}
        </div>
      )}

      {/* Outputs Grid */}
      {outputs.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 60 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📡</div>
          <h3 style={{ color: 'var(--text-200)', marginBottom: 8 }}>No streaming outputs</h3>
          <p style={{ color: 'var(--text-400)', marginBottom: 20 }}>Add an output to start streaming</p>
          <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
            + Add Your First Output
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
          {outputs.map(output => (
            <div key={output.id} className="stream-card" style={{
              background: 'var(--surface)',
              border: '1px solid var(--glass-border)',
              borderRadius: 'var(--radius-lg)',
              padding: 20,
              position: 'relative'
            }}>
              {/* Status Indicator */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span className="stream-status" style={{
                      width: 10, height: 10, borderRadius: '50%',
                      background: getStatusColor(output.state),
                      boxShadow: output.state === 'active' ? `0 0 8px ${getStatusColor(output.state)}` : 'none'
                    }} />
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-300)' }}>
                      {output.type}
                    </span>
                  </div>
                  <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: 'var(--text-100)' }}>
                    {output.config?.url || output.config?.name || output.id}
                  </h3>
                </div>
                <span style={{
                  fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase',
                  padding: '4px 8px', borderRadius: 'var(--radius-sm)',
                  background: output.state === 'active' ? 'rgba(34, 197, 94, 0.15)' :
                    output.state === 'error' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(249, 115, 22, 0.15)',
                  color: getStatusColor(output.state)
                }}>
                  {output.state}
                </span>
              </div>

              {/* Metrics */}
              {output.state === 'active' && output.metrics && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 16 }}>
                  <div className="health-chart">
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-400)', marginBottom: 4 }}>Bitrate</div>
                    <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-100)' }}>
                      {output.metrics.bitrate?.toFixed(0) || 0} kbps
                    </div>
                  </div>
                  <div className="health-chart">
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-400)', marginBottom: 4 }}>FPS</div>
                    <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-100)' }}>
                      {output.metrics.fps?.toFixed(1) || 0}
                    </div>
                  </div>
                  <div className="health-chart">
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-400)', marginBottom: 4 }}>Dropped</div>
                    <div style={{ fontSize: '1rem', fontWeight: 600, color: output.metrics.droppedFrames > 100 ? 'var(--red)' : 'var(--text-100)' }}>
                      {output.metrics.droppedFrames || 0}
                    </div>
                  </div>
                </div>
              )}

              {/* Viewers (WebRTC only) */}
              {output.type === 'webrtc' && (
                <div style={{ marginBottom: 16, padding: '8px 12px', background: 'var(--bg-700)', borderRadius: 'var(--radius-sm)' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-400)' }}>Viewers: </span>
                  <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--cyan)' }}>
                    {output.viewers || 0} / {output.config?.maxViewers || 100}
                  </span>
                </div>
              )}

              {/* Actions */}
              <div style={{ display: 'flex', gap: 8 }}>
                {output.state === 'active' ? (
                  <button className="btn btn-sm btn-danger" style={{ flex: 1 }} onClick={() => handleStop(output.id)}>
                    Stop
                  </button>
                ) : (
                  <button className="btn btn-sm btn-primary" style={{ flex: 1 }} onClick={() => handleStart(output.id)}>
                    Start
                  </button>
                )}
                <button className="btn btn-sm btn-secondary" style={{ flex: 1 }} onClick={() => setSelectedOutput(output)}>
                  Details
                </button>
                <button className="btn btn-sm btn-secondary" onClick={() => handleRemove(output.id)}>
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Output Modal */}
      {showAddModal && (
        <AddOutputModal onAdd={handleAdd} onClose={() => setShowAddModal(false)} />
      )}

      {/* Output Details Modal */}
      {selectedOutput && (
        <OutputDetailsModal output={selectedOutput} onClose={() => setSelectedOutput(null)} />
      )}
    </div>
  );
}

// Add Output Modal
function AddOutputModal({ onAdd, onClose }) {
  const [type, setType] = useState('rtmp');
  const [config, setConfig] = useState({
    url: '',
    streamKey: '',
    videoBitrate: '4500k',
    audioBitrate: '128k',
    resolution: '1920x1080',
    framerate: 30,
    name: '',
    group: 'SPORTSCASTER',
    maxViewers: 100
  });

  const set = (key, val) => setConfig(c => ({ ...c, [key]: val }));

  const handleSubmit = () => {
    const outputConfig = type === 'rtmp'
      ? { url: config.url, streamKey: config.streamKey, videoBitrate: config.videoBitrate, audioBitrate: config.audioBitrate, resolution: config.resolution, framerate: config.framerate }
      : type === 'webrtc'
        ? { name: config.name, maxViewers: config.maxViewers, videoBitrate: 2500, audioBitrate: 128 }
        : { name: config.name, group: config.group, enabled: true };
    onAdd(type, outputConfig);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()} style={{ maxWidth: 480 }}>
        <h2 style={{ margin: '0 0 20px' }}>Add Streaming Output</h2>

        <div className="field">
          <label className="label">Output Type</label>
          <div style={{ display: 'flex', gap: 8 }}>
            {['rtmp', 'webrtc', 'ndi'].map(t => (
              <button key={t} type="button"
                className={`btn btn-sm ${type === t ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setType(t)}
                style={{ flex: 1, textTransform: 'uppercase' }}>
                {t}
              </button>
            ))}
          </div>
        </div>

        {type === 'rtmp' && (
          <>
            <div className="field">
              <label className="label">RTMP URL</label>
              <input className="input" placeholder="rtmp://live.youtube.com/live2" value={config.url} onChange={e => set('url', e.target.value)} />
            </div>
            <div className="field">
              <label className="label">Stream Key</label>
              <input className="input" placeholder="xxxx-xxxx-xxxx-xxxx" value={config.streamKey} onChange={e => set('streamKey', e.target.value)} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="field">
                <label className="label">Video Bitrate</label>
                <input className="input" value={config.videoBitrate} onChange={e => set('videoBitrate', e.target.value)} />
              </div>
              <div className="field">
                <label className="label">Audio Bitrate</label>
                <input className="input" value={config.audioBitrate} onChange={e => set('audioBitrate', e.target.value)} />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="field">
                <label className="label">Resolution</label>
                <select className="input" value={config.resolution} onChange={e => set('resolution', e.target.value)}>
                  <option value="1920x1080">1080p</option>
                  <option value="1280x720">720p</option>
                  <option value="854x480">480p</option>
                </select>
              </div>
              <div className="field">
                <label className="label">Framerate</label>
                <select className="input" value={config.framerate} onChange={e => set('framerate', parseInt(e.target.value))}>
                  <option value={30}>30 fps</option>
                  <option value={60}>60 fps</option>
                  <option value={24}>24 fps</option>
                </select>
              </div>
            </div>
          </>
        )}

        {type === 'webrtc' && (
          <>
            <div className="field">
              <label className="label">Stream Name</label>
              <input className="input" placeholder="My Live Stream" value={config.name} onChange={e => set('name', e.target.value)} />
            </div>
            <div className="field">
              <label className="label">Max Viewers</label>
              <input className="input" type="number" min="1" max="100" value={config.maxViewers} onChange={e => set('maxViewers', parseInt(e.target.value))} />
            </div>
          </>
        )}

        {type === 'ndi' && (
          <>
            <div className="field">
              <label className="label">NDI Source Name</label>
              <input className="input" placeholder="SportsCaster NDI" value={config.name} onChange={e => set('name', e.target.value)} />
            </div>
            <div className="field">
              <label className="label">NDI Group</label>
              <input className="input" placeholder="SPORTSCASTER" value={config.group} onChange={e => set('group', e.target.value)} />
            </div>
          </>
        )}

        <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
          <button className="btn btn-secondary" style={{ flex: 1 }} onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleSubmit}>Add Output</button>
        </div>
      </div>
    </div>
  );
}

// Output Details Modal
function OutputDetailsModal({ output, onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()} style={{ maxWidth: 560 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ margin: 0 }}>Output Details</h2>
          <span style={{
            fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase',
            padding: '4px 8px', borderRadius: 'var(--radius-sm)',
            background: output.state === 'active' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(100, 116, 139, 0.15)',
            color: output.state === 'active' ? 'var(--green)' : 'var(--text-400)'
          }}>
            {output.state}
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-400)', marginBottom: 4 }}>Type</div>
            <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-100)', textTransform: 'uppercase' }}>
              {output.type}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-400)', marginBottom: 4 }}>ID</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-200)', fontFamily: 'monospace' }}>
              {output.id}
            </div>
          </div>
        </div>

        <StreamingHealth output={output} expanded />

        <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
          <button className="btn btn-secondary" style={{ flex: 1 }} onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
