import { useEffect, useState } from 'react';

export default function LineChart({ data = [], labels = [], height = 200, color = 'var(--accent)' }) {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 100);
    return () => clearTimeout(t);
  }, []);

  if (data.length === 0) return null;

  const maxVal = Math.max(...data, 1);
  const padding = { top: 20, right: 20, bottom: 30, left: 40 };
  const width = 600;
  const innerW = width - padding.left - padding.right;
  const innerH = height - padding.top - padding.bottom;

  const points = data.map((val, i) => {
    const x = padding.left + (i / Math.max(data.length - 1, 1)) * innerW;
    const y = padding.top + innerH - (val / maxVal) * innerH;
    return { x, y };
  });

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaD = pathD + ` L ${points[points.length - 1].x} ${padding.top + innerH} L ${points[0].x} ${padding.top + innerH} Z`;

  const gridLines = [0, 0.25, 0.5, 0.75, 1].map(pct => ({
    y: padding.top + innerH - pct * innerH,
    label: Math.round(maxVal * pct)
  }));

  return (
    <div className="line-chart" style={{ height }}>
      <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" width="100%" height={height}>
        <defs>
          <linearGradient id="lineAreaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>

        {gridLines.map((g, i) => (
          <g key={i}>
            <line x1={padding.left} y1={g.y} x2={width - padding.right} y2={g.y} stroke="var(--glass-border)" strokeWidth="1" />
            <text x={padding.left - 8} y={g.y + 4} textAnchor="end" fill="var(--text-500)" fontSize="10">{g.label}</text>
          </g>
        ))}

        <path d={areaD} fill="url(#lineAreaGrad)" opacity={animated ? 1 : 0} style={{ transition: 'opacity 0.5s' }} />
        <path d={pathD} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          strokeDasharray={animated ? 'none' : '2000'}
          strokeDashoffset={animated ? '0' : '2000'}
          style={{ transition: 'stroke-dashoffset 1.2s ease-out' }}
        />

        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="4" fill="var(--bg-800)" stroke={color} strokeWidth="2"
            opacity={animated ? 1 : 0}
            style={{ transition: `opacity 0.3s ${0.1 * i}s` }}
          />
        ))}

        {labels.length > 0 && labels.map((lbl, i) => {
          const x = padding.left + (i / Math.max(labels.length - 1, 1)) * innerW;
          return (
            <text key={i} x={x} y={height - 8} textAnchor="middle" fill="var(--text-500)" fontSize="10">{lbl}</text>
          );
        })}
      </svg>
    </div>
  );
}
