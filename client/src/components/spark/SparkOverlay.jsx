import { useState, useEffect } from 'react';

export default function SparkOverlay({ overlay, onClose }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState(null);

  const steps = overlay?.steps || [];

  useEffect(() => {
    if (steps.length === 0) return;

    const step = steps[currentStep];
    if (!step?.target) {
      setTargetRect(null);
      return;
    }

    const findAndHighlight = () => {
      const el = document.querySelector(step.target);
      if (el) {
        const rect = el.getBoundingClientRect();
        setTargetRect(rect);
      } else {
        setTargetRect(null);
      }
    };

    const timer = setTimeout(findAndHighlight, 100);
    return () => clearTimeout(timer);
  }, [currentStep, steps]);

  useEffect(() => {
    if (!overlay) {
      setCurrentStep(0);
      setTargetRect(null);
    }
  }, [overlay]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const handleSkip = () => {
    onClose();
  };

  if (!overlay || steps.length === 0) return null;

  const step = steps[currentStep];

  return (
    <div className="spark-overlay">
      {targetRect && (
        <div
          className="spark-spotlight"
          style={{
            top: targetRect.top - 8,
            left: targetRect.left - 8,
            width: targetRect.width + 16,
            height: targetRect.height + 16,
          }}
        />
      )}
      {step && (
        <div
          className="spark-tooltip"
          style={targetRect ? {
            top: targetRect.bottom + 16,
            left: targetRect.left,
          } : {
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        >
          <div className="spark-tooltip-title">{step.title}</div>
          <div className="spark-tooltip-desc">{step.description}</div>
          <div className="spark-tooltip-actions">
            <button className="spark-tooltip-btn" onClick={handleSkip}>
              Skip
            </button>
            <span className="spark-tooltip-step">
              {currentStep + 1} / {steps.length}
            </span>
            <button className="spark-tooltip-btn spark-tooltip-btn-primary" onClick={handleNext}>
              {currentStep === steps.length - 1 ? 'Finish' : 'Next'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
