import { useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';

const SERVER_URL = import.meta.env.VITE_API_URL || '';

export function useSocket(matchId) {
  const socketRef = useRef(null);
  const [matchState, setMatchState] = useState(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState(null);
  const [overlayCommand, setOverlayCommand] = useState(null);

  useEffect(() => {
    const socket = io(SERVER_URL || window.location.origin, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 20,
      reconnectionDelay: 1000
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      setConnected(true);
      setError(null);
      if (matchId) socket.emit('match:join', matchId);
    });

    socket.on('disconnect', () => setConnected(false));

    socket.on('match:state', (state) => {
      setMatchState(state);
      setError(null);
    });

    socket.on('match:error', (err) => setError(err.message || 'Unknown error'));

    socket.on('connect_error', () => setError('Connection failed'));

    // Overlay template commands from server
    socket.on('overlay:command', (cmd) => {
      setOverlayCommand(cmd);
    });

    return () => {
      if (matchId) socket.emit('match:leave', matchId);
      socket.disconnect();
    };
  }, [matchId]);

  const emit = useCallback((event, data) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, data);
    }
  }, []);

  const clearOverlayCommand = useCallback(() => {
    setOverlayCommand(null);
  }, []);

  return { matchState, connected, error, emit, overlayCommand, clearOverlayCommand };
}
