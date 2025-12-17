# 📋 دليل إشعارات الحضور والغياب

## 🎯 الوظيفة الرئيسية

عندما يرصد المعلم غياب طالب في حلقته، يتم إرسال إشعار **real-time** للطالب:
- ✅ إشعار في notification header
- ✅ إشعار push notification (FCM)
- ✅ رابط مباشر لصفحة الحضور والغياب

---

## 🔄 سير العمل (Workflow)

### 1. رصد الغياب

```
المعلم يرصد غياب طالب
    ↓
createController.js يحفظ السجل
    ↓
global.notificationService.notifyAbsence()
    ↓
AttendanceHandler.notifyAbsence()
    ↓
NotificationManager.createNotification()
    ↓
[Socket.IO] ← إشعار real-time للطالب
[FCM Push] ← إشعار push notification
```

### 2. إلغاء الغياب (تحويل إلى حضور)

```
المعلم يعدل السجل (من غياب → حضور)
    ↓
createController.js يحدث السجل
    ↓
global.notificationService.notifyAbsenceRemoved()
    ↓
AttendanceHandler.notifyAbsenceRemoved()
    ↓
NotificationManager.createNotification()
    ↓
[Socket.IO] ← إشعار real-time للطالب
[FCM Push] ← إشعار push notification
```

---

## 📦 الملفات المتضمنة

### 1. `AttendanceHandler.js`
**المسؤولية**: معالجة إشعارات الحضور والغياب

**الدوال**:
- `notifyAbsence(createNotification, studentId, date, teacherName)`
  - إرسال إشعار رصد غياب
  - النوع: `attendance`
  - الأولوية: `high`
  - الرابط: `/attendance`

- `notifyAbsenceRemoved(createNotification, studentId, date, teacherName)`
  - إرسال إشعار إلغاء غياب
  - النوع: `attendance`
  - الأولوية: `medium`
  - الرابط: `/attendance`

- `notifyBulkAbsences(createNotification, absentStudents, date, teacherName)`
  - إرسال إشعارات جماعية للغائبين
  - مفيد للإرسال الدفعي

### 2. `createController.js`
**المسؤولية**: رصد الحضور والغياب

**الكود الرئيسي** (سطر 85-112):
```javascript
// A. Notifications
if (global.notificationService) {
  const teacherName = req.user?.firstName
    ? `${req.user.firstName} ${req.user.lastName || ""}`.trim()
    : "المعلم";
  const dateStr = formattedDate.toLocaleDateString("ar-SA");

  // Notify Absents
  const absentRecords = attendanceRecords.filter(r => !r.isPresent);
  for (const record of absentRecords) {
    global.notificationService.notifyAbsence(record.studentId, dateStr, teacherName)
      .catch(e => console.error(`Notification error for ${record.studentId}:`, e.message));
  }

  // Notify Absence Removals
  for (const record of attendanceRecords) {
    const oldRecord = oldRecordsMap.get(record.studentId.toString());
    if (oldRecord && !oldRecord.isPresent && record.isPresent) {
      if (timeDiff <= ONE_WEEK) {
        global.notificationService.notifyAbsenceRemoved(record.studentId, dateStr, teacherName)
          .catch(e => console.error(`Removal notification error for ${record.studentId}:`, e.message));
      }
    }
  }
}
```

### 3. `NotificationManager.js`
**المسؤولية**: إدارة مركزية للإشعارات

**الدوال المضافة**:
```javascript
async notifyAbsence(studentId, date, teacherName) {
  return notifyAbsence(this.createNotification.bind(this), studentId, date, teacherName);
}

async notifyAbsenceRemoved(studentId, date, teacherName) {
  return notifyAbsenceRemoved(this.createNotification.bind(this), studentId, date, teacherName);
}

async notifyBulkAbsences(absentStudents, date, teacherName) {
  return notifyBulkAbsences(this.createNotification.bind(this), absentStudents, date, teacherName);
}
```

---

## 🎨 تنسيق الإشعار

### إشعار الغياب
```json
{
  "recipient": "673a1234567890abcdef1234",
  "recipientModel": "Student",
  "type": "attendance",
  "title": "⚠️ تم رصد غياب",
  "message": "تم رصد غيابك في حلقة محمد أحمد بتاريخ 12/18/2024",
  "priority": "high",
  "data": {
    "actionUrl": "/attendance",
    "actionText": "عرض سجل الحضور",
    "relatedEntityType": "attendance",
    "date": "12/18/2024",
    "teacherName": "محمد أحمد",
    "absenceType": "absence"
  }
}
```

### إشعار إلغاء الغياب
```json
{
  "recipient": "673a1234567890abcdef1234",
  "recipientModel": "Student",
  "type": "attendance",
  "title": "✅ تم تعديل الحضور",
  "message": "تم تعديل حضورك في حلقة محمد أحمد بتاريخ 12/18/2024 - أصبحت حاضراً",
  "priority": "medium",
  "data": {
    "actionUrl": "/attendance",
    "actionText": "عرض سجل الحضور",
    "relatedEntityType": "attendance",
    "date": "12/18/2024",
    "teacherName": "محمد أحمد",
    "absenceType": "removed"
  }
}
```

---

## 🔧 الميزات

### ✅ Real-time
- **Socket.IO**: إشعارات فورية بدون تحديث الصفحة
- **FCM Push**: إشعارات push حتى لو كان التطبيق مغلق

### ✅ رابط مباشر
- عند الضغط على الإشعار → يذهب مباشرة لصفحة `/attendance`
- الطالب يشاهد سجل حضوره الكامل

### ✅ معلومات مفصلة
- التاريخ بالعربي
- اسم المعلم الثلاثي
- نوع العملية (رصد/إلغاء)

### ✅ أمان
- التحقق من وجود الطالب قبل الإرسال
- معالجة الأخطاء (error handling)
- لا يتم إيقاف العملية عند فشل إرسال إشعار واحد

---

## 📊 أمثلة الاستخدام

### مثال 1: رصد غياب طالب واحد
```javascript
await global.notificationService.notifyAbsence(
  '673a1234567890abcdef1234',
  '12/18/2024',
  'محمد أحمد'
);
```

### مثال 2: إلغاء غياب طالب
```javascript
await global.notificationService.notifyAbsenceRemoved(
  '673a1234567890abcdef1234',
  '12/18/2024',
  'محمد أحمد'
);
```

### مثال 3: رصد غياب جماعي
```javascript
const absentStudents = [
  { studentId: '673a1234567890abcdef1234', name: 'أحمد محمد' },
  { studentId: '673a1234567890abcdef5678', name: 'علي خالد' }
];

await global.notificationService.notifyBulkAbsences(
  absentStudents,
  '12/18/2024',
  'محمد أحمد'
);
```

---

## 🐛 استكشاف الأخطاء

### الإشعار لا يصل للطالب

**السبب المحتمل 1**: Socket.IO غير متصل
```bash
# تحقق من:
- هل الطالب متصل بالـ Socket.IO؟
- هل global.io موجود في server.js؟
```

**السبب المحتمل 2**: معرف الطالب خاطئ
```bash
# تحقق من:
- هل studentId صحيح؟
- هل الطالب موجود في قاعدة البيانات؟
```

**السبب المحتمل 3**: global.notificationService غير موجود
```bash
# تحقق من:
- هل تم تهيئة NotificationManager في server.js؟
- هل global.notificationService = new NotificationManager(io)؟
```

### رسائل الخطأ في Console

```bash
❌ [AttendanceHandler] Student not found: 673a1234567890abcdef1234
# الحل: تحقق من معرف الطالب

❌ [AttendanceHandler] Error sending absence notification
# الحل: تحقق من اتصال قاعدة البيانات

❌ Error sending real-time notification
# الحل: تحقق من Socket.IO connection
```

---

## 📝 ملاحظات مهمة

1. **التاريخ بالعربي**: يتم تنسيقه باستخدام `toLocaleDateString("ar-SA")`
2. **اسم المعلم**: يتم جلبه من `req.user` في createController
3. **الأولوية**: غياب = `high`، إلغاء غياب = `medium`
4. **الرابط**: `/attendance` يذهب لصفحة الحضور والغياب
5. **Real-time**: يعمل فقط إذا كان الطالب متصل بـ Socket.IO

---

## 🚀 التحديثات المستقبلية

- [ ] إضافة إشعار للأهل عند رصد غياب متكرر
- [ ] إحصائيات الغياب في الإشعار
- [ ] إشعار قبل انتهاء مهلة الأسبوع للتعديل
- [ ] تقرير شهري للحضور والغياب

---

**تم التطوير بواسطة**: فريق المدرسة القرآنية  
**آخر تحديث**: ديسمبر 2024  
**الحالة**: ✅ جاهز للإنتاج
