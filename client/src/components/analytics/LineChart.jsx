import { useEffect, useState, useRef } from 'react';

export default function LineChart({ data = [], labels = [], height = 200, color = 'var(--accent)', title = '' }) {
  const [animated, setAnimated] = useState(false);
  const [tooltip, setTooltip] = useState(null);
  const svgRef = useRef(null);

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
    return { x, y, value: val, index: i };
  });

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaD = pathD + ` L ${points[points.length - 1].x} ${padding.top + innerH} L ${points[0].x} ${padding.top + innerH} Z`;

  const gridLines = [0, 0.25, 0.5, 0.75, 1].map(pct => ({
    y: padding.top + innerH - pct * innerH,
    label: Math.round(maxVal * pct)
  }));

  const handleMouseMove = (e) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const mouseX = ((e.clientX - rect.left) / rect.width) * width;
    let closest = points[0];
    let minDist = Infinity;
    for (const p of points) {
      const dist = Math.abs(p.x - mouseX);
      if (dist < minDist) { minDist = dist; closest = p; }
    }
    setTooltip({
      x: closest.x,
      y: closest.y,
      value: closest.value,
      label: labels[closest.index] || `Point ${closest.index + 1}`
    });
  };

  const gradId = `lineAreaGrad-${Math.random().toString(36).slice(2, 8)}`;

  return (
    <div className="line-chart" style={{ height, position: 'relative' }}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        width="100%"
        height={height}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setTooltip(null)}
        style={{ cursor: 'crosshair' }}
      >
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
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

        <path d={areaD} fill={`url(#${gradId})`} opacity={animated ? 1 : 0} style={{ transition: 'opacity 0.5s' }} />
        <path d={pathD} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          strokeDasharray={animated ? 'none' : '2000'}
          strokeDashoffset={animated ? '0' : '2000'}
          style={{ transition: 'stroke-dashoffset 1.2s ease-out' }}
        />

        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="3.5" fill="var(--bg-800)" stroke={color} strokeWidth="2"
            opacity={animated ? 1 : 0}
            style={{ transition: `opacity 0.3s ${0.05 * i}s` }}
          />
        ))}

        {tooltip && (
          <g>
            <line x1={tooltip.x} y1={padding.top} x2={tooltip.x} y2={padding.top + innerH}
              stroke="var(--text-500)" strokeWidth="1" strokeDasharray="3,3" />
            <circle cx={tooltip.x} cy={tooltip.y} r="5" fill={color} stroke="var(--bg-800)" strokeWidth="2" />
          </g>
        )}

        {labels.length > 0 && labels.map((lbl, i) => {
          const x = padding.left + (i / Math.max(labels.length - 1, 1)) * innerW;
          return (
            <text key={i} x={x} y={height - 8} textAnchor="middle" fill="var(--text-500)" fontSize="10">{lbl}</text>
          );
        })}
      </svg>
      {tooltip && (
        <div style={{
          position: 'absolute',
          left: `${(tooltip.x / width) * 100}%`,
          top: `${(tooltip.y / height) * 100 - 12}%`,
          transform: 'translate(-50%, -100%)',
          background: 'var(--bg-700)',
          border: '1px solid var(--glass-border)',
          borderRadius: 6,
          padding: '4px 10px',
          fontSize: 12,
          color: 'var(--text-200)',
          pointerEvents: 'none',
          whiteSpace: 'nowrap',
          zIndex: 10
        }}>
          {tooltip.label}: <strong>{tooltip.value}</strong>
        </div>
      )}
    </div>
  );
}
