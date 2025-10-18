/**
 * useSocket Hook - Wrapper للنظام الجديد Socket/SocketManager
 * 
 * هذا Hook للتوافق مع الكود القديم
 * يوفر وصول مباشر لـ socketManager من النظام الجديد
 */

import { useEffect, useState } from 'react';
import { socketManager } from '../Socket/SocketManager';
import { useAuth } from './useAuth';

interface UseSocketReturn {
  socket: ReturnType<typeof socketManager.getSocket>;
  isConnected: boolean;
  emit: (event: string, data?: unknown) => void;
  on: (event: string, callback: (data: unknown) => void) => void;
  off: (event: string, callback: (data: unknown) => void) => void;
}

/**
 * Hook للوصول لـ Socket Connection
 * يستخدم النظام الجديد SocketManager تلقائياً
 */
export const useSocket = (): UseSocketReturn => {
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!user) {
      setIsConnected(false);
      return;
    }

    // الاتصال بـ Socket Manager
    socketManager.connect(user._id, user.role);
    
    // مراقبة حالة الاتصال
    const handleConnectionChange = (connected: boolean) => {
      setIsConnected(connected);
    };

    // الاشتراك في تحديثات حالة الاتصال
    const unsubscribe = socketManager.onConnectionChange(handleConnectionChange);

    // Cleanup
    return () => {
      unsubscribe(); // إلغاء الاشتراك
    };
  }, [user]);

  const emit = (event: string, data?: unknown) => {
    socketManager.emit(event, data);
  };

  const on = (event: string, callback: (data: unknown) => void) => {
    socketManager.on(event, callback);
  };

  const off = (event: string, callback: (data: unknown) => void) => {
    socketManager.off(event, callback);
  };

  return {
    socket: socketManager.getSocket(),
    isConnected,
    emit,
    on,
    off,
  };
};

export default useSocket;
