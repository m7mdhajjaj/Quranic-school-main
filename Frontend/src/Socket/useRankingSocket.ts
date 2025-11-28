import { useEffect, useState, useRef } from 'react';
import { socketManager } from './SocketManager';
import { useAuth } from '../hooks/useAuth';

/**
 * Hook مخصص لصفحة الترتيب (Ranking) مع Socket.IO
 * يوفر heartbeat تلقائي كل 30 ثانية من SocketManager
 * يستمع لأحداث العلامات والطلاب لتحديث الترتيب تلقائياً
 */
export const useRankingSocket = () => {
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [socketId, setSocketId] = useState<string | null>(null);
  const hasJoinedRoom = useRef(false);

  /**
   * الاتصال وإعداد الغرفة
   */
  useEffect(() => {
    if (!user) {
      console.log('⚠️ No user, skipping rankings socket connection');
      return;
    }

    console.log('🔌 Initializing Rankings Socket...');
    
    // الاتصال (SocketManager يدير Heartbeat تلقائياً)
    socketManager.connect(user._id, user.role);

    // الاشتراك في تحديثات الاتصال
    const unsubscribe = socketManager.onConnectionChange((connected) => {
      console.log('📡 Ranking socket connection:', connected);
      setIsConnected(connected);
      setSocketId(socketManager.getSocketId() || null);
      
      if (connected && !hasJoinedRoom.current) {
        joinRankingRoom();
      }
    });

    setIsConnected(socketManager.isConnected());
    setSocketId(socketManager.getSocketId() || null);

    // الانضمام لغرف العلامات والطلاب (الترتيب يعتمد عليهما)
    const joinRankingRoom = () => {
      if (socketManager.isConnected() && !hasJoinedRoom.current) {
        console.log('🏆 Joining ranking related rooms...');
        
        // الانضمام لغرفة العلامات (marks)
        socketManager.emit('joinMarks', {
          userId: user._id,
          userRole: user.role,
          timestamp: Date.now(),
        });
        
        // الانضمام لغرفة الطلاب (لأن التصنيف يعتمد على بيانات الطلاب)
        socketManager.emit('joinStudents', {
          userId: user._id,
          userRole: user.role,
          timestamp: Date.now(),
        });
        
        hasJoinedRoom.current = true;
      }
    };

    if (socketManager.isConnected()) {
      joinRankingRoom();
    }

    return () => {
      console.log('🧹 Cleaning up Ranking Socket...');
      
      // مغادرة الغرف
      if (hasJoinedRoom.current) {
        socketManager.emit('leaveMarks', { userId: user._id });
        socketManager.emit('leaveStudents', { userId: user._id });
        hasJoinedRoom.current = false;
      }
      
      // إلغاء الاشتراك
      unsubscribe();
    };
  }, [user]);

  /**
   * الاستماع لأحداث العلامات والطلاب
   * (الترتيب يتغير عند تغيير العلامات أو بيانات الطلاب)
   */
  useEffect(() => {
    if (!isConnected) return;

    console.log('👂 Setting up Ranking event listeners...');

    // أحداث العلامات
    const handleMarkCreated = (...args: unknown[]) => {
      console.log('➕ Mark created (affecting ranking):', args[0]);
      setLastUpdate(new Date());
    };

    const handleMarkUpdated = (...args: unknown[]) => {
      console.log('✏️ Mark updated (affecting ranking):', args[0]);
      setLastUpdate(new Date());
    };

    const handleMarkDeleted = (...args: unknown[]) => {
      console.log('🗑️ Mark deleted (affecting ranking):', args[0]);
      setLastUpdate(new Date());
    };

    // أحداث الطلاب (قد تؤثر على الترتيب)
    const handleStudentUpdated = (...args: unknown[]) => {
      console.log('✏️ Student updated (may affect ranking):', args[0]);
      setLastUpdate(new Date());
    };

    const handleStudentDeleted = (...args: unknown[]) => {
      console.log('🗑️ Student deleted (affecting ranking):', args[0]);
      setLastUpdate(new Date());
    };

    // الاشتراك في الأحداث
    socketManager.on('markCreated', handleMarkCreated);
    socketManager.on('markUpdated', handleMarkUpdated);
    socketManager.on('markDeleted', handleMarkDeleted);
    socketManager.on('studentUpdated', handleStudentUpdated);
    socketManager.on('studentDeleted', handleStudentDeleted);

    // التنظيف
    return () => {
      console.log('🧹 Removing Rankings event listeners...');
      socketManager.off('markCreated', handleMarkCreated);
      socketManager.off('markUpdated', handleMarkUpdated);
      socketManager.off('markDeleted', handleMarkDeleted);
      socketManager.off('studentUpdated', handleStudentUpdated);
      socketManager.off('studentDeleted', handleStudentDeleted);
    };
  }, [isConnected]);

  return {
    isConnected,
    lastUpdate,
    socketId,
  };
};
