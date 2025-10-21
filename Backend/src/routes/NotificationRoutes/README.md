# Notification Routes - البنية المقسمة

تم تقسيم `notificationRoutes.js` إلى ملفات منفصلة لسهولة التعديل والصيانة.

## 📁 هيكل الملفات

```
NotificationRoutes/
├── index.js              - نقطة الدخول الرئيسية (يصدر جميع الـ routes)
├── getRoutes.js          - جلب الإشعارات (GET requests)
├── updateRoutes.js       - تحديث الإشعارات (PUT/PATCH requests)
├── deleteRoutes.js       - حذف الإشعارات (DELETE requests)
├── createRoutes.js       - إنشاء إشعارات (POST requests)
├── deviceTokenRoutes.js  - إدارة توكنات الأجهزة (FCM)
└── README.md            - هذا الملف
```

## 📝 الوظائف الرئيسية

### 1. getRoutes.js - جلب الإشعارات

#### Routes للمستخدم الحالي (مع protect):
- `GET /notifications/auth-test` - اختبار المصادقة
- `GET /notifications/recent` - جلب أحدث الإشعارات للمستخدم الحالي
- `GET /notifications/unread-count` - عدد الإشعارات غير المقروءة للمستخدم الحالي

#### Routes حسب userId:
- `GET /notifications/:userId` - جلب إشعارات مستخدم محدد (مع pagination)
- `GET /notifications/:userId/unread-count` - عدد غير المقروءة لمستخدم محدد
- `GET /notifications/:userId/stats` - إحصائيات الإشعارات
- `GET /notifications/:userId/search` - البحث في الإشعارات

**المميزات:**
- Pagination support (page, limit)
- Filtering by type and isRead
- Statistics (unread, new, total)
- Text search
- Date range filtering

### 2. updateRoutes.js - تحديث الإشعارات

- `PUT /notifications/:notificationId/read` - تحديد إشعار كمقروء (مع protect)
- `PATCH /notifications/:notificationId/read` - تحديد إشعار كمقروء (backward compatibility)
- `PUT /notifications/read-all` - تحديد جميع إشعارات المستخدم الحالي كمقروءة (مع protect)
- `PATCH /notifications/:userId/read-all` - تحديد جميع إشعارات مستخدم محدد كمقروءة

**المميزات:**
- Auto-update readAt timestamp
- Protection للتأكد من أن المستخدم يحدث إشعاراته فقط

### 3. deleteRoutes.js - حذف الإشعارات

- `DELETE /notifications/:notificationId` - حذف إشعار واحد (مع protect)
- `DELETE /notifications/:userId/read` - حذف جميع الإشعارات المقروءة لمستخدم محدد

**المميزات:**
- Protection للتأكد من أن المستخدم يحذف إشعاراته فقط
- Bulk delete للإشعارات المقروءة

### 4. createRoutes.js - إنشاء الإشعارات

- `POST /notifications/create-test-notifications` - إنشاء إشعارات تجريبية (مع protect)
- `POST /notifications` - إنشاء إشعار جديد (مع validation)

**المميزات:**
- Data validation using NotificationValidation
- Real-time sending via global.notificationService
- Test notifications for development

### 5. deviceTokenRoutes.js - إدارة توكنات FCM

- `POST /notifications/register-token` - تسجيل/تحديث توكن الجهاز (مع protect)
- `POST /notifications/unregister-token` - إلغاء تسجيل توكن الجهاز (مع protect)

**المميزات:**
- FCM token management
- Platform detection (web, android, ios)
- Upsert logic (update if exists, create if not)

## 🔧 كيفية الاستخدام

### في app.js:
```javascript
const notificationRoutes = require("./routes/NotificationRoutes");
app.use("/api/notifications", notificationRoutes);
```

### في Frontend:
```typescript
// Get recent notifications
const notifications = await api.get('/notifications/recent?limit=10');

// Mark as read
await api.put(`/notifications/${notificationId}/read`);

// Mark all as read
await api.put('/notifications/read-all');

// Delete notification
await api.delete(`/notifications/${notificationId}`);

// Register FCM token
await api.post('/notifications/register-token', { token, platform: 'web' });
```

## 🛡️ الحماية (Authentication)

### Routes محمية (تتطلب protect middleware):
- `/notifications/auth-test`
- `/notifications/recent`
- `/notifications/unread-count`
- `/notifications/:notificationId/read` (PUT)
- `/notifications/read-all` (PUT)
- `/notifications/:notificationId` (DELETE)
- `/notifications/create-test-notifications`
- `/notifications/register-token`
- `/notifications/unregister-token`

### Routes عامة (لا تتطلب protect):
- `/notifications/:userId` - GET
- `/notifications/:userId/unread-count` - GET
- `/notifications/:userId/stats` - GET
- `/notifications/:userId/search` - GET
- `/notifications/:notificationId/read` - PATCH
- `/notifications/:userId/read-all` - PATCH
- `/notifications/:userId/read` - DELETE
- `/notifications` - POST (مع validation)

## 📊 Response Format

### نجاح:
```json
{
  "success": true,
  "message": "تم العملية بنجاح",
  "data": { ... }
}
```

### فشل:
```json
{
  "success": false,
  "message": "وصف الخطأ",
  "error": "تفاصيل الخطأ"
}
```

## 🔄 التكامل

### مع NotificationService:
- يستخدم `global.notificationService` لإرسال الإشعارات فوراً
- يدعم Socket.IO للإشعارات الفورية
- يدعم Firebase FCM للإشعارات Push

### مع Notification Schema:
- يستخدم Notification model من `../../schema/Notification`
- يدعم جميع أنواع الإشعارات: grade, message, prayer_time, activity, attendance, exam, general

### مع DeviceToken Schema:
- يدير توكنات FCM للأجهزة
- يربط التوكنات بالمستخدمين

## ✅ ملاحظات

- **منظم وسهل الصيانة**: كل نوع من الـ routes في ملف منفصل
- **Protected Routes**: استخدام protect middleware للحماية
- **Validation**: استخدام NotificationValidation للتحقق من البيانات
- **Real-time**: تكامل مع NotificationService و Socket.IO
- **FCM Support**: دعم كامل لـ Firebase Cloud Messaging
- **Backward Compatibility**: دعم كل من PUT و PATCH methods
- **Error Handling**: معالجة شاملة للأخطاء مع رسائل واضحة
- **Logging**: تسجيل تفصيلي للعمليات المهمة

## 🔧 التعديل

لتعديل أي وظيفة:
1. افتح الملف المطلوب (مثل `getRoutes.js`)
2. قم بالتعديلات المطلوبة
3. احفظ الملف
4. أعد تشغيل السيرفر

لا حاجة لتعديل `index.js` إلا إذا أضفت ملف جديد.
