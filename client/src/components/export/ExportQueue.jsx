import { useCallback } from 'react';

const STATUS_CONFIG = {
  pending: { label: 'Pending', color: 'var(--text-400)', icon: '\u{23F3}' },
  processing: { label: 'Processing', color: 'var(--accent)', icon: '\u{25B6}' },
  completed: { label: 'Completed', color: 'var(--success, #22c55e)', icon: '\u{2714}' },
  failed: { label: 'Failed', color: 'var(--danger, #ef4444)', icon: '\u{2716}' },
  cancelled: { label: 'Cancelled', color: 'var(--text-500)', icon: '\u{23F9}' },
};

function ProgressBar({ progress }) {
  return (
    <div className="export-progress-bar">
      <div
        className="export-progress-fill"
        style={{ width: `${progress}%` }}
      />
      <span className="export-progress-text">{Math.round(progress)}%</span>
    </div>
  );
}

function QueueItem({ job, onCancel, onRetry, onRemove }) {
  const status = STATUS_CONFIG[job.status] || STATUS_CONFIG.pending;
  const isActive = job.status === 'processing';
  const isFailed = job.status === 'failed';
  const isCompleted = job.status === 'completed';
  const isPending = job.status === 'pending';

  return (
    <div className={`export-queue-item ${job.status}`}>
      <div className="export-queue-item-header">
        <span className="export-queue-item-icon">{status.icon}</span>
        <span className="export-queue-item-label">{job.label || job.format}</span>
        <span
          className="export-queue-item-status"
          style={{ color: status.color }}
        >
          {status.label}
        </span>
      </div>

      {isActive && (
        <ProgressBar progress={job.progress || 0} />
      )}

      {isFailed && job.error && (
        <div className="export-queue-item-error">{job.error}</div>
      )}

      {isCompleted && (
        <div className="export-queue-item-info">
          Export completed successfully
        </div>
      )}

      <div className="export-queue-item-footer">
        <span className="export-queue-item-time">
          {new Date(job.createdAt).toLocaleTimeString()}
        </span>
        <div className="export-queue-item-actions">
          {isPending && (
            <button
              className="btn btn-sm btn-danger"
              onClick={() => onRemove(job.id)}
            >
              Remove
            </button>
          )}
          {isActive && (
            <button
              className="btn btn-sm btn-danger"
              onClick={() => onCancel(job.id)}
            >
              Cancel
            </button>
          )}
          {isFailed && (
            <button
              className="btn btn-sm btn-secondary"
              onClick={() => onRetry(job.id)}
            >
              Retry
            </button>
          )}
          {isCompleted && (
            <button
              className="btn btn-sm btn-secondary"
              onClick={() => onRemove(job.id)}
            >
              Clear
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ExportQueue({ queue, processing, onRunQueue, onCancel, onRetry, onRemove }) {
  const pendingCount = queue.filter(j => j.status === 'pending').length;
  const activeCount = queue.filter(j => j.status === 'processing').length;
  const completedCount = queue.filter(j => j.status === 'completed').length;
  const failedCount = queue.filter(j => j.status === 'failed').length;

  const handleClearCompleted = useCallback(() => {
    queue.filter(j => j.status === 'completed').forEach(j => onRemove(j.id));
  }, [queue, onRemove]);

  const handleClearAll = useCallback(() => {
    queue.filter(j => j.status !== 'processing').forEach(j => onRemove(j.id));
  }, [queue, onRemove]);

  if (queue.length === 0) {
    return (
      <div className="export-queue-empty">
        <div className="export-queue-empty-icon">\u{1F4CB}</div>
        <p className="export-queue-empty-text">Export queue is empty</p>
        <p className="export-queue-empty-hint">
          Use the export tabs to add items to the queue
        </p>
      </div>
    );
  }

  return (
    <div className="export-queue">
      <div className="export-queue-stats">
        <div className="export-queue-stat">
          <span className="export-queue-stat-value">{queue.length}</span>
          <span className="export-queue-stat-label">Total</span>
        </div>
        <div className="export-queue-stat">
          <span className="export-queue-stat-value" style={{ color: 'var(--text-400)' }}>{pendingCount}</span>
          <span className="export-queue-stat-label">Pending</span>
        </div>
        <div className="export-queue-stat">
          <span className="export-queue-stat-value" style={{ color: 'var(--accent)' }}>{activeCount}</span>
          <span className="export-queue-stat-label">Active</span>
        </div>
        <div className="export-queue-stat">
          <span className="export-queue-stat-value" style={{ color: 'var(--success, #22c55e)' }}>{completedCount}</span>
          <span className="export-queue-stat-label">Done</span>
        </div>
        {failedCount > 0 && (
          <div className="export-queue-stat">
            <span className="export-queue-stat-value" style={{ color: 'var(--danger, #ef4444)' }}>{failedCount}</span>
            <span className="export-queue-stat-label">Failed</span>
          </div>
        )}
      </div>

      <div className="export-queue-actions-bar">
        {pendingCount > 0 && (
          <button
            className="btn btn-sm btn-primary"
            onClick={onRunQueue}
            disabled={processing}
          >
            {processing ? 'Processing...' : `Process ${pendingCount} Pending`}
          </button>
        )}
        {completedCount > 0 && (
          <button
            className="btn btn-sm btn-secondary"
            onClick={handleClearCompleted}
          >
            Clear Completed
          </button>
        )}
        <button
          className="btn btn-sm btn-secondary"
          onClick={handleClearAll}
        >
          Clear All
        </button>
      </div>

      <div className="export-queue-list">
        {queue.map(job => (
          <QueueItem
            key={job.id}
            job={job}
            onCancel={onCancel}
            onRetry={onRetry}
            onRemove={onRemove}
          />
        ))}
      </div>
    </div>
  );
}
