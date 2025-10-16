import { useEffect, useState, useCallback, useRef } from 'react';
import { socketManager } from './SocketManager';
import { useAuth } from '../hooks/useAuth';

/**
 * Types للبيانات
 */
interface DashboardStats {
  totalStudents?: number;
  totalTeachers?: number;
  totalGroups?: number;
  activeStudents?: number;
  [key: string]: unknown;
}

interface DashboardUpdateEvent {
  type: 'stats' | 'notification' | 'activity' | 'update';
  data: DashboardStats | unknown;
  timestamp: number;
}

/**
 * Hook مخصص للـ Dashboard مع Socket.IO
 * يوفر heartbeat تلقائي كل 30 ثانية
 */
export const useDashboardSocket = () => {
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [dashboardData, setDashboardData] = useState<DashboardStats | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const hasJoinedRoom = useRef(false);

  /**
   * الاتصال بـ Socket وإعداد الغرفة
   */
  useEffect(() => {
    if (!user) {
      console.log('⚠️ No user, skipping dashboard socket connection');
      return;
    }

    console.log('🔌 Initializing Dashboard Socket...');
    
    // الاتصال بـ Socket
    const socket = socketManager.connect(user._id, user.role);

    // الاشتراك في تحديثات حالة الاتصال
    const unsubscribe = socketManager.onConnectionChange((connected) => {
      console.log('📡 Dashboard socket connection status:', connected);
      setIsConnected(connected);
      
      // إعادة الانضمام للغرفة عند إعادة الاتصال
      if (connected && !hasJoinedRoom.current) {
        joinDashboardRoom();
      }
    });

    // تعيين حالة الاتصال الحالية
    setIsConnected(socketManager.isConnected());

    // الانضمام لغرفة Dashboard
    const joinDashboardRoom = () => {
      if (socketManager.isConnected() && !hasJoinedRoom.current) {
        console.log('📊 Joining dashboard room...');
        socketManager.emit('joinDashboard', {
          userId: user._id,
          userRole: user.role,
          timestamp: Date.now(),
        });
        hasJoinedRoom.current = true;
      }
    };

    // الانضمام للغرفة إذا كان متصل
    if (socket.connected) {
      joinDashboardRoom();
    }

    // التنظيف عند إلغاء التحميل
    return () => {
      console.log('🧹 Cleaning up Dashboard Socket...');
      unsubscribe();
      
      if (hasJoinedRoom.current) {
        console.log('📊 Leaving dashboard room...');
        socketManager.emit('leaveDashboard', {
          userId: user._id,
          timestamp: Date.now(),
        });
        hasJoinedRoom.current = false;
      }
    };
  }, [user]);

  /**
   * الاستماع لتحديثات Dashboard
   */
  useEffect(() => {
    if (!isConnected) return;

    console.log('👂 Setting up dashboard event listeners...');

    // معالج تحديث Dashboard
    const handleDashboardUpdate = (...args: unknown[]) => {
      const data = args[0] as DashboardUpdateEvent;
      console.log('📊 Dashboard update received:', data);
      setDashboardData(data.data as DashboardStats);
      setLastUpdate(new Date());
    };

    // معالج إحصائيات Dashboard
    const handleStatsUpdate = (...args: unknown[]) => {
      const stats = args[0] as DashboardStats;
      console.log('📈 Dashboard stats updated:', stats);
      setDashboardData(stats);
      setLastUpdate(new Date());
    };

    // معالج الأخطاء
    const handleError = (...args: unknown[]) => {
      const error = args[0] as { message: string; code?: string };
      console.error('❌ Dashboard socket error:', error);
    };

    // تسجيل المستمعين
    socketManager.on('dashboardUpdate', handleDashboardUpdate);
    socketManager.on('statsUpdate', handleStatsUpdate);
    socketManager.on('error', handleError);

    // التنظيف
    return () => {
      console.log('🧹 Removing dashboard event listeners...');
      socketManager.off('dashboardUpdate', handleDashboardUpdate);
      socketManager.off('statsUpdate', handleStatsUpdate);
      socketManager.off('error', handleError);
    };
  }, [isConnected]);

  /**
   * طلب تحديث Dashboard يدوياً
   */
  const requestUpdate = useCallback(() => {
    if (!isConnected) {
      console.warn('⚠️ Cannot request update: Socket not connected');
      return;
    }

    console.log('📊 Requesting dashboard update...');
    socketManager.emit('requestDashboardUpdate', {
      timestamp: Date.now(),
    });
  }, [isConnected]);

  /**
   * إعادة الاتصال يدوياً
   */
  const reconnect = useCallback(() => {
    console.log('🔄 Manual reconnection requested...');
    if (user) {
      socketManager.disconnect();
      setTimeout(() => {
        socketManager.connect(user._id, user.role);
      }, 1000);
    }
  }, [user]);

  return {
    isConnected,
    dashboardData,
    lastUpdate,
    requestUpdate,
    reconnect,
    socketId: socketManager.getSocketId(),
  };
};

export default useDashboardSocket;
