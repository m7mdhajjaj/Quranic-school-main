// ============================================================================
// useNotificationData Hook
// ============================================================================
// Custom hook لإدارة بيانات الإشعارات والـ API calls

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  getRecentNotifications,
  getUnreadNotificationCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from '@/Api/notificationApi';
import type {
  Notification,
  NotificationStats,
  UseNotificationDataProps,
} from '../types';

export const useNotificationData = ({
  userId,
  autoRefresh = true,
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
  
  // Buffer للإشعارات المتعددة القادمة في نفس الوقت
  const pendingNotificationsRef = useRef<Notification[]>([]);
  const batchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
          // نعتبر الإشعار "جديداً" إذا كان غير مقروء، ليتم تمييزه في القائمة
          isNew: !apiNotification.isRead,
          data: apiNotification.data || apiNotification.metadata,
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
          // حتى عند reset، نحتفظ بالإشعارات الجديدة من Socket إذا لم تكن موجودة في البيانات من الخادم
          setNotifications((prev) => {
            // جلب الإشعارات من Socket فقط (isNew = true) التي ربما لم تصل للخادم بعد
            const recentSocketNotifications = prev.filter(n => n.isNew || 
              new Date().getTime() - new Date(n.createdAt).getTime() < 5000 // آخر 5 ثواني
            );
            
            // دمج مع البيانات من الخادم وإزالة التكرار
            const serverIds = new Set(sortedNotifications.map(n => n._id));
            const uniqueSocketNotifications = recentSocketNotifications.filter(n => !serverIds.has(n._id));
            
            const merged = [...uniqueSocketNotifications, ...sortedNotifications];
            return merged.sort((a, b) => {
              if (!a.isRead && b.isRead) return -1;
              if (a.isRead && !b.isRead) return 1;
              const dateA = new Date(a.sentAt || a.createdAt).getTime();
              const dateB = new Date(b.sentAt || b.createdAt).getTime();
              return dateB - dateA;
            });
          });
        } else {
          setNotifications((prev) => {
            // تصفية المكرر عند التحميل المزيد
            const prevIds = new Set(prev.map(n => n._id));
            const uniqueNew = sortedNotifications.filter(n => !prevIds.has(n._id));
            const combined = [...prev, ...uniqueNew];
            
            return combined.sort((a, b) => {
              if (!a.isRead && b.isRead) return -1;
              if (a.isRead && !b.isRead) return 1;
              const dateA = new Date(a.sentAt || a.createdAt).getTime();
              const dateB = new Date(b.sentAt || b.createdAt).getTime();
              return dateB - dateA;
            });
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

    // Capture time to avoid marking messages that arrive during the API call
    const actionTime = new Date().toISOString();

    try {
      setIsMarkingAll(true);
      await markAllAsRead(userId);

      setNotifications((prev) => 
        prev.map((n) => {
          // Only mark as read if it was created before the action started
          // This prevents marking new socket messages as read in UI when they are unread in DB
          if (n.createdAt <= actionTime) {
            return { ...n, isRead: true, isNew: false };
          }
          return n;
        })
      );

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
        const success = await deleteNotification(notificationId);

        if (success) {
          setNotifications((prev) => prev.filter((n) => n._id !== notificationId));
          return { success: true };
        }
        return { success: false, error: 'Failed to delete' };
      } catch (error) {
        console.error('Error deleting notification:', error);
        return { success: false, error };
      }
    },
    []
  );

  // معالجة الإشعارات المتراكمة (batch processing)
  const processPendingNotifications = useCallback(() => {
    if (pendingNotificationsRef.current.length === 0) {
      console.log('📦 No pending notifications to process');
      return;
    }

    const newNotifications = [...pendingNotificationsRef.current];
    const count = newNotifications.length;
    pendingNotificationsRef.current = []; // مسح الـ buffer

    console.log(`📦 معالجة ${count} إشعار دفعة واحدة`);
    console.log('📋 Notifications to process:', newNotifications.map(n => ({
      id: n._id,
      type: n.type,
      title: n.title,
      isNew: n.isNew
    })));

    setNotifications((prev) => {
      console.log(`📊 Current notifications count: ${prev.length}`);
      
      // تصفية الإشعارات المكررة
      const existingIds = new Set(prev.map(n => n._id));
      const uniqueNew = newNotifications.filter(n => !existingIds.has(n._id));

      if (uniqueNew.length === 0) {
        console.log('⚠️ جميع الإشعارات مكررة، تم تجاهلها');
        return prev;
      }

      console.log(`✅ إضافة ${uniqueNew.length} إشعار جديد فعلياً (بعد تصفية المكرر)`);
      console.log('🆕 New unique notifications:', uniqueNew.map(n => ({
        id: n._id,
        type: n.type,
        title: n.title,
        isNew: n.isNew
      })));

      const updated = [...uniqueNew, ...prev];
      const sorted = updated.sort((a, b) => {
        if (!a.isRead && b.isRead) return -1;
        if (a.isRead && !b.isRead) return 1;
        const dateA = new Date(a.sentAt || a.createdAt).getTime();
        const dateB = new Date(b.sentAt || b.createdAt).getTime();
        return dateB - dateA;
      });

      console.log(`📈 Updated notifications count: ${sorted.length}`);
      return sorted;
    });
  }, []);

  // إضافة إشعار جديد (من Socket) مع batch processing
  const addNotification = useCallback((newNotification: Notification) => {
    console.log('🆕 Adding new notification from Socket:', {
      id: newNotification._id,
      type: newNotification.type,
      title: newNotification.title,
      isNew: newNotification.isNew
    });

    const notificationWithSentAt = {
      ...newNotification,
      sentAt:
        newNotification.sentAt ||
        newNotification.createdAt ||
        new Date().toISOString(),
    };

    // إضافة فورية للاختبار (بدون buffer)
    setNotifications((prev) => {
      console.log(`📊 Current notifications count: ${prev.length}`);
      
      // تحقق من التكرار
      const exists = prev.find(n => n._id === notificationWithSentAt._id);
      if (exists) {
        console.log('⚠️ Notification already exists, skipping:', notificationWithSentAt._id);
        return prev;
      }

      const updated = [notificationWithSentAt, ...prev];
      const sorted = updated.sort((a, b) => {
        if (!a.isRead && b.isRead) return -1;
        if (a.isRead && !b.isRead) return 1;
        const dateA = new Date(a.sentAt || a.createdAt).getTime();
        const dateB = new Date(b.sentAt || b.createdAt).getTime();
        return dateB - dateA;
      });

      console.log(`✅ Notification added successfully! New count: ${sorted.length}`);
      return sorted;
    });

    // إضافة للـ buffer أيضاً للـ batch processing العادي
    pendingNotificationsRef.current.push(notificationWithSentAt);

    console.log(`📦 Also added to buffer. Current buffer size: ${pendingNotificationsRef.current.length}`);

    // إلغاء التايمر السابق إذا كان موجوداً
    if (batchTimeoutRef.current) {
      clearTimeout(batchTimeoutRef.current);
    }

    // تعيين تايمر جديد - معالجة بعد 300ms من آخر إشعار  
    batchTimeoutRef.current = setTimeout(() => {
      console.log('⏰ Processing buffer timeout triggered (backup)');
      processPendingNotifications();
      batchTimeoutRef.current = null;
    }, 300);
  }, [processPendingNotifications]);

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

  // حساب الإحصائيات تلقائياً عند تغيير الإشعارات
  useEffect(() => {
    const unreadCount = notifications.filter((n) => !n.isRead).length;
    const newCount = notifications.filter((n) => n.isNew).length;
    const totalCount = notifications.length;

    setStats({
      unreadCount,
      newCount,
      totalCount,
    });

    console.log(`📊 Stats auto-updated: ${unreadCount} unread, ${newCount} new, ${totalCount} total`);
    console.log('📋 Current notifications list:', notifications.slice(0, 3).map(n => ({
      id: n._id,
      type: n.type,
      title: n.title,
      isRead: n.isRead,
      isNew: n.isNew
    })));
  }, [notifications]);

  // Cleanup للـ batch timeout عند unmount
  useEffect(() => {
    return () => {
      if (batchTimeoutRef.current) {
        clearTimeout(batchTimeoutRef.current);
        // معالجة أي إشعارات متبقية
        if (pendingNotificationsRef.current.length > 0) {
          processPendingNotifications();
        }
      }
    };
  }, [processPendingNotifications]);

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
