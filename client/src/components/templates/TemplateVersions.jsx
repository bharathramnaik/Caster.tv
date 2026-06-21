import { useState, useCallback } from 'react';

export default function TemplateVersions({ template, versions, onRestore, onClose }) {
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [compareMode, setCompareMode] = useState(false);
  const [compareVersions, setCompareVersions] = useState([]);
  const [notes, setNotes] = useState('');

  const allVersions = versions?.length
    ? versions
    : generateMockVersions(template);

  const handleRestore = useCallback((version) => {
    if (window.confirm(`Restore to version ${version.version}? Current changes will be saved as a new version.`)) {
      onRestore?.(template?.id, version.id);
    }
  }, [template, onRestore]);

  const toggleCompare = useCallback((version) => {
    setCompareVersions(prev => {
      if (prev.find(v => v.id === version.id)) {
        return prev.filter(v => v.id !== version.id);
      }
      if (prev.length >= 2) {
        return [prev[1], version];
      }
      return [...prev, version];
    });
  }, []);

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now - d;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHrs = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHrs < 24) return `${diffHrs}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="tpl-ver-overlay" onClick={onClose}>
      <div className="tpl-ver-modal" onClick={(e) => e.stopPropagation()}>
        <div className="tpl-ver-header">
          <h3>Version History</h3>
          <div className="tpl-ver-header-actions">
            <button
              className={`btn btn-sm ${compareMode ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => { setCompareMode(!compareMode); setCompareVersions([]); }}
            >
              {compareMode ? 'Cancel Compare' : 'Compare'}
            </button>
            <button className="btn btn-sm btn-secondary" onClick={onClose}>✕</button>
          </div>
        </div>

        <div className="tpl-ver-body">
          {compareMode && compareVersions.length === 2 && (
            <div className="tpl-ver-compare">
              <div className="tpl-ver-compare-header">
                <span>Comparing: {compareVersions[0].version} vs {compareVersions[1].version}</span>
              </div>
              <div className="tpl-ver-diff">
                <div className="tpl-ver-diff-col">
                  <h5>Version {compareVersions[0].version}</h5>
                  <pre>{JSON.stringify(compareVersions[0].snapshot, null, 2)}</pre>
                </div>
                <div className="tpl-ver-diff-col">
                  <h5>Version {compareVersions[1].version}</h5>
                  <pre>{JSON.stringify(compareVersions[1].snapshot, null, 2)}</pre>
                </div>
              </div>
            </div>
          )}

          <div className="tpl-ver-list">
            {allVersions.map((version, idx) => (
              <div
                key={version.id}
                className={`tpl-ver-item ${selectedVersion?.id === version.id ? 'selected' : ''} ${idx === 0 ? 'current' : ''}`}
                onClick={() => setSelectedVersion(version)}
              >
                <div className="tpl-ver-item-dot" style={{
                  background: idx === 0 ? 'var(--green)' : 'var(--text-500)'
                }} />
                <div className="tpl-ver-item-info">
                  <div className="tpl-ver-item-top">
                    <span className="tpl-ver-item-version">{version.version}</span>
                    <span className="tpl-ver-item-date">{formatDate(version.date)}</span>
                  </div>
                  {version.notes && (
                    <p className="tpl-ver-item-notes">{version.notes}</p>
                  )}
                  <div className="tpl-ver-item-meta">
                    <span>{version.elements || 0} elements</span>
                    {version.author && <span>by {version.author}</span>}
                  </div>
                </div>
                <div className="tpl-ver-item-actions">
                  {compareMode ? (
                    <button
                      className={`tpl-ver-compare-btn ${compareVersions.find(v => v.id === version.id) ? 'selected' : ''}`}
                      onClick={(e) => { e.stopPropagation(); toggleCompare(version); }}
                    >
                      {compareVersions.find(v => v.id === version.id) ? '✓' : '○'}
                    </button>
                  ) : (
                    idx > 0 && (
                      <button
                        className="btn btn-sm btn-secondary"
                        onClick={(e) => { e.stopPropagation(); handleRestore(version); }}
                      >
                        Restore
                      </button>
                    )
                  )}
                </div>
              </div>
            ))}
          </div>

          {selectedVersion && !compareMode && (
            <div className="tpl-ver-detail">
              <h5>Version {selectedVersion.version} Details</h5>
              <div className="tpl-ver-detail-grid">
                <div className="tpl-ver-detail-item">
                  <span>Date</span>
                  <span>{new Date(selectedVersion.date).toLocaleString()}</span>
                </div>
                <div className="tpl-ver-detail-item">
                  <span>Elements</span>
                  <span>{selectedVersion.elements || 0}</span>
                </div>
                {selectedVersion.author && (
                  <div className="tpl-ver-detail-item">
                    <span>Author</span>
                    <span>{selectedVersion.author}</span>
                  </div>
                )}
              </div>
              {selectedVersion.notes && (
                <div className="tpl-ver-detail-notes">
                  <span>Notes</span>
                  <p>{selectedVersion.notes}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function generateMockVersions(template) {
  if (!template) return [];
  const versions = [];
  const numVersions = 4;

  for (let i = 0; i < numVersions; i++) {
    versions.push({
      id: `v_${template.id}_${i}`,
      version: `${(numVersions - i) * 1 + 1}.0`,
      date: new Date(Date.now() - i * 86400000 * 3).toISOString(),
      notes: i === 0
        ? 'Latest version'
        : i === 1
        ? 'Updated layout and styling'
        : i === 2
        ? 'Initial creation'
        : 'Added animations',
      elements: (template.elements?.length || 0) + (i * -1),
      author: 'User',
      snapshot: {
        ...template,
        elements: (template.elements || []).slice(0, Math.max(1, (template.elements?.length || 1) - i)),
        version: `${(numVersions - i) * 1 + 1}.0`
      }
    });
  }

  return versions;
}
