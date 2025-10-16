import { useEffect, useState, useRef } from 'react';
import { socketManager } from './SocketManager';
import { useAuth } from '../hooks/useAuth';

/**
 * Hook مخصص لصفحة الملف الشخصي (Profile) مع Socket.IO
 * يوفر heartbeat تلقائي كل 30 ثانية من SocketManager
 * يستمع لتحديثات الملف الشخصي (صورة، بيانات، كلمة مرور)
 */
export const useProfileSocket = () => {
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

    console.log('🔌 Initializing Profile Socket...');
    socketManager.connect();

    // الاشتراك في تحديثات الاتصال
    const unsubscribe = socketManager.onConnectionChange((connected) => {
      console.log('📡 Profile socket connection:', connected);
      setIsConnected(connected);
      setSocketId(socketManager.getSocketId() || null);
      
      if (connected && !hasJoinedRoom.current) {
        joinProfileRoom();
      }
    });

    setIsConnected(socketManager.isConnected());
    setSocketId(socketManager.getSocketId() || null);

    // الانضمام لغرفة الملفات الشخصية
    const joinProfileRoom = () => {
      if (socketManager.isConnected() && !hasJoinedRoom.current) {
        console.log('👤 Joining profile room...');
        
        socketManager.emit('joinProfile', {
          userId: user._id,
          userRole: user.role,
          timestamp: Date.now(),
        });
        
        hasJoinedRoom.current = true;
      }
    };

    if (socketManager.isConnected()) {
      joinProfileRoom();
    }

    return () => {
      console.log('🧹 Cleaning up Profile Socket...');
      
      // مغادرة الغرفة
      if (hasJoinedRoom.current) {
        socketManager.emit('leaveProfile', { userId: user._id });
        hasJoinedRoom.current = false;
      }
      
      // إلغاء الاشتراك
      unsubscribe();
    };
  }, [user]);

  /**
   * الاستماع لأحداث الملف الشخصي
   */
  useEffect(() => {
    if (!isConnected) return;

    console.log('👂 Setting up Profile event listeners...');

    const handleProfileUpdated = (...args: unknown[]) => {
      console.log('✏️ Profile updated:', args[0]);
      setLastUpdate(new Date());
    };

    const handleAvatarUpdated = (...args: unknown[]) => {
      console.log('📸 Avatar updated:', args[0]);
      setLastUpdate(new Date());
    };

    const handleAvatarDeleted = (...args: unknown[]) => {
      console.log('🗑️ Avatar deleted:', args[0]);
      setLastUpdate(new Date());
    };

    const handlePasswordChanged = (...args: unknown[]) => {
      console.log('🔒 Password changed:', args[0]);
      setLastUpdate(new Date());
    };

    // الاشتراك في الأحداث
    socketManager.on('profileUpdated', handleProfileUpdated);
    socketManager.on('avatarUpdated', handleAvatarUpdated);
    socketManager.on('avatarDeleted', handleAvatarDeleted);
    socketManager.on('passwordChanged', handlePasswordChanged);

    // التنظيف
    return () => {
      console.log('🧹 Removing Profile event listeners...');
      socketManager.off('profileUpdated', handleProfileUpdated);
      socketManager.off('avatarUpdated', handleAvatarUpdated);
      socketManager.off('avatarDeleted', handleAvatarDeleted);
      socketManager.off('passwordChanged', handlePasswordChanged);
    };
  }, [isConnected]);

  return {
    isConnected,
    lastUpdate,
    socketId,
  };
};
