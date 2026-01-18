# Validation Layer Documentation

## طبقة التحقق من صحة البيانات

هذا المجلد يحتوي على جميع ملفات التحقق من صحة البيانات (Validation) باستخدام مكتبة Yup.

---

## 📁 الملفات المتوفرة

### 1. `teacherValidation.ts`

التحقق من صحة بيانات المعلمين

**الحقول المطلوبة:**

- ✅ `firstName` - الاسم الأول
- ✅ `lastName` - اسم العائلة
- ✅ `idNumber` - رقم الهوية (9 أرقام)
- ✅ `phoneNumber` - رقم الهاتف (05xxxxxxxx)
- ✅ `email` - البريد الإلكتروني
- ✅ `birthDate` - تاريخ الميلاد (YYYY-MM-DD)

**الحقول الاختيارية:**

- `fatherName`, `grandFatherName`, `motherName`
- `age` - يتم حسابه تلقائياً من تاريخ الميلاد
- `gender` - ذكر/أنثى (يتم تطبيعها)
- `residence` - مكان السكن
- `groups` - الحلقات

**الدوال المصدرة:**

```typescript
// التحقق من النموذج الكامل
validateTeacherWithYup(data, isNewTeacher): Promise<ValidationResult>

// التحقق من حقل واحد
validateTeacherFieldWithYup(fieldName, value, allData, isNewTeacher): Promise<string | null>

// حساب العمر
calculateAge(birthDate: string): number

// تطبيع الجنس
normalizeGender(gender: string): string

// تنسيق التاريخ للباك اند
formatBirthDateForBackend(date): string

// تحليل التاريخ من الباك اند
parseBirthDateFromBackend(dateString): Date | null
```

---

### 2. `assistantValidation.ts`

التحقق من صحة بيانات مساعدي المدرسين

**الحقول المطلوبة:**

- ✅ `firstName` - الاسم الأول
- ✅ `lastName` - اسم العائلة
- ✅ `idNumber` - رقم الهوية (9 أرقام)
- ✅ `phoneNumber` - رقم الهاتف (05xxxxxxxx)
- ✅ `email` - البريد الإلكتروني
- ✅ `birthDate` - تاريخ الميلاد (YYYY-MM-DD)
- ✅ `password` - كلمة المرور (6 أحرف على الأقل) - **عند الإنشاء فقط**

**الحقول الاختيارية:**

- `fatherName`, `grandFatherName`, `motherName`
- `age` - يتم حسابه تلقائياً من تاريخ الميلاد
- `gender` - ذكر/أنثى (يتم تطبيعها)
- `residence` - مكان السكن
- `allowedGroups` - الحلقات المسموح بها

**الدوال المصدرة:**

```typescript
// التحقق من النموذج الكامل
validateAssistantWithYup(data, isNewAssistant): Promise<ValidationResult>

// التحقق من حقل واحد
validateAssistantFieldWithYup(fieldName, value, allData, isNewAssistant): Promise<string | null>

// حساب العمر
calculateAge(birthDate: string): number

// تطبيع الجنس
normalizeGender(gender: string): string

// تنسيق التاريخ للباك اند
formatBirthDateForBackend(date): string

// تحليل التاريخ من الباك اند
parseBirthDateFromBackend(dateString): Date | null
```

---

### 3. `profileValidation.ts`

التحقق من صحة بيانات الملفات الشخصية

يستخدم مع صفحة البروفايل لجميع أنواع المستخدمين.

---

## 🔍 قواعد التحقق المشتركة

### رقم الهوية (ID Number)

- ✅ يجب أن يتكون من **9 أرقام بالضبط**
- ✅ أرقام فقط
- ✅ فريد (يتم التحقق في الباك اند)

### رقم الهاتف (Phone Number)

- ✅ يجب أن يبدأ بـ **05**
- ✅ يتكون من **10 أرقام**
- ✅ فريد (يتم التحقق في الباك اند)

### البريد الإلكتروني (Email)

- ✅ تنسيق صحيح: `user@example.com`
- ✅ فريد (يتم التحقق في الباك اند)

### تاريخ الميلاد (Birth Date)

- ✅ تنسيق: `YYYY-MM-DD`
- ✅ لا يمكن أن يكون في المستقبل
- ✅ يتم حساب العمر تلقائياً

### الجنس (Gender)

- ✅ القيم المقبولة: `ذكر` / `أنثى` / `male` / `female`
- ✅ يتم التطبيع تلقائياً إلى `ذكر` أو `أنثى`

---

## 📝 مثال على الاستخدام

### في الـ Component:

```typescript
import {
  validateAssistantWithYup,
  validateAssistantFieldWithYup,
} from "@/Validation/assistantValidation";

// التحقق من حقل واحد عند التغيير
const handleChange = async (e) => {
  const { name, value } = e.target;
  const error = await validateAssistantFieldWithYup(
    name,
    value,
    formData,
    !isEditMode,
  );
  if (error) {
    setErrors((prev) => ({ ...prev, [name]: error }));
  }
};

// التحقق من النموذج الكامل عند الإرسال
const validateForm = async () => {
  const validation = await validateAssistantWithYup(formData, !isEditMode);
  if (!validation.isValid) {
    setErrors(validation.errors);
    return false;
  }
  return true;
};
```

### في الـ Hook:

```typescript
import { validateAssistantWithYup } from "@/Validation/assistantValidation";

export const useTeacherAssistantForm = ({ assistant, onSubmit }) => {
  const validateForm = async () => {
    const validation = await validateAssistantWithYup(formData, !assistant);

    if (!validation.isValid) {
      setErrors(validation.errors);
      return false;
    }

    return true;
  };

  return { validateForm /* ... */ };
};
```

---

## 🔄 التطابق مع الـ Backend

جميع ملفات الـ validation في الـ Frontend متطابقة 100% مع:

- ✅ `Backend/src/Validation/Teacher/TeacherValidation.js`
- ✅ `Backend/src/Validation/TeacherAssistant/AssistantValidation.js`

هذا يضمن:

- 📌 عدم وجود تناقضات بين Frontend و Backend
- 📌 رسائل خطأ موحدة
- 📌 تجربة مستخدم متسقة

---

## ⚠️ ملاحظات مهمة

1. **التحقق من التكرار (Duplicate Check)**
   - يتم في الـ Backend عبر API `/check-duplicate`
   - يجب عمل debounce للطلبات (500ms)
   - يتم التحقق من: `email`, `phoneNumber`, `idNumber`

2. **كلمة المرور**
   - مطلوبة فقط عند **الإنشاء** (isNewAssistant = true)
   - اختيارية عند **التعديل** (يمكن تركها فارغة)
   - الحد الأدنى: 6 أحرف

3. **الحلقات (Groups)**
   - يجب اختيار حلقة واحدة على الأقل
   - يتم تحويل array من IDs إلى array من Objects للتحقق

4. **العمر (Age)**
   - يتم حسابه تلقائياً من `birthDate`
   - لا حاجة لإدخاله يدوياً

---

## 🎯 الأخطاء الشائعة

### رقم الهوية

```
"رقم الهوية يجب أن يتكون من 9 أرقام فقط"
"رقم الهوية موجود بالفعل"
```

### رقم الهاتف

```
"الرقم يجب أن يبدأ بـ 05 ويتكوّن من 10 أرقام"
"رقم الهاتف موجود بالفعل"
```

### البريد الإلكتروني

```
"صيغة البريد الإلكتروني غير صحيحة"
"البريد الإلكتروني موجود بالفعل"
```

### كلمة المرور

```
"كلمة المرور مطلوبة"
"كلمة المرور يجب أن تحتوي على 6 أحرف على الأقل"
```

---

## 📚 المراجع

- [Yup Documentation](https://github.com/jquense/yup)
- [React Hook Form with Yup](https://react-hook-form.com/get-started#SchemaValidation)
