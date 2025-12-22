// ============================================================================
// useMessageScroll.ts - Auto Scroll Management Hook
// ============================================================================

import { useRef, useEffect, useCallback } from 'react';

interface UseMessageScrollProps {
  messages: any[];
  hasMore: boolean;
  onLoadMore: (before: string) => void;
}

interface UseMessageScrollReturn {
  messagesContainerRef: React.RefObject<HTMLDivElement>;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  handleScroll: () => void;
  scrollToBottom: (behavior?: ScrollBehavior) => void;
}

export const useMessageScroll = ({
  messages,
  hasMore,
  onLoadMore
}: UseMessageScrollProps): UseMessageScrollReturn => {
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  /**
   * Scroll to bottom of messages
   */
  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  }, []);

  /**
   * Auto-scroll on new messages
   */
  useEffect(() => {
    scrollToBottom();
  }, [messages.length, scrollToBottom]);

  /**
   * Handle scroll for pagination
   */
  const handleScroll = useCallback(() => {
    const container = messagesContainerRef.current;
    if (!container || !hasMore) return;

    // Check if scrolled to top
    if (container.scrollTop === 0) {
      const oldestMessage = messages[messages.length - 1];
      if (oldestMessage?.createdAt) {
        onLoadMore(oldestMessage.createdAt);
      }
    }
  }, [messages, hasMore, onLoadMore]);

  return {
    messagesContainerRef,
    messagesEndRef,
    handleScroll,
    scrollToBottom
  };
};
