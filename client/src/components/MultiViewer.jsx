import { useState, useCallback } from 'react';

/**
 * MultiViewer - Grid layout of input previews with tally indicators.
 * @param {Object} props
 * @param {Array} props.inputs - Array of input configs { id, name, type }
 * @param {string|null} props.programInput - Current program input ID
 * @param {string|null} props.previewInput - Current preview input ID
 * @param {Function} props.onSelectInput - Callback when input selected (inputId, isDirectCut)
 * @param {string} [props.layout='4x2'] - Layout type
 */
export default function MultiViewer({
  inputs = [],
  programInput,
  previewInput,
  onSelectInput,
  layout = '4x2'
}) {
  const [draggedCell, setDraggedCell] = useState(null);

  const layoutConfig = {
    '2x1': { cols: 2, rows: 1 },
    '2x2': { cols: 2, rows: 2 },
    '3x1': { cols: 3, rows: 1 },
    '3x2': { cols: 3, rows: 2 },
    '4x2': { cols: 4, rows: 2 },
  };

  const config = layoutConfig[layout] || layoutConfig['4x2'];
  const cellCount = config.cols * config.rows;

  const getTallyClass = useCallback((inputId) => {
    if (inputId === programInput) return 'tally-program';
    if (inputId === previewInput) return 'tally-preview';
    return '';
  }, [programInput, previewInput]);

  const handleClick = useCallback((inputId, e) => {
    if (onSelectInput) {
      onSelectInput(inputId, e.shiftKey);
    }
  }, [onSelectInput]);

  const handleDragStart = useCallback((cellIdx) => {
    setDraggedCell(cellIdx);
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
  }, []);

  const handleDrop = useCallback((targetIdx) => {
    if (draggedCell !== null && draggedCell !== targetIdx) {
      // Swap logic would go through parent callback
      setDraggedCell(null);
    }
  }, [draggedCell]);

  const getTypeIcon = (type) => {
    const icons = { scene: '🎬', camera: '📷', media: '🎞️', ndi: '📡' };
    return icons[type] || '📺';
  };

  return (
    <div
      className="multiview-grid"
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${config.cols}, 1fr)`,
        gridTemplateRows: `repeat(${config.rows}, 1fr)`,
        gap: '4px',
        width: '100%',
        height: '100%'
      }}
    >
      {Array.from({ length: cellCount }).map((_, idx) => {
        const input = inputs[idx];
        const tallyClass = input ? getTallyClass(input.id) : '';

        return (
          <div
            key={idx}
            className={`multiview-cell ${tallyClass}`}
            draggable={!!input}
            onDragStart={() => handleDragStart(idx)}
            onDragOver={handleDragOver}
            onDrop={() => handleDrop(idx)}
            onClick={(e) => input && handleClick(input.id, e)}
            style={{
              position: 'relative',
              background: 'var(--bg-700)',
              borderRadius: '4px',
              overflow: 'hidden',
              cursor: input ? 'pointer' : 'default',
              minHeight: '80px',
              border: tallyClass === 'tally-program'
                ? '2px solid var(--red)'
                : tallyClass === 'tally-preview'
                  ? '2px solid var(--green)'
                  : '1px solid var(--glass-border)',
              transition: 'border-color 0.2s, box-shadow 0.2s',
              boxShadow: tallyClass === 'tally-program'
                ? '0 0 12px rgba(239,68,68,0.4)'
                : tallyClass === 'tally-preview'
                  ? '0 0 12px rgba(34,197,94,0.3)'
                  : 'none'
            }}
          >
            {input ? (
              <>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  gap: '4px',
                  padding: '8px'
                }}>
                  <span style={{ fontSize: '1.5rem' }}>{getTypeIcon(input.type)}</span>
                  <span style={{
                    fontSize: '0.7rem',
                    color: 'var(--text-200)',
                    fontWeight: 600,
                    textAlign: 'center',
                    lineHeight: 1.2,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    maxWidth: '100%'
                  }}>
                    {input.name}
                  </span>
                  <span style={{
                    fontSize: '0.55rem',
                    color: 'var(--text-500)',
                    textTransform: 'uppercase'
                  }}>
                    {input.type}
                  </span>
                </div>
                {tallyClass && (
                  <div style={{
                    position: 'absolute',
                    top: '4px',
                    left: '4px',
                    padding: '1px 6px',
                    borderRadius: '3px',
                    fontSize: '0.55rem',
                    fontWeight: 700,
                    color: '#fff',
                    background: tallyClass === 'tally-program' ? 'var(--red)' : 'var(--green)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    {tallyClass === 'tally-program' ? 'PGM' : 'PST'}
                  </div>
                )}
              </>
            ) : (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                color: 'var(--text-500)',
                fontSize: '0.75rem'
              }}>
                Input {idx + 1}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
