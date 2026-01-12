# Timetable Validation System

## 📋 Overview

نظام validation موحد للجدول الزمني (Timetable) يعمل على جهتين:
- **Frontend**: باستخدام Yup validation
- **Backend**: باستخدام custom middleware

## 🔒 Backend Validation

### Middleware المستخدمة

#### 1. `validateTimetableData`
**استخدام**: Create & Update operations
**يتحقق من**:
- ✅ `sessionDate` (مطلوب للإنشاء، اختياري للتحديث)
- ✅ `startHour` و `endHour` (مطلوبان، مع فحص أوقات العمل)
- ✅ `teacherId` (مطلوب للإنشاء)
- ✅ `sessionType` (اختياري - auto-detect من section)
- ✅ `sectionId`, `groupId`, `note`, `description` (اختيارية)
- ✅ Time logic (startHour < endHour)
- ✅ XSS protection & sanitization

**Routes**:
```javascript
POST   /api/timetable              - إنشاء موعد جديد
PUT    /api/timetable/:id          - تحديث موعد كامل
```

#### 2. `validateSessionDate`
**استخدام**: Create for section & Time updates
**يتحقق من**:
- ✅ `startHour` و `endHour` (مطلوبان)
- ✅ `teacherId` (اختياري)
- ✅ `sessionType` (اختياري)
- ✅ Time logic validation

**Routes**:
```javascript
POST   /api/timetable/section/:sectionId  - إنشاء موعد لمقطع
PATCH  /api/timetable/:id/time            - تحديث الوقت فقط
```

#### 3. `validateCheckConflict`
**استخدام**: Conflict checking before create/update
**يتحقق من**:
- ✅ `sessionDate` (مطلوب!)
- ✅ `teacherId` (مطلوب)
- ✅ `startHour` و `endHour` (مطلوبان)
- ✅ `excludeId` (اختياري - لاستثناء موعد عند التعديل)

**Routes**:
```javascript
POST   /api/timetable/check-conflict  - فحص التعارض
```

### Validation Rules

#### Date Validation
```javascript
// يقبل صيغة YYYY-MM-DD أو ISO format
"2026-01-12"                    ✅
"2026-01-12T00:00:00.000Z"     ✅
```

#### Time Validation
```javascript
// صيغة 12-hour format مع AM/PM
"12:00 PM"  ✅
"1:30 PM"   ✅
"11:00 AM"  ✅

// أوقات العمل (تلقائي حسب الموسم):
// ☀️ صيفي (مايو-سبتمبر): 12:00 PM - 9:00 PM
// ❄️ شتوي (أكتوبر-أبريل): 11:00 AM - 8:00 PM
```

#### SessionType Validation
```javascript
// القيم المسموحة
"hifz"      ✅ (حفظ)
"murajaah"  ✅ (مراجعة)
"both"      ✅ (الاثنين)
undefined   ✅ (auto-detect من section)
```

#### ObjectId Validation
```javascript
// MongoDB ObjectId format
/^[a-fA-F0-9]{24}$/
```

## 🎨 Frontend Validation

### Yup Schemas

#### 1. `timetableValidationSchema`
Schema كامل للإنشاء والتحديث:
```typescript
{
  sessionDate: string (required, YYYY-MM-DD or ISO),
  startHour: string (required, HH:MM AM/PM),
  endHour: string (required, HH:MM AM/PM),
  teacherId: string (required, ObjectId),
  groupId?: string (optional, ObjectId),
  sectionId?: string (optional, ObjectId),
  note?: string (optional, max 200),
  description?: string (optional, max 500),
  sessionType?: SessionType (optional)
}
```

#### 2. `checkConflictSchema`
Schema لفحص التعارض:
```typescript
{
  teacherId: string (required),
  sessionDate: string (required),
  startHour: string (required),
  endHour: string (required),
  excludeId?: string (optional)
}
```

#### 3. `createForSectionSchema`
Schema لإنشاء موعد لمقطع:
```typescript
{
  startHour: string (required),
  endHour: string (required),
  teacherId?: string (optional),
  sessionType?: SessionType (optional)
}
```

### Validation Functions

```typescript
// التحقق من البيانات الكاملة
await validateTimetableData(formData);

// التحقق من بيانات فحص التعارض
await validateCheckConflict(conflictData);

// التحقق من حقل معين
await validateField('sessionDate', value);

// تنظيف البيانات (XSS protection)
sanitizeTimetableData(formData);
```

## 🔄 Validation Flow

### Create Flow
```
1. Frontend Form Submit
   ↓
2. Frontend Yup Validation (validateTimetableData)
   ↓
3. API Call to Backend
   ↓
4. Backend Middleware Validation (validateTimetableData)
   ↓
5. Controller Business Logic
   ↓
6. Conflict Check (checkTimeConflict)
   ↓
7. Database Save
```

### Update Flow
```
1. Frontend Form Submit
   ↓
2. Frontend Yup Validation (validateTimetableData)
   ↓
3. API Call to Backend
   ↓
4. Backend Middleware Validation (validateTimetableData)
   ↓
5. Controller Business Logic
   ↓
6. Conflict Check (if time changed)
   ↓
7. Database Update
```

## 🛡️ Security Features

### XSS Protection
- ✅ Remove HTML tags (`<`, `>`)
- ✅ Remove javascript: protocols
- ✅ Trim whitespace
- ✅ Applied in both frontend and backend

### Input Sanitization
```javascript
// Backend
const sanitized = data.trim()
  .replace(/[<>]/g, '')
  .replace(/javascript:/gi, '');

// Frontend
const sanitized = data.trim()
  .replace(/[<>]/g, '')
  .replace(/javascript:/gi, '');
```

## 📝 Usage Examples

### Frontend Example
```typescript
import { validateTimetableData } from '@/Validation/timetableValidation';

const formData = {
  sessionDate: '2026-01-12',
  startHour: '12:00 PM',
  endHour: '1:00 PM',
  teacherId: '507f1f77bcf86cd799439011',
  sessionType: 'hifz'
};

// Validate
const result = await validateTimetableData(formData);
if (!result.isValid) {
  console.error('Validation errors:', result.errors);
}
```

### Backend Example
```javascript
// Route definition
router.post(
  "/", 
  protect, 
  validateTimetableData,  // ← Middleware
  timetableController.createTimetable
);

// Controller - use validated data
const data = req.validatedData || req.body;
```

## 🔍 Error Messages

### Arabic Error Messages
جميع رسائل الأخطاء بالعربية للوضوح:

```javascript
// Field required
'التاريخ مطلوب'
'ساعة البداية مطلوبة'
'معرف المعلم مطلوب'

// Format errors
'التاريخ يجب أن يكون بصيغة YYYY-MM-DD'
'ساعة البداية يجب أن تكون بصيغة HH:MM AM/PM'
'معرف المعلم غير صحيح'

// Business logic errors
'☀️ التوقيت الصيفي: 12:00 PM - 9:00 PM فقط'
'❄️ التوقيت الشتوي: 11:00 AM - 8:00 PM فقط'
'ساعة النهاية يجب أن تكون بعد ساعة البداية'

// Conflict errors
'تعارض: المعلم لديه موعد في نفس الوقت'
'وقت البداية محجوز مسبقاً'
```

## 🧪 Testing

### Test Coverage
- ✅ Date format validation
- ✅ Time format validation
- ✅ Working hours validation (summer/winter)
- ✅ Time logic validation (start < end)
- ✅ ObjectId validation
- ✅ XSS protection
- ✅ Required field validation
- ✅ Optional field validation
- ✅ Conflict detection

## 📚 Related Files

### Backend
- `Backend/src/Validation/Timetable/TimetableValidation.js` - Middleware
- `Backend/src/routes/timetableRoutes/TimeTableRoutes.js` - Routes
- `Backend/src/controllers/TimeTableController/` - Controllers

### Frontend
- `Frontend/src/Validation/timetableValidation.ts` - Yup schemas
- `Frontend/src/pages/Timetable/hooks/form/useSessionModalLogic.ts` - Form validation
- `Frontend/src/pages/Timetable/components/SessionModal.tsx` - UI

## 🔄 Migration Notes

### Old vs New System

**Old System** (Removed):
- ❌ Client-side only validation
- ❌ Inconsistent error messages
- ❌ No XSS protection
- ❌ Validation logic in controllers

**New System** (Current):
- ✅ Two-layer validation (frontend + backend)
- ✅ Consistent error messages (Arabic)
- ✅ XSS protection & sanitization
- ✅ Middleware-based validation
- ✅ Yup schemas for frontend
- ✅ Unified validation rules

## 📞 Support

للأسئلة أو المشاكل:
1. تأكد من استخدام `req.validatedData` في الـ controllers
2. تأكد من استيراد الـ middleware الصحيحة في الـ routes
3. راجع error messages في الـ console
4. تأكد من أن التاريخ بصيغة صحيحة (YYYY-MM-DD)
