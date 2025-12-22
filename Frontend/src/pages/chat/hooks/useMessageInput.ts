// ============================================================================
// useMessageInput.ts - Message Input State Hook
// ============================================================================

import { useState, useCallback, KeyboardEvent, ChangeEvent } from 'react';

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

  const handleInputChange = useCallback((value: string) => {
    if (value.length <= maxLength) {
      setInputText(value);
      onTyping(value.trim().length > 0);
    }
  }, [maxLength, onTyping]);

  const handleSend = useCallback(async () => {
    const trimmedText = inputText.trim();
    if (!trimmedText) return;
    
    try {
      await onSend(trimmedText);
      setInputText('');
      onTyping(false);
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
