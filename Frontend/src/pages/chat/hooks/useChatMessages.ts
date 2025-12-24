import { useState, useEffect, useCallback } from 'react';
import api from '../../../Api/api';
import type { GetMessagesInput } from '../../../Validation/chatValidation';

export const useChatMessages = (chatType: 'DM' | 'GROUP', targetId: string) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const fetchMessages = useCallback(async (before?: string) => {
    if (!targetId) return;
    
    // Use different loading states for initial load vs pagination
    if (before) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }
    
    try {
      const params: GetMessagesInput = {
        chatType,
        targetId,
        limit: 50,
        before
      };
      const res = await api.get('/chat/messages', { params });
      const newMessages = res.data;
      
      if (newMessages.length < 50) setHasMore(false);

      // ✅ Fix: Prepend older messages when using pagination (Chronological Order)
      setMessages(prev => before ? [...newMessages, ...prev] : newMessages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [chatType, targetId]);

  useEffect(() => {
    setMessages([]);
    setHasMore(true);
    fetchMessages();
  }, [fetchMessages]);

  // Add optimistic message (قبل ما يوصل للسيرفر)
  const addOptimisticMessage = useCallback((message: any) => {
    // ✅ Fix: Append to end (Chronological Order)
    setMessages(prev => [...prev, { ...message, _optimistic: true }]);
  }, []);

  // Add real message from server
  const addMessage = useCallback((message: any) => {
    setMessages(prev => {
      // Remove optimistic version if exists
      const filtered = prev.filter(m => m.clientTempId !== message.clientTempId);
      // ✅ Fix: Append to end (Chronological Order)
      return [...filtered, message];
    });
  }, []);

  // Update message (for delivery/read status)
  const updateMessage = useCallback((messageId: string, updates: any) => {
    setMessages(prev => prev.map(msg => 
      msg._id === messageId ? { ...msg, ...updates } : msg
    ));
  }, []);

  // ✅ Update Group Message Status (Push to arrays)
  const updateGroupMessageStatus = useCallback((messageId: string, userId: string, type: 'delivered' | 'read', timestamp: string, user?: any) => {
    setMessages(prev => prev.map(msg => {
      if (msg._id !== messageId) return msg;

      if (type === 'delivered') {
        const exists = msg.deliveredTo?.some((d: any) => d.userId === userId);
        if (exists) return msg;
        return {
          ...msg,
          deliveredTo: [...(msg.deliveredTo || []), { userId, deliveredAt: timestamp }]
        };
      } else if (type === 'read') {
        const exists = msg.seenBy?.some((s: any) => s.userId === userId);
        if (exists) return msg;
        
        // If read, it's also delivered
        const deliveredExists = msg.deliveredTo?.some((d: any) => d.userId === userId);
        const newDeliveredTo = deliveredExists 
          ? msg.deliveredTo 
          : [...(msg.deliveredTo || []), { userId, deliveredAt: timestamp }];

        // Add user info if provided (for avatar display)
        const seenEntry = { userId, seenAt: timestamp, user };

        return {
          ...msg,
          seenBy: [...(msg.seenBy || []), seenEntry],
          deliveredTo: newDeliveredTo
        };
      }
      return msg;
    }));
  }, []);

  // Remove failed message
  const removeMessage = useCallback((clientTempId: string) => {
    setMessages(prev => prev.filter(m => m.clientTempId !== clientTempId));
  }, []);

  // Handle Real-time Deletion
  const handleMessageDeleted = useCallback((messageId: string, deletedForAll: boolean) => {
    setMessages(prev => {
      if (deletedForAll) {
        // Update content to show it's deleted
        return prev.map(msg => 
          msg._id === messageId 
            ? { ...msg, deletedForAll: true, text: "تم حذف هذه الرسالة", attachments: [] } 
            : msg
        );
      } else {
        // Remove completely (Delete for Me)
        return prev.filter(msg => msg._id !== messageId);
      }
    });
  }, []);

  // Jump to specific message (fetch context)
  const jumpToMessage = useCallback(async (messageId: string) => {
    setLoading(true);
    try {
      const res = await api.get(`/chat/messages/${messageId}/context`);
      setMessages(res.data);
      // Since we jumped, we might have more messages in both directions
      // For simplicity, we can assume we might have more older messages
      setHasMore(true); 
    } catch (err) {
      console.error("Failed to jump to message:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  return { 
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
  };
};
