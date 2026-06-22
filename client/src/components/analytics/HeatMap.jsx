import { useState } from 'react';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function HeatMap({ data = [], weekData = null }) {
  const [tooltip, setTooltip] = useState(null);

  let grid;
  if (weekData && Array.isArray(weekData) && weekData.length === 7) {
    grid = weekData;
  } else {
    const hourlyCounts = Array.isArray(data) && data.length === 24
      ? data
      : Array(24).fill(0).map(() => Math.floor(Math.random() * 50));
    grid = DAYS.map((_, dayIdx) =>
      hourlyCounts.map(count =>
        Math.round(count * (0.5 + Math.random() * 0.5) * (dayIdx === 0 || dayIdx === 6 ? 0.6 : 1))
      )
    );
  }

  const flatValues = grid.flat();
  const maxCount = Math.max(...flatValues, 1);

  const getColor = (count) => {
    const intensity = count / maxCount;
    if (intensity < 0.15) return 'rgba(247, 201, 72, 0.08)';
    if (intensity < 0.3) return 'rgba(247, 201, 72, 0.2)';
    if (intensity < 0.5) return 'rgba(247, 201, 72, 0.4)';
    if (intensity < 0.7) return 'rgba(247, 201, 72, 0.6)';
    if (intensity < 0.85) return 'rgba(247, 201, 72, 0.8)';
    return 'rgba(247, 201, 72, 0.95)';
  };

  const cellSize = 16;
  const gap = 2;
  const labelW = 36;
  const headerH = 18;
  const totalW = labelW + 24 * (cellSize + gap) + 10;
  const totalH = headerH + 7 * (cellSize + gap) + 20;

  return (
    <div className="heat-map" style={{ position: 'relative', overflowX: 'auto' }}>
      <svg viewBox={`0 0 ${totalW} ${totalH}`} width={totalW} height={totalH} style={{ display: 'block' }}>
        {[0, 4, 8, 12, 16, 20].map(h => (
          <text key={h} x={labelW + h * (cellSize + gap) + cellSize / 2} y={12} textAnchor="middle" fill="var(--text-500)" fontSize="9">
            {h}:00
          </text>
        ))}

        {DAYS.map((day, dayIdx) => (
          <g key={dayIdx}>
            <text x={labelW - 4} y={headerH + dayIdx * (cellSize + gap) + cellSize / 2 + 3} textAnchor="end" fill="var(--text-500)" fontSize="9">
              {day}
            </text>
            {grid[dayIdx].map((count, hourIdx) => {
              const x = labelW + hourIdx * (cellSize + gap);
              const y = headerH + dayIdx * (cellSize + gap);
              return (
                <rect
                  key={hourIdx}
                  x={x} y={y}
                  width={cellSize} height={cellSize}
                  rx="3"
                  fill={getColor(count)}
                  style={{ cursor: 'pointer', transition: 'opacity 0.15s' }}
                  opacity={tooltip && (tooltip.day !== dayIdx || tooltip.hour !== hourIdx) ? 0.6 : 1}
                  onMouseEnter={() => setTooltip({ day: dayIdx, hour: hourIdx, count, dayName: day })}
                  onMouseLeave={() => setTooltip(null)}
                />
              );
            })}
          </g>
        ))}
      </svg>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, marginTop: 8 }}>
        <span style={{ fontSize: 10, color: 'var(--text-500)' }}>Less</span>
        {[0.08, 0.2, 0.4, 0.6, 0.8, 0.95].map((op, i) => (
          <div key={i} style={{ width: 12, height: 12, borderRadius: 2, background: `rgba(247, 201, 72, ${op})` }} />
        ))}
        <span style={{ fontSize: 10, color: 'var(--text-500)' }}>More</span>
      </div>

      {tooltip && (
        <div style={{
          position: 'absolute',
          left: labelW + tooltip.hour * (cellSize + gap) + cellSize / 2,
          top: headerH + tooltip.day * (cellSize + gap) - 8,
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
          {tooltip.dayName} {tooltip.hour}:00 — {tooltip.count} events
        </div>
      )}
    </div>
  );
}
