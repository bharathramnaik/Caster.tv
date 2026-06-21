import { useState } from 'react';

let idCounter = 0;
const genId = () => `el_${Date.now()}_${++idCounter}`;

const ELEMENT_PRESETS = {
  'Lower Thirds': {
    'Basic Lower Third': {
      description: 'Name + title with background',
      elements: [
        { type: 'shape', id: genId(), position: { x: 100, y: 780, width: 600, height: 120 }, style: { backgroundColor: 'rgba(0,0,0,0.85)', borderRadius: 0, borderWidth: 0, borderColor: 'transparent' }, content: '', animation: { enter: 'slide-in-left', exit: 'slide-out-left', duration: 0.4, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' } },
        { type: 'text', id: genId(), position: { x: 120, y: 790, width: 560, height: 50 }, style: { fontSize: 32, fontWeight: '700', fontFamily: 'Teko', color: '#ffffff', textTransform: 'uppercase', letterSpacing: 0.04 }, content: 'Player Name', animation: { enter: 'fade-in', exit: 'fade-out', duration: 0.3, easing: 'ease-out' } },
        { type: 'text', id: genId(), position: { x: 120, y: 840, width: 560, height: 30 }, style: { fontSize: 16, fontWeight: '500', fontFamily: 'Inter', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: 0.08 }, content: 'Title / Team', animation: { enter: 'fade-in', exit: 'fade-out', duration: 0.3, easing: 'ease-out', delay: 0.1 } },
      ],
    },
    'Gold Lower Third': {
      description: 'Name with gold accent bar',
      elements: [
        { type: 'shape', id: genId(), position: { x: 100, y: 780, width: 8, height: 120 }, style: { backgroundColor: '#f7c948', borderRadius: 0 }, content: '' },
        { type: 'shape', id: genId(), position: { x: 108, y: 780, width: 550, height: 120 }, style: { backgroundColor: 'rgba(0,0,0,0.8)', borderRadius: 0 }, content: '' },
        { type: 'text', id: genId(), position: { x: 124, y: 790, width: 520, height: 48 }, style: { fontSize: 36, fontWeight: '800', fontFamily: 'Teko', color: '#ffffff', textTransform: 'uppercase', letterSpacing: 0.03 }, content: 'Player Name', animation: { enter: 'slide-in-left', exit: 'slide-out-left', duration: 0.35, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' } },
        { type: 'text', id: genId(), position: { x: 124, y: 840, width: 520, height: 24 }, style: { fontSize: 14, fontWeight: '600', fontFamily: 'Inter', color: '#f7c948', textTransform: 'uppercase', letterSpacing: 0.1 }, content: 'Team Name', animation: { enter: 'slide-in-left', exit: 'slide-out-left', duration: 0.35, easing: 'cubic-bezier(0.16, 1, 0.3, 1)', delay: 0.08 } },
      ],
    },
    'Right Lower Third': {
      description: 'Right-aligned name and title',
      elements: [
        { type: 'shape', id: genId(), position: { x: 1220, y: 780, width: 600, height: 120 }, style: { backgroundColor: 'rgba(0,0,0,0.85)', borderRadius: 0, clipPath: 'polygon(8% 0, 100% 0, 100% 100%, 0 100%)' }, content: '' },
        { type: 'text', id: genId(), position: { x: 1260, y: 790, width: 540, height: 50 }, style: { fontSize: 32, fontWeight: '700', fontFamily: 'Teko', color: '#ffffff', textTransform: 'uppercase', textAlign: 'right', letterSpacing: 0.04 }, content: 'Player Name', animation: { enter: 'slide-in-right', exit: 'slide-out-right', duration: 0.35, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' } },
        { type: 'text', id: genId(), position: { x: 1260, y: 840, width: 540, height: 30 }, style: { fontSize: 16, fontWeight: '500', fontFamily: 'Inter', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', textAlign: 'right', letterSpacing: 0.08 }, content: 'Title / Team', animation: { enter: 'slide-in-right', exit: 'slide-out-right', duration: 0.35, easing: 'cubic-bezier(0.16, 1, 0.3, 1)', delay: 0.08 } },
      ],
    },
  },
  'Score Displays': {
    'Team Score': {
      description: 'Team name + score with accent',
      elements: [
        { type: 'text', id: genId(), position: { x: 860, y: 400, width: 200, height: 60 }, style: { fontSize: 48, fontWeight: '900', fontFamily: 'Teko', color: '#ffffff', textAlign: 'center', lineHeight: 1 }, content: '185/4', animation: { enter: 'scale-in', exit: 'scale-out', duration: 0.4, easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)' } },
        { type: 'text', id: genId(), position: { x: 860, y: 460, width: 200, height: 30 }, style: { fontSize: 18, fontWeight: '600', fontFamily: 'Teko', color: 'rgba(255,255,255,0.6)', textAlign: 'center', textTransform: 'uppercase', letterSpacing: 0.1 }, content: 'OVERS 18.2', animation: { enter: 'fade-in', exit: 'fade-out', duration: 0.3, easing: 'ease-out', delay: 0.1 } },
      ],
    },
    'VS Display': {
      description: 'Team A vs Team B score',
      elements: [
        { type: 'text', id: genId(), position: { x: 660, y: 420, width: 200, height: 50 }, style: { fontSize: 36, fontWeight: '800', fontFamily: 'Teko', color: '#f7c948', textAlign: 'right', textTransform: 'uppercase' }, content: 'INDIA', animation: { enter: 'slide-in-left', exit: 'slide-out-left', duration: 0.35 } },
        { type: 'text', id: genId(), position: { x: 860, y: 415, width: 200, height: 60 }, style: { fontSize: 56, fontWeight: '900', fontFamily: 'Teko', color: '#ffffff', textAlign: 'center', lineHeight: 1 }, content: 'VS', animation: { enter: 'scale-in', exit: 'scale-out', duration: 0.4, easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)' } },
        { type: 'text', id: genId(), position: { x: 1060, y: 420, width: 200, height: 50 }, style: { fontSize: 36, fontWeight: '800', fontFamily: 'Teko', color: '#3b82f6', textAlign: 'left', textTransform: 'uppercase' }, content: 'AUSTRALIA', animation: { enter: 'slide-in-right', exit: 'slide-out-right', duration: 0.35 } },
      ],
    },
  },
  'Player Cards': {
    'Batter Card': {
      description: 'Batter stats card',
      elements: [
        { type: 'shape', id: genId(), position: { x: 660, y: 300, width: 600, height: 480 }, style: { backgroundColor: 'rgba(10,12,22,0.95)', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', shadowBlur: 20, shadowColor: 'rgba(0,0,0,0.6)' }, content: '' },
        { type: 'image', id: genId(), position: { x: 660, y: 300, width: 600, height: 280 }, style: { objectFit: 'cover', borderRadius: '16px 16px 0 0' }, content: '', src: '' },
        { type: 'text', id: genId(), position: { x: 680, y: 600, width: 560, height: 40 }, style: { fontSize: 28, fontWeight: '800', fontFamily: 'Teko', color: '#ffffff', textTransform: 'uppercase' }, content: 'Batter Name', animation: { enter: 'fade-in', exit: 'fade-out', duration: 0.3 } },
        { type: 'text', id: genId(), position: { x: 680, y: 640, width: 560, height: 24 }, style: { fontSize: 14, fontWeight: '600', fontFamily: 'Inter', color: '#f7c948', textTransform: 'uppercase', letterSpacing: 0.1 }, content: 'TEAM NAME', animation: { enter: 'fade-in', exit: 'fade-out', duration: 0.3, delay: 0.05 } },
      ],
    },
    'Bowler Card': {
      description: 'Bowler stats card',
      elements: [
        { type: 'shape', id: genId(), position: { x: 660, y: 300, width: 600, height: 480 }, style: { backgroundColor: 'rgba(10,12,22,0.95)', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', shadowBlur: 20, shadowColor: 'rgba(0,0,0,0.6)' }, content: '' },
        { type: 'image', id: genId(), position: { x: 660, y: 300, width: 600, height: 280 }, style: { objectFit: 'cover', borderRadius: '16px 16px 0 0' }, content: '', src: '' },
        { type: 'text', id: genId(), position: { x: 680, y: 600, width: 560, height: 40 }, style: { fontSize: 28, fontWeight: '800', fontFamily: 'Teko', color: '#ffffff', textTransform: 'uppercase' }, content: 'Bowler Name', animation: { enter: 'fade-in', exit: 'fade-out', duration: 0.3 } },
        { type: 'text', id: genId(), position: { x: 680, y: 640, width: 560, height: 24 }, style: { fontSize: 14, fontWeight: '600', fontFamily: 'Inter', color: '#ef4444', textTransform: 'uppercase', letterSpacing: 0.1 }, content: 'FIGURES', animation: { enter: 'fade-in', exit: 'fade-out', duration: 0.3, delay: 0.05 } },
      ],
    },
  },
  'Timer Displays': {
    'Countdown Timer': {
      description: 'Large countdown digits',
      elements: [
        { type: 'text', id: genId(), position: { x: 760, y: 380, width: 400, height: 120 }, style: { fontSize: 96, fontWeight: '900', fontFamily: 'Teko', color: '#ffffff', textAlign: 'center', lineHeight: 1, letterSpacing: 0.05 }, content: '00:00', animation: { enter: 'fade-in', exit: 'fade-out', duration: 0.5 } },
        { type: 'text', id: genId(), position: { x: 760, y: 500, width: 400, height: 30 }, style: { fontSize: 16, fontWeight: '600', fontFamily: 'Inter', color: 'rgba(255,255,255,0.5)', textAlign: 'center', textTransform: 'uppercase', letterSpacing: 0.15 }, content: 'TIME REMAINING', animation: { enter: 'fade-in', exit: 'fade-out', duration: 0.3, delay: 0.1 } },
      ],
    },
    'Innings Clock': {
      description: 'Clock with innings label',
      elements: [
        { type: 'shape', id: genId(), position: { x: 860, y: 420, width: 200, height: 80 }, style: { backgroundColor: 'rgba(0,0,0,0.8)', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(247,201,72,0.3)' }, content: '' },
        { type: 'text', id: genId(), position: { x: 860, y: 425, width: 200, height: 50 }, style: { fontSize: 36, fontWeight: '900', fontFamily: 'Teko', color: '#f7c948', textAlign: 'center', lineHeight: 1 }, content: '14:32', animation: { enter: 'fade-in', exit: 'fade-out', duration: 0.3 } },
        { type: 'text', id: genId(), position: { x: 860, y: 472, width: 200, height: 20 }, style: { fontSize: 10, fontWeight: '700', fontFamily: 'Inter', color: 'rgba(255,255,255,0.4)', textAlign: 'center', textTransform: 'uppercase', letterSpacing: 0.15 }, content: 'INNINGS 2' },
      ],
    },
  },
  'Social Media': {
    'Social Handle': {
      description: 'Platform icon + handle',
      elements: [
        { type: 'shape', id: genId(), position: { x: 100, y: 60, width: 200, height: 40 }, style: { backgroundColor: 'rgba(0,0,0,0.7)', borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' }, content: '' },
        { type: 'text', id: genId(), position: { x: 110, y: 64, width: 180, height: 32 }, style: { fontSize: 14, fontWeight: '600', fontFamily: 'Inter', color: '#ffffff', textAlign: 'center', lineHeight: 1.3 }, content: '@handle', animation: { enter: 'fade-in', exit: 'fade-out', duration: 0.3 } },
      ],
    },
    'Follower Count': {
      description: 'Social platform + count',
      elements: [
        { type: 'shape', id: genId(), position: { x: 100, y: 540, width: 180, height: 60 }, style: { backgroundColor: 'rgba(0,0,0,0.8)', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }, content: '' },
        { type: 'text', id: genId(), position: { x: 110, y: 544, width: 160, height: 30 }, style: { fontSize: 22, fontWeight: '800', fontFamily: 'Teko', color: '#ffffff', textAlign: 'center', lineHeight: 1 }, content: '1.2M', animation: { enter: 'scale-in', exit: 'scale-out', duration: 0.3 } },
        { type: 'text', id: genId(), position: { x: 110, y: 574, width: 160, height: 20 }, style: { fontSize: 10, fontWeight: '600', fontFamily: 'Inter', color: 'rgba(255,255,255,0.5)', textAlign: 'center', textTransform: 'uppercase', letterSpacing: 0.1 }, content: 'FOLLOWERS' },
      ],
    },
  },
};

export default function ElementPresets({ onAddElement }) {
  const [activeCategory, setActiveCategory] = useState('Lower Thirds');
  const categories = Object.keys(ELEMENT_PRESETS);

  const handleAdd = (presetKey) => {
    const preset = ELEMENT_PRESETS[activeCategory][presetKey];
    if (!preset || !onAddElement) return;
    preset.elements.forEach(el => {
      onAddElement({
        ...el,
        id: genId(),
      });
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
        {categories.map(cat => (
          <button key={cat} className={`btn btn-sm ${activeCategory === cat ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveCategory(cat)} style={{ fontSize: '0.68rem', padding: '4px 10px' }}>{cat}</button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {Object.entries(ELEMENT_PRESETS[activeCategory]).map(([name, preset]) => (
          <button key={name} onClick={() => handleAdd(name)} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            width: '100%', padding: '10px', border: '1px solid var(--glass-border)',
            borderRadius: 'var(--radius-sm)', cursor: 'pointer',
            background: 'var(--bg-700)', transition: 'all 0.15s', textAlign: 'left'
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.background = 'var(--bg-600)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--glass-border)'; e.currentTarget.style.background = 'var(--bg-700)'; }}
          >
            <div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-200)', fontWeight: 600 }}>{name}</div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-500)', marginTop: 2 }}>{preset.description}</div>
              <div style={{ fontSize: '0.6rem', color: 'var(--text-500)', marginTop: 2 }}>{preset.elements.length} element{preset.elements.length > 1 ? 's' : ''}</div>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--accent)', opacity: 0.7 }}>+</span>
          </button>
        ))}
      </div>
    </div>
  );
}
