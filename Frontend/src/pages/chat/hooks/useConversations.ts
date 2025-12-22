import { useState, useEffect, useCallback } from 'react';
import api from '../../../Api/api';
import { useChatSocket } from './useChatSocket';
import { useAuth } from '../../../hooks/useAuth';
import type { Conversation } from '../types';

export type { Conversation };

export const useConversations = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { onMessage, onConversationUpdated } = useChatSocket();
  const { user } = useAuth();

  const fetchConversations = async () => {
    setLoading(true);
    try {
      const res = await api.get('/chat/conversations');
      
      // ✅ Deduplicate conversations (Client-side fix)
      const uniqueMap = new Map();
      res.data.forEach((conv: Conversation) => {
        let key = conv._id;
        
        // For groups, use groupId as unique key
        if (conv.type === 'GROUP' && conv.groupId) {
          key = conv.groupId._id;
        }
        
        if (uniqueMap.has(key)) {
          const existing = uniqueMap.get(key);
          // Keep the one with more recent update
          if (new Date(conv.updatedAt) > new Date(existing.updatedAt)) {
            uniqueMap.set(key, conv);
          }
        } else {
          uniqueMap.set(key, conv);
        }
      });

      setConversations(Array.from(uniqueMap.values()));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  // ✅ Listen for real-time new messages and update conversations
  useEffect(() => {
    const cleanup = onMessage((message: any) => {
      updateConversationOnNewMessage(message);
    });
    return cleanup;
  }, [onMessage]);

  // ✅ Listen for conversation:updated events (more efficient)
  useEffect(() => {
    const cleanup = onConversationUpdated((data: any) => {
      console.log('📬 Conversation updated:', data);
      // Optionally refresh conversations or handle specific update
      fetchConversations();
    });
    return cleanup;
  }, [onConversationUpdated]);

  const resetUnreadCount = useCallback(async (chatType: 'DM' | 'GROUP', targetId: string) => {
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
  }, []);

  const updateConversationOnNewMessage = useCallback((message: any) => {
    setConversations(prev => {
      const updated = [...prev];
      
      // Find existing conversation
      const index = updated.findIndex(conv => {
        if (message.chatType === 'DM') {
          return conv.participants.some(p => 
            p.userId._id === message.sender?._id || p.userId._id === message.recipient
          );
        } else {
          return conv.groupId?._id === message.groupId;
        }
      });

      if (index !== -1) {
        // Only increment unread if message is not from current user
        const isFromCurrentUser = message.sender?._id === user?._id;
        
        updated[index] = {
          ...updated[index],
          lastMessage: message,
          updatedAt: message.createdAt,
          unreadCount: isFromCurrentUser ? updated[index].unreadCount : updated[index].unreadCount + 1
        };
        
        // Move to top
        const [item] = updated.splice(index, 1);
        updated.unshift(item);
      } else {
        // New conversation - fetch full conversations list
        fetchConversations();
      }

      return updated;
    });
  }, [user, fetchConversations]);

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
