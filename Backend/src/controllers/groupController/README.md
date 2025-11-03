# Group Controller Module

هذا المجلد يحتوي على جميع العمليات المتعلقة بإدارة الحلقات (Groups) مقسمة إلى ملفات منفصلة لسهولة الصيانة والتطوير.

## 📁 البنية (Structure)

```
groupController/
├── index.js              # الملف الرئيسي الذي يجمع جميع العمليات
├── cache.js              # دوال الـ Cache وإدارة عدد الطلاب
├── helpers.js            # دوال مساعدة (Helper Functions)
├── createGroup.js        # عمليات إنشاء الحلقات (CREATE)
├── getGroups.js          # عمليات قراءة الحلقات (READ)
├── updateGroup.js        # عمليات تحديث الحلقات (UPDATE)
└── deleteGroup.js        # عمليات حذف الحلقات (DELETE)
```

## 📝 الملفات ووظائفها

### 1. **index.js**
الملف الرئيسي الذي يستورد ويصدر جميع الدوال من الملفات الأخرى.

**الصادرات:**
- `createGroup`
- `getAllGroups`
- `getGroupById`
- `getGroupsByTeacher`
- `getGroupsMonthlyStats`
- `updateGroup`
- `renameGroup`
- `deleteGroup`
- `invalidateStudentCountsCache`

---

### 2. **cache.js**
يحتوي على دوال إدارة الـ Cache لتحسين الأداء.

**الدوال:**
- `getStudentCountsForAllGroups()` - جلب عدد الطلاب لجميع الحلقات مع caching
- `getStudentCountsForTeacher(teacherName)` - جلب عدد الطلاب لمعلم محدد
- `invalidateStudentCountsCache()` - إبطال الـ cache عند تعديل البيانات

**Features:**
- Cache بسيط مع TTL = 60 ثانية
- Aggregation Pipeline للأداء العالي
- يمكن استبداله بـ Redis في الإنتاج

---

### 3. **helpers.js**
دوال مساعدة تستخدم في العمليات المختلفة.

**الدوال:**
- `findTeacherByIdOrName(teacherIdentifier)` - البحث عن معلم بالـ ID أو الاسم
- `checkGroupTeacherConflict(groupName, teacherId, excludeGroupId)` - التحقق من تضارب الحلقات
- `getTeacherInfo(teacherId)` - الحصول على معلومات المعلم بصيغ مختلفة

---

### 4. **createGroup.js**
عمليات إنشاء الحلقات الجديدة.

**الدوال:**
- `createGroup(req, res)` - إنشاء حلقة جديدة

**العمليات:**
- التحقق من عدم تكرار اسم الحلقة
- التحقق من وجود المعلم
- التحقق من عدم تضارب المعلم مع حلقة أخرى
- إنشاء الحلقة وربطها بالمعلم
- إرسال Socket Event للتحديثات الفورية

---

### 5. **getGroups.js**
عمليات قراءة وجلب بيانات الحلقات.

**الدوال:**
- `getAllGroups(req, res)` - جلب جميع الحلقات مع معلومات المعلمين والطلاب
- `getGroupById(req, res)` - جلب حلقة محددة بالـ ID
- `getGroupsByTeacher(req, res)` - جلب حلقات معلم محدد
- `getGroupsMonthlyStats(req, res)` - جلب إحصائيات الحلقات الشهرية

**Features:**
- استخدام Cache لتحسين الأداء
- حساب السعة والنسب المئوية
- جلب معلومات المعلمين بشكل تلقائي

---

### 6. **updateGroup.js**
عمليات تحديث بيانات الحلقات.

**الدوال:**
- `updateGroup(req, res)` - تحديث بيانات حلقة موجودة
- `renameGroup(req, res)` - إعادة تسمية حلقة وتحديث جميع الطلاب المرتبطين

**العمليات:**
- التحقق من القيود عند تغيير المعلم أو الاسم
- تحديث السعة والمعلومات
- تحديث الطلاب المرتبطين
- إبطال Cache بعد التحديث

---

### 7. **deleteGroup.js**
عمليات حذف الحلقات.

**الدوال:**
- `deleteGroup(req, res)` - حذف حلقة نهائياً من قاعدة البيانات

**العمليات:**
- إزالة الحلقة من جميع الطلاب المرتبطين
- إزالة الحلقة من المعلمين المرتبطين
- حذف الحلقة من قاعدة البيانات
- إبطال Cache بعد الحذف
- إرسال Socket Event للتحديثات الفورية

---

## 🔄 كيفية الاستخدام

في الملفات الأخرى، يمكنك استيراد الدوال بهذا الشكل:

```javascript
// استيراد من الملف الرئيسي
const groupController = require('./controllers/groupController');

// أو استيراد دالة محددة
const { createGroup, getAllGroups } = require('./controllers/groupController');
```

---

## 🚀 المزايا

1. **تنظيم أفضل**: كل ملف يحتوي على عمليات متعلقة ببعضها
2. **سهولة الصيانة**: تعديل ملف واحد دون التأثير على الباقي
3. **قابلية التوسع**: إضافة ميزات جديدة بسهولة
4. **وضوح الكود**: أسماء ملفات واضحة ومنطقية
5. **إعادة الاستخدام**: دوال مساعدة يمكن استخدامها في أكثر من مكان

---

## 📊 Performance Optimization

- استخدام Aggregation Pipeline لحساب الطلاب
- Cache بسيط لتقليل الاستعلامات
- Promise.all للعمليات المتوازية
- يمكن التطوير باستخدام Redis للـ Cache

---

## 🔗 الروابط

- [Group Schema](../../schema/Group.js)
- [Teacher Schema](../../schema/Teacher.js)
- [Student Schema](../../schema/Student.js)
- [Group Routes](../../routes/groupRoutes.js)
