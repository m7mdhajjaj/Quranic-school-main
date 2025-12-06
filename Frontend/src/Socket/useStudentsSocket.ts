import { useEffect, useState, useCallback, useRef } from 'react';
import { socketManager } from './SocketManager';
import { useAuth } from '../hooks/useAuth';

/**
 * Types للطلاب
 */
interface Student {
  _id: string;
  studentId: number;
  firstName: string;
  lastName: string;
  // أضف باقي الخصائص حسب الحاجة
}

/**
 * Hook مخصص لصفحة إدارة الطلاب مع Socket.IO
 * يوفر heartbeat تلقائي كل 30 ثانية من SocketManager
 */
export const useStudentsSocket = () => {
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const hasJoinedRoom = useRef(false);

  /**
   * الاتصال وإعداد الغرفة
   */
  useEffect(() => {
    if (!user) return;

    socketManager.connect(user._id, user.role);

    const unsubscribe = socketManager.onConnectionChange((connected) => {
      setIsConnected(connected);
      
      if (connected && !hasJoinedRoom.current) {
        joinStudentsRoom();
      }
    });

    setIsConnected(socketManager.isConnected());

    const joinStudentsRoom = () => {
      if (socketManager.isConnected() && !hasJoinedRoom.current) {
        socketManager.emit('joinStudents', {
          userId: user._id,
          userRole: user.role,
          timestamp: Date.now(),
        });
        hasJoinedRoom.current = true;
      }
    };

    if (socketManager.isConnected()) {
      joinStudentsRoom();
    }

    return () => {
      unsubscribe();
      
      if (hasJoinedRoom.current) {
        socketManager.emit('leaveStudents', {
          userId: user._id,
          timestamp: Date.now(),
        });
        hasJoinedRoom.current = false;
      }
    };
  }, [user]);

  /**
   * الاستماع للأحداث
   */
  useEffect(() => {
    if (!isConnected) return;

    const handleStudentCreated = () => setLastUpdate(new Date());
    const handleStudentUpdated = (...args: unknown[]) => {
      const student = args[0] as Student;
      console.log('✏️ Student updated:', student);
      setLastUpdate(new Date());
    };

    // معالج حذف طالب
    const handleStudentDeleted = () => setLastUpdate(new Date());
    const handleError = (error: { message: string }) => {
      console.error('❌ Students error:', error.message);
    };

    socketManager.on('studentCreated', handleStudentCreated);
    socketManager.on('studentUpdated', handleStudentUpdated);
    socketManager.on('studentDeleted', handleStudentDeleted);
    socketManager.on('error', handleError);

    return () => {
      socketManager.off('studentCreated', handleStudentCreated);
      socketManager.off('studentUpdated', handleStudentUpdated);
      socketManager.off('studentDeleted', handleStudentDeleted);
      socketManager.off('error', handleError);
    };
  }, [isConnected]);

  /**
   * طلب قائمة الطلاب
   */
  const requestStudentsList = useCallback(() => {
    if (!isConnected) return;

    socketManager.emit('requestStudentsList', {
      timestamp: Date.now(),
    });
  }, [isConnected]);

  /**
   * إعادة الاتصال
   */
  const reconnect = useCallback(() => {
    if (user) {
      socketManager.disconnect();
      setTimeout(() => {
        socketManager.connect(user._id, user.role);
      }, 1000);
    }
  }, [user]);

  return {
    isConnected,
    lastUpdate,
    requestStudentsList,
    reconnect,
    socketId: socketManager.getSocketId(),
  };
};

export default useStudentsSocket;
