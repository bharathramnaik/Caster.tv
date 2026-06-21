import { useState, useCallback } from 'react';

const BUILT_IN_PRESETS = [
  {
    id: 'obs-1080p',
    name: 'OBS 1080p',
    description: 'Optimized for OBS Browser Source at 1080p',
    icon: '\u{1F4FA}',
    format: 'html',
    htmlFormat: 'obs',
    resolution: '1080p',
    width: 1920,
    height: 1080,
    quality: 90,
    background: 'transparent',
  },
  {
    id: 'vmix-1080p',
    name: 'vMix 1080p',
    description: 'Compatible with vMix HTML input at 1080p',
    icon: '\u{1F3AC}',
    format: 'html',
    htmlFormat: 'vmix',
    resolution: '1080p',
    width: 1920,
    height: 1080,
    quality: 90,
    background: 'transparent',
  },
  {
    id: 'youtube-1080p',
    name: 'YouTube 1080p',
    description: 'MP4 video optimized for YouTube upload',
    icon: '\u{25B6}',
    format: 'video',
    videoFormat: 'mp4',
    resolution: '1080p',
    width: 1920,
    height: 1080,
    quality: 85,
    fps: 30,
    duration: 10,
  },
  {
    id: 'twitter-720p',
    name: 'Twitter 720p',
    description: 'MP4 video optimized for Twitter at 720p',
    icon: '\u{1F426}',
    format: 'video',
    videoFormat: 'mp4',
    resolution: '720p',
    width: 1280,
    height: 720,
    quality: 75,
    fps: 30,
    duration: 10,
  },
  {
    id: 'instagram-1080x1080',
    name: 'Instagram 1080x1080',
    description: 'Square format for Instagram posts',
    icon: '\u{1F4F7}',
    format: 'image',
    imageFormat: 'png',
    resolution: 'custom',
    width: 1080,
    height: 1080,
    quality: 85,
  },
  {
    id: 'stream-overlay',
    name: 'Stream Overlay',
    description: 'HTML overlay for streaming software',
    icon: '\u{1F3AE}',
    format: 'html',
    htmlFormat: 'obs',
    resolution: '1080p',
    width: 1920,
    height: 1080,
    quality: 80,
    background: 'transparent',
  },
];

export default function ExportPresets({ onApply, onExport }) {
  const [customPresets, setCustomPresets] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('sc-export-presets') || '[]');
    } catch {
      return [];
    }
  });
  const [showCreate, setShowCreate] = useState(false);
  const [newPreset, setNewPreset] = useState({
    name: '',
    description: '',
    format: 'html',
    resolution: '1080p',
    quality: 85,
  });

  const allPresets = [...BUILT_IN_PRESETS, ...customPresets];

  const saveCustomPresets = useCallback((presets) => {
    setCustomPresets(presets);
    localStorage.setItem('sc-export-presets', JSON.stringify(presets));
  }, []);

  const handleCreate = useCallback(() => {
    if (!newPreset.name.trim()) return;

    const preset = {
      id: `custom_${Date.now()}`,
      ...newPreset,
      icon: '\u{2699}',
      width: newPreset.resolution === '720p' ? 1280 : newPreset.resolution === '4K' ? 3840 : 1920,
      height: newPreset.resolution === '720p' ? 720 : newPreset.resolution === '4K' ? 2160 : 1080,
    };

    saveCustomPresets([...customPresets, preset]);
    setNewPreset({ name: '', description: '', format: 'html', resolution: '1080p', quality: 85 });
    setShowCreate(false);
  }, [newPreset, customPresets, saveCustomPresets]);

  const deleteCustomPreset = useCallback((presetId) => {
    saveCustomPresets(customPresets.filter(p => p.id !== presetId));
  }, [customPresets, saveCustomPresets]);

  return (
    <div className="export-presets">
      <div className="export-section">
        <div className="export-section-header">
          <label className="label">Built-in Presets</label>
        </div>
        <div className="export-presets-grid">
          {BUILT_IN_PRESETS.map(preset => (
            <div
              key={preset.id}
              className="export-preset-card"
            >
              <div className="export-preset-icon">{preset.icon}</div>
              <div className="export-preset-info">
                <span className="export-preset-name">{preset.name}</span>
                <span className="export-preset-desc">{preset.description}</span>
                <div className="export-preset-meta">
                  <span>{preset.resolution || `${preset.width}x${preset.height}`}</span>
                  <span>{preset.format.toUpperCase()}</span>
                </div>
              </div>
              <div className="export-preset-actions">
                <button
                  className="btn btn-sm btn-secondary"
                  onClick={() => onApply(preset)}
                >
                  Apply
                </button>
                <button
                  className="btn btn-sm btn-primary"
                  onClick={() => onExport(preset)}
                >
                  Export
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {customPresets.length > 0 && (
        <div className="export-section">
          <div className="export-section-header">
            <label className="label">Custom Presets</label>
          </div>
          <div className="export-presets-grid">
            {customPresets.map(preset => (
              <div key={preset.id} className="export-preset-card custom">
                <div className="export-preset-icon">{preset.icon}</div>
                <div className="export-preset-info">
                  <span className="export-preset-name">{preset.name}</span>
                  <span className="export-preset-desc">{preset.description}</span>
                </div>
                <div className="export-preset-actions">
                  <button
                    className="btn btn-sm btn-secondary"
                    onClick={() => onApply(preset)}
                  >
                    Apply
                  </button>
                  <button
                    className="btn btn-sm btn-primary"
                    onClick={() => onExport(preset)}
                  >
                    Export
                  </button>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => deleteCustomPreset(preset.id)}
                  >
                    \u2715
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="export-section">
        {!showCreate ? (
          <button
            className="btn btn-secondary"
            onClick={() => setShowCreate(true)}
            style={{ width: '100%' }}
          >
            + Create Custom Preset
          </button>
        ) : (
          <div className="export-create-preset">
            <div className="export-section-header">
              <label className="label">New Custom Preset</label>
              <button className="btn btn-sm btn-secondary" onClick={() => setShowCreate(false)}>\u2715</button>
            </div>
            <div className="field">
              <label className="label">Preset Name</label>
              <input
                className="input"
                placeholder="My custom preset..."
                value={newPreset.name}
                onChange={e => setNewPreset(p => ({ ...p, name: e.target.value }))}
              />
            </div>
            <div className="field">
              <label className="label">Description</label>
              <input
                className="input"
                placeholder="Brief description..."
                value={newPreset.description}
                onChange={e => setNewPreset(p => ({ ...p, description: e.target.value }))}
              />
            </div>
            <div className="export-option-row">
              <div className="field" style={{ flex: 1 }}>
                <label className="label">Format</label>
                <select
                  className="input"
                  value={newPreset.format}
                  onChange={e => setNewPreset(p => ({ ...p, format: e.target.value }))}
                >
                  <option value="html">HTML</option>
                  <option value="image">Image</option>
                  <option value="video">Video</option>
                </select>
              </div>
              <div className="field" style={{ flex: 1 }}>
                <label className="label">Resolution</label>
                <select
                  className="input"
                  value={newPreset.resolution}
                  onChange={e => setNewPreset(p => ({ ...p, resolution: e.target.value }))}
                >
                  <option value="720p">720p</option>
                  <option value="1080p">1080p</option>
                  <option value="4K">4K</option>
                </select>
              </div>
            </div>
            <div className="field">
              <label className="label">Quality ({newPreset.quality}%)</label>
              <input
                type="range"
                min={10}
                max={100}
                value={newPreset.quality}
                onChange={e => setNewPreset(p => ({ ...p, quality: parseInt(e.target.value) }))}
                className="export-quality-slider"
              />
            </div>
            <button
              className="btn btn-primary"
              onClick={handleCreate}
              disabled={!newPreset.name.trim()}
              style={{ marginTop: 8 }}
            >
              Create Preset
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
