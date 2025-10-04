# نظام التحقق من التكرار - دليل المطور

## نظرة عامة

تم تطبيق نظام موحد للتحقق من عدم تكرار الحقول الحساسة عبر جميع أنواع المستخدمين في النظام.

## الحقول المحمية من التكرار

- **رقم الهاتف (phoneNumber)**: لا يمكن أن يتكرر عبر الطلاب، المعلمين، والمديرين
- **البريد الإلكتروني (email)**: لا يمكن أن يتكرر عبر الطلاب، المعلمين، والمديرين  
- **رقم الهوية/الرقم الوطني (idNumber)**: لا يمكن أن يتكرر عبر الطلاب، المعلمين، والمديرين

## الملفات المحدثة

### 1. دالة التحقق الموحدة
**الملف**: `src/utils/duplicateChecker.js`

```javascript
const { validateAndCheckDuplicates } = require("../utils/duplicateChecker");

// للإضافة (بدون استثناء)
const hasDuplicates = await validateAndCheckDuplicates(req, res, { 
  idNumber, phoneNumber, email 
});
if (hasDuplicates) return;

// للتحديث (مع استثناء المستخدم الحالي)
const hasDuplicates = await validateAndCheckDuplicates(req, res, { 
  idNumber, phoneNumber, email 
}, userId, 'student'); // أو 'teacher' أو 'admin'
if (hasDuplicates) return;
```

### 2. Controllers المحدثة

#### `src/controllers/studentController.js`
- ✅ `createStudent`: التحقق من التكرار عند الإضافة
- ✅ `updateStudent`: التحقق من التكرار عند التحديث مع استثناء الطالب المحدث

#### `src/controllers/teacherController.js` 
- ✅ `createTeacher`: التحقق من التكرار عند الإضافة
- ✅ `updateTeacher`: التحقق من التكرار عند التحديث مع استثناء المعلم المحدث

#### `src/controllers/adminController.js`
- ✅ `createAdmin`: التحقق من التكرار عند الإضافة  
- ✅ `updateAdmin`: التحقق من التكرار عند التحديث مع استثناء المدير المحدث

## كيفية عمل النظام

### 1. عند إضافة مستخدم جديد
```javascript
// في createStudent, createTeacher, createAdmin
const { idNumber, phoneNumber, email } = req.body;
const hasDuplicates = await validateAndCheckDuplicates(req, res, { 
  idNumber, phoneNumber, email 
});
if (hasDuplicates) return; // يتم إيقاف العملية وإرجاع رسالة خطأ
```

### 2. عند تحديث مستخدم موجود
```javascript
// في updateStudent, updateTeacher, updateAdmin
const { idNumber, phoneNumber, email } = updates;
const hasDuplicates = await validateAndCheckDuplicates(req, res, { 
  idNumber, phoneNumber, email 
}, id, 'student'); // استثناء المستخدم الحالي
if (hasDuplicates) return;
```

## رسائل الخطأ

النظام يرجع رسائل خطأ واضحة تحدد:
- نوع الحقل المكرر
- القيمة المكررة
- نوع المستخدم الموجود (طالب/معلم/مدير)
- اسم المستخدم الموجود

مثال على رسالة الخطأ:
```json
{
  "success": false,
  "message": "رقم الهاتف \"0500000000\" مُستخدم بالفعل لمعلم في النظام",
  "field": "phoneNumber", 
  "duplicateValue": "0500000000",
  "existingUserType": "معلم",
  "existingUserName": "أحمد محمد"
}
```

## اختبار النظام

لاختبار النظام، يمكن استخدام:
```bash
# تشغيل اختبار التكرار
node src/utils/testDuplicateChecker.js
```

## الميزات

1. **شامل**: يتحقق عبر جميع جداول المستخدمين
2. **ذكي**: يستثني المستخدم الحالي عند التحديث  
3. **واضح**: رسائل خطأ مفصلة ومفيدة
4. **آمن**: يتعامل مع الأخطاء بطريقة آمنة
5. **سريع**: استخدام Promise.all للاستعلامات المتوازية

## ملاحظات للمطورين

- النظام يتعامل مع القيم الفارغة (null/undefined) بأمان
- لا يتم التحقق من الحقول الفارغة
- يدعم جميع عمليات CRUD
- يمكن توسيعه لحقول أخرى في المستقبل
- يحافظ على الأداء باستخدام الاستعلامات المتوازية

## التحقق من الصحة

تأكد من اختبار الحالات التالية:
- ✅ إضافة مستخدم بحقول فريدة (يجب أن ينجح)
- ✅ إضافة مستخدم بحقل مكرر (يجب أن يفشل)
- ✅ تحديث مستخدم بدون تغيير الحقول الفريدة (يجب أن ينجح) 
- ✅ تحديث مستخدم بحقل مكرر لمستخدم آخر (يجب أن يفشل)
- ✅ تحديث مستخدم بحقوله الحالية (يجب أن ينجح - استثناء النفس)

---

**تاريخ التحديث**: أكتوبر 2025  
**المطور**: النظام الموحد لإدارة المدرسة القرآنية