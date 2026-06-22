import { useState } from 'react';

const DEFAULT_COLORS = [
  'var(--accent)', 'var(--blue)', 'var(--green)', 'var(--cyan)',
  'var(--orange)', '#a78bfa', '#f472b6', '#34d399', '#f87171', '#fbbf24'
];

export default function PieChart({ data = [], colors = [], donut = true, size = 200 }) {
  const [hovered, setHovered] = useState(null);

  const total = data.reduce((s, d) => s + d.value, 0);
  if (total === 0) return null;

  const cx = size / 2;
  const cy = size / 2;
  const radius = size / 2 - 10;
  const innerRadius = donut ? radius * 0.6 : 0;

  let startAngle = -Math.PI / 2;
  const slices = data.map((d, i) => {
    const sliceAngle = (d.value / total) * 2 * Math.PI;
    const endAngle = startAngle + sliceAngle;
    const largeArc = sliceAngle > Math.PI ? 1 : 0;

    const x1 = cx + radius * Math.cos(startAngle);
    const y1 = cy + radius * Math.sin(startAngle);
    const x2 = cx + radius * Math.cos(endAngle);
    const y2 = cy + radius * Math.sin(endAngle);

    let ix1, iy1, ix2, iy2;
    if (donut) {
      ix1 = cx + innerRadius * Math.cos(endAngle);
      iy1 = cy + innerRadius * Math.sin(endAngle);
      ix2 = cx + innerRadius * Math.cos(startAngle);
      iy2 = cy + innerRadius * Math.sin(startAngle);
    }

    const path = donut
      ? `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} L ${ix1} ${iy1} A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${ix2} ${iy2} Z`
      : `M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;

    const midAngle = startAngle + sliceAngle / 2;
    const labelRadius = donut ? (radius + innerRadius) / 2 : radius * 0.6;
    const labelX = cx + labelRadius * Math.cos(midAngle);
    const labelY = cy + labelRadius * Math.sin(midAngle);

    const color = colors[i] || DEFAULT_COLORS[i % DEFAULT_COLORS.length];
    const pct = Math.round((d.value / total) * 100);

    const slice = {
      path,
      color,
      label: d.label,
      value: d.value,
      pct,
      labelX,
      labelY,
      index: i
    };

    startAngle = endAngle;
    return slice;
  });

  return (
    <div className="pie-chart" style={{ position: 'relative', display: 'inline-block' }}>
      <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size}>
        {slices.map((s, i) => (
          <path
            key={i}
            d={s.path}
            fill={s.color}
            opacity={hovered === null || hovered === i ? 1 : 0.5}
            style={{ cursor: 'pointer', transition: 'opacity 0.2s, transform 0.2s', transform: hovered === i ? 'scale(1.03)' : 'scale(1)', transformOrigin: `${cx}px ${cy}px` }}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
          />
        ))}
        {donut && (
          <text x={cx} y={cy - 8} textAnchor="middle" fill="var(--text-200)" fontSize="20" fontWeight="700">
            {total.toLocaleString()}
          </text>
        )}
        {donut && (
          <text x={cx} y={cy + 12} textAnchor="middle" fill="var(--text-500)" fontSize="11">
            total
          </text>
        )}
      </svg>
      {hovered !== null && (
        <div style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          background: 'var(--bg-800)', border: '1px solid var(--glass-border)', borderRadius: 8,
          padding: '8px 14px', pointerEvents: 'none', textAlign: 'center', whiteSpace: 'nowrap'
        }}>
          <div style={{ color: 'var(--text-200)', fontSize: 13, fontWeight: 600 }}>{slices[hovered].label}</div>
          <div style={{ color: 'var(--text-400)', fontSize: 12 }}>{slices[hovered].value} ({slices[hovered].pct}%)</div>
        </div>
      )}
      <div className="pie-legend" style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 12px', marginTop: 8, justifyContent: 'center' }}>
        {slices.map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--text-400)' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: s.color, display: 'inline-block' }} />
            {s.label} ({s.pct}%)
          </div>
        ))}
      </div>
    </div>
  );
}
