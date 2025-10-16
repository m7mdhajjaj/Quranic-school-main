import { useEffect, useState, useRef } from 'react';
import { socketManager } from './SocketManager';
import { useAuth } from '../hooks/useAuth';

/**
 * Hook مخصص لصفحات الأخبار (News & NewsManagement) مع Socket.IO
 * يوفر heartbeat تلقائي كل 30 ثانية من SocketManager
 * يستمع لأحداث الأخبار لتحديث البيانات تلقائياً
 */
export const useNewsSocket = () => {
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

    console.log('🔌 Initializing News Socket...');
    socketManager.connect();

    // الاشتراك في تحديثات الاتصال
    const unsubscribe = socketManager.onConnectionChange((connected) => {
      console.log('📡 News socket connection:', connected);
      setIsConnected(connected);
      setSocketId(socketManager.getSocketId() || null);
      
      if (connected && !hasJoinedRoom.current) {
        joinNewsRoom();
      }
    });

    setIsConnected(socketManager.isConnected());
    setSocketId(socketManager.getSocketId() || null);

    // الانضمام لغرفة الأخبار
    const joinNewsRoom = () => {
      if (socketManager.isConnected() && !hasJoinedRoom.current) {
        console.log('📰 Joining news room...');
        
        socketManager.emit('joinNews', {
          userId: user._id,
          userRole: user.role,
          timestamp: Date.now(),
        });
        
        hasJoinedRoom.current = true;
      }
    };

    if (socketManager.isConnected()) {
      joinNewsRoom();
    }

    return () => {
      console.log('🧹 Cleaning up News Socket...');
      
      // مغادرة الغرفة
      if (hasJoinedRoom.current) {
        socketManager.emit('leaveNews', { userId: user._id });
        hasJoinedRoom.current = false;
      }
      
      // إلغاء الاشتراك
      unsubscribe();
    };
  }, [user]);

  /**
   * الاستماع لأحداث الأخبار
   */
  useEffect(() => {
    if (!isConnected) return;

    console.log('👂 Setting up News event listeners...');

    const handleNewsCreated = (...args: unknown[]) => {
      console.log('➕ News created:', args[0]);
      setLastUpdate(new Date());
    };

    const handleNewsUpdated = (...args: unknown[]) => {
      console.log('✏️ News updated:', args[0]);
      setLastUpdate(new Date());
    };

    const handleNewsDeleted = (...args: unknown[]) => {
      console.log('🗑️ News deleted:', args[0]);
      setLastUpdate(new Date());
    };

    // الاشتراك في الأحداث
    socketManager.on('newsCreated', handleNewsCreated);
    socketManager.on('newsUpdated', handleNewsUpdated);
    socketManager.on('newsDeleted', handleNewsDeleted);

    // التنظيف
    return () => {
      console.log('🧹 Removing News event listeners...');
      socketManager.off('newsCreated', handleNewsCreated);
      socketManager.off('newsUpdated', handleNewsUpdated);
      socketManager.off('newsDeleted', handleNewsDeleted);
    };
  }, [isConnected]);

  return {
    isConnected,
    lastUpdate,
    socketId,
  };
};
