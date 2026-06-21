import { useEffect, useState } from 'react';

export default function BarChart({ data = [], horizontal = false, colors = [] }) {
  const [animated, setAnimated] = useState(false);
  const maxValue = Math.max(...data.map(d => d.value), 1);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 50);
    return () => clearTimeout(t);
  }, []);

  const defaultColors = [
    'var(--accent)', 'var(--blue)', 'var(--green)', 'var(--cyan)',
    'var(--orange)', '#a78bfa', '#f472b6', '#34d399'
  ];

  if (horizontal) {
    return (
      <div className="bar-chart bar-chart-horizontal">
        {data.map((item, i) => {
          const pct = (item.value / maxValue) * 100;
          const color = colors[i] || defaultColors[i % defaultColors.length];
          return (
            <div key={i} className="bar-chart-row">
              <div className="bar-chart-label">{item.label}</div>
              <div className="bar-chart-track">
                <div
                  className="bar-chart-bar"
                  style={{
                    width: animated ? `${pct}%` : '0%',
                    background: color,
                    transition: `width 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${i * 0.05}s`
                  }}
                />
              </div>
              <div className="bar-chart-value">{item.value}</div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="bar-chart bar-chart-vertical">
      {data.map((item, i) => {
        const heightPct = (item.value / maxValue) * 100;
        const color = colors[i] || defaultColors[i % defaultColors.length];
        return (
          <div key={i} className="bar-chart-col">
            <div className="bar-chart-value">{item.value}</div>
            <div className="bar-chart-track-v">
              <div
                className="bar-chart-bar-v"
                style={{
                  height: animated ? `${heightPct}%` : '0%',
                  background: color,
                  transition: `height 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${i * 0.05}s`
                }}
              />
            </div>
            <div className="bar-chart-label">{item.label}</div>
          </div>
        );
      })}
    </div>
  );
}
