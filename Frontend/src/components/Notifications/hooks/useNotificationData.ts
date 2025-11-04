// ============================================================================
// useNotificationData Hook
// ============================================================================
// Custom hook لإدارة بيانات الإشعارات والـ API calls

import { useState, useEffect, useCallback } from 'react';
import {
  getRecentNotifications,
  getUnreadNotificationCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from '@/Api/notificationApi';

export interface Notification {
  _id: string;
  type: 'grade' | 'message' | 'prayer_time' | 'activity' | 'attendance' | 'exam' | 'general';
  title: string;
  message: string;
  createdAt: string;
  sentAt: string;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  isNew?: boolean;
  data?: any;
}

export interface NotificationStats {
  unreadCount: number;
  newCount: number;
  totalCount: number;
}

interface UseNotificationDataProps {
  userId: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export const useNotificationData = ({
  userId,
  autoRefresh = false,
  refreshInterval = 60000,
}: UseNotificationDataProps) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stats, setStats] = useState<NotificationStats>({
    unreadCount: 0,
    newCount: 0,
    totalCount: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isMarkingAll, setIsMarkingAll] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // جلب الإشعارات من الخادم
  const fetchNotifications = useCallback(
    async (pageNum: number = 1, reset: boolean = false) => {
      if (isLoading) return;

      try {
        setIsLoading(true);
        const data = await getRecentNotifications(userId, 20);

        let notificationsArray: any[] = [];

        if (Array.isArray(data)) {
          notificationsArray = data;
        } else if ((data as any)?.notifications && Array.isArray((data as any).notifications)) {
          notificationsArray = (data as any).notifications;
        } else if ((data as any)?.data && Array.isArray((data as any).data)) {
          notificationsArray = (data as any).data;
        } else {
          notificationsArray = [];
        }

        const newNotifications: Notification[] = notificationsArray.map((apiNotification) => ({
          _id: apiNotification._id,
          type: apiNotification.type,
          title: apiNotification.title,
          message: apiNotification.message,
          createdAt: apiNotification.createdAt || new Date().toISOString(),
          sentAt: apiNotification.sentAt || apiNotification.createdAt || new Date().toISOString(),
          isRead: apiNotification.isRead,
          priority: apiNotification.priority || 'medium',
          isNew: false,
          data: apiNotification.metadata,
        }));

        // ترتيب: غير المقروء أولاً ثم الأحدث
        const sortedNotifications = newNotifications.sort((a, b) => {
          if (!a.isRead && b.isRead) return -1;
          if (a.isRead && !b.isRead) return 1;
          const dateA = new Date(a.sentAt || a.createdAt).getTime();
          const dateB = new Date(b.sentAt || b.createdAt).getTime();
          return dateB - dateA;
        });

        if (reset) {
          setNotifications(sortedNotifications);
        } else {
          setNotifications((prev) => {
            const combined = [...prev, ...sortedNotifications];
            return combined.sort((a, b) => {
              if (!a.isRead && b.isRead) return -1;
              if (a.isRead && !b.isRead) return 1;
              const dateA = new Date(a.sentAt || a.createdAt).getTime();
              const dateB = new Date(b.sentAt || b.createdAt).getTime();
              return dateB - dateA;
            });
          });
        }

        // جلب الإحصائيات
        try {
          const unreadCount = await getUnreadNotificationCount(userId);
          setStats({
            unreadCount,
            newCount: 0,
            totalCount: newNotifications.length,
          });
        } catch {
          setStats({
            unreadCount: newNotifications.filter((n) => !n.isRead).length,
            newCount: 0,
            totalCount: newNotifications.length,
          });
        }

        setPage(pageNum);
        setHasMore(newNotifications.length === 20);
      } catch (error) {
        console.error('❌ خطأ في جلب الإشعارات:', error);
        setNotifications([]);
        setStats({ unreadCount: 0, newCount: 0, totalCount: 0 });
      } finally {
        setIsLoading(false);
      }
    },
    [userId, isLoading]
  );

  // تحميل المزيد
  const loadMore = useCallback(() => {
    if (hasMore && !isLoading) {
      fetchNotifications(page + 1, false);
    }
  }, [hasMore, isLoading, page, fetchNotifications]);

  // تحديد الكل كمقروء
  const markAllAsReadLocal = useCallback(async () => {
    if (stats.unreadCount === 0 || isMarkingAll) return;

    try {
      setIsMarkingAll(true);
      await markAllAsRead(userId);

      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true, isNew: false })));
      setStats((prev) => ({ ...prev, unreadCount: 0, newCount: 0 }));

      return { success: true };
    } catch (error) {
      console.error('Error in mark all as read:', error);
      return { success: false, error };
    } finally {
      setIsMarkingAll(false);
    }
  }, [userId, stats.unreadCount, isMarkingAll]);

  // تحديد إشعار واحد كمقروء
  const markNotificationAsRead = useCallback(
    async (notificationId: string) => {
      const notification = notifications.find((n) => n._id === notificationId);
      if (!notification || notification.isRead) return;

      try {
        await markAsRead(notificationId);

        setNotifications((prev) =>
          prev.map((n) => (n._id === notificationId ? { ...n, isRead: true, isNew: false } : n))
        );

        setStats((prev) => ({
          ...prev,
          unreadCount: Math.max(0, prev.unreadCount - 1),
          newCount: notification.isNew ? Math.max(0, prev.newCount - 1) : prev.newCount,
        }));

        return { success: true };
      } catch (error) {
        console.error('Error marking notification as read:', error);
        return { success: false, error };
      }
    },
    [notifications]
  );

  // حذف إشعار
  const deleteNotificationLocal = useCallback(
    async (notificationId: string) => {
      try {
        await deleteNotification(notificationId);

        const deletedNotification = notifications.find((n) => n._id === notificationId);

        setNotifications((prev) => prev.filter((n) => n._id !== notificationId));
        setStats((prev) => ({
          ...prev,
          totalCount: prev.totalCount - 1,
          unreadCount:
            deletedNotification && !deletedNotification.isRead
              ? prev.unreadCount - 1
              : prev.unreadCount,
          newCount:
            deletedNotification && deletedNotification.isNew ? prev.newCount - 1 : prev.newCount,
        }));

        return { success: true };
      } catch (error) {
        console.error('Error deleting notification:', error);
        return { success: false, error };
      }
    },
    [notifications]
  );

  // إضافة إشعار جديد (من Socket)
  const addNotification = useCallback((newNotification: Notification) => {
    const notificationWithSentAt = {
      ...newNotification,
      sentAt:
        (newNotification as any).sentAt ||
        newNotification.createdAt ||
        new Date().toISOString(),
    };

    setNotifications((prev) => {
      const updated = [notificationWithSentAt, ...prev];
      return updated.sort((a, b) => {
        if (!a.isRead && b.isRead) return -1;
        if (a.isRead && !b.isRead) return 1;
        const dateA = new Date(a.sentAt || a.createdAt).getTime();
        const dateB = new Date(b.sentAt || b.createdAt).getTime();
        return dateB - dateA;
      });
    });

    setStats((prev) => ({
      unreadCount: prev.unreadCount + 1,
      newCount: prev.newCount + 1,
      totalCount: prev.totalCount + 1,
    }));
  }, []);

  // تحديث الإحصائيات
  const updateStats = useCallback((newStats: Partial<NotificationStats>) => {
    setStats((prev) => ({ ...prev, ...newStats }));
  }, []);

  // جلب الإشعارات عند التحميل الأول
  useEffect(() => {
    if (userId) {
      fetchNotifications(1, true);
    }
  }, [userId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-refresh (اختياري)
  useEffect(() => {
    if (!autoRefresh || !userId) return;

    const interval = setInterval(() => {
      if (!isLoading) {
        fetchNotifications(1, true);
      }
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, userId, refreshInterval, isLoading]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    notifications,
    stats,
    isLoading,
    isMarkingAll,
    hasMore,
    fetchNotifications,
    loadMore,
    markAllAsReadLocal,
    markNotificationAsRead,
    deleteNotificationLocal,
    addNotification,
    updateStats,
  };
};
