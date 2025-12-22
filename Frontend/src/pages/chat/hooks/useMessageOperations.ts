// ============================================================================
// useMessageOperations.ts - Message Operations Hook
// ============================================================================

import { useState, useCallback } from 'react';

interface UseMessageOperationsReturn {
  replyTo: any | null;
  setReplyTo: (message: any) => void;
  clearReply: () => void;
  isSending: boolean;
  setIsSending: (value: boolean) => void;
}

export const useMessageOperations = (): UseMessageOperationsReturn => {
  const [replyTo, setReplyTo] = useState<any>(null);
  const [isSending, setIsSending] = useState(false);

  const clearReply = useCallback(() => {
    setReplyTo(null);
  }, []);

  return {
    replyTo,
    setReplyTo,
    clearReply,
    isSending,
    setIsSending
  };
};
