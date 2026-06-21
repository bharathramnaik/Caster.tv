import { useState, useCallback, useMemo } from 'react';

const BINDING_SCHEMA = {
  'Team A': {
    'teamA.name': { label: 'Team Name', type: 'string', example: 'India' },
    'teamA.score': { label: 'Score', type: 'number', example: '185' },
    'teamA.wickets': { label: 'Wickets', type: 'number', example: '4' },
    'teamA.overs': { label: 'Overs', type: 'number', example: '12.3' },
    'teamA.logo': { label: 'Logo URL', type: 'image', example: 'https://...' },
    'teamA.color': { label: 'Team Color', type: 'color', example: '#1e3a5f' },
  },
  'Team B': {
    'teamB.name': { label: 'Team Name', type: 'string', example: 'Australia' },
    'teamB.score': { label: 'Score', type: 'number', example: '142' },
    'teamB.wickets': { label: 'Wickets', type: 'number', example: '6' },
    'teamB.overs': { label: 'Overs', type: 'number', example: '18.1' },
    'teamB.logo': { label: 'Logo URL', type: 'image', example: 'https://...' },
    'teamB.color': { label: 'Team Color', type: 'color', example: '#d4a017' },
  },
  'Batter': {
    'batter.name': { label: 'Batter Name', type: 'string', example: 'Virat Kohli' },
    'batter.runs': { label: 'Runs', type: 'number', example: '87' },
    'batter.balls': { label: 'Balls Faced', type: 'number', example: '62' },
    'batter.fours': { label: 'Fours', type: 'number', example: '8' },
    'batter.sixes': { label: 'Sixes', type: 'number', example: '3' },
    'batter.sr': { label: 'Strike Rate', type: 'number', example: '140.3' },
    'batter.photo': { label: 'Photo URL', type: 'image', example: 'https://...' },
  },
  'Non-Striker': {
    'nonStriker.name': { label: 'Name', type: 'string', example: 'Rohit Sharma' },
    'nonStriker.runs': { label: 'Runs', type: 'number', example: '45' },
    'nonStriker.balls': { label: 'Balls', type: 'number', example: '38' },
  },
  'Bowler': {
    'bowler.name': { label: 'Bowler Name', type: 'string', example: 'Pat Cummins' },
    'bowler.wickets': { label: 'Wickets', type: 'number', example: '2' },
    'bowler.runs': { label: 'Runs Conceded', type: 'number', example: '42' },
    'bowler.overs': { label: 'Overs Bowled', type: 'number', example: '6.2' },
    'bowler.maidens': { label: 'Maidens', type: 'number', example: '1' },
    'bowler.econ': { label: 'Economy', type: 'number', example: '6.5' },
  },
  'Match': {
    'match.status': { label: 'Status', type: 'string', example: 'Live' },
    'match.innings': { label: 'Innings', type: 'number', example: '2' },
    'match.toss': { label: 'Toss', type: 'string', example: 'India won the toss' },
    'match.venue': { label: 'Venue', type: 'string', example: 'Wankhede Stadium' },
    'match.result': { label: 'Result', type: 'string', example: '' },
    'match.target': { label: 'Target', type: 'number', example: '186' },
    'match.required': { label: 'Required Runs', type: 'number', example: '44' },
    'match.rr': { label: 'Current RR', type: 'number', example: '8.12' },
    'match.crr': { label: 'Required RR', type: 'number', example: '7.83' },
  },
  'Balls': {
    'balls.current': { label: 'Current Ball', type: 'string', example: '4' },
    'balls.last5': { label: 'Last 5 Balls', type: 'string', example: '4, 1, W, 6, .2' },
    'balls.currentOver': { label: 'Current Over Balls', type: 'string', example: '4 1 W 6' },
  },
  'Time': {
    'time.clock': { label: 'Clock', type: 'string', example: '14:32' },
    'time.elapsed': { label: 'Elapsed', type: 'string', example: '2:45:12' },
    'time.date': { label: 'Date', type: 'string', example: 'Jun 21, 2026' },
  },
};

const FILTERS = [
  { value: 'none', label: 'None' },
  { value: 'uppercase', label: 'UPPERCASE' },
  { value: 'lowercase', label: 'lowercase' },
  { value: 'capitalize', label: 'Capitalize' },
  { value: 'number', label: '#,##0' },
  { value: 'currency', label: '$#,##0.00' },
  { value: 'round0', label: 'Round (0 dec)' },
  { value: 'round1', label: 'Round (1 dec)' },
  { value: 'round2', label: 'Round (2 dec)' },
  { value: 'truncate10', label: 'Truncate (10)' },
  { value: 'truncate20', label: 'Truncate (20)' },
  { value: 'prefix', label: 'Add Prefix' },
  { value: 'suffix', label: 'Add Suffix' },
  { value: 'padStart2', label: 'Pad Start (2)' },
  { value: 'padStart3', label: 'Pad Start (3)' },
];

const DEFAULT_VALUES = {};
Object.values(BINDING_SCHEMA).forEach(group => {
  Object.entries(group).forEach(([key, def]) => {
    DEFAULT_VALUES[key] = def.example;
  });
});

export default function DataBinding({ element, onUpdate }) {
  const [expandedGroup, setExpandedGroup] = useState('Team A');
  const [showExpr, setShowExpr] = useState(false);
  const [expression, setExpression] = useState('');
  const [previewValues, setPreviewValues] = useState(DEFAULT_VALUES);
  const [prefixValue, setPrefixValue] = useState('');
  const [suffixValue, setSuffixValue] = useState('');

  const binding = element.binding || {};
  const updateBinding = useCallback((k, v) => {
    onUpdate({ binding: { ...binding, [k]: v } });
  }, [binding, onUpdate]);

  const selectedField = binding.field || '';
  const selectedFilter = binding.filter || 'none';

  const evaluateExpression = useCallback((expr, values) => {
    let result = expr;
    const matches = expr.match(/\{\{(\w+(?:\.\w+)*)\}\}/g) || [];
    matches.forEach(m => {
      const key = m.replace(/\{\{|\}\}/g, '');
      result = result.replace(m, values[key] ?? key);
    });
    return result;
  }, []);

  const applyFilter = useCallback((val, filter, prefix, suffix) => {
    let result = val;
    switch (filter) {
      case 'uppercase': result = String(val).toUpperCase(); break;
      case 'lowercase': result = String(val).toLowerCase(); break;
      case 'capitalize': result = String(val).replace(/\b\w/g, l => l.toUpperCase()); break;
      case 'number': result = Number(val).toLocaleString(); break;
      case 'currency': result = '$' + Number(val).toFixed(2); break;
      case 'round0': result = Math.round(Number(val)).toString(); break;
      case 'round1': result = Number(val).toFixed(1); break;
      case 'round2': result = Number(val).toFixed(2); break;
      case 'truncate10': result = String(val).slice(0, 10); break;
      case 'truncate20': result = String(val).slice(0, 20); break;
      case 'prefix': result = (prefix || '') + val; break;
      case 'suffix': result = val + (suffix || ''); break;
      case 'padStart2': result = String(val).padStart(2, '0'); break;
      case 'padStart3': result = String(val).padStart(3, '0'); break;
      default: break;
    }
    return result;
  }, []);

  const previewResult = useMemo(() => {
    if (showExpr && expression) {
      return evaluateExpression(expression, previewValues);
    }
    if (!selectedField) return '--';
    return applyFilter(previewValues[selectedField] || '---', selectedFilter, prefixValue, suffixValue);
  }, [selectedField, selectedFilter, showExpr, expression, previewValues, evaluateExpression, applyFilter, prefixValue, suffixValue]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div className="prop-field">
        <label className="prop-label">Binding Preview</label>
        <div style={{
          padding: '10px 12px', borderRadius: 'var(--radius-sm)',
          background: 'var(--bg-800)', border: '1px solid var(--glass-border)',
          fontSize: '0.95rem', color: 'var(--accent)', fontFamily: 'var(--font-mono)',
          minHeight: 36, display: 'flex', alignItems: 'center'
        }}>
          {previewResult}
        </div>
      </div>

      <div className="prop-field">
        <label className="prop-label">Mode</label>
        <div style={{ display: 'flex', gap: 4 }}>
          <button className={`btn btn-sm ${!showExpr ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setShowExpr(false)} style={{ flex: 1, fontSize: '0.75rem' }}>Field Selector</button>
          <button className={`btn btn-sm ${showExpr ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setShowExpr(true)} style={{ flex: 1, fontSize: '0.75rem' }}>Expression</button>
        </div>
      </div>

      {!showExpr ? (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {Object.entries(BINDING_SCHEMA).map(([groupName, fields]) => (
              <div key={groupName}>
                <button className="etoolbar-group-header" onClick={() => setExpandedGroup(expandedGroup === groupName ? '' : groupName)} style={{ width: '100%', padding: '6px 8px', fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-300)', border: 'none', borderRadius: 'var(--radius-sm)', background: expandedGroup === groupName ? 'var(--bg-600)' : 'transparent', cursor: 'pointer', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>{groupName}</span>
                  <span className={`etoolbar-chevron ${expandedGroup === groupName ? 'open' : ''}`}>&#9662;</span>
                </button>
                {expandedGroup === groupName && (
                  <div style={{ padding: '2px 0 4px', display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {Object.entries(fields).map(([key, def]) => (
                      <button key={key} onClick={() => updateBinding('field', key)} style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        width: '100%', padding: '5px 8px 5px 16px', border: 'none',
                        borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                        background: selectedField === key ? 'var(--accent-dim)' : 'transparent',
                        color: selectedField === key ? 'var(--accent)' : 'var(--text-400)',
                        fontSize: '0.72rem', textAlign: 'left', transition: 'all 0.1s'
                      }}>
                        <span>{def.label}</span>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', opacity: 0.6 }}>{def.type}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {selectedField && (
            <div className="prop-field">
              <label className="prop-label">Filter</label>
              <select className="select" value={selectedFilter} onChange={e => updateBinding('filter', e.target.value)}>
                {FILTERS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
              </select>
              {selectedFilter === 'prefix' && (
                <input type="text" className="input" value={prefixValue} onChange={e => setPrefixValue(e.target.value)} placeholder="Prefix..." style={{ marginTop: 4, fontSize: '0.8rem' }} />
              )}
              {selectedFilter === 'suffix' && (
                <input type="text" className="input" value={suffixValue} onChange={e => setSuffixValue(e.target.value)} placeholder="Suffix..." style={{ marginTop: 4, fontSize: '0.8rem' }} />
              )}
            </div>
          )}

          <div className="prop-field">
            <label className="prop-label">Condition</label>
            <input type="text" className="input" value={binding.condition || ''} onChange={e => updateBinding('condition', e.target.value)} placeholder="e.g. {{teamA.score}} > 100" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }} />
          </div>
        </>
      ) : (
        <div className="prop-field">
          <label className="prop-label">Expression</label>
          <textarea className="input" value={expression} onChange={e => setExpression(e.target.value)} placeholder="Use {{field}} to reference data. e.g. {{teamA.name}} - {{teamA.score}}/{{teamA.wickets}}" rows={3} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', resize: 'vertical' }} />
          <div style={{ marginTop: 6, fontSize: '0.65rem', color: 'var(--text-500)' }}>
            Available: {Object.values(BINDING_SCHEMA).flatMap(g => Object.keys(g)).slice(0, 10).map(k => `{{${k}}}`).join(', ')}...
          </div>
        </div>
      )}

      <div className="prop-field">
        <label className="prop-label">Test Values</label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
          {['teamA.name', 'teamA.score', 'teamB.name', 'teamB.score', 'batter.name', 'batter.runs', 'bowler.name', 'match.status'].map(key => (
            <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ fontSize: '0.6rem', color: 'var(--text-500)', fontFamily: 'var(--font-mono)', width: 70, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={key}>{key.split('.').pop()}</span>
              <input type="text" className="input" value={previewValues[key] || ''} onChange={e => setPreviewValues(p => ({ ...p, [key]: e.target.value }))} style={{ flex: 1, fontSize: '0.65rem', padding: '3px 5px' }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
