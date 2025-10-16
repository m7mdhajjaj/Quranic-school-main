import { useEffect, useState, useRef } from 'react';
import { socketManager } from './SocketManager';
import { useAuth } from '../hooks/useAuth';

/**
 * Hook مخصص لصفحة الحضور والغياب (Absence) مع Socket.IO
 * يوفر heartbeat تلقائي كل 30 ثانية من SocketManager
 * يستمع لأحداث الحضور لتحديث البيانات تلقائياً
 */
export const useAbsenceSocket = () => {
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

    console.log('🔌 Initializing Absence Socket...');
    socketManager.connect();

    // الاشتراك في تحديثات الاتصال
    const unsubscribe = socketManager.onConnectionChange((connected) => {
      console.log('📡 Absence socket connection:', connected);
      setIsConnected(connected);
      setSocketId(socketManager.getSocketId() || null);
      
      if (connected && !hasJoinedRoom.current) {
        joinAbsenceRoom();
      }
    });

    setIsConnected(socketManager.isConnected());
    setSocketId(socketManager.getSocketId() || null);

    // الانضمام لغرفة الحضور
    const joinAbsenceRoom = () => {
      if (socketManager.isConnected() && !hasJoinedRoom.current) {
        console.log('📋 Joining attendance room for Absence...');
        
        socketManager.emit('joinAttendance', {
          userId: user._id,
          userRole: user.role,
          timestamp: Date.now(),
        });
        
        hasJoinedRoom.current = true;
      }
    };

    if (socketManager.isConnected()) {
      joinAbsenceRoom();
    }

    return () => {
      console.log('🧹 Cleaning up Absence Socket...');
      
      // مغادرة الغرفة
      if (hasJoinedRoom.current) {
        socketManager.emit('leaveAttendance', { userId: user._id });
        hasJoinedRoom.current = false;
      }
      
      // إلغاء الاشتراك
      unsubscribe();
    };
  }, [user]);

  /**
   * الاستماع لأحداث الحضور
   */
  useEffect(() => {
    if (!isConnected) return;

    console.log('👂 Setting up Absence event listeners...');

    const handleAttendanceCreated = (...args: unknown[]) => {
      console.log('➕ Attendance created:', args[0]);
      setLastUpdate(new Date());
    };

    const handleAttendanceUpdated = (...args: unknown[]) => {
      console.log('✏️ Attendance updated:', args[0]);
      setLastUpdate(new Date());
    };

    const handleAttendanceDeleted = (...args: unknown[]) => {
      console.log('🗑️ Attendance deleted:', args[0]);
      setLastUpdate(new Date());
    };

    // الاشتراك في الأحداث
    socketManager.on('attendanceCreated', handleAttendanceCreated);
    socketManager.on('attendanceUpdated', handleAttendanceUpdated);
    socketManager.on('attendanceDeleted', handleAttendanceDeleted);

    // التنظيف
    return () => {
      console.log('🧹 Removing Absence event listeners...');
      socketManager.off('attendanceCreated', handleAttendanceCreated);
      socketManager.off('attendanceUpdated', handleAttendanceUpdated);
      socketManager.off('attendanceDeleted', handleAttendanceDeleted);
    };
  }, [isConnected]);

  return {
    isConnected,
    lastUpdate,
    socketId,
  };
};
