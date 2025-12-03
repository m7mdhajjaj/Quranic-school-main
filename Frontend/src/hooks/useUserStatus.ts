import { useContext } from 'react';
import { UserStatusContext } from '@/Context/UserStatusContext';

export const useUserStatus = () => {
  const context = useContext(UserStatusContext);
  
  if (!context) {
    throw new Error('useUserStatus must be used within UserStatusProvider');
  }
  
  return context;
};
