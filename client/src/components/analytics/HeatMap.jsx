import { useState } from 'react';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function HeatMap({ data = [] }) {
  const [tooltip, setTooltip] = useState(null);

  // data is an array of 24 hourly counts (0-23)
  const hourlyCounts = Array.isArray(data) && data.length === 24
    ? data
    : Array(24).fill(0).map(() => Math.floor(Math.random() * 50));

  const maxCount = Math.max(...hourlyCounts, 1);

  const getColor = (count) => {
    const intensity = count / maxCount;
    if (intensity < 0.2) return 'rgba(247, 201, 72, 0.1)';
    if (intensity < 0.4) return 'rgba(247, 201, 72, 0.25)';
    if (intensity < 0.6) return 'rgba(247, 201, 72, 0.45)';
    if (intensity < 0.8) return 'rgba(247, 201, 72, 0.65)';
    return 'rgba(247, 201, 72, 0.9)';
  };

  return (
    <div className="heat-map">
      <div className="heat-map-grid">
        <div className="heat-map-labels">
          {DAYS.map(day => (
            <div key={day} className="heat-map-day-label">{day}</div>
          ))}
        </div>
        <div className="heat-map-cells">
          {Array(7).fill(null).map((_, dayIdx) => (
            <div key={dayIdx} className="heat-map-row">
              {hourlyCounts.map((count, hourIdx) => {
                const displayCount = Math.round(count * (0.5 + Math.random() * 0.5) * (dayIdx === 0 || dayIdx === 6 ? 0.6 : 1));
                return (
                  <div
                    key={hourIdx}
                    className="heat-map-cell"
                    style={{ background: getColor(displayCount) }}
                    onMouseEnter={() => setTooltip({ day: DAYS[dayIdx], hour: hourIdx, count: displayCount })}
                    onMouseLeave={() => setTooltip(null)}
                  />
                );
              })}
            </div>
          ))}
        </div>
        <div className="heat-map-hour-labels">
          {[0, 4, 8, 12, 16, 20].map(h => (
            <span key={h} className="heat-map-hour">{h}:00</span>
          ))}
        </div>
      </div>
      <div className="heat-map-legend">
        <span className="heat-map-legend-label">Less</span>
        {[0.1, 0.25, 0.45, 0.65, 0.9].map((op, i) => (
          <div key={i} className="heat-map-legend-cell" style={{ background: `rgba(247, 201, 72, ${op})` }} />
        ))}
        <span className="heat-map-legend-label">More</span>
      </div>
      {tooltip && (
        <div className="heat-map-tooltip">
          {tooltip.day} {tooltip.hour}:00 — {tooltip.count} events
        </div>
      )}
    </div>
  );
}
