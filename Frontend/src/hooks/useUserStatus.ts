// hooks/useUserStatus.ts
import { useContext } from 'react';
import { UserStatusContext } from '../contexts/UserStatusContext';
import type { UserStatusState } from '../contexts/UserStatusContext';

// Hook لاستخدام السياق
export const useUserStatus = (userId?: string): UserStatusState => {
  const context = useContext(UserStatusContext);
  
  if (!context) {
    throw new Error('useUserStatus must be used within UserStatusProvider');
  }

  return context.getUserStatus(userId);
};

// Hook للحصول على دوال التحكم
export const useUserStatusActions = () => {
  const context = useContext(UserStatusContext);
  
  if (!context) {
    throw new Error('useUserStatusActions must be used within UserStatusProvider');
  }

  return {
    refreshStatus: context.refreshStatus,
    getUserStatus: context.getUserStatus,
  };
};