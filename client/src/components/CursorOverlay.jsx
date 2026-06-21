import { useState, useEffect, useRef } from 'react';

export default function CursorOverlay({ socket, projectId, currentUser, containerRef }) {
  const [cursors, setCursors] = useState({});
  const animationRef = useRef({});

  useEffect(() => {
    if (!socket || !projectId) return;

    const handleCursorMoved = (data) => {
      if (data.userId === currentUser?.id) return;

      setCursors(prev => ({
        ...prev,
        [data.userId]: {
          x: data.x,
          y: data.y,
          color: data.color || '#64748b',
          targetId: data.targetId,
          displayName: data.displayName || data.userId,
          lastUpdate: Date.now()
        }
      }));

      if (animationRef.current[data.userId]) {
        clearTimeout(animationRef.current[data.userId]);
      }

      animationRef.current[data.userId] = setTimeout(() => {
        setCursors(prev => {
          const next = { ...prev };
          delete next[data.userId];
          return next;
        });
      }, 5000);
    };

    const handleUserLeft = (data) => {
      setCursors(prev => {
        const next = { ...prev };
        delete next[data.userId];
        return next;
      });
      if (animationRef.current[data.userId]) {
        clearTimeout(animationRef.current[data.userId]);
      }
    };

    socket.on('collab:cursor-moved', handleCursorMoved);
    socket.on('collab:user-left', handleUserLeft);

    return () => {
      socket.off('collab:cursor-moved', handleCursorMoved);
      socket.off('collab:user-left', handleUserLeft);
      Object.values(animationRef.current).forEach(clearTimeout);
    };
  }, [socket, projectId, currentUser]);

  return (
    <div className="cursor-overlay">
      {Object.entries(cursors).map(([userId, cursor]) => (
        <div
          key={userId}
          className="cursor-wrapper"
          style={{
            left: cursor.x,
            top: cursor.y,
            transform: 'translate(-2px, -2px)'
          }}
        >
          <svg
            className="cursor-arrow"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            style={{ filter: `drop-shadow(0 1px 2px rgba(0,0,0,0.5))` }}
          >
            <path
              d="M5.65 5.65L12 20l2.5-7.5L22 10 5.65 5.65z"
              fill={cursor.color}
              stroke="#fff"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
          </svg>
          <span
            className="cursor-label"
            style={{
              background: cursor.color,
              color: '#fff',
              left: 18,
              top: 14
            }}
          >
            {cursor.displayName}
          </span>
        </div>
      ))}
    </div>
  );
}
