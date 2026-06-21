import { useState } from 'react';

export default function StepGuide({ steps = [] }) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [completed, setCompleted] = useState(new Set());
  const total = steps.length;
  const progress = total > 0 ? ((activeIdx + 1) / total) * 100 : 0;

  const handleNext = () => {
    if (activeIdx < total - 1) {
      setCompleted(prev => new Set([...prev, activeIdx]));
      setActiveIdx(activeIdx + 1);
    }
  };

  const handlePrev = () => {
    if (activeIdx > 0) {
      setActiveIdx(activeIdx - 1);
    }
  };

  if (total === 0) return null;

  return (
    <div className="spark-steps">
      <div className="spark-progress">
        <div className="spark-progress-fill" style={{ width: `${progress}%` }} />
      </div>
      <div className="spark-steps-list">
        {steps.map((step, i) => {
          const isActive = i === activeIdx;
          const isDone = completed.has(i);
          return (
            <div
              key={i}
              className={`spark-step ${isActive ? 'active' : ''} ${isDone ? 'completed' : ''}`}
            >
              <div className="spark-step-number">
                {isDone ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  <span>{i + 1}</span>
                )}
              </div>
              <div className="spark-step-body">
                {step.icon && <span className="spark-step-icon">{step.icon}</span>}
                <div className="spark-step-text">
                  <div className="spark-step-title">{step.title}</div>
                  {step.description && (
                    <div className="spark-step-desc">{step.description}</div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="spark-steps-nav">
        <button className="spark-steps-btn" onClick={handlePrev} disabled={activeIdx === 0}>
          Previous
        </button>
        <span className="spark-steps-counter">{activeIdx + 1} / {total}</span>
        <button className="spark-steps-btn spark-steps-btn-primary" onClick={handleNext} disabled={activeIdx === total - 1}>
          Next
        </button>
      </div>
    </div>
  );
}
