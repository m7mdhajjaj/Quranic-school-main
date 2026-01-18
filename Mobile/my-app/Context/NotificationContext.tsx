// ============================================================================
// NotificationContext.tsx - Centralized Notification State Management
// ============================================================================
// Context مركزي لإدارة حالة الإشعارات في التطبيق
// يجمع بين Push Notifications (FCM) و Socket.IO notifications
// موحد مع نظام الإشعارات في الويب
// ============================================================================

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from "react";
import Toast from "react-native-toast-message";
import { useFirebaseMessaging } from "../hooks/useFirebaseMessaging";
import { useNotificationsSocket } from "../Socket/useNotificationsSocket";
import { useAuth } from "../hooks/useAuth";
import {
  getRecentNotifications,
  getUnreadNotificationCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  Notification,
} from "../Api/notificationApi";

// ================== Types ==================
interface NotificationStats {
  unreadCount: number;
  newCount: number;
  totalCount: number;
}

interface NotificationContextType {
  // State
  notifications: Notification[];
  unreadCount: number;
  stats: NotificationStats;
  isLoading: boolean;
  isPermissionGranted: boolean;
  pushToken: string | null;
  isSocketConnected: boolean;
  lastNotification: Notification | null;

  // Actions
  fetchNotifications: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
  handleMarkAsRead: (notificationId: string) => Promise<void>;
  handleMarkAllAsRead: () => Promise<void>;
  handleDeleteNotification: (notificationId: string) => Promise<void>;
  requestPushPermission: () => Promise<boolean>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

// ================== Provider ==================
interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
}) => {
  const { user } = useAuth();

  // Push Notifications Hook
  const {
    isPermissionGranted,
    pushToken,
    requestPermission,
    lastNotification: pushLastNotification,
    isInitialized: isPushInitialized,
  } = useFirebaseMessaging();

  // Socket Notifications Hook
  const {
    isConnected: isSocketConnected,
    lastNotification: socketLastNotification,
    notificationStats: socketStats,
    refreshTrigger,
  } = useNotificationsSocket();

  // Local State
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [stats, setStats] = useState<NotificationStats>({
    unreadCount: 0,
    newCount: 0,
    totalCount: 0,
  });

  // ================== Fetch Notifications ==================
  const fetchNotifications = useCallback(async () => {
    if (!user?._id) return;

    setIsLoading(true);
    try {
      const [notificationsList, count] = await Promise.all([
        getRecentNotifications(user._id, 20),
        getUnreadNotificationCount(user._id),
      ]);

      setNotifications(notificationsList);
      setUnreadCount(count);
      setStats((prev) => ({
        ...prev,
        unreadCount: count,
        totalCount: notificationsList.length,
      }));
    } catch (error) {
      console.error("❌ Error fetching notifications:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user?._id]);

  // ================== Refresh Notifications ==================
  const refreshNotifications = useCallback(async () => {
    await fetchNotifications();
  }, [fetchNotifications]);

  // ================== Mark as Read ==================
  const handleMarkAsRead = useCallback(async (notificationId: string) => {
    try {
      const success = await markAsRead(notificationId);
      if (success) {
        setNotifications((prev) =>
          prev.map((n) =>
            n._id === notificationId ? { ...n, isRead: true } : n
          )
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
        setStats((prev) => ({
          ...prev,
          unreadCount: Math.max(0, prev.unreadCount - 1),
        }));
      }
    } catch (error) {
      console.error("❌ Error marking notification as read:", error);
    }
  }, []);

  // ================== Mark All as Read ==================
  const handleMarkAllAsRead = useCallback(async () => {
    if (!user?._id) return;

    try {
      const success = await markAllAsRead();
      if (success) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        setUnreadCount(0);
        setStats((prev) => ({
          ...prev,
          unreadCount: 0,
          newCount: 0,
        }));
        Toast.show({
          type: "success",
          text1: "تم تعليم جميع الإشعارات كمقروءة",
        });
      }
    } catch (error) {
      console.error("❌ Error marking all as read:", error);
    }
  }, [user?._id]);

  // ================== Delete Notification ==================
  const handleDeleteNotification = useCallback(
    async (notificationId: string) => {
      try {
        const notification = notifications.find(
          (n) => n._id === notificationId
        );
        const success = await deleteNotification(notificationId);
        if (success) {
          setNotifications((prev) =>
            prev.filter((n) => n._id !== notificationId)
          );
          setStats((prev) => ({
            ...prev,
            totalCount: Math.max(0, prev.totalCount - 1),
            unreadCount:
              notification && !notification.isRead
                ? Math.max(0, prev.unreadCount - 1)
                : prev.unreadCount,
          }));
          if (notification && !notification.isRead) {
            setUnreadCount((prev) => Math.max(0, prev - 1));
          }
        }
      } catch (error) {
        console.error("❌ Error deleting notification:", error);
      }
    },
    [notifications]
  );

  // ================== Request Push Permission ==================
  const requestPushPermission = useCallback(async (): Promise<boolean> => {
    return await requestPermission();
  }, [requestPermission]);

  // ================== Sync Socket Stats ==================
  useEffect(() => {
    if (socketStats.unreadCount > 0 || socketStats.totalCount > 0) {
      setStats(socketStats);
      setUnreadCount(socketStats.unreadCount);
    }
  }, [socketStats]);

  // ================== Handle Socket Notification ==================
  useEffect(() => {
    if (socketLastNotification) {
      // Add new notification to the list
      setNotifications((prev) => {
        // Avoid duplicates
        if (prev.some((n) => n._id === socketLastNotification._id)) {
          return prev;
        }
        return [socketLastNotification as Notification, ...prev];
      });

      // Show toast for new notification
      Toast.show({
        type: "info",
        text1: socketLastNotification.title,
        text2: socketLastNotification.message,
        visibilityTime: 4000,
        position: "top",
      });
    }
  }, [socketLastNotification]);

  // ================== Handle Push Notification ==================
  useEffect(() => {
    if (pushLastNotification) {
      // Refresh notifications to get the latest
      fetchNotifications();

      // Show toast
      Toast.show({
        type: "info",
        text1: pushLastNotification.title,
        text2: pushLastNotification.body,
        visibilityTime: 4000,
        position: "top",
      });
    }
  }, [pushLastNotification, fetchNotifications]);

  // ================== Auto-refresh on socket trigger ==================
  useEffect(() => {
    if (refreshTrigger > 0 && user?._id) {
      fetchNotifications();
    }
  }, [refreshTrigger, user?._id, fetchNotifications]);

  // ================== Initial Fetch ==================
  useEffect(() => {
    if (user?._id && isPushInitialized) {
      fetchNotifications();
    }
  }, [user?._id, isPushInitialized, fetchNotifications]);

  // ================== Determine last notification ==================
  const lastNotification: Notification | null = socketLastNotification
    ? {
        _id: socketLastNotification._id,
        title: socketLastNotification.title,
        message: socketLastNotification.message,
        type: socketLastNotification.type as Notification["type"],
        priority: (socketLastNotification.priority ||
          "medium") as Notification["priority"],
        isRead: socketLastNotification.isRead,
        createdAt: socketLastNotification.createdAt,
        sentAt:
          socketLastNotification.sentAt || socketLastNotification.createdAt,
        data: socketLastNotification.data as Notification["data"],
      }
    : pushLastNotification
      ? {
          _id: "",
          title: pushLastNotification.title,
          message: pushLastNotification.body,
          type: (pushLastNotification.type ||
            "general") as Notification["type"],
          priority: "medium" as Notification["priority"],
          isRead: false,
          createdAt: new Date().toISOString(),
          sentAt: new Date().toISOString(),
          data: pushLastNotification.data as Notification["data"],
        }
      : null;

  // ================== Context Value ==================
  const value: NotificationContextType = {
    // State
    notifications,
    unreadCount,
    stats,
    isLoading,
    isPermissionGranted,
    pushToken,
    isSocketConnected,
    lastNotification,

    // Actions
    fetchNotifications,
    refreshNotifications,
    handleMarkAsRead,
    handleMarkAllAsRead,
    handleDeleteNotification,
    requestPushPermission,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

// ================== Hook ==================
export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider"
    );
  }
  return context;
};

export default NotificationProvider;
