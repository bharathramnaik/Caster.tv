import { useState, useEffect, useCallback } from 'react';

export default function ProactiveSuggestion({ suggestions = [], onAccept, onDismiss }) {
  const [visible, setVisible] = useState(false);
  const [current, setCurrent] = useState(null);
  const [dismissedIds, setDismissedIds] = useState(new Set());

  useEffect(() => {
    const available = suggestions.find(s => !dismissedIds.has(s.id));
    if (available && !visible) {
      setCurrent(available);
      const timer = setTimeout(() => setVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, [suggestions, dismissedIds, visible]);

  useEffect(() => {
    if (visible && current) {
      const timer = setTimeout(() => {
        setVisible(false);
        setDismissedIds(prev => new Set([...prev, current.id]));
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [visible, current]);

  const handleDismiss = useCallback(() => {
    if (current) {
      setDismissedIds(prev => new Set([...prev, current.id]));
    }
    setVisible(false);
    onDismiss?.();
  }, [current, onDismiss]);

  const handleAccept = useCallback(() => {
    if (current) {
      onAccept?.(current);
      setDismissedIds(prev => new Set([...prev, current.id]));
    }
    setVisible(false);
  }, [current, onAccept]);

  if (!visible || !current) return null;

  return (
    <div className="spark-suggestion">
      <div className="spark-suggestion-header">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
        <span>Need help?</span>
      </div>
      <div className="spark-suggestion-body">
        <p>{current.text}</p>
      </div>
      <div className="spark-suggestion-actions">
        <button className="spark-suggestion-btn spark-suggestion-yes" onClick={handleAccept}>
          Yes
        </button>
        <button className="spark-suggestion-btn spark-suggestion-no" onClick={handleDismiss}>
          No, thanks
        </button>
      </div>
    </div>
  );
}
