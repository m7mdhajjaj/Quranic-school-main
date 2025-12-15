import { useEffect, useCallback } from 'react';
import { socketManager } from './SocketManager';

/**
 * Hook عام لإدارة Socket events لتحديثات حالة المستخدمين
 * يستمع لتحديثات حالة (isActive) في الوقت الفعلي
 * يمكن استخدامه للمعلمين، الطلاب، والأدمن
 */
export const useUserStatusSocket = (
  onStatusChange?: (data: { userId: string; isActive: boolean; lastSeen: string }) => void,
  userType?: 'teacher' | 'student' | 'admin'
) => {
  const isConnected = socketManager.isConnected();

  /**
   * الاستماع لتحديثات حالة المستخدمين
   */
  useEffect(() => {
    if (!isConnected) return;

    const typeLabel = userType ? `${userType}s` : 'users';
    console.log(`👂 Setting up ${typeLabel} status listener...`);

    // الاستماع لتحديثات حالة المستخدمين
    const handleUserStatusChange = (data: unknown) => {
      console.log('📡 User status changed:', data);
      
      if (onStatusChange && typeof data === 'object' && data !== null) {
        const statusData = data as { userId: string; isActive: boolean; lastSeen: string };
        onStatusChange(statusData);
      }
    };

    // الاشتراك في الحدث
    socketManager.on('userStatusChange', handleUserStatusChange);

    return () => {
      console.log(`🧹 Cleaning up ${typeLabel} status listener...`);
      socketManager.off('userStatusChange', handleUserStatusChange);
    };
  }, [isConnected, onStatusChange, userType]);

  /**
   * الانضمام لغرفة حسب نوع المستخدم
   */
  const joinRoom = useCallback((roomType: 'teachers' | 'students' | 'admin') => {
    if (!isConnected) return;
    
    const eventMap = {
      teachers: 'joinTeachers',
      students: 'joinStudents',
      admin: 'joinAdmin',
    };
    
    const emojiMap = {
      teachers: '👨‍🏫',
      students: '👨‍🎓',
      admin: '👨‍💼',
    };
    
    socketManager.emit(eventMap[roomType], {
      timestamp: Date.now(),
    });
    console.log(`${emojiMap[roomType]} Joined ${roomType} room`);
  }, [isConnected]);

  /**
   * مغادرة غرفة حسب نوع المستخدم
   */
  const leaveRoom = useCallback((roomType: 'teachers' | 'students' | 'admin') => {
    if (!isConnected) return;
    
    const eventMap = {
      teachers: 'leaveTeachers',
      students: 'leaveStudents',
      admin: 'leaveAdmin',
    };
    
    const emojiMap = {
      teachers: '👨‍🏫',
      students: '👨‍🎓',
      admin: '👨‍💼',
    };
    
    socketManager.emit(eventMap[roomType], {
      timestamp: Date.now(),
    });
    console.log(`${emojiMap[roomType]} Left ${roomType} room`);
  }, [isConnected]);

  return {
    isConnected,
    joinRoom,
    leaveRoom,
  };
};

// Backward compatibility - alias للمعلمين
export const useTeachersSocket = (
  onTeacherStatusChange?: (data: { userId: string; isActive: boolean; lastSeen: string }) => void
) => {
  return useUserStatusSocket(onTeacherStatusChange, 'teacher');
};
