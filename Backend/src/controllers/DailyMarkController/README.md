# DailyMark Controller

## 📁 الهيكل التنظيمي

هذا المجلد يحتوي على كل ما يتعلق بنظام **العلامات اليومية** بما في ذلك **المقاطع (Sections)**.

### ملفات العلامات اليومية (DailyMark)
- `getMarks.js` - جلب العلامات (Get operations)
- `setMarks.js` - إنشاء العلامات (Create operations)
- `updateMark.js` - تحديث العلامات (Update operations)
- `deleteMark.js` - حذف العلامات (Delete operations)

### مجلد المقاطع (SectionControllers)
المقاطع هي **جزء أساسي من نظام العلامات اليومية** لأن كل علامة مرتبطة بمقطع محدد.

- `get.controller.js` - جلب المقاطع
- `create.controller.js` - إنشاء مقطع جديد
- `update.controller.js` - تحديث مقطع
- `delete.controller.js` - حذف مقطع
- `index.js` - تصدير جميع العمليات

## 🔗 العلاقة بين DailyMark و Section

```javascript
DailyMark Schema:
{
  studentId: ObjectId,
  sectionId: ObjectId,  // ← مرتبط بـ Section
  reviewMark: Number,
  memorizationMark: Number
}

Section Schema:
{
  date: Date,
  reviewSection: String,      // المقطع المطلوب للمراجعة
  memorizationSection: String, // المقطع المطلوب للحفظ
  group: String,
  teacher: String
}
```

## 📍 API Endpoints

### العلامات اليومية
- `GET /api/daily-marks` - جميع العلامات
- `POST /api/daily-marks` - إنشاء علامة
- `PUT /api/daily-marks/:id` - تحديث علامة
- `DELETE /api/daily-marks/:id` - حذف علامة

### المقاطع (جزء من DailyMarks)
- `GET /api/daily-marks/sections` - جميع المقاطع
- `POST /api/daily-marks/sections` - إنشاء مقطع
- `PUT /api/daily-marks/sections/:id` - تحديث مقطع
- `DELETE /api/daily-marks/sections/:id` - حذف مقطع

## 💡 لماذا هذا التنظيم؟

✅ **وضوح أكثر**: Section ليس نظام مستقل، بل جزء من DailyMarks
✅ **سهولة الفهم**: كل ما يتعلق بالعلامات اليومية في مكان واحد
✅ **منطقية أكبر**: Section يحدد ما سيتم تقييمه في DailyMark
