// ============================================================================
// useMessageInput.ts - Message Input State Hook
// ============================================================================

import { useState, useCallback, useRef, type KeyboardEvent } from 'react';

interface UseMessageInputProps {
  onSend: (text: string) => Promise<void>;
  onTyping: (isTyping: boolean) => void;
  maxLength?: number;
}

interface UseMessageInputReturn {
  inputText: string;
  handleInputChange: (value: string) => void;
  handleKeyDown: (e: KeyboardEvent<HTMLTextAreaElement>) => void;
  handleSend: () => Promise<void>;
  clearInput: () => void;
  canSend: boolean;
}

export const useMessageInput = ({
  onSend,
  onTyping,
  maxLength = 5000
}: UseMessageInputProps): UseMessageInputReturn => {
  const [inputText, setInputText] = useState('');
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isTypingRef = useRef(false);

  const handleInputChange = useCallback((value: string) => {
    if (value.length <= maxLength) {
      setInputText(value);
      
      const hasContent = value.trim().length > 0;
      
      // Send typing start if content exists and not already typing
      if (hasContent && !isTypingRef.current) {
        onTyping(true);
        isTypingRef.current = true;
      }
      
      // Clear previous timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Set new timeout to stop typing after 2 seconds of inactivity
      if (hasContent) {
        typingTimeoutRef.current = setTimeout(() => {
          onTyping(false);
          isTypingRef.current = false;
        }, 2000);
      } else {
        // Stop typing immediately if input is empty
        onTyping(false);
        isTypingRef.current = false;
      }
    }
  }, [maxLength, onTyping]);

  const handleSend = useCallback(async () => {
    const trimmedText = inputText.trim();
    if (!trimmedText) return;
    
    // Clear typing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    try {
      await onSend(trimmedText);
      setInputText('');
      onTyping(false);
      isTypingRef.current = false;
    } catch (error) {
      console.error('Error sending message:', error);
    }
  }, [inputText, onSend, onTyping]);

  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  const clearInput = useCallback(() => {
    setInputText('');
    onTyping(false);
    isTypingRef.current = false;
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  }, [onTyping]);

  const canSend = inputText.trim().length > 0;

  return {
    inputText,
    handleInputChange,
    handleKeyDown,
    handleSend,
    clearInput,
    canSend
  };
};
