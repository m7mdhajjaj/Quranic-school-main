// ============================================================================
// useMessageScroll.ts - Auto Scroll Management Hook
// ============================================================================

import { useRef, useEffect, useCallback, useState } from 'react';

interface UseMessageScrollProps {
  messages: any[];
  hasMore: boolean;
  loading: boolean;
  onLoadMore: (before: string) => void;
}

interface UseMessageScrollReturn {
  messagesContainerRef: React.RefObject<HTMLDivElement>;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  handleScroll: () => void;
  scrollToBottom: (behavior?: ScrollBehavior) => void;
  loadingMore: boolean;
  isNearTop: boolean;
}

export const useMessageScroll = ({
  messages,
  hasMore,
  loading,
  onLoadMore
}: UseMessageScrollProps): UseMessageScrollReturn => {
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [isNearTop, setIsNearTop] = useState(false);
  const previousScrollHeight = useRef<number>(0);
  const isLoadingRef = useRef(false);

  /**
   * Scroll to bottom of messages
   */
  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  }, []);

  /**
   * Auto-scroll on new messages (only if already at bottom)
   */
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const isAtBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100;
    
    if (isAtBottom) {
      scrollToBottom('auto');
    }
  }, [messages.length, scrollToBottom]);

  /**
   * Handle scroll for pagination
   */
  const handleScroll = useCallback(() => {
    const container = messagesContainerRef.current;
    if (!container || !hasMore || isLoadingRef.current || loading) return;

    const scrollTop = container.scrollTop;
    const threshold = 100; // pixels from top to trigger load

    // Check if near top
    setIsNearTop(scrollTop < threshold);

    // Load more when scrolled to top
    if (scrollTop < 50 && !isLoadingRef.current) {
      // ✅ Fix: Get the first message (oldest) for pagination
      const oldestMessage = messages[0];
      if (oldestMessage?.createdAt) {
        isLoadingRef.current = true;
        setLoadingMore(true);
        previousScrollHeight.current = container.scrollHeight;
        
        onLoadMore(oldestMessage.createdAt);
      }
    }
  }, [messages, hasMore, loading, onLoadMore]);

  /**
   * Restore scroll position after loading more messages
   */
  useEffect(() => {
    if (loadingMore && !loading) {
      const container = messagesContainerRef.current;
      if (container && previousScrollHeight.current > 0) {
        const newScrollHeight = container.scrollHeight;
        const scrollDiff = newScrollHeight - previousScrollHeight.current;
        container.scrollTop = scrollDiff;
        previousScrollHeight.current = 0;
      }
      setLoadingMore(false);
      isLoadingRef.current = false;
    }
  }, [loading, loadingMore]);

  return {
    messagesContainerRef,
    messagesEndRef,
    handleScroll,
    scrollToBottom,
    loadingMore: loadingMore && loading,
    isNearTop
  };
};
