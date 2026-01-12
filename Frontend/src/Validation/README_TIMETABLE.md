# Timetable Validation - Frontend

## 📋 Overview

نظام التحقق من البيانات (Validation) للجدول الزمني في Frontend باستخدام Yup.

## 🎨 Validation Schemas

### Main Schemas

```typescript
import { 
  timetableValidationSchema,
  checkConflictSchema,
  createForSectionSchema,
  validateTimetableData,
  validateCheckConflict,
  sanitizeTimetableData
} from '@/Validation/timetableValidation';
```

### 1. timetableValidationSchema

Schema كامل لإنشاء وتحديث المواعيد:

```typescript
const formData = {
  sessionDate: '2026-01-12',      // ✅ Required
  startHour: '12:00 PM',          // ✅ Required
  endHour: '1:00 PM',             // ✅ Required
  teacherId: 'objectId',          // ✅ Required
  groupId: 'objectId',            // ⚪ Optional
  sectionId: 'objectId',          // ⚪ Optional
  note: 'Group name',             // ⚪ Optional (max 200)
  description: 'Description',     // ⚪ Optional (max 500)
  sessionType: 'hifz'             // ⚪ Optional
};
```

### 2. checkConflictSchema

Schema لفحص التعارض:

```typescript
const conflictData = {
  teacherId: 'objectId',          // ✅ Required
  sessionDate: '2026-01-12',      // ✅ Required
  startHour: '12:00 PM',          // ✅ Required
  endHour: '1:00 PM',             // ✅ Required
  excludeId: 'objectId'           // ⚪ Optional
};
```

### 3. createForSectionSchema

Schema لإنشاء موعد لمقطع:

```typescript
const sectionData = {
  startHour: '12:00 PM',          // ✅ Required
  endHour: '1:00 PM',             // ✅ Required
  teacherId: 'objectId',          // ⚪ Optional
  sessionType: 'hifz'             // ⚪ Optional
};
```

## 🔧 Validation Functions

### validateTimetableData

دالة للتحقق من البيانات الكاملة:

```typescript
const result = await validateTimetableData(formData);

if (!result.isValid) {
  // result.errors = { field: 'error message' }
  console.error(result.errors);
} else {
  // Data is valid ✅
}
```

### validateCheckConflict

دالة للتحقق من بيانات فحص التعارض:

```typescript
const result = await validateCheckConflict(conflictData);

if (!result.isValid) {
  console.error(result.errors);
}
```

### validateField

دالة للتحقق من حقل معين:

```typescript
const result = await validateField('sessionDate', '2026-01-12');

if (!result.isValid) {
  console.error(result.error);
}
```

### sanitizeTimetableData

دالة لتنظيف البيانات (XSS protection):

```typescript
const cleanData = sanitizeTimetableData(formData);
// Removes HTML tags, javascript:, trims whitespace
```

## 📏 Validation Rules

### Date Format

```typescript
// يقبل كلا الصيغتين:
'2026-01-12'                    ✅
'2026-01-12T00:00:00.000Z'     ✅
'12/01/2026'                    ❌
'2026-1-12'                     ❌
```

### Time Format

```typescript
// 12-hour format with AM/PM
'12:00 PM'  ✅
'1:30 PM'   ✅
'11:00 AM'  ✅
'1:00 pm'   ✅  (case insensitive)
'13:00'     ❌  (24-hour not supported)
'1:00'      ❌  (missing AM/PM)
```

### Working Hours

```typescript
// تتغير حسب الموسم تلقائياً
isSummerTime() // true: May-September, false: October-April

// ☀️ Summer (May-September)
'12:00 PM' to '9:00 PM' ✅
'11:00 AM'              ❌
'10:00 PM'              ❌

// ❄️ Winter (October-April)
'11:00 AM' to '8:00 PM' ✅
'10:00 AM'              ❌
'9:00 PM'               ❌
```

### SessionType

```typescript
// القيم المسموحة:
'hifz'      ✅  (حفظ)
'murajaah'  ✅  (مراجعة)
'both'      ✅  (الاثنين)
undefined   ✅  (auto-detect from section)
'other'     ❌
```

### ObjectId Format

```typescript
// MongoDB ObjectId (24 hex characters)
'507f1f77bcf86cd799439011'  ✅
'abc123'                     ❌
'not-an-id'                  ❌
```

## 🔒 Security Features

### XSS Protection

```typescript
// Automatic sanitization
const formData = {
  note: '<script>alert("xss")</script>',
  description: 'javascript:alert("xss")'
};

const clean = sanitizeTimetableData(formData);
// note: 'scriptalert("xss")/script'
// description: 'alert("xss")'
```

### Input Trimming

```typescript
// Automatic whitespace trimming
'  12:00 PM  ' → '12:00 PM'
'  2026-01-12  ' → '2026-01-12'
```

## 🎯 Usage in Forms

### With useSessionModalLogic Hook

```typescript
import { useSessionModalLogic } from '../hooks/form/useSessionModalLogic';

const { handleSubmit, loading } = useSessionModalLogic({
  onSubmit: async (data) => {
    // Validation is done automatically inside the hook
    await createTimetable(data);
  },
  formData,
  // ... other props
});

// In your form:
<form onSubmit={handleSubmit}>
  {/* form fields */}
</form>
```

### Manual Validation

```typescript
import { validateTimetableData } from '@/Validation/timetableValidation';

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  // Validate
  const validation = await validateTimetableData(formData);
  
  if (!validation.isValid) {
    // Show errors
    Object.values(validation.errors).forEach(error => {
      showErrorToast(error);
    });
    return;
  }
  
  // Submit to backend
  await createTimetable(formData);
};
```

## 📝 Error Messages (Arabic)

### Required Field Errors

```
'التاريخ مطلوب'
'ساعة البداية مطلوبة'
'ساعة النهاية مطلوبة'
'معرف المعلم مطلوب'
```

### Format Errors

```
'التاريخ يجب أن يكون بصيغة صحيحة (مثل: 2026-01-12)'
'ساعة البداية يجب أن تكون بصيغة HH:MM AM/PM (مثل: 12:00 PM)'
'معرف المعلم غير صحيح'
```

### Business Logic Errors

```
'☀️ التوقيت الصيفي: 12:00 PM - 9:00 PM فقط'
'❄️ التوقيت الشتوي: 11:00 AM - 8:00 PM فقط'
'ساعة النهاية يجب أن تكون بعد ساعة البداية'
'وقت البداية محجوز مسبقاً'
```

## 🧪 Helper Functions

### isSummerTime()

تحديد إذا كان التوقيت صيفي أو شتوي:

```typescript
import { isSummerTime } from '@/Validation/timetableValidation';

const isSummer = isSummerTime();
// May-September: true
// October-April: false
```

### isValidWorkingHour()

التحقق من أن الوقت ضمن أوقات العمل:

```typescript
import { isValidWorkingHour } from '@/Validation/timetableValidation';

isValidWorkingHour('12:00 PM')  // true (summer & winter)
isValidWorkingHour('11:00 AM')  // true (winter only)
isValidWorkingHour('10:00 AM')  // false (always)
```

### timeToMinutes()

تحويل الوقت إلى دقائق للمقارنة:

```typescript
import { timeToMinutes } from '@/Validation/timetableValidation';

timeToMinutes('12:00 PM')  // 720
timeToMinutes('1:30 PM')   // 810
```

### isEndTimeAfterStartTime()

التحقق من أن وقت الانتهاء بعد وقت البداية:

```typescript
import { isEndTimeAfterStartTime } from '@/Validation/timetableValidation';

isEndTimeAfterStartTime('12:00 PM', '1:00 PM')  // true
isEndTimeAfterStartTime('1:00 PM', '12:00 PM')  // false
```

### getDayFromDate()

اشتقاق اليوم بالعربية من تاريخ:

```typescript
import { getDayFromDate } from '@/Validation/timetableValidation';

getDayFromDate('2026-01-12')  // 'الاثنين'
```

## 🔄 Integration with Backend

### Two-Layer Validation

```
┌─────────────────────────────────┐
│   1. Frontend Validation        │
│   (Yup Schema)                  │
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│   2. API Call                   │
│   (with sanitized data)         │
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│   3. Backend Validation         │
│   (Middleware)                  │
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│   4. Controller Logic           │
│   (Business rules + DB)         │
└─────────────────────────────────┘
```

### Validation Consistency

Frontend و Backend يستخدمان نفس القواعد:
- ✅ Date format: YYYY-MM-DD or ISO
- ✅ Time format: HH:MM AM/PM
- ✅ Working hours: Summer/Winter
- ✅ SessionType values
- ✅ ObjectId format
- ✅ XSS protection
- ✅ Error messages (Arabic)

## 📚 Related Files

```
Frontend/src/
├── Validation/
│   └── timetableValidation.ts          # ⭐ Main validation file
├── pages/Timetable/
│   ├── hooks/
│   │   └── form/
│   │       └── useSessionModalLogic.ts # Uses validation
│   └── components/
│       └── SessionModal.tsx            # Form UI
└── Api/
    └── TimeTable.Api.ts                # API calls
```

## 🎓 Best Practices

### 1. Always Validate Before Submit

```typescript
// ✅ Good
const validation = await validateTimetableData(formData);
if (validation.isValid) {
  await createTimetable(formData);
}

// ❌ Bad
await createTimetable(formData); // No validation
```

### 2. Sanitize User Input

```typescript
// ✅ Good
const cleanData = sanitizeTimetableData(formData);
await createTimetable(cleanData);

// ⚠️ OK (sanitization is included in validateTimetableData)
const validation = await validateTimetableData(formData);
```

### 3. Show User-Friendly Errors

```typescript
// ✅ Good
if (!validation.isValid) {
  Object.entries(validation.errors).forEach(([field, error]) => {
    showErrorToast(error); // Arabic message
  });
}

// ❌ Bad
if (!validation.isValid) {
  console.log('Error'); // No user feedback
}
```

### 4. Handle Booked Hours

```typescript
// ✅ Good - Check before validation
if (bookedHours.includes(formData.startHour)) {
  showErrorToast('❌ وقت البداية محجوز مسبقاً');
  return;
}

const validation = await validateTimetableData(formData);
```

## 🐛 Troubleshooting

### Validation Not Working?

1. Check import path:
```typescript
import { validateTimetableData } from '@/Validation/timetableValidation';
// Not from '../Validation/...'
```

2. Check formData structure:
```typescript
console.log('FormData:', formData);
// Should have all required fields
```

3. Check error response:
```typescript
const validation = await validateTimetableData(formData);
console.log('Validation result:', validation);
```

### Time Validation Failing?

Check current season:
```typescript
const isSummer = isSummerTime();
console.log('Is summer?', isSummer);
console.log('Working hours:', isSummer ? '12 PM - 9 PM' : '11 AM - 8 PM');
```

### Date Format Issues?

Use formatDateForAPI helper:
```typescript
import { formatDateForAPI } from '@/pages/Timetable/utils';

const dateStr = formatDateForAPI(someDate);
// Always returns YYYY-MM-DD format
```
