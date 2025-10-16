import { useEffect, useState, useRef } from 'react';
import { socketManager } from './SocketManager';
import { useAuth } from '../hooks/useAuth';

/**
 * Hook مخصص لصفحة الجدول الزمني (Timetable) مع Socket.IO
 * يوفر heartbeat تلقائي كل 30 ثانية من SocketManager
 * يستمع لأحداث الجلسات/الحصص لتحديث البيانات تلقائياً
 */
export const useTimetableSocket = () => {
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

    console.log('🔌 Initializing Timetable Socket...');
    socketManager.connect();

    // الاشتراك في تحديثات الاتصال
    const unsubscribe = socketManager.onConnectionChange((connected) => {
      console.log('📡 Timetable socket connection:', connected);
      setIsConnected(connected);
      setSocketId(socketManager.getSocketId() || null);
      
      if (connected && !hasJoinedRoom.current) {
        joinSessionsRoom();
      }
    });

    setIsConnected(socketManager.isConnected());
    setSocketId(socketManager.getSocketId() || null);

    // الانضمام لغرفة الجلسات
    const joinSessionsRoom = () => {
      if (socketManager.isConnected() && !hasJoinedRoom.current) {
        console.log('📅 Joining sessions room...');
        
        socketManager.emit('joinSessions', {
          userId: user._id,
          userRole: user.role,
          timestamp: Date.now(),
        });
        
        hasJoinedRoom.current = true;
      }
    };

    if (socketManager.isConnected()) {
      joinSessionsRoom();
    }

    return () => {
      console.log('🧹 Cleaning up Timetable Socket...');
      
      // مغادرة الغرفة
      if (hasJoinedRoom.current) {
        socketManager.emit('leaveSessions', { userId: user._id });
        hasJoinedRoom.current = false;
      }
      
      // إلغاء الاشتراك
      unsubscribe();
    };
  }, [user]);

  /**
   * الاستماع لأحداث الجلسات
   */
  useEffect(() => {
    if (!isConnected) return;

    console.log('👂 Setting up Timetable event listeners...');

    const handleSessionCreated = (...args: unknown[]) => {
      console.log('➕ Session created:', args[0]);
      setLastUpdate(new Date());
    };

    const handleSessionUpdated = (...args: unknown[]) => {
      console.log('✏️ Session updated:', args[0]);
      setLastUpdate(new Date());
    };

    const handleSessionDeleted = (...args: unknown[]) => {
      console.log('🗑️ Session deleted:', args[0]);
      setLastUpdate(new Date());
    };

    // الاشتراك في الأحداث
    socketManager.on('sessionCreated', handleSessionCreated);
    socketManager.on('sessionUpdated', handleSessionUpdated);
    socketManager.on('sessionDeleted', handleSessionDeleted);

    // التنظيف
    return () => {
      console.log('🧹 Removing Timetable event listeners...');
      socketManager.off('sessionCreated', handleSessionCreated);
      socketManager.off('sessionUpdated', handleSessionUpdated);
      socketManager.off('sessionDeleted', handleSessionDeleted);
    };
  }, [isConnected]);

  return {
    isConnected,
    lastUpdate,
    socketId,
  };
};
