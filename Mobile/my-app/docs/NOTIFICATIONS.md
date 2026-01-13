# 🔔 نظام الإشعارات الموحد - Unified Notification System

## نظرة عامة

نظام إشعارات موحد يعمل على الويب والموبايل باستخدام:

- **Firebase Cloud Messaging (FCM)** - للإشعارات Push
- **Socket.IO** - للإشعارات في الوقت الحقيقي
- **Expo Notifications** - للموبايل (Android/iOS)

## البنية

```
Mobile/my-app/
├── config/
│   └── firebase.ts          # إعداد FCM وقنوات الإشعارات
├── hooks/
│   └── useFirebaseMessaging.ts  # Hook لـ Push Notifications
├── Socket/
│   ├── SocketManager.ts     # إدارة اتصال Socket.IO
│   └── useNotificationsSocket.ts  # Hook لإشعارات Socket
├── Context/
│   └── NotificationContext.tsx  # Context مركزي للإشعارات
├── components/
│   └── Notifications/
│       ├── NotificationBell.tsx
│       └── NotificationCard.tsx
└── app/
    └── (tabs)/
        └── notifications.tsx  # صفحة الإشعارات
```

## التقنيات المستخدمة

### الويب (Frontend)

- Firebase Cloud Messaging (Web)
- Socket.IO Client
- Service Worker للإشعارات في الخلفية

### الموبايل (React Native/Expo)

- Expo Notifications
- FCM (Android) / APNs (iOS)
- Socket.IO Client

### الباكند

- NotificationManager
- FCMService
- SocketSender

## أنواع الإشعارات المدعومة

| النوع                   | الوصف                 |
| ----------------------- | --------------------- |
| `message`               | رسائل الدردشة         |
| `mention`               | الإشارات في المحادثات |
| `attendance`            | الحضور والغياب        |
| `grade` / `daily_marks` | العلامات والدرجات     |
| `exam`                  | الامتحانات            |
| `news`                  | الأخبار               |
| `warning`               | التحذيرات             |
| `prayer_time`           | أوقات الصلاة          |
| `system`                | إشعارات النظام        |
| `general`               | عام                   |

## الاستخدام

### 1. في المكونات

```tsx
import { useNotifications } from "@/Context/NotificationContext";

function MyComponent() {
  const {
    unreadCount,
    notifications,
    lastNotification,
    handleMarkAsRead,
    requestPushPermission,
  } = useNotifications();

  // استخدم البيانات
  return (
    <View>
      <Text>الإشعارات غير المقروءة: {unreadCount}</Text>
    </View>
  );
}
```

### 2. طلب صلاحيات الإشعارات

```tsx
const { requestPushPermission, isPermissionGranted } = useNotifications();

// طلب الصلاحيات
const granted = await requestPushPermission();
if (granted) {
  console.log("تم منح الصلاحيات!");
}
```

### 3. تعليم الإشعارات كمقروءة

```tsx
const { handleMarkAsRead, handleMarkAllAsRead } = useNotifications();

// تعليم إشعار واحد
await handleMarkAsRead(notificationId);

// تعليم الكل
await handleMarkAllAsRead();
```

## الإعداد

### 1. إعداد Firebase

1. أنشئ مشروع Firebase من [Firebase Console](https://console.firebase.google.com)
2. فعّل Cloud Messaging
3. احصل على `google-services.json` لـ Android
4. احصل على `GoogleService-Info.plist` لـ iOS

### 2. إضافة ملفات التهيئة

```bash
# ضع الملف في جذر my-app
Mobile/my-app/google-services.json
```

### 3. تحديث app.json

تم تحديث الإعدادات تلقائياً في `app.json`:

- `expo-notifications` plugin
- Android `googleServicesFile`
- قنوات الإشعارات

### 4. إعادة البناء

```bash
# للتطوير
npx expo prebuild
npx expo run:android

# للإنتاج
eas build --platform android
```

## قنوات الإشعارات (Android)

| القناة       | الوصف            |
| ------------ | ---------------- |
| `default`    | الإشعارات العامة |
| `messages`   | الرسائل          |
| `attendance` | الحضور والغياب   |
| `grades`     | العلامات         |
| `prayer`     | أوقات الصلاة     |

## التكامل مع الباكند

الباكند يرسل الإشعارات عبر:

1. **Socket.IO** - للإشعارات الفورية في التطبيق
2. **FCM** - للإشعارات Push (حتى لو التطبيق مغلق)

### نقاط النهاية (Endpoints)

```
POST /api/fcm/token     - تسجيل Device Token
DELETE /api/fcm/token   - إزالة Token (تسجيل خروج)
GET /api/notifications/:userId  - جلب الإشعارات
PUT /api/notifications/:id/read - تعليم كمقروء
```

## استكشاف الأخطاء

### الإشعارات لا تظهر

1. تأكد من الصلاحيات: `isPermissionGranted === true`
2. تأكد من الجهاز حقيقي (ليس محاكي)
3. تحقق من اتصال Socket: `isSocketConnected === true`

### Token غير مسجل

1. تحقق من وجود `google-services.json`
2. أعد بناء التطبيق بعد إضافة الملف
3. تحقق من السجلات في Console

## الملفات ذات الصلة

### Frontend (Web)

- `Frontend/src/hooks/useFirebaseMessaging.ts`
- `Frontend/src/Socket/useNotificationsSocket.ts`
- `Frontend/src/config/firebase.ts`

### Backend

- `Backend/src/Notifications/Core/NotificationManager.js`
- `Backend/src/Notifications/Core/FCMService.js`
- `Backend/src/Notifications/Core/SocketSender.js`
