// ============================================================================
// useChatHeader.ts - Chat Header State Hook
// ============================================================================

import { useMemo } from 'react';
import { useAuth } from '../../../hooks/useAuth';

interface ChatHeaderConfig {
  title: string;
  subtitle: string;
  backgroundColor: string;
  textColor: string;
}

export const useChatHeader = (): ChatHeaderConfig => {
  const { user } = useAuth();

  return useMemo(() => {
    if (!user) {
      return {
        title: 'المحادثات',
        subtitle: '',
        backgroundColor: 'bg-gray-600',
        textColor: 'text-white'
      };
    }

    const userName = `${user.firstName || ''} ${user.lastName || ''}`.trim();

    switch (user.role) {
      case 'student':
        return {
          title: `المحادثات - ${userName}`,
          subtitle: `طالب - ${user.group || 'لا توجد حلقة'}`,
          backgroundColor: 'bg-gradient-to-r from-blue-600 to-blue-500',
          textColor: 'text-white'
        };
      
      case 'teacher':
        return {
          title: `المحادثات - ${userName}`,
          subtitle: 'معلم',
          backgroundColor: 'bg-gradient-to-r from-green-600 to-green-500',
          textColor: 'text-white'
        };
      
      case 'admin':
        return {
          title: `المحادثات - ${userName}`,
          subtitle: 'مشرف',
          backgroundColor: 'bg-gradient-to-r from-purple-600 to-purple-500',
          textColor: 'text-white'
        };
      
      default:
        return {
          title: `المحادثات - ${userName}`,
          subtitle: user.role || '',
          backgroundColor: 'bg-gradient-to-r from-gray-600 to-gray-500',
          textColor: 'text-white'
        };
    }
  }, [user]);
};
