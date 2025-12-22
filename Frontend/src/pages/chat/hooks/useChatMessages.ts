import { useState, useEffect, useCallback } from 'react';
import api from '../../../Api/api';
import type { GetMessagesInput } from '../../../Validation/chatValidation';

export const useChatMessages = (chatType: 'DM' | 'GROUP', targetId: string) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const fetchMessages = useCallback(async (before?: string) => {
    if (!targetId) return;
    setLoading(true);
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

      setMessages(prev => before ? [...prev, ...newMessages] : newMessages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [chatType, targetId]);

  useEffect(() => {
    setMessages([]);
    setHasMore(true);
    fetchMessages();
  }, [fetchMessages]);

  // Add optimistic message (قبل ما يوصل للسيرفر)
  const addOptimisticMessage = useCallback((message: any) => {
    setMessages(prev => [{ ...message, _optimistic: true }, ...prev]);
  }, []);

  // Add real message from server
  const addMessage = useCallback((message: any) => {
    setMessages(prev => {
      // Remove optimistic version if exists
      const filtered = prev.filter(m => m.clientTempId !== message.clientTempId);
      return [message, ...filtered];
    });
  }, []);

  // Update message (for delivery/read status)
  const updateMessage = useCallback((messageId: string, updates: any) => {
    setMessages(prev => prev.map(msg => 
      msg._id === messageId ? { ...msg, ...updates } : msg
    ));
  }, []);

  // Remove failed message
  const removeMessage = useCallback((clientTempId: string) => {
    setMessages(prev => prev.filter(m => m.clientTempId !== clientTempId));
  }, []);

  return { 
    messages, 
    loading, 
    hasMore, 
    fetchMessages, 
    addMessage, 
    addOptimisticMessage,
    updateMessage,
    removeMessage
  };
};
