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

  const joinGroup = useCallback((groupId: string) => {
    socketRef.current?.emit('join:group', groupId);
  }, []);

  const sendMessage = useCallback((data: SendMessageInput): Promise<Message> => {
    return new Promise((resolve, reject) => {
      socketRef.current?.emit('message:send', data, (response: SocketResponse<Message>) => {
        if (response.status === 'ok' && response.data) resolve(response.data);
        else reject(new Error(response.message || 'Failed to send message'));
      });
    });
  }, []);

  const sendTyping = useCallback((data: { chatType: ChatType; targetId: string }, isTyping: boolean) => {
    const event = isTyping ? 'typing:start' : 'typing:stop';
    socketRef.current?.emit(event, data);
  }, []);

  const markDelivered = useCallback((messageId: string) => {
    socketRef.current?.emit('message:delivered', { messageId });
  }, []);

  const markRead = useCallback((messageId: string) => {
    socketRef.current?.emit('message:read', { messageId });
  }, []);

  const editMessage = useCallback((messageId: string, text: string): Promise<Message> => {
    return new Promise((resolve, reject) => {
      socketRef.current?.emit('message:edit', { messageId, text }, (response: SocketResponse<Message>) => {
        if (response.status === 'ok' && response.data) resolve(response.data);
        else reject(new Error(response.message || 'Failed to edit message'));
      });
    });
  }, []);

  // Listen for new messages
  const onMessage = useCallback((callback: (message: Message) => void) => {
    socketRef.current?.on('message:new', callback);
    return () => {
      socketRef.current?.off('message:new', callback);
    };
  }, []);

  // Listen for message sent confirmation
  const onMessageSent = useCallback((callback: (data: { clientTempId: string; message: Message }) => void) => {
    socketRef.current?.on('message:sent', callback);
    return () => {
      socketRef.current?.off('message:sent', callback);
    };
  }, []);

  // Listen for message delivered
  const onMessageDelivered = useCallback((callback: (data: MessageDeliveredData) => void) => {
    socketRef.current?.on('message:delivered', callback);
    return () => {
      socketRef.current?.off('message:delivered', callback);
    };
  }, []);

  // Listen for message read
  const onMessageRead = useCallback((callback: (data: MessageReadData) => void) => {
    socketRef.current?.on('message:read', callback);
    return () => {
      socketRef.current?.off('message:read', callback);
    };
  }, []);

  // Listen for typing indicators
  const onTyping = useCallback((callback: (data: TypingData & { isTyping?: boolean }) => void) => {
    socketRef.current?.on('typing:start', (data: TypingData) => callback({ ...data, isTyping: true }));
    socketRef.current?.on('typing:stop', (data: TypingData) => callback({ ...data, isTyping: false }));
    return () => {
      socketRef.current?.off('typing:start', callback);
      socketRef.current?.off('typing:stop', callback);
    };
  }, []);

  // ✅ Listen for conversation updates
  const onConversationUpdated = useCallback((callback: (data: Partial<Conversation>) => void) => {
    socketRef.current?.on('conversation:updated', callback);
    return () => {
      socketRef.current?.off('conversation:updated', callback);
    };
  }, []);

  // ✅ Listen for message deletion
  const onMessageDeleted = useCallback((callback: (data: MessageDeletedData) => void) => {
    socketRef.current?.on('message:deleted', callback);
    return () => {
      socketRef.current?.off('message:deleted', callback);
    };
  }, []);

  // ✅ Listen for message edited
  const onMessageEdited = useCallback((callback: (message: Message) => void) => {
    socketRef.current?.on('message:edited', callback);
    return () => {
      socketRef.current?.off('message:edited', callback);
    };
  }, []);

  return {
    socket: socketRef.current,
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
