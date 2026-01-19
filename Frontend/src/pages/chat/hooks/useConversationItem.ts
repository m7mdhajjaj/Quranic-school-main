// ============================================================================
// useConversationItem.ts - Conversation Item Logic Hook
// ============================================================================

import { useMemo } from 'react';
import type { Conversation, UserModel } from '../types';
import { ROLE_NAMES } from '../types';

interface DisplayInfo {
  name: string;
  subtitle: string;
  avatar: string | null;
  userId: string;
}

interface UseConversationItemProps {
  conversation: Conversation;
  currentUserId: string;
}

interface UseConversationItemReturn {
  displayInfo: DisplayInfo;
  formattedTime: string | null;
  lastMessageText: string;
  showUnreadBadge: boolean;
  unreadCountText: string;
}

export const useConversationItem = ({
  conversation,
  currentUserId
}: UseConversationItemProps): UseConversationItemReturn => {
  
  /**
   * Get display information based on conversation type
   */
  const displayInfo = useMemo((): DisplayInfo => {
    if (conversation.type === 'GROUP' && conversation.groupId) {
      return {
        name: conversation.groupId.name,
        subtitle: 'محادثة جماعية',
        avatar: conversation.groupId.image?.url || null,
        userId: conversation.groupId._id
      };
    }
    
    // Find other participant with null safety check
    const otherParticipant = conversation.participants.find(
      p => p?.userId?._id && p.userId._id !== currentUserId
    );
    
    if (otherParticipant?.userId) {
      return {
        name: `${otherParticipant.userId.firstName || ''} ${otherParticipant.userId.lastName || ''}`.trim() || 'مستخدم',
        subtitle: ROLE_NAMES[otherParticipant.userModel as UserModel] || '',
        avatar: otherParticipant.userId.avatar?.url || null,
        userId: otherParticipant.userId._id
      };
    }
    
    return { name: 'محادثة', subtitle: '', avatar: null, userId: '' };
  }, [conversation, currentUserId]);

  /**
   * Format last message time
   */
  const formattedTime = useMemo(() => {
    if (!conversation.lastMessage?.createdAt) return null;
    
    return new Date(conversation.lastMessage.createdAt).toLocaleTimeString('ar-EG', {
      timeZone: 'Asia/Jerusalem',
      hour: '2-digit',
      minute: '2-digit'
    });
  }, [conversation.lastMessage?.createdAt]);

  /**
   * Get last message text or subtitle
   */
  const lastMessageText = useMemo(() => {
    return conversation.lastMessage?.text || displayInfo.subtitle;
  }, [conversation.lastMessage?.text, displayInfo.subtitle]);

  /**
   * Check if unread badge should be shown
   */
  const showUnreadBadge = conversation.unreadCount > 0;

  /**
   * Format unread count text
   */
  const unreadCountText = useMemo(() => {
    if (conversation.unreadCount > 99) return '99+';
    return String(conversation.unreadCount);
  }, [conversation.unreadCount]);

  return {
    displayInfo,
    formattedTime,
    lastMessageText,
    showUnreadBadge,
    unreadCountText
  };
};
