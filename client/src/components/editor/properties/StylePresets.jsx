import { useState } from 'react';

const STYLE_PRESETS = {
  'Text Styles': {
    Heading: {
      style: { fontSize: 48, fontWeight: '800', fontFamily: 'Teko', color: '#ffffff', letterSpacing: -0.02, textTransform: 'uppercase' },
      preview: 'Heading',
    },
    Subheading: {
      style: { fontSize: 28, fontWeight: '600', fontFamily: 'Outfit', color: 'rgba(255,255,255,0.85)', letterSpacing: 0.02 },
      preview: 'Subheading',
    },
    Body: {
      style: { fontSize: 16, fontWeight: '400', fontFamily: 'Inter', color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 },
      preview: 'Body text',
    },
    Caption: {
      style: { fontSize: 12, fontWeight: '500', fontFamily: 'Inter', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: 0.08 },
      preview: 'Caption',
    },
    Score: {
      style: { fontSize: 72, fontWeight: '900', fontFamily: 'Teko', color: '#f7c948', lineHeight: 1 },
      preview: '999',
    },
    Player: {
      style: { fontSize: 24, fontWeight: '700', fontFamily: 'Teko', color: '#ffffff', textTransform: 'uppercase', letterSpacing: 0.04 },
      preview: 'Player Name',
    },
  },
  'Button Styles': {
    Primary: {
      style: { backgroundColor: '#f7c948', color: '#000000', borderRadius: 8, padding: '12px 24px', fontSize: 14, fontWeight: '700', fontFamily: 'Outfit' },
      preview: 'Primary Button',
    },
    Secondary: {
      style: { backgroundColor: 'rgba(255,255,255,0.1)', color: '#ffffff', borderRadius: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', padding: '12px 24px', fontSize: 14, fontWeight: '600', fontFamily: 'Outfit' },
      preview: 'Secondary Button',
    },
    Outline: {
      style: { backgroundColor: 'transparent', color: '#f7c948', borderRadius: 8, borderWidth: 2, borderColor: '#f7c948', padding: '10px 24px', fontSize: 14, fontWeight: '600', fontFamily: 'Outfit' },
      preview: 'Outline Button',
    },
    Danger: {
      style: { backgroundColor: '#ef4444', color: '#ffffff', borderRadius: 8, padding: '12px 24px', fontSize: 14, fontWeight: '700', fontFamily: 'Outfit' },
      preview: 'Danger Button',
    },
    Pill: {
      style: { backgroundColor: '#3b82f6', color: '#ffffff', borderRadius: 9999, padding: '10px 28px', fontSize: 13, fontWeight: '600', fontFamily: 'Inter' },
      preview: 'Pill Button',
    },
  },
  'Card Styles': {
    Glass: {
      style: { backgroundColor: 'rgba(26, 34, 53, 0.55)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', borderRadius: 16, shadowBlur: 16, shadowColor: 'rgba(0,0,0,0.5)' },
      preview: 'Glass Card',
    },
    Solid: {
      style: { backgroundColor: '#111827', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', borderRadius: 12, shadowBlur: 8, shadowColor: 'rgba(0,0,0,0.3)' },
      preview: 'Solid Card',
    },
    Gradient: {
      style: { backgroundColor: 'linear-gradient(135deg, #1a1a2e, #16213e)', borderRadius: 16, shadowBlur: 20, shadowColor: 'rgba(0,0,0,0.6)' },
      preview: 'Gradient Card',
    },
    'Glass Gold': {
      style: { backgroundColor: 'rgba(247, 201, 72, 0.08)', borderWidth: 1, borderColor: 'rgba(247, 201, 72, 0.2)', borderRadius: 16, shadowBlur: 16, shadowColor: 'rgba(247,201,72,0.15)' },
      preview: 'Glass Gold Card',
    },
    Minimal: {
      style: { backgroundColor: 'transparent', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderRadius: 8 },
      preview: 'Minimal Card',
    },
  },
  'Shape Styles': {
    Rounded: {
      style: { backgroundColor: '#3b82f6', borderRadius: 16, shadowBlur: 12, shadowColor: 'rgba(59,130,246,0.3)' },
      preview: 'Rounded',
    },
    Sharp: {
      style: { backgroundColor: '#ef4444', borderRadius: 0 },
      preview: 'Sharp',
    },
    Circle: {
      style: { backgroundColor: '#22c55e', borderRadius: 9999 },
      preview: 'Circle',
    },
    'Rounded Rect': {
      style: { backgroundColor: '#8b5cf6', borderRadius: 8 },
      preview: 'Rounded Rect',
    },
    Shadow: {
      style: { backgroundColor: '#f97316', borderRadius: 12, shadowBlur: 30, shadowColor: 'rgba(249,115,22,0.4)' },
      preview: 'Shadow Shape',
    },
    'Gold Ring': {
      style: { backgroundColor: 'transparent', borderWidth: 3, borderColor: '#f7c948', borderRadius: 9999, shadowBlur: 20, shadowColor: 'rgba(247,201,72,0.3)' },
      preview: 'Gold Ring',
    },
  },
  'Animation Styles': {
    'Fade In': {
      animation: { enter: 'fade-in', exit: 'fade-out', duration: 0.5, easing: 'ease-out' },
      preview: 'Fade In/Out',
    },
    'Slide Left': {
      animation: { enter: 'slide-in-left', exit: 'slide-out-left', duration: 0.4, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' },
      preview: 'Slide Left',
    },
    'Bounce': {
      animation: { enter: 'bounce-in', exit: 'fade-out', duration: 0.6, easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)' },
      preview: 'Bounce',
    },
    'Scale': {
      animation: { enter: 'scale-in', exit: 'scale-out', duration: 0.3, easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)' },
      preview: 'Scale In/Out',
    },
    'Wipe': {
      animation: { enter: 'wipe-in-right', exit: 'fade-out', duration: 0.5, easing: 'ease-in-out' },
      preview: 'Wipe In',
    },
    Typewriter: {
      animation: { enter: 'typewriter', exit: 'fade-out', duration: 1.2, easing: 'linear' },
      preview: 'Typewriter',
    },
  },
};

export default function StylePresets({ onApplyStyle, onApplyAnimation, targetType }) {
  const [activeCategory, setActiveCategory] = useState('Text Styles');
  const categories = Object.keys(STYLE_PRESETS);

  const isApplicable = (category, preset) => {
    if (!targetType) return true;
    if (category === 'Text Styles' && !['text', 'score', 'ticker'].includes(targetType)) return false;
    if (category === 'Button Styles' && targetType !== 'shape') return false;
    if (category === 'Card Styles' && targetType !== 'shape') return false;
    return true;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
        {categories.map(cat => (
          <button key={cat} className={`btn btn-sm ${activeCategory === cat ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveCategory(cat)} style={{ fontSize: '0.68rem', padding: '4px 10px' }}>{cat}</button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {Object.entries(STYLE_PRESETS[activeCategory]).map(([name, preset]) => {
          const applicable = isApplicable(activeCategory, name);
          const hasStyle = !!preset.style;
          const hasAnimation = !!preset.animation;
          return (
            <button key={name} disabled={!applicable} onClick={() => {
              if (hasStyle && onApplyStyle) onApplyStyle(preset.style);
              if (hasAnimation && onApplyAnimation) onApplyAnimation(preset.animation);
            }} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              width: '100%', padding: '8px 10px', border: '1px solid var(--glass-border)',
              borderRadius: 'var(--radius-sm)', cursor: applicable ? 'pointer' : 'not-allowed',
              background: 'var(--bg-700)', opacity: applicable ? 1 : 0.4,
              transition: 'all 0.15s', textAlign: 'left'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: preset.style?.borderRadius === 9999 ? '50%' : 6,
                  background: hasStyle ? (preset.style.backgroundColor || 'var(--bg-600)') : 'var(--bg-600)',
                  border: preset.style?.borderWidth ? `${preset.style.borderWidth}px solid ${preset.style.borderColor || 'var(--glass-border)'}` : '1px solid var(--glass-border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.5rem', color: preset.style?.color || 'var(--text-400)', fontWeight: 700,
                  fontFamily: preset.style?.fontFamily || 'inherit'
                }}>
                  {hasStyle ? (preset.style.fontSize > 30 ? 'Aa' : '') : '\u25B6'}
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-200)', fontWeight: 600 }}>{name}</div>
                  <div style={{ fontSize: '0.6rem', color: 'var(--text-500)' }}>
                    {hasStyle ? 'Style preset' : 'Animation preset'}
                    {preset.animation && ` (${preset.animation.duration}s)`}
                  </div>
                </div>
              </div>
              <span style={{ fontSize: '0.65rem', color: 'var(--accent)', opacity: 0.6 }}>{hasStyle ? '\u2192' : '\u25B6'}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
