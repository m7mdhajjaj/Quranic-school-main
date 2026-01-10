// ============================================================================
// useMessageItem.ts - Message Item Logic Hook
// ============================================================================

import { useState, useRef, useEffect, useCallback } from 'react';
import { editMessageSchema } from '../../../Validation/chatValidation';
import api from '../../../Api/api';
import { showConfirmMessage, showErrorMessage } from '../../../utils/sweetalertUtils';
import type { Message } from '../types';

interface UseMessageItemProps {
  message: Message;
  onEdit?: (messageId: string, newText: string) => void;
  onDelete?: (messageId: string, deletedForAll: boolean) => void;
}

interface ErrorWithMessage {
  errors?: Array<{ message: string }>;
  response?: {
    data?: {
      message?: string;
    };
  };
}

export const useMessageItem = ({ message, onEdit, onDelete }: UseMessageItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(message.text);
  const [editError, setEditError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Focus textarea when editing starts
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [isEditing]);

  const handleStartEdit = useCallback(() => {
    setIsEditing(true);
    setEditText(message.text);
    setEditError(null);
  }, [message.text]);

  const handleCancelEdit = useCallback(() => {
    setIsEditing(false);
    setEditText(message.text);
    setEditError(null);
  }, [message.text]);

  const handleSaveEdit = useCallback(async () => {
    try {
      const validated = editMessageSchema.parse({ text: editText.trim() });
      if (validated.text === message.text) {
        setIsEditing(false);
        return;
      }
      if (onEdit) {
        await onEdit(message._id, validated.text);
        setIsEditing(false);
        setEditError(null);
      }
    } catch (error: unknown) {
      const err = error as ErrorWithMessage;
      if (err.errors?.[0]?.message) {
        setEditError(err.errors[0].message);
      } else if (err.response?.data?.message) {
        setEditError(err.response.data.message);
      } else {
        setEditError('فشل تعديل الرسالة');
      }
    }
  }, [editText, message, onEdit]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  }, [handleSaveEdit, handleCancelEdit]);

  const handleDelete = useCallback(async (deleteForAll: boolean) => {
    try {
      const confirmed = await showConfirmMessage(
        deleteForAll ? "حذف لدى الجميع؟" : "حذف لديّ؟",
        deleteForAll 
          ? "سيتم حذف الرسالة لدى جميع المشاركين في المحادثة." 
          : "سيتم حذف الرسالة من جهازك فقط.",
        "نعم، احذف",
        "إلغاء"
      );
      if (confirmed.isConfirmed) {
        await api.delete(`/chat/messages/${message._id}`, {
          data: { deleteForAll }
        });
        if (onDelete) {
          onDelete(message._id, deleteForAll);
        }
      }
    } catch (error: unknown) {
      const err = error as ErrorWithMessage;
      showErrorMessage("خطأ", err.response?.data?.message || "فشل حذف الرسالة");
    }
  }, [message, onDelete]);

  return {
    isEditing,
    editText,
    setEditText,
    editError,
    textareaRef,
    handleStartEdit,
    handleCancelEdit,
    handleSaveEdit,
    handleKeyDown,
    handleDelete
  };
};
