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
      return;
    }

    // الاتصال (SocketManager يدير Heartbeat تلقائياً)
    socketManager.connect(user._id, user.role);

    // الاشتراك في تحديثات الاتصال
    const unsubscribe = socketManager.onConnectionChange((connected) => {
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

    // أحداث العلامات
    const handleMarkCreated = () => {
      setLastUpdate(new Date());
    };

    const handleMarkUpdated = () => {
      setLastUpdate(new Date());
    };

    const handleMarkDeleted = () => {
      setLastUpdate(new Date());
    };

    // أحداث الطلاب (قد تؤثر على الترتيب)
    const handleStudentUpdated = () => {
      setLastUpdate(new Date());
    };

    const handleStudentDeleted = () => {
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
