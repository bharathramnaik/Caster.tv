import { useState, useEffect, useCallback } from 'react';

const API = 'http://localhost:3001/api';

const PRESET_ICONS = {
  ultra: '4K',
  high: 'HD',
  medium: '720',
  low: '480',
  mobile: '360',
};

const PRESET_COLORS = {
  ultra: '#f59e0b',
  high: '#22c55e',
  medium: '#3b82f6',
  low: '#a855f7',
  mobile: '#64748b',
};

export default function QualitySettings() {
  const [presets, setPresets] = useState([]);
  const [currentQuality, setCurrentQuality] = useState(null);
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customForm, setCustomForm] = useState({
    name: '',
    width: 1920,
    height: 1080,
    videoBitrate: 8000,
    audioBitrate: 256,
    framerate: 30,
  });
  const [recommended, setRecommended] = useState(null);

  const fetchPresets = useCallback(async () => {
    try {
      const res = await fetch(`${API}/recording/quality/presets`);
      if (res.ok) setPresets(await res.json());
    } catch { /* ignore */ }
  }, []);

  const fetchCurrent = useCallback(async () => {
    try {
      const res = await fetch(`${API}/recording/quality/current`);
      if (res.ok) setCurrentQuality(await res.json());
    } catch { /* ignore */ }
  }, []);

  const fetchRecommended = useCallback(async () => {
    try {
      const res = await fetch(`${API}/recording/quality/recommended?width=1920&height=1080&framerate=30`);
      if (res.ok) setRecommended(await res.json());
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    fetchPresets();
    fetchCurrent();
    fetchRecommended();
  }, [fetchPresets, fetchCurrent, fetchRecommended]);

  const setQuality = async (presetId) => {
    try {
      await fetch(`${API}/recording/quality`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preset: presetId }),
      });
      fetchCurrent();
    } catch { /* ignore */ }
  };

  const createCustom = async () => {
    try {
      await fetch(`${API}/recording/quality/custom`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: customForm.name,
          resolution: { width: customForm.width, height: customForm.height },
          videoBitrate: customForm.videoBitrate,
          audioBitrate: customForm.audioBitrate,
          framerate: customForm.framerate,
        }),
      });
      setShowCustomForm(false);
      setCustomForm({ name: '', width: 1920, height: 1080, videoBitrate: 8000, audioBitrate: 256, framerate: 30 });
      fetchPresets();
    } catch { /* ignore */ }
  };

  return (
    <div className="quality-settings">
      <div className="quality-settings-header">
        <h3>Quality Settings</h3>
        {currentQuality && (
          <span className="quality-current-label">
            Current: <strong>{currentQuality.name}</strong>
          </span>
        )}
      </div>

      <div className="quality-presets-grid">
        {presets.map((preset) => (
          <div
            key={preset.id}
            className={`quality-card ${currentQuality?.id === preset.id ? 'quality-active' : ''}`}
            onClick={() => setQuality(preset.id)}
          >
            <div className="quality-card-icon" style={{ background: PRESET_COLORS[preset.id] || '#64748b' }}>
              {PRESET_ICONS[preset.id] || preset.name?.substring(0, 2).toUpperCase()}
            </div>
            <div className="quality-card-info">
              <div className="quality-card-name">{preset.name}</div>
              <div className="quality-card-desc">{preset.description}</div>
              <div className="quality-card-specs">
                {preset.resolution?.width}x{preset.resolution?.height}
                {' '}&bull;{' '}
                {preset.videoBitrate}kbps
                {' '}&bull;{' '}
                {preset.framerate}fps
              </div>
            </div>
            {preset.custom && <span className="quality-card-badge">Custom</span>}
          </div>
        ))}
      </div>

      {recommended && (
        <div className="quality-recommended">
          <h4>Recommended for 1080p@30fps</h4>
          <div className="quality-recommended-info">
            <span>Video: {recommended.videoBitrate} kbps</span>
            <span>Audio: {recommended.audioBitrate} kbps</span>
            <span>Preset: {recommended.recommended}</span>
          </div>
        </div>
      )}

      <div className="quality-actions">
        <button className="btn btn-secondary btn-sm" onClick={() => setShowCustomForm(!showCustomForm)}>
          {showCustomForm ? 'Cancel' : 'Create Custom Preset'}
        </button>
      </div>

      {showCustomForm && (
        <div className="quality-custom-form">
          <div className="field">
            <label className="label">Name</label>
            <input
              className="input"
              value={customForm.name}
              onChange={(e) => setCustomForm({ ...customForm, name: e.target.value })}
              placeholder="My Custom Preset"
            />
          </div>
          <div className="quality-form-row">
            <div className="field">
              <label className="label">Width</label>
              <input
                className="input"
                type="number"
                value={customForm.width}
                onChange={(e) => setCustomForm({ ...customForm, width: parseInt(e.target.value) })}
              />
            </div>
            <div className="field">
              <label className="label">Height</label>
              <input
                className="input"
                type="number"
                value={customForm.height}
                onChange={(e) => setCustomForm({ ...customForm, height: parseInt(e.target.value) })}
              />
            </div>
          </div>
          <div className="quality-form-row">
            <div className="field">
              <label className="label">Video Bitrate (kbps)</label>
              <input
                className="input"
                type="number"
                value={customForm.videoBitrate}
                onChange={(e) => setCustomForm({ ...customForm, videoBitrate: parseInt(e.target.value) })}
              />
            </div>
            <div className="field">
              <label className="label">Audio Bitrate (kbps)</label>
              <input
                className="input"
                type="number"
                value={customForm.audioBitrate}
                onChange={(e) => setCustomForm({ ...customForm, audioBitrate: parseInt(e.target.value) })}
              />
            </div>
            <div className="field">
              <label className="label">Framerate</label>
              <select
                className="select"
                value={customForm.framerate}
                onChange={(e) => setCustomForm({ ...customForm, framerate: parseInt(e.target.value) })}
              >
                <option value={24}>24 fps</option>
                <option value={25}>25 fps</option>
                <option value={30}>30 fps</option>
                <option value={60}>60 fps</option>
              </select>
            </div>
          </div>
          <button className="btn btn-primary btn-sm" onClick={createCustom} disabled={!customForm.name}>
            Create Preset
          </button>
        </div>
      )}
    </div>
  );
}
