import { useState, useEffect, useRef } from 'react';

const API = import.meta.env.VITE_API_URL || '';

function getAuthHeaders() {
  const token = localStorage.getItem('sc-token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/**
 * LiveScoreTicker - Horizontal scrolling ticker of live scores.
 * Auto-updates every 30 seconds.
 */
export default function LiveScoreTicker({ sport }) {
  const [scores, setScores] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [filter, setFilter] = useState(sport || 'all');
  const tickerRef = useRef(null);
  const [isPaused, setIsPaused] = useState(false);

  const fetchScores = async () => {
    try {
      const url = filter !== 'all'
        ? `${API}/api/integrations/scores/${filter}`
        : `${API}/api/integrations/scores`;
      const res = await fetch(url, { headers: getAuthHeaders() });
      if (res.ok) {
        const data = await res.json();
        setScores(data);
      }
    } catch (err) {
      console.error('Failed to fetch scores:', err);
    }
  };

  useEffect(() => {
    fetchScores();
    const interval = setInterval(fetchScores, 30000);
    return () => clearInterval(interval);
  }, [filter]);

  const toggleExpand = (scoreId) => {
    setExpanded(expanded === scoreId ? null : scoreId);
  };

  if (scores.length === 0) {
    return (
      <div className="score-ticker score-ticker-empty">
        <span>No live scores. Add a score feed to get started.</span>
      </div>
    );
  }

  return (
    <div className="score-ticker-wrapper">
      <div className="score-ticker-filters">
        {['all', 'cricket', 'football', 'basketball'].map(s => (
          <button
            key={s}
            className={`btn btn-sm ${filter === s ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilter(s)}
          >
            {s === 'all' ? 'All Sports' : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      <div
        className="score-ticker"
        ref={tickerRef}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div className={`score-ticker-track ${isPaused ? 'paused' : ''}`}>
          {scores.map((score) => (
            <div
              key={score.id}
              className={`score-item ${score.status === 'live' ? 'score-live' : ''} ${expanded === score.id ? 'score-expanded' : ''}`}
              onClick={() => toggleExpand(score.id)}
            >
              <div className="score-item-main">
                <span className="score-league">{score.league}</span>
                <div className="score-teams">
                  <span className="score-home">{score.homeTeam?.short || 'HOME'}</span>
                  <span className="score-value">{score.score}</span>
                  <span className="score-away">{score.awayTeam?.short || 'AWAY'}</span>
                </div>
                <span className={`score-status ${score.status === 'live' ? 'score-status-live' : ''}`}>
                  {score.statusText || score.status}
                </span>
              </div>

              {expanded === score.id && (
                <div className="score-details">
                  <div className="score-detail-row">
                    <span>{score.homeTeam?.name}</span>
                    <span className="score-detail-value">{score.scoreHome}</span>
                  </div>
                  <div className="score-detail-row">
                    <span>{score.awayTeam?.name}</span>
                    <span className="score-detail-value">{score.scoreAway}</span>
                  </div>
                  {score.period && (
                    <div className="score-detail-row">
                      <span>Period</span>
                      <span>{score.period}</span>
                    </div>
                  )}
                  {score.time && (
                    <div className="score-detail-row">
                      <span>Time</span>
                      <span>{score.time}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
