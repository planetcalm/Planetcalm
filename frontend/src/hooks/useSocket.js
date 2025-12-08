import { useEffect, useRef, useCallback, useState } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

/**
 * Custom hook for Socket.io connection
 * Handles real-time updates for new members and member count
 */
export const useSocket = (callbacks = {}) => {
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(null);

  const { onNewMember, onMemberCount, onConnect, onDisconnect } = callbacks;

  // Initialize socket connection
  useEffect(() => {
    // Create socket connection
    socketRef.current = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
    });

    const socket = socketRef.current;

    // Connection event handlers
    socket.on('connect', () => {
      console.log('🔌 Socket connected:', socket.id);
      setIsConnected(true);
      setConnectionError(null);
      onConnect?.();
    });

    socket.on('disconnect', (reason) => {
      console.log('🔌 Socket disconnected:', reason);
      setIsConnected(false);
      onDisconnect?.(reason);
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setConnectionError(error.message);
    });

    // Custom event handlers
    socket.on('new-member', (member) => {
      console.log('📍 New member received:', member);
      onNewMember?.(member);
    });

    socket.on('member-count', ({ count }) => {
      console.log('📊 Member count updated:', count);
      onMemberCount?.(count);
    });

    // Cleanup on unmount
    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('connect_error');
      socket.off('new-member');
      socket.off('member-count');
      socket.close();
    };
  }, [onNewMember, onMemberCount, onConnect, onDisconnect]);

  // Request member count from server
  const requestMemberCount = useCallback(() => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('get-member-count');
    }
  }, []);

  return {
    isConnected,
    connectionError,
    requestMemberCount,
    socket: socketRef.current,
  };
};

export default useSocket;
