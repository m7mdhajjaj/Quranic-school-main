import { useEffect, useState, useRef } from 'react';
import { socketManager } from './SocketManager';
import { useAuth } from '../hooks/useAuth';

/**
 * Hook مخصص لصفحة طلابي (المعلم) مع Socket.IO
 * يوفر heartbeat تلقائي كل 30 ثانية من SocketManager
 * يستمع لأحداث الطلاب من غرفة 'students' العامة
 */
export const useMyStudentsSocket = () => {
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
      console.log('⚠️ No user, skipping my students socket connection');
      return;
    }

    console.log('🔌 Initializing My Students Socket...');
    
    // الاتصال (SocketManager يدير Heartbeat تلقائياً)
    socketManager.connect(user._id, user.role);

    // الاشتراك في تحديثات الاتصال
    const unsubscribe = socketManager.onConnectionChange((connected) => {
      console.log('📡 My students socket connection:', connected);
      setIsConnected(connected);
      setSocketId(socketManager.getSocketId() || null);
      
      if (connected && !hasJoinedRoom.current) {
        joinStudentsRoom();
      }
    });

    setIsConnected(socketManager.isConnected());
    setSocketId(socketManager.getSocketId() || null);

    // الانضمام لغرفة الطلاب
    const joinStudentsRoom = () => {
      if (socketManager.isConnected() && !hasJoinedRoom.current) {
        console.log('�‍🎓 Teacher joining students room...');
        socketManager.emit('joinStudents', {
          userId: user._id,
          userRole: user.role,
          teacherId: user._id,
          timestamp: Date.now(),
        });
        hasJoinedRoom.current = true;
      }
    };

    if (socketManager.isConnected()) {
      joinStudentsRoom();
    }

    return () => {
      console.log('🧹 Cleaning up My Students Socket...');
      
      // مغادرة الغرفة
      if (hasJoinedRoom.current) {
        socketManager.emit('leaveStudents', { 
          userId: user._id,
          teacherId: user._id 
        });
        hasJoinedRoom.current = false;
      }
      
      // إلغاء الاشتراك
      unsubscribe();
    };
  }, [user]);

  /**
   * الاستماع لأحداث الطلاب (من غرفة students العامة)
   */
  useEffect(() => {
    if (!isConnected) return;

    console.log('👂 Setting up My Students event listeners...');

    // معالج عام لجميع تحديثات الطلاب
    const handleStudentCreated = (...args: unknown[]) => {
      console.log('➕ Student created:', args[0]);
      setLastUpdate(new Date());
    };

    const handleStudentUpdated = (...args: unknown[]) => {
      console.log('✏️ Student updated:', args[0]);
      setLastUpdate(new Date());
    };

    const handleStudentDeleted = (...args: unknown[]) => {
      console.log('🗑️ Student deleted:', args[0]);
      setLastUpdate(new Date());
    };

    // الاشتراك في الأحداث
    socketManager.on('studentCreated', handleStudentCreated);
    socketManager.on('studentUpdated', handleStudentUpdated);
    socketManager.on('studentDeleted', handleStudentDeleted);

    // التنظيف
    return () => {
      console.log('🧹 Removing My Students event listeners...');
      socketManager.off('studentCreated', handleStudentCreated);
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
