import { useEffect, useCallback, useState, useRef } from 'react';
import { useChatSocket } from './useChatSocket';
import { useChatMessages } from './useChatMessages';
import { useAuth } from '../../../hooks/useAuth';
import type { SendMessageInput } from '../../../Validation/chatValidation';
import type { ChatType, Message, MentionItem } from '../types';

// ⚡ Performance: Request idle callback with fallback
const requestIdleCallbackPolyfill = (cb: IdleRequestCallback) => {
  if ('requestIdleCallback' in window) {
    return window.requestIdleCallback(cb);
  }
  return setTimeout(() => cb({ didTimeout: false, timeRemaining: () => 50 } as IdleDeadline), 1);
};

const cancelIdleCallbackPolyfill = (id: number) => {
  if ('cancelIdleCallback' in window) {
    return window.cancelIdleCallback(id);
  }
  return clearTimeout(id);
};

/**
 * Hook شامل للشات مع Real-time updates
 */
export const useChat = (chatType: ChatType, targetId: string) => {
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
    updateGroupMessageStatus,
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
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // ⚡ Performance: Batch message updates
  const messageBatchRef = useRef<Message[]>([]);
  const batchTimeoutRef = useRef<number | null>(null);
  const idleCallbackIdRef = useRef<number | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (batchTimeoutRef.current) {
        clearTimeout(batchTimeoutRef.current);
      }
      if (idleCallbackIdRef.current) {
        cancelIdleCallbackPolyfill(idleCallbackIdRef.current);
      }
    };
  }, []);

  // Auto-join group if needed
  useEffect(() => {
    if (chatType === 'GROUP' && targetId) {
      joinGroup(targetId);
    }
  }, [chatType, targetId, joinGroup]);

  // ⚡ Performance: Batch process messages
  const processBatch = useCallback(() => {
    if (messageBatchRef.current.length === 0) return;
    
    const batch = [...messageBatchRef.current];
    messageBatchRef.current = [];
    
    // Process all messages at once
    batch.forEach(message => {
      addMessage(message);
    });
  }, [addMessage]);

  // Listen for new messages with batching
  useEffect(() => {
    const cleanup = onMessage((message: Message) => {
      // Mark as delivered فوراً (critical path)
      const isFromMe = message.sender?._id === user?._id;
      
      if (!isFromMe) {
        // Sound is handled globally by useNotificationsSocket to prevent double sound
        
        if (message.chatType === 'DM' && message.recipient === user?._id) {
          // ⚡ Use idle callback for non-critical delivery status
          requestIdleCallbackPolyfill(() => {
            markDelivered(message._id);
          });
        } else if (message.chatType === 'GROUP') {
          requestIdleCallbackPolyfill(() => {
            markDelivered(message._id);
          });
        }
      }
      
      // ⚡ Batch messages for better performance
      messageBatchRef.current.push(message);
      
      // Clear existing timeout
      if (batchTimeoutRef.current) {
        clearTimeout(batchTimeoutRef.current);
      }
      
      // Process batch after 16ms (1 frame) or immediately if batch is large
      if (messageBatchRef.current.length >= 10) {
        processBatch();
      } else {
        batchTimeoutRef.current = window.setTimeout(processBatch, 16);
      }
    });
    return cleanup;
  }, [onMessage, processBatch, markDelivered, user]);

  // Listen for sent confirmation
  useEffect(() => {
    const cleanup = onMessageSent((data: { clientTempId: string; message: Message }) => {
      const { message } = data;
      // Replace optimistic message with real one
      addMessage(message);
    });
    return cleanup;
  }, [onMessageSent, addMessage]);

  // Listen for delivery status (use idle callback - not critical for UX)
  useEffect(() => {
    const cleanup = onMessageDelivered((data: any) => {
      // ⚡ Defer to idle time - delivery status is not immediately visible
      requestIdleCallbackPolyfill(() => {
        const { messageId, deliveredAt, userId } = data;
        if (userId) {
          // Group Chat
          updateGroupMessageStatus(messageId, userId, 'delivered', deliveredAt);
        } else {
          // DM
          updateMessage(messageId, { deliveredAt });
        }
      });
    });
    return cleanup;
  }, [onMessageDelivered, updateMessage, updateGroupMessageStatus]);

  // Listen for read status (use idle callback - not critical for UX)
  useEffect(() => {
    const cleanup = onMessageRead((data: any) => {
      // ⚡ Defer to idle time - read status can be updated later
      requestIdleCallbackPolyfill(() => {
        const { messageId, readAt, seenAt, userId, user } = data;
        if (userId) {
          // Group Chat
          updateGroupMessageStatus(messageId, userId, 'read', seenAt || readAt, user);
        } else {
          // DM
          updateMessage(messageId, { readAt });
        }
      });
    });
    return cleanup;
  }, [onMessageRead, updateMessage, updateGroupMessageStatus]);

  // Listen for typing indicators (optimized with debouncing)
  useEffect(() => {
    const typingTimeouts = new Map<string, NodeJS.Timeout>();
    
    const cleanup = onTyping((data: any) => {
      const { userId } = data;
      
      // Ignore own typing
      if (userId === user?._id) return;
      
      // ⚡ Batch state updates with requestAnimationFrame
      requestAnimationFrame(() => {
        setTypingUsers(prev => {
          const newSet = new Set(prev);
          // Check if it's typing:start or typing:stop based on event
          if (data.userRole !== undefined) { // typing:start has userRole
            newSet.add(userId);
            
            // Clear existing timeout
            if (typingTimeouts.has(userId)) {
              clearTimeout(typingTimeouts.get(userId)!);
            }
            
            // Auto-remove after 4 seconds
            const timeout = setTimeout(() => {
              requestAnimationFrame(() => {
                setTypingUsers(current => {
                  const updated = new Set(current);
                  updated.delete(userId);
                  return updated;
                });
              });
              typingTimeouts.delete(userId);
            }, 4000);
            
            typingTimeouts.set(userId, timeout);
          } else {
            newSet.delete(userId);
            if (typingTimeouts.has(userId)) {
              clearTimeout(typingTimeouts.get(userId)!);
              typingTimeouts.delete(userId);
            }
          }
          return newSet;
        });
      });
    });
    
    return () => {
      cleanup();
      // Cleanup all timeouts
      typingTimeouts.forEach(timeout => clearTimeout(timeout));
      typingTimeouts.clear();
    };
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
    const cleanup = onMessageEdited((updatedMessage: Message) => {
      updateMessage(updatedMessage._id, {
        text: updatedMessage.text,
        edited: true,
        editedAt: updatedMessage.editedAt
      });
    });
    return cleanup;
  }, [onMessageEdited, updateMessage]);

  // Send message with optimistic update
  const sendMessage = useCallback(async (data: { text: string; attachments?: any[]; replyTo?: string } | string, mentions: MentionItem[] = []) => {
    if (!user) return;

    const text = typeof data === 'string' ? data : data.text;
    const attachments = typeof data === 'string' ? [] : data.attachments;
    const replyTo = typeof data === 'string' ? undefined : data.replyTo;
    const clientTempId = `temp_${Date.now()}_${Math.random()}`;
    
    // Create optimistic message
    const optimisticMessage: Partial<Message> & { clientTempId: string } = {
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
      createdAt: new Date().toISOString(),
      _optimistic: true,
      mentions
    };

    // Add to UI فوراً
    addOptimisticMessage(optimisticMessage);

    try {
      const messageData: SendMessageInput & { mentions?: MentionItem[] } = {
        chatType,
        text,
        attachments,
        replyTo,
        clientTempId,
        mentions,
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

  // Handle typing - optimized with ref
  const handleTyping = useCallback((isTyping: boolean) => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }

    sendTyping({ chatType, targetId }, isTyping);

    if (isTyping) {
      // Auto-stop after 3 seconds
      typingTimeoutRef.current = setTimeout(() => {
        sendTyping({ chatType, targetId }, false);
        typingTimeoutRef.current = null;
      }, 3000);
    }
  }, [chatType, targetId, sendTyping]);

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
