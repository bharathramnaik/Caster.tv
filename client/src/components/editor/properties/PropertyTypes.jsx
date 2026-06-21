import { useState, useCallback, useMemo } from 'react';
import ColorPicker from './ColorPicker.jsx';
import FontPicker from './FontPicker.jsx';

const EASING_CURVES = {
  'linear': 'linear',
  'ease': 'ease',
  'ease-in': 'ease-in',
  'ease-out': 'ease-out',
  'ease-in-out': 'ease-in-out',
  'bounce': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  'elastic': 'cubic-bezier(0.68, -0.55, 0.27, 1.55)',
  'smooth': 'cubic-bezier(0.16, 1, 0.3, 1)',
  'snappy': 'cubic-bezier(0.2, 0.8, 0.2, 1)',
  'dramatic': 'cubic-bezier(0.5, 0, 0.2, 1)',
};

const ANIMATION_PRESETS = {
  'fade-in': { label: 'Fade In', icon: '\u2571' },
  'slide-in-left': { label: 'Slide Left', icon: '\u2190' },
  'slide-in-right': { label: 'Slide Right', icon: '\u2192' },
  'slide-in-top': { label: 'Slide Top', icon: '\u2191' },
  'slide-in-bottom': { label: 'Slide Bottom', icon: '\u2193' },
  'bounce-in': { label: 'Bounce In', icon: '\u2934' },
  'scale-in': { label: 'Scale In', icon: '\u29C9' },
  'wipe-in-right': { label: 'Wipe Right', icon: '\u27A1' },
  'typewriter': { label: 'Typewriter', icon: '\u2328' },
  'fade-out': { label: 'Fade Out', icon: '\u2572' },
  'slide-out-left': { label: 'Slide Out L', icon: '\u2B05' },
  'slide-out-right': { label: 'Slide Out R', icon: '\u27A1' },
  'scale-out': { label: 'Scale Out', icon: '\u2B1A' },
};

function Section({ title, children, defaultOpen = true, icon }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="prop-section">
      <button className="prop-section-header" onClick={() => setOpen(!open)}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {icon && <span style={{ opacity: 0.5, fontSize: '0.7rem' }}>{icon}</span>}
          {title}
        </span>
        <span className={`prop-section-chevron ${open ? 'open' : ''}`}>&#9662;</span>
      </button>
      {open && <div className="prop-section-body">{children}</div>}
    </div>
  );
}

function NumberProperty({ label, value, onChange, min, max, step = 1, unit, compact }) {
  return (
    <div className={`prop-field ${compact ? 'prop-field-compact' : ''}`}>
      <label className="prop-label">{label}</label>
      <div className="prop-number-row">
        <input type="number" className="input" value={value ?? 0} min={min} max={max} step={step} onChange={e => onChange(parseFloat(e.target.value) || 0)} style={{ flex: 1 }} />
        {unit && <span className="prop-unit">{unit}</span>}
      </div>
    </div>
  );
}

function ColorProperty({ label, value, onChange }) {
  return <ColorPicker label={label} value={value} onChange={onChange} />;
}

function StringProperty({ label, value, onChange, placeholder, multiline, rows = 2 }) {
  const Comp = multiline ? 'textarea' : 'input';
  return (
    <div className="prop-field">
      <label className="prop-label">{label}</label>
      <Comp className="input" value={value || ''} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={multiline ? rows : undefined} style={multiline ? { resize: 'vertical' } : undefined} />
    </div>
  );
}

function SelectProperty({ label, value, onChange, options }) {
  return (
    <div className="prop-field">
      <label className="prop-label">{label}</label>
      <select className="select" value={value} onChange={e => onChange(e.target.value)}>
        {options.map(o => typeof o === 'string' ? <option key={o} value={o}>{o}</option> : <option key={o.value} value={o.value}>{o.label || o.value}</option>)}
      </select>
    </div>
  );
}

function BooleanProperty({ label, value, onChange, description }) {
  return (
    <div className="prop-field" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
      <div>
        <label className="prop-label" style={{ marginBottom: 0 }}>{label}</label>
        {description && <div style={{ fontSize: '0.65rem', color: 'var(--text-500)', marginTop: 2 }}>{description}</div>}
      </div>
      <button className={`btn btn-sm ${value ? 'btn-primary' : 'btn-secondary'}`} onClick={() => onChange(!value)} style={{ minWidth: 44, padding: '4px 8px', fontSize: '0.75rem' }}>
        {value ? 'On' : 'Off'}
      </button>
    </div>
  );
}

function PositionProperty({ value = {}, onChange }) {
  const update = useCallback((k, v) => onChange({ ...value, [k]: v }), [value, onChange]);
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
      <NumberProperty label="X" value={value.x} onChange={v => update('x', v)} compact />
      <NumberProperty label="Y" value={value.y} onChange={v => update('y', v)} compact />
    </div>
  );
}

function SizeProperty({ value = {}, onChange }) {
  const update = useCallback((k, v) => onChange({ ...value, [k]: v }), [value, onChange]);
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
      <NumberProperty label="Width" value={value.width} onChange={v => update('width', v)} min={1} compact />
      <NumberProperty label="Height" value={value.height} onChange={v => update('height', v)} min={1} compact />
    </div>
  );
}

function FontProperty({ style, onChange }) {
  return <FontPicker style={style} onChange={onChange} />;
}

function ShadowProperty({ style, onChange }) {
  const update = useCallback((k, v) => onChange({ ...style, [k]: v }), [style, onChange]);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <NumberProperty label="X Offset" value={style.shadowX ?? 0} onChange={v => update('shadowX', v)} min={-50} max={50} compact />
        <NumberProperty label="Y Offset" value={style.shadowY ?? 0} onChange={v => update('shadowY', v)} min={-50} max={50} compact />
      </div>
      <NumberProperty label="Blur" value={style.shadowBlur ?? 0} onChange={v => update('shadowBlur', v)} min={0} max={100} compact />
      <ColorProperty label="Color" value={style.shadowColor || 'rgba(0,0,0,0.5)'} onChange={v => update('shadowColor', v)} />
    </div>
  );
}

function BorderProperty({ style, onChange }) {
  const update = useCallback((k, v) => onChange({ ...style, [k]: v }), [style, onChange]);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <NumberProperty label="Width" value={style.borderWidth ?? 0} onChange={v => update('borderWidth', v)} min={0} max={20} unit="px" compact />
        <NumberProperty label="Radius" value={style.borderRadius ?? 0} onChange={v => update('borderRadius', v)} min={0} max={200} unit="px" compact />
      </div>
      <ColorProperty label="Color" value={style.borderColor || '#ffffff'} onChange={v => update('borderColor', v)} />
    </div>
  );
}

function GradientProperty({ style, onChange }) {
  const update = useCallback((k, v) => onChange({ ...style, [k]: v }), [style, onChange]);
  const type = style.gradientType || 'linear';
  const angle = style.gradientAngle ?? 135;
  const color1 = style.gradientColor1 || '#f7c948';
  const color2 = style.gradientColor2 || '#3b82f6';

  const presets = [
    { label: 'Sunset', c1: '#f7c948', c2: '#e5b800', a: 135 },
    { label: 'Ocean', c1: '#3b82f6', c2: '#06b6d4', a: 135 },
    { label: 'Fire', c1: '#ef4444', c2: '#f97316', a: 135 },
    { label: 'Forest', c1: '#22c55e', c2: '#16a34a', a: 135 },
    { label: 'Purple', c1: '#8b5cf6', c2: '#ec4899', a: 135 },
    { label: 'Night', c1: '#1e3a5f', c2: '#0a0e1a', a: 180 },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <SelectProperty label="Type" value={type} onChange={v => update('gradientType', v)} options={['linear', 'radial']} />
      {type === 'linear' && <NumberProperty label="Angle" value={angle} onChange={v => update('gradientAngle', v)} min={0} max={360} unit="deg" />}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <ColorProperty label="Color 1" value={color1} onChange={v => update('gradientColor1', v)} />
        <ColorProperty label="Color 2" value={color2} onChange={v => update('gradientColor2', v)} />
      </div>
      <div style={{ padding: '8px', borderRadius: 'var(--radius-sm)', background: `${type}-gradient(${type === 'linear' ? angle + 'deg' : 'circle'}, ${color1}, ${color2})`, height: 32, border: '1px solid var(--glass-border)' }} />
      <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
        {presets.map(p => (
          <button key={p.label} className="prop-swatch" style={{ background: `linear-gradient(${p.a}deg, ${p.c1}, ${p.c2})`, width: 22, height: 22 }} onClick={() => { update('gradientColor1', p.c1); update('gradientColor2', p.c2); update('gradientAngle', p.a); update('gradientType', 'linear'); }} title={p.label} />
        ))}
      </div>
    </div>
  );
}

function AnimationProperty({ animation, onChange }) {
  const update = useCallback((k, v) => onChange({ ...animation, [k]: v }), [animation, onChange]);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <SelectProperty label="Enter" value={animation.enter || 'fade-in'} onChange={v => update('enter', v)} options={Object.entries(ANIMATION_PRESETS).map(([k, v]) => ({ value: k, label: `${v.icon} ${v.label}` }))} />
      <SelectProperty label="Exit" value={animation.exit || 'fade-out'} onChange={v => update('exit', v)} options={Object.entries(ANIMATION_PRESETS).map(([k, v]) => ({ value: k, label: `${v.icon} ${v.label}` }))} />
      <NumberProperty label="Duration" value={animation.duration ?? 0.5} onChange={v => update('duration', v)} min={0.1} max={5} step={0.1} unit="s" />
      <SelectProperty label="Easing" value={animation.easing || 'ease-out'} onChange={v => update('easing', v)} options={Object.entries(EASING_CURVES).map(([name, val]) => ({ value: val, label: name }))} />
      <NumberProperty label="Delay" value={animation.delay ?? 0} onChange={v => update('delay', v)} min={0} max={10} step={0.1} unit="s" />
    </div>
  );
}

function BindingProperty({ element, onUpdate }) {
  const [showExpr, setShowExpr] = useState(false);
  const filters = ['none', 'uppercase', 'lowercase', 'capitalize', 'number', 'currency', 'date'];
  const binding = element.binding || {};
  const updateBinding = useCallback((k, v) => {
    onUpdate({ binding: { ...binding, [k]: v } });
  }, [binding, onUpdate]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <SelectProperty label="Bind to" value={binding.field || ''} onChange={v => updateBinding('field', v)} options={[
        { value: '', label: '-- None --' },
        { value: 'teamA.name', label: 'Team A Name' },
        { value: 'teamA.score', label: 'Team A Score' },
        { value: 'teamA.wickets', label: 'Team A Wickets' },
        { value: 'teamA.overs', label: 'Team A Overs' },
        { value: 'teamB.name', label: 'Team B Name' },
        { value: 'teamB.score', label: 'Team B Score' },
        { value: 'teamB.wickets', label: 'Team B Wickets' },
        { value: 'teamB.overs', label: 'Team B Overs' },
        { value: 'batter.name', label: 'Batter Name' },
        { value: 'batter.runs', label: 'Batter Runs' },
        { value: 'batter.balls', label: 'Batter Balls' },
        { value: 'bowler.name', label: 'Bowler Name' },
        { value: 'bowler.figures', label: 'Bowler Figures' },
        { value: 'match.status', label: 'Match Status' },
        { value: 'match.innings', label: 'Innings' },
        { value: 'match.toss', label: 'Toss' },
        { value: 'match.venue', label: 'Venue' },
        { value: 'custom', label: 'Custom Expression' },
      ]} />

      {binding.field === 'custom' && (
        <div className="prop-field">
          <label className="prop-label">Expression</label>
          <input type="text" className="input" value={binding.expression || ''} onChange={e => updateBinding('expression', e.target.value)} placeholder="e.g. {{teamA.score}} / {{teamA.overs}}" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }} />
        </div>
      )}

      <SelectProperty label="Filter" value={binding.filter || 'none'} onChange={v => updateBinding('filter', v)} options={filters} />

      <div className="prop-field">
        <label className="prop-label">Condition</label>
        <input type="text" className="input" value={binding.condition || ''} onChange={e => updateBinding('condition', e.target.value)} placeholder="e.g. {{teamA.score}} > 100" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }} />
      </div>

      {binding.field && (
        <div style={{ padding: '6px 10px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-800)', border: '1px solid var(--glass-border)', fontSize: '0.7rem', color: 'var(--text-400)' }}>
          <span style={{ color: 'var(--accent)' }}>Bound:</span> {binding.field}
          {binding.filter !== 'none' && <span> | Filter: {binding.filter}</span>}
        </div>
      )}
    </div>
  );
}

export {
  Section,
  NumberProperty,
  ColorProperty,
  StringProperty,
  SelectProperty,
  BooleanProperty,
  PositionProperty,
  SizeProperty,
  FontProperty,
  ShadowProperty,
  BorderProperty,
  GradientProperty,
  AnimationProperty,
  BindingProperty,
  EASING_CURVES,
  ANIMATION_PRESETS,
};
