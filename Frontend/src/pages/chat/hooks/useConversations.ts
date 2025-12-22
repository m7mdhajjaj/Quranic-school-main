import { useState, useEffect } from 'react';
import api from '../../../Api/api';
import type { Conversation } from '../types';

export type { Conversation };

export const useConversations = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchConversations = async () => {
    setLoading(true);
    try {
      const res = await api.get('/chat/conversations');
      // Remove duplicates on client side as well
      const uniqueConversations = Array.from(
        new Map(res.data.map((conv: Conversation) => [conv._id, conv])).values()
      );
      setConversations(uniqueConversations);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  const resetUnreadCount = async (chatType: 'DM' | 'GROUP', targetId: string) => {
    try {
      await api.post('/chat/conversations/reset-unread', { chatType, targetId });
      // Update local state
      setConversations(prev => 
        prev.map(conv => {
          if (chatType === 'DM') {
            const isMatch = conv.participants.some(p => p.userId._id === targetId);
            return isMatch ? { ...conv, unreadCount: 0 } : conv;
          } else {
            return conv.groupId?._id === targetId ? { ...conv, unreadCount: 0 } : conv;
          }
        })
      );
    } catch (err) {
      console.error('Failed to reset unread count:', err);
    }
  };

  const updateConversationOnNewMessage = (message: any) => {
    setConversations(prev => {
      const updated = [...prev];
      const index = updated.findIndex(conv => {
        if (message.chatType === 'DM') {
          return conv.participants.some(p => 
            p.userId._id === message.sender || p.userId._id === message.recipient
          );
        } else {
          return conv.groupId?._id === message.groupId;
        }
      });

      if (index !== -1) {
        updated[index] = {
          ...updated[index],
          lastMessage: message,
          updatedAt: message.createdAt,
          unreadCount: updated[index].unreadCount + 1
        };
        // Move to top
        const [item] = updated.splice(index, 1);
        updated.unshift(item);
      }

      return updated;
    });
  };

  return { 
    conversations, 
    loading, 
    error, 
    fetchConversations, 
    resetUnreadCount,
    updateConversationOnNewMessage
  };
};

export default useConversations;
