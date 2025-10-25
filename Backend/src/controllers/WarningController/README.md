# Warning Controller - دليل الإنذارات

## 📁 البنية الجديدة

تم إعادة تنظيم نظام الإنذارات إلى بنية معيارية محسنة:

```
Backend/src/
├── controllers/
│   └── WarningController/
│       ├── index.js                 # نقطة الدخول الرئيسية
│       ├── createWarning.js         # عمليات إنشاء الإنذارات
│       ├── getWarnings.js           # عمليات جلب الإنذارات
│       ├── deleteWarning.js         # عمليات حذف الإنذارات
│       ├── warningStatistics.js     # إحصائيات الإنذارات
│       └── studentStatus.js         # التحقق من حالة الطالب
└── routes/
    └── WarningRoutes/
        └── WarningRoutes.js         # تعريف المسارات
```

## 📋 الملفات والوظائف

### 1. **createWarning.js**

عمليات إنشاء الإنذارات:

- `createWarning` - إنشاء إنذار جديد للطالب

**Features:**

- التحقق من وجود الطالب والحلقة
- منع الإنذارات المكررة من نفس النوع
- معالجة حالة الفصل النهائي (إزالة الطالب من الحلقة)
- إشعارات Socket للتحديثات الفورية

### 2. **getWarnings.js**

عمليات جلب الإنذارات:

- `getStudentWarnings` - جلب إنذارات طالب معين
- `getGroupWarnings` - جلب إنذارات حلقة معينة
- `getGroupStudentsWithWarnings` - جلب طلاب الحلقة مع عدد إنذارات كل طالب

### 3. **deleteWarning.js**

عمليات حذف الإنذارات:

- `deleteWarning` - حذف إنذار معين

**Features:**

- إعادة الطالب للحلقة عند حذف إنذار الفصل النهائي
- إشعارات Socket للتحديثات

### 4. **warningStatistics.js**

إحصائيات الإنذارات:

- `getWarningsStatistics` - إحصائيات شاملة لجميع الإنذارات (للمدير)
- `getTeacherStatistics` - إحصائيات خاصة بالمعلم

**Statistics Include:**

- إجمالي الإنذارات
- الإنذارات حسب النوع
- عدد الطلاب المفصولين
- أكثر الأسباب تكراراً
- الإنذارات حسب الحلقة
- آخر الإنذارات

### 5. **studentStatus.js**

التحقق من حالة الطالب:

- `checkStudentStatus` - التحقق من حالة الطالب (مفصول/محظور)

**Returns:**

- حالة الفصل النهائي
- حالة الفصل المؤقت
- حالة الحظر من الأنشطة (دائم/مؤقت)

## 🛣️ المسارات (Routes)

### GET Routes

```javascript
GET /api/warnings/statistics/all          // إحصائيات عامة (للمدير)
GET /api/warnings/statistics/teacher      // إحصائيات المعلم
GET /api/warnings/status/:studentId       // حالة الطالب
GET /api/warnings/student/:studentId      // إنذارات الطالب
GET /api/warnings/group/:groupId/students // طلاب الحلقة مع الإنذارات
GET /api/warnings/group/:groupId          // إنذارات الحلقة
```

### POST Routes

```javascript
POST / api / warnings; // إنشاء إنذار جديد
```

### DELETE Routes

```javascript
DELETE /api/warnings/:warningId           // حذف إنذار
```

## 🔐 Authentication

جميع المسارات محمية بـ `protect` middleware وتتطلب authentication.

## 📊 أنواع الإنذارات

1. **warning** - تنبيه (يمكن تكراره)
2. **first** - الإنذار الأول
3. **second** - الإنذار الثاني (حظر مؤقت من الأنشطة - شهر واحد)
4. **third** - الإنذار الثالث (حظر دائم من الأنشطة)
5. **expulsion** - الفصل النهائي (إزالة من الحلقة)

## 🔄 Socket Events

يتم إرسال الإشعارات التالية عبر Socket.io:

- `warningCreated` - عند إنشاء إنذار جديد
- `warningDeleted` - عند حذف إنذار

**Room:** `warnings`

## 💡 ملاحظات مهمة

1. **منع التكرار:** لا يمكن إعطاء نفس الإنذار مرتين (ما عدا التنبيهات)
2. **الفصل النهائي:** عند إنشاء إنذار فصل نهائي، يتم:
   - تعيين `student.group = null`
   - تعيين `student.isActive = false`
   - إزالة الطالب من `group.students`
3. **حذف الفصل:** عند حذف إنذار فصل نهائي، يتم إعادة الطالب للحلقة تلقائياً
4. **التحقق من الصلاحيات:** يتم التحقق من أن المعلم يدرس الحلقة قبل السماح بعرض الإنذارات

## 🚀 الاستخدام

```javascript
// في أي ملف controller أو route
const warningController = require("../controllers/WarningController");

// استخدام أي function
router.post("/warnings", protect, warningController.createWarning);
```

## 📝 مثال على Request Body

### إنشاء إنذار جديد

```json
{
  "studentId": "507f1f77bcf86cd799439011",
  "teacherId": "507f191e810c19729de860ea",
  "groupId": "507f191e810c19729de860eb",
  "type": "first",
  "reason": "التأخر المتكرر"
}
```

## ✅ التحسينات

- ✨ كود منظم ومقسم منطقياً
- 📝 تعليقات واضحة بالعربية
- 🔄 إدارة أفضل للـ Socket events
- 🛡️ معالجة شاملة للأخطاء
- 📊 إحصائيات مفصلة ومفيدة

---

تم التحديث: أكتوبر 2025
