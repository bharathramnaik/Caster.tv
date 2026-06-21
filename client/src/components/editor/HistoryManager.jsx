import { useState, useCallback, useRef, useEffect } from 'react';

const MAX_HISTORY = 100;

export default function HistoryManager({ template, onRestore }) {
  const [history, setHistory] = useState([]);
  const [pointer, setPointer] = useState(-1);
  const lastSavedRef = useRef(JSON.stringify(template));
  const skipNextRef = useRef(false);

  useEffect(() => {
    if (skipNextRef.current) {
      skipNextRef.current = false;
      return;
    }
    const snapshot = JSON.stringify(template);
    if (snapshot === lastSavedRef.current) return;
    lastSavedRef.current = snapshot;

    setHistory(prev => {
      const trimmed = prev.slice(0, pointer + 1);
      const next = [...trimmed, { snapshot, timestamp: Date.now() }];
      if (next.length > MAX_HISTORY) next.shift();
      return next;
    });
    setPointer(prev => Math.min(prev + 1, MAX_HISTORY - 1));
  }, [template, pointer]);

  const undo = useCallback(() => {
    if (pointer <= 0) return;
    const newPointer = pointer - 1;
    setPointer(newPointer);
    skipNextRef.current = true;
    const parsed = JSON.parse(history[newPointer].snapshot);
    onRestore(parsed);
  }, [pointer, history, onRestore]);

  const redo = useCallback(() => {
    if (pointer >= history.length - 1) return;
    const newPointer = pointer + 1;
    setPointer(newPointer);
    skipNextRef.current = true;
    const parsed = JSON.parse(history[newPointer].snapshot);
    onRestore(parsed);
  }, [pointer, history, onRestore]);

  useEffect(() => {
    const handleKeyDown = e => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return;
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  const canUndo = pointer > 0;
  const canRedo = pointer < history.length - 1;

  const jumpTo = useCallback((index) => {
    if (index < 0 || index >= history.length) return;
    setPointer(index);
    skipNextRef.current = true;
    const parsed = JSON.parse(history[index].snapshot);
    onRestore(parsed);
  }, [history, onRestore]);

  const clearHistory = useCallback(() => {
    const current = JSON.stringify(template);
    setHistory([{ snapshot: current, timestamp: Date.now() }]);
    setPointer(0);
    lastSavedRef.current = current;
  }, [template]);

  return (
    <div className="history-manager">
      <div className="history-controls">
        <button
          className="canvas-tool-btn"
          title="Undo (Ctrl+Z)"
          disabled={!canUndo}
          onClick={undo}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="1 4 1 10 7 10" />
            <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
          </svg>
        </button>
        <button
          className="canvas-tool-btn"
          title="Redo (Ctrl+Y)"
          disabled={!canRedo}
          onClick={redo}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 4 23 10 17 10" />
            <path d="M20.49 15a9 9 0 1 1-2.13-9.36L23 10" />
          </svg>
        </button>
      </div>
      <div className="history-count" title="History steps">
        {pointer + 1}/{history.length}
      </div>
    </div>
  );
}
