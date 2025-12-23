import { useState, useEffect, useCallback } from 'react';
import api from '../../../Api/api';
import { useChatSocket } from './useChatSocket';
import { useAuth } from '../../../hooks/useAuth';
import type { Conversation } from '../types';

export type { Conversation };

export const useConversations = (search?: string) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { onMessage, onConversationUpdated, onMessageDeleted } = useChatSocket();
  const { user } = useAuth();

  const fetchConversations = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/chat/conversations', {
        params: { search }
      });
      
      setConversations(res.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // ✅ Listen for real-time new messages and update conversations
  useEffect(() => {
    const cleanup = onMessage((message: any) => {
      updateConversationOnNewMessage(message);
    });
    return cleanup;
  }, [onMessage]);

  // ✅ Listen for conversation:updated events (Optimized)
  useEffect(() => {
    const cleanup = onConversationUpdated((data: any) => {
      // data = { chatType, targetId, lastMessage }
      setConversations(prev => {
        const updated = [...prev];
        const index = updated.findIndex(conv => {
          if (data.chatType === 'DM') {
            return conv.participants.some(p => p.userId._id === data.targetId);
          } else {
            return conv.groupId?._id === data.targetId;
          }
        });

        if (index !== -1) {
          // Update existing conversation
          updated[index] = {
            ...updated[index],
            lastMessage: data.lastMessage,
            updatedAt: data.lastMessage ? data.lastMessage.createdAt : updated[index].updatedAt
          };
          // Move to top only if there is a new message (optional, but usually good)
          // If lastMessage is null (all deleted), maybe don't move to top? 
          // But usually we move to top on update.
          const [item] = updated.splice(index, 1);
          updated.unshift(item);
          return updated;
        } else {
          // New conversation - fetch to get details
          fetchConversations();
          return prev;
        }
      });
    });
    return cleanup;
  }, [onConversationUpdated, fetchConversations]);

  // ✅ Listen for message deletion to update lastMessage preview
  useEffect(() => {
    const cleanup = onMessageDeleted((data: { messageId: string, deletedForAll: boolean }) => {
      // If deleted for me only, ignore here because conversation:updated will handle the new last message
      if (!data.deletedForAll) return;

      setConversations(prev => prev.map(conv => {
        // Check if the deleted message is the last message of this conversation
        if (conv.lastMessage && conv.lastMessage._id === data.messageId) {
          return {
            ...conv,
            lastMessage: {
              ...conv.lastMessage,
              text: "🚫 تم حذف الرسالة",
              deletedForAll: true
            }
          };
        }
        return conv;
      }));
    });
    return cleanup;
  }, [onMessageDeleted]);

  const deleteConversation = useCallback(async (conversationId: string) => {
    // Optimistic Update
    const previousConversations = [...conversations];
    setConversations(prev => prev.filter(c => c._id !== conversationId));

    try {
      await api.delete(`/chat/conversations/${conversationId}`);
    } catch (err: any) {
      console.error('Failed to delete conversation:', err);
      // Revert on error
      setConversations(previousConversations);
      throw err; // Re-throw to let UI handle error message
    }
  }, [conversations]);

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
    updateConversationOnNewMessage,
    deleteConversation
  };
};

export default useConversations;
