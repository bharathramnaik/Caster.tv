import { useState, useCallback } from 'react';

const FONT_FAMILIES = [
  'Outfit', 'Inter', 'Teko', 'Rajdhani', 'Montserrat', 'Roboto',
  'Open Sans', 'Lato', 'Poppins', 'Raleway', 'Nunito', 'Oswald',
  'Bebas Neue', 'Playfair Display', 'Merriweather', 'Source Code Pro'
];

const EASING_CURVES = {
  'linear': 'linear',
  'ease': 'ease',
  'ease-in': 'ease-in',
  'ease-out': 'ease-out',
  'ease-in-out': 'ease-in-out',
  'bounce': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  'elastic': 'cubic-bezier(0.68, -0.55, 0.27, 1.55)',
  'smooth': 'cubic-bezier(0.16, 1, 0.3, 1)'
};

const PALETTES = {
  broadcast: ['#f7c948', '#3b82f6', '#ef4444', '#22c55e', '#f97316', '#06b6d4', '#8b5cf6', '#ec4899'],
  neutral: ['#000000', '#1a1a2e', '#16213e', '#0f3460', '#533483', '#e94560', '#ffffff', '#f8f9fa'],
  gradients: [
    'linear-gradient(135deg, #f7c948, #e5b800)',
    'linear-gradient(135deg, #3b82f6, #2563eb)',
    'linear-gradient(135deg, #ef4444, #dc2626)',
    'linear-gradient(135deg, #22c55e, #16a34a)',
    'linear-gradient(135deg, #8b5cf6, #7c3aed)',
    'linear-gradient(135deg, #f97316, #ea580c)'
  ]
};

function Section({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="prop-section">
      <button className="prop-section-header" onClick={() => setOpen(!open)}>
        <span>{title}</span>
        <span style={{ transform: open ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }}>▾</span>
      </button>
      {open && <div className="prop-section-body">{children}</div>}
    </div>
  );
}

function NumberInput({ label, value, onChange, min, max, step = 1, unit }) {
  return (
    <div className="prop-field">
      <label className="prop-label">{label}</label>
      <div className="prop-number-row">
        <input
          type="number"
          className="input"
          value={value ?? 0}
          min={min}
          max={max}
          step={step}
          onChange={e => onChange(parseFloat(e.target.value) || 0)}
          style={{ flex: 1 }}
        />
        {unit && <span className="prop-unit">{unit}</span>}
      </div>
    </div>
  );
}

function ColorInput({ label, value, onChange }) {
  const [showPalette, setShowPalette] = useState(false);
  return (
    <div className="prop-field">
      <label className="prop-label">{label}</label>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <div className="prop-color-preview" style={{ background: value || '#000' }} />
        <input
          type="color"
          className="prop-color-picker"
          value={value || '#000000'}
          onChange={e => onChange(e.target.value)}
        />
        <input
          type="text"
          className="input"
          value={value || ''}
          onChange={e => onChange(e.target.value)}
          placeholder="#000000"
          style={{ flex: 1, fontSize: '0.8rem' }}
        />
        <button
          className="btn btn-sm btn-secondary"
          onClick={() => setShowPalette(!showPalette)}
          style={{ padding: '4px 8px', fontSize: '0.75rem' }}
        >🎨</button>
      </div>
      {showPalette && (
        <div className="prop-palette">
          {Object.entries(PALETTES).map(([name, colors]) => (
            <div key={name} style={{ marginBottom: 8 }}>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-500)', textTransform: 'uppercase', marginBottom: 4 }}>{name}</div>
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                {colors.map((c, i) => (
                  <button
                    key={i}
                    className="prop-swatch"
                    style={{ background: c }}
                    onClick={() => { onChange(c); setShowPalette(false); }}
                    title={c}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SliderInput({ label, value, onChange, min = 0, max = 1, step = 0.01 }) {
  return (
    <div className="prop-field">
      <label className="prop-label">{label}</label>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <input
          type="range"
          className="prop-slider"
          min={min} max={max} step={step}
          value={value ?? 1}
          onChange={e => onChange(parseFloat(e.target.value))}
          style={{ flex: 1 }}
        />
        <span className="prop-slider-val">{typeof value === 'number' ? value.toFixed(2) : value}</span>
      </div>
    </div>
  );
}

export default function PropertyPanel({ element, onUpdate }) {
  const update = useCallback((key, value) => {
    onUpdate({ [key]: value });
  }, [onUpdate]);

  const updateStyle = useCallback((key, value) => {
    onUpdate({ style: { ...element?.style, [key]: value } });
  }, [element, onUpdate]);

  const updatePosition = useCallback((key, value) => {
    onUpdate({ position: { ...element?.position, [key]: value } });
  }, [element, onUpdate]);

  const updateAnimation = useCallback((key, value) => {
    onUpdate({ animation: { ...element?.animation, [key]: value } });
  }, [element, onUpdate]);

  if (!element) {
    return (
      <div className="prop-panel">
        <div className="prop-empty">
          <div style={{ fontSize: 32, marginBottom: 12 }}>🎯</div>
          <p style={{ color: 'var(--text-400)', fontSize: '0.85rem' }}>Select an element on the canvas to edit its properties.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="prop-panel">
      <div className="prop-panel-header">
        <span className="prop-element-type">{element.type}</span>
        <span className="prop-element-id">{element.id}</span>
      </div>

      {/* Position & Size */}
      <Section title="Position & Size">
        <div className="prop-grid-2">
          <NumberInput label="X" value={element.position?.x} onChange={v => updatePosition('x', v)} />
          <NumberInput label="Y" value={element.position?.y} onChange={v => updatePosition('y', v)} />
          <NumberInput label="Width" value={element.position?.width} onChange={v => updatePosition('width', v)} min={1} />
          <NumberInput label="Height" value={element.position?.height} onChange={v => updatePosition('height', v)} min={1} />
        </div>
        <NumberInput label="Z-Index" value={element.position?.zIndex ?? 0} onChange={v => updatePosition('zIndex', v)} />
        <SliderInput label="Rotation" value={element.style?.rotation ?? 0} onChange={v => updateStyle('rotation', v)} min={-360} max={360} />
      </Section>

      {/* Typography */}
      {(element.type === 'text' || element.type === 'score' || element.type === 'ticker') && (
        <Section title="Typography">
          <div className="prop-field">
            <label className="prop-label">Font Family</label>
            <select
              className="select"
              value={element.style?.fontFamily || 'Outfit'}
              onChange={e => updateStyle('fontFamily', e.target.value)}
            >
              {FONT_FAMILIES.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
          <div className="prop-grid-2">
            <NumberInput label="Font Size" value={element.style?.fontSize ?? 24} onChange={v => updateStyle('fontSize', v)} min={8} max={200} unit="px" />
            <div className="prop-field">
              <label className="prop-label">Weight</label>
              <select
                className="select"
                value={element.style?.fontWeight ?? '400'}
                onChange={e => updateStyle('fontWeight', e.target.value)}
              >
                {['300', '400', '500', '600', '700', '800', '900'].map(w => (
                  <option key={w} value={w}>{w}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="prop-grid-2">
            <div className="prop-field">
              <label className="prop-label">Align</label>
              <div style={{ display: 'flex', gap: 4 }}>
                {['left', 'center', 'right'].map(a => (
                  <button
                    key={a}
                    className={`btn btn-sm ${element.style?.textAlign === a ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => updateStyle('textAlign', a)}
                    style={{ flex: 1, fontSize: '0.75rem' }}
                  >{a.charAt(0).toUpperCase() + a.slice(1)}</button>
                ))}
              </div>
            </div>
            <NumberInput label="Line Height" value={element.style?.lineHeight ?? 1.2} onChange={v => updateStyle('lineHeight', v)} min={0.5} max={3} step={0.1} />
          </div>
          <SliderInput label="Letter Spacing" value={element.style?.letterSpacing ?? 0} onChange={v => updateStyle('letterSpacing', v)} min={-10} max={20} step={0.5} />
          <ColorInput label="Text Color" value={element.style?.color || '#ffffff'} onChange={v => updateStyle('color', v)} />
          <div className="prop-field">
            <label className="prop-label">Text Transform</label>
            <div style={{ display: 'flex', gap: 4 }}>
              {['none', 'uppercase', 'lowercase', 'capitalize'].map(t => (
                <button
                  key={t}
                  className={`btn btn-sm ${element.style?.textTransform === t ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => updateStyle('textTransform', t)}
                  style={{ flex: 1, fontSize: '0.7rem' }}
                >{t === 'none' ? 'Aa' : t.charAt(0).toUpperCase()}</button>
              ))}
            </div>
          </div>
          <div className="prop-field">
            <label className="prop-label">Content</label>
            <textarea
              className="input"
              value={element.content || ''}
              onChange={e => update('content', e.target.value)}
              rows={2}
              style={{ resize: 'vertical' }}
            />
          </div>
        </Section>
      )}

      {/* Appearance */}
      <Section title="Appearance">
        <ColorInput label="Background" value={element.style?.backgroundColor || 'transparent'} onChange={v => updateStyle('backgroundColor', v)} />
        <ColorInput label="Border Color" value={element.style?.borderColor || '#ffffff'} onChange={v => updateStyle('borderColor', v)} />
        <div className="prop-grid-2">
          <NumberInput label="Border Width" value={element.style?.borderWidth ?? 0} onChange={v => updateStyle('borderWidth', v)} min={0} max={20} unit="px" />
          <NumberInput label="Border Radius" value={element.style?.borderRadius ?? 0} onChange={v => updateStyle('borderRadius', v)} min={0} max={200} unit="px" />
        </div>
        <SliderInput label="Opacity" value={element.style?.opacity ?? 1} onChange={v => updateStyle('opacity', v)} />
      </Section>

      {/* Shadow & Glow */}
      <Section title="Shadow & Glow" defaultOpen={false}>
        <SliderInput label="Shadow X" value={element.style?.shadowX ?? 0} onChange={v => updateStyle('shadowX', v)} min={-50} max={50} />
        <SliderInput label="Shadow Y" value={element.style?.shadowY ?? 0} onChange={v => updateStyle('shadowY', v)} min={-50} max={50} />
        <SliderInput label="Shadow Blur" value={element.style?.shadowBlur ?? 0} onChange={v => updateStyle('shadowBlur', v)} min={0} max={100} />
        <ColorInput label="Shadow Color" value={element.style?.shadowColor || 'rgba(0,0,0,0.5)'} onChange={v => updateStyle('shadowColor', v)} />
        <SliderInput label="Glow Size" value={element.style?.glowSize ?? 0} onChange={v => updateStyle('glowSize', v)} min={0} max={50} />
        <ColorInput label="Glow Color" value={element.style?.glowColor || '#f7c948'} onChange={v => updateStyle('glowColor', v)} />
      </Section>

      {/* Image */}
      {element.type === 'image' && (
        <Section title="Image">
          <div className="prop-field">
            <label className="prop-label">Source URL</label>
            <input
              type="text"
              className="input"
              value={element.src || ''}
              onChange={e => update('src', e.target.value)}
              placeholder="https://..."
            />
          </div>
          <div className="prop-field">
            <label className="prop-label">Fit</label>
            <div style={{ display: 'flex', gap: 4 }}>
              {['cover', 'contain', 'fill', 'none'].map(f => (
                <button
                  key={f}
                  className={`btn btn-sm ${element.style?.objectFit === f ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => updateStyle('objectFit', f)}
                  style={{ flex: 1, fontSize: '0.7rem' }}
                >{f}</button>
              ))}
            </div>
          </div>
        </Section>
      )}

      {/* Binding */}
      <Section title="Data Binding" defaultOpen={false}>
        <div className="prop-field">
          <label className="prop-label">Bind to Variable</label>
          <input
            type="text"
            className="input"
            value={element.binding || ''}
            onChange={e => update('binding', e.target.value)}
            placeholder="e.g. teamA.score"
          />
        </div>
        <div className="prop-field">
          <label className="prop-label">Condition</label>
          <input
            type="text"
            className="input"
            value={element.condition || ''}
            onChange={e => update('condition', e.target.value)}
            placeholder="e.g. innings > 1"
          />
        </div>
      </Section>

      {/* Animation */}
      <Section title="Animation" defaultOpen={false}>
        <div className="prop-field">
          <label className="prop-label">Enter Preset</label>
          <select
            className="select"
            value={element.animation?.enter || 'fade-in'}
            onChange={e => updateAnimation('enter', e.target.value)}
          >
            {['fade-in', 'slide-in-left', 'slide-in-right', 'slide-in-top', 'slide-in-bottom',
              'bounce-in', 'scale-in', 'wipe-in-right', 'typewriter'].map(a => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </div>
        <div className="prop-field">
          <label className="prop-label">Exit Preset</label>
          <select
            className="select"
            value={element.animation?.exit || 'fade-out'}
            onChange={e => updateAnimation('exit', e.target.value)}
          >
            {['fade-out', 'slide-out-left', 'slide-out-right', 'slide-out-top', 'slide-out-bottom',
              'scale-out', 'wipe-out-left'].map(a => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </div>
        <NumberInput label="Duration" value={element.animation?.duration ?? 0.5} onChange={v => updateAnimation('duration', v)} min={0.1} max={5} step={0.1} unit="s" />
        <div className="prop-field">
          <label className="prop-label">Easing</label>
          <select
            className="select"
            value={element.animation?.easing || 'ease-out'}
            onChange={e => updateAnimation('easing', e.target.value)}
          >
            {Object.entries(EASING_CURVES).map(([name, val]) => (
              <option key={val} value={val}>{name}</option>
            ))}
          </select>
        </div>
      </Section>
    </div>
  );
}
