# 📚 نظام إشعارات المقاطع - Section Notifications System

## نظرة عامة

تم إضافة نظام إشعارات شامل للمقاطع يرسل إشعارات تلقائية لجميع الطلاب في الحلقة عند أي عملية على المقاطع.

---

## ✨ الميزات المضافة

### 1️⃣ إشعار إضافة مقطع جديد 📚
**متى يُرسل:** عند إضافة مقطع جديد  
**المستلمون:** جميع طلاب الحلقة المحددة

**محتوى الإشعار:**
```
العنوان: 📚 مقطع جديد
الرسالة: تم إضافة مقطع جديد بتاريخ [التاريخ]
         الحفظ: [مقطع الحفظ]
         المراجعة: [مقطع المراجعة]
```

**البيانات المرفقة:**
- معرف المقطع
- تاريخ المقطع
- مقطع الحفظ
- مقطع المراجعة
- الحلقة
- المعلم

---

### 2️⃣ إشعار تعديل مقطع ✏️
**متى يُرسل:** عند تعديل مقطع موجود  
**المستلمون:** جميع طلاب الحلقة

**محتوى الإشعار:**
```
العنوان: ✏️ تم تعديل مقطع
الرسالة: تم تعديل المقطع بتاريخ [التاريخ]
         [التغييرات التي تمت]
```

**البيانات المرفقة:**
- البيانات الجديدة
- البيانات القديمة (للمقارنة)

---

### 3️⃣ إشعار حذف مقطع 🗑️
**متى يُرسل:** عند حذف مقطع  
**المستلمون:** جميع طلاب الحلقة

**محتوى الإشعار:**
```
العنوان: 🗑️ تم حذف مقطع
الرسالة: تم حذف المقطع بتاريخ [التاريخ]
         الحفظ: [مقطع الحفظ]
         المراجعة: [مقطع المراجعة]
```

---

## 🔧 التكامل مع النظام

### الملفات المعدلة:

#### 1. `sectionController.js`
```javascript
// تم إضافة استيراد وظائف الإشعارات
const { 
  notifySectionAdded, 
  notifySectionUpdated, 
  notifySectionDeleted 
} = require("./sectionNotifications");

// في createSection
const io = req.app.get("io");
if (io && newSection.group) {
  await notifySectionAdded(newSection, io);
}

// في updateSection
const io = req.app.get("io");
if (io && updatedSection.group) {
  await notifySectionUpdated(updatedSection, oldSection, io);
}

// في deleteSection
const io = req.app.get("io");
if (io && section.group) {
  await notifySectionDeleted(section, io);
}
```

#### 2. `sectionNotifications.js` (ملف جديد)
يحتوي على جميع وظائف إرسال الإشعارات:
- `notifySectionAdded()` - إشعار الإضافة
- `notifySectionUpdated()` - إشعار التعديل
- `notifySectionDeleted()` - إشعار الحذف
- `notifyStudentAboutSection()` - إشعار طالب محدد

---

## 📊 آلية العمل

### 1. جلب الطلاب
```javascript
const students = await Student.find({ group: section.group });
```
يتم جلب جميع الطلاب في الحلقة المحددة.

### 2. إنشاء الإشعارات
```javascript
const notifications = [];
for (const student of students) {
  const notificationData = {
    recipient: student._id,
    recipientModel: "Student",
    type: "assignment",
    title: "...",
    message: "...",
    data: { ... },
    priority: "high/medium",
    isRead: false,
  };
  notifications.push(notificationData);
}
```

### 3. حفظ في قاعدة البيانات
```javascript
await Notification.insertMany(notifications);
```
جميع الإشعارات تُحفظ دفعة واحدة (Bulk Insert) لتحسين الأداء.

### 4. إرسال عبر Socket.IO
```javascript
io.to(`student_${student._id}`).emit("newNotification", notificationData);
```
كل طالب يستقبل الإشعار فوراً عبر WebSocket.

---

## 🎯 أنواع الإشعارات

| النوع | Priority | الأيقونة | اللون |
|------|----------|---------|-------|
| إضافة مقطع | high | 📚 | أزرق |
| تعديل مقطع | medium | ✏️ | برتقالي |
| حذف مقطع | medium | 🗑️ | أحمر |

---

## 🔐 الأمان والتحقق

### التحقق من البيانات:
```javascript
if (!students || students.length === 0) {
  console.log("⚠️ No students found in group:", section.group);
  return;
}
```

### معالجة الأخطاء:
```javascript
try {
  // ... code
} catch (error) {
  console.error("❌ Error in notifySectionAdded:", error);
}
```
جميع الأخطاء يتم تسجيلها ولا تؤثر على سير العمليات الأساسية.

---

## 📱 استقبال الإشعارات في Frontend

### Socket Event:
```typescript
socket.on("newNotification", (notification) => {
  // عرض الإشعار للمستخدم
  showNotification(notification);
  
  // تحديث قائمة الإشعارات
  updateNotificationsList();
});
```

---

## 🧪 اختبار النظام

### 1. إضافة مقطع:
```bash
POST /api/sections
{
  "date": "2025-10-24",
  "memorizationSection": "البقرة 1-10",
  "reviewSection": "الفاتحة 1-7",
  "group": "حلقة النور",
  "teacher": "أحمد محمد"
}
```

**النتيجة المتوقعة:**
- ✅ يتم إنشاء المقطع
- ✅ يُرسل إشعار لجميع طلاب "حلقة النور"
- ✅ يظهر الإشعار فوراً في تطبيق الطلاب

### 2. تعديل مقطع:
```bash
PUT /api/sections/:id
{
  "memorizationSection": "البقرة 1-15"
}
```

**النتيجة المتوقعة:**
- ✅ يتم تعديل المقطع
- ✅ يُرسل إشعار التعديل لجميع الطلاب
- ✅ يتضمن الإشعار التغييرات التي تمت

### 3. حذف مقطع:
```bash
DELETE /api/sections/:id
```

**النتيجة المتوقعة:**
- ✅ يُرسل إشعار الحذف أولاً
- ✅ يتم حذف المقطع وجميع علاماته
- ✅ يستقبل الطلاب إشعار الحذف

---

## 📈 الأداء

### تحسينات الأداء:
1. **Bulk Insert**: حفظ جميع الإشعارات دفعة واحدة
2. **Async Operations**: العمليات غير متزامنة لا تعيق سير الـ API
3. **Error Handling**: الأخطاء لا توقف العمليات الرئيسية
4. **Socket Rooms**: استخدام Rooms للإرسال المباشر

### أرقام متوقعة:
- **30 طالب**: ~100ms لإرسال جميع الإشعارات
- **100 طالب**: ~300ms لإرسال جميع الإشعارات
- **Database Insert**: O(1) - عملية واحدة للجميع

---

## 🛠️ الصيانة والتطوير

### لإضافة نوع إشعار جديد:

1. أنشئ دالة جديدة في `sectionNotifications.js`:
```javascript
exports.notifyNewType = async (section, io) => {
  // ... logic
};
```

2. استدعها في `sectionController.js`:
```javascript
const io = req.app.get("io");
await notifyNewType(section, io);
```

### لتخصيص الرسائل:
عدّل محتوى `message` في الدالة المناسبة:
```javascript
message: `رسالتك المخصصة هنا ${variable}`,
```

---

## 🎉 الخلاصة

تم إضافة نظام إشعارات شامل ومتكامل:
- ✅ **إشعارات تلقائية** لجميع العمليات
- ✅ **إرسال جماعي** لجميع طلاب الحلقة
- ✅ **فوري عبر Socket.IO**
- ✅ **محفوظ في قاعدة البيانات**
- ✅ **معالجة أخطاء قوية**
- ✅ **أداء عالي ومحسّن**

الطلاب الآن سيستقبلون إشعارات فورية عند أي تغيير على المقاطع! 🚀
