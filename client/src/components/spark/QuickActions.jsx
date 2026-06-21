export default function QuickActions({ actions = [], onAction }) {
  if (actions.length === 0) return null;

  return (
    <div className="spark-quick-actions">
      {actions.map((action) => (
        <button
          key={action.id}
          className="spark-chip"
          onClick={() => onAction(action.id)}
        >
          {action.icon && <span className="spark-chip-icon">{action.icon}</span>}
          <span className="spark-chip-label">{action.label}</span>
        </button>
      ))}
    </div>
  );
}
