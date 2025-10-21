# نظام الإشعارات للعلامات - Exam Marks Notifications

## 📋 نظرة عامة

تم تطبيق نظام إشعارات شامل لجميع العمليات المتعلقة بعلامات الامتحانات، بحيث يصل إشعار فوري للطالب عند:
- ✅ إضافة علامة جديدة
- ✅ تعديل علامة موجودة
- ✅ حذف علامة
- ✅ إضافة علامات لعدة طلاب (bulk)

## 🎯 المميزات

### 1. إشعارات فورية (Real-time)
- يتم إرسال الإشعار فوراً عبر Socket.IO
- الطالب يستلم الإشعار مباشرة بدون تحديث الصفحة

### 2. إشعارات Push (Firebase)
- إرسال push notification للطالب حتى لو كان التطبيق مغلق
- يعمل على الويب والموبايل

### 3. حفظ في قاعدة البيانات
- جميع الإشعارات تُحفظ في الـ Database
- الطالب يستطيع مراجعة الإشعارات القديمة

## 📁 البنية

```
Backend/src/controllers/
├── examMarkController.js          - Controller الرئيسي للعلامات
└── ExamMark/
    └── examMarkNotifications.js   - نظام الإشعارات للعلامات
```

## 🔔 أنواع الإشعارات

### 1. إضافة علامة لطالب واحد
```javascript
// Function: updateStudentMark
Title: "📊 علامة جديدة"
Message: "تم إضافة علامتك في امتحان [اسم الامتحان]: [العلامة]/[العلامة الكلية]"
Type: "grade"
Priority: "high"
```

### 2. إضافة علامات لعدة طلاب
```javascript
// Function: setExamMarks (bulk)
Title: "📊 علامة جديدة"
Message: "تم إضافة علامتك في امتحان [اسم الامتحان]: [العلامة]/[العلامة الكلية]"
Type: "grade"
Priority: "high"
// يتم إرسال إشعار منفصل لكل طالب
```

### 3. تعديل علامة
```javascript
// Function: updateStudentMark
Title: "✏️ تم تعديل علامتك"
Message: "تم تعديل علامتك في امتحان [اسم الامتحان]: [العلامة]/[العلامة الكلية]"
Type: "grade"
Priority: "high"
```

### 4. حذف علامة
```javascript
// Function: deleteStudentMark
Title: "🗑️ تم حذف علامة"
Message: "تم حذف علامتك في امتحان [اسم الامتحان]"
Type: "grade"
Priority: "medium"
```

## 📊 البيانات المرسلة مع الإشعار

كل إشعار يحتوي على:
```javascript
{
  recipient: "studentId",           // معرف الطالب
  recipientModel: "Student",        // نوع المستلم
  type: "grade",                    // نوع الإشعار
  title: "...",                     // عنوان الإشعار
  message: "...",                   // نص الإشعار
  data: {
    examId: "...",                  // معرف الامتحان
    examTitle: "...",               // اسم الامتحان
    mark: 85,                       // العلامة
    totalMark: 100,                 // العلامة الكلية
    detail: "..."                   // تفاصيل إضافية
  },
  priority: "high"                  // أولوية الإشعار
}
```

## 🔄 آلية العمل

### إضافة علامة واحدة (updateStudentMark):
```
1. المعلم يضيف/يعدل العلامة
   ↓
2. تحديث العلامة في Database
   ↓
3. حساب متوسط الامتحان
   ↓
4. استدعاء notifyMarkUpdated()
   ↓
5. جلب بيانات الطالب والامتحان
   ↓
6. إرسال الإشعار عبر NotificationService
   ↓
7. إرسال Socket.IO event للتحديث الفوري
   ↓
8. إرسال Firebase push notification
   ↓
9. حفظ الإشعار في Database
```

### إضافة علامات متعددة (setExamMarks):
```
1. المعلم يضيف علامات لعدة طلاب
   ↓
2. تحديث جميع العلامات في Database (bulkWrite)
   ↓
3. حساب متوسط الامتحان
   ↓
4. استدعاء notifyMarksAdded()
   ↓
5. جلب بيانات جميع الطلاب
   ↓
6. Loop على كل طالب:
   - إرسال إشعار منفصل لكل طالب
   - تخصيص الرسالة بعلامة الطالب
   ↓
7. إرسال Socket.IO event للتحديث الفوري
```

## 🛡️ معالجة الأخطاء

- جميع الـ functions محمية بـ try-catch
- في حالة فشل إرسال الإشعار، لا يؤثر على عملية حفظ العلامة
- تسجيل تفصيلي للأخطاء في Console
- رسائل واضحة توضح سبب الفشل

## 📝 Logging

كل عملية إشعار تحتوي على logs تفصيلية:

```javascript
🔔 ========== MARK NOTIFICATION START (ADD) ==========
📝 Mark Details: { student: ..., exam: ..., mark: ... }
📚 Exam: [اسم الامتحان]
👤 Student: [اسم الطالب]
✅ Notification sent to student [studentId]
🔔 ========== MARK NOTIFICATION END (SUCCESS) ==========
```

## 🔧 التكامل

### مع examMarkController.js:
```javascript
// في بداية الملف
const {
  notifyMarkAdded,
  notifyMarksAdded,
  notifyMarkUpdated,
  notifyMarkDeleted,
} = require("./ExamMark/examMarkNotifications");

// في كل function:
const io = req.app.get("io");
await notifyMarkUpdated(updated, io);
```

### مع NotificationService:
- يستخدم `global.notificationService.createNotification()`
- يرسل عبر 3 قنوات: Socket.IO + Firebase + Database

### مع Frontend:
- الإشعارات تصل تلقائياً عبر `useNotificationsSocket` hook
- تظهر في `NotificationHeader` component
- لون الـ grade notifications: أزرق/أخضر (حسب التصميم)
- أيقونة: 📊

## 📱 استخدام في Frontend

```typescript
// الإشعارات تصل تلقائياً
// لا حاجة لأي كود إضافي

// Socket.IO hook يستمع للإشعارات الجديدة:
useNotificationsSocket() // في useEffect

// عند وصول إشعار:
- يظهر في NotificationHeader
- يصدر صوت تنبيه
- يزيد عداد الإشعارات غير المقروءة
```

## ✅ تم التطبيق

- ✅ إضافة علامة واحدة → إشعار فوري للطالب
- ✅ إضافة علامات متعددة → إشعار لكل طالب على حدة
- ✅ تعديل علامة → إشعار تحديث للطالب
- ✅ حذف علامة → إشعار حذف للطالب
- ✅ Socket.IO events للتحديث الفوري
- ✅ حفظ في Database
- ✅ Firebase push notifications (إذا مفعّل)

## 🧪 اختبار النظام

1. **اختبار إضافة علامة واحدة**:
   - افتح كطالب
   - دع المعلم يضيف علامة لك
   - يجب أن يصل إشعار فوراً: "📊 علامة جديدة"

2. **اختبار إضافة علامات متعددة**:
   - افتح عدة حسابات طلاب
   - دع المعلم يضيف علامات لجميع الطلاب
   - كل طالب يجب أن يستلم إشعار بعلامته

3. **اختبار تعديل علامة**:
   - المعلم يعدل علامة موجودة
   - الطالب يستلم إشعار: "✏️ تم تعديل علامتك"

4. **اختبار حذف علامة**:
   - المعلم يحذف علامة
   - الطالب يستلم إشعار: "🗑️ تم حذف علامة"

## 🔍 Troubleshooting

### الإشعارات لا تصل:
1. تأكد من أن `global.notificationService` مفعّل
2. تحقق من السيرفر logs: يجب أن ترى "✅ Notification sent"
3. تأكد من أن الطالب متصل بـ Socket.IO
4. تحقق من أن نوع "grade" موجود في Notification schema

### الإشعار يصل متأخر:
1. تحقق من سرعة الإنترنت
2. تأكد من أن Socket.IO متصل (check Frontend console)
3. قد يكون Firebase FCM معطّل (عادي، Socket.IO كافي)

## 📚 مراجع

- Notification Schema: `Backend/src/schema/Notification.js`
- NotificationService: `Backend/src/services/NotificationService.js`
- Socket.IO Setup: `Backend/src/app.js`
- Frontend Hook: `Frontend/src/Socket/useNotificationsSocket.ts`
- UI Component: `Frontend/src/components/Notifications/NotificationHeader.tsx`
