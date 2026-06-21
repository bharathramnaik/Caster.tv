import { useState, useCallback, useRef } from 'react';

const API = import.meta.env.VITE_API_URL || '';

export default function TemplateImportExport({ onImport, onClose }) {
  const [activeTab, setActiveTab] = useState('import-file');
  const [importUrl, setImportUrl] = useState('');
  const [importJson, setImportJson] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const clearMessages = useCallback(() => {
    setError('');
    setSuccess('');
  }, []);

  const handleFileImport = useCallback(async (file) => {
    clearMessages();
    setLoading(true);

    try {
      const text = await file.text();
      const data = JSON.parse(text);
      const templates = Array.isArray(data) ? data : [data];

      for (const t of templates) {
        const enriched = {
          ...t,
          id: t.id || `imported_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
          importedAt: new Date().toISOString(),
          version: t.version || '1.0'
        };
        onImport?.(enriched);
      }

      setSuccess(`Imported ${templates.length} template(s) successfully`);
    } catch (err) {
      setError('Invalid JSON file. Please check the format.');
    } finally {
      setLoading(false);
    }
  }, [onImport, clearMessages]);

  const handleFileDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.name.endsWith('.json')) {
      handleFileImport(file);
    } else {
      setError('Please drop a .json file');
    }
  }, [handleFileImport]);

  const handleFileSelect = useCallback((e) => {
    const file = e.target.files?.[0];
    if (file) handleFileImport(file);
  }, [handleFileImport]);

  const handleUrlImport = useCallback(async () => {
    clearMessages();
    if (!importUrl.trim()) {
      setError('Please enter a URL');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(importUrl);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      const templates = Array.isArray(data) ? data : [data];

      for (const t of templates) {
        const enriched = {
          ...t,
          id: t.id || `imported_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
          importedAt: new Date().toISOString()
        };
        onImport?.(enriched);
      }

      setSuccess(`Imported ${templates.length} template(s) from URL`);
      setImportUrl('');
    } catch {
      setError('Failed to import from URL. Check the URL and try again.');
    } finally {
      setLoading(false);
    }
  }, [importUrl, onImport, clearMessages]);

  const handleJsonImport = useCallback(() => {
    clearMessages();
    if (!importJson.trim()) {
      setError('Please paste JSON data');
      return;
    }

    try {
      const data = JSON.parse(importJson);
      const templates = Array.isArray(data) ? data : [data];

      for (const t of templates) {
        const enriched = {
          ...t,
          id: t.id || `imported_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
          importedAt: new Date().toISOString()
        };
        onImport?.(enriched);
      }

      setSuccess(`Imported ${templates.length} template(s) from JSON`);
      setImportJson('');
    } catch {
      setError('Invalid JSON. Please check the format.');
    }
  }, [importJson, onImport, clearMessages]);

  return (
    <div className="tpl-ie-overlay" onClick={onClose}>
      <div className="tpl-ie-modal" onClick={(e) => e.stopPropagation()}>
        <div className="tpl-ie-header">
          <h3>Import / Export Templates</h3>
          <button className="btn btn-sm btn-secondary" onClick={onClose}>✕</button>
        </div>

        <div className="tpl-ie-tabs">
          <button
            className={`tpl-ie-tab ${activeTab === 'import-file' ? 'active' : ''}`}
            onClick={() => { setActiveTab('import-file'); clearMessages(); }}
          >
            📁 Import File
          </button>
          <button
            className={`tpl-ie-tab ${activeTab === 'import-url' ? 'active' : ''}`}
            onClick={() => { setActiveTab('import-url'); clearMessages(); }}
          >
            🔗 Import URL
          </button>
          <button
            className={`tpl-ie-tab ${activeTab === 'import-json' ? 'active' : ''}`}
            onClick={() => { setActiveTab('import-json'); clearMessages(); }}
          >
            { } Import JSON
          </button>
        </div>

        <div className="tpl-ie-body">
          {error && <div className="tpl-ie-error">{error}</div>}
          {success && <div className="tpl-ie-success">{success}</div>}

          {activeTab === 'import-file' && (
            <div
              className={`tpl-ie-dropzone ${dragOver ? 'drag-over' : ''}`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleFileDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />
              <div className="tpl-ie-dropzone-content">
                <span className="tpl-ie-dropzone-icon">📄</span>
                <p className="tpl-ie-dropzone-title">
                  {dragOver ? 'Drop file here' : 'Drag & drop a JSON file'}
                </p>
                <p className="tpl-ie-dropzone-hint">or click to browse</p>
              </div>
            </div>
          )}

          {activeTab === 'import-url' && (
            <div className="tpl-ie-form">
              <label className="label">Template URL</label>
              <div className="tpl-ie-url-row">
                <input
                  type="url"
                  className="input"
                  placeholder="https://example.com/template.json"
                  value={importUrl}
                  onChange={(e) => setImportUrl(e.target.value)}
                />
                <button
                  className="btn btn-sm btn-primary"
                  onClick={handleUrlImport}
                  disabled={loading}
                >
                  {loading ? '...' : 'Import'}
                </button>
              </div>
              <p className="tpl-ie-hint">Enter a URL pointing to a JSON template file</p>
            </div>
          )}

          {activeTab === 'import-json' && (
            <div className="tpl-ie-form">
              <label className="label">JSON Data</label>
              <textarea
                className="input"
                rows={10}
                placeholder='{"name": "My Template", "category": "scoreboard", ...}'
                value={importJson}
                onChange={(e) => setImportJson(e.target.value)}
                style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', resize: 'vertical' }}
              />
              <button
                className="btn btn-sm btn-primary"
                onClick={handleJsonImport}
                disabled={loading}
                style={{ marginTop: 12 }}
              >
                {loading ? 'Importing...' : 'Import from JSON'}
              </button>
            </div>
          )}

          {loading && (
            <div className="tpl-ie-loading">
              <div className="tpl-ie-spinner" />
              <span>Processing...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
