import { useEffect, useState } from 'react';
import { socketManager } from './SocketManager';
import { useAuth } from '../hooks/useAuth';

/**
 * Hook للاستماع لتحديثات Dashboard عبر Socket.IO
 * يستمع لـ event "absentStudentsUpdated" من admin-room
 * 
 * @param onAbsentStudentsUpdate - Callback يتم استدعاؤه عند تحديث قائمة الطلاب الغائبين
 *                                 يمكن أن يحتوي data على البيانات مباشرة من Backend
 */
export const useDashboardSocket = (
  onAbsentStudentsUpdate?: (data?: { data?: unknown[]; count?: number }) => void
) => {
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [lastSocketUpdate, setLastSocketUpdate] = useState<Date | null>(null);

  /**
   * الاتصال وإعداد Socket
   */
  useEffect(() => {
    if (!user || user.role !== 'admin') {
      console.log('⚠️ [DashboardSocket] User is not admin, skipping socket connection');
      return;
    }

    console.log('🔌 [DashboardSocket] Initializing socket for admin dashboard...');
    
    // الاتصال (SocketManager يدير Heartbeat تلقائياً)
    socketManager.connect(user._id, user.role);

    // الاشتراك في تحديثات الاتصال
    const unsubscribe = socketManager.onConnectionChange((connected) => {
      console.log('📡 [DashboardSocket] Connection status:', connected);
      setIsConnected(connected);
    });

    setIsConnected(socketManager.isConnected());

    return () => {
      unsubscribe();
    };
  }, [user]);

  /**
   * الاستماع لـ event "absentStudentsUpdated" لتحديث قائمة الطلاب الغائبين
   */
  useEffect(() => {
    if (!isConnected || !user || user.role !== 'admin') return;

    console.log('👂 [DashboardSocket] Setting up absentStudentsUpdated listener...');

    const handleAbsentStudentsUpdate = (data: unknown) => {
      // تحديث state بشكل غير متزامن لتقليل وقت معالجة الـ event
      setLastSocketUpdate(new Date());
      
      // تمرير البيانات مباشرة إلى callback باستخدام queueMicrotask
      // هذا أسرع من setTimeout ويجعل معالج الـ event يعود فوراً
      if (onAbsentStudentsUpdate) {
        queueMicrotask(() => {
          onAbsentStudentsUpdate(data as { data?: unknown[]; count?: number });
        });
      }
    };

    // الاشتراك في الحدث
    socketManager.on('absentStudentsUpdated', handleAbsentStudentsUpdate);

    // التنظيف
    return () => {
      console.log('🧹 [DashboardSocket] Cleaning up absentStudentsUpdated listener...');
      socketManager.off('absentStudentsUpdated', handleAbsentStudentsUpdate);
    };
  }, [isConnected, user, onAbsentStudentsUpdate]);

  return {
    isConnected,
    lastSocketUpdate,
  };
};
