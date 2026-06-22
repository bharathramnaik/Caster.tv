import { useEffect, useState } from 'react';

export default function TrendCard({ label, value, previousValue, icon, color = 'var(--accent)', suffix = '' }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const target = typeof value === 'number' ? value : parseFloat(value) || 0;
    const duration = 800;
    const steps = 25;
    const increment = target / steps;
    let current = 0;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      current = Math.min(Math.round(increment * step * 10) / 10, target);
      setDisplayValue(current);
      if (step >= steps) clearInterval(timer);
    }, duration / steps);
    return () => clearInterval(timer);
  }, [value]);

  const trend = previousValue && previousValue > 0
    ? Math.round(((value - previousValue) / previousValue) * 100)
    : 0;

  const trendUp = trend > 0;
  const trendDown = trend < 0;
  const trendColor = trendUp ? 'var(--green)' : trendDown ? 'var(--red)' : 'var(--text-500)';

  const formattedValue = typeof displayValue === 'number'
    ? displayValue >= 1000
      ? `${(displayValue / 1000).toFixed(1)}k`
      : Number.isInteger(displayValue)
        ? displayValue.toLocaleString()
        : displayValue.toFixed(1)
    : displayValue;

  return (
    <div className="trend-card card-static card" style={{ padding: '16px 20px', minWidth: 160 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{ fontSize: 12, color: 'var(--text-500)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
        {icon && <span style={{ fontSize: 18, opacity: 0.7 }}>{icon}</span>}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 4 }}>
        <span style={{ fontSize: 28, fontWeight: 700, color: color, lineHeight: 1 }}>
          {formattedValue}{suffix}
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 2,
          padding: '2px 6px', borderRadius: 4,
          background: trendUp ? 'rgba(34,197,94,0.12)' : trendDown ? 'rgba(239,68,68,0.12)' : 'rgba(148,163,184,0.12)',
          color: trendColor, fontWeight: 600
        }}>
          <span style={{ fontSize: 10 }}>{trendUp ? '\u2191' : trendDown ? '\u2193' : '\u2192'}</span>
          {Math.abs(trend)}%
        </span>
        {previousValue != null && (
          <span style={{ color: 'var(--text-500)' }}>vs prev period</span>
        )}
      </div>
    </div>
  );
}
