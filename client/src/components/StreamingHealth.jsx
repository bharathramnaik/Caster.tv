import { useState } from 'react';

/**
 * Compact health display for sidebar/panel use.
 * Color-coded status with key metrics and expandable details.
 */
export default function StreamingHealth({ output, expanded = false }) {
  const [isExpanded, setIsExpanded] = useState(expanded);

  if (!output || output.state !== 'active' || !output.metrics) {
    return (
      <div className="streaming-health streaming-health--inactive" style={{
        padding: '12px 16px',
        background: 'var(--bg-700)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--glass-border)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{
            width: 8, height: 8, borderRadius: '50%',
            background: 'var(--text-500)'
          }} />
          <span style={{ fontSize: '0.85rem', color: 'var(--text-400)' }}>
            {output?.state || 'No data'}
          </span>
        </div>
      </div>
    );
  }

  const { metrics } = output;
  const bitrateOk = metrics.bitrate >= 3600;
  const fpsOk = metrics.fps >= 24;
  const droppedOk = (metrics.droppedFrames || 0) < 100;

  const getStatus = () => {
    if (!bitrateOk || !fpsOk || !droppedOk) return 'warning';
    return 'ok';
  };

  const status = getStatus();
  const statusColor = status === 'ok' ? 'var(--green)' : 'var(--orange)';

  return (
    <div
      className={`streaming-health streaming-health--${status}`}
      style={{
        padding: '12px 16px',
        background: 'var(--bg-700)',
        borderRadius: 'var(--radius-md)',
        border: `1px solid ${status === 'ok' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(249, 115, 22, 0.2)'}`,
        cursor: isExpanded ? 'default' : 'pointer'
      }}
      onClick={() => !expanded && setIsExpanded(!isExpanded)}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: isExpanded ? 12 : 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{
            width: 8, height: 8, borderRadius: '50%',
            background: statusColor,
            boxShadow: `0 0 6px ${statusColor}`
          }} />
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-100)' }}>
            Stream Health
          </span>
        </div>
        {!expanded && (
          <span style={{ fontSize: '0.7rem', color: 'var(--text-400)' }}>
            {isExpanded ? '▼' : '▶'}
          </span>
        )}
      </div>

      {/* Key Metrics (always visible) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: isExpanded ? 12 : 0 }}>
        <MetricItem
          label="Bitrate"
          value={`${metrics.bitrate?.toFixed(0) || 0}`}
          unit="kbps"
          ok={bitrateOk}
        />
        <MetricItem
          label="FPS"
          value={metrics.fps?.toFixed(1) || '0'}
          unit=""
          ok={fpsOk}
        />
        <MetricItem
          label="Dropped"
          value={metrics.droppedFrames || '0'}
          unit="frames"
          ok={droppedOk}
        />
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: 12 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <MetricItem
              label="Latency"
              value={metrics.latency || '0'}
              unit="ms"
              ok={true}
            />
            <MetricItem
              label="Uptime"
              value={formatUptime(metrics.uptime || 0)}
              unit=""
              ok={true}
            />
            {output.type === 'webrtc' && (
              <MetricItem
                label="Viewers"
                value={output.viewers || 0}
                unit=""
                ok={true}
              />
            )}
            {output.type === 'webrtc' && (
              <MetricItem
                label="Bandwidth"
                value={metrics.bandwidthUsage ? (metrics.bandwidthUsage / 1024).toFixed(1) : '0'}
                unit="MB/s"
                ok={true}
              />
            )}
          </div>

          {/* Visual Bars */}
          <div style={{ marginTop: 12 }}>
            <BarChart label="Bitrate" value={metrics.bitrate || 0} max={6000} color="var(--green)" />
            <BarChart label="FPS" value={metrics.fps || 0} max={60} color="var(--blue)" />
          </div>
        </div>
      )}
    </div>
  );
}

function MetricItem({ label, value, unit, ok }) {
  return (
    <div>
      <div style={{ fontSize: '0.7rem', color: 'var(--text-400)', marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: '0.9rem', fontWeight: 600, color: ok ? 'var(--text-100)' : 'var(--orange)' }}>
        {value}
        {unit && <span style={{ fontSize: '0.7rem', fontWeight: 400, color: 'var(--text-400)', marginLeft: 2 }}>{unit}</span>}
      </div>
    </div>
  );
}

function BarChart({ label, value, max, color }) {
  const percent = Math.min((value / max) * 100, 100);
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-400)', marginBottom: 4 }}>
        <span>{label}</span>
        <span>{value.toFixed(0)} / {max}</span>
      </div>
      <div className="health-chart" style={{
        height: 6,
        background: 'var(--bg-600)',
        borderRadius: 3,
        overflow: 'hidden'
      }}>
        <div style={{
          width: `${percent}%`,
          height: '100%',
          background: color,
          borderRadius: 3,
          transition: 'width 0.3s ease'
        }} />
      </div>
    </div>
  );
}

function formatUptime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}
