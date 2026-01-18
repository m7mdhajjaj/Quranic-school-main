# Active Surah Sync - V7 Complete Documentation

## 📋 نظرة عامة

هذا التوثيق يشرح كيف يتم مزامنة **السور الفعالة (Active Surahs)** في جميع العمليات:
- ✅ **إضافة** مقطع (CREATE)
- ✅ **تعديل** مقطع (UPDATE)
- ✅ **حذف** مقطع (DELETE)

---

## 🎯 السور الفعالة (Active Surahs)

### المفهوم:
- كل حلقة لها **سورة فعالة للحفظ** و **سورة فعالة للمراجعة**
- **لا يمكن** البدء بسورة جديدة قبل إكمال السورة الفعالة
- النظام يتتبع **آخر آية تم الوصول إليها** (lastAyahEnd)

### البيانات في Group Schema:
```javascript
{
  activeMemorizationSurah: {
    surahNumber: 2,           // رقم السورة
    surahName: "البقرة",      // اسم السورة
    lastAyahEnd: 50,          // آخر آية تم الوصول إليها
    isCompleted: false,       // هل اكتملت السورة؟
    startedAt: Date,          // تاريخ البدء
    completedAt: null         // تاريخ الإكمال
  },
  
  activeReviewSurah: {
    // نفس الهيكل
  }
}
```

---

## 🔄 تزامن العمليات

### 1️⃣ **CREATE - إضافة مقطع جديد**

#### المكان: `create.controller.js` + `Section.js` (middleware)

#### الخطوات:

**1. Controller Validation (قبل الحفظ):**
```javascript
// ✅ V6: Active Surah Check
if (targetGroupId) {
  // فحص سورة الحفظ
  if (memorizationMeta?.length > 0) {
    const memSurah = memorizationMeta[0].surahNumber;
    const canAddMem = await Group.canAddSegment(targetGroupId, memSurah, 'memorization');
    
    if (!canAddMem.allowed) {
      return sendError(res, canAddMem.reason, 400);
      // ❌ "يجب إكمال سورة البقرة أولاً"
    }
  }
  
  // فحص سورة المراجعة
  if (reviewMeta?.length > 0) {
    const revSurah = reviewMeta[0].surahNumber;
    const canAddRev = await Group.canAddSegment(targetGroupId, revSurah, 'review');
    
    if (!canAddRev.allowed) {
      return sendError(res, canAddRev.reason, 400);
    }
  }
}
```

**2. Schema Middleware - post("save") (بعد الحفظ):**
```javascript
sectionSchema.post("save", async function (doc) {
  if (doc.groupId) {
    // تحديث سورة الحفظ
    if (doc.memorizationMeta?.length > 0) {
      const lastSegment = doc.memorizationMeta[doc.memorizationMeta.length - 1];
      const activeSurahs = await Group.getActiveSurahs(doc.groupId);
      
      if (!activeSurahs?.memorization?.surahNumber || activeSurahs.memorization.isCompleted) {
        // ✅ تفعيل سورة جديدة
        await Group.activateSurah(
          doc.groupId,
          lastSegment.surahNumber,
          lastSegment.surahName,
          lastSegment.ayahEnd,
          'memorization'
        );
      } else if (activeSurahs.memorization.surahNumber === lastSegment.surahNumber) {
        // ✅ تحديث lastAyahEnd
        const maxAyahEnd = Math.max(...doc.memorizationMeta.map(s => s.ayahEnd));
        await Group.updateLastAyah(doc.groupId, maxAyahEnd, 'memorization');
        
        // ✅ فحص الإكمال
        if (maxAyahEnd >= lastSegment.surahAyahCount) {
          await Group.checkAndCompleteSurah(doc.groupId, maxAyahEnd, lastSegment.surahAyahCount, 'memorization');
        }
      }
    }
    
    // نفس المنطق للمراجعة...
  }
});
```

#### مثال:
```javascript
// POST /api/daily-marks/sections
{
  "memorizationMeta": [
    { "surahNumber": 2, "ayahStart": 1, "ayahEnd": 20 }
  ]
}

// النتيجة:
activeMemorizationSurah: {
  surahNumber: 2,
  surahName: "البقرة",
  lastAyahEnd: 20,      // ✅ تم التحديث
  isCompleted: false
}
```

---

### 2️⃣ **UPDATE - تعديل مقطع**

#### المكان: `update.controller.js` + `Section.js` (middleware)

#### الخطوات:

**1. Controller Validation (قبل التعديل):**
```javascript
// ✅ V6: Active Surah Check (فقط إذا تغيرت السورة)
if (targetGroupId) {
  // فحص تغيير سورة الحفظ
  if (updateData.memorizationMeta?.length > 0) {
    const newMemSurah = updateData.memorizationMeta[0].surahNumber;
    const oldMemSurah = section.memorizationMeta?.[0]?.surahNumber;
    
    if (newMemSurah !== oldMemSurah) {
      const canAddMem = await Group.canAddSegment(targetGroupId, newMemSurah, 'memorization');
      
      if (!canAddMem.allowed) {
        return sendError(res, canAddMem.reason, 400);
        // ❌ لا يمكن تغيير إلى سورة جديدة
      }
    }
  }
  
  // نفس الفحص للمراجعة...
}
```

**2. Schema Middleware - post("save"):**
```javascript
// ✅ يعمل نفس منطق CREATE
// يعيد حساب lastAyahEnd إذا تغيرت البيانات
```

#### سيناريوهات:

**السيناريو 1: تعديل الآيات (نفس السورة)**
```javascript
// قبل:
memorizationMeta: [{ surahNumber: 2, ayahStart: 1, ayahEnd: 20 }]
activeMemorizationSurah.lastAyahEnd: 20

// التعديل:
memorizationMeta: [{ surahNumber: 2, ayahStart: 1, ayahEnd: 30 }]

// بعد:
activeMemorizationSurah.lastAyahEnd: 30  // ✅ تم التحديث
```

**السيناريو 2: محاولة تغيير السورة (ممنوع)**
```javascript
// قبل:
activeMemorizationSurah: { surahNumber: 2, isCompleted: false }

// محاولة التعديل إلى سورة 3:
memorizationMeta: [{ surahNumber: 3, ayahStart: 1, ayahEnd: 10 }]

// النتيجة:
❌ Error: "يجب إكمال سورة البقرة أولاً قبل البدء بسورة جديدة"
```

**السيناريو 3: تغيير السورة (مسموح - بعد الإكمال)**
```javascript
// إذا:
activeMemorizationSurah: { surahNumber: 2, isCompleted: true }

// التعديل:
memorizationMeta: [{ surahNumber: 3, ayahStart: 1, ayahEnd: 10 }]

// النتيجة:
✅ يسمح بالتعديل
activeMemorizationSurah: {
  surahNumber: 3,      // ✅ سورة جديدة
  lastAyahEnd: 10,
  isCompleted: false
}
```

---

### 3️⃣ **DELETE - حذف مقطع**

#### المكان: `delete.controller.js` + `Section.js` (middleware)

#### الخطوات:

**1. Controller - recalculateActiveSurah():**
```javascript
async function recalculateActiveSurah(groupId, type) {
  const group = await Group.findById(groupId);
  const activeSurah = type === 'memorization' 
    ? group.activeMemorizationSurah 
    : group.activeReviewSurah;

  if (!activeSurah?.surahNumber) return;

  const metaField = type === 'memorization' ? 'memorizationMeta' : 'reviewMeta';
  
  // البحث عن المقاطع المتبقية
  const remainingSections = await Section.find({
    groupId: groupId,
    [`${metaField}.surahNumber`]: activeSurah.surahNumber
  });

  // سيناريو 1: لا توجد مقاطع متبقية
  if (remainingSections.length === 0) {
    await Group.findByIdAndUpdate(groupId, {
      [updateField]: {
        surahNumber: null,
        surahName: null,
        lastAyahEnd: 0,
        isCompleted: false,
      }
    });
    console.log(`🧹 تم مسح السورة ${activeSurah.surahNumber}`);
    return;
  }

  // سيناريو 2: إعادة حساب lastAyahEnd
  let maxAyahEnd = 0;
  for (const section of remainingSections) {
    for (const seg of section[metaField]) {
      if (seg.surahNumber === activeSurah.surahNumber) {
        maxAyahEnd = Math.max(maxAyahEnd, seg.ayahEnd);
      }
    }
  }

  await Group.updateLastAyah(groupId, maxAyahEnd, type);
  console.log(`📊 تم تحديث lastAyahEnd إلى ${maxAyahEnd}`);
}
```

**2. Controller - deleteSection():**
```javascript
exports.deleteSection = async (req, res) => {
  const section = await Section.findById(req.params.id);
  
  // حفظ البيانات قبل الحذف
  const groupId = section.groupId;
  const hasMemorization = section.memorizationMeta?.length > 0;
  const hasReview = section.reviewMeta?.length > 0;
  
  // حذف المقطع
  await Section.findByIdAndDelete(req.params.id);
  
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

**3. Schema Middleware - post("findOneAndDelete"):**
```javascript
// ✅ V7: يعمل كـ backup للـ Controller
// يعيد حساب السور الفعالة تلقائياً بعد الحذف
sectionSchema.post("findOneAndDelete", async function (doc) {
  if (!doc?.groupId) return;

  // نفس منطق recalculateActiveSurah()
  // يفحص المقاطع المتبقية ويحدث السورة الفعالة
});
```

#### سيناريوهات:

**السيناريو 1: حذف مقطع وسط**
```javascript
// قبل الحذف:
// - مقطع 1: البقرة 1-20
// - مقطع 2: البقرة 21-40  ← سيتم حذفه
// - مقطع 3: البقرة 41-60
lastAyahEnd: 60

// بعد الحذف:
lastAyahEnd: 60  // ✅ لم يتغير (المقطع 3 لا يزال موجود)
```

**السيناريو 2: حذف آخر مقطع**
```javascript
// قبل الحذف:
// - مقطع 1: البقرة 1-20
// - مقطع 2: البقرة 21-40
// - مقطع 3: البقرة 41-60  ← سيتم حذفه
lastAyahEnd: 60

// بعد الحذف:
lastAyahEnd: 40  // ✅ تم إعادة الحساب من المقاطع المتبقية
```

**السيناريو 3: حذف جميع المقاطع**
```javascript
// قبل الحذف:
activeMemorizationSurah: {
  surahNumber: 2,
  surahName: "البقرة",
  lastAyahEnd: 60
}

// بعد حذف جميع المقاطع:
activeMemorizationSurah: {
  surahNumber: null,   // ✅ تم المسح
  surahName: null,
  lastAyahEnd: 0
}

// الآن يمكن البدء بأي سورة جديدة! 🎉
```

---

## 📊 جدول مقارنة الحالات

| العملية | قبل V7 | بعد V7 |
|---------|--------|---------|
| **إضافة مقطع** | ✅ يحدث السورة الفعالة | ✅ يحدث السورة الفعالة |
| **تعديل مقطع** | ✅ يحدث السورة الفعالة | ✅ يحدث السورة الفعالة |
| **حذف مقطع** | ❌ لا يحدث السورة الفعالة | ✅ يعيد حساب السورة الفعالة |
| **حذف جميع المقاطع** | ❌ السورة الفعالة عالقة | ✅ يمسح السورة الفعالة |

---

## 🔍 Group Methods المستخدمة

### 1. `canAddSegment(groupId, surahNumber, type)`
**الوظيفة:** فحص إمكانية إضافة مقطع لسورة معينة

```javascript
// المنطق:
// 1. إذا لا توجد سورة فعالة → ✅ مسموح
// 2. إذا السورة الفعالة مكتملة → ✅ مسموح
// 3. إذا نفس السورة الفعالة → ✅ مسموح
// 4. إذا سورة مختلفة → ❌ ممنوع (يجب إكمال السورة الفعالة أولاً)
// 5. إذا السورة الفعالة ليس لها مقاطع → ✅ يمسح السورة ويسمح

const canAdd = await Group.canAddSegment(groupId, 3, 'memorization');
if (!canAdd.allowed) {
  console.log(canAdd.reason);
  // "يجب إكمال سورة البقرة أولاً"
}
```

### 2. `activateSurah(groupId, surahNumber, surahName, ayahEnd, type)`
**الوظيفة:** تفعيل سورة جديدة كسورة فعالة

```javascript
await Group.activateSurah(groupId, 2, "البقرة", 20, 'memorization');

// النتيجة:
activeMemorizationSurah: {
  surahNumber: 2,
  surahName: "البقرة",
  lastAyahEnd: 20,
  isCompleted: false,
  startedAt: new Date()
}
```

### 3. `updateLastAyah(groupId, ayahEnd, type)`
**الوظيفة:** تحديث آخر آية للسورة الفعالة

```javascript
await Group.updateLastAyah(groupId, 40, 'memorization');

// النتيجة:
activeMemorizationSurah.lastAyahEnd: 40  // ✅ تم التحديث
```

### 4. `checkAndCompleteSurah(groupId, currentAyah, totalAyahs, type)`
**الوظيفة:** فحص إكمال السورة تلقائياً

```javascript
// إذا وصلنا إلى آخر آية:
await Group.checkAndCompleteSurah(groupId, 286, 286, 'memorization');

// النتيجة:
activeMemorizationSurah: {
  surahNumber: 2,
  lastAyahEnd: 286,
  isCompleted: true,      // ✅ تم الإكمال
  completedAt: new Date()
}

// الآن يمكن البدء بسورة جديدة!
```

### 5. `getActiveSurahs(groupId)`
**الوظيفة:** جلب السور الفعالة الحالية

```javascript
const activeSurahs = await Group.getActiveSurahs(groupId);

console.log(activeSurahs);
// {
//   memorization: { surahNumber: 2, lastAyahEnd: 40, ... },
//   review: { surahNumber: 5, lastAyahEnd: 100, ... }
// }
```

---

## 🎯 Flow Diagrams

### CREATE Flow:
```
المستخدم يضيف مقطع
    ↓
Controller Validation
    ↓
canAddSegment() ← فحص السورة الفعالة
    ↓
    ├─→ ممنوع: "يجب إكمال السورة الحالية"
    └─→ مسموح: متابعة
         ↓
    Section.save()
         ↓
    Schema Middleware (post save)
         ↓
    activateSurah() أو updateLastAyah()
         ↓
    ✅ السورة الفعالة محدثة
```

### UPDATE Flow:
```
المستخدم يعدل مقطع
    ↓
Controller Validation
    ↓
هل تغيرت السورة؟
    ├─→ نعم: canAddSegment()
    │         ↓
    │     ممنوع أو مسموح
    └─→ لا: متابعة مباشرة
         ↓
    Section.save()
         ↓
    Schema Middleware (post save)
         ↓
    updateLastAyah()
         ↓
    ✅ السورة الفعالة محدثة
```

### DELETE Flow:
```
المستخدم يحذف مقطع
    ↓
حفظ بيانات المقطع
    ↓
Section.findByIdAndDelete()
    ↓
Schema Middleware (pre delete)
    ↓
حذف TimeTable
    ↓
Schema Middleware (post delete)
    ↓
recalculateActiveSurah()
    ↓
    ├─→ لا توجد مقاطع متبقية
    │   └─→ مسح السورة الفعالة
    │
    └─→ توجد مقاطع
        └─→ إعادة حساب lastAyahEnd
    ↓
✅ السورة الفعالة محدثة
```

---

## ⚙️ الإعدادات الحرجة

### 1. Middleware Order:
```javascript
// ✅ الترتيب الصحيح:
pre("findOneAndDelete")   // حذف TimeTable
↓
findByIdAndDelete()       // حذف Section
↓
post("findOneAndDelete")  // إعادة حساب Active Surah
```

### 2. Controller vs Middleware:
| المكان | المسؤولية |
|--------|-----------|
| **Controller** | Validation + Business Logic + Bulk Operations |
| **Middleware** | Auto-sync + Cleanup + Single Operations |

### 3. deleteMany() Limitation:
```javascript
// ⚠️ Schema middleware لا يعمل مع deleteMany()
await Section.deleteMany({ _id: { $in: sectionIds } });
// ❌ post("findOneAndDelete") لن يُستدعى!

// ✅ الحل: استخدام Controller logic في bulkDelete
for (const [groupId, types] of affectedGroups) {
  if (types.hasMemorization) {
    await recalculateActiveSurah(groupId, 'memorization');
  }
}
```

---

## 🧪 اختبار الشامل

### Test Case 1: Create → Update → Delete
```javascript
// 1. إضافة مقطع:
POST /api/daily-marks/sections
{ memorizationMeta: [{ surahNumber: 2, ayahEnd: 20 }] }
// ✅ activeSurah.lastAyahEnd = 20

// 2. تعديل:
PUT /api/daily-marks/sections/:id
{ memorizationMeta: [{ surahNumber: 2, ayahEnd: 40 }] }
// ✅ activeSurah.lastAyahEnd = 40

// 3. حذف:
DELETE /api/daily-marks/sections/:id
// ✅ activeSurah.lastAyahEnd = 0 (أو من مقاطع أخرى)
```

### Test Case 2: Multiple Sections
```javascript
// 1. إضافة 3 مقاطع:
Section 1: البقرة 1-20
Section 2: البقرة 21-40
Section 3: البقرة 41-60
// ✅ lastAyahEnd = 60

// 2. حذف Section 3:
DELETE /api/daily-marks/sections/:id3
// ✅ lastAyahEnd = 40

// 3. حذف Section 2:
DELETE /api/daily-marks/sections/:id2
// ✅ lastAyahEnd = 20

// 4. حذف Section 1:
DELETE /api/daily-marks/sections/:id1
// ✅ activeSurah = null
```

---

## 📝 الخلاصة النهائية

### ✅ ما تم تطبيقه:

| العملية | Controller | Schema Middleware | Group Methods |
|---------|-----------|------------------|---------------|
| **CREATE** | canAddSegment() | post(save) → activateSurah/updateLastAyah | ✅ |
| **UPDATE** | canAddSegment() | post(save) → updateLastAyah | ✅ |
| **DELETE** | recalculateActiveSurah() | post(findOneAndDelete) → recalculate | ✅ |

### 🎯 الضمانات:
1. ✅ **لا يمكن** البدء بسورة جديدة قبل إكمال السورة الفعالة
2. ✅ **lastAyahEnd** دائماً صحيح (يتحدث مع كل عملية)
3. ✅ **عند حذف جميع المقاطع** → يتم مسح السورة الفعالة
4. ✅ **Double Protection**: Controller + Schema Middleware

---

**Version**: V7  
**Last Updated**: 2026-01-18  
**Files Modified**:
- `create.controller.js`
- `update.controller.js`
- `delete.controller.js`
- `Section.js` (Schema)
- `Group.js` (Methods)
