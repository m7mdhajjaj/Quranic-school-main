import { useState, useEffect, useRef } from 'react';
import { useChatSocket } from './useChatSocket';
import type { ChatType } from '../types';

/**
 * Hook to track typing status across all conversations for the sidebar
 */
export const useConversationsTyping = () => {
  const { onTyping } = useChatSocket();
  // Map of ID -> boolean (is typing)
  // For DM: ID is the other user's ID
  // For Group: ID is the group ID
  const [typingStatus, setTypingStatus] = useState<Record<string, boolean>>({});
  
  // Timers to auto-clear typing status if no stop event received
  const timersRef = useRef<Record<string, NodeJS.Timeout>>({});

  useEffect(() => {
    const handleTyping = (data: { chatType: ChatType; targetId: string; userId?: string; isTyping?: boolean }) => {
      // Identity of the conversation to update
      // For DM: The 'targetId' from server is the sender's ID (the person typing to me)
      // For Group: The 'targetId' is the group ID
      
      const conversationId = data.targetId;
      
      if (!conversationId) return;

      if (data.isTyping) {
        setTypingStatus(prev => ({ ...prev, [conversationId]: true }));
        
        // Clear existing timer
        if (timersRef.current[conversationId]) {
          clearTimeout(timersRef.current[conversationId]);
        }
        
        // Auto-clear after 4 seconds (safer than relying only on stop event)
        timersRef.current[conversationId] = setTimeout(() => {
          setTypingStatus(prev => ({ ...prev, [conversationId]: false }));
        }, 4000);
      } else {
        setTypingStatus(prev => ({ ...prev, [conversationId]: false }));
        if (timersRef.current[conversationId]) {
          clearTimeout(timersRef.current[conversationId]);
        }
      }
    };

    const cleanup = onTyping(handleTyping);
    return () => {
      cleanup();
      // Clear all timers
      Object.values(timersRef.current).forEach(clearTimeout);
    };
  }, [onTyping]);

  return typingStatus;
};
