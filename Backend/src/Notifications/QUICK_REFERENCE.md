# 🚀 Quick Reference - نظام الإشعارات

> مرجع سريع للمطورين - كل ما تحتاجه في صفحة واحدة

---

## 📦 Import الدوال

```javascript
// في Controller
const { 
  notifySectionAdded,
  notifySectionUpdated,
  notifyMarkAdded,
  notifyMarksAdded,
  notifyExamCreated,
  notifyNewsCreated,
} = require("../Notifications");
```

---

## ⚡ إرسال إشعار سريع

### Template أساسي
```javascript
exports.yourController = async (req, res) => {
  try {
    // 1. Your logic
    const result = await doSomething();
    
    // 2. Get io
    const io = req.app.get("io");
    
    // 3. Send notification
    await notifyYourFunction(result, io);
    
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};
```

---

## 📚 Daily Marks - الأكثر استخداماً

### إشعار مقطع جديد
```javascript
const { notifySectionAdded } = require("../Notifications");

const section = await Section.create(req.body);
const io = req.app.get("io");
await notifySectionAdded(section, io);
// ✅ يرسل لجميع طلاب الحلقة
```

### إشعار علامة واحدة
```javascript
const { notifyMarkAdded } = require("../Notifications");

const mark = await Mark.create(req.body);
const io = req.app.get("io");
await notifyMarkAdded(mark, io);
// ✅ يرسل للطالب المحدد
```

### إشعار علامات متعددة (Bulk)
```javascript
const { notifyMarksAdded } = require("../Notifications");

const marks = await Mark.insertMany(req.body.marks);
const io = req.app.get("io");
await notifyMarksAdded(marks, io);
// ✅ يرسل لكل طالب على حدة
```

---

## 🔔 أنواع الإشعارات المتاحة

```javascript
// Daily Marks
notifySectionAdded(section, io)
notifySectionUpdated(section, oldSection, io)
notifySectionDeleted(section, io)
notifyMarkAdded(mark, io)
notifyMarksAdded(marks, io)
notifyMarkUpdated(mark, io)

// Exams
notifyExamCreated(exam, io)
notifyExamUpdated(exam, io)
notifyExamDeleted(exam, io)

// News
notifyNewsCreated(news, io)
notifyNewsUpdated(news, io)
notifyNewsDeleted(news, io)

// Students
notifyStudentAddedToGroup(student, group, io)
notifyStudentRemovedFromGroup(student, group, io)
```

---

## 📋 Notification Schema

```javascript
{
  recipient: ObjectId,              // معرف المستلم (required)
  recipientModel: "Student",        // Student/Teacher/Admin (required)
  type: "daily_marks",              // نوع الإشعار (required)
  title: "عنوان",                   // max 100 chars (required)
  message: "رسالة",                 // max 500 chars (required)
  data: {                           // بيانات إضافية (optional)
    action: "mark_added",
    markId: "...",
    sectionId: "..."
  },
  isRead: false,                    // حالة القراءة
  sentAt: Date,                     // وقت الإرسال
  readAt: Date,                     // وقت القراءة
}
```

---

## 🎯 أنواع الـ data.action

### Daily Marks
- `section_added` - مقطع جديد
- `section_updated` - تحديث مقطع
- `section_deleted` - حذف مقطع
- `mark_added` - علامة جديدة
- `mark_updated` - تحديث علامة
- `mark_deleted` - حذف علامة

### Exams
- `exam_created` - امتحان جديد
- `exam_updated` - تحديث امتحان
- `exam_deleted` - حذف امتحان

### News
- `news_created` - خبر جديد
- `news_updated` - تحديث خبر
- `news_deleted` - حذف خبر

---

## 🛣️ API Endpoints - الأكثر استخداماً

### GET
```http
GET /api/notifications/recent?limit=10              # أحدث الإشعارات (Protected)
GET /api/notifications/unread-count                 # عدد غير المقروءة (Protected)
GET /api/notifications/:userId?page=1&limit=20      # إشعارات مستخدم محدد
```

### PUT
```http
PUT /api/notifications/:notificationId/read         # تحديد كمقروء (Protected)
PUT /api/notifications/read-all                     # تحديد الكل كمقروء (Protected)
```

### DELETE
```http
DELETE /api/notifications/:notificationId           # حذف إشعار (Protected)
DELETE /api/notifications/:userId/read              # حذف المقروءة
```

### POST
```http
POST /api/notifications/register-token              # تسجيل FCM token (Protected)
POST /api/notifications/unregister-token            # إلغاء تسجيل token (Protected)
```

---

## 🎨 Frontend - useNotificationsSocket

```typescript
import { useNotificationsSocket } from '../Socket/useNotificationsSocket';

function MyComponent() {
  const { 
    lastNotification,      // آخر إشعار
    notificationStats,     // { unreadCount, newCount, totalCount }
    refreshTrigger,        // trigger للـ auto-refresh
    isConnected,           // حالة الاتصال
  } = useNotificationsSocket();

  // Auto-refresh on new notification
  useEffect(() => {
    if (lastNotification) {
      console.log('New notification:', lastNotification);
      // Refresh your data
    }
  }, [lastNotification, refreshTrigger]);

  return <Badge count={notificationStats.unreadCount}>🔔</Badge>;
}
```

---

## 🐛 Debugging - التحقق السريع

### Backend
```javascript
// 1. تحقق من io
const io = req.app.get("io");
console.log('IO available:', !!io);

// 2. تحقق من الإرسال
console.log('Sending notification to:', recipientId);

// 3. تحقق من FCM
console.log('FCM initialized:', FCMService?.initialized);
```

### Frontend
```typescript
// 1. تحقق من الاتصال
console.log('Socket connected:', socketManager.isConnected());

// 2. تحقق من الـ room
socketManager.emit('joinNotifications', { userId, role });

// 3. استمع للإشعارات
socketManager.on('newNotification', (data) => {
  console.log('Received:', data);
});
```

---

## ✅ Checklist - قبل الإرسال

- [ ] استوردت الدالة من `require("../Notifications")`
- [ ] حصلت على `io` من `req.app.get("io")`
- [ ] تحققت من وجود `io` قبل الإرسال
- [ ] استخدمت `await` قبل استدعاء الدالة
- [ ] البيانات صحيحة (studentId, sectionId, etc.)
- [ ] Frontend يستمع عبر `useNotificationsSocket`

---

## 🎯 نصائح سريعة

1. **دائماً استخدم try-catch**
   ```javascript
   try {
     await notifyMarkAdded(mark, io);
   } catch (error) {
     console.error('Notification error:', error);
     // لا توقف سير العمل
   }
   ```

2. **تحقق من وجود البيانات**
   ```javascript
   if (io && mark.studentId) {
     await notifyMarkAdded(mark, io);
   }
   ```

3. **استخدم .toString() للـ ObjectId**
   ```javascript
   const recipientId = student._id.toString();
   ```

4. **للبيانات الكثيرة استخدم Bulk**
   ```javascript
   // ✅ Good
   await notifyMarksAdded(marks, io);
   
   // ❌ Bad
   for (const mark of marks) {
     await notifyMarkAdded(mark, io);
   }
   ```

---

## 📞 روابط مهمة

- [الدليل الكامل](./COMPLETE_GUIDE.md)
- [خطوات Daily Marks](./DAILY_MARKS_NOTIFICATION_FLOW.md)
- [Routes README](../routes/NotificationRoutes/README.md)

---

**نسخة:** 1.0 | **تاريخ:** 16 ديسمبر 2025
