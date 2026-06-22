import { useState, useRef, useEffect } from 'react';
import useSpark from '../../hooks/useSpark';
import ChatMessage from './ChatMessage';
import QuickActions from './QuickActions';
import ProactiveSuggestion from './ProactiveSuggestion';
import SparkOverlay from './SparkOverlay';
import { pulseGlow, bounceSuggest, slideInChat } from './sparkAnimations';

function TypingIndicator() {
  return (
    <div className="spark-typing">
      <div className="spark-avatar">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
      </div>
      <div className="spark-typing-dots">
        <span className="spark-typing-dot" />
        <span className="spark-typing-dot" />
        <span className="spark-typing-dot" />
      </div>
    </div>
  );
}

export default function SparkBot() {
  const {
    isOpen,
    messages,
    isTyping,
    suggestions,
    quickActions,
    activeOverlay,
    sendMessage,
    executeAction,
    close,
    open,
    clearHistory,
    setActiveOverlay,
  } = useSpark();

  const [inputText, setInputText] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSend = () => {
    if (inputText.trim()) {
      sendMessage(inputText);
      setInputText('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleAcceptSuggestion = (suggestion) => {
    sendMessage('Help me get started');
    open();
  };

  const hasSuggestion = suggestions.length > 0 && !isOpen;

  return (
    <>
      {/* Floating bot button */}
      {!isOpen && (
        <button
          className={`spark-button glow-breathe ${hasSuggestion ? 'spark-button-bounce' : 'spark-button-pulse'}`}
          onClick={open}
          style={hasSuggestion ? bounceSuggest : pulseGlow}
          aria-label="Open Spark AI assistant"
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
          </svg>
        </button>
      )}

      {/* Chat window */}
      {isOpen && (
        <div className="spark-chat pulse-ring" style={slideInChat}>
          {/* Header */}
          <div className="spark-header">
            <div className="spark-header-left">
              <div className="spark-avatar spark-avatar-header">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
              </div>
              <div className="spark-header-info">
                <span className="spark-header-name">Spark</span>
                <span className="spark-header-status">
                  <span className="spark-status-dot" />
                  Online
                </span>
              </div>
            </div>
            <div className="spark-header-actions">
              <button
                className="spark-header-btn"
                onClick={() => setIsMinimized(!isMinimized)}
                title={isMinimized ? 'Expand' : 'Minimize'}
              >
                {isMinimized ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="18 15 12 9 6 15" />
                  </svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                )}
              </button>
              <button
                className="spark-header-btn spark-header-btn-close"
                onClick={close}
                title="Close"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          </div>

          {/* Body */}
          {!isMinimized && (
            <>
              <div className="spark-messages">
                {messages.map((msg) => (
                  <ChatMessage key={msg.id} message={msg} onAction={executeAction} />
                ))}
                {isTyping && <TypingIndicator />}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick actions */}
              <QuickActions actions={quickActions} onAction={executeAction} />

              {/* Input */}
              <div className="spark-input">
                <button className="spark-input-mic" title="Voice input (coming soon)">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                    <line x1="12" y1="19" x2="12" y2="23" />
                    <line x1="8" y1="23" x2="16" y2="23" />
                  </svg>
                </button>
                <input
                  ref={inputRef}
                  type="text"
                  className="spark-input-field"
                  placeholder="Ask Spark anything..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
                <button
                  className="spark-input-send"
                  onClick={handleSend}
                  disabled={!inputText.trim()}
                  title="Send message"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Proactive suggestion */}
      <ProactiveSuggestion
        suggestions={suggestions}
        onAccept={handleAcceptSuggestion}
        onDismiss={() => {}}
      />

      {/* Walkthrough overlay */}
      <SparkOverlay
        overlay={activeOverlay}
        onClose={() => setActiveOverlay(null)}
      />
    </>
  );
}
