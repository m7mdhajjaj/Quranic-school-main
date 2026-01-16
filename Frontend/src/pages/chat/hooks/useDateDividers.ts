// ============================================================================
// useDateDividers.ts - Date Dividers Logic Hook
// ============================================================================
// ✅ يستخدم توقيت فلسطين (Asia/Jerusalem) الموحد

import { useCallback } from 'react';
import type { Message } from '../types';
import { TIMEZONE } from '@/utils/timezone';

export const useDateDividers = () => {
  const shouldShowDateDivider = useCallback((currentMsg: Message, prevMsg: Message | null) => {
    if (!prevMsg) return true;
    const currentDate = new Date(currentMsg.createdAt).toDateString();
    const prevDate = new Date(prevMsg.createdAt).toDateString();
    return currentDate !== prevDate;
  }, []);

  const formatDateDivider = useCallback((dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return 'اليوم';
    if (date.toDateString() === yesterday.toDateString()) return 'أمس';
    return date.toLocaleDateString('ar-EG', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      timeZone: TIMEZONE
    });
  }, []);

  return { shouldShowDateDivider, formatDateDivider };
};
