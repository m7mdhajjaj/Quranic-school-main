# 📚 دليل إرسال إشعارات Daily Marks - خطوات دقيقة

## 🎯 نظرة عامة
نظام الإشعارات للعلامات اليومية يدعم نوعين من الإشعارات:
1. **إشعارات المقاطع** - عند إضافة/تحديث/حذف مقطع
2. **إشعارات العلامات** - عند إضافة/تحديث/حذف علامة طالب

---

## 🏗️ البنية الهيكلية

### المكونات الأساسية
```
Backend/src/Notifications/
├── index.js                          # نقطة التصدير الرئيسية
├── Core/
│   ├── NotificationManager.js        # المدير الرئيسي
│   ├── FCMService.js                 # خدمة Firebase Cloud Messaging
│   ├── PushSender.js                 # إرسال Push Notifications
│   └── SocketSender.js               # إرسال Real-time عبر Socket.IO
└── Handlers/
    └── DailyMarksHandler.js          # معالج إشعارات العلامات اليومية
```

---

## 📋 خطوات إرسال إشعار Daily Marks

### 1️⃣ **إنشاء إشعار مقطع جديد**

#### في الـ Controller:
```javascript
// File: controllers/DailyMarkController/SectionControllers/create.controller.js
const { notifySectionAdded } = require("../../../Notifications");

exports.createSection = async (req, res) => {
  try {
    // 1. إنشاء المقطع
    const section = new Section(sectionData);
    const newSection = await section.save();
    
    // 2. إرسال إشعار للطلاب
    const io = req.app.get("io");
    if (io && newSection.group) {
      await notifySectionAdded(newSection, io);
    }
    
    res.status(201).json({ success: true, data: newSection });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};
```

#### في الـ Handler:
```javascript
// File: Notifications/Handlers/DailyMarksHandler.js
exports.notifySectionAdded = async (section, io) => {
  try {
    console.log(`🔔 notifySectionAdded called for group: ${section?.group}`);
    
    // 1. البحث عن الطلاب في الحلقة
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

    // 2. إنشاء إشعار لكل طالب
    const notifications = students.map((student) => ({
      recipient: student._id,
      recipientModel: "Student",
      type: "daily_marks",
      title: "مقطع جديد",
      message: `تم إضافة مقطع جديد لحلقة ${section.group}: حفظ ${section.memorizationSection}، مراجعة ${section.reviewSection}`,
      data: {
        sectionId: section._id,
        action: "section_added",
        date: section.date,
      },
    }));

    // 3. حفظ وإرسال الإشعارات
    for (const noteData of notifications) {
      const notification = new Notification(noteData);
      await notification.save();

      // Real-time via Socket.IO
      if (io) {
        await sendRealTimeNotification(io, notification);
      }

      // Push notification via FCM
      await sendPushNotification(noteData.recipient, notification);
    }
    
    console.log(`🔔 Sent section added notifications to ${students.length} students`);
  } catch (error) {
    console.error("❌ Error in notifySectionAdded:", error);
  }
};
```

---

### 2️⃣ **إنشاء إشعار علامة جديدة**

#### في الـ Controller:
```javascript
// File: controllers/DailyMarkController/setMarks.js
const { notifyMarksAdded } = require("../../Notifications");

exports.setMarks = async (req, res) => {
  try {
    const marks = req.body.marks; // Array of marks
    
    // 1. حفظ العلامات
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
    
    // 2. إرسال إشعارات للطلاب
    console.log("🔔 إرسال الإشعارات...");
    const io = req.app.get("io");
    await notifyMarksAdded(marks, io);
    console.log("✅ تم إرسال الإشعارات");
    
    res.status(201).json({ success: true, data: marks });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};
```

#### في الـ Handler:
```javascript
// File: Notifications/Handlers/DailyMarksHandler.js

// For single mark
exports.notifyMarkAdded = async (mark, io) => {
  try {
    if (!mark || !mark.studentId) return;

    // Ensure we use the ID string
    const recipientId = mark.studentId._id 
      ? mark.studentId._id.toString() 
      : mark.studentId.toString();

    // Create notification
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

    await notification.save();

    // Real-time
    if (io) {
      await sendRealTimeNotification(io, notification);
    }

    // Push
    await sendPushNotification(recipientId, notification);
    
    console.log(`🔔 Sent mark added notification to student ${recipientId}`);
  } catch (error) {
    console.error("❌ Error in notifyMarkAdded:", error);
  }
};

// For multiple marks (Bulk)
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

## 🔌 آلية إرسال الإشعارات

### Socket.IO Real-time
```javascript
// File: Notifications/Core/SocketSender.js
async function sendRealTimeNotification(io, notification) {
  try {
    const recipientId = notification.recipient.toString();

    const notificationPayload = {
      id: notification._id,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      data: notification.data,
      priority: notification.priority,
      createdAt: notification.createdAt,
      sentAt: notification.sentAt || new Date(),
      isNew: true,
    };

    // Send to user's room
    io.to(recipientId).emit("newNotification", notificationPayload);
    
    console.log(`📱 Real-time notification sent to room ${recipientId}`);
  } catch (error) {
    console.error("❌ Error sending real-time notification:", error);
  }
}
```

### FCM Push Notification
```javascript
// File: Notifications/Core/PushSender.js
async function sendPushNotification(recipient, notificationData) {
  try {
    if (!FCMService || !FCMService.initialized) {
      console.warn("⚠️ FCM not initialized, skipping push notification");
      return null;
    }

    // 1. Get device tokens for user
    const devices = await DeviceToken.find({ user: recipient }).lean();
    const tokenList = devices.map((d) => d.token).filter(Boolean);
    
    if (tokenList.length === 0) {
      console.log(`📱 No device tokens found for user ${recipient}`);
      return null;
    }

    // 2. Prepare FCM payload
    const payload = {
      notification: {
        title: notificationData.title,
        body: notificationData.message,
      },
      data: {
        notificationId: notificationData._id?.toString() || "",
        type: notificationData.type,
        priority: notificationData.priority || "medium",
        ...notificationData.data,
      },
    };

    // 3. Send to all devices
    const response = await FCMService.sendToTokens(tokenList, payload);
    console.log(`📣 Push notification sent via FCM to ${tokenList.length} devices`);
    return response;
  } catch (error) {
    console.error("❌ Error sending FCM push:", error.message || error);
    return null;
  }
}
```

---

## 📊 Schema الإشعارات

```javascript
// File: schema/Notification.js
{
  recipient: ObjectId,              // معرف المستلم
  recipientModel: "Student",        // نوع المستلم (Student/Teacher/Admin)
  type: "daily_marks",              // نوع الإشعار
  title: "علامة جديدة",            // العنوان
  message: "تم رصد علامة...",      // الرسالة
  data: {                           // بيانات إضافية
    action: "mark_added",           // نوع العملية
    markId: "...",                  // معرف العلامة
    sectionId: "...",               // معرف المقطع
  },
  isRead: false,                    // حالة القراءة
  sentAt: Date,                     // وقت الإرسال
  readAt: Date,                     // وقت القراءة
  createdAt: Date                   // وقت الإنشاء
}
```

---

## 🎨 في Frontend - استقبال الإشعارات

```typescript
// File: Frontend/src/Socket/useNotificationsSocket.ts
export const useNotificationsSocket = (): UseNotificationsSocketReturn => {
  const { user } = useAuth();
  const [lastNotification, setLastNotification] = useState<Notification | null>(null);

  useEffect(() => {
    if (!isConnected) return;

    // 1. Join notifications room
    socketManager.emit('joinNotifications', {
      userId: user._id,
      role: user.role,
    });

    // 2. Listen for new notifications
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
      setRefreshTrigger((prev) => prev + 1);
    });

    return () => {
      socketManager.emit('leaveNotifications', { userId: user._id });
    };
  }, [isConnected, user]);

  return { lastNotification, refreshTrigger };
};
```

---

## ✅ Checklist - خطوات إرسال إشعار Daily Marks

### عند إضافة مقطع:
- [ ] إنشاء المقطع في Database
- [ ] الحصول على `io` من `req.app.get("io")`
- [ ] استدعاء `notifySectionAdded(section, io)`
- [ ] البحث عن جميع طلاب الحلقة
- [ ] إنشاء إشعار لكل طالب
- [ ] حفظ الإشعار في Database
- [ ] إرسال عبر Socket.IO (Real-time)
- [ ] إرسال عبر FCM (Push)

### عند إضافة علامات:
- [ ] حفظ العلامات في Database
- [ ] الحصول على `io` من `req.app.get("io")`
- [ ] استدعاء `notifyMarksAdded(marks, io)`
- [ ] Loop على كل علامة
- [ ] إنشاء إشعار لكل طالب
- [ ] حفظ الإشعار في Database
- [ ] إرسال عبر Socket.IO (Real-time)
- [ ] إرسال عبر FCM (Push)

---

## 🔍 أمثلة الـ Data Object

### مقطع جديد:
```json
{
  "action": "section_added",
  "sectionId": "648a1b2c3d4e5f6789012345",
  "date": "2024-01-15T00:00:00.000Z",
  "memorizationSection": "البقرة 1-10",
  "reviewSection": "البقرة 11-20"
}
```

### علامة جديدة:
```json
{
  "action": "mark_added",
  "markId": "648a1b2c3d4e5f6789012346",
  "sectionId": "648a1b2c3d4e5f6789012345",
  "memorizationMark": 50,
  "reviewMark": 45
}
```

### مقطع محدث:
```json
{
  "action": "section_updated",
  "sectionId": "648a1b2c3d4e5f6789012345",
  "oldSection": {
    "memorizationSection": "البقرة 1-10",
    "reviewSection": "البقرة 11-20"
  },
  "newSection": {
    "memorizationSection": "البقرة 1-15",
    "reviewSection": "البقرة 16-25"
  }
}
```

---

## ⚠️ ملاحظات مهمة

1. **Socket.IO Rooms**: المستخدم يجب أن يكون منضم لـ room باسم `userId` الخاص به
2. **FCM Tokens**: يجب أن يكون للطالب device token مسجل في DeviceToken collection
3. **Error Handling**: جميع الأخطاء يتم logging ولا توقف سير العمل
4. **Group Matching**: يدعم البحث بـ name و _id للحلقة
5. **Bulk Operations**: استخدم `notifyMarksAdded` بدلاً من loop يدوي

---

## 🚀 Future Enhancements

- [ ] إضافة دعم Notification Preferences (السماح للطالب بتعطيل أنواع معينة)
- [ ] إضافة Notification Templates
- [ ] إضافة Scheduled Notifications
- [ ] إضافة Notification Analytics
- [ ] إضافة Rich Notifications (صور، actions)

---

**آخر تحديث:** 16 ديسمبر 2025
