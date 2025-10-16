import { useEffect, useState, useRef } from 'react';
import { socketManager } from './SocketManager';
import { useAuth } from '../hooks/useAuth';

/**
 * Hook مخصص لصفحة الأنشطة (Activities) مع Socket.IO
 * يوفر heartbeat تلقائي كل 30 ثانية من SocketManager
 * يستمع لأحداث الأنشطة لتحديث البيانات تلقائياً
 */
export const useActivitiesSocket = () => {
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

    console.log('🔌 Initializing Activities Socket...');
    socketManager.connect();

    // الاشتراك في تحديثات الاتصال
    const unsubscribe = socketManager.onConnectionChange((connected) => {
      console.log('📡 Activities socket connection:', connected);
      setIsConnected(connected);
      setSocketId(socketManager.getSocketId() || null);
      
      if (connected && !hasJoinedRoom.current) {
        joinActivitiesRoom();
      }
    });

    setIsConnected(socketManager.isConnected());
    setSocketId(socketManager.getSocketId() || null);

    // الانضمام لغرفة الأنشطة
    const joinActivitiesRoom = () => {
      if (socketManager.isConnected() && !hasJoinedRoom.current) {
        console.log('🎯 Joining activities room...');
        
        socketManager.emit('joinActivities', {
          userId: user._id,
          userRole: user.role,
          timestamp: Date.now(),
        });
        
        hasJoinedRoom.current = true;
      }
    };

    if (socketManager.isConnected()) {
      joinActivitiesRoom();
    }

    return () => {
      console.log('🧹 Cleaning up Activities Socket...');
      
      // مغادرة الغرفة
      if (hasJoinedRoom.current) {
        socketManager.emit('leaveActivities', { userId: user._id });
        hasJoinedRoom.current = false;
      }
      
      // إلغاء الاشتراك
      unsubscribe();
    };
  }, [user]);

  /**
   * الاستماع لأحداث الأنشطة
   */
  useEffect(() => {
    if (!isConnected) return;

    console.log('👂 Setting up Activities event listeners...');

    const handleActivityCreated = (...args: unknown[]) => {
      console.log('➕ Activity created:', args[0]);
      setLastUpdate(new Date());
    };

    const handleActivityUpdated = (...args: unknown[]) => {
      console.log('✏️ Activity updated:', args[0]);
      setLastUpdate(new Date());
    };

    const handleActivityDeleted = (...args: unknown[]) => {
      console.log('🗑️ Activity deleted:', args[0]);
      setLastUpdate(new Date());
    };

    // الاشتراك في الأحداث
    socketManager.on('activityCreated', handleActivityCreated);
    socketManager.on('activityUpdated', handleActivityUpdated);
    socketManager.on('activityDeleted', handleActivityDeleted);

    // التنظيف
    return () => {
      console.log('🧹 Removing Activities event listeners...');
      socketManager.off('activityCreated', handleActivityCreated);
      socketManager.off('activityUpdated', handleActivityUpdated);
      socketManager.off('activityDeleted', handleActivityDeleted);
    };
  }, [isConnected]);

  return {
    isConnected,
    lastUpdate,
    socketId,
  };
};
