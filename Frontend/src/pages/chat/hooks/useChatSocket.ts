import { useEffect, useRef, useCallback } from 'react';
import { Socket } from 'socket.io-client';
import socketManager from '../../../Socket/SocketManager';
import { useAuth } from '../../../hooks/useAuth';
import type { SendMessageInput } from '../../../Validation/chatValidation';

export const useChatSocket = () => {
  const socketRef = useRef<Socket | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      socketRef.current = socketManager.connect(user._id, user.role);
    }
    return () => {
      // SocketManager handles lifecycle
    };
  }, [user]);

  const joinGroup = useCallback((groupId: string) => {
    socketRef.current?.emit('join:group', groupId);
  }, []);

  const sendMessage = useCallback((data: SendMessageInput) => {
    return new Promise((resolve, reject) => {
      socketRef.current?.emit('message:send', data, (response: any) => {
        if (response.status === 'ok') resolve(response.data);
        else reject(new Error(response.message));
      });
    });
  }, []);

  const sendTyping = useCallback((data: { chatType: 'DM' | 'GROUP', targetId: string }, isTyping: boolean) => {
    const event = isTyping ? 'typing:start' : 'typing:stop';
    socketRef.current?.emit(event, data);
  }, []);

  const markDelivered = useCallback((messageId: string) => {
    socketRef.current?.emit('message:delivered', { messageId });
  }, []);

  const markRead = useCallback((messageId: string) => {
    socketRef.current?.emit('message:read', { messageId });
  }, []);

  // Listen for new messages
  const onMessage = useCallback((callback: (message: any) => void) => {
    socketRef.current?.on('message:new', callback);
    return () => {
      socketRef.current?.off('message:new', callback);
    };
  }, []);

  // Listen for message sent confirmation
  const onMessageSent = useCallback((callback: (data: any) => void) => {
    socketRef.current?.on('message:sent', callback);
    return () => {
      socketRef.current?.off('message:sent', callback);
    };
  }, []);

  // Listen for message delivered
  const onMessageDelivered = useCallback((callback: (data: any) => void) => {
    socketRef.current?.on('message:delivered', callback);
    return () => {
      socketRef.current?.off('message:delivered', callback);
    };
  }, []);

  // Listen for message read
  const onMessageRead = useCallback((callback: (data: any) => void) => {
    socketRef.current?.on('message:read', callback);
    return () => {
      socketRef.current?.off('message:read', callback);
    };
  }, []);

  // Listen for typing indicators
  const onTyping = useCallback((callback: (data: any) => void) => {
    socketRef.current?.on('typing:start', callback);
    socketRef.current?.on('typing:stop', callback);
    return () => {
      socketRef.current?.off('typing:start', callback);
      socketRef.current?.off('typing:stop', callback);
    };
  }, []);

  return {
    socket: socketRef.current,
    joinGroup,
    sendMessage,
    sendTyping,
    markDelivered,
    markRead,
    onMessage,
    onMessageSent,
    onMessageDelivered,
    onMessageRead,
    onTyping
  };
};
