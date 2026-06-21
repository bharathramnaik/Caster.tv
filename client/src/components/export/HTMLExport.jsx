import { useState, useCallback } from 'react';

const HTML_FORMATS = [
  {
    id: 'static',
    name: 'Static HTML',
    description: 'Self-contained HTML file with all assets embedded',
    icon: '\u{1F4C4}',
    options: { background: 'transparent' },
  },
  {
    id: 'obs',
    name: 'OBS Browser Source',
    description: 'Optimized for OBS with transparent background',
    icon: '\u{1F4FA}',
    options: { background: 'transparent' },
  },
  {
    id: 'vmix',
    name: 'vMix HTML Input',
    description: 'Compatible with vMix URL parameters',
    icon: '\u{1F3AC}',
    options: { background: 'transparent' },
  },
  {
    id: 'wirecast',
    name: 'Wirecast Layer',
    description: 'HTML title source for Wirecast',
    icon: '\u{1F3A5}',
    options: { background: 'transparent' },
  },
  {
    id: 'embed',
    name: 'Custom Embed Code',
    description: 'Iframe embed code for websites',
    icon: '\u{1F517}',
    options: { background: 'transparent' },
  },
  {
    id: 'zip',
    name: 'Download as ZIP',
    description: 'Complete package with all assets',
    icon: '\u{1F4E6}',
    options: { background: 'transparent' },
  },
];

export default function HTMLExport({ scene, template, resolution, onExport }) {
  const [selectedFormat, setSelectedFormat] = useState(HTML_FORMATS[0]);
  const [background, setBackground] = useState('transparent');
  const [customTitle, setCustomTitle] = useState('');
  const [embedCode, setEmbedCode] = useState('');
  const [generating, setGenerating] = useState(false);

  const handleExport = useCallback(async (format) => {
    setGenerating(true);
    try {
      onExport({
        format: `html-${format.id}`,
        label: format.name,
        options: {
          htmlFormat: format.id,
          background,
          title: customTitle || (scene || template)?.name || 'Export',
          width: resolution.width,
          height: resolution.height,
        },
      });

      if (format.id === 'embed') {
        const source = scene || template;
        const url = `${window.location.origin}/preview/${source?.id || 'custom'}`;
        const code = `<iframe src="${url}" width="${resolution.width}" height="${resolution.height}" frameborder="0" allowfullscreen></iframe>`;
        setEmbedCode(code);
      }
    } finally {
      setGenerating(false);
    }
  }, [scene, template, resolution, background, customTitle, onExport]);

  return (
    <div className="html-export">
      <div className="export-section">
        <label className="label">HTML Format</label>
        <div className="html-format-grid">
          {HTML_FORMATS.map(fmt => (
            <button
              key={fmt.id}
              className={`html-format-card ${selectedFormat.id === fmt.id ? 'active' : ''}`}
              onClick={() => setSelectedFormat(fmt)}
            >
              <span className="html-format-icon">{fmt.icon}</span>
              <span className="html-format-name">{fmt.name}</span>
              <span className="html-format-desc">{fmt.description}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="export-section">
        <label className="label">Options</label>
        <div className="export-option-row">
          <div className="field" style={{ flex: 1 }}>
            <label className="label">Background</label>
            <select
              className="input"
              value={background}
              onChange={e => setBackground(e.target.value)}
            >
              <option value="transparent">Transparent</option>
              <option value="#000000">Black</option>
              <option value="#ffffff">White</option>
              <option value="custom">Custom Color</option>
            </select>
          </div>
          <div className="field" style={{ flex: 1 }}>
            <label className="label">Title</label>
            <input
              className="input"
              placeholder="Export title..."
              value={customTitle}
              onChange={e => setCustomTitle(e.target.value)}
            />
          </div>
        </div>
      </div>

      {selectedFormat.id === 'embed' && embedCode && (
        <div className="export-section">
          <label className="label">Embed Code</label>
          <textarea
            className="input export-code-block"
            readOnly
            value={embedCode}
            rows={3}
            onClick={e => e.target.select()}
          />
          <button
            className="btn btn-sm btn-secondary"
            style={{ marginTop: 8 }}
            onClick={() => navigator.clipboard?.writeText(embedCode)}
          >
            Copy to Clipboard
          </button>
        </div>
      )}

      <div className="export-actions">
        <button
          className="btn btn-primary"
          onClick={() => handleExport(selectedFormat)}
          disabled={generating}
        >
          {generating ? 'Generating...' : `Export ${selectedFormat.name}`}
        </button>
      </div>
    </div>
  );
}
