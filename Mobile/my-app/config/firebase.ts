// ============================================================================
// Firebase Configuration for React Native / Expo
// ============================================================================
// This file handles Push Notifications using Expo Notifications + FCM
// Provides unified notification system compatible with web frontend
// NOTE: Push Notifications do NOT work in Expo Go (SDK 53+)
// You need to use a Development Build for push notifications
// ============================================================================

import * as Device from "expo-device";
import Constants from "expo-constants";
import { Platform } from "react-native";
import api from "../Api/api";

// ================== Expo Go Detection ==================
/**
 * التحقق مما إذا كان التطبيق يعمل في Expo Go
 */
export const isExpoGo = (): boolean => {
  return Constants.appOwnership === "expo";
};

/**
 * التحقق مما إذا كانت Push Notifications مدعومة
 */
export const isPushNotificationsSupported = (): boolean => {
  // Push Notifications غير مدعومة في Expo Go منذ SDK 53
  return !isExpoGo();
};

// Dynamic import to avoid Expo Go crash
let Notifications: typeof import("expo-notifications") | null = null;

const loadNotifications = async () => {
  if (!isExpoGo() && !Notifications) {
    try {
      Notifications = await import("expo-notifications");
    } catch (error) {
      console.warn("⚠️ Could not load expo-notifications:", error);
    }
  }
  return Notifications;
};

// ================== Configuration ==================
export const FIREBASE_CONFIG = {
  projectId: "quranic-school-77b5e",
  messagingSenderId: "113132422081",
  appId: "1:113132422081:android:YOUR_ANDROID_APP_ID", // ستحتاج لتحديثه من Firebase Console
};

// ================== Notification Settings ==================
/**
 * تهيئة معالج الإشعارات لتحديد كيفية عرض الإشعارات
 */
export const setupNotificationHandler = async () => {
  if (isExpoGo()) {
    console.log("⚠️ Push Notifications not supported in Expo Go");
    return;
  }

  const NotificationsModule = await loadNotifications();
  if (!NotificationsModule) return;

  NotificationsModule.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
};

// ================== Token Management ==================
/**
 * الحصول على Project ID من Expo Constants
 */
const getProjectId = (): string => {
  // Try to get from EAS config first
  const easProjectId = Constants.expoConfig?.extra?.eas?.projectId;
  if (easProjectId) return easProjectId;

  // Fallback to slug-based project ID
  return Constants.expoConfig?.slug || "muhajireen-quran-school";
};

/**
 * الحصول على Push Token (FCM Token for Android, APNs for iOS)
 * @returns {Promise<string | null>} Push token أو null
 */
export const getExpoPushToken = async (): Promise<string | null> => {
  // التحقق من Expo Go
  if (isExpoGo()) {
    console.log("⚠️ Push Notifications not supported in Expo Go");
    return null;
  }

  // التحقق من أن الجهاز حقيقي (ليس محاكي)
  if (!Device.isDevice) {
    console.warn("⚠️ Push Notifications only work on physical devices");
    return null;
  }

  const NotificationsModule = await loadNotifications();
  if (!NotificationsModule) return null;

  try {
    const projectId = getProjectId();
    console.log("📱 Getting push token for project:", projectId);

    const tokenData = await NotificationsModule.getExpoPushTokenAsync({
      projectId,
    });

    console.log("✅ Push token obtained:", tokenData.data);
    return tokenData.data;
  } catch (error) {
    console.error("❌ Error getting push token:", error);
    return null;
  }
};

/**
 * الحصول على FCM/APNs Device Token مباشرة (للتكامل مع Backend FCM)
 * @returns {Promise<string | null>} Device token أو null
 */
export const getDevicePushToken = async (): Promise<string | null> => {
  // التحقق من Expo Go
  if (isExpoGo()) {
    console.log("⚠️ Push Notifications not supported in Expo Go");
    return null;
  }

  if (!Device.isDevice) {
    console.warn("⚠️ Push Notifications only work on physical devices");
    return null;
  }

  const NotificationsModule = await loadNotifications();
  if (!NotificationsModule) return null;

  try {
    const tokenData = await NotificationsModule.getDevicePushTokenAsync();
    console.log("✅ Device push token obtained:", tokenData.data);
    return tokenData.data;
  } catch (error) {
    console.error("❌ Error getting device push token:", error);
    return null;
  }
};

// ================== Permission Management ==================
/**
 * التحقق من حالة الصلاحيات الحالية
 * @returns {Promise<boolean>} هل الصلاحيات ممنوحة
 */
export const checkNotificationPermission = async (): Promise<boolean> => {
  if (isExpoGo()) return false;

  const NotificationsModule = await loadNotifications();
  if (!NotificationsModule) return false;

  const { status } = await NotificationsModule.getPermissionsAsync();
  return status === "granted";
};

/**
 * طلب صلاحيات الإشعارات من المستخدم
 * @returns {Promise<boolean>} هل تم منح الصلاحيات
 */
export const requestNotificationPermission = async (): Promise<boolean> => {
  if (isExpoGo()) {
    console.log("⚠️ Push Notifications not supported in Expo Go");
    return false;
  }

  if (!Device.isDevice) {
    console.warn("⚠️ Push Notifications only work on physical devices");
    return false;
  }

  const NotificationsModule = await loadNotifications();
  if (!NotificationsModule) return false;

  const { status: existingStatus } =
    await NotificationsModule.getPermissionsAsync();

  if (existingStatus === "granted") {
    return true;
  }

  const { status } = await NotificationsModule.requestPermissionsAsync();
  return status === "granted";
};

// ================== Backend Registration ==================
// Track registered tokens to prevent duplicate registrations
let registeredToken: string | null = null;

/**
 * تسجيل Push Token مع الباكيند
 * @param {string} token - Push token
 * @param {string} authToken - JWT token للمصادقة
 * @returns {Promise<boolean>} هل نجح التسجيل
 */
export const registerTokenWithBackend = async (
  token: string,
  authToken?: string
): Promise<boolean> => {
  // تخطي إذا كان Token مسجل مسبقاً
  if (token === registeredToken) {
    console.log("⏭️ Token already registered, skipping...");
    return true;
  }

  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (authToken) {
      headers["Authorization"] = `Bearer ${authToken}`;
    }

    const response = await api.post(
      "/fcm/token",
      {
        token,
        platform: Platform.OS, // 'android' or 'ios'
      },
      { headers }
    );

    if (response.data?.success) {
      registeredToken = token;
      console.log("✅ Push token registered with backend successfully");
      return true;
    } else {
      console.error("❌ Failed to register token:", response.data);
      return false;
    }
  } catch (error) {
    console.error("❌ Error registering token with backend:", error);
    return false;
  }
};

/**
 * إزالة Push Token من الباكيند (عند تسجيل الخروج)
 * @param {string} token - Push token
 * @param {string} authToken - JWT token للمصادقة
 * @returns {Promise<boolean>} هل نجحت الإزالة
 */
export const removeTokenFromBackend = async (
  token: string,
  authToken?: string
): Promise<boolean> => {
  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (authToken) {
      headers["Authorization"] = `Bearer ${authToken}`;
    }

    const response = await api.delete("/fcm/token", {
      headers,
      data: { token },
    });

    if (response.data?.success) {
      registeredToken = null;
      console.log("✅ Push token removed from backend");
      return true;
    }
    return false;
  } catch (error) {
    console.error("❌ Error removing token from backend:", error);
    return false;
  }
};

// ================== Android Channel Setup ==================
/**
 * إنشاء قنوات الإشعارات لـ Android
 */
export const setupAndroidNotificationChannels = async (): Promise<void> => {
  if (Platform.OS !== "android") return;
  if (isExpoGo()) return;

  const NotificationsModule = await loadNotifications();
  if (!NotificationsModule) return;

  // قناة الإشعارات الافتراضية
  await NotificationsModule.setNotificationChannelAsync("default", {
    name: "الإشعارات العامة",
    importance: NotificationsModule.AndroidImportance.MAX,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: "#1C7850",
    sound: "notification.mp3",
    enableLights: true,
    enableVibrate: true,
    showBadge: true,
  });

  // قناة الرسائل
  await NotificationsModule.setNotificationChannelAsync("messages", {
    name: "الرسائل",
    description: "إشعارات الرسائل الجديدة",
    importance: NotificationsModule.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: "#2196F3",
    sound: "notification.mp3",
  });

  // قناة الحضور
  await NotificationsModule.setNotificationChannelAsync("attendance", {
    name: "الحضور والغياب",
    description: "إشعارات الحضور والغياب",
    importance: NotificationsModule.AndroidImportance.HIGH,
    vibrationPattern: [0, 500],
    lightColor: "#FF9800",
  });

  // قناة العلامات
  await NotificationsModule.setNotificationChannelAsync("grades", {
    name: "العلامات والدرجات",
    description: "إشعارات العلامات والدرجات",
    importance: NotificationsModule.AndroidImportance.HIGH,
    lightColor: "#4CAF50",
  });

  // قناة أوقات الصلاة
  await NotificationsModule.setNotificationChannelAsync("prayer", {
    name: "أوقات الصلاة",
    description: "تذكيرات أوقات الصلاة",
    importance: NotificationsModule.AndroidImportance.DEFAULT,
    vibrationPattern: [0, 500, 250, 500],
    lightColor: "#9C27B0",
  });

  console.log("✅ Android notification channels created");
};

// ================== Notification Types ==================
export type NotificationType =
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

export interface NotificationPayload {
  title: string;
  body: string;
  data?: Record<string, unknown>;
  type?: NotificationType;
}

// ================== Local Notification ==================
/**
 * إرسال إشعار محلي (للاختبار)
 */
export const sendLocalNotification = async (
  payload: NotificationPayload
): Promise<void> => {
  if (isExpoGo()) {
    console.log("⚠️ Local notifications not supported in Expo Go");
    return;
  }

  const NotificationsModule = await loadNotifications();
  if (!NotificationsModule) return;

  await NotificationsModule.scheduleNotificationAsync({
    content: {
      title: payload.title,
      body: payload.body,
      data: payload.data,
      sound: "notification.mp3",
    },
    trigger: null, // فوري
  });
};

// ================== Initialization ==================
/**
 * تهيئة نظام الإشعارات
 */
export const initializeNotifications = async (): Promise<void> => {
  if (isExpoGo()) {
    console.log("⚠️ Push Notifications not supported in Expo Go");
    console.log("💡 Use a Development Build for push notifications");
    return;
  }

  // إعداد معالج الإشعارات
  await setupNotificationHandler();

  // إنشاء قنوات Android
  await setupAndroidNotificationChannels();

  console.log("✅ Notification system initialized");
};

export default {
  FIREBASE_CONFIG,
  isExpoGo,
  isPushNotificationsSupported,
  setupNotificationHandler,
  getExpoPushToken,
  getDevicePushToken,
  checkNotificationPermission,
  requestNotificationPermission,
  registerTokenWithBackend,
  removeTokenFromBackend,
  setupAndroidNotificationChannels,
  sendLocalNotification,
  initializeNotifications,
};
