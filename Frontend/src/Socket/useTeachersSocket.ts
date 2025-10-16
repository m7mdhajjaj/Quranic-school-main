import { useEffect, useState, useCallback, useRef } from 'react';
import { socketManager } from './SocketManager';
import { useAuth } from '../hooks/useAuth';

/**
 * Types للمعلمين
 */
interface Teacher {
  _id: string;
  teacherId: number;
  firstName: string;
  lastName: string;
  // أضف باقي الخصائص حسب الحاجة
}

// interface TeacherUpdateEvent {
//   type: 'created' | 'updated' | 'deleted';
//   teacher?: Teacher;
//   teacherId?: string;
//   timestamp: number;
// }

/**
 * Hook مخصص لصفحة إدارة المعلمين مع Socket.IO
 * يوفر heartbeat تلقائي كل 30 ثانية من SocketManager
 */
export const useTeachersSocket = () => {
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const hasJoinedRoom = useRef(false);

  /**
   * الاتصال وإعداد الغرفة
   */
  useEffect(() => {
    if (!user) {
      console.log('⚠️ No user, skipping teachers socket connection');
      return;
    }

    console.log('🔌 Initializing Teachers Socket...');
    
    // الاتصال (SocketManager يدير Heartbeat تلقائياً)
    socketManager.connect(user._id, user.role);

    // الاشتراك في تحديثات الاتصال
    const unsubscribe = socketManager.onConnectionChange((connected) => {
      console.log('📡 Teachers socket connection:', connected);
      setIsConnected(connected);
      
      if (connected && !hasJoinedRoom.current) {
        joinTeachersRoom();
      }
    });

    setIsConnected(socketManager.isConnected());

    // الانضمام للغرفة
    const joinTeachersRoom = () => {
      if (socketManager.isConnected() && !hasJoinedRoom.current) {
        console.log('👨‍🏫 Joining teachers room...');
        socketManager.emit('joinTeachers', {
          userId: user._id,
          userRole: user.role,
          timestamp: Date.now(),
        });
        hasJoinedRoom.current = true;
      }
    };

    if (socketManager.isConnected()) {
      joinTeachersRoom();
    }

    // التنظيف
    return () => {
      console.log('🧹 Cleaning up Teachers Socket...');
      unsubscribe();
      
      if (hasJoinedRoom.current) {
        socketManager.emit('leaveTeachers', {
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

    console.log('👂 Setting up teachers event listeners...');

    // معالج إنشاء معلم
    const handleTeacherCreated = (...args: unknown[]) => {
      const teacher = args[0] as Teacher;
      console.log('➕ Teacher created:', teacher);
      setLastUpdate(new Date());
    };

    // معالج تحديث معلم
    const handleTeacherUpdated = (...args: unknown[]) => {
      const teacher = args[0] as Teacher;
      console.log('✏️ Teacher updated:', teacher);
      setLastUpdate(new Date());
    };

    // معالج حذف معلم
    const handleTeacherDeleted = (...args: unknown[]) => {
      const data = args[0] as { teacherId: string };
      console.log('🗑️ Teacher deleted:', data);
      setLastUpdate(new Date());
    };

    // معالج الأخطاء
    const handleError = (...args: unknown[]) => {
      const error = args[0] as { message: string };
      console.error('❌ Teachers socket error:', error);
    };

    // تسجيل المستمعين
    socketManager.on('teacherCreated', handleTeacherCreated);
    socketManager.on('teacherUpdated', handleTeacherUpdated);
    socketManager.on('teacherDeleted', handleTeacherDeleted);
    socketManager.on('error', handleError);

    // التنظيف
    return () => {
      console.log('🧹 Removing teachers event listeners...');
      socketManager.off('teacherCreated', handleTeacherCreated);
      socketManager.off('teacherUpdated', handleTeacherUpdated);
      socketManager.off('teacherDeleted', handleTeacherDeleted);
      socketManager.off('error', handleError);
    };
  }, [isConnected]);

  /**
   * طلب قائمة المعلمين
   */
  const requestTeachersList = useCallback(() => {
    if (!isConnected) {
      console.warn('⚠️ Cannot request teachers list: Socket not connected');
      return;
    }

    console.log('📋 Requesting teachers list...');
    socketManager.emit('requestTeachersList', {
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
    requestTeachersList,
    reconnect,
    socketId: socketManager.getSocketId(),
  };
};

export default useTeachersSocket;
