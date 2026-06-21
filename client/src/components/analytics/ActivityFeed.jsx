import { useRef, useEffect, useState } from 'react';

const EVENT_ICONS = {
  page_view: '\uD83D\uDCC4',
  action_performed: '\u2699\uFE0F',
  template_created: '\uD83D\uDCC8',
  scene_edited: '\uD83C\uDFA8',
  stream_started: '\uD83D\uDCF1',
  recording_started: '\u23FA',
  bot_message: '\uD83D\uDCE1',
  score: '\uD83C\uDFC6',
  wicket: '\uD83C\uDFBE'
};

function timeAgo(timestamp) {
  const diff = Date.now() - new Date(timestamp).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function ActivityFeed({ events = [], filter = null, maxItems = 50 }) {
  const listRef = useRef(null);
  const [activeFilter, setActiveFilter] = useState(filter);

  const filtered = activeFilter
    ? events.filter(e => e.event === activeFilter)
    : events;

  const displayed = filtered.slice(0, maxItems);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = 0;
    }
  }, [events.length]);

  const eventTypes = [...new Set(events.map(e => e.event))];

  return (
    <div className="activity-feed">
      <div className="activity-feed-header">
        <h4>Recent Activity</h4>
        <div className="activity-feed-filters">
          <button
            className={`activity-filter-btn ${!activeFilter ? 'active' : ''}`}
            onClick={() => setActiveFilter(null)}
          >
            All
          </button>
          {eventTypes.map(type => (
            <button
              key={type}
              className={`activity-filter-btn ${activeFilter === type ? 'active' : ''}`}
              onClick={() => setActiveFilter(type)}
            >
              {type.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>
      <div className="activity-feed-list" ref={listRef}>
        {displayed.length === 0 && (
          <div className="activity-feed-empty">No activity yet</div>
        )}
        {displayed.map((event, i) => (
          <div key={event.id || i} className="activity-item">
            <div className="activity-icon">
              {EVENT_ICONS[event.event] || '\uD83D\uDCCA'}
            </div>
            <div className="activity-content">
              <div className="activity-description">
                <span className="activity-event-type">{event.event.replace(/_/g, ' ')}</span>
                {event.data?.page && <span className="activity-page"> on {event.data.page}</span>}
                {event.data?.action && <span className="activity-action">: {event.data.action}</span>}
              </div>
              <div className="activity-meta">
                <span className="activity-user">{event.userId || 'system'}</span>
                <span className="activity-time">{timeAgo(event.timestamp)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
