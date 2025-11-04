#  Notifications Module

هذا المجلد يحتوي على جميع ملفات الإشعارات للنظام.

##  الملفات

### 1️⃣ **NotificationService.js** (الخدمة الرئيسية)
- إدارة الإشعارات المركزية
- أوقات الصلاة الديناميكية (Socket.IO + FCM فقط - لا تُحفظ في Database)
- تذكير القرآن اليومي (Socket.IO + FCM فقط - لا تُحفظ في Database)
- إشعارات العلامات والغياب (تُحفظ في Database)
- الإرسال عبر Socket.IO + FCM + Database (حسب النوع)

### 2 **FCMService.js**
- خدمة Firebase Cloud Messaging
- إرسال Push Notifications
- إدارة Device Tokens

### 3 **sectionNotifications.js**
- إشعارات المقاطع (إضافة/تعديل/حذف)
- إشعار طلاب الحلقة

### 4 **examNotifications.js**
- إشعارات الامتحانات (إضافة/تعديل/إلغاء)
- إشعار طلاب الحلقة

### 5 **dailyMarkNotifications.js**
- إشعارات العلامات اليومية
- إضافة/تعديل/حذف علامات

### 6 **newsNotifications.js**
- إشعارات الأخبار عبر Socket.IO
- بث التحديثات للواجهة

## 🚀 طرق الإرسال

1. **Socket.IO** - للمستخدمين المتصلين حالياً (جميع الإشعارات)
2. **Firebase FCM** - Push notifications للأجهزة (جميع الإشعارات)
3. **Database** - حفظ دائم للإشعارات (فقط الإشعارات العادية)

## ⚠️ ملاحظات هامة

### إشعارات الصلاة والقرآن
- **لا تُحفظ** في قاعدة البيانات
- **لا تظهر** في Notification Header للمستخدمين
- تُرسل فقط عبر Socket.IO و FCM للتنبيه الفوري
- الهدف: عدم إزعاج المستخدمين بإشعارات متكررة يومياً

### الإشعارات العادية (تُحفظ في Database)
- إشعارات العلامات والامتحانات
- إشعارات الغياب والحضور
- إشعارات المقاطع والأخبار
- تظهر في Notification Header ويمكن مراجعتها لاحقاً

##  الاستخدام

`javascript
// مثال: إرسال إشعار
const NotificationService = require('./Notifications/NotificationService');

await notificationService.createNotification({
  recipient: studentId,
  recipientModel: 'Student',
  type: 'grade',
  title: 'علامة جديدة',
  message: 'تم إضافة علامتك',
  priority: 'high',
  data: { ... }
});
`

##  تم إنشاؤه بتاريخ
2025-11-04
