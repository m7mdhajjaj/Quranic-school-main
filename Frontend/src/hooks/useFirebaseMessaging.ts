// ============================================================================
// useFirebaseMessaging Hook
// ============================================================================
// Custom hook to manage Firebase Cloud Messaging in the application
// Handles notification permissions, token registration, and message listening
// ============================================================================

import { useEffect, useCallback, useState } from 'react';
import { 
  onMessageListener, 
  requestNotificationPermission,
  registerTokenWithBackend 
} from '../config/firebase';
import { useAuth } from './useAuth';

interface NotificationPayload {
  notification?: {
    title: string;
    body: string;
  };
  data?: Record<string, string>;
}

interface UseFirebaseMessagingReturn {
  isPermissionGranted: boolean;
  fcmToken: string | null;
  requestPermission: () => Promise<void>;
  lastNotification: NotificationPayload | null;
}

/**
 * Hook لإدارة Firebase Cloud Messaging
 * يقوم بـ:
 * 1. طلب صلاحيات الإشعارات من المستخدم
 * 2. تسجيل FCM Token مع الباكيند
 * 3. الاستماع للإشعارات الواردة
 * 4. عرض الإشعارات للمستخدم
 */
export const useFirebaseMessaging = (): UseFirebaseMessagingReturn => {
  const { user, token: authToken } = useAuth();
  const [isPermissionGranted, setIsPermissionGranted] = useState<boolean>(false);
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [lastNotification, setLastNotification] = useState<NotificationPayload | null>(null);

  // ====== طلب الصلاحيات وتسجيل Token ======
  const requestPermission = useCallback(async () => {
    try {
      const token = await requestNotificationPermission();
      
      if (token) {
        setFcmToken(token);
        setIsPermissionGranted(true);
        
        // تسجيل Token مع الباكيند
        if (authToken) {
          const apiUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:5005'}/api/notifications/register-token`;
          await registerTokenWithBackend(token, apiUrl, authToken);
          console.log('✅ تم تسجيل FCM Token بنجاح');
        }
      } else {
        setIsPermissionGranted(false);
        console.warn('⚠️ لم يتم منح صلاحيات الإشعارات');
      }
    } catch (error) {
      console.error('❌ خطأ في طلب صلاحيات الإشعارات:', error);
      setIsPermissionGranted(false);
    }
  }, [authToken]);

  // ====== تهيئة FCM عند تسجيل الدخول ======
  useEffect(() => {
    if (user && authToken) {
      // التحقق من الصلاحيات الحالية
      if (Notification.permission === 'granted') {
        requestPermission();
      } else if (Notification.permission === 'default') {
        // يمكن طلب الصلاحيات لاحقاً عند الحاجة
        console.log('💡 يمكن طلب صلاحيات الإشعارات');
      }
    }
  }, [user, authToken, requestPermission]);

  // ====== الاستماع للإشعارات الواردة ======
  useEffect(() => {
    const unsubscribe = onMessageListener((payload: NotificationPayload) => {
      console.log('📩 تم استلام إشعار:', payload);
      setLastNotification(payload);

      // عرض الإشعار للمستخدم
      if (payload.notification) {
        const { title, body } = payload.notification;
        
        // إنشاء إشعار نظام إذا كانت الصفحة مفتوحة
        if (Notification.permission === 'granted') {
          new Notification(title, {
            body: body,
            icon: '/logo.png',
            badge: '/badge.png',
            tag: 'quranic-school-notification',
            requireInteraction: false,
          });
        }

        // يمكن إضافة toast notification هنا
        // showToast(title, body);
      }
    });

    return unsubscribe;
  }, []);

  return {
    isPermissionGranted,
    fcmToken,
    requestPermission,
    lastNotification,
  };
};
