# Delete Controller - V7 Documentation

## 📋 Overview

هذا الـ Controller مسؤول عن حذف المقاطع (Sections) من نظام DailyMark، مع إدارة ذكية للسور الفعالة (Active Surahs).

---

## 🎯 المشكلة التي تم حلها

### المشكلة الأصلية:
عند حذف مقطع من سورة، كان النظام:
- ❌ **لا يحدّث** السورة الفعالة (Active Surah)
- ❌ **لا يعيد حساب** آخر آية تم الوصول إليها (lastAyahEnd)
- ❌ **لا يمسح** السورة الفعالة إذا حُذفت جميع مقاطعها

### النتيجة:
- السورة الفعالة تبقى "عالقة" حتى لو لم يعد لها مقاطع
- المستخدم لا يستطيع البدء بسورة جديدة
- البيانات غير متسقة

---

## ✅ الحل - V7

### 1. دالة `recalculateActiveSurah(groupId, type)`

```javascript
/**
 * إعادة حساب السورة الفعالة بعد حذف مقطع
 * 
 * السيناريوهات:
 * 1. لا توجد مقاطع متبقية → مسح السورة الفعالة (reset to null)
 * 2. توجد مقاطع → إعادة حساب آخر آية (lastAyahEnd)
 */
```

#### خطوات التنفيذ:

**الخطوة 1: التحقق من السورة الفعالة**
```javascript
const activeSurah = type === 'memorization' 
  ? group.activeMemorizationSurah 
  : group.activeReviewSurah;

if (!activeSurah || !activeSurah.surahNumber) return;
```

**الخطوة 2: البحث عن المقاطع المتبقية**
```javascript
const remainingSections = await Section.find({
  groupId: groupId,
  [`${metaField}.surahNumber`]: activeSurah.surahNumber
}).select(metaField);
```

**الخطوة 3: سيناريو 1 - لا توجد مقاطع متبقية**
```javascript
if (remainingSections.length === 0) {
  await Group.findByIdAndUpdate(groupId, {
    [updateField]: {
      surahNumber: null,
      surahName: null,
      startedAt: null,
      lastAyahEnd: 0,
      isCompleted: false,
      completedAt: null,
    }
  });
  
  logger.success(`🧹 [${type}] تم مسح السورة ${activeSurah.surahNumber}`);
  return;
}
```

**الخطوة 4: سيناريو 2 - إعادة حساب lastAyahEnd**
```javascript
let maxAyahEnd = 0;
for (const section of remainingSections) {
  const segments = section[metaField] || [];
  for (const seg of segments) {
    if (seg.surahNumber === activeSurah.surahNumber && seg.ayahEnd > maxAyahEnd) {
      maxAyahEnd = seg.ayahEnd;
    }
  }
}

await Group.updateLastAyah(groupId, maxAyahEnd, type);
```

---

## 🔧 استخدام الدالة

### في `deleteSection` (حذف مقطع واحد)

```javascript
exports.deleteSection = async (req, res) => {
  const section = await Section.findById(req.params.id);
  
  // حفظ البيانات قبل الحذف
  const groupId = section.groupId;
  const hasMemorization = section.memorizationMeta?.length > 0;
  const hasReview = section.reviewMeta?.length > 0;
  
  // حذف المقطع + TimeTable + DailyMarks
  await Promise.all([
    DailyMark.deleteMany({ sectionId: req.params.id }),
    Section.findByIdAndDelete(req.params.id)
  ]);
  
  // ✅ إعادة حساب السور الفعالة
  if (groupId) {
    if (hasMemorization) {
      await recalculateActiveSurah(groupId, 'memorization');
    }
    if (hasReview) {
      await recalculateActiveSurah(groupId, 'review');
    }
  }
};
```

### في `bulkDeleteSections` (حذف متعدد)

```javascript
exports.bulkDeleteSections = async (req, res) => {
  // جمع الحلقات المتأثرة
  const affectedGroups = new Map(); // groupId -> { hasMemorization, hasReview }
  
  for (const section of sections) {
    if (section.groupId) {
      const groupId = section.groupId.toString();
      const existing = affectedGroups.get(groupId) || { 
        hasMemorization: false, 
        hasReview: false 
      };
      
      if (section.memorizationMeta?.length > 0) {
        existing.hasMemorization = true;
      }
      if (section.reviewMeta?.length > 0) {
        existing.hasReview = true;
      }
      
      affectedGroups.set(groupId, existing);
    }
  }
  
  // حذف المقاطع
  await Section.deleteMany({ _id: { $in: sectionIds } });
  
  // ✅ إعادة حساب لكل حلقة متأثرة
  for (const [groupId, types] of affectedGroups) {
    if (types.hasMemorization) {
      await recalculateActiveSurah(groupId, 'memorization');
    }
    if (types.hasReview) {
      await recalculateActiveSurah(groupId, 'review');
    }
  }
};
```

---

## 📊 أمثلة عملية

### مثال 1: حذف آخر مقطع من سورة

**الحالة قبل الحذف:**
```javascript
activeMemorizationSurah: {
  surahNumber: 2,
  surahName: "البقرة",
  lastAyahEnd: 50,
  isCompleted: false
}

// المقاطع الموجودة:
// - مقطع 1: البقرة 1-20
// - مقطع 2: البقرة 21-50 ← سيتم حذفه
```

**بعد حذف المقطع 2:**
```javascript
// ✅ النظام يعيد الحساب تلقائياً:
activeMemorizationSurah: {
  surahNumber: 2,
  surahName: "البقرة",
  lastAyahEnd: 20,  // ← تم التحديث!
  isCompleted: false
}
```

### مثال 2: حذف جميع مقاطع السورة

**الحالة قبل الحذف:**
```javascript
activeMemorizationSurah: {
  surahNumber: 3,
  surahName: "آل عمران",
  lastAyahEnd: 100,
  isCompleted: false
}

// سيتم حذف جميع المقاطع
```

**بعد الحذف:**
```javascript
// ✅ النظام يمسح السورة الفعالة:
activeMemorizationSurah: {
  surahNumber: null,
  surahName: null,
  lastAyahEnd: 0,
  isCompleted: false
}

// الآن المعلم يستطيع البدء بأي سورة جديدة ✅
```

---

## 🧪 اختبار الوظيفة

### اختبار 1: حذف مقطع وسط سورة
```bash
# قبل: السورة لديها 3 مقاطع (1-20, 21-40, 41-60)
DELETE /api/daily-marks/sections/:id  # حذف المقطع الأوسط

# النتيجة المتوقعة:
# - lastAyahEnd = 60 (من المقطع الثالث)
# - السورة الفعالة لا تزال موجودة
```

### اختبار 2: حذف آخر مقطع
```bash
# قبل: lastAyahEnd = 60
DELETE /api/daily-marks/sections/:id  # حذف المقطع 41-60

# النتيجة المتوقعة:
# - lastAyahEnd = 40
# - السورة الفعالة لا تزال موجودة
```

### اختبار 3: حذف جميع المقاطع
```bash
DELETE /api/daily-marks/sections/bulk
Body: { sectionIds: [...] }  # جميع المقاطع

# النتيجة المتوقعة:
# - activeMemorizationSurah.surahNumber = null
# - يمكن البدء بسورة جديدة
```

---

## 🔄 تدفق العمل الكامل

```
المستخدم يحذف مقطعاً
    ↓
deleteSection Controller
    ↓
1. جلب بيانات المقطع (قبل الحذف)
    ↓
2. حذف TimeTable المرتبط
    ↓
3. حذف DailyMarks المرتبطة
    ↓
4. حذف Section نفسه
    ↓
5. استدعاء recalculateActiveSurah()
    ↓
    ├─→ إذا لا توجد مقاطع متبقية
    │   └─→ مسح السورة الفعالة (reset)
    │
    └─→ إذا توجد مقاطع
        └─→ إعادة حساب lastAyahEnd
    ↓
6. إرسال الاستجابة للمستخدم ✅
```

---

## ⚙️ الإعدادات والاعتبارات

### Performance:
- استخدام `select(metaField)` لتقليل البيانات المحملة
- استخدام `Map` في bulk delete لتجنب التكرار

### Error Handling:
- جميع الأخطاء يتم catch-ها ولا توقف عملية الحذف
- استخدام logger لتتبع الأخطاء

### Consistency:
- العمليات تتم بترتيب محدد لضمان التناسق
- يتم فحص null/undefined قبل المعالجة

---

## 📝 الخلاصة

### ما الذي تم إصلاحه:
✅ السورة الفعالة يتم تحديثها تلقائياً عند الحذف  
✅ إذا حُذفت جميع المقاطع، يتم مسح السورة الفعالة  
✅ آخر آية (lastAyahEnd) يتم إعادة حسابها بدقة  
✅ يعمل مع حذف مقطع واحد أو متعدد  

### متى يُستخدم:
- حذف مقطع واحد → `DELETE /api/daily-marks/sections/:id`
- حذف متعدد → `DELETE /api/daily-marks/sections/bulk`

### المخرجات:
```javascript
{
  success: true,
  deletedId: "...",
  message: "تم حذف المقطع بنجاح"
}

// في bulk delete:
{
  deletedCount: 5,
  deletedTimeTables: 3,
  deletedMarks: 12,
  recalculatedGroups: 2  // ← عدد الحلقات التي تم إعادة حساب سورها
}
```

---

**Version**: V7  
**Last Updated**: 2026-01-18  
**Author**: GitHub Copilot + User
