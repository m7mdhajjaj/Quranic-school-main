import { useEffect, useCallback, useState } from 'react';
import { useChatSocket } from './useChatSocket';
import { useChatMessages } from './useChatMessages';
import { useAuth } from '../../../hooks/useAuth';
import type { SendMessageInput } from '../../../Validation/chatValidation';

/**
 * Hook شامل للشات مع Real-time updates
 */
export const useChat = (chatType: 'DM' | 'GROUP', targetId: string) => {
  const { user } = useAuth();
  const { 
    messages, 
    loading,
    loadingMore, 
    hasMore, 
    fetchMessages, 
    addMessage, 
    addOptimisticMessage,
    updateMessage,
    removeMessage,
    handleMessageDeleted,
    jumpToMessage
  } = useChatMessages(chatType, targetId);
  
  const {
    sendMessage: sendSocketMessage,
    sendTyping,
    markDelivered,
    markRead,
    editMessage: editSocketMessage,
    onMessage,
    onMessageSent,
    onMessageDelivered,
    onMessageRead,
    onTyping,
    onMessageDeleted,
    onMessageEdited,
    joinGroup
  } = useChatSocket();

  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);

  // Auto-join group if needed
  useEffect(() => {
    if (chatType === 'GROUP' && targetId) {
      joinGroup(targetId);
    }
  }, [chatType, targetId, joinGroup]);

  // Listen for new messages
  useEffect(() => {
    const cleanup = onMessage((message: any) => {
      // Mark as delivered فوراً
      if (message.chatType === 'DM' && message.recipient === user?._id) {
        markDelivered(message._id);
      }
      addMessage(message);
    });
    return cleanup;
  }, [onMessage, addMessage, markDelivered, user]);

  // Listen for sent confirmation
  useEffect(() => {
    const cleanup = onMessageSent((data: any) => {
      const { tempId, message } = data;
      // Replace optimistic message with real one
      addMessage(message);
    });
    return cleanup;
  }, [onMessageSent, addMessage]);

  // Listen for delivery status
  useEffect(() => {
    const cleanup = onMessageDelivered((data: any) => {
      const { messageId, deliveredAt } = data;
      updateMessage(messageId, { deliveredAt });
    });
    return cleanup;
  }, [onMessageDelivered, updateMessage]);

  // Listen for read status
  useEffect(() => {
    const cleanup = onMessageRead((data: any) => {
      const { messageId, readAt } = data;
      updateMessage(messageId, { readAt });
    });
    return cleanup;
  }, [onMessageRead, updateMessage]);

  // Listen for typing indicators
  useEffect(() => {
    const cleanup = onTyping((data: any) => {
      const { userId, chatType: eventType } = data;
      
      // Ignore own typing
      if (userId === user?._id) return;
      
      setTypingUsers(prev => {
        const newSet = new Set(prev);
        // Check if it's typing:start or typing:stop based on event
        if (data.userRole !== undefined) { // typing:start has userRole
          newSet.add(userId);
          // Auto-remove after 4 seconds
          setTimeout(() => {
            setTypingUsers(current => {
              const updated = new Set(current);
              updated.delete(userId);
              return updated;
            });
          }, 4000);
        } else {
          newSet.delete(userId);
        }
        return newSet;
      });
    });
    return cleanup;
  }, [onTyping, user]);

  // Listen for message deletion (Real-time)
  useEffect(() => {
    const cleanup = onMessageDeleted((data: { messageId: string, deletedForAll: boolean }) => {
      handleMessageDeleted(data.messageId, data.deletedForAll);
    });
    return cleanup;
  }, [onMessageDeleted, handleMessageDeleted]);

  // Listen for message edited (Real-time)
  useEffect(() => {
    const cleanup = onMessageEdited((updatedMessage: any) => {
      updateMessage(updatedMessage._id, {
        text: updatedMessage.text,
        edited: true,
        editedAt: updatedMessage.editedAt
      });
    });
    return cleanup;
  }, [onMessageEdited, updateMessage]);

  // Send message with optimistic update
  const sendMessage = useCallback(async (text: string, attachments?: any[], replyTo?: string) => {
    if (!user) return;

    const clientTempId = `temp_${Date.now()}_${Math.random()}`;
    
    // Create optimistic message
    const optimisticMessage = {
      _id: clientTempId,
      clientTempId,
      chatType,
      sender: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user.avatar
      },
      text,
      attachments,
      replyTo,
      createdAt: new Date().toISOString(),
      _optimistic: true
    };

    // Add to UI فوراً
    addOptimisticMessage(optimisticMessage);

    try {
      const messageData: SendMessageInput = {
        chatType,
        text,
        attachments,
        replyTo,
        clientTempId,
        ...(chatType === 'DM' ? { recipientId: targetId } : { groupId: targetId })
      };

      // Send via socket
      await sendSocketMessage(messageData);
    } catch (error) {
      console.error('Failed to send message:', error);
      // Remove optimistic message on error
      removeMessage(clientTempId);
      throw error;
    }
  }, [user, chatType, targetId, addOptimisticMessage, sendSocketMessage, removeMessage]);

  // Handle typing
  const handleTyping = useCallback((isTyping: boolean) => {
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }

    sendTyping({ chatType, targetId }, isTyping);

    if (isTyping) {
      // Auto-stop after 3 seconds
      const timeout = setTimeout(() => {
        sendTyping({ chatType, targetId }, false);
      }, 3000);
      setTypingTimeout(timeout);
    }
  }, [chatType, targetId, sendTyping, typingTimeout]);

  // Mark message as read
  const markMessageAsRead = useCallback((messageId: string) => {
    markRead(messageId);
  }, [markRead]);

  // Edit message
  const editMessage = useCallback(async (messageId: string, newText: string) => {
    try {
      // Optimistic update
      updateMessage(messageId, {
        text: newText,
        edited: true,
        editedAt: new Date().toISOString()
      });

      // Send via socket
      await editSocketMessage(messageId, newText);
    } catch (error: any) {
      // Revert on error - need to re-fetch or keep old text
      console.error('Failed to edit message:', error);
      throw error;
    }
  }, [editSocketMessage, updateMessage]);

  return {
    messages,
    loading,
    loadingMore,
    hasMore,
    fetchMessages,
    sendMessage,
    editMessage,
    handleTyping,
    markMessageAsRead,
    jumpToMessage,
    handleMessageDeleted,
    typingUsers: Array.from(typingUsers),
    isTyping: typingUsers.size > 0
  };
};
