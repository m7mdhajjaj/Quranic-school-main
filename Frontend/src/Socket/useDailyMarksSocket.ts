import { useEffect, useState, useRef } from 'react';
import { socketManager } from './SocketManager';
import { useAuth } from '../hooks/useAuth';

/**
 * Hook مخصص لصفحة العلامات اليومية (DailyMarks) مع Socket.IO
 * يوفر heartbeat تلقائي كل 30 ثانية من SocketManager
 * يستمع لأحداث العلامات لتحديث البيانات تلقائياً
 */
export const useDailyMarksSocket = () => {
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [socketId, setSocketId] = useState<string | null>(null);
  const hasJoinedRoom = useRef(false);

  /**
   * الاتصال وإعداد الغرفة
   */
  useEffect(() => {
    if (!user) return;

    console.log('🔌 Initializing DailyMarks Socket...');
    socketManager.connect();

    // الاشتراك في تحديثات الاتصال
    const unsubscribe = socketManager.onConnectionChange((connected) => {
      console.log('📡 DailyMarks socket connection:', connected);
      setIsConnected(connected);
      setSocketId(socketManager.getSocketId() || null);
      
      if (connected && !hasJoinedRoom.current) {
        joinDailyMarksRoom();
      }
    });

    setIsConnected(socketManager.isConnected());
    setSocketId(socketManager.getSocketId() || null);

    // الانضمام لغرفة العلامات
    const joinDailyMarksRoom = () => {
      if (socketManager.isConnected() && !hasJoinedRoom.current) {
        console.log('📝 Joining marks room for DailyMarks...');
        
        socketManager.emit('joinMarks', {
          userId: user._id,
          userRole: user.role,
          timestamp: Date.now(),
        });
        
        hasJoinedRoom.current = true;
      }
    };

    if (socketManager.isConnected()) {
      joinDailyMarksRoom();
    }

    return () => {
      console.log('🧹 Cleaning up DailyMarks Socket...');
      
      // مغادرة الغرفة
      if (hasJoinedRoom.current) {
        socketManager.emit('leaveMarks', { userId: user._id });
        hasJoinedRoom.current = false;
      }
      
      // إلغاء الاشتراك
      unsubscribe();
    };
  }, [user]);

  /**
   * الاستماع لأحداث العلامات
   */
  useEffect(() => {
    if (!isConnected) return;

    console.log('👂 Setting up DailyMarks event listeners...');

    const handleMarkCreated = (...args: unknown[]) => {
      console.log('➕ Mark created (DailyMarks):', args[0]);
      setLastUpdate(new Date());
    };

    const handleMarkUpdated = (...args: unknown[]) => {
      console.log('✏️ Mark updated (DailyMarks):', args[0]);
      setLastUpdate(new Date());
    };

    const handleMarkDeleted = (...args: unknown[]) => {
      console.log('🗑️ Mark deleted (DailyMarks):', args[0]);
      setLastUpdate(new Date());
    };

    // الاشتراك في الأحداث
    socketManager.on('markCreated', handleMarkCreated);
    socketManager.on('markUpdated', handleMarkUpdated);
    socketManager.on('markDeleted', handleMarkDeleted);

    // التنظيف
    return () => {
      console.log('🧹 Removing DailyMarks event listeners...');
      socketManager.off('markCreated', handleMarkCreated);
      socketManager.off('markUpdated', handleMarkUpdated);
      socketManager.off('markDeleted', handleMarkDeleted);
    };
  }, [isConnected]);

  return {
    isConnected,
    lastUpdate,
    socketId,
  };
};
