// ============================================================================
// useChatSidebar.ts - Chat Sidebar Logic Hook
// ============================================================================

import { useState, useCallback } from 'react';
import type { Conversation } from '../types';

export type SidebarView = 'conversations' | 'contacts';

export const useChatSidebar = (
  conversations: Conversation[],
  selectedId: string | undefined,
  onDeleteConversation: (id: string) => Promise<void>
) => {
  const [view, setView] = useState<SidebarView>('conversations');

  // Handle conversation deletion with proper event handling
  const handleDeleteConversation = useCallback(
    async (e: React.MouseEvent, conversationId: string) => {
      e.stopPropagation();
      try {
        await onDeleteConversation(conversationId);
      } catch (error: any) {
        console.error("Failed to delete conversation", error);
      }
    },
    [onDeleteConversation]
  );

  // Check if a contact is currently selected
  const isContactSelected = useCallback(
    (contactId: string) => {
      if (!selectedId) return false;
      
      // Check for temporary selection
      if (selectedId === `temp-${contactId}`) return true;

      // Check if contact is in active conversation
      const activeConv = conversations.find((c) => c._id === selectedId);
      if (activeConv && activeConv.type === 'DM') {
        return activeConv.participants.some((p) => p.userId._id === contactId);
      }
      
      return false;
    },
    [conversations, selectedId]
  );

  // Check if a group is currently selected
  const isGroupSelected = useCallback(
    (groupId: string) => {
      if (!selectedId) return false;
      
      // Check for temporary selection
      if (selectedId === `temp-${groupId}`) return true;

      // Check if group is in active conversation
      const activeConv = conversations.find((c) => c._id === selectedId);
      if (activeConv && activeConv.type === 'GROUP') {
        return activeConv.groupId?._id === groupId;
      }
      
      return false;
    },
    [conversations, selectedId]
  );

  return {
    view,
    setView,
    handleDeleteConversation,
    isContactSelected,
    isGroupSelected,
  };
};
