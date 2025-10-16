import { useEffect, useState, useCallback, useRef } from 'react';
import { socketManager } from './SocketManager';
import { useAuth } from '../hooks/useAuth';

/**
 * Types للحلقات
 */
interface Group {
  _id: string;
  name: string;
  number?: number;
  // أضف باقي الخصائص حسب الحاجة
}

/**
 * Hook مخصص لصفحة إدارة الحلقات مع Socket.IO
 * يوفر heartbeat تلقائي كل 30 ثانية من SocketManager
 */
export const useGroupsSocket = () => {
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const hasJoinedRoom = useRef(false);

  /**
   * الاتصال وإعداد الغرفة
   */
  useEffect(() => {
    if (!user) {
      console.log('⚠️ No user, skipping groups socket connection');
      return;
    }

    console.log('🔌 Initializing Groups Socket...');
    
    // الاتصال (SocketManager يدير Heartbeat تلقائياً)
    socketManager.connect(user._id, user.role);

    // الاشتراك في تحديثات الاتصال
    const unsubscribe = socketManager.onConnectionChange((connected) => {
      console.log('📡 Groups socket connection:', connected);
      setIsConnected(connected);
      
      if (connected && !hasJoinedRoom.current) {
        joinGroupsRoom();
      }
    });

    setIsConnected(socketManager.isConnected());

    // الانضمام للغرفة
    const joinGroupsRoom = () => {
      if (socketManager.isConnected() && !hasJoinedRoom.current) {
        console.log('👥 Joining groups room...');
        socketManager.emit('joinGroups', {
          userId: user._id,
          userRole: user.role,
          timestamp: Date.now(),
        });
        hasJoinedRoom.current = true;
      }
    };

    if (socketManager.isConnected()) {
      joinGroupsRoom();
    }

    // التنظيف
    return () => {
      console.log('🧹 Cleaning up Groups Socket...');
      unsubscribe();
      
      if (hasJoinedRoom.current) {
        socketManager.emit('leaveGroups', {
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

    console.log('👂 Setting up groups event listeners...');

    // معالج إنشاء حلقة
    const handleGroupCreated = (...args: unknown[]) => {
      const group = args[0] as Group;
      console.log('➕ Group created:', group);
      setLastUpdate(new Date());
    };

    // معالج تحديث حلقة
    const handleGroupUpdated = (...args: unknown[]) => {
      const group = args[0] as Group;
      console.log('✏️ Group updated:', group);
      setLastUpdate(new Date());
    };

    // معالج حذف حلقة
    const handleGroupDeleted = (...args: unknown[]) => {
      const data = args[0] as { groupId: string };
      console.log('🗑️ Group deleted:', data);
      setLastUpdate(new Date());
    };

    // معالج الأخطاء
    const handleError = (...args: unknown[]) => {
      const error = args[0] as { message: string };
      console.error('❌ Groups socket error:', error);
    };

    // تسجيل المستمعين
    socketManager.on('groupCreated', handleGroupCreated);
    socketManager.on('groupUpdated', handleGroupUpdated);
    socketManager.on('groupDeleted', handleGroupDeleted);
    socketManager.on('error', handleError);

    // التنظيف
    return () => {
      console.log('🧹 Removing groups event listeners...');
      socketManager.off('groupCreated', handleGroupCreated);
      socketManager.off('groupUpdated', handleGroupUpdated);
      socketManager.off('groupDeleted', handleGroupDeleted);
      socketManager.off('error', handleError);
    };
  }, [isConnected]);

  /**
   * طلب قائمة الحلقات
   */
  const requestGroupsList = useCallback(() => {
    if (!isConnected) {
      console.warn('⚠️ Cannot request groups list: Socket not connected');
      return;
    }

    console.log('📋 Requesting groups list...');
    socketManager.emit('requestGroupsList', {
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
    requestGroupsList,
    reconnect,
    socketId: socketManager.getSocketId(),
  };
};

export default useGroupsSocket;
