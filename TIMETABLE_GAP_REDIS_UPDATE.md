# تحديث نظام TimeTable - الفجوة الإلزامية 30 دقيقة + Redis Cache

## 📋 ملخص التحديثات

تم تطبيق التحسينات التالية على نظام الجدول الزمني (TimeTable):

### 1. ✅ الفجوة الإلزامية (30 دقيقة)
- **المتطلب**: يجب أن تكون هناك فجوة 30 دقيقة على الأقل بين كل جلستين للمعلم
- **مثال**: إذا انتهت جلسة في الساعة 12:30، لا يمكن أن تبدأ الجلسة التالية قبل 1:00 PM

### 2. ✅ Redis Cache للأداء العالي
- **الهدف**: تحسين أداء فحص التعارض والاستعلامات المتكررة
- **TTL**: 60 ثانية (قابل للتعديل)
- **المزامنة**: إبطال الـ Cache تلقائياً عند Create/Update/Delete

---

## 📁 الملفات المُحدَّثة

### Backend/src/controllers/TimeTableController/helpers/scheduleConflict.helper.js

**التغييرات الرئيسية:**
```javascript
// ثوابت جديدة
const REQUIRED_GAP_MINUTES = 30;  // الفجوة الإلزامية
const WORK_START = 660;           // 11:00 AM بالدقائق
const WORK_END = 1200;            // 8:00 PM بالدقائق
const CACHE_TTL = 60;             // مدة الـ Cache بالثواني

// دوال Cache جديدة
getCacheKey(teacherId, date)
invalidateTeacherCache(teacherId, date)
invalidateCacheMultiple(entries)
getTeacherSessionsOnDateCached(teacherId, date, excludeId)
getAvailableSlotsForTeacher(teacherId, date)
```

**أنواع التعارض الجديدة:**
- `OVERLAP` - تداخل مباشر بين الجلسات
- `GAP_BEFORE` - فجوة غير كافية قبل جلسة موجودة
- `GAP_AFTER` - فجوة غير كافية بعد جلسة موجودة
- `INVALID_TIME` - صيغة وقت غير صحيحة
- `INVALID_RANGE` - وقت البداية بعد وقت النهاية
- `OUT_OF_HOURS` - خارج ساعات العمل

---

### Backend/src/controllers/TimeTableController/availability.controller.js

**التغييرات:**
- إضافة import لـ `getAvailableSlotsForTeacher` و `REQUIRED_GAP_MINUTES`
- إضافة import لـ `minutesToTime`
- تحديث `checkConflict` لإرجاع `conflictType`, `suggestion`, `gapInfo`
- **دالة جديدة**: `getAvailableSlots` - إرجاع الفترات المتاحة مع احتساب الفجوة

---

### Backend/src/controllers/TimeTableController/create.controller.js

**التغييرات:**
- إضافة import لـ `invalidateTeacherCache` و `REQUIRED_GAP_MINUTES`
- تحسين رسائل الخطأ حسب نوع التعارض (GAP_BEFORE, GAP_AFTER)
- إضافة `gapInfo` في response
- إضافة `suggestion` للمستخدم
- **Cache Invalidation** بعد الإنشاء

---

### Backend/src/controllers/TimeTableController/update.controller.js

**التغييرات:**
- إضافة import لـ `invalidateTeacherCache`, `invalidateCacheMultiple`, `REQUIRED_GAP_MINUTES`
- تحسين رسائل الخطأ حسب نوع التعارض
- **Cache Invalidation** بعد التحديث

---

### Backend/src/controllers/TimeTableController/delete.controller.js

**التغييرات:**
- إضافة import لـ `invalidateTeacherCache`
- حفظ `teacherId` و `sessionDate` قبل الحذف
- **Cache Invalidation** بعد الحذف

---

### Backend/src/controllers/TimeTableController/index.js

**التغييرات:**
- إضافة export لـ `getAvailableSlots`

---

### Backend/src/routes/timeTableRoutes/TimeTableRoutes.js

**Route جديد:**
```
GET /api/timetable/available-slots?teacherId=xxx&date=2026-01-12
```

**Response:**
```json
{
  "success": true,
  "data": {
    "teacherId": "...",
    "teacherName": "...",
    "date": "...",
    "availableSlots": [
      {
        "startHour": "11:00",
        "endHour": "13:00",
        "durationMinutes": 120
      }
    ],
    "existingSessions": [...],
    "gapMinutes": 30,
    "workingHours": { "start": "11:00 AM", "end": "8:00 PM" }
  }
}
```

---

## 🔄 تدفق العمل

### عند الإنشاء (Create):
1. فحص التعارض المباشر (OVERLAP)
2. فحص الفجوة قبل وبعد الجلسات الموجودة (GAP_BEFORE, GAP_AFTER)
3. إنشاء الجلسة
4. إبطال Cache المعلم

### عند التحديث (Update):
1. فحص التعارض المباشر (OVERLAP)
2. فحص الفجوة (GAP_BEFORE, GAP_AFTER)
3. تحديث الجلسة
4. إبطال Cache المعلم

### عند الحذف (Delete):
1. حفظ بيانات المعلم والتاريخ
2. حذف الجلسة
3. إبطال Cache المعلم

---

## 📊 مثال على فحص التعارض

**السيناريو:**
- جلسة موجودة: 11:00 - 12:30 (حلقة أ)
- محاولة إضافة: 12:40 - 1:30 (حلقة ب)

**النتيجة:**
```json
{
  "success": false,
  "message": "يجب ترك 30 دقيقة فجوة بعد جلسة \"حلقة أ\" (12:30). ابدأ من 01:00 أو بعد",
  "conflictType": "GAP_AFTER",
  "suggestion": "ابدأ من 01:00 أو بعد",
  "gapInfo": {
    "currentGap": 10,
    "requiredGap": 30
  }
}
```

---

## 🧪 اختبار التغييرات

### 1. اختبار الفجوة:
```bash
# إنشاء جلسة الأولى
POST /api/timetable
{
  "teacherId": "...",
  "sessionDate": "2026-01-15",
  "startHour": "11:00",
  "endHour": "12:30",
  "note": "حلقة أ"
}

# محاولة إنشاء جلسة ثانية (فجوة غير كافية)
POST /api/timetable
{
  "teacherId": "...",
  "sessionDate": "2026-01-15",
  "startHour": "12:40",
  "endHour": "1:30",
  "note": "حلقة ب"
}
# يجب أن تفشل مع conflictType: "GAP_AFTER"
```

### 2. اختبار الفترات المتاحة:
```bash
GET /api/timetable/available-slots?teacherId=xxx&date=2026-01-15
# يجب أن تُرجع الفترات المتاحة مع احتساب الفجوة
```

### 3. اختبار Cache:
```bash
# الاستعلام الأول - من DB
GET /api/timetable/available-hours/teacher?teacherId=xxx&date=2026-01-15
# logs: 🔍 Cache MISS

# الاستعلام الثاني - من Cache
GET /api/timetable/available-hours/teacher?teacherId=xxx&date=2026-01-15
# logs: 📦 Cache HIT
```

---

## ⚙️ تكوين Redis

Redis مُكوَّن بالفعل في `Backend/src/config/redis.js` مع الدوال:
- `cache.get(key)` - جلب من الـ Cache
- `cache.set(key, value, ttl)` - حفظ في الـ Cache
- `cache.del(key)` - حذف مفتاح
- `cache.delPattern(pattern)` - حذف بنمط

---

## 📌 ملاحظات مهمة

1. **TTL**: الـ Cache ينتهي تلقائياً بعد 60 ثانية
2. **Fallback**: إذا فشل Redis، يتم الـ fallback للـ DB
3. **المزامنة**: Cache invalidation يحدث في كل Create/Update/Delete
4. **الأداء**: تقليل الاستعلامات المتكررة بنسبة كبيرة

---

## 🔜 تحديثات مستقبلية محتملة

- [ ] إضافة WebSocket لتحديث الـ Frontend فوراً عند تغيير الجدول
- [ ] إضافة إحصائيات Cache (hit rate, miss rate)
- [ ] تكوين TTL ديناميكي حسب الحمل

---

**تاريخ التحديث**: $(date)
**الإصدار**: 2.0.0
