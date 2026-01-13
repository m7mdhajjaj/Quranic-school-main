// ============================================================================
// useFirebaseMessaging Hook - React Native/Expo Push Notifications
// ============================================================================
// Custom hook to manage Push Notifications in React Native
// Handles notification permissions, token registration, and message listening
// Unified with web frontend notification system
// ⚠️ NOTE: Push Notifications do NOT work in Expo Go (SDK 53+)
// ============================================================================

import { useEffect, useCallback, useState, useRef } from "react";
import * as Device from "expo-device";
import Constants from "expo-constants";
import { Platform, AppState, AppStateStatus } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "./useAuth";
import {
  getExpoPushToken,
  getDevicePushToken,
  requestNotificationPermission,
  registerTokenWithBackend,
  removeTokenFromBackend,
  initializeNotifications,
  NotificationType,
  isExpoGo,
  isPushNotificationsSupported,
} from "../config/firebase";

// ================== Dynamic Import ==================
type NotificationsModule = typeof import("expo-notifications");
let NotificationsModule: NotificationsModule | null = null;

const loadNotifications = async (): Promise<NotificationsModule | null> => {
  if (isExpoGo()) {
    return null;
  }

  if (NotificationsModule) {
    return NotificationsModule;
  }

  try {
    NotificationsModule = await import("expo-notifications");
    return NotificationsModule;
  } catch (error) {
    console.warn("⚠️ Could not load expo-notifications:", error);
    return null;
  }
};

// ================== Types ==================
interface NotificationData {
  notificationId?: string;
  type?: NotificationType;
  priority?: string;
  conversationId?: string;
  chatType?: string;
  screen?: string;
  [key: string]: unknown;
}

interface ReceivedNotification {
  title: string;
  body: string;
  data?: NotificationData;
  type?: NotificationType;
}

interface UseFirebaseMessagingReturn {
  isPermissionGranted: boolean;
  pushToken: string | null;
  requestPermission: () => Promise<boolean>;
  lastNotification: ReceivedNotification | null;
  isInitialized: boolean;
}

/**
 * Hook لإدارة Push Notifications في React Native
 * يقوم بـ:
 * 1. طلب صلاحيات الإشعارات من المستخدم
 * 2. تسجيل Push Token مع الباكيند (FCM/APNs)
 * 3. الاستماع للإشعارات الواردة
 * 4. التنقل عند النقر على الإشعار
 *
 * متوافق مع نظام الإشعارات في الويب (Firebase Cloud Messaging)
 */
export const useFirebaseMessaging = (): UseFirebaseMessagingReturn => {
  const { user, token: authToken } = useAuth();
  const router = useRouter();

  const [isPermissionGranted, setIsPermissionGranted] =
    useState<boolean>(false);
  const [pushToken, setPushToken] = useState<string | null>(null);
  const [lastNotification, setLastNotification] =
    useState<ReceivedNotification | null>(null);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  // Use any type for subscription refs since we're using dynamic imports
  const notificationListener = useRef<{ remove: () => void } | null>(null);
  const responseListener = useRef<{ remove: () => void } | null>(null);
  const appState = useRef<AppStateStatus>(AppState.currentState);
  const tokenRegistered = useRef<boolean>(false);

  // ====== تسجيل Token مع الباكيند ======
  const registerToken = useCallback(
    async (token: string) => {
      if (!authToken || tokenRegistered.current) return false;

      const success = await registerTokenWithBackend(token, authToken);
      if (success) {
        tokenRegistered.current = true;
        console.log("✅ Push Token registered with backend");
      }
      return success;
    },
    [authToken]
  );

  // ====== طلب الصلاحيات وتسجيل Token ======
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!Device.isDevice) {
      console.warn("⚠️ Push notifications require a physical device");
      setIsPermissionGranted(false);
      return false;
    }

    try {
      const granted = await requestNotificationPermission();
      setIsPermissionGranted(granted);

      if (granted) {
        // الحصول على Push Token (Expo token أو Device token)
        let token = await getDevicePushToken();

        // إذا فشل الحصول على Device token، استخدم Expo token
        if (!token) {
          token = await getExpoPushToken();
        }

        if (token) {
          setPushToken(token);

          // تسجيل Token مع الباكيند
          if (authToken) {
            await registerToken(token);
          }
        }
      }

      return granted;
    } catch (error) {
      console.error("❌ Error requesting notification permission:", error);
      setIsPermissionGranted(false);
      return false;
    }
  }, [authToken, registerToken]);

  // ====== التنقل بناءً على بيانات الإشعار ======
  const handleNotificationNavigation = useCallback(
    (data: NotificationData) => {
      if (!data) return;

      // التنقل بناءً على نوع الإشعار
      if (data.screen) {
        router.push(data.screen as any);
        return;
      }

      // التنقل بناءً على النوع
      switch (data.type) {
        case "message":
        case "mention":
          if (data.conversationId) {
            router.push(`/(app)/chat/${data.conversationId}` as any);
          } else {
            router.push("/(app)/chat" as any);
          }
          break;
        case "attendance":
          router.push("/(app)/attendance" as any);
          break;
        case "grade":
        case "daily_marks":
          router.push("/(app)/grades" as any);
          break;
        case "exam":
          router.push("/(app)/exams" as any);
          break;
        case "news":
          router.push("/(app)/news" as any);
          break;
        case "warning":
          router.push("/(app)/warnings" as any);
          break;
        default:
          // الانتقال لصفحة الإشعارات
          router.push("/(app)/notifications" as any);
      }
    },
    [router]
  );

  // ====== تهيئة نظام الإشعارات ======
  useEffect(() => {
    const initialize = async () => {
      await initializeNotifications();
      setIsInitialized(true);
    };

    initialize();
  }, []);

  // ====== تهيئة Notifications عند تسجيل الدخول ======
  useEffect(() => {
    if (!user || !authToken || !isInitialized) return;

    const setupNotifications = async () => {
      // Skip if running in Expo Go
      if (isExpoGo()) {
        if (__DEV__) {
          console.log("📱 Running in Expo Go - Push notifications disabled");
        }
        return;
      }

      const Notifications = await loadNotifications();
      if (!Notifications) return;

      const { status } = await Notifications.getPermissionsAsync();

      if (status === "granted") {
        setIsPermissionGranted(true);

        if (Device.isDevice) {
          try {
            // محاولة الحصول على Device token أولاً (للتكامل مع FCM)
            let token = await getDevicePushToken();

            if (!token) {
              token = await getExpoPushToken();
            }

            if (token) {
              setPushToken(token);
              await registerToken(token);
            }
          } catch (error) {
            console.error("❌ Error getting push token:", error);
          }
        }
      } else {
        console.log("💡 Notification permission not granted yet");
        setIsPermissionGranted(false);
      }
    };

    setupNotifications();
  }, [user, authToken, isInitialized, registerToken]);

  // ====== الاستماع للإشعارات الواردة ======
  useEffect(() => {
    if (!isInitialized) return;

    // Skip if running in Expo Go
    if (isExpoGo()) {
      return;
    }

    const setupListeners = async () => {
      const Notifications = await loadNotifications();
      if (!Notifications) return;

      // عند استلام إشعار (التطبيق مفتوح - Foreground)
      notificationListener.current =
        Notifications.addNotificationReceivedListener((notification) => {
          const { title, body, data } = notification.request.content;

          const notificationData: ReceivedNotification = {
            title: title || "إشعار جديد",
            body: body || "",
            data: data as NotificationData,
            type: (data as NotificationData)?.type as NotificationType,
          };

          setLastNotification(notificationData);
          console.log(
            "📬 Foreground notification received:",
            notificationData.title
          );
        });

      // عند النقر على إشعار
      responseListener.current =
        Notifications.addNotificationResponseReceivedListener((response) => {
          const { title, body, data } = response.notification.request.content;

          console.log("👆 Notification tapped:", { title, data });

          // التنقل إلى الصفحة المناسبة
          handleNotificationNavigation(data as NotificationData);
        });
    };

    setupListeners();

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, [isInitialized, handleNotificationNavigation]);

  // ====== التعامل مع تغيير حالة التطبيق ======
  useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      async (nextAppState) => {
        if (
          appState.current.match(/inactive|background/) &&
          nextAppState === "active" &&
          user &&
          authToken
        ) {
          // عند العودة للتطبيق، تحديث Token إذا لزم الأمر
          if (pushToken && !tokenRegistered.current) {
            await registerToken(pushToken);
          }
        }
        appState.current = nextAppState;
      }
    );

    return () => {
      subscription.remove();
    };
  }, [user, authToken, pushToken, registerToken]);

  // ====== إزالة Token عند تسجيل الخروج ======
  useEffect(() => {
    if (!user && pushToken && tokenRegistered.current) {
      // المستخدم سجل خروج
      removeTokenFromBackend(pushToken, authToken || undefined);
      tokenRegistered.current = false;
    }
  }, [user, pushToken, authToken]);

  return {
    isPermissionGranted,
    pushToken,
    requestPermission,
    lastNotification,
    isInitialized,
  };
};

export default useFirebaseMessaging;
