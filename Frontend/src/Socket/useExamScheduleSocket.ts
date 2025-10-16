import { useEffect, useState, useRef } from 'react';
import { socketManager } from './SocketManager';
import { useAuth } from '../hooks/useAuth';

/**
 * Hook مخصص لصفحة جدول الامتحانات (ExamSchedule) مع Socket.IO
 * يوفر heartbeat تلقائي كل 30 ثانية من SocketManager
 * يستمع لأحداث الامتحانات والعلامات لتحديث البيانات تلقائياً
 */
export const useExamScheduleSocket = () => {
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

    console.log('🔌 Initializing ExamSchedule Socket...');
    socketManager.connect();

    // الاشتراك في تحديثات الاتصال
    const unsubscribe = socketManager.onConnectionChange((connected) => {
      console.log('📡 ExamSchedule socket connection:', connected);
      setIsConnected(connected);
      setSocketId(socketManager.getSocketId() || null);
      
      if (connected && !hasJoinedRoom.current) {
        joinExamsRoom();
      }
    });

    setIsConnected(socketManager.isConnected());
    setSocketId(socketManager.getSocketId() || null);

    // الانضمام لغرفة الامتحانات
    const joinExamsRoom = () => {
      if (socketManager.isConnected() && !hasJoinedRoom.current) {
        console.log('📝 Joining exams room...');
        
        socketManager.emit('joinExams', {
          userId: user._id,
          userRole: user.role,
          timestamp: Date.now(),
        });
        
        hasJoinedRoom.current = true;
      }
    };

    if (socketManager.isConnected()) {
      joinExamsRoom();
    }

    return () => {
      console.log('🧹 Cleaning up ExamSchedule Socket...');
      
      // مغادرة الغرفة
      if (hasJoinedRoom.current) {
        socketManager.emit('leaveExams', { userId: user._id });
        hasJoinedRoom.current = false;
      }
      
      // إلغاء الاشتراك
      unsubscribe();
    };
  }, [user]);

  /**
   * الاستماع لأحداث الامتحانات
   */
  useEffect(() => {
    if (!isConnected) return;

    console.log('👂 Setting up ExamSchedule event listeners...');

    const handleExamCreated = (...args: unknown[]) => {
      console.log('➕ Exam created:', args[0]);
      setLastUpdate(new Date());
    };

    const handleExamUpdated = (...args: unknown[]) => {
      console.log('✏️ Exam updated:', args[0]);
      setLastUpdate(new Date());
    };

    const handleExamDeleted = (...args: unknown[]) => {
      console.log('🗑️ Exam deleted:', args[0]);
      setLastUpdate(new Date());
    };

    const handleExamMarkCreated = (...args: unknown[]) => {
      console.log('➕ Exam mark created:', args[0]);
      setLastUpdate(new Date());
    };

    const handleExamMarkUpdated = (...args: unknown[]) => {
      console.log('✏️ Exam mark updated:', args[0]);
      setLastUpdate(new Date());
    };

    const handleExamMarkDeleted = (...args: unknown[]) => {
      console.log('🗑️ Exam mark deleted:', args[0]);
      setLastUpdate(new Date());
    };

    // الاشتراك في الأحداث
    socketManager.on('examCreated', handleExamCreated);
    socketManager.on('examUpdated', handleExamUpdated);
    socketManager.on('examDeleted', handleExamDeleted);
    socketManager.on('examMarkCreated', handleExamMarkCreated);
    socketManager.on('examMarkUpdated', handleExamMarkUpdated);
    socketManager.on('examMarkDeleted', handleExamMarkDeleted);

    // التنظيف
    return () => {
      console.log('🧹 Removing ExamSchedule event listeners...');
      socketManager.off('examCreated', handleExamCreated);
      socketManager.off('examUpdated', handleExamUpdated);
      socketManager.off('examDeleted', handleExamDeleted);
      socketManager.off('examMarkCreated', handleExamMarkCreated);
      socketManager.off('examMarkUpdated', handleExamMarkUpdated);
      socketManager.off('examMarkDeleted', handleExamMarkDeleted);
    };
  }, [isConnected]);

  return {
    isConnected,
    lastUpdate,
    socketId,
  };
};
