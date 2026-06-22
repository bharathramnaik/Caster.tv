import { useState, useEffect, useCallback } from 'react';
import KPICard from '../components/analytics/KPICard.jsx';
import BarChart from '../components/analytics/BarChart.jsx';
import LineChart from '../components/analytics/LineChart.jsx';
import HeatMap from '../components/analytics/HeatMap.jsx';
import PieChart from '../components/analytics/PieChart.jsx';
import TrendCard from '../components/analytics/TrendCard.jsx';
import SparkLine from '../components/analytics/SparkLine.jsx';
import ActivityFeed from '../components/analytics/ActivityFeed.jsx';
import { useSound } from '../sounds/useSound.js';

const API = import.meta.env.VITE_API_URL || '';

export default function Analytics() {
  const [dashboard, setDashboard] = useState(null);
  const [performance, setPerformance] = useState(null);
  const [health, setHealth] = useState(null);
  const [peakHours, setPeakHours] = useState([]);
  const [realtime, setRealtime] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('7d');
  const { playClick, playSuccess } = useSound();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [dashRes, perfRes, healthRes, peakRes, rtRes] = await Promise.allSettled([
        fetch(`${API}/api/analytics/dashboard`).then(r => r.json()),
        fetch(`${API}/api/analytics/performance`).then(r => r.json()),
        fetch(`${API}/api/analytics/performance/health`).then(r => r.json()),
        fetch(`${API}/api/analytics/usage/peak-hours`).then(r => r.json()),
        fetch(`${API}/api/analytics/realtime`).then(r => r.json())
      ]);
      if (dashRes.status === 'fulfilled') setDashboard(dashRes.value);
      if (perfRes.status === 'fulfilled') setPerformance(perfRes.value);
      if (healthRes.status === 'fulfilled') setHealth(healthRes.value);
      if (peakRes.status === 'fulfilled') setPeakHours(peakRes.value);
      if (rtRes.status === 'fulfilled') setRealtime(rtRes.value);
      playSuccess();
    } catch (e) {
      console.error('Failed to fetch analytics:', e);
    }
    setLoading(false);
  }, [playSuccess]);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const handleRefresh = () => {
    playClick();
    fetchData();
  };

  const viewsOverTime = dashboard?.daily?.map(d => {
    return Object.values(d).filter(v => typeof v === 'number').reduce((s, v) => s + v, 0);
  }) || [];

  const dailyLabels = dashboard?.daily?.map(d => d.date?.slice(5) || '') || [];

  const featureData = dashboard?.eventsByType
    ? Object.entries(dashboard.eventsByType).map(([event, count]) => ({
        label: event.replace(/_/g, ' ').slice(0, 12),
        value: count
      }))
    : [];

  const sourceData = [
    { label: 'Direct', value: 340 },
    { label: 'Referral', value: 220 },
    { label: 'Social', value: 180 },
    { label: 'Search', value: 290 }
  ];

  if (loading && !dashboard) {
    return (
      <div className="analytics-dashboard">
        <div className="loading">
          <div className="ipl-loader-spinner" />
          <span style={{ marginLeft: 12 }}>Loading analytics...</span>
        </div>
      </div>
    );
  }

  const summary = dashboard?.summary || {};
  const trend = parseFloat(summary.trend) || 0;
  const rtMetrics = realtime?.realtime || {};

  return (
    <div className="analytics-dashboard">
      <div className="analytics-header">
        <div>
          <h2>Analytics Dashboard</h2>
          <p className="analytics-subtitle">Monitor usage and performance metrics</p>
        </div>
        <div className="analytics-header-actions">
          <select
            className="input analytics-date-select"
            value={dateRange}
            onChange={e => { playClick(); setDateRange(e.target.value); }}
          >
            <option value="1d">Last 24 hours</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          <button className="btn btn-secondary" onClick={handleRefresh}>
            &#x21BB; Refresh
          </button>
        </div>
      </div>

      <div className="kpi-row">
        <KPICard icon="&#x1F4CA;" label="Total Events Today" value={summary.totalEventsToday || 0} trend={trend} sparklineData={viewsOverTime} />
        <KPICard icon="&#x1F465;" label="Active Users" value={realtime?.activeUsers || summary.uniqueUsersToday || 0} trend={12} sparklineData={[12, 18, 22, 15, 28, 32, 25]} />
        <KPICard icon="&#x1F4C8;" label="Templates Created" value={dashboard?.eventsByType?.template_created || 0} trend={8} sparklineData={[5, 8, 12, 9, 15, 18, 14]} />
        <KPICard icon="&#x1F4F1;" label="Streams Started" value={dashboard?.eventsByType?.stream_started || 0} trend={-3} sparklineData={[8, 6, 10, 7, 5, 9, 7]} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
        <TrendCard label="Requests/sec" value={rtMetrics.requestsPerSec || 0} icon="&#x26A1;" color="var(--accent)" />
        <TrendCard label="Avg Response" value={rtMetrics.avgResponseTime || 0} suffix="ms" icon="&#x23F1;" color="var(--cyan)" />
        <TrendCard label="Error Rate" value={rtMetrics.errorRate || 0} suffix="%" icon="&#x26A0;" color="var(--red)" />
        <TrendCard label="Active Users" value={rtMetrics.activeUsers || 0} icon="&#x1F465;" color="var(--blue)" />
      </div>

      <div className="analytics-grid">
        <div className="analytics-card card-static card">
          <h3 className="analytics-card-title">Views Over Time</h3>
          <LineChart data={viewsOverTime} labels={dailyLabels} height={220} color="var(--accent)" />
        </div>

        <div className="analytics-card card-static card">
          <h3 className="analytics-card-title">Feature Usage</h3>
          <BarChart data={featureData.slice(0, 8)} horizontal />
        </div>

        <div className="analytics-card card-static card">
          <h3 className="analytics-card-title">Traffic Sources</h3>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <PieChart data={sourceData} donut size={180} colors={['#3b82f6', '#22c55e', '#f97316', '#a78bfa']} />
          </div>
        </div>

        <div className="analytics-card card-static card">
          <h3 className="analytics-card-title">Peak Hours</h3>
          <HeatMap data={peakHours.map(h => h.count)} />
        </div>
      </div>

      {realtime?.anomalies?.length > 0 && (
        <div className="analytics-card card-static card" style={{ marginBottom: 20, borderColor: 'rgba(249,115,22,0.3)' }}>
          <h3 className="analytics-card-title" style={{ color: 'var(--orange)' }}>Real-time Anomalies</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {realtime.anomalies.map((a, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '8px 12px', borderRadius: 6,
                background: a.severity === 'critical' ? 'rgba(239,68,68,0.08)' : 'rgba(249,115,22,0.08)',
                fontSize: 13, color: 'var(--text-200)'
              }}>
                <span>{a.severity === 'critical' ? '&#x1F6A8;' : '&#x26A0;'}</span>
                {a.message}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="analytics-bottom-row">
        <div className="analytics-card card-static card analytics-activity-card">
          <ActivityFeed events={dashboard?.recentEvents || []} />
        </div>

        <div className="analytics-card card-static card analytics-perf-card">
          <h3 className="analytics-card-title">Performance</h3>
          <div className="performance-panel">
            <div className="perf-health">
              <div className="perf-health-score" data-status={health?.status}>
                {health?.score || 0}
              </div>
              <div className="perf-health-label">Health Score</div>
              <div className={`perf-health-status perf-${health?.status}`}>{health?.status || 'unknown'}</div>
            </div>
            <div className="perf-metrics">
              <div className="perf-metric">
                <span className="perf-metric-label">API Response</span>
                <span className="perf-metric-value">{performance?.api_response_time?.current || 0}ms</span>
                <SparkLine data={performance?.api_response_time?.history?.map(h => h.value) || []} width={80} height={20} color="var(--cyan)" />
              </div>
              <div className="perf-metric">
                <span className="perf-metric-label">Memory</span>
                <span className="perf-metric-value">{performance?.memory_usage?.current || 0}MB</span>
                <SparkLine data={performance?.memory_usage?.history?.map(h => h.value) || []} width={80} height={20} color="var(--green)" />
              </div>
              <div className="perf-metric">
                <span className="perf-metric-label">Socket Latency</span>
                <span className="perf-metric-value">{performance?.socket_latency?.current || 0}ms</span>
              </div>
              <div className="perf-metric">
                <span className="perf-metric-label">Connections</span>
                <span className="perf-metric-value">{performance?.active_connections?.current || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="analytics-card card-static card analytics-leaderboard">
        <h3 className="analytics-card-title">User Leaderboard</h3>
        <div className="leaderboard-list">
          {(dashboard?.recentEvents || [])
            .reduce((acc, e) => {
              const existing = acc.find(a => a.userId === e.userId);
              if (existing) existing.count++;
              else acc.push({ userId: e.userId, count: 1 });
              return acc;
            }, [])
            .sort((a, b) => b.count - a.count)
            .slice(0, 10)
            .map((user, i) => (
              <div key={user.userId} className="leaderboard-item">
                <span className="leaderboard-rank">#{i + 1}</span>
                <span className="leaderboard-user">{user.userId}</span>
                <span className="leaderboard-count">{user.count} events</span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
