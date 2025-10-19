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
  getExistingToken,
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
          // Use relative URL - Vite proxy will handle forwarding to backend
          const apiUrl = '/api/notifications/register-token';
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
        // إذا الصلاحيات موجودة مسبقاً، احصل على الـ Token بدون طلب الصلاحيات
        (async () => {
          const token = await getExistingToken();
          if (token) {
            setFcmToken(token);
            setIsPermissionGranted(true);
            
            // تسجيل Token مع الباكيند
            const apiUrl = '/api/notifications/register-token';
            await registerTokenWithBackend(token, apiUrl, authToken);
            console.log('✅ تم تسجيل FCM Token بنجاح');
          }
        })();
      } else if (Notification.permission === 'default') {
        // لا تطلب الصلاحيات أوتوماتيكياً - دع المكون NotificationPermissionPrompt يتولى الأمر
        console.log('💡 يمكن طلب صلاحيات الإشعارات من خلال الـ UI');
        setIsPermissionGranted(false);
      } else if (Notification.permission === 'denied') {
        console.warn('⚠️ تم رفض صلاحيات الإشعارات مسبقاً');
        setIsPermissionGranted(false);
      }
    }
  }, [user, authToken]);

  // ====== الاستماع للإشعارات الواردة ======
  useEffect(() => {
    const unsubscribe = onMessageListener((payload: unknown) => {
      console.log('📩 تم استلام إشعار:', payload);
      const typedPayload = payload as NotificationPayload;
      setLastNotification(typedPayload);

      // عرض الإشعار للمستخدم
      if (typedPayload.notification) {
        const { title, body } = typedPayload.notification;
        
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
