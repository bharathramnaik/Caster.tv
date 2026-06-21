export default function BotCard({ title, content, actions = [], image }) {
  return (
    <div className="spark-card">
      {image && (
        <div className="spark-card-image">
          <img src={image} alt={title || 'Card'} />
        </div>
      )}
      {title && (
        <div className="spark-card-header">
          <svg className="spark-card-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
          </svg>
          <span>{title}</span>
        </div>
      )}
      {content && <div className="spark-card-content">{content}</div>}
      {actions.length > 0 && (
        <div className="spark-card-actions">
          {actions.map((action, i) => (
            <button
              key={action.id || i}
              className="spark-card-btn"
              onClick={() => action.onClick?.()}
              data-action-id={action.id}
            >
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
