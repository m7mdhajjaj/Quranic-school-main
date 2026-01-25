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
import { SOUNDS } from '../utils/soundUrls';

const notificationSoundUrl = SOUNDS.NOTIFICATION;

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
        
        // تسجيل Token مع الباكيند (استخدام registerTokenWithBackend الذي يحتوي على منطق منع التكرار)
        if (authToken) {
          const apiUrl = '/api/fcm/token';
          const success = await registerTokenWithBackend(token, apiUrl, authToken);
          if (success) {
            console.log('✅ تم تسجيل FCM Token بنجاح');
          }
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
            
            // تسجيل Token مع الباكيند (استخدام registerTokenWithBackend الذي يحتوي على منطق منع التكرار)
            const apiUrl = '/api/fcm/token';
            const success = await registerTokenWithBackend(token, apiUrl, authToken);
            if (success) {
              console.log('✅ تم تسجيل FCM Token بنجاح');
            }
          }
        })();
      } else if (Notification.permission === 'default') {
        // لا تطلب الصلاحيات أوتوماتيكياً
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
      // Optimize: Defer processing to next tick to avoid blocking the message channel (Violation prevention)
      setTimeout(() => {
        const typedPayload = payload as NotificationPayload;
        console.log('📩 إشعار جديد:', typedPayload);

        // Update state
        setLastNotification(typedPayload);

        if (typedPayload.notification) {
          const { title, body } = typedPayload.notification;
          
          // Play notification sound
          try {
            const audio = new Audio(notificationSoundUrl);
            audio.play().catch(err => console.warn('Could not play notification sound:', err));
          } catch (err) {
            console.warn('Error initializing audio:', err);
          }

          if (Notification.permission === 'granted') {
            try {
              new Notification(title, {
                body: body,
                icon: '/logo.png',
                badge: '/badge.png',
                tag: 'quranic-school-notification',
                requireInteraction: false,
              });
            } catch (err) {
              console.warn('Could not show notification:', err);
            }
          }
        }
      }, 0);
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
