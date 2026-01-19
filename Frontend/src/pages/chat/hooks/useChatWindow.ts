// ============================================================================
// useChatWindow.ts - Chat Window Main Logic Hook
// ============================================================================

import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { useChat } from './useChat';
import { useMessageOperations } from './useMessageOperations';
import { useMessageInput } from './useMessageInput';
import { useMentions } from './useMentions';
import type { Message, MentionItem, User, ChatType } from '../types';

interface UseChatWindowProps {
  chatType: ChatType;
  targetId: string;
  onNewMessage?: (message: Message) => void;
}

export const useChatWindow = ({ chatType, targetId, onNewMessage }: UseChatWindowProps) => {
  const { user } = useAuth();
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [showLoadingSpinner, setShowLoadingSpinner] = useState(false);
  const markingReadRef = useRef<Set<string>>(new Set());
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const previousScrollHeight = useRef<number>(0);
  const isLoadingRef = useRef(false);
  
  // Chat messages and operations
  const { 
    messages, 
    loading,
    loadingMore, 
    hasMore,
    fetchMessages,
    sendMessage,
    editMessage,
    handleTyping,
    typingUsers,
    isTyping,
    markMessageAsRead,
    jumpToMessage,
    handleMessageDeleted
  } = useChat(chatType, targetId);

  // Message operations (reply, sending state)
  const { replyTo, setReplyTo, clearReply, isSending, setIsSending } = useMessageOperations();
  
  // Mentions Hook - only for GROUP chats
  const [mentions, setMentions] = useState<MentionItem[]>([]);
  const {
    isOpen: isMentionOpen,
    activeIndex: mentionActiveIndex,
    users: mentionUsers,
    position: mentionPosition,
    triggerIndex: mentionTriggerIndex,
    query: mentionQuery,
    textareaRef,
    handleChange: handleMentionChange,
    handleKeyDown: handleMentionKeyDown,
    closeMentions
  } = useMentions(chatType, chatType === 'GROUP' ? targetId : undefined);

  // Dedupe messages with useMemo for performance (O(n²) operation)
  const uniqueMessages = useMemo(() => 
    messages.filter((msg, index, self) => 
      index === self.findIndex((m) => (
        m._id ? m._id === msg._id : m.clientTempId === msg.clientTempId
      ))
    ),
    [messages]
  );

  // Callbacks
  const handleReplyCallback = useCallback((message: Message) => {
    setReplyTo(message);
  }, [setReplyTo]);

  const handleDeleteCallback = useCallback((messageId: string, deletedForAll: boolean) => {
    handleMessageDeleted(messageId, deletedForAll);
  }, [handleMessageDeleted]);

  const handleEditCallback = useCallback((messageId: string, newText: string) => {
    editMessage(messageId, newText);
  }, [editMessage]);

  // Scroll to bottom function
  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  }, []);

  // Handle scroll with pagination and scroll button
  const handleScroll = useCallback((e?: React.UIEvent<HTMLDivElement>) => {
    const container = e?.currentTarget || messagesContainerRef.current;
    if (!container) return;

    // Show/hide scroll button
    const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 200;
    setShowScrollButton(!isNearBottom);

    // Load more messages when near top
    if (hasMore && !isLoadingRef.current && !loadingMore) {
      const scrollTop = container.scrollTop;
      if (scrollTop < 50) {
        const oldestMessage = messages[0];
        if (oldestMessage?.createdAt) {
          isLoadingRef.current = true;
          setShowLoadingSpinner(true);
          previousScrollHeight.current = container.scrollHeight;
          fetchMessages(oldestMessage.createdAt);
        }
      }
    }
  }, [hasMore, loadingMore, messages, fetchMessages, setShowScrollButton]);

  // Auto-scroll on new messages
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const isAtBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 150;
    if (isAtBottom) {
      requestAnimationFrame(() => {
        scrollToBottom('smooth');
      });
    }
  }, [messages.length, scrollToBottom]);

  // Restore scroll position after loading more
  useEffect(() => {
    if (showLoadingSpinner && !loadingMore) {
      const container = messagesContainerRef.current;
      if (container && previousScrollHeight.current > 0) {
        const newScrollHeight = container.scrollHeight;
        const scrollDiff = newScrollHeight - previousScrollHeight.current;
        container.scrollTop = scrollDiff;
        previousScrollHeight.current = 0;
      }
      setShowLoadingSpinner(false);
      isLoadingRef.current = false;
    }
  }, [loadingMore, showLoadingSpinner]);

  // Input handling with mentions support
  const { 
    inputText, 
    handleInputChange: handleInputTextChange, 
    handleKeyDown: baseHandleKeyDown, 
    handleSend: baseSend,
    clearInput,
    canSend
  } = useMessageInput({
    onSend: async (text: string) => {
      setIsSending(true);
      try {
        await sendMessage(text, replyTo?._id);
        clearInput();
        clearReply();
        setMentions([]);
        requestAnimationFrame(() => {
          setTimeout(() => scrollToBottom('smooth'), 50);
        });
      } catch (error) {
        console.error("Failed to send message:", error);
      } finally {
        setIsSending(false);
      }
    },
    onTyping: handleTyping,
    maxLength: 1000
  });

  // Handle mention selection
  const handleSelectMention = useCallback((user: User | 'all') => {
    if (mentionTriggerIndex === null || !textareaRef.current) return;

    const textBefore = inputText.slice(0, mentionTriggerIndex);
    const textAfter = inputText.slice(textareaRef.current.selectionStart || 0);
    
    let mentionText = '';
    let newMention: MentionItem;

    if (user === 'all') {
      mentionText = '@الجميع ';
      newMention = { type: 'all' };
    } else {
      mentionText = `@${user.firstName} ${user.lastName} `;
      newMention = { type: 'user', user };
    }

    const newText = textBefore + mentionText + textAfter;
    handleInputTextChange(newText);
    setMentions(prev => [...prev, newMention]);
    closeMentions();
    
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        const newCursorPos = textBefore.length + mentionText.length;
        textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
  }, [mentionTriggerIndex, inputText, textareaRef, handleInputTextChange, closeMentions]);

  // Send with mentions
  const handleSendWithMentions = useCallback(async () => {
    if (!inputText.trim()) return;
    
    // Validate mentions before sending
    mentions.filter(m => {
      if (m.type === 'all') return inputText.includes('@الجميع');
      return true;
    });

    await baseSend();
  }, [inputText, mentions, baseSend]);

  // Combined KeyDown Handler
  const onKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (isMentionOpen) {
      const handled = handleMentionKeyDown(e);
      if (handled && e.key === 'Enter') {
        const allOption: User | 'all' = 'all';
        const list = [allOption, ...mentionUsers];
        const item = list[mentionActiveIndex];
        if (item) handleSelectMention(item === 'all' ? 'all' : item as User);
        return;
      }
      if (handled) return;
    }
    baseHandleKeyDown(e);
  }, [isMentionOpen, handleMentionKeyDown, mentionActiveIndex, mentionUsers, handleSelectMention, baseHandleKeyDown]);

  // Combined Change Handler
  const onInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    handleInputTextChange(e.target.value);
    handleMentionChange(e);
  }, [handleInputTextChange, handleMentionChange]);

  // Handle scrolling to replied message
  const handleReplyClick = useCallback(async (messageId: string) => {
    const element = document.getElementById(`message-${messageId}`);
    
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      element.classList.add('bg-yellow-50/50', 'transition-colors', 'duration-1000');
      setTimeout(() => {
        element.classList.remove('bg-yellow-50/50', 'transition-colors', 'duration-1000');
      }, 2000);
    } else {
      try {
        await jumpToMessage(messageId);
        setTimeout(() => {
          const newElement = document.getElementById(`message-${messageId}`);
          if (newElement) {
            newElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            newElement.classList.add('bg-yellow-50/50', 'transition-colors', 'duration-1000');
            setTimeout(() => {
              newElement.classList.remove('bg-yellow-50/50', 'transition-colors', 'duration-1000');
            }, 2000);
          }
        }, 100);
      } catch (error) {
        console.error("Failed to jump to message:", error);
      }
    }
  }, [jumpToMessage]);

  // Mark unread messages as read
  useEffect(() => {
    if (!uniqueMessages.length || !user) return;

    const unreadMessages = uniqueMessages.filter((msg: Message) => {
      const isFromMe = msg.sender?._id === user._id;
      if (isFromMe) return false;

      if (chatType === 'DM') {
        return !msg.readAt && !markingReadRef.current.has(msg._id);
      } else {
        const seenByMe = msg.seenBy?.some(s => s.userId === user._id);
        return !seenByMe && !markingReadRef.current.has(msg._id);
      }
    });

    if (unreadMessages.length > 0) {
      unreadMessages.forEach((msg: Message) => {
        markingReadRef.current.add(msg._id);
        markMessageAsRead(msg._id);
      });
    }
  }, [uniqueMessages, user, chatType, markMessageAsRead]);

  // Notify parent of new messages
  useEffect(() => {
    if (uniqueMessages.length > 0 && onNewMessage) {
      const latestMessage = uniqueMessages[0];
      if (latestMessage.sender?._id !== user?._id) {
        onNewMessage(latestMessage);
      }
    }
  }, [uniqueMessages, onNewMessage, user]);

  // Fix passive event listener issue
  useEffect(() => {
    const element = messagesContainerRef.current;
    if (!element) return;

    const handleWheel = (e: WheelEvent) => {
      const atTop = element.scrollTop === 0;
      const atBottom = Math.abs(element.scrollHeight - element.scrollTop - element.clientHeight) < 1;
      
      if ((atTop && e.deltaY < 0) || (atBottom && e.deltaY > 0)) {
        e.preventDefault();
      }
    };

    element.addEventListener('wheel', handleWheel, { passive: false });
    return () => element.removeEventListener('wheel', handleWheel);
  }, [messagesContainerRef]);

  return {
    // State
    user,
    uniqueMessages,
    loading,
    showLoadingSpinner,
    showScrollButton,
    replyTo,
    inputText,
    canSend,
    isSending,
    typingUsers,
    isTyping,
    
    // Mentions
    isMentionOpen,
    mentionActiveIndex,
    mentionUsers,
    mentionPosition,
    mentionQuery,
    textareaRef,
    
    // Refs
    messagesContainerRef,
    messagesEndRef,
    
    // Handlers
    handleReplyCallback,
    handleDeleteCallback,
    handleEditCallback,
    handleReplyClick,
    handleScroll,
    scrollToBottom,
    clearReply,
    onInputChange,
    onKeyDown,
    handleSendWithMentions,
    handleSelectMention
  };
};
