import BotCard from './BotCard';
import StepGuide from './StepGuide';
import { fadeInMessage } from './sparkAnimations';

function SparkAvatar() {
  return (
    <div className="spark-avatar">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </svg>
    </div>
  );
}

function formatTime(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function ChatMessage({ message, onAction }) {
  const isUser = message.role === 'user';

  const handleCardAction = (actionId) => {
    onAction?.(actionId);
  };

  return (
    <div
      className={`spark-message ${isUser ? 'spark-message-user' : 'spark-message-bot'}`}
      style={fadeInMessage}
    >
      {!isUser && <SparkAvatar />}
      <div className="spark-message-body">
        {!isUser && message.title && (
          <div className="spark-message-title">{message.title}</div>
        )}
        {message.type === 'card' && !isUser ? (
          <BotCard
            title={message.title}
            content={message.content}
            actions={message.actions?.map(a => ({ ...a, onClick: () => handleCardAction(a.id) }))}
          />
        ) : message.type === 'steps' && !isUser ? (
          <StepGuide steps={message.steps} />
        ) : (
          <div className="spark-message-text">{message.content}</div>
        )}
        <div className="spark-message-time">{formatTime(message.timestamp)}</div>
      </div>
      {isUser && <div className="spark-avatar spark-avatar-user">You</div>}
    </div>
  );
}
