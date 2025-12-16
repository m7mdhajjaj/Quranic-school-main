// ============================================================================
// useFirebaseMessaging Hook - React Native/Expo Adaptation
// ============================================================================
// Custom hook to manage Firebase Cloud Messaging in React Native
// Handles notification permissions, token registration, and message listening
// Adapted for Expo's notification system
// ============================================================================

import { useEffect, useCallback, useState } from "react";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";
import { useAuth } from "./useAuth";
import api from "../Api/api";

interface NotificationPayload {
  title: string;
  body: string;
  data?: Record<string, any>;
}

interface UseFirebaseMessagingReturn {
  isPermissionGranted: boolean;
  expoPushToken: string | null;
  requestPermission: () => Promise<void>;
  lastNotification: NotificationPayload | null;
}

/**
 * Hook لإدارة Expo Push Notifications
 * يقوم بـ:
 * 1. طلب صلاحيات الإشعارات من المستخدم
 * 2. تسجيل Expo Push Token مع الباكيند
 * 3. الاستماع للإشعارات الواردة
 * 4. عرض الإشعارات للمستخدم
 *
 * Note: يستخدم Expo Notifications بدلاً من Firebase مباشرة
 */
export const useFirebaseMessaging = (): UseFirebaseMessagingReturn => {
  const { user, token: authToken } = useAuth();
  const [isPermissionGranted, setIsPermissionGranted] =
    useState<boolean>(false);
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [lastNotification, setLastNotification] =
    useState<NotificationPayload | null>(null);

  // ====== تسجيل Token مع الباكيند ======
  const registerTokenWithBackend = async (token: string) => {
    try {
      if (!authToken) {
        console.log("⏸️ لا يوجد authToken، سيتم تسجيل Token لاحقاً");
        return false;
      }

      const response = await api.post(
        "/notifications/register-token",
        { token, platform: Platform.OS },
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      if (response.status === 200) {
        console.log("✅ تم تسجيل Push Token بنجاح");
        return true;
      }
      return false;
    } catch (error) {
      console.error("❌ خطأ في تسجيل Push Token:", error);
      return false;
    }
  };

  // ====== طلب الصلاحيات وتسجيل Token ======
  const requestPermission = useCallback(async () => {
    try {
      // التحقق من أن الجهاز حقيقي (ليس محاكي)
      if (!Device.isDevice) {
        console.warn("⚠️ يجب استخدام جهاز حقيقي للإشعارات");
        setIsPermissionGranted(false);
        return;
      }

      // طلب الصلاحيات
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        console.warn("⚠️ لم يتم منح صلاحيات الإشعارات");
        setIsPermissionGranted(false);
        return;
      }

      // الحصول على Expo Push Token
      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId: "your-project-id", // TODO: استبدل بـ project ID من app.json
      });

      const token = tokenData.data;
      setExpoPushToken(token);
      setIsPermissionGranted(true);

      // تسجيل Token مع الباكيند
      if (authToken) {
        await registerTokenWithBackend(token);
      }
    } catch (error) {
      console.error("❌ خطأ في طلب صلاحيات الإشعارات:", error);
      setIsPermissionGranted(false);
    }
  }, [authToken]);

  // ====== تهيئة Notifications عند تسجيل الدخول ======
  useEffect(() => {
    if (user && authToken) {
      // التحقق من الصلاحيات الحالية
      (async () => {
        const { status } = await Notifications.getPermissionsAsync();

        if (status === "granted") {
          // إذا الصلاحيات موجودة مسبقاً، احصل على الـ Token
          if (Device.isDevice) {
            try {
              const tokenData = await Notifications.getExpoPushTokenAsync({
                projectId: "your-project-id", // TODO: استبدل بـ project ID من app.json
              });
              const token = tokenData.data;
              setExpoPushToken(token);
              setIsPermissionGranted(true);
              await registerTokenWithBackend(token);
            } catch (error) {
              console.error("❌ خطأ في الحصول على Push Token:", error);
            }
          }
        } else {
          console.log("💡 يمكن طلب صلاحيات الإشعارات من خلال الـ UI");
          setIsPermissionGranted(false);
        }
      })();
    }
  }, [user, authToken]);

  // ====== إعداد معالج الإشعارات ======
  useEffect(() => {
    // كيفية عرض الإشعارات عند وصولها (والتطبيق مفتوح)
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
  }, []);

  // ====== الاستماع للإشعارات الواردة ======
  useEffect(() => {
    // عند استلام إشعار (التطبيق مفتوح)
    const notificationListener = Notifications.addNotificationReceivedListener(
      (notification) => {
        const { title, body, data } = notification.request.content;

        setLastNotification({
          title: title || "",
          body: body || "",
          data,
        });

        console.log("📬 إشعار جديد:", { title, body });
      }
    );

    // عند النقر على إشعار
    const responseListener =
      Notifications.addNotificationResponseReceivedListener((response) => {
        const { title, body, data } = response.notification.request.content;

        console.log("👆 تم النقر على الإشعار:", { title, body, data });

        // TODO: التنقل إلى الصفحة المناسبة بناءً على data
        // Example: if (data?.screen) navigate(data.screen);
      });

    return () => {
      notificationListener.remove();
      responseListener.remove();
    };
  }, []);

  return {
    isPermissionGranted,
    expoPushToken,
    requestPermission,
    lastNotification,
  };
};
