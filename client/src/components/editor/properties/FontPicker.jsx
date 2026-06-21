import { useState, useCallback, useMemo } from 'react';

const BUNDLED_FONTS = [
  'Outfit', 'Inter', 'Teko', 'Rajdhani', 'Montserrat', 'Roboto',
  'Open Sans', 'Lato', 'Poppins', 'Raleway', 'Nunito', 'Oswald',
  'Bebas Neue', 'Playfair Display', 'Merriweather', 'Source Code Pro',
  'Anton', 'Bebas Neue', 'Archivo Black', 'Righteous', 'Press Start 2P'
];

const WEIGHTS = [
  { value: '100', label: 'Thin' },
  { value: '200', label: 'ExtraLight' },
  { value: '300', label: 'Light' },
  { value: '400', label: 'Regular' },
  { value: '500', label: 'Medium' },
  { value: '600', label: 'SemiBold' },
  { value: '700', label: 'Bold' },
  { value: '800', label: 'ExtraBold' },
  { value: '900', label: 'Black' },
];

const TEXT_TRANSFORMS = ['none', 'uppercase', 'lowercase', 'capitalize'];
const TEXT_ALIGNS = [
  { value: 'left', icon: '\u2261', label: 'Left' },
  { value: 'center', icon: '\u2261', label: 'Center' },
  { value: 'right', icon: '\u2261', label: 'Right' },
  { value: 'justify', icon: '\u2261', label: 'Justify' },
];

export default function FontPicker({ style = {}, onChange }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showPreview, setShowPreview] = useState(true);

  const filteredFonts = useMemo(() => {
    if (!searchTerm) return BUNDLED_FONTS;
    const term = searchTerm.toLowerCase();
    return BUNDLED_FONTS.filter(f => f.toLowerCase().includes(term));
  }, [searchTerm]);

  const update = useCallback((key, val) => {
    onChange({ ...style, [key]: val });
  }, [style, onChange]);

  const s = style;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div className="prop-field">
        <label className="prop-label">Font Family</label>
        <input type="text" className="input" placeholder="Search fonts..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{ marginBottom: 6, fontSize: '0.8rem', padding: '6px 10px' }} />
        <div style={{ maxHeight: 140, overflowY: 'auto', borderRadius: 'var(--radius-sm)', border: '1px solid var(--glass-border)' }}>
          {filteredFonts.map(f => (
            <button key={f} onClick={() => update('fontFamily', f)} style={{
              display: 'block', width: '100%', textAlign: 'left', padding: '6px 10px',
              background: s.fontFamily === f ? 'var(--accent-dim)' : 'transparent',
              color: s.fontFamily === f ? 'var(--accent)' : 'var(--text-300)',
              border: 'none', cursor: 'pointer', fontSize: '0.8rem',
              fontFamily: `'${f}', sans-serif`, borderBottom: '1px solid rgba(255,255,255,0.03)'
            }}>
              {f}
            </button>
          ))}
          {filteredFonts.length === 0 && (
            <div style={{ padding: '10px', color: 'var(--text-500)', fontSize: '0.75rem', textAlign: 'center' }}>No fonts found</div>
          )}
        </div>
        <div style={{ marginTop: 6, fontSize: '0.75rem', color: 'var(--text-400)' }}>
          Current: <span style={{ fontFamily: `'${s.fontFamily || 'Outfit'}', sans-serif`, color: 'var(--text-200)' }}>{s.fontFamily || 'Outfit'}</span>
        </div>
      </div>

      {showPreview && (
        <div style={{
          padding: '10px 12px', borderRadius: 'var(--radius-sm)',
          background: 'var(--bg-800)', border: '1px solid var(--glass-border)',
          fontFamily: `'${s.fontFamily || 'Outfit'}', sans-serif`,
          fontSize: Math.min(s.fontSize || 24, 48),
          fontWeight: s.fontWeight || '400',
          fontStyle: s.fontStyle || 'normal',
          color: s.color || 'var(--text-100)',
          lineHeight: s.lineHeight || 1.2,
          letterSpacing: s.letterSpacing || 0,
          textAlign: s.textAlign || 'left',
          textTransform: s.textTransform || 'none',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
        }}>
          {s.content || 'Sample Text Aa Bb Cc 123'}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <div className="prop-field">
          <label className="prop-label">Size</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <input type="number" className="input" min={8} max={200} value={s.fontSize ?? 24} onChange={e => update('fontSize', parseFloat(e.target.value) || 24)} style={{ flex: 1, fontSize: '0.8rem' }} />
            <span className="prop-unit">px</span>
          </div>
        </div>
        <div className="prop-field">
          <label className="prop-label">Weight</label>
          <select className="select" value={s.fontWeight ?? '400'} onChange={e => update('fontWeight', e.target.value)}>
            {WEIGHTS.map(w => <option key={w.value} value={w.value}>{w.label} ({w.value})</option>)}
          </select>
        </div>
      </div>

      <div className="prop-field">
        <label className="prop-label">Style</label>
        <div style={{ display: 'flex', gap: 4 }}>
          {['normal', 'italic', 'oblique'].map(st => (
            <button key={st} className={`btn btn-sm ${(s.fontStyle || 'normal') === st ? 'btn-primary' : 'btn-secondary'}`} onClick={() => update('fontStyle', st)} style={{ flex: 1, fontSize: '0.7rem', fontStyle: st }}>{st.charAt(0).toUpperCase() + st.slice(1)}</button>
          ))}
        </div>
      </div>

      <div className="prop-field">
        <label className="prop-label">Alignment</label>
        <div style={{ display: 'flex', gap: 4 }}>
          {TEXT_ALIGNS.map(a => (
            <button key={a.value} className={`btn btn-sm ${(s.textAlign || 'left') === a.value ? 'btn-primary' : 'btn-secondary'}`} onClick={() => update('textAlign', a.value)} style={{ flex: 1, fontSize: '0.75rem' }} title={a.label}>{a.icon}</button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <div className="prop-field">
          <label className="prop-label">Line Height</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <input type="number" className="input" min={0.5} max={3} step={0.1} value={s.lineHeight ?? 1.2} onChange={e => update('lineHeight', parseFloat(e.target.value) || 1.2)} style={{ flex: 1, fontSize: '0.8rem' }} />
          </div>
        </div>
        <div className="prop-field">
          <label className="prop-label">Letter Spacing</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <input type="number" className="input" min={-10} max={20} step={0.5} value={s.letterSpacing ?? 0} onChange={e => update('letterSpacing', parseFloat(e.target.value) || 0)} style={{ flex: 1, fontSize: '0.8rem' }} />
            <span className="prop-unit">px</span>
          </div>
        </div>
      </div>

      <div className="prop-field">
        <label className="prop-label">Transform</label>
        <div style={{ display: 'flex', gap: 4 }}>
          {TEXT_TRANSFORMS.map(t => (
            <button key={t} className={`btn btn-sm ${(s.textTransform || 'none') === t ? 'btn-primary' : 'btn-secondary'}`} onClick={() => update('textTransform', t)} style={{ flex: 1, fontSize: '0.7rem', textTransform: t === 'none' ? 'none' : t }}>{t === 'none' ? 'Aa' : t.charAt(0).toUpperCase()}</button>
          ))}
        </div>
      </div>

      <div className="prop-field">
        <label className="prop-label">Decoration</label>
        <div style={{ display: 'flex', gap: 4 }}>
          {['none', 'underline', 'overline', 'line-through'].map(d => (
            <button key={d} className={`btn btn-sm ${(s.textDecoration || 'none') === d ? 'btn-primary' : 'btn-secondary'}`} onClick={() => update('textDecoration', d)} style={{ flex: 1, fontSize: '0.65rem', textDecoration: d }}>{d === 'line-through' ? 'Strike' : d === 'none' ? 'None' : d}</button>
          ))}
        </div>
      </div>
    </div>
  );
}
