import { useEffect, useState, useRef } from 'react';

const DEFAULT_COLORS = [
  'var(--accent)', 'var(--blue)', 'var(--green)', 'var(--cyan)',
  'var(--orange)', '#a78bfa', '#f472b6', '#34d399'
];

export default function BarChart({ data = [], horizontal = false, colors = [], height = 200 }) {
  const [animated, setAnimated] = useState(false);
  const [hovered, setHovered] = useState(null);
  const svgRef = useRef(null);

  const maxValue = Math.max(...data.map(d => d.value), 1);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 50);
    return () => clearTimeout(t);
  }, []);

  if (data.length === 0) return null;

  if (horizontal) {
    const svgH = Math.max(data.length * 32 + 20, 100);
    const svgW = 500;
    const barH = 20;
    const gap = 12;
    const leftPad = 100;
    const rightPad = 50;

    return (
      <div style={{ position: 'relative' }}>
        <svg ref={svgRef} viewBox={`0 0 ${svgW} ${svgH}`} width="100%" height={svgH}>
          {data.map((item, i) => {
            const y = 10 + i * (barH + gap);
            const barW = ((item.value / maxValue) * (svgW - leftPad - rightPad));
            const color = colors[i] || DEFAULT_COLORS[i % DEFAULT_COLORS.length];
            return (
              <g key={i} onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)} style={{ cursor: 'pointer' }}>
                <text x={leftPad - 8} y={y + barH / 2 + 4} textAnchor="end" fill="var(--text-400)" fontSize="11">
                  {item.label}
                </text>
                <rect x={leftPad} y={y} width={animated ? barW : 0} height={barH} rx="4" fill={color}
                  opacity={hovered !== null && hovered !== i ? 0.5 : 1}
                  style={{ transition: `width 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${i * 0.05}s, opacity 0.2s` }}
                />
                <text x={leftPad + barW + 6} y={y + barH / 2 + 4} fill="var(--text-300)" fontSize="11" fontWeight="600"
                  opacity={animated ? 1 : 0} style={{ transition: `opacity 0.3s ${0.3 + i * 0.05}s` }}>
                  {item.value}
                </text>
              </g>
            );
          })}
        </svg>
        {hovered !== null && (
          <div style={{
            position: 'absolute', top: 8, right: 8,
            background: 'var(--bg-700)', border: '1px solid var(--glass-border)',
            borderRadius: 6, padding: '4px 10px', fontSize: 12, color: 'var(--text-200)',
            pointerEvents: 'none'
          }}>
            {data[hovered].label}: <strong>{data[hovered].value}</strong>
          </div>
        )}
      </div>
    );
  }

  const svgW = Math.max(data.length * 50 + 40, 200);
  const barW = 36;
  const gap = 14;
  const topPad = 24;
  const bottomPad = 30;

  return (
    <div style={{ position: 'relative' }}>
      <svg ref={svgRef} viewBox={`0 0 ${svgW} ${height}`} width="100%" height={height}>
        {[0, 0.25, 0.5, 0.75, 1].map(pct => {
          const y = topPad + (height - topPad - bottomPad) * (1 - pct);
          return (
            <g key={pct}>
              <line x1={20} y1={y} x2={svgW - 10} y2={y} stroke="var(--glass-border)" strokeWidth="1" />
              <text x={16} y={y + 3} textAnchor="end" fill="var(--text-500)" fontSize="9">{Math.round(maxValue * pct)}</text>
            </g>
          );
        })}
        {data.map((item, i) => {
          const x = 30 + i * (barW + gap);
          const barH = (item.value / maxValue) * (height - topPad - bottomPad);
          const y = height - bottomPad - (animated ? barH : 0);
          const color = colors[i] || DEFAULT_COLORS[i % DEFAULT_COLORS.length];
          return (
            <g key={i} onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)} style={{ cursor: 'pointer' }}>
              <rect x={x} y={y} width={barW} height={animated ? barH : 0} rx="4" fill={color}
                opacity={hovered !== null && hovered !== i ? 0.5 : 1}
                style={{ transition: `height 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${i * 0.05}s, y 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${i * 0.05}s, opacity 0.2s` }}
              />
              <text x={x + barW / 2} y={height - bottomPad + 14} textAnchor="middle" fill="var(--text-500)" fontSize="9">
                {item.label}
              </text>
            </g>
          );
        })}
      </svg>
      {hovered !== null && (
        <div style={{
          position: 'absolute', top: 4, right: 4,
          background: 'var(--bg-700)', border: '1px solid var(--glass-border)',
          borderRadius: 6, padding: '4px 10px', fontSize: 12, color: 'var(--text-200)',
          pointerEvents: 'none'
        }}>
          {data[hovered].label}: <strong>{data[hovered].value}</strong>
        </div>
      )}
    </div>
  );
}
