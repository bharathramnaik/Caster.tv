import { useState, useCallback, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';

const API = import.meta.env.VITE_API_URL || '';

const SAMPLE_DATA = {
  team1: { name: 'India', short: 'IND', score: '186/4', overs: '15.2' },
  team2: { name: 'Australia', short: 'AUS', score: '', overs: '' },
  batter1: { name: 'V. Kohli', runs: 45, balls: 32, fours: 4, sixes: 2 },
  batter2: { name: 'R. Sharma', runs: 28, balls: 20, fours: 3, sixes: 1 },
  bowler: { name: 'P. Cummins', wickets: 2, runs: 34, overs: 3.2 },
  match: { event: 'IPL 2025', venue: 'Wankhede Stadium', toss: 'India won toss, elected to bat' },
  extras: { wides: 4, noballs: 1, byes: 2, legbyes: 3 }
};

export default function TemplatePreview({ template, onClose, onEdit, onDuplicate }) {
  const [data, setData] = useState(SAMPLE_DATA);
  const [editMode, setEditMode] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [background, setBackground] = useState('dark');
  const [activeTab, setActiveTab] = useState('preview');
  const [exportFormat, setExportFormat] = useState('json');
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  const previewRef = useRef(null);

  const handleDataChange = useCallback((path, value) => {
    setData(prev => {
      const updated = { ...prev };
      const parts = path.split('.');
      let current = updated;
      for (let i = 0; i < parts.length - 1; i++) {
        if (!current[parts[i]]) current[parts[i]] = {};
        current = current[parts[i]];
      }
      current[parts[parts.length - 1]] = value;
      return updated;
    });
  }, []);

  const replayAnimations = useCallback(() => {
    setPlaying(true);
    setTimeout(() => setPlaying(false), 100);
  }, []);

  const handleExport = useCallback((format) => {
    if (!template) return;

    let content, filename, type;

    switch (format) {
      case 'json':
        content = JSON.stringify(template, null, 2);
        filename = `${template.name || 'template'}.json`;
        type = 'application/json';
        break;
      case 'html':
        content = generateHtmlExport(template);
        filename = `${template.name || 'template'}.html`;
        type = 'text/html';
        break;
      case 'obs':
        content = generateObsExport(template);
        filename = `${template.name || 'template'}-obs.html`;
        type = 'text/html';
        break;
      case 'vmix':
        content = generateVmixExport(template);
        filename = `${template.name || 'template'}-vmix.xml`;
        type = 'text/xml';
        break;
      default:
        return;
    }

    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
  }, [template]);

  const copyShareLink = useCallback(() => {
    const link = `${window.location.origin}/editor/${template?.id}`;
    navigator.clipboard.writeText(link).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [template]);

  const copyEmbedCode = useCallback(() => {
    const code = `<iframe src="${window.location.origin}/overlay/${template?.id}" width="1920" height="1080" frameborder="0" allowfullscreen></iframe>`;
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [template]);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  if (!template) return null;

  const bgStyles = {
    dark: { background: '#0a0a14' },
    light: { background: '#f0f0f0' },
    transparent: { background: 'repeating-conic-gradient(#2a2a2a 0% 25%, #1a1a1a 0% 50%) 50% / 20px 20px' }
  };

  return (
    <div className="tpl-modal-overlay" onClick={onClose}>
      <div className="tpl-modal" onClick={(e) => e.stopPropagation()}>
        <div className="tpl-modal-header">
          <h3>{template.name}</h3>
          <div className="tpl-modal-actions">
            <Link to={`/editor/${template.id}`} className="btn btn-sm btn-primary">
              ✏️ Edit
            </Link>
            <button className="btn btn-sm btn-secondary" onClick={() => onDuplicate?.(template)}>
              📋 Duplicate
            </button>
            <button className="btn btn-sm btn-secondary" onClick={onClose}>✕</button>
          </div>
        </div>

        <div className="tpl-modal-tabs">
          <button
            className={`tpl-tab ${activeTab === 'preview' ? 'active' : ''}`}
            onClick={() => setActiveTab('preview')}
          >
            Preview
          </button>
          <button
            className={`tpl-tab ${activeTab === 'data' ? 'active' : ''}`}
            onClick={() => setActiveTab('data')}
          >
            Data
          </button>
          <button
            className={`tpl-tab ${activeTab === 'export' ? 'active' : ''}`}
            onClick={() => setActiveTab('export')}
          >
            Export
          </button>
          <button
            className={`tpl-tab ${activeTab === 'share' ? 'active' : ''}`}
            onClick={() => setActiveTab('share')}
          >
            Share
          </button>
          <button
            className={`tpl-tab ${activeTab === 'info' ? 'active' : ''}`}
            onClick={() => setActiveTab('info')}
          >
            Info
          </button>
        </div>

        <div className="tpl-modal-body">
          {activeTab === 'preview' && (
            <div className="tpl-preview-section">
              <div className="tpl-preview-controls">
                <select
                  className="select"
                  value={background}
                  onChange={(e) => setBackground(e.target.value)}
                  style={{ width: 120 }}
                >
                  <option value="dark">Dark</option>
                  <option value="light">Light</option>
                  <option value="transparent">Transparent</option>
                </select>
                <button className="btn btn-sm btn-secondary" onClick={replayAnimations}>
                  ▶ Replay
                </button>
              </div>
              <div className="tpl-preview-canvas" style={{ ...bgStyles[background], aspectRatio: `${template.canvas?.width || 1920} / ${template.canvas?.height || 1080}` }} ref={previewRef}>
                {template.elements?.length > 0 ? (
                  template.elements.map((el) => {
                    const s = el.style || {};
                    const cw = template.canvas?.width || 1920;
                    const ch = template.canvas?.height || 1080;
                    return (
                      <div
                        key={el.id}
                        className={playing ? 'tpl-element-animate' : ''}
                        style={{
                          position: 'absolute',
                          left: `${(el.position?.x || 0) / cw * 100}%`,
                          top: `${(el.position?.y || 0) / ch * 100}%`,
                          width: `${(el.position?.width || 200) / cw * 100}%`,
                          height: `${(el.position?.height || 60) / ch * 100}%`,
                          backgroundColor: s.backgroundColor || 'transparent',
                          color: s.color || '#fff',
                          fontFamily: s.fontFamily || 'Outfit',
                          fontSize: `${(s.fontSize || 24) / ch * 100}%`,
                          fontWeight: s.fontWeight || '400',
                          borderRadius: `${(s.borderRadius || 0) / cw * 100}%`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          textAlign: s.textAlign || 'center',
                          border: s.border || 'none'
                        }}
                      >
                        {el.content || el.type}
                      </div>
                    );
                  })
                ) : (
                  <div className="tpl-preview-placeholder">
                    <span style={{ fontSize: 48 }}>📄</span>
                    <p>No elements to preview</p>
                  </div>
                )}
              </div>
              <div className="tpl-preview-info">
                <span>{template.canvas?.width || 1920} x {template.canvas?.height || 1080}</span>
                <span>{template.elements?.length || 0} elements</span>
                <span>{template.category}</span>
                <span>{template.sport || 'generic'}</span>
              </div>
            </div>
          )}

          {activeTab === 'data' && (
            <div className="tpl-data-section">
              <div className="tpl-data-header">
                <h4>Data Editor</h4>
                <button className="btn btn-sm btn-primary" onClick={replayAnimations}>
                  Apply & Preview
                </button>
              </div>
              <div className="tpl-data-grid">
                {Object.entries(data).map(([key, value]) => (
                  <div key={key} className="tpl-data-group">
                    <label className="tpl-data-label">{key}</label>
                    {typeof value === 'object' && value !== null ? (
                      <div className="tpl-data-nested">
                        {Object.entries(value).map(([subKey, subVal]) => (
                          <div key={subKey} className="tpl-data-field">
                            <label>{subKey}</label>
                            <input
                              type={typeof subVal === 'number' ? 'number' : 'text'}
                              value={subVal ?? ''}
                              onChange={(e) => {
                                const val = e.target.type === 'number' ? Number(e.target.value) : e.target.value;
                                handleDataChange(`${key}.${subKey}`, val);
                              }}
                              className="input"
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <input
                        type={typeof value === 'number' ? 'number' : 'text'}
                        value={value ?? ''}
                        onChange={(e) => {
                          const val = e.target.type === 'number' ? Number(e.target.value) : e.target.value;
                          handleDataChange(key, val);
                        }}
                        className="input"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'export' && (
            <div className="tpl-export-section">
              <h4>Export Options</h4>
              <div className="tpl-export-grid">
                <button className="tpl-export-card" onClick={() => handleExport('json')}>
                  <span className="tpl-export-icon">{ }</span>
                  <span className="tpl-export-label">JSON</span>
                  <span className="tpl-export-desc">Raw template data</span>
                </button>
                <button className="tpl-export-card" onClick={() => handleExport('html')}>
                  <span className="tpl-export-icon">&lt;/&gt;</span>
                  <span className="tpl-export-label">HTML</span>
                  <span className="tpl-export-desc">Self-contained page</span>
                </button>
                <button className="tpl-export-card" onClick={() => handleExport('obs')}>
                  <span className="tpl-export-icon">📺</span>
                  <span className="tpl-export-label">OBS</span>
                  <span className="tpl-export-desc">Browser source</span>
                </button>
                <button className="tpl-export-card" onClick={() => handleExport('vmix')}>
                  <span className="tpl-export-icon">🎬</span>
                  <span className="tpl-export-label">vMix</span>
                  <span className="tpl-export-desc">XML input</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'share' && (
            <div className="tpl-share-section">
              <h4>Share Template</h4>
              <div className="tpl-share-options">
                <div className="tpl-share-item">
                  <label>Share Link</label>
                  <div className="tpl-share-row">
                    <input
                      type="text"
                      readOnly
                      value={`${window.location.origin}/editor/${template.id}`}
                      className="input"
                    />
                    <button className="btn btn-sm btn-primary" onClick={copyShareLink}>
                      {copied ? '✓' : '📋'}
                    </button>
                  </div>
                </div>
                <div className="tpl-share-item">
                  <label>Embed Code</label>
                  <div className="tpl-share-row">
                    <textarea
                      readOnly
                      value={`<iframe src="${window.location.origin}/overlay/${template.id}" width="1920" height="1080" frameborder="0"></iframe>`}
                      className="input"
                      rows={2}
                      style={{ resize: 'none' }}
                    />
                    <button className="btn btn-sm btn-primary" onClick={copyEmbedCode}>
                      {copied ? '✓' : '📋'}
                    </button>
                  </div>
                </div>
                <div className="tpl-share-item">
                  <label>QR Code</label>
                  <div className="tpl-qr-code">
                    <QRCodeSVG
                      value={`${window.location.origin}/editor/${template.id}`}
                      size={150}
                      bgColor="transparent"
                      fgColor="#ffffff"
                      level="M"
                      includeMargin={false}
                    />
                    <span className="tpl-qr-hint">Scan to open template</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'info' && (
            <div className="tpl-info-section">
              <div className="tpl-info-grid">
                <div className="tpl-info-item">
                  <span className="tpl-info-label">Name</span>
                  <span className="tpl-info-value">{template.name}</span>
                </div>
                <div className="tpl-info-item">
                  <span className="tpl-info-label">Category</span>
                  <span className="tpl-info-value">{template.category}</span>
                </div>
                <div className="tpl-info-item">
                  <span className="tpl-info-label">Sport</span>
                  <span className="tpl-info-value">{template.sport || 'generic'}</span>
                </div>
                <div className="tpl-info-item">
                  <span className="tpl-info-label">Canvas Size</span>
                  <span className="tpl-info-value">{template.canvas?.width || 1920} x {template.canvas?.height || 1080}</span>
                </div>
                <div className="tpl-info-item">
                  <span className="tpl-info-label">Elements</span>
                  <span className="tpl-info-value">{template.elements?.length || 0}</span>
                </div>
                <div className="tpl-info-item">
                  <span className="tpl-info-label">Version</span>
                  <span className="tpl-info-value">{template.version || '1.0'}</span>
                </div>
                {template.createdAt && (
                  <div className="tpl-info-item">
                    <span className="tpl-info-label">Created</span>
                    <span className="tpl-info-value">{new Date(template.createdAt).toLocaleDateString()}</span>
                  </div>
                )}
                {template.updatedAt && (
                  <div className="tpl-info-item">
                    <span className="tpl-info-label">Updated</span>
                    <span className="tpl-info-value">{new Date(template.updatedAt).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function generateHtmlExport(template) {
  const elements = (template.elements || []).map(el => {
    const s = el.style || {};
    return `    <div style="position:absolute;left:${el.position?.x || 0}px;top:${el.position?.y || 0}px;width:${el.position?.width || 200}px;height:${el.position?.height || 60}px;background-color:${s.backgroundColor || 'transparent'};color:${s.color || '#fff'};font-family:${s.fontFamily || 'Outfit'};font-size:${s.fontSize || 24}px;font-weight:${s.fontWeight || '400'};border-radius:${s.borderRadius || 0}px;display:flex;align-items:center;justify-content:center;text-align:${s.textAlign || 'center'}">${el.content || el.type}</div>`;
  }).join('\n');

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${template.name || 'Template'}</title>
  <style>
    body { margin: 0; padding: 0; background: #000; }
    .canvas { position: relative; width: ${template.canvas?.width || 1920}px; height: ${template.canvas?.height || 1080}px; overflow: hidden; }
  </style>
</head>
<body>
  <div class="canvas">
${elements}
  </div>
</body>
</html>`;
}

function generateObsExport(template) {
  const html = generateHtmlExport(template);
  return html.replace('</body>', `  <script>
    // OBS Browser Source - Auto-refresh support
    window.obsStudioPlugin = window.obsStudioPlugin || {};
    window.addEventListener('message', function(event) {
      if (event.data && event.data.action === 'refresh') {
        location.reload();
      }
    });
  </script>\n</body>`);
}

function generateVmixExport(template) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<vMix>
  <input type="GT" title="${template.name || 'Template'}">
    <title>${template.name || 'Template'}</title>
    <template>${template.id || ''}</template>
    <data>${btoa(JSON.stringify(template))}</data>
  </input>
</vMix>`;
}
