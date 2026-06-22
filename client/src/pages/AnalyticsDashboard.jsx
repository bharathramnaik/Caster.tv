import { useState, useEffect, useCallback } from 'react';
import TrendCard from '../components/analytics/TrendCard.jsx';
import LineChart from '../components/analytics/LineChart.jsx';
import BarChart from '../components/analytics/BarChart.jsx';
import PieChart from '../components/analytics/PieChart.jsx';
import HeatMap from '../components/analytics/HeatMap.jsx';
import SparkLine from '../components/analytics/SparkLine.jsx';

const API = import.meta.env.VITE_API_URL || '';

export default function AnalyticsDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('7d');
  const [trendMetric, setTrendMetric] = useState('requests');
  const [trendData, setTrendData] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(Date.now());

  const fetchData = useCallback(async () => {
    try {
      const [dashRes, trendRes] = await Promise.allSettled([
        fetch(`${API}/api/analytics/dashboard`).then(r => r.json()),
        fetch(`${API}/api/analytics/trends?metric=${trendMetric}&periods=12`).then(r => r.json())
      ]);
      if (dashRes.status === 'fulfilled') setData(dashRes.value);
      if (trendRes.status === 'fulfilled') setTrendData(trendRes.value);
      setLastRefresh(Date.now());
    } catch (e) {
      console.error('Failed to fetch analytics:', e);
    }
    setLoading(false);
  }, [trendMetric]);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const handleExport = async () => {
    try {
      const res = await fetch(`${API}/api/analytics/export?format=csv`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-export-${Date.now()}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Export failed:', e);
    }
  };

  if (loading && !data) {
    return (
      <div className="analytics-dashboard" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
        <div className="loading">
          <div className="ipl-loader-spinner" />
          <span style={{ marginLeft: 12 }}>Loading advanced analytics...</span>
        </div>
      </div>
    );
  }

  const rt = data?.realtime || {};
  const usage = data?.usage || {};
  const perf = data?.performance || {};
  const sessions = data?.sessions || {};
  const popular = data?.popular || {};
  const hourly = usage.hourly || Array(24).fill(0);

  const trafficOverTime = trendData?.data?.map(d => d.value) || [];
  const trafficLabels = trendData?.data?.map(d => {
    const dt = new Date(d.start);
    return `${dt.getHours()}:00`;
  }) || [];

  const topEndpoints = perf?.endpoints?.topEndpoints || [];
  const endpointData = topEndpoints.map(e => ({
    label: e.endpoint.length > 16 ? e.endpoint.slice(0, 16) + '...' : e.endpoint,
    value: e.totalRequests
  }));

  const sportData = (popular.sports || []).map(s => ({
    label: s.sport,
    value: s.count
  }));

  const templateData = (popular.templates || []).map(t => ({
    label: t.name?.slice(0, 12) || t.id,
    value: t.count
  }));

  const recentTrend = trendData?.data || [];
  const prevPeriod = recentTrend.length >= 2 ? recentTrend[recentTrend.length - 2]?.value : null;
  const currentPeriod = recentTrend.length >= 1 ? recentTrend[recentTrend.length - 1]?.value : null;

  const rtAnomalies = rt.anomalies || [];

  return (
    <div className="analytics-dashboard">
      <div className="analytics-header">
        <div>
          <h2>Advanced Analytics</h2>
          <p className="analytics-subtitle">Real-time monitoring and performance insights</p>
        </div>
        <div className="analytics-header-actions">
          <select
            className="input analytics-date-select"
            value={dateRange}
            onChange={e => setDateRange(e.target.value)}
          >
            <option value="1d">Last 24 hours</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          <select
            className="input analytics-date-select"
            value={trendMetric}
            onChange={e => setTrendMetric(e.target.value)}
          >
            <option value="requests">Requests</option>
            <option value="errors">Errors</option>
            <option value="avgResponseTime">Response Time</option>
            <option value="activeUsers">Active Users</option>
            <option value="errorRate">Error Rate</option>
          </select>
          <button className="btn btn-secondary" onClick={fetchData}>
            &#x21BB; Refresh
          </button>
          <button className="btn btn-primary" onClick={handleExport}>
            &#x21E9; Export CSV
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <span style={{ fontSize: 12, color: 'var(--text-500)' }}>
          Last updated: {new Date(lastRefresh).toLocaleTimeString()}
        </span>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 4,
          padding: '3px 10px', borderRadius: 12, fontSize: 11, fontWeight: 600,
          background: rt.status === 'healthy' ? 'rgba(34,197,94,0.12)' : rt.status === 'warning' ? 'rgba(249,115,22,0.12)' : 'rgba(239,68,68,0.12)',
          color: rt.status === 'healthy' ? 'var(--green)' : rt.status === 'warning' ? 'var(--orange)' : 'var(--red)'
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor', display: 'inline-block' }} />
          {rt.status || 'unknown'}
        </span>
        {rtAnomalies.length > 0 && (
          <span style={{ fontSize: 12, color: 'var(--orange)' }}>
            {rtAnomalies.length} anomal{rtAnomalies.length === 1 ? 'y' : 'ies'} detected
          </span>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 20 }}>
        <TrendCard label="Active Users" value={rt.activeUsers || 0} icon="&#x1F465;" color="var(--blue)" previousValue={prevPeriod} />
        <TrendCard label="Requests/sec" value={rt.realtime?.requestsPerSec || 0} icon="&#x26A1;" color="var(--accent)" previousValue={prevPeriod} />
        <TrendCard label="Avg Response" value={rt.realtime?.avgResponseTime || 0} suffix="ms" icon="&#x23F1;" color="var(--cyan)" previousValue={prevPeriod} />
        <TrendCard label="Error Rate" value={rt.realtime?.errorRate || 0} suffix="%" icon="&#x26A0;" color="var(--red)" previousValue={prevPeriod} />
        <TrendCard label="Total Sessions" value={sessions.totalSessions || 0} icon="&#x1F4CB;" color="var(--green)" />
        <TrendCard label="Health Score" value={perf.score || 0} icon="&#x2764;" color={perf.score >= 80 ? 'var(--green)' : perf.score >= 50 ? 'var(--orange)' : 'var(--red)'} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
        <div className="analytics-card card-static card" style={{ padding: 20 }}>
          <h3 className="analytics-card-title">Request Traffic ({trendMetric})</h3>
          <LineChart
            data={trafficOverTime}
            labels={trafficLabels}
            height={220}
            color="var(--accent)"
          />
        </div>

        <div className="analytics-card card-static card" style={{ padding: 20 }}>
          <h3 className="analytics-card-title">Top Endpoints by Traffic</h3>
          <BarChart data={endpointData.slice(0, 8)} horizontal />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
        <div className="analytics-card card-static card" style={{ padding: 20 }}>
          <h3 className="analytics-card-title">Traffic by Sport</h3>
          {sportData.length > 0 ? (
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <PieChart data={sportData} donut size={220} />
            </div>
          ) : (
            <div style={{ textAlign: 'center', color: 'var(--text-500)', padding: 40 }}>No sport data yet</div>
          )}
        </div>

        <div className="analytics-card card-static card" style={{ padding: 20 }}>
          <h3 className="analytics-card-title">Popular Templates</h3>
          {templateData.length > 0 ? (
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <PieChart data={templateData.slice(0, 6)} donut size={220} colors={['var(--accent)', 'var(--blue)', 'var(--green)', 'var(--cyan)', 'var(--orange)', '#a78bfa']} />
            </div>
          ) : (
            <div style={{ textAlign: 'center', color: 'var(--text-500)', padding: 40 }}>No template data yet</div>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
        <div className="analytics-card card-static card" style={{ padding: 20 }}>
          <h3 className="analytics-card-title">Usage by Hour of Day</h3>
          <HeatMap data={hourly} />
        </div>

        <div className="analytics-card card-static card" style={{ padding: 20 }}>
          <h3 className="analytics-card-title">Performance Overview</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div style={{ padding: 14, borderRadius: 8, background: 'var(--glass)', border: '1px solid var(--glass-border)' }}>
              <div style={{ fontSize: 11, color: 'var(--text-500)', marginBottom: 4 }}>API Response</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-200)' }}>{perf.metrics?.apiResponseTime || 0}ms</div>
              <SparkLine data={perf.endpoints?.topEndpoints?.[0]?.recentTimes || [120, 130, 110, 140, 125]} width={120} height={24} color="var(--cyan)" filled />
            </div>
            <div style={{ padding: 14, borderRadius: 8, background: 'var(--glass)', border: '1px solid var(--glass-border)' }}>
              <div style={{ fontSize: 11, color: 'var(--text-500)', marginBottom: 4 }}>Memory Usage</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-200)' }}>{perf.metrics?.memoryUsage || 0}MB</div>
              <SparkLine data={[80, 85, 90, 88, 92, 87]} width={120} height={24} color="var(--green)" filled />
            </div>
            <div style={{ padding: 14, borderRadius: 8, background: 'var(--glass)', border: '1px solid var(--glass-border)' }}>
              <div style={{ fontSize: 11, color: 'var(--text-500)', marginBottom: 4 }}>CPU Usage</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-200)' }}>{perf.metrics?.cpuUsage || 0}</div>
              <SparkLine data={[10, 15, 12, 18, 14, 16]} width={120} height={24} color="var(--orange)" filled />
            </div>
            <div style={{ padding: 14, borderRadius: 8, background: 'var(--glass)', border: '1px solid var(--glass-border)' }}>
              <div style={{ fontSize: 11, color: 'var(--text-500)', marginBottom: 4 }}>Active Connections</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-200)' }}>{perf.metrics?.activeConnections || 0}</div>
              <SparkLine data={[3, 5, 4, 6, 5, 7]} width={120} height={24} color="var(--blue)" filled />
            </div>
          </div>
        </div>
      </div>

      {rtAnomalies.length > 0 && (
        <div className="analytics-card card-static card" style={{ padding: 20, marginBottom: 20, borderColor: 'rgba(249,115,22,0.3)' }}>
          <h3 className="analytics-card-title" style={{ color: 'var(--orange)' }}>Anomalies Detected</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {rtAnomalies.map((a, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 14px', borderRadius: 8,
                background: a.severity === 'critical' ? 'rgba(239,68,68,0.08)' : 'rgba(249,115,22,0.08)',
                border: `1px solid ${a.severity === 'critical' ? 'rgba(239,68,68,0.2)' : 'rgba(249,115,22,0.2)'}`
              }}>
                <span style={{ fontSize: 14 }}>{a.severity === 'critical' ? '&#x1F6A8;' : '&#x26A0;'}</span>
                <span style={{ fontSize: 13, color: 'var(--text-200)' }}>{a.message}</span>
                <span style={{ fontSize: 11, color: 'var(--text-500)', marginLeft: 'auto' }}>{a.type}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
        <div className="analytics-card card-static card" style={{ padding: 20 }}>
          <h3 className="analytics-card-title">Top Pages</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {(usage.topPages || []).slice(0, 8).map((p, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--glass-border)' }}>
                <span style={{ fontSize: 13, color: 'var(--text-300)' }}>{p.page}</span>
                <span style={{ fontSize: 13, color: 'var(--text-400)', fontWeight: 600 }}>{p.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="analytics-card card-static card" style={{ padding: 20 }}>
          <h3 className="analytics-card-title">Session Summary</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div style={{ padding: 12, borderRadius: 8, background: 'var(--glass)', border: '1px solid var(--glass-border)', textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--accent)' }}>{sessions.totalSessions || 0}</div>
              <div style={{ fontSize: 11, color: 'var(--text-500)' }}>Total Sessions</div>
            </div>
            <div style={{ padding: 12, borderRadius: 8, background: 'var(--glass)', border: '1px solid var(--glass-border)', textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--blue)' }}>{sessions.avgPagesPerSession || 0}</div>
              <div style={{ fontSize: 11, color: 'var(--text-500)' }}>Avg Pages/Session</div>
            </div>
            <div style={{ padding: 12, borderRadius: 8, background: 'var(--glass)', border: '1px solid var(--glass-border)', textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--green)' }}>{sessions.activeSessions || 0}</div>
              <div style={{ fontSize: 11, color: 'var(--text-500)' }}>Active Sessions</div>
            </div>
            <div style={{ padding: 12, borderRadius: 8, background: 'var(--glass)', border: '1px solid var(--glass-border)', textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--cyan)' }}>{Math.round((sessions.avgDuration || 0) / 1000)}s</div>
              <div style={{ fontSize: 11, color: 'var(--text-500)' }}>Avg Duration</div>
            </div>
          </div>
        </div>
      </div>

      <div className="analytics-card card-static card" style={{ padding: 20 }}>
        <h3 className="analytics-card-title">Slow Endpoints</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: '8px 12px', color: 'var(--text-500)', borderBottom: '1px solid var(--glass-border)' }}>Method</th>
                <th style={{ textAlign: 'left', padding: '8px 12px', color: 'var(--text-500)', borderBottom: '1px solid var(--glass-border)' }}>Endpoint</th>
                <th style={{ textAlign: 'right', padding: '8px 12px', color: 'var(--text-500)', borderBottom: '1px solid var(--glass-border)' }}>Avg (ms)</th>
                <th style={{ textAlign: 'right', padding: '8px 12px', color: 'var(--text-500)', borderBottom: '1px solid var(--glass-border)' }}>Max (ms)</th>
                <th style={{ textAlign: 'right', padding: '8px 12px', color: 'var(--text-500)', borderBottom: '1px solid var(--glass-border)' }}>Requests</th>
                <th style={{ textAlign: 'right', padding: '8px 12px', color: 'var(--text-500)', borderBottom: '1px solid var(--glass-border)' }}>Error %</th>
              </tr>
            </thead>
            <tbody>
              {(perf.endpoints?.slowEndpoints || []).map((ep, i) => (
                <tr key={i}>
                  <td style={{ padding: '8px 12px', color: 'var(--text-300)' }}>{ep.method}</td>
                  <td style={{ padding: '8px 12px', color: 'var(--text-200)', fontFamily: 'monospace' }}>{ep.endpoint}</td>
                  <td style={{ padding: '8px 12px', textAlign: 'right', color: ep.avgResponseTime > 500 ? 'var(--red)' : 'var(--text-300)', fontWeight: 600 }}>{ep.avgResponseTime}</td>
                  <td style={{ padding: '8px 12px', textAlign: 'right', color: 'var(--text-400)' }}>{ep.maxResponseTime}</td>
                  <td style={{ padding: '8px 12px', textAlign: 'right', color: 'var(--text-400)' }}>{ep.totalRequests}</td>
                  <td style={{ padding: '8px 12px', textAlign: 'right', color: ep.errorRate > 5 ? 'var(--red)' : 'var(--text-400)' }}>{ep.errorRate}%</td>
                </tr>
              ))}
              {(!perf.endpoints?.slowEndpoints || perf.endpoints.slowEndpoints.length === 0) && (
                <tr>
                  <td colSpan={6} style={{ padding: '20px', textAlign: 'center', color: 'var(--text-500)' }}>No slow endpoints recorded</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
