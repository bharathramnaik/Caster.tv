import { useState, useCallback } from 'react';
import { ColorPicker, FontPicker, DataBinding, StylePresets, ElementPresets } from './properties/index.js';
import {
  Section,
  NumberProperty,
  SelectProperty,
  BooleanProperty,
  AnimationProperty,
  GradientProperty,
} from './properties/PropertyTypes.jsx';

const EASING_CURVES = {
  'linear': 'linear',
  'ease': 'ease',
  'ease-in': 'ease-in',
  'ease-out': 'ease-out',
  'ease-in-out': 'ease-in-out',
  'bounce': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  'elastic': 'cubic-bezier(0.68, -0.55, 0.27, 1.55)',
  'smooth': 'cubic-bezier(0.16, 1, 0.3, 1)',
};

function TransformControls({ element, onUpdate }) {
  const pos = element.position || {};
  const updatePosition = useCallback((key, value) => {
    onUpdate({ position: { ...element.position, [key]: value } });
  }, [element, onUpdate]);

  return (
    <Section title="Transform" icon="&#9633;">
      <div className="prop-grid-2">
        <NumberProperty label="X" value={pos.x} onChange={v => updatePosition('x', v)} compact />
        <NumberProperty label="Y" value={pos.y} onChange={v => updatePosition('y', v)} compact />
        <NumberProperty label="Width" value={pos.width} onChange={v => updatePosition('width', v)} min={1} compact />
        <NumberProperty label="Height" value={pos.height} onChange={v => updatePosition('height', v)} min={1} compact />
      </div>
      <NumberProperty label="Rotation" value={element.style?.rotation ?? 0} onChange={v => onUpdate({ style: { ...element.style, rotation: v } })} min={-360} max={360} step={1} unit="&#176;" />
      <NumberProperty label="Z-Index" value={pos.zIndex ?? 0} onChange={v => updatePosition('zIndex', v)} compact />
      <div className="prop-field">
        <label className="prop-label">Opacity</label>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input type="range" className="prop-slider" min={0} max={1} step={0.01} value={element.style?.opacity ?? 1} onChange={e => onUpdate({ style: { ...element.style, opacity: parseFloat(e.target.value) } })} style={{ flex: 1 }} />
          <span className="prop-slider-val">{(element.style?.opacity ?? 1).toFixed(2)}</span>
        </div>
      </div>
    </Section>
  );
}

function TypographyControls({ element, onUpdate }) {
  const s = element.style || {};
  const updateStyle = useCallback((key, value) => {
    onUpdate({ style: { ...element.style, [key]: value } });
  }, [element, onUpdate]);

  return (
    <Section title="Typography" icon="Aa">
      <FontPicker style={s} onChange={(newStyle) => onUpdate({ style: { ...element.style, ...newStyle } })} />
      <div className="prop-field" style={{ marginTop: 8 }}>
        <label className="prop-label">Content</label>
        <textarea className="input" value={element.content || ''} onChange={e => onUpdate({ content: e.target.value })} rows={2} style={{ resize: 'vertical' }} />
      </div>
    </Section>
  );
}

function AppearanceControls({ element, onUpdate }) {
  const s = element.style || {};
  const updateStyle = useCallback((key, value) => {
    onUpdate({ style: { ...element.style, [key]: value } });
  }, [element, onUpdate]);

  return (
    <Section title="Appearance" icon="&#9680;">
      <ColorPicker label="Background" value={s.backgroundColor || 'transparent'} onChange={v => updateStyle('backgroundColor', v)} />
      <div className="prop-grid-2">
        <NumberProperty label="Border Width" value={s.borderWidth ?? 0} onChange={v => updateStyle('borderWidth', v)} min={0} max={20} unit="px" compact />
        <NumberProperty label="Border Radius" value={s.borderRadius ?? 0} onChange={v => updateStyle('borderRadius', v)} min={0} max={200} unit="px" compact />
      </div>
      <ColorPicker label="Border Color" value={s.borderColor || '#ffffff'} onChange={v => updateStyle('borderColor', v)} />
      <GradientProperty style={s} onChange={(newStyle) => onUpdate({ style: { ...element.style, ...newStyle } })} />
    </Section>
  );
}

function ShadowControls({ element, onUpdate }) {
  const s = element.style || {};
  const updateStyle = useCallback((key, value) => {
    onUpdate({ style: { ...element.style, [key]: value } });
  }, [element, onUpdate]);

  return (
    <Section title="Shadow & Glow" defaultOpen={false} icon="&#9673;">
      <div className="prop-grid-2">
        <NumberProperty label="Shadow X" value={s.shadowX ?? 0} onChange={v => updateStyle('shadowX', v)} min={-50} max={50} compact />
        <NumberProperty label="Shadow Y" value={s.shadowY ?? 0} onChange={v => updateStyle('shadowY', v)} min={-50} max={50} compact />
      </div>
      <NumberProperty label="Shadow Blur" value={s.shadowBlur ?? 0} onChange={v => updateStyle('shadowBlur', v)} min={0} max={100} compact />
      <ColorPicker label="Shadow Color" value={s.shadowColor || 'rgba(0,0,0,0.5)'} onChange={v => updateStyle('shadowColor', v)} />
      <NumberProperty label="Glow Size" value={s.glowSize ?? 0} onChange={v => updateStyle('glowSize', v)} min={0} max={50} compact />
      <ColorPicker label="Glow Color" value={s.glowColor || '#f7c948'} onChange={v => updateStyle('glowColor', v)} />
    </Section>
  );
}

function ImageControls({ element, onUpdate }) {
  const s = element.style || {};
  const updateStyle = useCallback((key, value) => {
    onUpdate({ style: { ...element.style, [key]: value } });
  }, [element, onUpdate]);

  return (
    <Section title="Image" icon="&#128444;">
      <div className="prop-field">
        <label className="prop-label">Source URL</label>
        <input type="text" className="input" value={element.src || ''} onChange={e => onUpdate({ src: e.target.value })} placeholder="https://..." />
      </div>
      <div className="prop-field">
        <label className="prop-label">Fit</label>
        <div style={{ display: 'flex', gap: 4 }}>
          {['cover', 'contain', 'fill', 'none'].map(f => (
            <button key={f} className={`btn btn-sm ${s.objectFit === f ? 'btn-primary' : 'btn-secondary'}`} onClick={() => updateStyle('objectFit', f)} style={{ flex: 1, fontSize: '0.7rem' }}>{f}</button>
          ))}
        </div>
      </div>
    </Section>
  );
}

function BindingSection({ element, onUpdate }) {
  const [mode, setMode] = useState('full');

  return (
    <Section title="Data Binding" defaultOpen={false} icon="&#9889;">
      {mode === 'full' ? (
        <DataBinding element={element} onUpdate={onUpdate} />
      ) : (
        <>
          <div className="prop-field">
            <label className="prop-label">Bind to Variable</label>
            <input type="text" className="input" value={element.binding?.field || element.binding || ''} onChange={e => {
              const val = e.target.value;
              if (typeof element.binding === 'object') {
                onUpdate({ binding: { ...element.binding, field: val } });
              } else {
                onUpdate({ binding: val });
              }
            }} placeholder="e.g. teamA.score" />
          </div>
          <div className="prop-field">
            <label className="prop-label">Condition</label>
            <input type="text" className="input" value={element.binding?.condition || element.condition || ''} onChange={e => {
              const val = e.target.value;
              if (typeof element.binding === 'object') {
                onUpdate({ binding: { ...element.binding, condition: val } });
              } else {
                onUpdate({ condition: val });
              }
            }} placeholder="e.g. innings > 1" />
          </div>
        </>
      )}
      <button className="btn btn-sm btn-secondary" onClick={() => setMode(mode === 'full' ? 'simple' : 'full')} style={{ width: '100%', fontSize: '0.7rem', marginTop: 6 }}>
        {mode === 'full' ? 'Simple Mode' : 'Advanced Mode'}
      </button>
    </Section>
  );
}

function AnimationSection({ element, onUpdate }) {
  const anim = element.animation || {};
  const updateAnimation = useCallback((key, value) => {
    onUpdate({ animation: { ...element.animation, [key]: value } });
  }, [element, onUpdate]);

  return (
    <Section title="Animation" defaultOpen={false} icon="&#9654;">
      <AnimationProperty animation={anim} onChange={(newAnim) => onUpdate({ animation: { ...element.animation, ...newAnim } })} />
    </Section>
  );
}

function PresetsSection({ element, onUpdate, onAddElement }) {
  return (
    <Section title="Presets" defaultOpen={false} icon="&#9733;">
      <div className="prop-field">
        <label className="prop-label">Style Presets</label>
        <StylePresets
          targetType={element?.type}
          onApplyStyle={(style) => onUpdate({ style: { ...element?.style, ...style } })}
          onApplyAnimation={(anim) => onUpdate({ animation: { ...element?.animation, ...anim } })}
        />
      </div>
      {onAddElement && (
        <div className="prop-field" style={{ marginTop: 12 }}>
          <label className="prop-label">Element Presets</label>
          <ElementPresets onAddElement={onAddElement} />
        </div>
      )}
    </Section>
  );
}

export default function PropertyInspector({ element, onUpdate, onMultiUpdate, selectedCount = 1, onAddElement }) {
  const update = useCallback((patch) => {
    onUpdate?.(patch);
  }, [onUpdate]);

  if (!element) {
    return (
      <div className="prop-panel">
        <div className="prop-empty">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--text-500)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: 12, opacity: 0.4 }}>
            <path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z" />
            <path d="M13 13l6 6" />
          </svg>
          <p style={{ color: 'var(--text-500)', fontSize: '0.85rem' }}>Select an element to edit its properties.</p>
        </div>
        <PresetsSection element={null} onUpdate={() => {}} onAddElement={onAddElement} />
      </div>
    );
  }

  return (
    <div className="prop-panel">
      <div className="prop-panel-header">
        <span className="prop-element-type">{element.type}</span>
        <span className="prop-element-id">{element.id}</span>
        {selectedCount > 1 && (
          <span className="prop-multi-badge">{selectedCount} selected</span>
        )}
      </div>

      <TransformControls element={element} onUpdate={update} />

      {(element.type === 'text' || element.type === 'score' || element.type === 'ticker') && (
        <TypographyControls element={element} onUpdate={update} />
      )}

      <AppearanceControls element={element} onUpdate={update} />
      <ShadowControls element={element} onUpdate={update} />

      {element.type === 'image' && <ImageControls element={element} onUpdate={update} />}

      <BindingSection element={element} onUpdate={update} />
      <AnimationSection element={element} onUpdate={update} />
      <PresetsSection element={element} onUpdate={update} onAddElement={onAddElement} />
    </div>
  );
}
