import { useEffect, useRef, useState } from 'react';

export default function KPICard({ icon, label, value, trend, sparklineData = [] }) {
  const [displayValue, setDisplayValue] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    const target = typeof value === 'number' ? value : parseInt(value) || 0;
    const duration = 1000;
    const steps = 30;
    const increment = target / steps;
    let current = 0;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      current = Math.min(Math.round(increment * step), target);
      setDisplayValue(current);
      if (step >= steps) clearInterval(timer);
    }, duration / steps);
    return () => clearInterval(timer);
  }, [value]);

  const trendDir = trend > 0 ? 'up' : trend < 0 ? 'down' : 'flat';
  const trendColor = trend > 0 ? 'var(--green)' : trend < 0 ? 'var(--red)' : 'var(--text-500)';
  const trendArrow = trendDir === 'up' ? '\u2191' : trendDir === 'down' ? '\u2193' : '\u2192';

  const maxSpark = Math.max(...sparklineData, 1);
  const sparkPoints = sparklineData.map((v, i) => {
    const x = (i / Math.max(sparklineData.length - 1, 1)) * 100;
    const y = 100 - (v / maxSpark) * 100;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="kpi-card card-static card" ref={ref}>
      <div className="kpi-icon">{icon}</div>
      <div className="kpi-content">
        <div className="kpi-label">{label}</div>
        <div className="kpi-value">{displayValue.toLocaleString()}</div>
        <div className="kpi-trend" style={{ color: trendColor }}>
          <span className="kpi-trend-arrow">{trendArrow}</span>
          <span>{Math.abs(trend)}%</span>
        </div>
      </div>
      {sparklineData.length > 0 && (
        <svg className="sparkline" viewBox="0 0 100 100" preserveAspectRatio="none">
          <polyline
            points={sparkPoints}
            fill="none"
            stroke="var(--accent)"
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      )}
    </div>
  );
}
