// ============================================================================
// useNotificationsSocket.ts
// ============================================================================
// Hook مخصص للإشعارات مع Socket.IO
// يوفر تحديثات فورية (live) للإشعارات الجديدة
// يعمل مع Firebase Cloud Messaging للإشعارات Push
// ============================================================================

import { useEffect, useState, useCallback } from 'react';
import { socketManager } from './SocketManager';
import { useAuth } from '../hooks/useAuth';

// ================== Types ==================
interface Notification {
  _id: string;
  id?: string;
  type: 'grade' | 'message' | 'prayer_time' | 'activity' | 'attendance' | 'general';
  title: string;
  message: string;
  createdAt: string;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  data?: Record<string, unknown>;
}

interface NotificationStats {
  unreadCount: number;
  newCount: number;
  totalCount: number;
}

interface UseNotificationsSocketReturn {
  isConnected: boolean;
  lastNotification: Notification | null;
  notificationStats: NotificationStats;
  refreshTrigger: number;
  socketId: string | null;
}

// ================== Hook ==================
/**
 * Hook للاستماع للإشعارات الجديدة عبر Socket.IO
 * 
 * الميزات:
 * - تحديثات فورية (real-time) للإشعارات الجديدة
 * - دعم جميع أنواع الإشعارات (حضور، علامات، رسائل، إلخ)
 * - Auto-refresh trigger عند وصول إشعار جديد
 * - إحصائيات الإشعارات (عدد غير المقروءة)
 * - مزامنة مع Firebase Cloud Messaging
 * 
 * @returns {UseNotificationsSocketReturn} معلومات الاتصال والإشعارات
 * 
 * @example
 * ```tsx
 * function NotificationBell() {
 *   const { lastNotification, notificationStats, refreshTrigger } = useNotificationsSocket();
 *   
 *   useEffect(() => {
 *     if (lastNotification) {
 *       showToast(lastNotification.title, lastNotification.message);
 *     }
 *   }, [lastNotification]);
 *   
 *   useEffect(() => {
 *     // Auto-refresh notifications list
 *     fetchNotifications();
 *   }, [refreshTrigger]);
 *   
 *   return <span>{notificationStats.unreadCount}</span>;
 * }
 * ```
 */
export const useNotificationsSocket = (): UseNotificationsSocketReturn => {
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [socketId, setSocketId] = useState<string | null>(null);
  const [lastNotification, setLastNotification] = useState<Notification | null>(null);
  const [notificationStats, setNotificationStats] = useState<NotificationStats>({
    unreadCount: 0,
    newCount: 0,
    totalCount: 0,
  });
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  // ================== Connection Management ==================
  useEffect(() => {
    if (!user) return;

    console.log('🔔 [NotificationsSocket] Initializing notification socket for user:', user._id);

    // Subscribe to connection status
    const unsubscribeConnection = socketManager.onConnectionChange((connected) => {
      setIsConnected(connected);
      if (connected) {
        const id = socketManager.getSocketId();
        setSocketId(id || null);
        console.log('🔔 [NotificationsSocket] Connected - Socket ID:', id);
      } else {
        console.log('🔔 [NotificationsSocket] Disconnected');
      }
    });

    // Connect if not already connected
    if (!socketManager.isConnected()) {
      socketManager.connect();
    } else {
      setIsConnected(true);
      setSocketId(socketManager.getSocketId() || null);
    }

    return () => {
      unsubscribeConnection();
    };
  }, [user]);

  // ================== Join Notifications Room ==================
  useEffect(() => {
    if (!isConnected || !user) return;

    console.log('🔔 [NotificationsSocket] Joining notifications room...');

    // Join the notifications room for this user
    socketManager.emit('joinNotifications', {
      userId: user._id,
      role: user.role,
    });

    // Cleanup: Leave room on unmount
    return () => {
      console.log('🔔 [NotificationsSocket] Leaving notifications room...');
      socketManager.emit('leaveNotifications', {
        userId: user._id,
      });
    };
  }, [isConnected, user]);

  // ================== Event Handlers ==================

  // Handler for new notification
  const handleNewNotification = useCallback((data: unknown) => {
    console.log('📬 [NotificationsSocket] New notification received:', data);

    try {
      const notificationData = data as any;
      
      const notification: Notification = {
        _id: notificationData.id || notificationData._id,
        type: notificationData.type || 'general',
        title: notificationData.title || 'إشعار جديد',
        message: notificationData.message || '',
        createdAt: notificationData.createdAt || new Date().toISOString(),
        isRead: false,
        priority: notificationData.priority || 'medium',
        data: notificationData.data,
      };

      // Update last notification
      setLastNotification(notification);

      // Update stats
      setNotificationStats((prev) => ({
        unreadCount: prev.unreadCount + 1,
        newCount: prev.newCount + 1,
        totalCount: prev.totalCount + 1,
      }));

      // Trigger refresh
      setRefreshTrigger((prev) => prev + 1);

      console.log('✅ [NotificationsSocket] Notification processed successfully');
    } catch (error) {
      console.error('❌ [NotificationsSocket] Error processing notification:', error);
    }
  }, []);

  // Handler for notification stats update
  const handleStatsUpdate = useCallback((data: unknown) => {
    console.log('📊 [NotificationsSocket] Stats update received:', data);

    try {
      const statsData = data as any;
      setNotificationStats({
        unreadCount: statsData.unreadCount || 0,
        newCount: statsData.newCount || 0,
        totalCount: statsData.totalCount || 0,
      });
    } catch (error) {
      console.error('❌ [NotificationsSocket] Error processing stats:', error);
    }
  }, []);

  // Handler for notification marked as read
  const handleNotificationRead = useCallback((data: unknown) => {
    console.log('✓ [NotificationsSocket] Notification marked as read:', data);

    try {
      const readData = data as any;
      if (readData.notificationId === lastNotification?._id) {
        setLastNotification((prev) => prev ? { ...prev, isRead: true } : null);
      }

      // Update stats
      setNotificationStats((prev) => ({
        ...prev,
        unreadCount: Math.max(0, prev.unreadCount - 1),
      }));

      // Trigger refresh
      setRefreshTrigger((prev) => prev + 1);
    } catch (error) {
      console.error('❌ [NotificationsSocket] Error processing read notification:', error);
    }
  }, [lastNotification]);

  // Handler for all notifications marked as read
  const handleAllNotificationsRead = useCallback(() => {
    console.log('✓✓ [NotificationsSocket] All notifications marked as read');

    setNotificationStats((prev) => ({
      ...prev,
      unreadCount: 0,
      newCount: 0,
    }));

    // Trigger refresh
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  // Handler for notification deleted
  const handleNotificationDeleted = useCallback((data: unknown) => {
    console.log('🗑️ [NotificationsSocket] Notification deleted:', data);

    try {
      const deleteData = data as any;
      if (deleteData.notificationId === lastNotification?._id) {
        setLastNotification(null);
      }

      // Update stats
      setNotificationStats((prev) => ({
        unreadCount: deleteData.wasUnread ? Math.max(0, prev.unreadCount - 1) : prev.unreadCount,
        newCount: Math.max(0, prev.newCount - 1),
        totalCount: Math.max(0, prev.totalCount - 1),
      }));

      // Trigger refresh
      setRefreshTrigger((prev) => prev + 1);
    } catch (error) {
      console.error('❌ [NotificationsSocket] Error processing deleted notification:', error);
    }
  }, [lastNotification]);

  // ================== Register Event Listeners ==================
  useEffect(() => {
    if (!isConnected) return;

    console.log('🔔 [NotificationsSocket] Registering notification event listeners...');

    // Register all event listeners
    socketManager.on('newNotification', handleNewNotification);
    socketManager.on('notificationStatsUpdate', handleStatsUpdate);
    socketManager.on('notificationRead', handleNotificationRead);
    socketManager.on('allNotificationsRead', handleAllNotificationsRead);
    socketManager.on('notificationDeleted', handleNotificationDeleted);

    // Prayer time notifications (special type)
    socketManager.on('prayerNotification', (data: unknown) => {
      console.log('🕌 [NotificationsSocket] Prayer notification received');
      const prayerData = data as Record<string, unknown>;
      handleNewNotification({
        ...prayerData,
        type: 'prayer_time',
      });
    });

    // Cleanup listeners on unmount
    return () => {
      console.log('🔔 [NotificationsSocket] Unregistering notification event listeners...');
      socketManager.off('newNotification', handleNewNotification);
      socketManager.off('notificationStatsUpdate', handleStatsUpdate);
      socketManager.off('notificationRead', handleNotificationRead);
      socketManager.off('allNotificationsRead', handleAllNotificationsRead);
      socketManager.off('notificationDeleted', handleNotificationDeleted);
      socketManager.off('prayerNotification');
    };
  }, [
    isConnected,
    handleNewNotification,
    handleStatsUpdate,
    handleNotificationRead,
    handleAllNotificationsRead,
    handleNotificationDeleted,
  ]);

  // ================== Return Values ==================
  return {
    isConnected,
    lastNotification,
    notificationStats,
    refreshTrigger,
    socketId,
  };
};

export default useNotificationsSocket;
