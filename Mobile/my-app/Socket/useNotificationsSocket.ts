// ============================================================================
// useNotificationsSocket.ts - React Native Socket Notifications
// ============================================================================
// Hook مخصص للإشعارات مع Socket.IO في React Native
// يوفر تحديثات فورية (live) للإشعارات الجديدة
// موحد مع نظام الإشعارات في الويب
// ============================================================================
// ⚠️ NOTE: expo-notifications is loaded dynamically to avoid crashes in Expo Go
// Since SDK 53, push notifications are not supported in Expo Go
// ============================================================================

import { useEffect, useState, useCallback, useRef } from "react";
import { AppState, AppStateStatus, Vibration } from "react-native";
import Constants from "expo-constants";
import { socketManager } from "./SocketManager";
import { useAuth } from "../hooks/useAuth";

// ================== Expo Go Detection ==================
const isExpoGo = (): boolean => {
  return Constants.appOwnership === "expo";
};

// Dynamic import for expo-notifications
type NotificationsModule = typeof import("expo-notifications");
let NotificationsModule: NotificationsModule | null = null;

const loadNotifications = async (): Promise<NotificationsModule | null> => {
  if (isExpoGo()) {
    if (__DEV__) {
      console.log(
        "🔔 [NotificationsSocket] Running in Expo Go - local notifications disabled"
      );
    }
    return null;
  }

  if (NotificationsModule) {
    return NotificationsModule;
  }

  try {
    NotificationsModule = await import("expo-notifications");
    return NotificationsModule;
  } catch (error) {
    console.error(
      "❌ [NotificationsSocket] Failed to load notifications:",
      error
    );
    return null;
  }
};

// ================== Types ==================
interface NotificationData {
  action?:
    | "section_added"
    | "section_updated"
    | "section_deleted"
    | "mark_added"
    | "mark_updated"
    | "mark_deleted";
  conversationId?: string;
  chatType?: string;
  screen?: string;
  [key: string]: unknown;
}

interface Notification {
  _id: string;
  id?: string;
  type:
    | "grade"
    | "message"
    | "prayer_time"
    | "attendance"
    | "exam"
    | "assignment"
    | "news"
    | "general"
    | "daily_marks"
    | "warning"
    | "system"
    | "success"
    | "alert"
    | "mention";
  title: string;
  message: string;
  data?: NotificationData;
  createdAt: string;
  sentAt?: string;
  isRead: boolean;
  priority?: string;
  isNew?: boolean;
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
 * Hook للاستماع للإشعارات الجديدة عبر Socket.IO في React Native
 *
 * الميزات:
 * - تحديثات فورية (real-time) للإشعارات الجديدة
 * - دعم جميع أنواع الإشعارات (حضور، علامات، رسائل، إلخ)
 * - Auto-refresh trigger عند وصول إشعار جديد
 * - إحصائيات الإشعارات (عدد غير المقروءة)
 * - اهتزاز عند وصول إشعار
 * - عرض إشعار محلي عند وصول رسالة socket
 */
export const useNotificationsSocket = (): UseNotificationsSocketReturn => {
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [socketId, setSocketId] = useState<string | null>(null);
  const [lastNotification, setLastNotification] = useState<Notification | null>(
    null
  );
  const [notificationStats, setNotificationStats] = useState<NotificationStats>(
    {
      unreadCount: 0,
      newCount: 0,
      totalCount: 0,
    }
  );
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);
  const appState = useRef<AppStateStatus>(AppState.currentState);

  // ================== Connection Management ==================
  useEffect(() => {
    if (!user) return;

    if (__DEV__) {
      console.log(
        "🔔 [NotificationsSocket] Initializing notification socket for user:",
        user._id
      );
    }

    // Subscribe to connection status
    const unsubscribeConnection = socketManager.onConnectionChange(
      (connected) => {
        setIsConnected(connected);
        if (connected) {
          const id = socketManager.getSocketId();
          setSocketId(id || null);
          if (__DEV__) {
            console.log("🔔 [NotificationsSocket] Connected - Socket ID:", id);
          }
        } else {
          if (__DEV__) {
            console.log("🔔 [NotificationsSocket] Disconnected");
          }
        }
      }
    );

    // Connect if not already connected
    if (!socketManager.isConnected()) {
      socketManager.connect(user._id, user.role);
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

    if (__DEV__) {
      console.log("🔔 [NotificationsSocket] Joining notifications room...");
    }

    // Join the notifications room for this user
    socketManager.emit("joinNotifications", {
      userId: user._id,
      role: user.role,
    });

    // Cleanup: Leave room on unmount
    return () => {
      if (__DEV__) {
        console.log("🔔 [NotificationsSocket] Leaving notifications room...");
      }
      socketManager.emit("leaveNotifications", {
        userId: user._id,
      });
    };
  }, [isConnected, user]);

  // ================== Event Handlers ==================

  // Handler for new notification
  const handleNewNotification = useCallback(async (data: unknown) => {
    if (__DEV__) {
      console.log("📬 [NotificationsSocket] New notification received", data);
    }

    try {
      const notificationData = data as Record<string, unknown>;
      const title = String(notificationData.title || "إشعار جديد");
      const message = String(notificationData.message || "");

      // Vibrate to alert user
      Vibration.vibrate([0, 250, 100, 250]);

      // Show local notification if app is in background (only in dev builds, not Expo Go)
      if (appState.current !== "active" && !isExpoGo()) {
        const Notifications = await loadNotifications();
        if (Notifications) {
          await Notifications.scheduleNotificationAsync({
            content: {
              title,
              body: message,
              data: notificationData.data as Record<string, unknown>,
              sound: "notification.mp3",
            },
            trigger: null, // Immediate
          });
        }
      }

      const notification: Notification = {
        _id: String(notificationData.id || notificationData._id || ""),
        type: (notificationData.type as Notification["type"]) || "general",
        title: title,
        message: message,
        createdAt: String(
          notificationData.createdAt || new Date().toISOString()
        ),
        sentAt: String(
          notificationData.sentAt ||
            notificationData.createdAt ||
            new Date().toISOString()
        ),
        isRead: false,
        priority: String(notificationData.priority || "medium"),
        isNew: true,
        data: notificationData.data as NotificationData,
      };

      // Batch state updates
      setLastNotification(notification);
      setNotificationStats((prev) => ({
        unreadCount: prev.unreadCount + 1,
        newCount: prev.newCount + 1,
        totalCount: prev.totalCount + 1,
      }));
      setRefreshTrigger((prev) => prev + 1);
    } catch (error) {
      console.error("❌ [NotificationsSocket] Error:", error);
    }
  }, []);

  // Handler for notification stats update
  const handleStatsUpdate = useCallback((data: unknown) => {
    try {
      const statsData = data as Record<string, unknown>;
      setNotificationStats({
        unreadCount: Number(statsData.unreadCount) || 0,
        newCount: Number(statsData.newCount) || 0,
        totalCount: Number(statsData.totalCount) || 0,
      });
    } catch (error) {
      console.error("❌ [NotificationsSocket] Stats error:", error);
    }
  }, []);

  // Handler for notification marked as read
  const handleNotificationRead = useCallback(
    (data: unknown) => {
      try {
        const readData = data as Record<string, unknown>;
        if (String(readData.notificationId) === lastNotification?._id) {
          setLastNotification((prev) =>
            prev ? { ...prev, isRead: true } : null
          );
        }

        setNotificationStats((prev) => ({
          ...prev,
          unreadCount: Math.max(0, prev.unreadCount - 1),
        }));

        // Trigger refresh
        setRefreshTrigger((prev) => prev + 1);
      } catch (error) {
        console.error(
          "❌ [NotificationsSocket] Error processing read notification:",
          error
        );
      }
    },
    [lastNotification]
  );

  // Handler for all notifications marked as read
  const handleAllNotificationsRead = useCallback(() => {
    if (__DEV__) {
      console.log("✓✓ [NotificationsSocket] All notifications marked as read");
    }

    setNotificationStats((prev) => ({
      ...prev,
      unreadCount: 0,
      newCount: 0,
    }));

    // Trigger refresh
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  // Handler for notification deleted
  const handleNotificationDeleted = useCallback(
    (data: unknown) => {
      if (__DEV__) {
        console.log("🗑️ [NotificationsSocket] Notification deleted:", data);
      }

      try {
        const deleteData = data as Record<string, unknown>;
        if (String(deleteData.notificationId) === lastNotification?._id) {
          setLastNotification(null);
        }

        // Update stats
        setNotificationStats((prev) => ({
          unreadCount: deleteData.wasUnread
            ? Math.max(0, prev.unreadCount - 1)
            : prev.unreadCount,
          newCount: Math.max(0, prev.newCount - 1),
          totalCount: Math.max(0, prev.totalCount - 1),
        }));

        // Trigger refresh
        setRefreshTrigger((prev) => prev + 1);
      } catch (error) {
        console.error(
          "❌ [NotificationsSocket] Error processing deleted notification:",
          error
        );
      }
    },
    [lastNotification]
  );

  // ================== Register Event Listeners ==================
  useEffect(() => {
    if (!isConnected) return;

    if (__DEV__) {
      console.log(
        "🔔 [NotificationsSocket] Registering notification event listeners..."
      );
    }

    // Register all event listeners
    socketManager.on("newNotification", handleNewNotification);
    socketManager.on("notificationStatsUpdate", handleStatsUpdate);
    socketManager.on("notificationRead", handleNotificationRead);
    socketManager.on("allNotificationsRead", handleAllNotificationsRead);
    socketManager.on("notificationDeleted", handleNotificationDeleted);

    // Prayer time notifications (special type)
    socketManager.on("prayerNotification", (data: unknown) => {
      if (__DEV__) {
        console.log("🕌 [NotificationsSocket] Prayer notification received");
      }
      const prayerData = data as Record<string, unknown>;
      handleNewNotification({
        ...prayerData,
        type: "prayer_time",
      });
    });

    // Cleanup listeners on unmount
    return () => {
      if (__DEV__) {
        console.log(
          "🔔 [NotificationsSocket] Unregistering notification event listeners..."
        );
      }
      socketManager.off("newNotification", handleNewNotification);
      socketManager.off("notificationStatsUpdate", handleStatsUpdate);
      socketManager.off("notificationRead", handleNotificationRead);
      socketManager.off("allNotificationsRead", handleAllNotificationsRead);
      socketManager.off("notificationDeleted", handleNotificationDeleted);
      socketManager.off("prayerNotification");
    };
  }, [
    isConnected,
    handleNewNotification,
    handleStatsUpdate,
    handleNotificationRead,
    handleAllNotificationsRead,
    handleNotificationDeleted,
  ]);

  // ================== App State Handler ==================
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, []);

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
