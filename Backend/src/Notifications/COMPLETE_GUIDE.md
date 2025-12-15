# 🔔 الدليل الشامل لنظام الإشعارات - Quranic School

> **آخر تحديث:** 16 ديسمبر 2025  
> **الإصدار:** 2.0  
> **الحالة:** ✅ نشط ويعمل

---

## 📖 جدول المحتويات

1. [نظرة عامة](#نظرة-عامة)
2. [البنية الهيكلية](#البنية-الهيكلية)
3. [أنواع الإشعارات](#أنواع-الإشعارات)
4. [آلية العمل](#آلية-العمل)
5. [إرسال إشعارات Daily Marks](#إرسال-إشعارات-daily-marks)
6. [API Endpoints](#api-endpoints)
7. [Frontend Integration](#frontend-integration)
8. [خطوات التطبيق](#خطوات-التطبيق)
9. [أمثلة عملية](#أمثلة-عملية)
10. [استكشاف الأخطاء](#استكشاف-الأخطاء)

---

## 🎯 نظرة عامة

نظام الإشعارات في Quranic School يدعم:
- ✅ **Real-time notifications** عبر Socket.IO
- ✅ **Push notifications** عبر Firebase Cloud Messaging (FCM)
- ✅ **Database persistence** للإشعارات
- ✅ **Multi-user support** (Students, Teachers, Admins)
- ✅ **Type-based filtering** (daily_marks, exams, news, etc.)

---

## 🏗️ البنية الهيكلية

```
Backend/src/
├── Notifications/
│   ├── index.js                      # 🚀 نقطة التصدير الرئيسية
│   │
│   ├── Core/
│   │   ├── NotificationManager.js    # 🎛️ المدير الرئيسي
│   │   ├── FCMService.js             # 📲 Firebase Cloud Messaging
│   │   ├── PushSender.js             # 📣 إرسال Push Notifications
│   │   └── SocketSender.js           # ⚡ Real-time عبر Socket.IO
│   │
│   ├── Handlers/
│   │   ├── DailyMarksHandler.js      # 📚 معالج العلامات اليومية
│   │   ├── ExamHandler.js            # 📝 معالج الامتحانات
│   │   ├── NewsHandler.js            # 📰 معالج الأخبار
│   │   ├── StudentHandler.js         # 👨‍🎓 معالج الطلاب
│   │   ├── TeacherHandler.js         # 👨‍🏫 معالج المعلمين
│   │   └── GeneralHandler.js         # 🔔 معالج عام
│   │
│   └── Jobs/
│       └── PrayerJob.js              # 🕌 إشعارات أوقات الصلاة
│
├── routes/NotificationRoutes/
│   ├── notificationRoutes.js         # 🛣️ Router رئيسي
│   ├── getRoutes.js                  # GET requests
│   ├── updateRoutes.js               # PUT/PATCH requests
│   ├── deleteRoutes.js               # DELETE requests
│   ├── createRoutes.js               # POST requests
│   └── deviceTokenRoutes.js          # FCM token management
│
└── schema/
    ├── Notification.js               # 📋 Schema الإشعارات
    └── DeviceToken.js                # 📱 Schema التوكنات

Frontend/src/Socket/
└── useNotificationsSocket.ts         # 🎣 Hook للاستماع للإشعارات
```

---

## 📱 أنواع الإشعارات

### 1. Daily Marks (العلامات اليومية)
```javascript
type: "daily_marks"
```
- ✅ إشعارات المقاطع (Section notifications)
- ✅ إشعارات العلامات (Marks notifications)

**Actions:**
- `section_added` - مقطع جديد
- `section_updated` - تحديث مقطع
- `section_deleted` - حذف مقطع
- `mark_added` - علامة جديدة
- `mark_updated` - تحديث علامة
- `mark_deleted` - حذف علامة

### 2. Exams (الامتحانات)
```javascript
type: "exam"
```
- ✅ إنشاء امتحان جديد
- ✅ تحديث موعد امتحان
- ✅ إضافة/تحديث علامات امتحان
- ✅ حذف امتحان

### 3. News (الأخبار)
```javascript
type: "news"
```
- ✅ خبر جديد
- ✅ تحديث خبر
- ✅ حذف خبر
- ✅ نشر/أرشفة خبر

### 4. Other Types
```javascript
type: "attendance"    // الحضور والغياب
type: "warning"       // التحذيرات
type: "message"       // الرسائل
type: "prayer_time"   // أوقات الصلاة
type: "activity"      // الأنشطة
type: "general"       // عام
```

---

## ⚙️ آلية العمل

### 🔄 Flow الكامل لإرسال إشعار

```
┌─────────────────┐
│   Controller    │  1. حدث يستدعي إشعار
│  (e.g., create │     (مثل: إضافة علامة)
│   daily mark)   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│     Handler     │  2. DailyMarksHandler.notifyMarkAdded()
│ (DailyMarks     │     - تجهيز بيانات الإشعار
│   Handler)      │     - البحث عن المستلمين
└────────┬────────┘
         │
         ├──────────────────────┐
         │                      │
         ▼                      ▼
┌─────────────────┐   ┌─────────────────┐
│  Save to DB     │   │   Send via      │
│  (Notification  │   │   Socket.IO     │
│    Schema)      │   │ (Real-time)     │
└────────┬────────┘   └────────┬────────┘
         │                      │
         │                      ▼
         │            ┌─────────────────┐
         │            │  Client Socket  │
         │            │   .on('new      │
         │            │  Notification') │
         │            └─────────────────┘
         │
         ▼
┌─────────────────┐
│   Send via FCM  │  3. Push notification
│  (PushSender)   │     للأجهزة المسجلة
└─────────────────┘
```

### 📊 مراحل الإرسال بالتفصيل

#### المرحلة 1: إنشاء الإشعار
```javascript
// في Controller
const io = req.app.get("io");
await notifyMarkAdded(mark, io);
```

#### المرحلة 2: تجهيز البيانات
```javascript
// في Handler
const notification = new Notification({
  recipient: studentId,
  recipientModel: "Student",
  type: "daily_marks",
  title: "علامة جديدة",
  message: "تم رصد علامة...",
  data: {
    action: "mark_added",
    markId: mark._id,
    sectionId: mark.sectionId
  }
});
```

#### المرحلة 3: الحفظ والإرسال
```javascript
// 1. حفظ في Database
await notification.save();

// 2. إرسال Real-time
await sendRealTimeNotification(io, notification);
// يرسل لـ: io.to(recipientId).emit("newNotification", payload);

// 3. إرسال Push
await sendPushNotification(recipientId, notification);
// يجلب device tokens ويرسل عبر FCM
```

---

## 📚 إرسال إشعارات Daily Marks

### ✅ Checklist كامل

#### عند إضافة مقطع جديد:
```javascript
// File: controllers/DailyMarkController/SectionControllers/create.controller.js

exports.createSection = async (req, res) => {
  try {
    // 1️⃣ إنشاء المقطع
    const section = new Section(sectionData);
    const newSection = await section.save();
    
    // 2️⃣ الحصول على io
    const io = req.app.get("io");
    
    // 3️⃣ إرسال إشعار للطلاب
    if (io && newSection.group) {
      await notifySectionAdded(newSection, io);
      // ✅ يرسل لجميع طلاب الحلقة
      // ✅ يحفظ في Database
      // ✅ يرسل عبر Socket.IO
      // ✅ يرسل عبر FCM
    }
    
    res.status(201).json({ success: true, data: newSection });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};
```

#### عند إضافة علامات (Bulk):
```javascript
// File: controllers/DailyMarkController/setMarks.js

exports.setMarks = async (req, res) => {
  try {
    const marks = req.body.marks; // [{studentId, sectionId, reviewMark, memorizationMark}]
    
    // 1️⃣ حفظ العلامات
    const operations = marks.map((m) => ({
      updateOne: {
        filter: { studentId: m.studentId, sectionId: m.sectionId },
        update: {
          $set: {
            reviewMark: m.reviewMark || null,
            memorizationMark: m.memorizationMark || null,
          },
        },
        upsert: true,
      },
    }));
    await Mark.bulkWrite(operations);
    
    // 2️⃣ الحصول على io
    const io = req.app.get("io");
    
    // 3️⃣ إرسال إشعارات
    await notifyMarksAdded(marks, io);
    // ✅ loop على كل علامة
    // ✅ يرسل إشعار لكل طالب
    // ✅ يحفظ في Database
    // ✅ يرسل عبر Socket.IO
    // ✅ يرسل عبر FCM
    
    res.status(201).json({ success: true, data: marks });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};
```

### 🔍 داخل Handler

#### notifySectionAdded (مقطع جديد)
```javascript
// File: Notifications/Handlers/DailyMarksHandler.js

exports.notifySectionAdded = async (section, io) => {
  try {
    // 1️⃣ البحث عن الطلاب
    let students = [];
    const groupIdentifier = section.group;
    
    // Try direct match (Name or ID)
    students = await Student.find({ group: groupIdentifier });
    
    // If no students and it's ObjectId, try finding by Name
    if (students.length === 0 && mongoose.Types.ObjectId.isValid(groupIdentifier)) {
      const groupDoc = await Group.findById(groupIdentifier);
      if (groupDoc) {
        students = await Student.find({ group: groupDoc.name });
      }
    }
    
    if (!students.length) return;
    
    // 2️⃣ إنشاء إشعارات
    const notifications = students.map((student) => ({
      recipient: student._id,
      recipientModel: "Student",
      type: "daily_marks",
      title: "مقطع جديد",
      message: `تم إضافة مقطع جديد: حفظ ${section.memorizationSection}، مراجعة ${section.reviewSection}`,
      data: {
        sectionId: section._id,
        action: "section_added",
        date: section.date,
      },
    }));
    
    // 3️⃣ حفظ وإرسال
    for (const noteData of notifications) {
      const notification = new Notification(noteData);
      await notification.save();
      
      // Real-time
      if (io) {
        await sendRealTimeNotification(io, notification);
      }
      
      // Push
      await sendPushNotification(noteData.recipient, notification);
    }
    
    console.log(`🔔 Sent section added notifications to ${students.length} students`);
  } catch (error) {
    console.error("❌ Error in notifySectionAdded:", error);
  }
};
```

#### notifyMarkAdded (علامة جديدة)
```javascript
// File: Notifications/Handlers/DailyMarksHandler.js

exports.notifyMarkAdded = async (mark, io) => {
  try {
    if (!mark || !mark.studentId) return;
    
    // 1️⃣ الحصول على ID الطالب
    const recipientId = mark.studentId._id 
      ? mark.studentId._id.toString() 
      : mark.studentId.toString();
    
    // 2️⃣ إنشاء الإشعار
    const notification = new Notification({
      recipient: recipientId,
      recipientModel: "Student",
      type: "daily_marks",
      title: "علامة جديدة",
      message: `تم رصد علامة جديدة: حفظ ${mark.memorizationMark || '-'}، مراجعة ${mark.reviewMark || '-'}`,
      data: {
        markId: mark._id,
        sectionId: mark.sectionId,
        action: "mark_added",
      },
    });
    
    // 3️⃣ حفظ وإرسال
    await notification.save();
    
    if (io) {
      await sendRealTimeNotification(io, notification);
    }
    
    await sendPushNotification(recipientId, notification);
    
    console.log(`🔔 Sent mark added notification to student ${recipientId}`);
  } catch (error) {
    console.error("❌ Error in notifyMarkAdded:", error);
  }
};

// Bulk version
exports.notifyMarksAdded = async (marks, io) => {
  try {
    if (!marks || !marks.length) return;
    
    console.log(`🔔 Processing bulk mark notifications for ${marks.length} marks`);
    
    for (const mark of marks) {
      await exports.notifyMarkAdded(mark, io);
    }
  } catch (error) {
    console.error("❌ Error in notifyMarksAdded:", error);
  }
};
```

---

## 🛣️ API Endpoints

### GET Requests (جلب الإشعارات)

#### 1. جلب أحدث الإشعارات (Protected)
```http
GET /api/notifications/recent?limit=10
Authorization: Bearer <token>
```
**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "type": "daily_marks",
      "title": "علامة جديدة",
      "message": "تم رصد علامة...",
      "isRead": false,
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

#### 2. عدد الإشعارات غير المقروءة (Protected)
```http
GET /api/notifications/unread-count
Authorization: Bearer <token>
```
**Response:**
```json
{
  "success": true,
  "data": { "unreadCount": 5 }
}
```

#### 3. جلب إشعارات مستخدم محدد
```http
GET /api/notifications/:userId?page=1&limit=20&type=daily_marks
```
**Query Parameters:**
- `page` - رقم الصفحة (default: 1)
- `limit` - عدد العناصر (default: 20, max: 100)
- `type` - نوع الإشعار (optional)
- `isRead` - true/false (optional)

### PUT/PATCH Requests (تحديث الإشعارات)

#### 1. تحديد إشعار كمقروء (Protected)
```http
PUT /api/notifications/:notificationId/read
Authorization: Bearer <token>
```
**Response:**
```json
{
  "success": true,
  "message": "تم تحديث الإشعار بنجاح",
  "data": { "isRead": true, "readAt": "2024-01-15T10:35:00.000Z" }
}
```

#### 2. تحديد جميع الإشعارات كمقروءة (Protected)
```http
PUT /api/notifications/read-all
Authorization: Bearer <token>
```
**Response:**
```json
{
  "success": true,
  "message": "تم تحديث 15 إشعار",
  "data": { "modifiedCount": 15 }
}
```

### DELETE Requests (حذف الإشعارات)

#### 1. حذف إشعار واحد (Protected)
```http
DELETE /api/notifications/:notificationId
Authorization: Bearer <token>
```

#### 2. حذف جميع الإشعارات المقروءة
```http
DELETE /api/notifications/:userId/read
```

### POST Requests (إنشاء وإدارة)

#### 1. تسجيل FCM Token (Protected)
```http
POST /api/notifications/register-token
Authorization: Bearer <token>
Content-Type: application/json

{
  "token": "fcm-device-token-here",
  "platform": "web"
}
```

#### 2. إلغاء تسجيل FCM Token (Protected)
```http
POST /api/notifications/unregister-token
Authorization: Bearer <token>
Content-Type: application/json

{
  "token": "fcm-device-token-here"
}
```

---

## 🎨 Frontend Integration

### 1. Socket.IO Hook Setup
```typescript
// File: Frontend/src/Socket/useNotificationsSocket.ts

export const useNotificationsSocket = () => {
  const { user } = useAuth();
  const [lastNotification, setLastNotification] = useState<Notification | null>(null);
  const [notificationStats, setNotificationStats] = useState({
    unreadCount: 0,
    newCount: 0,
    totalCount: 0,
  });

  useEffect(() => {
    if (!user || !isConnected) return;

    // 1️⃣ Join notifications room
    socketManager.emit('joinNotifications', {
      userId: user._id,
      role: user.role,
    });

    // 2️⃣ Listen for new notifications
    socketManager.on('newNotification', (data) => {
      // Play sound
      const audio = new Audio(notificationSound);
      audio.play();

      // Show browser notification
      if (document.hidden && Notification.permission === 'granted') {
        new Notification(data.title, {
          body: data.message,
          icon: '/pwa-192x192.png',
        });
      }

      // Update state
      setLastNotification(data);
      setNotificationStats(prev => ({
        ...prev,
        unreadCount: prev.unreadCount + 1,
      }));
    });

    return () => {
      socketManager.emit('leaveNotifications', { userId: user._id });
    };
  }, [user, isConnected]);

  return { lastNotification, notificationStats };
};
```

### 2. استخدام الـ Hook في Component
```typescript
function NotificationBell() {
  const { lastNotification, notificationStats } = useNotificationsSocket();

  // Auto-refresh on new notification
  useEffect(() => {
    if (lastNotification) {
      toast.success(lastNotification.title, {
        description: lastNotification.message,
      });
    }
  }, [lastNotification]);

  return (
    <Badge count={notificationStats.unreadCount}>
      <Bell />
    </Badge>
  );
}
```

---

## 🛠️ خطوات التطبيق

### لإضافة إشعار جديد لـ Feature معين:

#### 1️⃣ إنشاء Handler (إذا لم يكن موجود)
```javascript
// File: Notifications/Handlers/YourFeatureHandler.js

const Notification = require("../../schema/Notification");
const { sendRealTimeNotification } = require("../Core/SocketSender");
const { sendPushNotification } = require("../Core/PushSender");

exports.notifyYourAction = async (data, io) => {
  try {
    // 1. Create notification
    const notification = new Notification({
      recipient: data.userId,
      recipientModel: "Student",
      type: "your_type",
      title: "عنوان الإشعار",
      message: "نص الإشعار",
      data: {
        action: "your_action",
        // additional data
      },
    });

    // 2. Save
    await notification.save();

    // 3. Send real-time
    if (io) {
      await sendRealTimeNotification(io, notification);
    }

    // 4. Send push
    await sendPushNotification(data.userId, notification);

    console.log(`🔔 Notification sent successfully`);
  } catch (error) {
    console.error("❌ Error in notifyYourAction:", error);
  }
};
```

#### 2️⃣ Export من index.js
```javascript
// File: Notifications/index.js

const YourFeatureHandler = require("./Handlers/YourFeatureHandler");

module.exports = {
  // ... existing exports
  notifyYourAction: YourFeatureHandler.notifyYourAction,
};
```

#### 3️⃣ استخدام في Controller
```javascript
// File: controllers/YourController.js

const { notifyYourAction } = require("../Notifications");

exports.yourAction = async (req, res) => {
  try {
    // Your logic here
    const result = await doSomething();

    // Send notification
    const io = req.app.get("io");
    await notifyYourAction({ userId: req.user._id, ...result }, io);

    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};
```

#### 4️⃣ استقبال في Frontend
```typescript
// Already handled by useNotificationsSocket hook!
// Just use the hook in your component
const { lastNotification } = useNotificationsSocket();
```

---

## 💡 أمثلة عملية

### مثال 1: إشعار عند إضافة خبر جديد
```javascript
// Controller
const { notifyNewsCreated } = require("../Notifications");

exports.createNews = async (req, res) => {
  const news = await News.create(req.body);
  const io = req.app.get("io");
  await notifyNewsCreated(news, io);
  res.json({ success: true, data: news });
};
```

### مثال 2: إشعار عند إضافة تحذير
```javascript
// Controller
const { notifyWarning } = require("../Notifications");

exports.addWarning = async (req, res) => {
  const warning = await Warning.create(req.body);
  const io = req.app.get("io");
  await notifyWarning(warning.studentId, warning, io);
  res.json({ success: true, data: warning });
};
```

### مثال 3: إشعار جماعي لجميع طلاب حلقة
```javascript
exports.notifyGroupStudents = async (groupId, title, message, io) => {
  const students = await Student.find({ group: groupId });
  
  for (const student of students) {
    const notification = new Notification({
      recipient: student._id,
      recipientModel: "Student",
      type: "general",
      title: title,
      message: message,
    });
    
    await notification.save();
    await sendRealTimeNotification(io, notification);
    await sendPushNotification(student._id, notification);
  }
};
```

---

## 🐛 استكشاف الأخطاء

### المشكلة: الإشعارات لا تصل للـ Frontend

#### ✅ تحقق من:
1. **Socket.IO Connection**
   ```javascript
   console.log('Socket connected:', socketManager.isConnected());
   ```

2. **User joined notifications room**
   ```javascript
   socketManager.emit('joinNotifications', {
     userId: user._id,
     role: user.role,
   });
   ```

3. **Backend sending correctly**
   ```javascript
   console.log('Sending to room:', recipientId);
   io.to(recipientId).emit('newNotification', payload);
   ```

4. **Frontend listening**
   ```typescript
   socketManager.on('newNotification', (data) => {
     console.log('Received notification:', data);
   });
   ```

### المشكلة: Push Notifications لا تعمل

#### ✅ تحقق من:
1. **FCM initialized**
   ```javascript
   console.log('FCM initialized:', FCMService?.initialized);
   ```

2. **Device token registered**
   ```javascript
   const tokens = await DeviceToken.find({ user: userId });
   console.log('Registered tokens:', tokens);
   ```

3. **Firebase credentials valid**
   ```bash
   # Check .env
   FIREBASE_SERVICE_ACCOUNT_JSON=...
   ```

### المشكلة: إشعارات تُرسل لطلاب خطأ

#### ✅ تحقق من:
1. **Group matching logic**
   ```javascript
   // هل الطلاب يستخدمون group name أو group _id؟
   console.log('Student group:', student.group);
   console.log('Section group:', section.group);
   ```

2. **Recipient ID correct**
   ```javascript
   const recipientId = mark.studentId._id 
     ? mark.studentId._id.toString() 
     : mark.studentId.toString();
   console.log('Sending to:', recipientId);
   ```

---

## 📊 Best Practices

### ✅ Do's
- ✅ استخدم try-catch لمعالجة الأخطاء
- ✅ log المراحل المهمة (console.log)
- ✅ تحقق من وجود io قبل الإرسال
- ✅ استخدم .toString() لتحويل ObjectId
- ✅ استخدم Bulk operations عند الحاجة

### ❌ Don'ts
- ❌ لا ترسل إشعارات بدون validation
- ❌ لا تنسى await قبل async functions
- ❌ لا تستخدم populated objects مباشرة
- ❌ لا تُرسل إشعارات متكررة
- ❌ لا تتجاهل الأخطاء

---

## 🚀 Future Enhancements

- [ ] Notification preferences (السماح للطالب بتعطيل أنواع معينة)
- [ ] Notification templates
- [ ] Scheduled notifications
- [ ] Notification analytics
- [ ] Rich notifications (صور، actions)
- [ ] Group notifications (bulk to multiple users)
- [ ] Email notifications fallback

---

## 📞 الدعم

إذا واجهت مشكلة:
1. تحقق من [استكشاف الأخطاء](#استكشاف-الأخطاء)
2. راجع الـ console logs
3. تحقق من البنية الهيكلية
4. تأكد من تطابق البيانات مع الأمثلة

---

**تم إعداد هذا الدليل بواسطة:** GitHub Copilot  
**للمشروع:** Quranic School Management System  
**التاريخ:** 16 ديسمبر 2025
