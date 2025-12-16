# Validation - دليل التحقق من صحة البيانات

هذا المجلد يحتوي على جميع ملفات التحقق من صحة البيانات (Validation) للتطبيق المحمول.

## 📋 الملفات المتوفرة

### ملفات التحقق الأساسية:

- **activityValidation.ts** - التحقق من بيانات الأنشطة
- **AdminValdation.ts** - التحقق من بيانات المشرفين
- **ChangePassValdation.ts** - التحقق من تغيير كلمة المرور
- **dailyMarksValidation.ts** - التحقق من العلامات اليومية
- **forgotPasswordValidation.ts** - التحقق من استعادة كلمة المرور
- **groupValidation.ts** - التحقق من بيانات الحلقات
- **imageValidation.ts** - التحقق من الصور
- **NewsValidation.ts** - التحقق من الأخبار
- **profileValidation.ts** - التحقق من الملف الشخصي
- **reportValidation.ts** - التحقق من التقارير
- **studentValidation.ts** - التحقق من بيانات الطلاب
- **teacherValidation.ts** - التحقق من بيانات المعلمين
- **timetableValidation.ts** - التحقق من الجدول الزمني
- **warningValidation.ts** - التحقق من الإنذارات

### مجلد ExamSchedule:

- **examValidation.ts** - التحقق من جدول الامتحانات
- **markValidation.ts** - التحقق من علامات الامتحانات
- **index.ts** - ملف تجميع exports

## 🚀 التثبيت المطلوب

قبل استخدام ملفات الـ Validation، يجب تثبيت المكتبات المطلوبة:

```bash
npm install yup
# أو
yarn add yup
```

## 📖 طريقة الاستخدام

### 1. استيراد Validation معينة:

```typescript
import {
  studentValidationSchema,
  validateStudentWithYup,
} from "@/Validation/studentValidation";
```

### 2. استخدام Schema للتحقق:

```typescript
// مثال على التحقق من بيانات طالب
const studentData = {
  firstName: "محمد",
  fatherName: "أحمد",
  grandFatherName: "علي",
  lastName: "السعيد",
  motherName: "فاطمة",
  idNumber: "123456789",
  group: "حلقة 1",
};

try {
  const result = await validateStudentWithYup(studentData, true); // true = طالب جديد
  if (result.isValid) {
    console.log("البيانات صحيحة ✅");
  } else {
    console.log("أخطاء:", result.errors);
  }
} catch (error) {
  console.error("خطأ في التحقق:", error);
}
```

### 3. التحقق من حقل واحد (Real-time validation):

```typescript
import { validateField } from "@/Validation/studentValidation";

const error = await validateField("firstName", "محمد", {}, true);
if (error) {
  console.log("خطأ في الاسم الأول:", error);
}
```

### 4. استخدام Image Validation:

```typescript
import { validateImage, ImageAsset } from "@/Validation/imageValidation";

const image: ImageAsset = {
  uri: "file:///path/to/image.jpg",
  type: "image/jpeg",
  fileSize: 2048000, // 2MB
  fileName: "image.jpg",
};

const result = validateImage(image, {
  maxSizeMB: 5,
  allowedTypes: ["image/jpeg", "image/png"],
});

if (!result.valid) {
  console.log("خطأ في الصورة:", result.error);
}
```

## 🎯 ميزات خاصة

### 1. التحقق المتطابق مع Backend

جميع ملفات الـ Validation متطابقة مع قواعد Backend validation لضمان الاتساق.

### 2. رسائل الأخطاء بالعربية

جميع رسائل الأخطاء مكتوبة باللغة العربية لسهولة الفهم.

### 3. دعم React Native

الملفات معدلة للعمل مع React Native وتدعم:

- Image Picker assets
- Async Storage
- Platform-specific validations

## 📝 ملاحظات مهمة

1. **yup library**: تأكد من تثبيت مكتبة yup قبل الاستخدام
2. **TypeScript**: جميع الملفات مكتوبة بـ TypeScript مع Types كاملة
3. **Async Validation**: معظم دوال التحقق async لدعم Complex validations
4. **Schema Reusability**: يمكن استخدام الـ schemas مع React Hook Form أو Formik

## 🔧 التخصيص

يمكنك تخصيص قواعد التحقق حسب احتياجاتك:

```typescript
import * as yup from "yup";

// إنشاء schema مخصصة
const customSchema = yup.object({
  customField: yup.string().required("الحقل مطلوب"),
});
```

## 🐛 معالجة الأخطاء

جميع دوال التحقق تُرجع object يحتوي على:

- `isValid`: boolean - هل البيانات صحيحة
- `errors`: Record<string, string> - object يحتوي على الأخطاء

```typescript
const { isValid, errors } = await validateStudentWithYup(data);

if (!isValid) {
  // عرض الأخطاء للمستخدم
  Object.keys(errors).forEach((field) => {
    console.log(`${field}: ${errors[field]}`);
  });
}
```

## 📚 مصادر إضافية

- [Yup Documentation](https://github.com/jquense/yup)
- [React Hook Form with Yup](https://react-hook-form.com/get-started#SchemaValidation)
- Backend Validation في: `Backend/src/Validation/`

## 💡 نصائح

1. استخدم `validateField` للتحقق في الوقت الفعلي (on blur/on change)
2. استخدم `validate[Model]WithYup` للتحقق عند الإرسال (on submit)
3. تأكد من تطابق القواعد مع Backend validation
4. استخدم TypeScript types المُعرفة لضمان Type safety
