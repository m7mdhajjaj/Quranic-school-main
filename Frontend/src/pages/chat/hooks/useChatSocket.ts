import { useEffect, useRef, useCallback } from 'react';
import { Socket } from 'socket.io-client';
import socketManager from '../../../Socket/SocketManager';
import { useAuth } from '../../../hooks/useAuth';
import type { SendMessageInput } from '../../../Validation/chatValidation';
import type { ChatType, Message, Conversation } from '../types';

// Socket response types
interface SocketResponse<T = unknown> {
  status: 'ok' | 'error';
  data?: T;
  message?: string;
}

interface TypingData {
  chatType: ChatType;
  targetId: string;
  userId?: string;
  userName?: string;
}

interface MessageDeliveredData {
  messageId: string;
  userId: string;
  deliveredAt: string;
}

interface MessageReadData {
  messageId: string;
  userId: string;
  readAt: string;
}

interface MessageDeletedData {
  messageId: string;
  deletedForAll: boolean;
}

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

  const getSocket = useCallback(() => {
    return socketRef.current || socketManager.getSocket();
  }, []);

  const joinGroup = useCallback((groupId: string) => {
    const socket = getSocket();
    socket?.emit('join:group', groupId);
  }, [getSocket]);

  const sendMessage = useCallback((data: SendMessageInput): Promise<Message> => {
    return new Promise((resolve, reject) => {
      const socket = getSocket();
      if (!socket) {
        reject(new Error('Socket not connected'));
        return;
      }
      socket.emit('message:send', data, (response: SocketResponse<Message>) => {
        if (response.status === 'ok' && response.data) resolve(response.data);
        else reject(new Error(response.message || 'Failed to send message'));
      });
    });
  }, [getSocket]);

  const sendTyping = useCallback((data: { chatType: ChatType; targetId: string }, isTyping: boolean) => {
    const event = isTyping ? 'typing:start' : 'typing:stop';
    const socket = getSocket();
    socket?.emit(event, data);
  }, [getSocket]);

  const markDelivered = useCallback((messageId: string) => {
    const socket = getSocket();
    socket?.emit('message:delivered', { messageId });
  }, [getSocket]);

  const markRead = useCallback((messageId: string) => {
    const socket = getSocket();
    socket?.emit('message:read', { messageId });
  }, [getSocket]);

  const editMessage = useCallback((messageId: string, text: string): Promise<Message> => {
    return new Promise((resolve, reject) => {
      const socket = getSocket();
      if (!socket) {
        reject(new Error('Socket not connected'));
        return;
      }
      socket.emit('message:edit', { messageId, text }, (response: SocketResponse<Message>) => {
        if (response.status === 'ok' && response.data) resolve(response.data);
        else reject(new Error(response.message || 'Failed to edit message'));
      });
    });
  }, [getSocket]);

  // Listen for new messages - Use socketManager directly for better reliability
  const onMessage = useCallback((callback: (message: Message) => void) => {
    const socket = getSocket();
    if (socket) {
      socket.on('message:new', callback);
    } else {
      // If socket not ready, register on socketManager
      socketManager.on('message:new', callback);
    }
    return () => {
      const socket = getSocket();
      if (socket) {
        socket.off('message:new', callback);
      } else {
        socketManager.off('message:new', callback);
      }
    };
  }, [getSocket]);

  // Listen for message sent confirmation
  const onMessageSent = useCallback((callback: (data: { clientTempId: string; message: Message }) => void) => {
    const socket = getSocket();
    if (socket) {
      socket.on('message:sent', callback);
    } else {
      socketManager.on('message:sent', callback);
    }
    return () => {
      const socket = getSocket();
      if (socket) {
        socket.off('message:sent', callback);
      } else {
        socketManager.off('message:sent', callback);
      }
    };
  }, [getSocket]);

  // Listen for message delivered
  const onMessageDelivered = useCallback((callback: (data: MessageDeliveredData) => void) => {
    const socket = getSocket();
    if (socket) {
      socket.on('message:delivered', callback);
    } else {
      socketManager.on('message:delivered', callback);
    }
    return () => {
      const socket = getSocket();
      if (socket) {
        socket.off('message:delivered', callback);
      } else {
        socketManager.off('message:delivered', callback);
      }
    };
  }, [getSocket]);

  // Listen for message read
  const onMessageRead = useCallback((callback: (data: MessageReadData) => void) => {
    const socket = getSocket();
    if (socket) {
      socket.on('message:read', callback);
    } else {
      socketManager.on('message:read', callback);
    }
    return () => {
      const socket = getSocket();
      if (socket) {
        socket.off('message:read', callback);
      } else {
        socketManager.off('message:read', callback);
      }
    };
  }, [getSocket]);

  // Listen for typing indicators
  const onTyping = useCallback((callback: (data: TypingData & { isTyping?: boolean }) => void) => {
    const socket = getSocket();
    const typingStartHandler = (data: TypingData) => callback({ ...data, isTyping: true });
    const typingStopHandler = (data: TypingData) => callback({ ...data, isTyping: false });
    
    if (socket) {
      socket.on('typing:start', typingStartHandler);
      socket.on('typing:stop', typingStopHandler);
    } else {
      socketManager.on('typing:start', typingStartHandler);
      socketManager.on('typing:stop', typingStopHandler);
    }
    
    return () => {
      const socket = getSocket();
      if (socket) {
        socket.off('typing:start', typingStartHandler);
        socket.off('typing:stop', typingStopHandler);
      } else {
        socketManager.off('typing:start', typingStartHandler);
        socketManager.off('typing:stop', typingStopHandler);
      }
    };
  }, [getSocket]);

  // ✅ Listen for conversation updates
  const onConversationUpdated = useCallback((callback: (data: Partial<Conversation>) => void) => {
    const socket = getSocket();
    if (socket) {
      socket.on('conversation:updated', callback);
    } else {
      socketManager.on('conversation:updated', callback);
    }
    return () => {
      const socket = getSocket();
      if (socket) {
        socket.off('conversation:updated', callback);
      } else {
        socketManager.off('conversation:updated', callback);
      }
    };
  }, [getSocket]);

  // ✅ Listen for message deletion
  const onMessageDeleted = useCallback((callback: (data: MessageDeletedData) => void) => {
    const socket = getSocket();
    if (socket) {
      socket.on('message:deleted', callback);
    } else {
      socketManager.on('message:deleted', callback);
    }
    return () => {
      const socket = getSocket();
      if (socket) {
        socket.off('message:deleted', callback);
      } else {
        socketManager.off('message:deleted', callback);
      }
    };
  }, [getSocket]);

  // ✅ Listen for message edited
  const onMessageEdited = useCallback((callback: (message: Message) => void) => {
    const socket = getSocket();
    if (socket) {
      socket.on('message:edited', callback);
    } else {
      socketManager.on('message:edited', callback);
    }
    return () => {
      const socket = getSocket();
      if (socket) {
        socket.off('message:edited', callback);
      } else {
        socketManager.off('message:edited', callback);
      }
    };
  }, [getSocket]);

  return {
    socket: getSocket(),
    joinGroup,
    sendMessage,
    sendTyping,
    markDelivered,
    markRead,
    editMessage,
    onMessage,
    onMessageSent,
    onMessageDelivered,
    onMessageRead,
    onTyping,
    onConversationUpdated,
    onMessageDeleted,
    onMessageEdited
  };
};
