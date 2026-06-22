import { useState, useEffect, useCallback } from 'react';

const API = import.meta.env.VITE_API_URL || '';

const SEVERITY_COLORS = {
  P0: '#ef4444', P1: '#f97316', P2: '#f59e0b', P3: '#3b82f6', P4: '#6b7280'
};

const STATUS_COLUMNS = [
  { key: 'open', label: 'Open', color: '#ef4444', className: 'bug-column-open' },
  { key: 'in-progress', label: 'In Progress', color: '#f59e0b', className: 'bug-column-progress' },
  { key: 'resolved', label: 'Resolved', color: '#10b981', className: 'bug-column-resolved' },
  { key: 'closed', label: 'Closed', color: '#6b7280', className: 'bug-column-closed' },
];

export default function BugBoard() {
  const [bugs, setBugs] = useState([]);
  const [stats, setStats] = useState(null);
  const [testResults, setTestResults] = useState(null);
  const [testCoverage, setTestCoverage] = useState(null);
  const [selectedBug, setSelectedBug] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showTestPanel, setShowTestPanel] = useState(false);
  const [search, setSearch] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [newBug, setNewBug] = useState({
    title: '', description: '', severity: 'P3', stepsToReproduce: [''],
    expectedBehavior: '', actualBehavior: '', assignedTo: '', tags: []
  });
  const [comment, setComment] = useState('');
  const [runningTests, setRunningTests] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (filterStatus) params.set('status', filterStatus);
      if (filterSeverity) params.set('severity', filterSeverity);
      if (search) params.set('search', search);
      const qs = params.toString();

      const [bugsRes, statsRes] = await Promise.allSettled([
        fetch(`${API}/api/testing/bugs?${qs}`).then(r => r.json()),
        fetch(`${API}/api/testing/bugs/stats`).then(r => r.json()),
      ]);
      if (bugsRes.status === 'fulfilled') setBugs(bugsRes.value);
      if (statsRes.status === 'fulfilled') setStats(statsRes.value);
    } catch (e) {
      console.error('Failed to fetch bug data:', e);
    }
  }, [filterStatus, filterSeverity, search]);

  const fetchTests = useCallback(async () => {
    try {
      const [resultsRes, coverageRes] = await Promise.allSettled([
        fetch(`${API}/api/testing/tests/results`).then(r => r.json()),
        fetch(`${API}/api/testing/tests/coverage`).then(r => r.json()),
      ]);
      if (resultsRes.status === 'fulfilled') setTestResults(resultsRes.value);
      if (coverageRes.status === 'fulfilled') setTestCoverage(coverageRes.value);
    } catch (e) {
      console.error('Failed to fetch test data:', e);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { fetchTests(); }, [fetchTests]);

  const handleCreateBug = async () => {
    try {
      const res = await fetch(`${API}/api/testing/bugs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newBug, stepsToReproduce: newBug.stepsToReproduce.filter(Boolean) })
      });
      const bug = await res.json();
      setBugs(prev => [bug, ...prev]);
      setShowCreateModal(false);
      setNewBug({ title: '', description: '', severity: 'P3', stepsToReproduce: [''], expectedBehavior: '', actualBehavior: '', assignedTo: '', tags: [] });
      fetchData();
    } catch (e) {
      console.error('Failed to create bug:', e);
    }
  };

  const handleUpdateStatus = async (bugId, status) => {
    try {
      const url = status === 'resolved'
        ? `${API}/api/testing/bugs/${bugId}/resolve`
        : status === 'closed'
        ? `${API}/api/testing/bugs/${bugId}/close`
        : `${API}/api/testing/bugs/${bugId}`;
      const body = status === 'resolved' || status === 'closed' ? {} : { status };
      await fetch(url, { method: status === 'resolved' || status === 'closed' ? 'POST' : 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      fetchData();
      if (selectedBug?.id === bugId) {
        const res = await fetch(`${API}/api/testing/bugs/${bugId}`).then(r => r.json());
        setSelectedBug(res);
      }
    } catch (e) {
      console.error('Failed to update bug:', e);
    }
  };

  const handleAddComment = async (bugId) => {
    if (!comment.trim()) return;
    try {
      await fetch(`${API}/api/testing/bugs/${bugId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: comment, author: 'user' })
      });
      setComment('');
      const res = await fetch(`${API}/api/testing/bugs/${bugId}`).then(r => r.json());
      setSelectedBug(res);
    } catch (e) {
      console.error('Failed to add comment:', e);
    }
  };

  const handleRunAllTests = async () => {
    setRunningTests(true);
    try {
      await fetch(`${API}/api/testing/tests/run-all`, { method: 'POST' });
      fetchTests();
    } catch (e) {
      console.error('Failed to run tests:', e);
    }
    setRunningTests(false);
  };

  const filteredBugs = bugs.filter(b => {
    if (search && !b.title.toLowerCase().includes(search.toLowerCase()) && !b.id.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const bugsByStatus = STATUS_COLUMNS.map(col => ({
    ...col,
    bugs: filteredBugs.filter(b => b.status === col.key)
  }));

  const formatDuration = (ms) => {
    if (!ms) return 'N/A';
    const mins = Math.floor(ms / 60000);
    const hrs = Math.floor(mins / 60);
    if (hrs > 0) return `${hrs}h ${mins % 60}m`;
    return `${mins}m`;
  };

  return (
    <div className="bug-board">
      {/* Header */}
      <div className="bug-board-header">
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-100)', margin: 0 }}>Bug Board</h1>
          <p style={{ color: 'var(--text-500)', margin: '4px 0 0' }}>Azure Board-style bug tracking</p>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Search bugs..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="bug-search-input"
            style={{ padding: '8px 14px', borderRadius: 8, border: '1px solid var(--glass-border)', background: 'var(--glass-bg)', color: 'var(--text-200)', fontSize: 14, width: 220 }}
          />
          <select value={filterSeverity} onChange={e => setFilterSeverity(e.target.value)} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid var(--glass-border)', background: 'var(--glass-bg)', color: 'var(--text-200)', fontSize: 14 }}>
            <option value="">All Severity</option>
            {['P0','P1','P2','P3','P4'].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid var(--glass-border)', background: 'var(--glass-bg)', color: 'var(--text-200)', fontSize: 14 }}>
            <option value="">All Status</option>
            {STATUS_COLUMNS.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
          </select>
          <button onClick={() => setShowCreateModal(true)} className="btn btn-accent" style={{ padding: '8px 18px', borderRadius: 8, background: 'var(--accent)', color: '#000', fontWeight: 600, border: 'none', cursor: 'pointer' }}>+ New Bug</button>
          <button onClick={() => setShowTestPanel(!showTestPanel)} className="btn btn-sm" style={{ padding: '8px 14px', borderRadius: 8, background: 'var(--glass-bg)', color: 'var(--text-200)', border: '1px solid var(--glass-border)', cursor: 'pointer' }}>
            {showTestPanel ? 'Hide Tests' : 'Test Results'}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="bug-board-stats" style={{ marginBottom: 24 }}>
          <div className="bug-stat-card">
            <div className="bug-stat-value" style={{ color: 'var(--text-100)' }}>{stats.total}</div>
            <div className="bug-stat-label">Total Bugs</div>
          </div>
          <div className="bug-stat-card">
            <div className="bug-stat-value" style={{ color: '#ef4444' }}>{stats.open}</div>
            <div className="bug-stat-label">Open</div>
          </div>
          <div className="bug-stat-card">
            <div className="bug-stat-value" style={{ color: '#f59e0b' }}>{stats.inProgress}</div>
            <div className="bug-stat-label">In Progress</div>
          </div>
          <div className="bug-stat-card">
            <div className="bug-stat-value" style={{ color: '#10b981' }}>{stats.resolved}</div>
            <div className="bug-stat-label">Resolved</div>
          </div>
          <div className="bug-stat-card">
            <div className="bug-stat-value" style={{ color: '#6b7280' }}>{stats.closed}</div>
            <div className="bug-stat-label">Closed</div>
          </div>
          <div className="bug-stat-card">
            <div className="bug-stat-value" style={{ color: 'var(--accent)' }}>{formatDuration(stats.avgResolutionTimeMs)}</div>
            <div className="bug-stat-label">Avg Resolution</div>
          </div>
        </div>
      )}

      {/* Test Results Panel */}
      {showTestPanel && (
        <div className="test-results-panel" style={{ marginBottom: 24, padding: 20, background: 'var(--glass-bg)', borderRadius: 12, border: '1px solid var(--glass-border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ margin: 0, color: 'var(--text-100)' }}>Test Results</h3>
            <button onClick={handleRunAllTests} disabled={runningTests} style={{ padding: '8px 18px', borderRadius: 8, background: runningTests ? 'var(--text-500)' : '#10b981', color: '#fff', fontWeight: 600, border: 'none', cursor: runningTests ? 'not-allowed' : 'pointer' }}>
              {runningTests ? 'Running...' : 'Run All Tests'}
            </button>
          </div>
          {testResults && (
            <div className="test-summary" style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
              <div className="test-stat test-stat-pass">
                <div style={{ fontSize: 24, fontWeight: 700, color: '#10b981' }}>{testResults.passed || 0}</div>
                <div style={{ fontSize: 12, color: 'var(--text-500)' }}>Passed</div>
              </div>
              <div className="test-stat test-stat-fail">
                <div style={{ fontSize: 24, fontWeight: 700, color: '#ef4444' }}>{testResults.failed || 0}</div>
                <div style={{ fontSize: 12, color: 'var(--text-500)' }}>Failed</div>
              </div>
              <div className="test-stat test-stat-blocked">
                <div style={{ fontSize: 24, fontWeight: 700, color: '#f59e0b' }}>{testResults.blocked || 0}</div>
                <div style={{ fontSize: 12, color: 'var(--text-500)' }}>Blocked</div>
              </div>
              <div className="test-stat">
                <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-300)' }}>{testResults.pending || 0}</div>
                <div style={{ fontSize: 12, color: 'var(--text-500)' }}>Pending</div>
              </div>
            </div>
          )}
          {testCoverage && (
            <div style={{ marginTop: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span style={{ color: 'var(--text-300)', fontSize: 14 }}>Coverage:</span>
                <div style={{ flex: 1, height: 8, borderRadius: 4, background: 'var(--bg-700)' }}>
                  <div style={{ width: `${testCoverage.overall}%`, height: '100%', borderRadius: 4, background: testCoverage.overall > 80 ? '#10b981' : testCoverage.overall > 50 ? '#f59e0b' : '#ef4444', transition: 'width 0.5s' }} />
                </div>
                <span style={{ color: 'var(--text-100)', fontWeight: 600, fontSize: 14 }}>{testCoverage.overall}%</span>
              </div>
              {testCoverage.categories && (
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  {Object.entries(testCoverage.categories).map(([cat, data]) => (
                    <div key={cat} style={{ padding: '6px 12px', background: 'var(--bg-700)', borderRadius: 6, fontSize: 12 }}>
                      <span style={{ color: 'var(--text-300)' }}>{cat}: </span>
                      <span style={{ color: '#10b981' }}>{data.passed}</span>
                      <span style={{ color: 'var(--text-500)' }}>/</span>
                      <span style={{ color: 'var(--text-300)' }}>{data.total}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          {testResults?.tests && (
            <div style={{ marginTop: 16, maxHeight: 200, overflow: 'auto' }}>
              {testResults.tests.map(t => (
                <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', borderBottom: '1px solid var(--glass-border)', fontSize: 13 }}>
                  <span style={{ color: t.status === 'pass' ? '#10b981' : t.status === 'fail' ? '#ef4444' : t.status === 'blocked' ? '#f59e0b' : 'var(--text-500)', fontWeight: 600, minWidth: 16 }}>
                    {t.status === 'pass' ? '✓' : t.status === 'fail' ? '✗' : t.status === 'blocked' ? '!' : '○'}
                  </span>
                  <span style={{ color: 'var(--text-300)', flex: 1 }}>{t.name}</span>
                  <span style={{ color: 'var(--text-500)', fontSize: 11 }}>{t.type}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Kanban Board */}
      <div className="bug-kanban">
        {bugsByStatus.map(col => (
          <div key={col.key} className={`bug-column ${col.className}`}>
            <div className="bug-column-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>{col.label}</span>
              <span style={{ fontSize: 12, color: 'var(--text-500)', fontWeight: 400 }}>{col.bugs.length}</span>
            </div>
            {col.bugs.map(bug => (
              <div key={bug.id} className="bug-card" onClick={() => setSelectedBug(bug)}>
                <div className="bug-card-id">{bug.id}</div>
                <div className="bug-card-title" style={{ color: 'var(--text-200)' }}>{bug.title}</div>
                <div className="bug-card-meta">
                  <span className={`bug-severity bug-severity-${bug.severity.toLowerCase()}`}>{bug.severity}</span>
                  {bug.evidence && bug.evidence.length > 0 && (
                    <span style={{ fontSize: 11, color: 'var(--text-500)' }}>📎 {bug.evidence.length}</span>
                  )}
                  <span style={{ fontSize: 11, color: 'var(--text-500)', marginLeft: 'auto' }}>
                    {new Date(bug.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
            {col.bugs.length === 0 && (
              <div style={{ textAlign: 'center', padding: 20, color: 'var(--text-500)', fontSize: 13 }}>No bugs</div>
            )}
          </div>
        ))}
      </div>

      {/* Bug Detail Modal */}
      {selectedBug && (
        <div className="bug-detail-modal" onClick={() => setSelectedBug(null)}>
          <div className="bug-detail-content" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div>
                <span style={{ fontFamily: 'monospace', color: 'var(--text-500)', fontSize: 13 }}>{selectedBug.id}</span>
                <h2 style={{ margin: '4px 0 0', color: 'var(--text-100)', fontSize: 22 }}>{selectedBug.title}</h2>
              </div>
              <button onClick={() => setSelectedBug(null)} style={{ background: 'none', border: 'none', color: 'var(--text-500)', fontSize: 20, cursor: 'pointer' }}>✕</button>
            </div>

            <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
              <span className={`bug-severity bug-severity-${selectedBug.severity.toLowerCase()}`} style={{ padding: '4px 10px', fontSize: 12 }}>{selectedBug.severity}</span>
              <span style={{ padding: '4px 10px', borderRadius: 4, fontSize: 12, background: 'var(--bg-700)', color: 'var(--text-300)' }}>{selectedBug.status}</span>
              {selectedBug.assignedTo && <span style={{ padding: '4px 10px', borderRadius: 4, fontSize: 12, background: 'var(--blue-dim)', color: 'var(--blue)' }}>👤 {selectedBug.assignedTo}</span>}
            </div>

            {selectedBug.description && (
              <div style={{ marginBottom: 16 }}>
                <h4 style={{ color: 'var(--text-300)', margin: '0 0 6px', fontSize: 13 }}>Description</h4>
                <p style={{ color: 'var(--text-200)', margin: 0, lineHeight: 1.6 }}>{selectedBug.description}</p>
              </div>
            )}

            {selectedBug.stepsToReproduce && selectedBug.stepsToReproduce.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <h4 style={{ color: 'var(--text-300)', margin: '0 0 6px', fontSize: 13 }}>Steps to Reproduce</h4>
                <ol style={{ color: 'var(--text-200)', margin: 0, paddingLeft: 20, lineHeight: 1.8 }}>
                  {selectedBug.stepsToReproduce.map((step, i) => <li key={i}>{step}</li>)}
                </ol>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              {selectedBug.expectedBehavior && (
                <div>
                  <h4 style={{ color: '#10b981', margin: '0 0 6px', fontSize: 13 }}>Expected</h4>
                  <p style={{ color: 'var(--text-200)', margin: 0, fontSize: 14 }}>{selectedBug.expectedBehavior}</p>
                </div>
              )}
              {selectedBug.actualBehavior && (
                <div>
                  <h4 style={{ color: '#ef4444', margin: '0 0 6px', fontSize: 13 }}>Actual</h4>
                  <p style={{ color: 'var(--text-200)', margin: 0, fontSize: 14 }}>{selectedBug.actualBehavior}</p>
                </div>
              )}
            </div>

            {selectedBug.evidenceItems && selectedBug.evidenceItems.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <h4 style={{ color: 'var(--text-300)', margin: '0 0 6px', fontSize: 13 }}>Evidence ({selectedBug.evidenceItems.length})</h4>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {selectedBug.evidenceItems.map(e => (
                    <div key={e.id} style={{ padding: '8px 12px', background: 'var(--bg-700)', borderRadius: 6, fontSize: 12, color: 'var(--text-300)' }}>
                      {e.type === 'screenshot' ? '📸' : e.type === 'console-log' ? '📋' : e.type === 'error-stack' ? '⚠️' : '📎'} {e.type}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              {selectedBug.status === 'open' && (
                <button onClick={() => handleUpdateStatus(selectedBug.id, 'in-progress')} style={{ padding: '8px 16px', borderRadius: 6, background: '#f59e0b', color: '#000', fontWeight: 600, border: 'none', cursor: 'pointer', fontSize: 13 }}>Start Progress</button>
              )}
              {(selectedBug.status === 'open' || selectedBug.status === 'in-progress') && (
                <button onClick={() => handleUpdateStatus(selectedBug.id, 'resolved')} style={{ padding: '8px 16px', borderRadius: 6, background: '#10b981', color: '#fff', fontWeight: 600, border: 'none', cursor: 'pointer', fontSize: 13 }}>Resolve</button>
              )}
              {selectedBug.status === 'resolved' && (
                <button onClick={() => handleUpdateStatus(selectedBug.id, 'closed')} style={{ padding: '8px 16px', borderRadius: 6, background: '#6b7280', color: '#fff', fontWeight: 600, border: 'none', cursor: 'pointer', fontSize: 13 }}>Close</button>
              )}
              {selectedBug.status === 'closed' && (
                <button onClick={() => handleUpdateStatus(selectedBug.id, 'open')} style={{ padding: '8px 16px', borderRadius: 6, background: 'var(--bg-700)', color: 'var(--text-200)', fontWeight: 600, border: '1px solid var(--glass-border)', cursor: 'pointer', fontSize: 13 }}>Reopen</button>
              )}
            </div>

            {/* Comments */}
            <div>
              <h4 style={{ color: 'var(--text-300)', margin: '0 0 8px', fontSize: 13 }}>Comments</h4>
              {selectedBug.comments && selectedBug.comments.length > 0 && (
                <div style={{ marginBottom: 12 }}>
                  {selectedBug.comments.map(c => (
                    <div key={c.id} style={{ padding: '8px 12px', background: 'var(--bg-700)', borderRadius: 6, marginBottom: 6 }}>
                      <div style={{ fontSize: 11, color: 'var(--text-500)' }}>{c.author} · {new Date(c.createdAt).toLocaleString()}</div>
                      <div style={{ fontSize: 13, color: 'var(--text-200)', marginTop: 4 }}>{c.text}</div>
                    </div>
                  ))}
                </div>
              )}
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  type="text"
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAddComment(selectedBug.id)}
                  placeholder="Add a comment..."
                  style={{ flex: 1, padding: '8px 12px', borderRadius: 6, border: '1px solid var(--glass-border)', background: 'var(--bg-700)', color: 'var(--text-200)', fontSize: 13 }}
                />
                <button onClick={() => handleAddComment(selectedBug.id)} style={{ padding: '8px 14px', borderRadius: 6, background: 'var(--accent)', color: '#000', fontWeight: 600, border: 'none', cursor: 'pointer', fontSize: 13 }}>Send</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Bug Modal */}
      {showCreateModal && (
        <div className="bug-detail-modal" onClick={() => setShowCreateModal(false)}>
          <div className="bug-detail-content" onClick={e => e.stopPropagation()} style={{ width: 550 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ margin: 0, color: 'var(--text-100)', fontSize: 20 }}>Create Bug</h2>
              <button onClick={() => setShowCreateModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-500)', fontSize: 20, cursor: 'pointer' }}>✕</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, color: 'var(--text-400)', marginBottom: 4 }}>Title *</label>
                <input value={newBug.title} onChange={e => setNewBug({ ...newBug, title: e.target.value })} style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: '1px solid var(--glass-border)', background: 'var(--bg-700)', color: 'var(--text-200)', fontSize: 14, boxSizing: 'border-box' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, color: 'var(--text-400)', marginBottom: 4 }}>Description</label>
                <textarea value={newBug.description} onChange={e => setNewBug({ ...newBug, description: e.target.value })} rows={3} style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: '1px solid var(--glass-border)', background: 'var(--bg-700)', color: 'var(--text-200)', fontSize: 14, resize: 'vertical', boxSizing: 'border-box' }} />
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: 12, color: 'var(--text-400)', marginBottom: 4 }}>Severity</label>
                  <select value={newBug.severity} onChange={e => setNewBug({ ...newBug, severity: e.target.value })} style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: '1px solid var(--glass-border)', background: 'var(--bg-700)', color: 'var(--text-200)', fontSize: 14 }}>
                    {['P0','P1','P2','P3','P4'].map(s => <option key={s} value={s}>{s} — {s === 'P0' ? 'Critical' : s === 'P1' ? 'High' : s === 'P2' ? 'Medium' : s === 'P3' ? 'Low' : 'Trivial'}</option>)}
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: 12, color: 'var(--text-400)', marginBottom: 4 }}>Assign To</label>
                  <input value={newBug.assignedTo} onChange={e => setNewBug({ ...newBug, assignedTo: e.target.value })} placeholder="Optional" style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: '1px solid var(--glass-border)', background: 'var(--bg-700)', color: 'var(--text-200)', fontSize: 14, boxSizing: 'border-box' }} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, color: 'var(--text-400)', marginBottom: 4 }}>Steps to Reproduce</label>
                {newBug.stepsToReproduce.map((step, i) => (
                  <div key={i} style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
                    <span style={{ color: 'var(--text-500)', fontSize: 13, minWidth: 20, paddingTop: 8 }}>{i + 1}.</span>
                    <input value={step} onChange={e => { const s = [...newBug.stepsToReproduce]; s[i] = e.target.value; setNewBug({ ...newBug, stepsToReproduce: s }); }} style={{ flex: 1, padding: '8px 12px', borderRadius: 6, border: '1px solid var(--glass-border)', background: 'var(--bg-700)', color: 'var(--text-200)', fontSize: 13 }} />
                    {newBug.stepsToReproduce.length > 1 && (
                      <button onClick={() => setNewBug({ ...newBug, stepsToReproduce: newBug.stepsToReproduce.filter((_, j) => j !== i) })} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: 16 }}>×</button>
                    )}
                  </div>
                ))}
                <button onClick={() => setNewBug({ ...newBug, stepsToReproduce: [...newBug.stepsToReproduce, ''] })} style={{ background: 'none', border: '1px dashed var(--glass-border)', color: 'var(--text-500)', padding: '6px 12px', borderRadius: 6, cursor: 'pointer', fontSize: 12 }}>+ Add Step</button>
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: 12, color: 'var(--text-400)', marginBottom: 4 }}>Expected Behavior</label>
                  <textarea value={newBug.expectedBehavior} onChange={e => setNewBug({ ...newBug, expectedBehavior: e.target.value })} rows={2} style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: '1px solid var(--glass-border)', background: 'var(--bg-700)', color: 'var(--text-200)', fontSize: 13, resize: 'vertical', boxSizing: 'border-box' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: 12, color: 'var(--text-400)', marginBottom: 4 }}>Actual Behavior</label>
                  <textarea value={newBug.actualBehavior} onChange={e => setNewBug({ ...newBug, actualBehavior: e.target.value })} rows={2} style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: '1px solid var(--glass-border)', background: 'var(--bg-700)', color: 'var(--text-200)', fontSize: 13, resize: 'vertical', boxSizing: 'border-box' }} />
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 20 }}>
              <button onClick={() => setShowCreateModal(false)} style={{ padding: '10px 18px', borderRadius: 8, background: 'var(--bg-700)', color: 'var(--text-300)', border: '1px solid var(--glass-border)', cursor: 'pointer', fontSize: 14 }}>Cancel</button>
              <button onClick={handleCreateBug} disabled={!newBug.title.trim()} style={{ padding: '10px 18px', borderRadius: 8, background: newBug.title.trim() ? 'var(--accent)' : 'var(--text-500)', color: '#000', fontWeight: 600, border: 'none', cursor: newBug.title.trim() ? 'pointer' : 'not-allowed', fontSize: 14 }}>Create Bug</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
