# Timetable Validation - Quick Reference

## 🚀 استخدام سريع

### Backend Route (إضافة validation)

```javascript
const { validateTimetableData } = require("../../Validation/Timetable/TimetableValidation");

router.post(
  "/api/timetable", 
  protect,                    // Auth middleware
  validateTimetableData,      // ← Add this
  controller.createTimetable
);
```

### Frontend Form (استخدام validation)

```typescript
import { validateTimetableData } from '@/Validation/timetableValidation';

const handleSubmit = async () => {
  // Validate
  const result = await validateTimetableData(formData);
  
  if (!result.isValid) {
    // Show errors
    Object.values(result.errors).forEach(showErrorToast);
    return;
  }
  
  // Submit
  await createTimetable(formData);
};
```

### Controller (استخدام البيانات المُتحقق منها)

```javascript
exports.createTimetable = async (req, res) => {
  // Use validated data (already sanitized)
  const data = req.validatedData || req.body;
  
  // Your logic here
  const timetable = new TimeTable(data);
  await timetable.save();
};
```

## 📋 Validation Middleware المتاحة

| Middleware | متى تستخدم | Routes |
|-----------|-----------|--------|
| `validateTimetableData` | Create & Update كامل | POST /, PUT /:id |
| `validateSessionDate` | Create لمقطع أو Update للوقت | POST /section/:id, PATCH /:id/time |
| `validateCheckConflict` | فحص التعارض | POST /check-conflict |

## ✅ Required Fields

### For Create (POST /api/timetable)
```javascript
{
  sessionDate: "2026-01-12",  // ✅ Required (or sectionId)
  startHour: "12:00 PM",      // ✅ Required
  endHour: "1:00 PM",         // ✅ Required
  teacherId: "objectId",      // ✅ Required
  // Optional: groupId, sectionId, note, description, sessionType
}
```

### For Update (PUT /api/timetable/:id)
```javascript
{
  // All fields optional (provide only what changed)
  startHour: "2:00 PM",
  endHour: "3:00 PM"
}
```

### For Create Section (POST /api/timetable/section/:sectionId)
```javascript
{
  startHour: "12:00 PM",      // ✅ Required
  endHour: "1:00 PM",         // ✅ Required
  // Optional: teacherId, sessionType
  // Note: sessionDate comes from section automatically
}
```

## 🔍 Validation Rules

### Date
- Format: `YYYY-MM-DD` or `ISO`
- Example: `"2026-01-12"` ✅

### Time
- Format: `HH:MM AM/PM`
- Example: `"12:00 PM"` ✅
- Working Hours:
  - ☀️ Summer (May-Sep): `12:00 PM - 9:00 PM`
  - ❄️ Winter (Oct-Apr): `11:00 AM - 8:00 PM`

### SessionType
- Values: `'hifz'`, `'murajaah'`, `'both'`, or `undefined`

### ObjectId
- Format: 24 hex characters
- Example: `"507f1f77bcf86cd799439011"` ✅

## ❌ Common Errors

| Error | السبب | الحل |
|-------|-------|------|
| `'التاريخ مطلوب'` | Missing sessionDate | Add sessionDate or sectionId |
| `'ساعة البداية مطلوبة'` | Missing startHour | Add startHour |
| `'معرف المعلم مطلوب'` | Missing teacherId | Add teacherId |
| `'☀️ التوقيت الصيفي...'` | Time outside working hours | Use 12 PM - 9 PM (summer) |
| `'ساعة النهاية يجب...'` | endHour ≤ startHour | Ensure endHour > startHour |
| `'معرف المعلم غير صحيح'` | Invalid ObjectId format | Use valid 24-char hex string |

## 🛡️ Security (XSS Protection)

Automatic in validation:
```javascript
// Input
note: '<script>alert("xss")</script>'

// After validation
note: 'scriptalert("xss")/script'  // ✅ Safe
```

## 📝 Response Format

### Success (200/201)
```json
{
  "success": true,
  "data": { /* timetable object */ }
}
```

### Validation Error (400)
```json
{
  "success": false,
  "message": "بيانات الجدول الزمني غير صحيحة",
  "errors": [
    "التاريخ مطلوب",
    "ساعة البداية مطلوبة"
  ]
}
```

### Conflict Error (409)
```json
{
  "success": false,
  "message": "تعارض: المعلم لديه موعد في نفس الوقت",
  "conflictWith": { /* conflicting timetable */ }
}
```

## 🔄 Validation Flow

```
User Input → Frontend Validation → API Call → Backend Validation → DB
                ↓                                    ↓
            Show Errors                         req.validatedData
```

## 📚 Documentation Links

- **Backend Full Docs**: `Backend/src/Validation/Timetable/README.md`
- **Frontend Full Docs**: `Frontend/src/Validation/README_TIMETABLE.md`
- **Implementation Summary**: `VALIDATION_IMPLEMENTATION_SUMMARY.md`

## 🎯 Best Practices

1. ✅ Always use `req.validatedData` in controllers
2. ✅ Add validation middleware to all POST/PUT/PATCH routes
3. ✅ Validate in frontend before API call (better UX)
4. ✅ Show user-friendly Arabic error messages
5. ✅ Use `sanitizeTimetableData()` when needed
6. ✅ Check conflict before creating/updating

## 🧪 Quick Test

### Backend Test (curl)
```bash
curl -X POST http://localhost:5000/api/timetable \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "sessionDate": "2026-01-12",
    "startHour": "12:00 PM",
    "endHour": "1:00 PM",
    "teacherId": "507f1f77bcf86cd799439011"
  }'
```

### Frontend Test (Browser Console)
```javascript
import { validateTimetableData } from '@/Validation/timetableValidation';

const test = await validateTimetableData({
  sessionDate: '2026-01-12',
  startHour: '12:00 PM',
  endHour: '1:00 PM',
  teacherId: '507f1f77bcf86cd799439011'
});

console.log('Valid?', test.isValid);
```

## 🆘 Troubleshooting

### "req.validatedData is undefined"
→ تأكد من إضافة validation middleware قبل controller

### "Validation errors not showing"
→ راجع استدعاء `validateTimetableData()` في الـ form

### "Working hours validation failing"
→ تحقق من التوقيت الحالي (صيفي/شتوي) باستخدام `isSummerTime()`

### "Date format error"
→ استخدم `formatDateForAPI()` helper لضمان الصيغة الصحيحة

---

**💡 Tip**: احفظ هذا الملف للرجوع السريع عند إضافة validation لـ routes جديدة!
