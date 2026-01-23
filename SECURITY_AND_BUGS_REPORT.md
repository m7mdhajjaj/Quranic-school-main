# 🔒 تقرير الأخطاء والثغرات الأمنية - نظام القرآن AI

## 📋 الفهرس
1. [الأخطاء المؤكدة (Bugs)](#1-الأخطاء-المؤكدة-bugs)
2. [الثغرات الأمنية](#2-الثغرات-الأمنية)
3. [تحسينات الأداء](#3-تحسينات-الأداء)
4. [Patches جاهزة للتطبيق](#4-patches-جاهزة-للتطبيق)

---

## 1️⃣ الأخطاء المؤكدة (Bugs)

### 🐛 Bug #1: `mongoose.Types.ObjectId()` deprecated
**الملف:** [FavoriteController.js](Backend/src/controllers/AiChatController/FavoriteController.js#L203)

**السبب:**
```javascript
// ❌ الكود الحالي - deprecated في Mongoose 7+
{ $match: { user: mongoose.Types.ObjectId(userId) } }
```

**الأثر:** 
- Warning في الـ logs
- سيتوقف عن العمل في Mongoose 8+

**الحل:**
```javascript
// ✅ الصحيح
{ $match: { user: new mongoose.Types.ObjectId(userId) } }
```

---

### 🐛 Bug #2: `NaN` في semantic search عند vectors فارغة
**الملف:** [EmbeddingsService.js](Backend/src/services/Quran/EmbeddingsService.js#L76-L90)

**السبب:**
```javascript
// ❌ القسمة على صفر ممكنة إذا كان الـ vector كله أصفار
return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
```

**الأثر:**
- إرجاع `NaN` بدل نسبة تشابه صحيحة
- فشل ترتيب النتائج

**الحل:**
```javascript
static cosineSimilarity(vecA, vecB) {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  
  // ✅ منع القسمة على صفر
  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  if (denominator === 0) return 0;
  
  return dotProduct / denominator;
}
```

---

### 🐛 Bug #3: Memory Leak - تحميل كل الآيات في الذاكرة
**الملف:** [QuranRAGService.js](Backend/src/services/Quran/QuranRAGService.js#L24-L31)

**السبب:**
```javascript
// ❌ يجلب كل الآيات (6236 آية) في الذاكرة!
const ayahs = await QuranAyah.find(filter)
  .select('surahNumber ayahNumber ayahKey textArabic tafsirArabic embedding');
```

**الأثر:**
- استهلاك ذاكرة ضخم (~100MB+ للـ embeddings)
- بطء شديد في البحث
- خطر OOM (Out of Memory)

**الحل:** سيتم توضيحه في قسم تحسينات الأداء.

---

### 🐛 Bug #4: Text Index غير موجود
**الملف:** [QuranRAGService.js](Backend/src/services/Quran/QuranRAGService.js#L104-L110)

**السبب:**
```javascript
// ❌ $text search يتطلب text index على الـ collection
const filter = { $text: { $search: query } };
```

**الأثر:**
- `MongoError: text index required for $text query`
- Fallback إلى regex في كل مرة

**الحل:** إضافة Text Index في الـ Schema (سيتم توضيحه في Patches).

---

### 🐛 Bug #5: تضارب أسماء الحقول بين Import و Fetch
**الملفات:** 
- [QuranImportService.js](Backend/src/services/Quran/QuranImportService.js)
- [QuranAyah Schema](Backend/src/schema/AI/Quran/QuranAyah.js)

**السبب:**
```javascript
// Import يستخدم:
textArabic: ayah.text || ayah.textArabic

// لكن الـ Schema يتوقع:
textArabic: { type: String, required: true }
textSimplified: { type: String, index: true }  // ← لا يتم حفظه!
```

**الأثر:**
- `textSimplified` دائماً `undefined`
- البحث بـ `textSimplified` لا يرجع نتائج

**الحل:**
```javascript
static async importAyahs(filePath) {
  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  const ayahs = data.ayahs || data;
  
  let imported = 0;
  for (const ayah of ayahs) {
    const textArabic = ayah.text || ayah.textArabic;
    
    await QuranAyah.findOneAndUpdate(
      { ayahKey: `${ayah.surahNumber}:${ayah.ayahNumber}` },
      {
        surahNumber: ayah.surahNumber,
        ayahNumber: ayah.ayahNumber,
        ayahKey: `${ayah.surahNumber}:${ayah.ayahNumber}`,
        textArabic: textArabic,
        // ✅ إضافة textSimplified
        textSimplified: normalizeArabicText(textArabic),
        tafsirArabic: ayah.tafsir || ayah.tafsirArabic,
        juzNumber: ayah.juz || ayah.juzNumber
      },
      { upsert: true, new: true }
    );
    imported++;
  }
  
  return { imported, collection: 'quran_ayahs' };
}

// دالة مساعدة
function normalizeArabicText(text) {
  if (!text) return '';
  return text
    .replace(/[\u064B-\u065F\u0670]/g, '') // إزالة التشكيل
    .replace(/[أإآ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ي');
}
```

---

### 🐛 Bug #6: Route `/import` بدون Authentication
**الملف:** [quranRoutes.js](Backend/src/routes/AiChatRoutes/QuranRoutes/quranRoutes.js#L32)

**السبب:**
```javascript
// ❌ لا يوجد protect middleware!
router.post('/import', quranController.importQuranData);
```

**الأثر:**
- أي شخص يمكنه استيراد/تعديل بيانات القرآن
- ثغرة أمنية خطيرة

**الحل:**
```javascript
// ✅ إضافة حماية + تقييد للـ admin فقط
const { protect, authorize } = require('../../../middleware/auth');
router.post('/import', protect, authorize('admin'), quranController.importQuranData);
```

---

## 2️⃣ الثغرات الأمنية

### 🔴 Critical #1: Path Traversal في importQuranData
**الملف:** [QuranImportService.js](Backend/src/services/Quran/QuranImportService.js#L14-15)

**نوع الثغرة:** Path Traversal (LFI - Local File Inclusion)

**الكود الخطير:**
```javascript
// ❌ يقرأ أي ملف على السيرفر!
static async importSurahs(filePath) {
  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
```

**طريقة الاستغلال:**
```json
POST /api/quran/import
{
  "type": "surahs",
  "filePath": "../../../etc/passwd"
}
// أو
{
  "type": "surahs", 
  "filePath": "C:\\Windows\\System32\\config\\SAM"
}
```

**الأثر:**
- قراءة أي ملف على السيرفر
- تسريب credentials
- RCE محتمل

**Patch آمن:**
```javascript
const path = require('path');

// ✅ دالة للتحقق من المسار الآمن
function getSafeFilePath(userPath) {
  const ALLOWED_DIR = path.resolve(__dirname, '../../data/quran');
  const resolvedPath = path.resolve(ALLOWED_DIR, path.basename(userPath));
  
  // تأكد أن المسار داخل المجلد المسموح
  if (!resolvedPath.startsWith(ALLOWED_DIR)) {
    throw new Error('مسار الملف غير مسموح');
  }
  
  // تأكد أن الامتداد .json فقط
  if (path.extname(resolvedPath).toLowerCase() !== '.json') {
    throw new Error('نوع الملف غير مدعوم');
  }
  
  return resolvedPath;
}

static async importSurahs(filePath) {
  const safePath = getSafeFilePath(filePath);
  const data = JSON.parse(fs.readFileSync(safePath, 'utf-8'));
  // ...
}
```

---

### 🔴 Critical #2: ReDoS في Regex (Regex Denial of Service)
**الملفات:** 
- [QuranRAGService.js](Backend/src/services/Quran/QuranRAGService.js#L122-131)
- [TafsirRAGService.js](Backend/src/services/Quran/TafsirRAGService.js#L114-123)

**نوع الثغرة:** ReDoS - Catastrophic Backtracking

**الكود الخطير:**
```javascript
// ❌ user input يذهب مباشرة للـ regex!
const filter = {
  $or: [
    { textArabic: { $regex: query, $options: 'i' } },
    { textSimplified: { $regex: query, $options: 'i' } },
    { tafsirArabic: { $regex: query, $options: 'i' } }
  ]
};
```

**طريقة الاستغلال:**
```
query = "(a+)+$"
// أو
query = "((a+)+)+$"
```
هذا يسبب CPU spike ويعلق السيرفر.

**Patch آمن:**
```javascript
// ✅ تنظيف الـ query قبل استخدامه في regex
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ✅ تحديد طول أقصى
function sanitizeSearchQuery(query) {
  if (!query || typeof query !== 'string') return '';
  
  // حد أقصى 100 حرف
  const trimmed = query.substring(0, 100);
  
  // escape regex characters
  return escapeRegex(trimmed);
}

static async searchByRegex(query, options = {}) {
  const { limit = 10, surahNumber = null } = options;
  
  // ✅ تنظيف المدخل
  const safeQuery = sanitizeSearchQuery(query);
  if (!safeQuery) return [];

  const filter = {
    $or: [
      { textArabic: { $regex: safeQuery, $options: 'i' } },
      { textSimplified: { $regex: safeQuery, $options: 'i' } },
      { tafsirArabic: { $regex: safeQuery, $options: 'i' } }
    ]
  };
  // ...
}
```

---

### 🟠 Medium #3: XSS في Favorite Tags
**الملف:** [FavoriteController.js](Backend/src/controllers/AiChatController/FavoriteController.js#L36)

**نوع الثغرة:** Stored XSS

**الكود الخطير:**
```javascript
// ❌ يحفظ الـ tags بدون sanitization
const favorite = await AiChatFavorite.create({
  user: userId,
  question,
  answer,
  tags: tags || [],  // ← يمكن أن يحتوي على <script>
  note: note || ''
});
```

**طريقة الاستغلال:**
```json
{
  "question": "test",
  "answer": "test",
  "tags": ["<script>alert('XSS')</script>"]
}
```

**Patch آمن:**
```javascript
// ✅ تنظيف الـ tags
function sanitizeTags(tags) {
  if (!Array.isArray(tags)) return [];
  
  return tags
    .map(tag => {
      if (typeof tag !== 'string') return null;
      // إزالة HTML tags
      return tag
        .replace(/<[^>]*>/g, '')
        .replace(/[<>"'&]/g, '')
        .trim()
        .substring(0, 50); // حد أقصى 50 حرف
    })
    .filter(tag => tag && tag.length > 0)
    .slice(0, 10); // حد أقصى 10 tags
}

const favorite = await AiChatFavorite.create({
  user: userId,
  question: question.substring(0, 1000), // حد أقصى
  answer: answer.substring(0, 5000),
  tags: sanitizeTags(tags),
  note: (note || '').replace(/<[^>]*>/g, '').substring(0, 500)
});
```

---

### 🟠 Medium #4: Missing Rate Limiting على AI endpoints
**الملف:** [aiChatRoutes.js](Backend/src/routes/AiChatRoutes/aiChatRoutes.js)

**نوع الثغرة:** Resource Exhaustion / API Abuse

**الكود الحالي:**
```javascript
// ❌ لا يوجد rate limiting!
router.post('/', protect, validateChatMessage, aiChatController.chat);
router.post('/speak', protect, validateTTS, aiChatController.speak);
```

**الأثر:**
- استنزاف OpenAI credits
- فواتير ضخمة
- DoS على السيرفر

**Patch:**
```javascript
const rateLimit = require('express-rate-limit');

// ✅ Rate limiter للـ AI endpoints
const aiRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 دقيقة
  max: 10, // 10 طلبات في الدقيقة
  message: {
    success: false,
    message: 'طلبات كثيرة جداً، حاول لاحقاً'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const ttsRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5, // 5 طلبات TTS في الدقيقة
  message: {
    success: false,
    message: 'حد TTS: 5 طلبات في الدقيقة'
  }
});

router.post('/', protect, aiRateLimiter, validateChatMessage, aiChatController.chat);
router.post('/speak', protect, ttsRateLimiter, validateTTS, aiChatController.speak);
```

---

### 🟠 Medium #5: Embedding endpoints بدون حماية
**الملف:** [quranRoutes.js](Backend/src/routes/AiChatRoutes/QuranRoutes/quranRoutes.js#L110-114)

**الكود الخطير:**
```javascript
// ❌ توليد embeddings يكلف مال - بدون حماية!
router.post('/embeddings/ayahs', quranController.generateAyahEmbeddings);
router.post('/embeddings/tafsir', quranController.generateTafsirEmbeddings);
```

**Patch:**
```javascript
router.post('/embeddings/ayahs', protect, authorize('admin'), quranController.generateAyahEmbeddings);
router.post('/embeddings/tafsir', protect, authorize('admin'), quranController.generateTafsirEmbeddings);
```

---

## 3️⃣ تحسينات الأداء

### ⚡ Perf #1: Semantic Search يحمل كل الآيات
**المشكلة:**
البحث الدلالي يجلب 6236 آية مع embeddings (1536 رقم لكل آية) = ~37 مليون رقم في الذاكرة!

**الحل: استخدام MongoDB Atlas Vector Search أو تقسيم البحث**

```javascript
// ✅ إصدار محسن - البحث على دفعات
static async semanticSearch(query, options = {}) {
  const { limit = 10, threshold = 0.7, surahNumber = null } = options;

  try {
    const queryEmbedding = await EmbeddingsService.generateEmbedding(query);

    // ✅ جلب فقط top candidates باستخدام aggregation
    const filter = { embedding: { $exists: true, $ne: [] } };
    if (surahNumber) filter.surahNumber = surahNumber;

    // بدلاً من جلب الكل، نستخدم $sample أو نقسم على سور
    const BATCH_SIZE = 500;
    let allResults = [];
    
    const totalCount = await QuranAyah.countDocuments(filter);
    const batches = Math.ceil(totalCount / BATCH_SIZE);
    
    for (let i = 0; i < batches; i++) {
      const batch = await QuranAyah.find(filter)
        .skip(i * BATCH_SIZE)
        .limit(BATCH_SIZE)
        .select('surahNumber ayahNumber ayahKey textArabic tafsirArabic embedding')
        .lean(); // ✅ lean() أسرع بكثير
      
      const batchResults = batch
        .map(ayah => ({
          ...ayah,
          similarity: EmbeddingsService.cosineSimilarity(queryEmbedding, ayah.embedding)
        }))
        .filter(r => r.similarity >= threshold);
      
      allResults.push(...batchResults);
      
      // ✅ Early exit إذا جمعنا كفاية
      if (allResults.length >= limit * 3) {
        break;
      }
    }
    
    return allResults
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit)
      .map(r => {
        delete r.embedding;
        return r;
      });
      
  } catch (error) {
    console.error('Semantic search error:', error.message);
    return this.search(query, options);
  }
}
```

---

### ⚡ Perf #2: Embedding generation بدون batching فعلي
**المشكلة:**
في `generateAyahEmbeddings` في Controller، يتم توليد embedding واحد في كل loop.

**الكود الحالي:**
```javascript
// ❌ بطيء جداً - embedding واحد في كل iteration
for (const ayah of ayahs) {
  const embedding = await EmbeddingsService.generateEmbedding(ayah.textArabic);
  await QuranAyah.updateOne({ _id: ayah._id }, { embedding });
}
```

**الحل المحسن:**
```javascript
exports.generateAyahEmbeddings = async (req, res) => {
  try {
    const { startFrom = 0, limit = 100, forceRegenerate = false } = req.body;

    const filter = forceRegenerate ? {} : { embedding: { $exists: false } };
    const ayahs = await QuranAyah.find(filter)
      .skip(startFrom)
      .limit(limit)
      .select('_id ayahKey textArabic')
      .lean();

    if (ayahs.length === 0) {
      return res.json({ success: true, message: 'لا توجد آيات للمعالجة', data: { generated: 0 } });
    }

    // ✅ Batch processing
    const BATCH_SIZE = 50;
    let generated = 0;
    const errors = [];

    for (let i = 0; i < ayahs.length; i += BATCH_SIZE) {
      const batch = ayahs.slice(i, i + BATCH_SIZE);
      const texts = batch.map(a => a.textArabic);

      try {
        // ✅ توليد دفعة واحدة
        const embeddings = await EmbeddingsService.generateBatchEmbeddings(texts);

        // ✅ Bulk update
        const bulkOps = batch.map((ayah, idx) => ({
          updateOne: {
            filter: { _id: ayah._id },
            update: { $set: { embedding: embeddings[idx] } }
          }
        }));

        await QuranAyah.bulkWrite(bulkOps);
        generated += batch.length;

        // تأخير لتجنب rate limiting
        if (i + BATCH_SIZE < ayahs.length) {
          await new Promise(r => setTimeout(r, 200));
        }
      } catch (err) {
        errors.push({ batch: i, error: err.message });
      }
    }

    res.json({
      success: true,
      message: `تم توليد embeddings لـ ${generated} آية`,
      data: { generated, total: ayahs.length, errors: errors.length }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
```

---

### ⚡ Perf #3: إضافة Indexes ناقصة
**المشكلة:** البحث النصي بطيء لعدم وجود text indexes.

**الحل:** تحديث الـ Schema

```javascript
// في QuranAyah.js
QuranAyahSchema.index({ textArabic: 'text', textSimplified: 'text', tafsirArabic: 'text' });

// في TafsirIbnKathir.js  
TafsirIbnKathirSchema.index({ tafsir: 'text', ayahText: 'text', keywords: 'text' });
```

---

### ⚡ Perf #4: Caching للنتائج المتكررة
**المشكلة:** كل بحث يذهب للـ DB حتى لو نفس السؤال.

**الحل:**
```javascript
const NodeCache = require('node-cache');
const searchCache = new NodeCache({ stdTTL: 300 }); // 5 دقائق

static async search(query, options = {}) {
  const cacheKey = `search:${query}:${JSON.stringify(options)}`;
  
  // ✅ Check cache first
  const cached = searchCache.get(cacheKey);
  if (cached) return cached;

  // ... البحث الفعلي
  
  // ✅ حفظ في الـ cache
  searchCache.set(cacheKey, results);
  return results;
}
```

---

## 4️⃣ Patches جاهزة للتطبيق

### 📦 Patch 1: إصلاح QuranImportService.js

```javascript
// c:\Users\qsayx\OneDrive\Desktop\Quranic-school-main\Backend\src\services\Quran\QuranImportService.js

const fs = require('fs');
const path = require('path');
const { QuranSurah, QuranAyah, TafsirIbnKathir } = require('../../schema/AI/Quran');

// ✅ مجلد البيانات الآمن
const SAFE_DATA_DIR = path.resolve(__dirname, '../../data/quran');

// ✅ دالة تطبيع النص العربي
function normalizeArabicText(text) {
  if (!text) return '';
  return text
    .replace(/[\u064B-\u065F\u0670]/g, '')
    .replace(/[أإآ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ي');
}

// ✅ دالة التحقق من المسار الآمن
function getSafeFilePath(userPath) {
  if (!userPath || typeof userPath !== 'string') {
    throw new Error('مسار الملف مطلوب');
  }

  // السماح فقط باسم الملف، ليس مسار كامل
  const fileName = path.basename(userPath);
  const resolvedPath = path.join(SAFE_DATA_DIR, fileName);

  // تأكد من البقاء داخل المجلد الآمن
  if (!resolvedPath.startsWith(SAFE_DATA_DIR)) {
    throw new Error('مسار الملف غير مسموح');
  }

  // تأكد من أن الامتداد .json
  if (path.extname(resolvedPath).toLowerCase() !== '.json') {
    throw new Error('نوع الملف غير مدعوم - يجب أن يكون JSON');
  }

  // تأكد من وجود الملف
  if (!fs.existsSync(resolvedPath)) {
    throw new Error('الملف غير موجود');
  }

  return resolvedPath;
}

class QuranImportService {

  static async importSurahs(filePath) {
    const safePath = getSafeFilePath(filePath);
    const data = JSON.parse(fs.readFileSync(safePath, 'utf-8'));
    const surahs = data.surahs || data;
    
    let imported = 0;
    for (const surah of surahs) {
      await QuranSurah.findOneAndUpdate(
        { number: surah.number },
        {
          number: surah.number,
          nameArabic: surah.name || surah.nameArabic,
          nameEnglish: surah.englishName || surah.nameEnglish,
          ayahCount: surah.numberOfAyahs || surah.ayahCount,
          revelationType: surah.revelationType || 'Meccan'
        },
        { upsert: true, new: true }
      );
      imported++;
    }
    
    return { imported, collection: 'quran_surahs' };
  }

  static async importAyahs(filePath) {
    const safePath = getSafeFilePath(filePath);
    const data = JSON.parse(fs.readFileSync(safePath, 'utf-8'));
    const ayahs = data.ayahs || data;
    
    let imported = 0;
    for (const ayah of ayahs) {
      const textArabic = ayah.text || ayah.textArabic;
      
      await QuranAyah.findOneAndUpdate(
        { ayahKey: `${ayah.surahNumber}:${ayah.ayahNumber}` },
        {
          surahNumber: ayah.surahNumber,
          ayahNumber: ayah.ayahNumber,
          ayahKey: `${ayah.surahNumber}:${ayah.ayahNumber}`,
          textArabic: textArabic,
          textSimplified: normalizeArabicText(textArabic), // ✅ إضافة
          tafsirArabic: ayah.tafsir || ayah.tafsirArabic,
          juzNumber: ayah.juz || ayah.juzNumber
        },
        { upsert: true, new: true }
      );
      imported++;
    }
    
    return { imported, collection: 'quran_ayahs' };
  }

  static async importTafsirIbnKathir(filePath) {
    const safePath = getSafeFilePath(filePath);
    const data = JSON.parse(fs.readFileSync(safePath, 'utf-8'));
    const tafsirs = Array.isArray(data) ? data : data.tafsirs || [data];
    
    let imported = 0;
    for (const tafsir of tafsirs) {
      await TafsirIbnKathir.findOneAndUpdate(
        { ayahKey: tafsir.ayahKey || `${tafsir.surahNumber}:${tafsir.ayahNumber}` },
        {
          surahNumber: tafsir.surahNumber,
          surahName: tafsir.surahName,
          surahType: tafsir.surahType,
          ayahNumber: tafsir.ayahNumber,
          ayahKey: tafsir.ayahKey || `${tafsir.surahNumber}:${tafsir.ayahNumber}`,
          ayahText: tafsir.ayahText,
          tafsir: tafsir.tafsir,
          tafsirShort: tafsir.tafsir?.substring(0, 500),
          keywords: tafsir.keywords || []
        },
        { upsert: true, new: true }
      );
      imported++;
    }
    
    return { imported, collection: 'tafsir_ibn_kathir' };
  }

  static async getStats() {
    const [surahCount, ayahCount, tafsirCount] = await Promise.all([
      QuranSurah.countDocuments(),
      QuranAyah.countDocuments(),
      TafsirIbnKathir.countDocuments()
    ]);

    return {
      surahs: surahCount,
      ayahs: ayahCount,
      tafsir_ibn_kathir: tafsirCount,
      total: surahCount + ayahCount + tafsirCount
    };
  }
}

module.exports = QuranImportService;
```

---

### 📦 Patch 2: إصلاح EmbeddingsService.js

```javascript
// إضافة في EmbeddingsService.js - دالة cosineSimilarity المحسنة

static cosineSimilarity(vecA, vecB) {
  // ✅ التحقق من المدخلات
  if (!vecA || !vecB) return 0;
  if (!Array.isArray(vecA) || !Array.isArray(vecB)) return 0;
  if (vecA.length !== vecB.length) return 0;
  if (vecA.length === 0) return 0;
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < vecA.length; i++) {
    const a = vecA[i] || 0;
    const b = vecB[i] || 0;
    dotProduct += a * b;
    normA += a * a;
    normB += b * b;
  }
  
  // ✅ منع القسمة على صفر
  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  if (denominator === 0 || isNaN(denominator)) return 0;
  
  const similarity = dotProduct / denominator;
  
  // ✅ التأكد من أن النتيجة بين 0 و 1
  return Math.max(0, Math.min(1, similarity));
}
```

---

### 📦 Patch 3: إصلاح FavoriteController.js

```javascript
// إضافة في أعلى الملف
function sanitizeTags(tags) {
  if (!Array.isArray(tags)) return [];
  
  return tags
    .map(tag => {
      if (typeof tag !== 'string') return null;
      return tag
        .replace(/<[^>]*>/g, '')
        .replace(/[<>"'&]/g, '')
        .trim()
        .substring(0, 50);
    })
    .filter(tag => tag && tag.length > 0)
    .slice(0, 10);
}

function sanitizeText(text, maxLength = 1000) {
  if (!text || typeof text !== 'string') return '';
  return text
    .replace(/<script[^>]*>.*?<\/script>/gi, '')
    .replace(/<[^>]*>/g, '')
    .trim()
    .substring(0, maxLength);
}

// تعديل في addFavorite
const favorite = await AiChatFavorite.create({
  user: userId,
  question: sanitizeText(question, 1000),
  answer: sanitizeText(answer, 5000),
  tags: sanitizeTags(tags),
  note: sanitizeText(note, 500)
});

// تعديل في getTags - إصلاح mongoose.Types.ObjectId
const tags = await AiChatFavorite.aggregate([
  { $match: { user: new mongoose.Types.ObjectId(userId) } }, // ✅ إضافة new
  { $unwind: '$tags' },
  { $group: { _id: '$tags', count: { $sum: 1 } } },
  { $sort: { count: -1 } }
]);
```

---

### 📦 Patch 4: إضافة Rate Limiting في aiChatRoutes.js

```javascript
// في بداية الملف
const rateLimit = require('express-rate-limit');

// ✅ Rate limiters
const aiChatLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: { success: false, message: 'طلبات كثيرة، انتظر دقيقة' },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.user?.id || req.ip
});

const ttsLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: { success: false, message: 'حد TTS: 5 طلبات/دقيقة' }
});

const sttLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { success: false, message: 'حد STT: 10 طلبات/دقيقة' }
});

// ✅ تطبيق على الـ routes
router.post('/', protect, aiChatLimiter, validateChatMessage, aiChatController.chat);
router.post('/speak', protect, ttsLimiter, validateTTS, aiChatController.speak);
router.post('/transcribe', protect, sttLimiter, upload.single('audio'), aiChatController.transcribeAudio);
```

---

### 📦 Patch 5: إصلاح quranRoutes.js - إضافة حماية

```javascript
// في بداية الملف
const { protect, authorize } = require('../../../middleware/auth');

// ✅ حماية routes الحساسة
router.post('/import', protect, authorize('admin'), quranController.importQuranData);
router.post('/embeddings/ayahs', protect, authorize('admin'), quranController.generateAyahEmbeddings);
router.post('/embeddings/tafsir', protect, authorize('admin'), quranController.generateTafsirEmbeddings);
```

---

### 📦 Patch 6: إصلاح QuranRAGService.js - searchByRegex

```javascript
// دالة مساعدة في أعلى الملف
function escapeRegex(str) {
  if (!str || typeof str !== 'string') return '';
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function sanitizeSearchQuery(query, maxLength = 100) {
  if (!query || typeof query !== 'string') return '';
  return escapeRegex(query.substring(0, maxLength).trim());
}

// تعديل searchByRegex
static async searchByRegex(query, options = {}) {
  const { limit = 10, surahNumber = null, juzNumber = null } = options;

  // ✅ تنظيف المدخل
  const safeQuery = sanitizeSearchQuery(query);
  if (!safeQuery || safeQuery.length < 2) {
    return [];
  }

  const filter = {
    $or: [
      { textArabic: { $regex: safeQuery, $options: 'i' } },
      { textSimplified: { $regex: safeQuery, $options: 'i' } },
      { tafsirArabic: { $regex: safeQuery, $options: 'i' } }
    ]
  };

  if (surahNumber) filter.surahNumber = parseInt(surahNumber);
  if (juzNumber) filter.juzNumber = parseInt(juzNumber);

  return QuranAyah.find(filter)
    .limit(Math.min(limit, 50)) // ✅ حد أقصى
    .select('surahNumber ayahNumber ayahKey textArabic tafsirArabic')
    .lean();
}
```

---

## ✅ ملخص التنفيذ

| الأولوية | المشكلة | الملف | الحالة |
|---------|--------|------|-------|
| 🔴 Critical | Path Traversal | QuranImportService.js | يجب إصلاحه فوراً |
| 🔴 Critical | ReDoS | QuranRAGService.js | يجب إصلاحه فوراً |
| 🔴 Critical | Missing Auth on /import | quranRoutes.js | يجب إصلاحه فوراً |
| 🟠 Medium | XSS in Tags | FavoriteController.js | مهم |
| 🟠 Medium | Missing Rate Limiting | aiChatRoutes.js | مهم |
| 🟡 Low | Deprecated ObjectId | FavoriteController.js | يُفضل إصلاحه |
| 🟡 Low | NaN in similarity | EmbeddingsService.js | يُفضل إصلاحه |
| ⚡ Perf | Memory Leak | QuranRAGService.js | يحسن الأداء |
| ⚡ Perf | Missing Indexes | Schema files | يحسن الأداء |

---

## 📝 ملاحظات نهائية

1. **لا تنسَ** إنشاء مجلد `Backend/src/data/quran/` ووضع ملفات JSON فيه
2. **تثبيت** `express-rate-limit` و `node-cache` إذا لم تكن موجودة
3. **تشغيل** migration لإضافة text indexes بعد التحديث
4. **اختبار** جميع الـ endpoints بعد التطبيق

