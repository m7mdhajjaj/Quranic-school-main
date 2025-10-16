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
    if (!user) {
      console.log('⚠️ No user, skipping students socket connection');
      return;
    }

    console.log('🔌 Initializing Students Socket...');
    
    // الاتصال (SocketManager يدير Heartbeat تلقائياً)
    socketManager.connect(user._id, user.role);

    // الاشتراك في تحديثات الاتصال
    const unsubscribe = socketManager.onConnectionChange((connected) => {
      console.log('📡 Students socket connection:', connected);
      setIsConnected(connected);
      
      if (connected && !hasJoinedRoom.current) {
        joinStudentsRoom();
      }
    });

    setIsConnected(socketManager.isConnected());

    // الانضمام للغرفة
    const joinStudentsRoom = () => {
      if (socketManager.isConnected() && !hasJoinedRoom.current) {
        console.log('👨‍🎓 Joining students room...');
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

    // التنظيف
    return () => {
      console.log('🧹 Cleaning up Students Socket...');
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

    console.log('👂 Setting up students event listeners...');

    // معالج إنشاء طالب
    const handleStudentCreated = (...args: unknown[]) => {
      const student = args[0] as Student;
      console.log('➕ Student created:', student);
      setLastUpdate(new Date());
    };

    // معالج تحديث طالب
    const handleStudentUpdated = (...args: unknown[]) => {
      const student = args[0] as Student;
      console.log('✏️ Student updated:', student);
      setLastUpdate(new Date());
    };

    // معالج حذف طالب
    const handleStudentDeleted = (...args: unknown[]) => {
      const data = args[0] as { studentId: string };
      console.log('🗑️ Student deleted:', data);
      setLastUpdate(new Date());
    };

    // معالج الأخطاء
    const handleError = (...args: unknown[]) => {
      const error = args[0] as { message: string };
      console.error('❌ Students socket error:', error);
    };

    // تسجيل المستمعين
    socketManager.on('studentCreated', handleStudentCreated);
    socketManager.on('studentUpdated', handleStudentUpdated);
    socketManager.on('studentDeleted', handleStudentDeleted);
    socketManager.on('error', handleError);

    // التنظيف
    return () => {
      console.log('🧹 Removing students event listeners...');
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
    if (!isConnected) {
      console.warn('⚠️ Cannot request students list: Socket not connected');
      return;
    }

    console.log('📋 Requesting students list...');
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
