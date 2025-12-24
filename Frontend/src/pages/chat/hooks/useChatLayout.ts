// ============================================================================
// useChatLayout.ts - Layout State Management Hook
// ============================================================================

import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { useDebounce } from '../../../hooks/useDebounce';
import { useConversations } from './useConversations';
import { useChatContacts } from './useChatContacts';
import { useGroupConversations } from './useGroupConversations';
import type { Conversation } from '../types';

interface Contact {
  _id: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  role: string;
  [key: string]: any;
}

interface Group {
  _id: string;
  name: string;
  description?: string;
  image?: string;
  teacher?: string;
}

interface TargetInfo {
  chatType: 'DM' | 'GROUP';
  targetId: string;
  targetName: string;
}

export const useChatLayout = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  
  const { 
    conversations, 
    loading: conversationsLoading, 
    resetUnreadCount, 
    fetchConversations,
    deleteConversation: deleteConversationApi 
  } = useConversations(debouncedSearchTerm);
  const { contacts, groups, loading: contactsLoading } = useChatContacts(debouncedSearchTerm);
  const { initializeGroupConversations } = useGroupConversations();
  
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [initialized, setInitialized] = useState(false);

  // Auto-initialize group conversations for teachers and admins
  useEffect(() => {
    const initGroups = async () => {
      if (!user || initialized) return;
      
      if (user.role === 'teacher' || user.role === 'admin') {
        try {
          await initializeGroupConversations();
          // Wait a bit for backend to process
          await new Promise(resolve => setTimeout(resolve, 500));
          await fetchConversations();
          setInitialized(true);
        } catch (err) {
          console.error('Failed to initialize group conversations:', err);
          setInitialized(true); // Set to true even on error to prevent infinite loop
        }
      } else {
        setInitialized(true);
      }
    };
    
    initGroups();
  }, [user, initialized, initializeGroupConversations, fetchConversations]);

  /**
   * Handle conversation selection
   */
  const handleSelectConversation = useCallback(async (conv: Conversation) => {
    setSelectedConversation(conv);
    
    // Reset unread count if needed
    if (conv.unreadCount > 0) {
      if (conv.type === 'DM') {
        const otherParticipant = conv.participants.find(
          p => p.userId._id !== user?._id
        );
        if (otherParticipant) {
          await resetUnreadCount('DM', otherParticipant.userId._id);
        }
      } else if (conv.type === 'GROUP' && conv.groupId) {
        await resetUnreadCount('GROUP', conv.groupId._id);
      }
    }
  }, [user, resetUnreadCount]);

  // Check for pending notification navigation
  useEffect(() => {
    const checkNotification = () => {
      if (!conversationsLoading && conversations.length > 0) {
        const pendingNotification = localStorage.getItem('chatNotification');
        if (pendingNotification) {
          try {
            const data = JSON.parse(pendingNotification);
            const { conversationId } = data;

            if (conversationId) {
              const targetConv = conversations.find(c => c._id === conversationId);
              if (targetConv) {
                handleSelectConversation(targetConv);
                localStorage.removeItem('chatNotification');
              }
            }
          } catch (e) {
            console.error("Error parsing chat notification data", e);
            localStorage.removeItem('chatNotification');
          }
        }
      }
    };

    // Check on mount/update
    checkNotification();

    // Listen for event (in case user is already on chat page)
    window.addEventListener('chat-notification-click', checkNotification);
    
    return () => {
      window.removeEventListener('chat-notification-click', checkNotification);
    };
  }, [conversationsLoading, conversations, handleSelectConversation]);

  /**
   * Start new chat with contact or group
   */
  const handleStartNewChat = useCallback((target: Contact | Group, isGroup: boolean) => {
    if (isGroup) {
      const group = target as Group;
      const existingConv = conversations.find(
        c => c.type === 'GROUP' && c.groupId?._id === group._id
      );
      
      if (existingConv) {
        setSelectedConversation(existingConv);
      } else {
        // Create temporary conversation
        const tempConv = {
          _id: `temp-${group._id}`,
          type: 'GROUP',
          groupId: group,
          participants: [],
          unreadCount: 0,
          updatedAt: new Date().toISOString()
        } as Conversation;
        setSelectedConversation(tempConv);
      }
    } else {
      const contact = target as Contact;
      const existingConv = conversations.find(c => {
        if (c.type !== 'DM') return false;
        return c.participants.some(p => p.userId._id === contact._id);
      });
      
      if (existingConv) {
        setSelectedConversation(existingConv);
      } else {
        // Create temporary conversation
        const tempConv = {
          _id: `temp-${contact._id}`,
          type: 'DM',
          participants: [
            { 
              userId: contact, 
              userModel: contact.role === 'student' ? 'Student' 
                        : contact.role === 'teacher' ? 'Teacher' 
                        : 'Admin' 
            }
          ],
          unreadCount: 0,
          updatedAt: new Date().toISOString()
        } as unknown as Conversation;
        setSelectedConversation(tempConv);
      }
    }
  }, [conversations]);

  /**
   * Get target info from selected conversation
   */
  const getTargetInfo = useCallback((): TargetInfo | null => {
    if (!selectedConversation) return null;
    
    if (selectedConversation.type === 'GROUP' && selectedConversation.groupId) {
      return {
        chatType: 'GROUP',
        targetId: selectedConversation.groupId._id,
        targetName: selectedConversation.groupId.name
      };
    } else {
      const otherParticipant = selectedConversation.participants.find(
        p => p.userId._id !== user?._id
      );
      
      if (otherParticipant) {
        return {
          chatType: 'DM',
          targetId: otherParticipant.userId._id,
          targetName: `${otherParticipant.userId.firstName} ${otherParticipant.userId.lastName}`
        };
      }
    }
    
    return null;
  }, [selectedConversation, user]);

  const deleteConversation = useCallback(async (conversationId: string) => {
    try {
      // If deleting the currently selected conversation, deselect it
      if (selectedConversation && selectedConversation._id === conversationId) {
        setSelectedConversation(null);
      }
      
      await deleteConversationApi(conversationId);
    } catch (error) {
      console.error("Failed to delete conversation", error);
    }
  }, [selectedConversation, deleteConversationApi]);

  return {
    // Data
    conversations,
    contacts,
    groups,
    selectedConversation,
    targetInfo: getTargetInfo(),
    user,
    
    // Loading states
    loading: conversationsLoading || contactsLoading,
    
    // Actions
    handleSelectConversation,
    handleStartNewChat,
    searchTerm,
    setSearchTerm,
    deleteConversation
  };
};
