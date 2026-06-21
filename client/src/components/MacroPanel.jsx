import { useState } from 'react';

/**
 * MacroPanel - Controls for recording, saving, and playing macros.
 * @param {Object} props
 * @param {boolean} props.isRecording - Whether currently recording
 * @param {Array} props.macros - List of saved macros
 * @param {Function} props.onStartRecord
 * @param {Function} props.onStopRecord
 * @param {Function} props.onSaveMacro - Callback with macro name
 * @param {Function} props.onPlayMacro - Callback with macro ID
 * @param {Function} props.onDeleteMacro - Callback with macro ID
 */
export default function MacroPanel({
  isRecording = false,
  macros = [],
  onStartRecord,
  onStopRecord,
  onSaveMacro,
  onPlayMacro,
  onDeleteMacro
}) {
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [macroName, setMacroName] = useState('');

  const handleSave = () => {
    if (macroName.trim()) {
      onSaveMacro?.(macroName.trim());
      setMacroName('');
      setShowSaveDialog(false);
    }
  };

  const handleRecordToggle = () => {
    if (isRecording) {
      onStopRecord?.();
      setShowSaveDialog(true);
    } else {
      onStartRecord?.();
    }
  };

  const formatDuration = (ms) => {
    if (!ms) return '0:00';
    const secs = Math.floor(ms / 1000);
    const mins = Math.floor(secs / 60);
    return `${mins}:${String(secs % 60).padStart(2, '0')}`;
  };

  return (
    <div className="macro-panel" style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      padding: '12px',
      background: 'var(--bg-800)',
      borderRadius: 'var(--radius-md)',
      border: '1px solid var(--glass-border)'
    }}>
      <div style={{
        fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-400)',
        textTransform: 'uppercase', letterSpacing: '0.1em'
      }}>
        Macros
      </div>

      {/* Record/Stop/Save controls */}
      <div style={{ display: 'flex', gap: '6px' }}>
        <button
          onClick={handleRecordToggle}
          style={{
            flex: 1,
            padding: '8px',
            border: 'none',
            borderRadius: 'var(--radius-sm)',
            background: isRecording ? 'var(--red)' : 'var(--bg-700)',
            color: isRecording ? '#fff' : 'var(--text-300)',
            fontSize: '0.78rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.15s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px'
          }}
        >
          <span style={{
            width: '8px',
            height: '8px',
            borderRadius: isRecording ? '2px' : '50%',
            background: isRecording ? '#fff' : 'var(--red)',
            display: 'inline-block'
          }} />
          {isRecording ? 'Stop Rec' : 'Record'}
        </button>

        {isRecording && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '0 8px',
            fontSize: '0.7rem',
            color: 'var(--red)',
            fontWeight: 600,
            animation: 'pulse 1.5s infinite'
          }}>
            <span style={{
              width: '6px', height: '6px',
              borderRadius: '50%',
              background: 'var(--red)'
            }} />
            REC
          </div>
        )}
      </div>

      {/* Save dialog */}
      {showSaveDialog && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
          padding: '8px',
          background: 'var(--bg-700)',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--accent)'
        }}>
          <input
            type="text"
            value={macroName}
            onChange={(e) => setMacroName(e.target.value)}
            placeholder="Macro name..."
            autoFocus
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            style={{
              width: '100%',
              padding: '6px 8px',
              background: 'var(--bg-800)',
              border: '1px solid var(--glass-border)',
              borderRadius: '4px',
              color: 'var(--text-100)',
              fontSize: '0.78rem',
              outline: 'none'
            }}
          />
          <div style={{ display: 'flex', gap: '4px' }}>
            <button
              onClick={handleSave}
              style={{
                flex: 1, padding: '5px', border: 'none',
                borderRadius: '4px', background: 'var(--accent)',
                color: '#000', fontSize: '0.72rem', fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Save
            </button>
            <button
              onClick={() => { setShowSaveDialog(false); setMacroName(''); }}
              style={{
                flex: 1, padding: '5px', border: '1px solid var(--glass-border)',
                borderRadius: '4px', background: 'var(--bg-700)',
                color: 'var(--text-400)', fontSize: '0.72rem',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Macro list */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '3px',
        maxHeight: '150px',
        overflowY: 'auto'
      }}>
        {macros.length === 0 ? (
          <div style={{
            padding: '12px',
            textAlign: 'center',
            color: 'var(--text-500)',
            fontSize: '0.72rem'
          }}>
            No macros recorded
          </div>
        ) : (
          macros.map((macro) => (
            <div
              key={macro.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 8px',
                background: 'var(--bg-700)',
                borderRadius: '4px',
                transition: 'background 0.15s'
              }}
            >
              <div style={{
                flex: 1,
                minWidth: 0
              }}>
                <div style={{
                  fontSize: '0.75rem',
                  color: 'var(--text-200)',
                  fontWeight: 600,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {macro.name}
                </div>
                <div style={{
                  fontSize: '0.6rem',
                  color: 'var(--text-500)',
                  display: 'flex',
                  gap: '8px'
                }}>
                  <span>{macro.actionCount || 0} actions</span>
                  {macro.duration > 0 && <span>{formatDuration(macro.duration)}</span>}
                </div>
              </div>
              <button
                onClick={() => onPlayMacro?.(macro.id)}
                title="Play macro"
                style={{
                  width: '22px', height: '22px',
                  border: 'none', borderRadius: '3px',
                  background: 'var(--accent-dim)',
                  color: 'var(--accent)',
                  fontSize: '0.65rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                ▶
              </button>
              <button
                onClick={() => onDeleteMacro?.(macro.id)}
                title="Delete macro"
                style={{
                  width: '22px', height: '22px',
                  border: 'none', borderRadius: '3px',
                  background: 'transparent',
                  color: 'var(--text-500)',
                  fontSize: '0.65rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                ✕
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
