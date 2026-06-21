import { useState, useCallback, useRef, useEffect } from 'react';
import HTMLExport from './HTMLExport.jsx';
import ImageExport from './ImageExport.jsx';
import VideoExport from './VideoExport.jsx';
import ExportPresets from './ExportPresets.jsx';
import ExportQueue from './ExportQueue.jsx';

const API = import.meta.env.VITE_API_URL || '';

const EXPORT_TABS = [
  { id: 'html', label: 'HTML', icon: '<>' },
  { id: 'image', label: 'Image', icon: '\u{1F5BC}' },
  { id: 'video', label: 'Video', icon: '\u{1F3AC}' },
  { id: 'presets', label: 'Presets', icon: '\u{2699}' },
  { id: 'queue', label: 'Queue', icon: '\u{1F4CB}' },
];

const RESOLUTIONS = [
  { label: '720p', width: 1280, height: 720 },
  { label: '1080p', width: 1920, height: 1080 },
  { label: '4K', width: 3840, height: 2160 },
];

function getAuthHeaders() {
  const token = localStorage.getItem('sc-token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export default function ExportManager({ scene, template, onClose }) {
  const [activeTab, setActiveTab] = useState('html');
  const [resolution, setResolution] = useState(RESOLUTIONS[1]);
  const [quality, setQuality] = useState(80);
  const [queue, setQueue] = useState([]);
  const [processing, setProcessing] = useState(false);

  const addToQueue = useCallback((job) => {
    const entry = {
      id: `exp_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      ...job,
      status: 'pending',
      progress: 0,
      createdAt: new Date().toISOString(),
    };
    setQueue(prev => [...prev, entry]);
    return entry.id;
  }, []);

  const updateJob = useCallback((jobId, patch) => {
    setQueue(prev => prev.map(j => j.id === jobId ? { ...j, ...patch } : j));
  }, []);

  const removeFromQueue = useCallback((jobId) => {
    setQueue(prev => prev.filter(j => j.id !== jobId));
  }, []);

  const cancelJob = useCallback((jobId) => {
    updateJob(jobId, { status: 'cancelled' });
  }, [updateJob]);

  const retryJob = useCallback((jobId) => {
    setQueue(prev => prev.map(j => j.id === jobId ? { ...j, status: 'pending', progress: 0, error: null } : j));
  }, []);

  const processExport = useCallback(async (job) => {
    updateJob(job.id, { status: 'processing', progress: 10 });

    try {
      const source = scene || template;
      const payload = {
        ...job.options,
        width: resolution.width,
        height: resolution.height,
        quality,
        sourceId: source?.id,
        sourceType: scene ? 'scene' : 'template',
        sourceData: source,
      };

      updateJob(job.id, { progress: 30 });

      const endpoint = `/api/exports/${job.format}`;
      const res = await fetch(`${API}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify(payload),
      });

      updateJob(job.id, { progress: 70 });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Export failed' }));
        throw new Error(err.error || 'Export failed');
      }

      const result = await res.json();

      updateJob(job.id, { progress: 90 });

      if (result.downloadUrl) {
        const link = document.createElement('a');
        link.href = result.downloadUrl;
        link.download = result.filename || `export.${job.format}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

      if (result.content) {
        const blob = new Blob([result.content], { type: result.mimeType || 'text/html' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = result.filename || `export.${job.format}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }

      updateJob(job.id, { status: 'completed', progress: 100 });
    } catch (err) {
      updateJob(job.id, { status: 'failed', error: err.message });
    }
  }, [scene, template, resolution, quality, updateJob]);

  const runQueue = useCallback(async () => {
    if (processing) return;
    setProcessing(true);

    const pending = queue.filter(j => j.status === 'pending');
    for (const job of pending) {
      await processExport(job);
    }

    setProcessing(false);
  }, [queue, processing, processExport]);

  const exportSingle = useCallback((format, options = {}) => {
    const job = addToQueue({ format, label: options.label || format.toUpperCase(), options });
    setTimeout(() => {
      setQueue(prev => {
        const j = prev.find(q => q.id === job);
        if (j && j.status === 'pending') {
          processExport(j);
        }
        return prev;
      });
    }, 50);
  }, [addToQueue, processExport]);

  const applyPreset = useCallback((preset) => {
    setResolution(RESOLUTIONS.find(r => r.label === preset.resolution) || RESOLUTIONS[1]);
    if (preset.quality) setQuality(preset.quality);
  }, []);

  const source = scene || template;
  const pendingCount = queue.filter(j => j.status === 'pending').length;
  const activeCount = queue.filter(j => j.status === 'processing').length;

  return (
    <div className="export-overlay" onClick={onClose}>
      <div className="export-modal" onClick={e => e.stopPropagation()}>
        <div className="export-header">
          <div>
            <h3>Export</h3>
            {source && (
              <span className="export-source-name">{source.name || source.id}</span>
            )}
          </div>
          <button className="btn btn-sm btn-secondary" onClick={onClose}>\u2715</button>
        </div>

        <div className="export-settings-row">
          <div className="export-setting">
            <label className="label">Resolution</label>
            <div className="export-res-options">
              {RESOLUTIONS.map(r => (
                <button
                  key={r.label}
                  className={`btn btn-sm ${resolution.label === r.label ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setResolution(r)}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>
          <div className="export-setting">
            <label className="label">Quality ({quality}%)</label>
            <input
              type="range"
              min={10}
              max={100}
              value={quality}
              onChange={e => setQuality(parseInt(e.target.value))}
              className="export-quality-slider"
            />
          </div>
        </div>

        <div className="export-tabs">
          {EXPORT_TABS.map(tab => (
            <button
              key={tab.id}
              className={`export-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="export-tab-icon">{tab.icon}</span>
              {tab.label}
              {tab.id === 'queue' && queue.length > 0 && (
                <span className="export-tab-badge">{queue.length}</span>
              )}
            </button>
          ))}
        </div>

        <div className="export-body">
          {activeTab === 'html' && (
            <HTMLExport
              scene={scene}
              template={template}
              resolution={resolution}
              onExport={(opts) => exportSingle('html', opts)}
            />
          )}
          {activeTab === 'image' && (
            <ImageExport
              scene={scene}
              template={template}
              resolution={resolution}
              quality={quality}
              onExport={(opts) => exportSingle('image', opts)}
            />
          )}
          {activeTab === 'video' && (
            <VideoExport
              scene={scene}
              template={template}
              resolution={resolution}
              quality={quality}
              onExport={(opts) => exportSingle('video', opts)}
            />
          )}
          {activeTab === 'presets' && (
            <ExportPresets onApply={applyPreset} onExport={(preset) => {
              applyPreset(preset);
              exportSingle(preset.format || 'html', { label: preset.name, ...preset });
            }} />
          )}
          {activeTab === 'queue' && (
            <ExportQueue
              queue={queue}
              processing={processing}
              onRunQueue={runQueue}
              onCancel={cancelJob}
              onRetry={retryJob}
              onRemove={removeFromQueue}
            />
          )}
        </div>

        <div className="export-footer">
          <span className="export-queue-summary">
            {pendingCount} pending{activeCount > 0 ? `, ${activeCount} active` : ''}
          </span>
          {activeTab !== 'queue' && pendingCount > 0 && (
            <button className="btn btn-primary btn-sm" onClick={() => setActiveTab('queue')}>
              View Queue ({pendingCount})
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
