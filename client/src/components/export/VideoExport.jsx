import { useState, useCallback } from 'react';

const VIDEO_FORMATS = [
  { id: 'mp4', name: 'MP4 (H.264)', description: 'Universal compatibility', icon: '\u{1F3AC}' },
  { id: 'webm', name: 'WebM (VP9)', description: 'Web-optimized, smaller size', icon: '\u{1F310}' },
  { id: 'gif', name: 'GIF (Animated)', description: 'Animated image format', icon: '\u{1F389}' },
  { id: 'frames', name: 'Frame Sequence', description: 'PNG frame sequence', icon: '\u{1F5BC}' },
];

const DURATION_PRESETS = [
  { label: '3s', value: 3 },
  { label: '5s', value: 5 },
  { label: '10s', value: 10 },
  { label: '15s', value: 15 },
  { label: '30s', value: 30 },
  { label: '60s', value: 60 },
];

const FPS_OPTIONS = [24, 25, 30, 60];

export default function VideoExport({ scene, template, resolution, quality, onExport }) {
  const [format, setFormat] = useState(VIDEO_FORMATS[0]);
  const [duration, setDuration] = useState(5);
  const [fps, setFps] = useState(30);
  const [videoQuality, setVideoQuality] = useState(quality);
  const [loop, setLoop] = useState(false);
  const [generating, setGenerating] = useState(false);

  const handleExport = useCallback(async () => {
    setGenerating(true);
    try {
      onExport({
        format: `video-${format.id}`,
        label: `${format.name} Export`,
        options: {
          videoFormat: format.id,
          duration,
          fps,
          quality: videoQuality,
          loop: format.id === 'gif' ? loop : false,
          width: resolution.width,
          height: resolution.height,
        },
      });
    } finally {
      setGenerating(false);
    }
  }, [format, duration, fps, videoQuality, loop, resolution, onExport]);

  const estimatedFrames = Math.ceil(duration * fps);

  return (
    <div className="video-export">
      <div className="export-section">
        <label className="label">Video Format</label>
        <div className="video-format-grid">
          {VIDEO_FORMATS.map(fmt => (
            <button
              key={fmt.id}
              className={`video-format-card ${format.id === fmt.id ? 'active' : ''}`}
              onClick={() => setFormat(fmt)}
            >
              <span className="video-format-icon">{fmt.icon}</span>
              <span className="video-format-name">{fmt.name}</span>
              <span className="video-format-desc">{fmt.description}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="export-section">
        <label className="label">Duration</label>
        <div className="export-duration-row">
          <div className="export-duration-presets">
            {DURATION_PRESETS.map(d => (
              <button
                key={d.value}
                className={`btn btn-sm ${duration === d.value ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setDuration(d.value)}
              >
                {d.label}
              </button>
            ))}
          </div>
          <div className="field" style={{ width: 100 }}>
            <input
              type="number"
              className="input"
              value={duration}
              min={1}
              max={300}
              onChange={e => setDuration(parseInt(e.target.value) || 1)}
            />
          </div>
          <span style={{ color: 'var(--text-400)', fontSize: '0.85rem' }}>seconds</span>
        </div>
      </div>

      <div className="export-section">
        <label className="label">Frame Rate</label>
        <div className="export-fps-options">
          {FPS_OPTIONS.map(f => (
            <button
              key={f}
              className={`btn btn-sm ${fps === f ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setFps(f)}
            >
              {f} fps
            </button>
          ))}
        </div>
        <div className="export-info">
          {estimatedFrames} total frames ({duration}s \u00D7 {fps}fps)
        </div>
      </div>

      <div className="export-section">
        <label className="label">Quality ({videoQuality}%)</label>
        <input
          type="range"
          min={10}
          max={100}
          value={videoQuality}
          onChange={e => setVideoQuality(parseInt(e.target.value))}
          className="export-quality-slider"
        />
        <div className="export-quality-labels">
          <span>Smaller file</span>
          <span>Higher quality</span>
        </div>
      </div>

      {format.id === 'gif' && (
        <div className="export-section">
          <label className="label">GIF Options</label>
          <div className="export-option-row">
            <label className="export-checkbox-label">
              <input
                type="checkbox"
                checked={loop}
                onChange={e => setLoop(e.target.checked)}
              />
              Loop animation
            </label>
          </div>
        </div>
      )}

      {format.id === 'frames' && (
        <div className="export-section">
          <div className="export-info">
            Will export {estimatedFrames} individual PNG frames as a downloadable ZIP archive
          </div>
        </div>
      )}

      <div className="export-section">
        <div className="export-info-grid">
          <div className="export-info-item">
            <span className="export-info-label">Resolution</span>
            <span className="export-info-value">{resolution.width} \u00D7 {resolution.height}</span>
          </div>
          <div className="export-info-item">
            <span className="export-info-label">Format</span>
            <span className="export-info-value">{format.name}</span>
          </div>
          <div className="export-info-item">
            <span className="export-info-label">Duration</span>
            <span className="export-info-value">{duration}s</span>
          </div>
          <div className="export-info-item">
            <span className="export-info-label">Frames</span>
            <span className="export-info-value">{estimatedFrames}</span>
          </div>
        </div>
      </div>

      <div className="export-actions">
        <button
          className="btn btn-primary"
          onClick={handleExport}
          disabled={generating}
        >
          {generating ? 'Generating...' : `Export ${format.name}`}
        </button>
      </div>
    </div>
  );
}
