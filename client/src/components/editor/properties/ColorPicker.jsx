import { useState, useCallback, useRef, useEffect, useMemo } from 'react';

const RECENT_KEY = 'sc_recent_colors';
const SAVED_KEY = 'sc_saved_palettes';

function loadRecent() {
  try { return JSON.parse(localStorage.getItem(RECENT_KEY)) || []; } catch { return []; }
}
function saveRecent(colors) {
  try { localStorage.setItem(RECENT_KEY, JSON.stringify(colors.slice(0, 12))); } catch {}
}
function loadSaved() {
  try { return JSON.parse(localStorage.getItem(SAVED_KEY)) || []; } catch { return []; }
}
function saveSaved(palettes) {
  try { localStorage.setItem(SAVED_KEY, JSON.stringify(palettes)); } catch {}
}

const HARMONY_COLORS = {
  complementary: (h, s, l) => [[(h + 180) % 360, s, l]],
  analogous: (h, s, l) => [[(h + 30) % 360, s, l], [(h + 330) % 360, s, l]],
  triadic: (h, s, l) => [[(h + 120) % 360, s, l], [(h + 240) % 360, s, l]],
  split: (h, s, l) => [[(h + 150) % 360, s, l], [(h + 210) % 360, s, l]],
  tetradic: (h, s, l) => [[(h + 90) % 360, s, l], [(h + 180) % 360, s, l], [(h + 270) % 360, s, l]],
};

const PALETTES = {
  broadcast: ['#f7c948', '#3b82f6', '#ef4444', '#22c55e', '#f97316', '#06b6d4', '#8b5cf6', '#ec4899'],
  neutral: ['#000000', '#1a1a2e', '#16213e', '#0f3460', '#533483', '#e94560', '#ffffff', '#f8f9fa'],
  warm: ['#f97316', '#ef4444', '#eab308', '#f59e0b', '#dc2626', '#b91c1c', '#ea580c', '#c2410c'],
  cool: ['#3b82f6', '#06b6d4', '#0ea5e9', '#2563eb', '#0284c7', '#1d4ed8', '#0891b2', '#7c3aed'],
};

function hexToRgb(hex) {
  const h = hex.replace('#', '');
  if (h.length === 3) return [parseInt(h[0]+h[0],16), parseInt(h[1]+h[1],16), parseInt(h[2]+h[2],16)];
  return [parseInt(h.substring(0,2),16), parseInt(h.substring(2,4),16), parseInt(h.substring(4,6),16)];
}

function rgbToHex(r, g, b) {
  return '#' + [r,g,b].map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2,'0')).join('');
}

function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r,g,b), min = Math.min(r,g,b);
  let h = 0, s = 0, l = (max+min)/2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d/(2-max-min) : d/(max+min);
    if (max === r) h = ((g-b)/d + (g<b?6:0)) * 60;
    else if (max === g) h = ((b-r)/d + 2) * 60;
    else h = ((r-g)/d + 4) * 60;
  }
  return [Math.round(h), Math.round(s*100), Math.round(l*100)];
}

function hslToRgb(h, s, l) {
  h /= 360; s /= 100; l /= 100;
  let r, g, b;
  if (s === 0) { r = g = b = l; }
  else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1; if (t > 1) t -= 1;
      if (t < 1/6) return p + (q-p)*6*t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q-p)*(2/3-t)*6;
      return p;
    };
    const q = l < 0.5 ? l*(1+s) : l+s-l*s;
    const p = 2*l-q;
    r = hue2rgb(p, q, h+1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h-1/3);
  }
  return [Math.round(r*255), Math.round(g*255), Math.round(b*255)];
}

function parseColor(color) {
  if (!color || color === 'transparent') return { hex: '#000000', r: 0, g: 0, b: 0, h: 0, s: 0, l: 0, a: 1, format: 'hex' };
  const rgba = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
  if (rgba) {
    const [r,g,b] = [parseInt(rgba[1]), parseInt(rgba[2]), parseInt(rgba[3])];
    const [h,s,l] = rgbToHsl(r,g,b);
    return { hex: rgbToHex(r,g,b), r, g, b, h, s, l, a: rgba[4] !== undefined ? parseFloat(rgba[4]) : 1, format: 'rgba' };
  }
  const h = color.replace('#','');
  if (/^[0-9a-fA-F]{3,8}$/.test(h)) {
    const hex = h.length <= 4 ? '#' + h.split('').map(c=>c+c).join('').slice(0,6) : '#' + h.slice(0,6);
    const a = h.length === 8 ? parseInt(h.slice(6,8),16)/255 : h.length === 4 ? parseInt(h[3]+h[3],16)/255 : 1;
    const [r,g,b] = hexToRgb(hex);
    const [hh,ss,ll] = rgbToHsl(r,g,b);
    return { hex, r, g, b, h: hh, s: ss, l: ll, a, format: 'hex' };
  }
  return { hex: '#000000', r: 0, g: 0, b: 0, h: 0, s: 0, l: 0, a: 1, format: 'hex' };
}

function toOutput(color, alpha) {
  if (alpha === undefined) alpha = color.a;
  if (alpha < 1) return `rgba(${color.r},${color.g},${color.b},${alpha})`;
  return color.hex;
}

export default function ColorPicker({ value, onChange, label }) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState('hex');
  const [color, setColor] = useState(() => parseColor(value));
  const [recentColors, setRecentColors] = useState(loadRecent);
  const [savedPalettes, setSavedPalettes] = useState(loadSaved);
  const [harmonyType, setHarmonyType] = useState('complementary');
  const pickerRef = useRef(null);

  useEffect(() => { setColor(parseColor(value)); }, [value]);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (pickerRef.current && !pickerRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const commitChange = useCallback((c, a) => {
    const next = { ...c, a: a !== undefined ? a : c.a };
    setColor(next);
    const out = toOutput(next, next.a);
    onChange(out);
    setRecentColors(prev => {
      const next = [out, ...prev.filter(c => c !== out)].slice(0, 12);
      saveRecent(next);
      return next;
    });
  }, [onChange]);

  const harmonies = useMemo(() => {
    const fn = HARMONY_COLORS[harmonyType];
    return fn ? fn(color.h, color.s, color.l) : [];
  }, [color.h, color.s, color.l, harmonyType]);

  const updateFromHex = (hex) => {
    const cleaned = hex.startsWith('#') ? hex : '#' + hex;
    if (/^#[0-9a-fA-F]{6}$/.test(cleaned)) {
      const [r,g,b] = hexToRgb(cleaned);
      const [h,s,l] = rgbToHsl(r,g,b);
      commitChange({ ...color, hex: cleaned, r, g, b, h, s, l });
    } else {
      setColor({ ...color, hex: cleaned });
    }
  };

  const updateFromRgb = (ch, val) => {
    const c = { ...color, [ch]: Math.max(0, Math.min(255, parseInt(val)||0)) };
    c.hex = rgbToHex(c.r, c.g, c.b);
    const [h,s,l] = rgbToHsl(c.r, c.g, c.b);
    c.h = h; c.s = s; c.l = l;
    commitChange(c);
  };

  const updateFromHsl = (ch, val) => {
    const c = { ...color, [ch]: parseInt(val)||0 };
    const [r,g,b] = hslToRgb(c.h, c.s, c.l);
    c.r = r; c.g = g; c.b = b;
    c.hex = rgbToHex(r,g,b);
    commitChange(c);
  };

  const savePalette = () => {
    const name = prompt('Palette name:');
    if (!name) return;
    const p = { name, colors: [color.hex, ...recentColors.slice(0, 5)] };
    const next = [...savedPalettes, p];
    setSavedPalettes(next);
    saveSaved(next);
  };

  return (
    <div className="prop-field" ref={pickerRef} style={{ position: 'relative' }}>
      {label && <label className="prop-label">{label}</label>}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <div className="prop-color-preview" style={{ background: value || '#000', cursor: 'pointer' }} onClick={() => setOpen(!open)} />
        <input type="color" className="prop-color-picker" value={color.hex} onChange={e => commitChange({ ...parseColor(e.target.value), a: color.a })} />
        <input type="text" className="input" value={value || ''} onChange={e => onChange(e.target.value)} placeholder="#000000" style={{ flex: 1, fontSize: '0.8rem' }} />
        <button className="btn btn-sm btn-secondary" onClick={() => setOpen(!open)} style={{ padding: '4px 8px', fontSize: '0.75rem' }}>...</button>
      </div>

      {open && (
        <div className="prop-color-popup" style={{
          position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 100,
          marginTop: 4, background: 'var(--bg-700)', border: '1px solid var(--glass-border)',
          borderRadius: 'var(--radius-md)', padding: 12, boxShadow: 'var(--shadow-lg)',
          maxHeight: 420, overflowY: 'auto'
        }}>
          <div style={{ display: 'flex', gap: 4, marginBottom: 10 }}>
            {['hex','rgb','hsl'].map(t => (
              <button key={t} className={`btn btn-sm ${tab===t ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setTab(t)} style={{ flex:1, fontSize:'0.7rem', padding:'4px 6px' }}>{t.toUpperCase()}</button>
            ))}
          </div>

          {tab === 'hex' && (
            <div className="prop-field" style={{ marginBottom: 8 }}>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <input type="text" className="input" value={color.hex} onChange={e => updateFromHex(e.target.value)} style={{ flex:1, fontSize:'0.8rem', fontFamily:'var(--font-mono)' }} />
                <span style={{ fontSize:'0.7rem', color:'var(--text-500)' }}>{color.hex}</span>
              </div>
            </div>
          )}

          {tab === 'rgb' && (
            <div style={{ display:'flex', flexDirection:'column', gap:6, marginBottom:8 }}>
              {[['R','r','#ef4444'],['G','g','#22c55e'],['B','b','#3b82f6']].map(([lbl,ch,c]) => (
                <div key={ch} style={{ display:'flex', alignItems:'center', gap:6 }}>
                  <span style={{ fontSize:'0.7rem', color:'var(--text-500)', width:12 }}>{lbl}</span>
                  <input type="range" min={0} max={255} value={color[ch]} onChange={e => updateFromRgb(ch, e.target.value)} style={{ flex:1, accentColor:c }} />
                  <input type="number" min={0} max={255} value={color[ch]} onChange={e => updateFromRgb(ch, e.target.value)} className="input" style={{ width:48, fontSize:'0.75rem', padding:'2px 4px' }} />
                </div>
              ))}
            </div>
          )}

          {tab === 'hsl' && (
            <div style={{ display:'flex', flexDirection:'column', gap:6, marginBottom:8 }}>
              {[['H','h',0,360,''],['S','s',0,100,'%'],['L','l',0,100,'%']].map(([lbl,ch,min,max,unit]) => (
                <div key={ch} style={{ display:'flex', alignItems:'center', gap:6 }}>
                  <span style={{ fontSize:'0.7rem', color:'var(--text-500)', width:12 }}>{lbl}</span>
                  <input type="range" min={min} max={max} value={color[ch]} onChange={e => updateFromHsl(ch, e.target.value)} style={{ flex:1 }} />
                  <span style={{ fontSize:'0.7rem', color:'var(--text-400)', width:36, textAlign:'right', fontFamily:'var(--font-mono)' }}>{color[ch]}{unit}</span>
                </div>
              ))}
            </div>
          )}

          <div className="prop-field" style={{ marginBottom: 8 }}>
            <label className="prop-label">Opacity</label>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <input type="range" min={0} max={1} step={0.01} value={color.a} onChange={e => commitChange(color, parseFloat(e.target.value))} style={{ flex:1 }} />
              <span style={{ fontSize:'0.75rem', fontFamily:'var(--font-mono)', color:'var(--text-400)', minWidth:32, textAlign:'right' }}>{Math.round(color.a*100)}%</span>
            </div>
          </div>

          <div style={{ marginBottom: 8 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:4 }}>
              <span style={{ fontSize:'0.65rem', color:'var(--text-500)', textTransform:'uppercase', letterSpacing:'0.05em' }}>Palettes</span>
              <button className="btn btn-sm btn-secondary" onClick={savePalette} style={{ fontSize:'0.65rem', padding:'2px 6px' }}>+ Save</button>
            </div>
            {Object.entries(PALETTES).map(([name, colors]) => (
              <div key={name} style={{ marginBottom:6 }}>
                <div style={{ fontSize:'0.6rem', color:'var(--text-500)', textTransform:'uppercase', marginBottom:3 }}>{name}</div>
                <div style={{ display:'flex', gap:3, flexWrap:'wrap' }}>
                  {colors.map((c,i) => (
                    <button key={i} className="prop-swatch" style={{ background:c, width:20, height:20 }} onClick={() => commitChange(parseColor(c))} title={c} />
                  ))}
                </div>
              </div>
            ))}
            {savedPalettes.map((p,i) => (
              <div key={i} style={{ marginBottom:6 }}>
                <div style={{ fontSize:'0.6rem', color:'var(--text-500)', textTransform:'uppercase', marginBottom:3 }}>{p.name}</div>
                <div style={{ display:'flex', gap:3, flexWrap:'wrap' }}>
                  {p.colors.map((c,j) => (
                    <button key={j} className="prop-swatch" style={{ background:c, width:20, height:20 }} onClick={() => commitChange(parseColor(c))} title={c} />
                  ))}
                </div>
              </div>
            ))}
          </div>

          {recentColors.length > 0 && (
            <div style={{ marginBottom: 8 }}>
              <div style={{ fontSize:'0.65rem', color:'var(--text-500)', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:4 }}>Recent</div>
              <div style={{ display:'flex', gap:3, flexWrap:'wrap' }}>
                {recentColors.map((c,i) => (
                  <button key={i} className="prop-swatch" style={{ background:c, width:20, height:20 }} onClick={() => commitChange(parseColor(c))} title={c} />
                ))}
              </div>
            </div>
          )}

          <div>
            <div style={{ fontSize:'0.65rem', color:'var(--text-500)', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:4 }}>Harmony ({harmonyType})</div>
            <div style={{ display:'flex', gap:4, marginBottom:6, flexWrap:'wrap' }}>
              {Object.keys(HARMONY_COLORS).map(ht => (
                <button key={ht} className={`btn btn-sm ${ht===harmonyType ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setHarmonyType(ht)} style={{ fontSize:'0.6rem', padding:'2px 6px' }}>{ht}</button>
              ))}
            </div>
            <div style={{ display:'flex', gap:3 }}>
              <button className="prop-swatch" style={{ background:color.hex, width:24, height:24, border:'2px solid var(--accent)' }} title="Base" />
              {harmonies.map(([h,s,l],i) => {
                const [r,g,b] = hslToRgb(h,s,l);
                return <button key={i} className="prop-swatch" style={{ background:rgbToHex(r,g,b), width:24, height:24 }} onClick={() => commitChange(parseColor(rgbToHex(r,g,b)))} title={rgbToHex(r,g,b)} />;
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
