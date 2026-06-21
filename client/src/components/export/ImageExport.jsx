import { useState, useCallback } from 'react';

const IMAGE_FORMATS = [
  { id: 'png', name: 'PNG', description: 'Lossless with transparency', icon: '\u{1F4D7}' },
  { id: 'jpeg', name: 'JPEG', description: 'Compressed, smaller file size', icon: '\u{1F5BC}' },
  { id: 'webp', name: 'WebP', description: 'Modern format, best compression', icon: '\u{1F310}' },
  { id: 'svg', name: 'SVG', description: 'Vector format, infinitely scalable', icon: '\u{2630}' },
];

export default function ImageExport({ scene, template, resolution, quality, onExport }) {
  const [format, setFormat] = useState(IMAGE_FORMATS[0]);
  const [jpegQuality, setJpegQuality] = useState(quality);
  const [customWidth, setCustomWidth] = useState(resolution.width);
  const [customHeight, setCustomHeight] = useState(resolution.height);
  const [useCustomRes, setUseCustomRes] = useState(false);
  const [batchMode, setBatchMode] = useState(false);
  const [generating, setGenerating] = useState(false);

  const effectiveWidth = useCustomRes ? customWidth : resolution.width;
  const effectiveHeight = useCustomRes ? customHeight : resolution.height;

  const handleExport = useCallback(async () => {
    setGenerating(true);
    try {
      onExport({
        format: `image-${format.id}`,
        label: `${format.name} Export`,
        options: {
          imageFormat: format.id,
          quality: format.id === 'jpeg' ? jpegQuality : undefined,
          width: effectiveWidth,
          height: effectiveHeight,
          transparent: format.id === 'png',
          batch: batchMode,
        },
      });
    } finally {
      setGenerating(false);
    }
  }, [format, jpegQuality, effectiveWidth, effectiveHeight, batchMode, onExport]);

  return (
    <div className="image-export">
      <div className="export-section">
        <label className="label">Image Format</label>
        <div className="image-format-grid">
          {IMAGE_FORMATS.map(fmt => (
            <button
              key={fmt.id}
              className={`image-format-card ${format.id === fmt.id ? 'active' : ''}`}
              onClick={() => setFormat(fmt)}
            >
              <span className="image-format-icon">{fmt.icon}</span>
              <span className="image-format-name">{fmt.name}</span>
              <span className="image-format-desc">{fmt.description}</span>
            </button>
          ))}
        </div>
      </div>

      {format.id === 'jpeg' && (
        <div className="export-section">
          <label className="label">JPEG Quality ({jpegQuality}%)</label>
          <input
            type="range"
            min={10}
            max={100}
            value={jpegQuality}
            onChange={e => setJpegQuality(parseInt(e.target.value))}
            className="export-quality-slider"
          />
          <div className="export-quality-labels">
            <span>Smaller file</span>
            <span>Higher quality</span>
          </div>
        </div>
      )}

      <div className="export-section">
        <label className="label">Resolution</label>
        <div className="export-option-row">
          <label className="export-checkbox-label">
            <input
              type="checkbox"
              checked={useCustomRes}
              onChange={e => setCustomWidth(resolution.width) || setCustomHeight(resolution.height) || setUseCustomRes(e.target.checked)}
            />
            Custom resolution
          </label>
        </div>
        {useCustomRes ? (
          <div className="export-option-row">
            <div className="field">
              <label className="label">Width</label>
              <input
                type="number"
                className="input"
                value={customWidth}
                min={1}
                max={7680}
                onChange={e => setCustomWidth(parseInt(e.target.value) || 1920)}
              />
            </div>
            <span className="export-x-separator">\u00D7</span>
            <div className="field">
              <label className="label">Height</label>
              <input
                type="number"
                className="input"
                value={customHeight}
                min={1}
                max={4320}
                onChange={e => setCustomHeight(parseInt(e.target.value) || 1080)}
              />
            </div>
          </div>
        ) : (
          <div className="export-resolution-display">
            {resolution.width} \u00D7 {resolution.height} ({resolution.label})
          </div>
        )}
      </div>

      <div className="export-section">
        <label className="label">Options</label>
        <div className="export-option-row">
          <label className="export-checkbox-label">
            <input
              type="checkbox"
              checked={batchMode}
              onChange={e => setBatchMode(e.target.checked)}
            />
            Batch export (all scenes/variants)
          </label>
        </div>
        {format.id === 'png' && (
          <div className="export-info">
            PNG supports transparent backgrounds, ideal for overlays
          </div>
        )}
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
