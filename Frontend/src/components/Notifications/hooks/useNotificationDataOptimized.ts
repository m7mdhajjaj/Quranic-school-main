// ============================================================================
// useNotificationDataOptimized Hook - Normalized State + useReducer
// ============================================================================
// نظام محسّن لإدارة الإشعارات بدون تكرار ومع أداء عالي

import { useEffect, useCallback, useReducer, useRef } from 'react';
import {
  getAllNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from '@/Api/notificationApi';
import type { Notification, NotificationStats, UseNotificationDataProps } from '../types';

// ============================================================================
// Types
// ============================================================================

interface NotificationState {
  byId: Record<string, Notification>; // Normalized data
  ids: string[]; // Order
  stats: NotificationStats;
  isLoading: boolean;
  isMarkingAll: boolean;
  hasMore: boolean;
  page: number;
}

type NotificationAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_MARKING_ALL'; payload: boolean }
  | { type: 'SET_NOTIFICATIONS'; payload: Notification[]; reset?: boolean }
  | { type: 'ADD_NOTIFICATION'; payload: Notification }
  | { type: 'BATCH_ADD_NOTIFICATIONS'; payload: Notification[] }
  | { type: 'MARK_AS_READ'; payload: string }
  | { type: 'MARK_AS_READ_OPTIMISTIC'; payload: string }
  | { type: 'ROLLBACK_READ'; payload: string }
  | { type: 'MARK_ALL_AS_READ' }
  | { type: 'DELETE_NOTIFICATION'; payload: string }
  | { type: 'UPDATE_STATS'; payload: Partial<NotificationStats> }
  | { type: 'SET_PAGE'; payload: number }
  | { type: 'SET_HAS_MORE'; payload: boolean };

// ============================================================================
// Reducer
// ============================================================================

const calculateStats = (byId: Record<string, Notification>, ids: string[]): NotificationStats => {
  let unreadCount = 0;
  let newCount = 0;
  
  for (const id of ids) {
    const notif = byId[id];
    if (!notif) continue;
    if (!notif.isRead) unreadCount++;
    if (notif.isNew) newCount++;
  }
  
  return {
    unreadCount,
    newCount,
    totalCount: ids.length,
  };
};

const sortIds = (byId: Record<string, Notification>, ids: string[]): string[] => {
  return [...ids].sort((aId, bId) => {
    const a = byId[aId];
    const b = byId[bId];
    if (!a || !b) return 0;
    
    // غير المقروء أولاً
    if (!a.isRead && b.isRead) return -1;
    if (a.isRead && !b.isRead) return 1;
    
    // ثم الأحدث
    const dateA = new Date(a.sentAt || a.createdAt).getTime();
    const dateB = new Date(b.sentAt || b.createdAt).getTime();
    return dateB - dateA;
  });
};

const notificationReducer = (
  state: NotificationState,
  action: NotificationAction
): NotificationState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    case 'SET_MARKING_ALL':
      return { ...state, isMarkingAll: action.payload };

    case 'SET_NOTIFICATIONS': {
      const { payload: notifications, reset } = action;
      
      if (reset) {
        // Reset كامل - استبدال كل البيانات
        const newById: Record<string, Notification> = {};
        const newIds: string[] = [];
        
        for (const notif of notifications) {
          if (!newById[notif._id]) {
            newById[notif._id] = notif;
            newIds.push(notif._id);
          }
        }
        
        const sortedIds = sortIds(newById, newIds);
        const stats = calculateStats(newById, sortedIds);
        
        return {
          ...state,
          byId: newById,
          ids: sortedIds,
          stats,
          isLoading: false,
        };
      } else {
        // إضافة جديدة (Load More)
        const newById = { ...state.byId };
        const newIds = [...state.ids];
        
        for (const notif of notifications) {
          if (!newById[notif._id]) {
            newById[notif._id] = notif;
            newIds.push(notif._id);
          }
        }
        
        const sortedIds = sortIds(newById, newIds);
        const stats = calculateStats(newById, sortedIds);
        
        return {
          ...state,
          byId: newById,
          ids: sortedIds,
          stats,
          isLoading: false,
        };
      }
    }

    case 'ADD_NOTIFICATION': {
      const notif = action.payload;
      
      // Dedup: تحقق من الوجود
      if (state.byId[notif._id]) {
        console.log('⚠️ Notification already exists, skipping:', notif._id);
        return state;
      }
      
      const newById = {
        ...state.byId,
        [notif._id]: notif,
      };
      const newIds = [notif._id, ...state.ids];
      const sortedIds = sortIds(newById, newIds);
      const stats = calculateStats(newById, sortedIds);
      
      console.log('✅ Notification added:', notif._id, 'New count:', newIds.length);
      
      return {
        ...state,
        byId: newById,
        ids: sortedIds,
        stats,
      };
    }

    case 'BATCH_ADD_NOTIFICATIONS': {
      const notifications = action.payload;
      const newById = { ...state.byId };
      const newIds = [...state.ids];
      let addedCount = 0;
      
      for (const notif of notifications) {
        if (!newById[notif._id]) {
          newById[notif._id] = notif;
          newIds.push(notif._id);
          addedCount++;
        }
      }
      
      if (addedCount === 0) {
        console.log('⚠️ All notifications already exist, skipping batch');
        return state;
      }
      
      const sortedIds = sortIds(newById, newIds);
      const stats = calculateStats(newById, sortedIds);
      
      console.log(`✅ Batch added ${addedCount} notifications`);
      
      return {
        ...state,
        byId: newById,
        ids: sortedIds,
        stats,
      };
    }

    case 'MARK_AS_READ_OPTIMISTIC': {
      const id = action.payload;
      const notif = state.byId[id];
      if (!notif || notif.isRead) return state;
      
      const newById = {
        ...state.byId,
        [id]: { ...notif, isRead: true, isNew: false },
      };
      const stats = calculateStats(newById, state.ids);
      
      return { ...state, byId: newById, stats };
    }

    case 'ROLLBACK_READ': {
      const id = action.payload;
      const notif = state.byId[id];
      if (!notif) return state;
      
      const newById = {
        ...state.byId,
        [id]: { ...notif, isRead: false },
      };
      const stats = calculateStats(newById, state.ids);
      
      return { ...state, byId: newById, stats };
    }

    case 'MARK_AS_READ': {
      const id = action.payload;
      const notif = state.byId[id];
      if (!notif || notif.isRead) return state;
      
      const newById = {
        ...state.byId,
        [id]: { ...notif, isRead: true, isNew: false },
      };
      const stats = calculateStats(newById, state.ids);
      
      return { ...state, byId: newById, stats };
    }

    case 'MARK_ALL_AS_READ': {
      const actionTime = new Date().toISOString();
      const newById = { ...state.byId };
      
      for (const id of state.ids) {
        const notif = newById[id];
        if (notif && !notif.isRead && notif.createdAt <= actionTime) {
          newById[id] = { ...notif, isRead: true, isNew: false };
        }
      }
      
      const stats = calculateStats(newById, state.ids);
      
      return { ...state, byId: newById, stats };
    }

    case 'DELETE_NOTIFICATION': {
      const id = action.payload;
      const newById = { ...state.byId };
      delete newById[id];
      const newIds = state.ids.filter(i => i !== id);
      const stats = calculateStats(newById, newIds);
      
      return {
        ...state,
        byId: newById,
        ids: newIds,
        stats,
      };
    }

    case 'UPDATE_STATS':
      return {
        ...state,
        stats: { ...state.stats, ...action.payload },
      };

    case 'SET_PAGE':
      return { ...state, page: action.payload };

    case 'SET_HAS_MORE':
      return { ...state, hasMore: action.payload };

    default:
      return state;
  }
};

// ============================================================================
// Hook
// ============================================================================

export const useNotificationDataOptimized = ({
  userId,
  autoRefresh = true,
  refreshInterval = 60000,
}: UseNotificationDataProps) => {
  // Initial state
  const [state, dispatch] = useReducer(notificationReducer, {
    byId: {},
    ids: [],
    stats: { unreadCount: 0, newCount: 0, totalCount: 0 },
    isLoading: false,
    isMarkingAll: false,
    hasMore: true,
    page: 1,
  });

  // Batch processing ref
  const batchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pendingNotificationsRef = useRef<Notification[]>([]);

  // ============================================================================
  // Fetch Notifications
  // ============================================================================

  const fetchNotifications = useCallback(
    async (pageNum: number = 1, reset: boolean = false) => {
      if (state.isLoading) {
        console.log('⏳ Already loading, skipping fetch');
        return;
      }

      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        
        console.log(`📡 Fetching notifications - page: ${pageNum}, reset: ${reset}`);
        const { notifications: notificationsArray, hasMore } = await getAllNotifications(userId, pageNum, 20);

        console.log(`✅ Received ${notificationsArray.length} notifications, hasMore: ${hasMore}`);

        const notifications: Notification[] = notificationsArray.map((n) => ({
          _id: n._id,
          type: n.type,
          title: n.title,
          message: n.message,
          createdAt: n.createdAt || new Date().toISOString(),
          sentAt: n.sentAt || n.createdAt || new Date().toISOString(),
          isRead: n.isRead,
          priority: n.priority || 'medium',
          isNew: !n.isRead,
          data: n.data || {},
        }));

        dispatch({ type: 'SET_NOTIFICATIONS', payload: notifications, reset });
        dispatch({ type: 'SET_PAGE', payload: pageNum });
        dispatch({ type: 'SET_HAS_MORE', payload: hasMore });
        dispatch({ type: 'SET_LOADING', payload: false });
      } catch (error) {
        console.error('❌ خطأ في جلب الإشعارات:', error);
        dispatch({ type: 'SET_HAS_MORE', payload: false });
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    },
    [userId, state.isLoading]
  );

  // ============================================================================
  // Add Single Notification (من Socket)
  // ============================================================================

  const addNotification = useCallback((notification: Notification) => {
    console.log('🆕 Adding notification:', notification._id);
    
    const notificationWithSentAt = {
      ...notification,
      sentAt: notification.sentAt || notification.createdAt || new Date().toISOString(),
    };
    
    dispatch({ type: 'ADD_NOTIFICATION', payload: notificationWithSentAt });
  }, []);

  // ============================================================================
  // Batch Add (لو جاءك أكثر من إشعار مرة وحدة)
  // ============================================================================

  const batchAddNotifications = useCallback((notifications: Notification[]) => {
    console.log(`📦 Batch adding ${notifications.length} notifications`);
    dispatch({ type: 'BATCH_ADD_NOTIFICATIONS', payload: notifications });
  }, []);

  // ============================================================================
  // Mark as Read (Optimistic + Rollback)
  // ============================================================================

  const markNotificationAsRead = useCallback(
    async (notificationId: string) => {
      const notif = state.byId[notificationId];
      if (!notif || notif.isRead) return { success: true };

      // Optimistic update
      dispatch({ type: 'MARK_AS_READ_OPTIMISTIC', payload: notificationId });

      try {
        await markAsRead(notificationId);
        return { success: true };
      } catch (error) {
        // Rollback on error
        console.error('Error marking as read, rolling back:', error);
        dispatch({ type: 'ROLLBACK_READ', payload: notificationId });
        return { success: false, error };
      }
    },
    [state.byId]
  );

  // ============================================================================
  // Mark All as Read (Optimistic)
  // ============================================================================

  const markAllAsReadLocal = useCallback(async () => {
    if (state.stats.unreadCount === 0 || state.isMarkingAll) return { success: true };

    try {
      dispatch({ type: 'SET_MARKING_ALL', payload: true });
      
      // Optimistic update
      dispatch({ type: 'MARK_ALL_AS_READ' });
      
      await markAllAsRead(userId);
      
      return { success: true };
    } catch (error) {
      console.error('Error in mark all as read:', error);
      // إعادة جلب البيانات في حالة الفشل
      fetchNotifications(1, true);
      return { success: false, error };
    } finally {
      dispatch({ type: 'SET_MARKING_ALL', payload: false });
    }
  }, [userId, state.stats.unreadCount, state.isMarkingAll, fetchNotifications]);

  // ============================================================================
  // Delete Notification (Optimistic)
  // ============================================================================

  const deleteNotificationLocal = useCallback(
    async (notificationId: string) => {
      const notif = state.byId[notificationId];
      if (!notif) return { success: true };

      // حفظ نسخة للـ rollback
      const backup = { ...notif };

      try {
        // Optimistic delete
        dispatch({ type: 'DELETE_NOTIFICATION', payload: notificationId });
        
        const success = await deleteNotification(notificationId);
        
        if (!success) {
          // Rollback: إعادة الإشعار
          dispatch({ type: 'ADD_NOTIFICATION', payload: backup });
          return { success: false };
        }
        
        return { success: true };
      } catch (error) {
        console.error('Error deleting notification:', error);
        // Rollback
        dispatch({ type: 'ADD_NOTIFICATION', payload: backup });
        return { success: false, error };
      }
    },
    [state.byId]
  );

  // ============================================================================
  // Load More
  // ============================================================================

  const loadMore = useCallback(() => {
    if (state.hasMore && !state.isLoading) {
      fetchNotifications(state.page + 1, false);
    }
  }, [state.hasMore, state.isLoading, state.page, fetchNotifications]);

  // ============================================================================
  // Process Batch (للإشعارات المتعددة دفعة واحدة)
  // ============================================================================

  const processPendingNotifications = useCallback(() => {
    if (pendingNotificationsRef.current.length === 0) return;

    const pending = [...pendingNotificationsRef.current];
    pendingNotificationsRef.current = [];

    console.log(`📦 Processing batch of ${pending.length} notifications`);
    dispatch({ type: 'BATCH_ADD_NOTIFICATIONS', payload: pending });
  }, []);

  // ============================================================================
  // Initial Load
  // ============================================================================

  useEffect(() => {
    if (userId) {
      fetchNotifications(1, true);
    }
  }, [userId]); // eslint-disable-line react-hooks/exhaustive-deps

  // ============================================================================
  // Auto Refresh (Polling ذكي - فقط لو الـ tab active)
  // ============================================================================

  useEffect(() => {
    if (!autoRefresh || !userId) return;

    const handleVisibilityChange = () => {
      if (!document.hidden && !state.isLoading) {
        fetchNotifications(1, true);
      }
    };

    // Polling فقط لو الصفحة visible
    const interval = setInterval(() => {
      if (!document.hidden && !state.isLoading) {
        fetchNotifications(1, true);
      }
    }, refreshInterval);

    // Refresh لما ترجع للصفحة
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [autoRefresh, userId, refreshInterval]); // eslint-disable-line react-hooks/exhaustive-deps

  // ============================================================================
  // Cleanup batch timeout
  // ============================================================================

  useEffect(() => {
    return () => {
      if (batchTimeoutRef.current) {
        clearTimeout(batchTimeoutRef.current);
        processPendingNotifications();
      }
    };
  }, [processPendingNotifications]);

  // ============================================================================
  // Return
  // ============================================================================

  // تحويل byId + ids إلى array للعرض (memoized)
  const notifications = state.ids.map(id => state.byId[id]).filter(Boolean);

  return {
    notifications,
    stats: state.stats,
    isLoading: state.isLoading,
    isMarkingAll: state.isMarkingAll,
    hasMore: state.hasMore,
    fetchNotifications,
    loadMore,
    markAllAsReadLocal,
    markNotificationAsRead,
    deleteNotificationLocal,
    addNotification,
    batchAddNotifications,
    updateStats: useCallback((newStats: Partial<NotificationStats>) => {
      dispatch({ type: 'UPDATE_STATS', payload: newStats });
    }, []),
  };
};
