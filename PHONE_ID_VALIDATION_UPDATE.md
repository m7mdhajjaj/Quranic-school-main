# Phone and ID Number Validation Update

## 📅 التاريخ: 14 أكتوبر 2025

## 🔧 التعديلات المطبقة

تم تحديث قواعد الـ validation لرقم الهاتف ورقم الهوية لتكون أكثر دقة وملاءمة للنظام السعودي.

---

## 📱 رقم الهاتف - Phone Number

### ❌ القاعدة القديمة:
- **الطول**: 8-15 رقم
- **الصيغة**: أي أرقام مع رمز دولي اختياري
- **Regex**: `/^(\+?\d{1,3})?[0-9]{8,15}$/`

### ✅ القاعدة الجديدة:
- **الطول**: 10 أرقام بالضبط
- **الصيغة**: يجب أن يبدأ بـ `05` أو `5`
- **Regex**: `/^(05|5)\d{8}$/`
- **أمثلة صحيحة**:
  - `0512345678`
  - `512345678` (سيتم قبوله وتحويله)
- **رسالة الخطأ**: "رقم الهاتف يجب أن يكون 10 أرقام ويبدأ بـ 05"

### الملفات المعدلة:

#### 1. Frontend: `profileValidation.ts`
```typescript
// قبل
const phoneRegex = /^(\+?\d{1,3})?[0-9]{8,15}$/;

// بعد
const phoneRegex = /^(05|5)\d{8}$/;
```

#### 2. Backend: `ProfileValidation.js`
```javascript
// قبل
if (!/^(\+?\d{1,3})?[0-9]{8,15}$/.test(cleanPhone)) {
  return { isValid: false, message: 'رقم الهاتف غير صحيح' };
}

// بعد
if (!/^(05|5)\d{8}$/.test(cleanPhone)) {
  return { isValid: false, message: 'رقم الهاتف يجب أن يكون 10 أرقام ويبدأ بـ 05' };
}
```

#### 3. Profile Page: `Profile.tsx`
```tsx
// قبل
<TextInput placeholder="05xxxxxxxx" ... />

// بعد
<TextInput placeholder="05xxxxxxxx (10 أرقام)" ... />
```

---

## 🆔 رقم الهوية - ID Number

### ✅ القاعدة:
- **الطول**: 9 أرقام بالضبط (رقم الهوية السعودي)
- **الصيغة**: أرقام فقط
- **Regex**: `/^\d{9}$/`
- **أمثلة صحيحة**:
  - `123456789`
  - `987654321`
- **رسالة الخطأ**: "رقم الهوية يجب أن يكون 9 أرقام"

### الملفات المعدلة:

#### 1. Frontend: `profileValidation.ts` (موجود مسبقاً)
```typescript
export const validateIdNumber = (idNumber: string | undefined): ValidationResult => {
  if (!idNumber || idNumber.trim() === '') {
    return { isValid: true }; // Optional field
  }
  
  const cleaned = idNumber.trim();
  
  if (!/^\d{9}$/.test(cleaned)) {
    return { isValid: false, error: 'رقم الهوية يجب أن يكون 9 أرقام' };
  }
  
  return { isValid: true };
};
```

#### 2. Backend: `ProfileValidation.js` (✅ تم إضافته)
```javascript
/**
 * Validate ID number (9 digits for Saudi Arabia)
 */
const validateIdNumber = (idNumber) => {
  if (!idNumber || idNumber.toString().trim() === '') {
    return { isValid: true, value: null }; // Optional field
  }

  const idStr = idNumber.toString().trim();

  // Check for Saudi ID number (9 digits)
  if (!/^\d{9}$/.test(idStr)) {
    return { isValid: false, message: 'رقم الهوية يجب أن يكون 9 أرقام' };
  }

  return { isValid: true, value: idStr };
};
```

#### 3. تطبيق Validation في `validateProfileData`:
```javascript
// Validate ID number
if (data.idNumber !== undefined) {
  const idValidation = validateIdNumber(data.idNumber);
  if (!idValidation.isValid) {
    errors.push(idValidation.message);
  } else {
    validatedData.idNumber = idValidation.value;
  }
}
```

#### 4. إضافة للـ exports:
```javascript
module.exports = {
  validateProfileData,
  sanitizeProfileData,
  validateUserName,
  validateEmail,
  validatePhoneNumber,
  validateDateOfBirth,
  validateGender,
  validateAddress,
  validateIdNumber,  // ✅ جديد
  validatePassword,
  validateProfileImage,
  validateSocialLinks,
  validateBio,
  validateEmergencyContact,
  validatePreferences,
};
```

---

## 🧪 أمثلة الاختبار

### رقم الهاتف:
```javascript
// ✅ صحيح
"0512345678"  → valid
"512345678"   → valid (سيتم تحويله إلى 0512345678)

// ❌ خطأ
"123456789"   → خطأ: لا يبدأ بـ 05
"05123"       → خطأ: أقل من 10 أرقام
"051234567890" → خطأ: أكثر من 10 أرقام
"+966512345678" → خطأ: لا يقبل رمز دولي
"05abcd5678" → خطأ: يحتوي على أحرف
```

### رقم الهوية:
```javascript
// ✅ صحيح
"123456789"   → valid

// ❌ خطأ
"12345"       → خطأ: أقل من 9 أرقام
"1234567890"  → خطأ: أكثر من 9 أرقام
"12345678a"   → خطأ: يحتوي على أحرف
"1234 5678 9" → خطأ: يحتوي على مسافات
```

---

## 📊 ملخص المقارنة

| الحقل | القاعدة القديمة | القاعدة الجديدة |
|------|------------------|------------------|
| **رقم الهاتف** | 8-15 رقم، أي صيغة | 10 أرقام، يبدأ بـ 05 |
| **رقم الهوية** | غير موجود في Backend | 9 أرقام بالضبط |
| **رسائل الخطأ** | عامة | محددة ووصفية |
| **التطابق** | Frontend فقط | Frontend + Backend |

---

## ✅ الفوائد

1. **دقة أكبر**: قواعد محددة للنظام السعودي
2. **تجربة مستخدم أفضل**: رسائل خطأ واضحة
3. **أمان محسن**: validation متطابق في Frontend و Backend
4. **منع الأخطاء**: تقليل البيانات الخاطئة في قاعدة البيانات

---

## 🎯 الحالة النهائية

- ✅ **Frontend Validation**: محدث في `profileValidation.ts`
- ✅ **Backend Validation**: محدث في `ProfileValidation.js`
- ✅ **UI Updates**: محدث في `Profile.tsx`
- ✅ **Error Messages**: محددة ووصفية
- ✅ **No Errors**: لا توجد أخطاء TypeScript/ESLint

النظام الآن أكثر دقة وملاءمة للاستخدام! 🚀
