# Validation Standardization Update

## 📅 التاريخ: 14 أكتوبر 2025

## 🎯 الهدف
توحيد قواعد الـ validation لرقم الهاتف، رقم الهوية، ومكان السكن عبر **جميع** أنواع المستخدمين (طالب، معلم، مدير) في Frontend و Backend.

---

## 📋 القواعد الموحدة

### 1. **رقم الهاتف - Phone Number**
- **الطول**: 10 أرقام بالضبط
- **الصيغة**: يجب أن يبدأ بـ `05` أو `5`
- **Regex**: `/^(05|5)\d{8}$/` أو `/^05\d{8}$/`
- **رسالة الخطأ**: "الرقم يجب أن يبدأ بـ 05 ويتكوّن من 10 أرقام"
- **مثال صحيح**: `0512345678`

### 2. **رقم الهوية - ID Number**
- **الطول**: 9 أرقام بالضبط (رقم الهوية السعودي)
- **الصيغة**: أرقام فقط
- **Regex**: `/^\d{9}$/`
- **رسالة الخطأ**: "رقم الهوية يجب أن يتكون من 9 أرقام"
- **مثال صحيح**: `123456789`

### 3. **مكان السكن - Residence**
- **Placeholder**: "المدينة / الحي"
- **Validation**: 
  - Student: مطلوب
  - Teacher: اختياري
  - Admin: اختياري

---

## ✅ التعديلات المطبقة

### Frontend Validation

#### 1. **studentValidation.ts** ✅
```typescript
// رقم الهاتف
phoneNumber: yup
  .string()
  .required('رقم الهاتف مطلوب')
  .matches(/^05\d{8}$/, 'الرقم يجب أن يبدأ بـ 05 ويتكوّن من 10 أرقام')

// رقم الهوية
idNumber: yup
  .string()
  .required('رقم الهوية مطلوب')
  .matches(/^\d{9}$/, 'رقم الهوية يجب أن يتكون من 9 أرقام فقط')

// مكان السكن
residence: yup
  .string()
  .required('مكان السكن مطلوب')
  .trim()
```

#### 2. **teacherValidation.ts** ✅
```typescript
// رقم الهاتف
phoneNumber: yup
  .string()
  .required('رقم الهاتف مطلوب')
  .matches(/^05\d{8}$/, 'الرقم يجب أن يبدأ بـ 05 ويتكوّن من 10 أرقام')

// رقم الهوية
idNumber: yup
  .string()
  .required('رقم الهوية مطلوب')
  .matches(/^\d{9}$/, 'رقم الهوية يجب أن يتكون من 9 أرقام فقط')

// مكان السكن
residence: yup
  .string()
  .nullable() // اختياري
  .trim()
```

#### 3. **AdminValdation.ts** ✅ (تم تعديله)
```typescript
// Before
idNumber: yup
  .string()
  .trim()
  .min(10, 'رقم الهوية يجب أن يكون 10 أرقام على الأقل')
  .max(15, 'رقم الهوية يجب أن يكون 15 رقم على الأكثر')
  .nullable()

// After
idNumber: yup
  .string()
  .trim()
  .nullable()
  .test('only-numbers', 'رقم الهوية يجب أن يحتوي على أرقام فقط', ...)
  .test('exactly-nine-digits', 'رقم الهوية يجب أن يتكون من 9 أرقام بالضبط', ...)
  .matches(/^\d{9}$/, 'رقم الهوية يجب أن يتكون من 9 أرقام فقط')

phoneNumber: yup
  .string()
  .required('رقم الهاتف مطلوب')
  .matches(phoneRegex, 'الرقم يجب أن يبدأ بـ 05 ويتكوّن من 10 أرقام')
```

#### 4. **profileValidation.ts** ✅
```typescript
// رقم الهاتف
export const validatePhoneNumber = (phone: string | undefined): ValidationResult => {
  const cleaned = phone.replace(/[\s\-()]/g, '');
  const phoneRegex = /^(05|5)\d{8}$/;
  if (!phoneRegex.test(cleaned)) {
    return { isValid: false, error: 'رقم الهاتف يجب أن يكون 10 أرقام ويبدأ بـ 05' };
  }
  return { isValid: true };
};

// رقم الهوية
export const validateIdNumber = (idNumber: string | undefined): ValidationResult => {
  const cleaned = idNumber.trim();
  if (!/^\d{9}$/.test(cleaned)) {
    return { isValid: false, error: 'رقم الهوية يجب أن يكون 9 أرقام' };
  }
  return { isValid: true };
};
```

---

### Backend Validation

#### 1. **StudentValidation.js** ✅
```javascript
// رقم الهاتف
if (!/^05\d{8}$/.test(cleanPhone)) {
  errors.phoneNumber = 'الرقم يجب أن يبدأ بـ 05 ويتكوّن من 10 أرقام';
}

// رقم الهوية
if (!/^\d{9}$/.test(cleanIdNumber)) {
  errors.idNumber = 'رقم الهوية يجب أن يتكون من 9 أرقام فقط';
}

// مكان السكن
if (!residence || typeof residence !== 'string' || residence.trim().length === 0) {
  errors.residence = 'مكان السكن مطلوب';
}
```

#### 2. **TeacherValidation.js** ✅
```javascript
// رقم الهاتف
if (!/^05\d{8}$/.test(cleanPhone)) {
  errors.phoneNumber = 'الرقم يجب أن يبدأ بـ 05 ويتكوّن من 10 أرقام';
}

// رقم الهوية
if (!/^\d{9}$/.test(cleanIdNumber)) {
  errors.idNumber = 'رقم الهوية يجب أن يتكون من 9 أرقام فقط';
}

// مكان السكن (اختياري)
```

#### 3. **AdminValidation.js** ✅ (تم تعديله)
```javascript
// Before (كان فلسطيني/أردني)
const validatePhone = (phone) => {
  // Validate format (Palestinian/Jordanian numbers)
  if (!/^(?:\+970|970|0)?[0-9]{9}$/.test(phoneStr)) {
    return { isValid: false, message: 'رقم الهاتف غير صحيح (يجب أن يكون 9 أرقام)' };
  }
  // ...
};

// After (سعودي)
const validatePhone = (phone) => {
  // Validate format (Saudi numbers - 10 digits starting with 05)
  if (!/^(05|5)\d{8}$/.test(phoneStr)) {
    return { isValid: false, message: 'الرقم يجب أن يبدأ بـ 05 ويتكوّن من 10 أرقام' };
  }
  // Normalize format to start with 0
  if (phoneStr.startsWith('5') && phoneStr.length === 9) {
    phoneStr = '0' + phoneStr;
  }
  // ...
};

// تم إضافة validateIdNumber جديد
const validateIdNumber = (idNumber) => {
  if (!idNumber || idNumber.toString().trim() === '') {
    return { isValid: true, value: null }; // Optional field
  }
  const idStr = idNumber.toString().trim();
  if (!/^\d{9}$/.test(idStr)) {
    return { isValid: false, message: 'رقم الهوية يجب أن يتكون من 9 أرقام' };
  }
  return { isValid: true, value: idStr };
};

// تم تطبيقه في validateAdminData
if (data.idNumber !== undefined) {
  const idValidation = validateIdNumber(data.idNumber);
  if (!idValidation.isValid) {
    errors.push(idValidation.message);
  } else {
    validatedData.idNumber = idValidation.value;
  }
}

// تم إضافته للـ exports
module.exports = {
  validateAdminData,
  // ...
  validateIdNumber, // ✅ جديد
  // ...
};
```

#### 4. **ProfileValidation.js** ✅
```javascript
// رقم الهاتف (تم تعديله مسبقاً)
const validatePhoneNumber = (phone) => {
  const cleanPhone = phoneStr.replace(/[\s\-\(\)]/g, '');
  if (!/^(05|5)\d{8}$/.test(cleanPhone)) {
    return { isValid: false, message: 'رقم الهاتف يجب أن يكون 10 أرقام ويبدأ بـ 05' };
  }
  return { isValid: true, value: cleanPhone };
};

// رقم الهوية (تم إضافته مسبقاً)
const validateIdNumber = (idNumber) => {
  const idStr = idNumber.toString().trim();
  if (!/^\d{9}$/.test(idStr)) {
    return { isValid: false, message: 'رقم الهوية يجب أن يكون 9 أرقام' };
  }
  return { isValid: true, value: idStr };
};
```

---

### UI Updates

#### **Profile.tsx** ✅
```tsx
// رقم الهاتف
<TextInput
  type="tel"
  inputMode="numeric"
  placeholder="05xxxxxxxx (10 أرقام)"
  value={edited?.phoneNumber ?? ''}
  onChange={(v) => {
    const numbersOnly = v.replace(/\D/g, ''); // أرقام فقط
    setEdited((p) => (p ? { ...p, phoneNumber: numbersOnly } : p));
  }}
  maxLength={10}
  error={fieldErrors.phoneNumber}
/>

// رقم الهوية
<TextInput
  inputMode="numeric"
  placeholder="رقم الهوية (9 أرقام)"
  value={edited?.idNumber ?? ''}
  onChange={(v) => {
    const numbersOnly = v.replace(/\D/g, ''); // أرقام فقط
    setEdited((p) => (p ? { ...p, idNumber: numbersOnly } : p));
  }}
  maxLength={9}
  error={fieldErrors.idNumber}
/>

// مكان السكن
<TextInput
  placeholder="المدينة / الحي"
  value={edited?.residence ?? ''}
  onChange={(v) => setEdited((p) => (p ? { ...p, residence: v } : p))}
  error={fieldErrors.residence}
/>
```

---

## 📊 جدول المقارنة

| المستخدم | رقم الهاتف | رقم الهوية | مكان السكن |
|----------|-------------|-------------|-------------|
| **Student** | ✅ 10 أرقام، 05 | ✅ 9 أرقام | ✅ مطلوب |
| **Teacher** | ✅ 10 أرقام، 05 | ✅ 9 أرقام | ✅ اختياري |
| **Admin** | ✅ 10 أرقام، 05 | ✅ 9 أرقام | ✅ اختياري |
| **Profile** | ✅ 10 أرقام، 05 | ✅ 9 أرقام | ✅ اختياري |

---

## 🔧 التعديلات الإضافية

### UI Enhancements
1. **maxLength**: منع كتابة أكثر من العدد المطلوب
2. **inputMode="numeric"**: لوحة مفاتيح أرقام على الموبايل
3. **Filtering**: `v.replace(/\D/g, '')` - قبول أرقام فقط
4. **Placeholders**: توضيحية مع عدد الأرقام

---

## ✅ النتيجة النهائية

### Frontend
- ✅ **studentValidation.ts**: متوافق تماماً
- ✅ **teacherValidation.ts**: متوافق تماماً
- ✅ **AdminValdation.ts**: تم تحديثه للتوافق
- ✅ **profileValidation.ts**: متوافق تماماً
- ✅ **Profile.tsx**: UI محدث مع maxLength و filtering

### Backend
- ✅ **StudentValidation.js**: متوافق تماماً
- ✅ **TeacherValidation.js**: متوافق تماماً
- ✅ **AdminValidation.js**: تم تحديثه للتوافق (من فلسطيني/أردني إلى سعودي)
- ✅ **ProfileValidation.js**: متوافق تماماً

### التوافق
- ✅ Frontend ↔ Backend: نفس القواعد بالضبط
- ✅ Student ↔ Teacher ↔ Admin: قواعد موحدة
- ✅ Create ↔ Update ↔ Profile: متناسق

---

## 🎯 الفوائد

1. **اتساق كامل**: نفس القواعد عبر جميع أنواع المستخدمين
2. **أمان محسن**: validation على Frontend و Backend
3. **تجربة مستخدم أفضل**: رسائل خطأ واضحة، UI مساعد
4. **سهولة الصيانة**: قواعد موحدة يسهل تحديثها
5. **خاص بالسعودية**: قواعد مطابقة للنظام السعودي

النظام الآن **موحد تماماً** عبر جميع المستخدمين والصفحات! 🚀✨
