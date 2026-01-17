# 📖 Quran RAG System - دليل نظام البحث الذكي في القرآن

## 📁 البنية الجديدة

```
Backend/src/
├── schema/Quran/
│   ├── index.js           # تصدير السكيما
│   ├── QuranSurah.js      # سكيما السور (114)
│   ├── QuranJuz.js        # سكيما الأجزاء (30)
│   └── QuranAyah.js       # سكيما الآيات (~6236)
│
├── services/Quran/
│   ├── index.js           # تصدير السيرفسز
│   ├── QuranImportService.js   # استيراد البيانات
│   └── QuranRAGService.js      # البحث الذكي
│
├── controllers/QuranController/
│   ├── index.js           # تصدير الكونترولرز
│   ├── importController.js    # استيراد البيانات
│   ├── ragController.js       # البحث
│   ├── surahController.js     # عرض السور والآيات
│   └── quranService.js        # API خارجي (fallback)
│
└── routes/QuranRoutes/
    └── quranRoutes.js     # الراوتز
```

## 📊 قاعدة البيانات (MongoDB)

### QuranSurah - السور
| الحقل | النوع | الوصف |
|-------|------|-------|
| number | Number (1-114) | رقم السورة |
| nameArabic | String | اسم السورة بالعربية |
| nameEnglish | String | اسم السورة بالإنجليزية |
| ayahCount | Number | عدد الآيات |
| revelationPlace | Enum | Mecca / Medina |
| revelationType | Enum | Makkiyah / Madaniyah |
| startPage | Number | رقم الصفحة |
| juzNumbers | [Number] | أرقام الأجزاء |

### QuranAyah - الآيات
| الحقل | النوع | الوصف |
|-------|------|-------|
| surahNumber | Number (1-114) | رقم السورة |
| ayahNumber | Number | رقم الآية |
| ayahKey | String | "سورة:آية" مثل "2:255" |
| textArabic | String | نص الآية |
| textSimplified | String | نص بدون تشكيل (للبحث) |
| tafsirArabic | String | التفسير العربي |
| tajweedRules | [Object] | قواعد التجويد |
| juzNumber | Number (1-30) | رقم الجزء |
| hasSajda | Boolean | آية سجدة؟ |
| words | [String] | كلمات الآية |

### QuranJuz - الأجزاء
| الحقل | النوع | الوصف |
|-------|------|-------|
| number | Number (1-30) | رقم الجزء |
| start | Object | بداية الجزء (سورة، آية) |
| end | Object | نهاية الجزء |

## 🔗 API Endpoints

### استيراد البيانات
```
POST /api/quran/import
Body: { sourcePath?: string }
Response: { success, juz, surahs, ayahs, duration }
```

```
GET /api/quran/stats
Response: { juz, surahs, ayahs, isReady }
```

### عرض البيانات
```
GET /api/quran/surahs
Response: { success, data: [surahs] }

GET /api/quran/surah/:surahNumber
Response: { success, surah, ayahs }

GET /api/quran/ayah/:surahNumber/:ayahNumber
Response: { success, surah, ayah }
```

### البحث
```
GET /api/quran/search?query=الرحمن&limit=10&surah=2&juz=1
Response: { success, query, count, results }

GET /api/quran/search/surah/:surahNumber?query=...
Response: { success, surah, count, results }

GET /api/quran/search/word?word=الله&limit=50
Response: { success, data: { word, count, occurrences } }
```

### RAG للـ AI
```
GET /api/quran/context?surah=2&ayah=255&size=2
Response: { success, surah, targetAyah, context }

GET /api/quran/similar?surah=2&ayah=255&limit=5
Response: { success, reference, similar }

POST /api/quran/rag
Body: { query: "ما هي آية الكرسي", maxResults: 5 }
Response: { success, data: { found, context, results } }
```

## 🚀 طريقة الاستخدام

### 1. استيراد البيانات (مرة واحدة)
```bash
# من Postman أو curl
POST http://localhost:5000/api/quran/import
```

أو من الكود:
```javascript
const { QuranImportService } = require('./services/Quran');

const importService = new QuranImportService();
await importService.importAll();
```

### 2. البحث
```javascript
const { QuranRAGService } = require('./services/Quran');

// البحث النصي
const results = await QuranRAGService.search('الرحمن الرحيم', { limit: 10 });

// البحث عن كلمة
const wordResults = await QuranRAGService.searchWord('الله');

// الحصول على آية
const ayah = await QuranRAGService.getAyah(2, 255);

// سياق للـ AI
const ragContext = await QuranRAGService.buildRAGContext('ما معنى آية الكرسي');
```

### 3. مع AI Chatbot
```javascript
// في aiChatController.js
const { QuranRAGService } = require('../../services/Quran');

// بناء السياق
const ragContext = await QuranRAGService.buildRAGContext(userQuestion);

// إضافة للـ system prompt
const systemPrompt = `
أنت مساعد إسلامي. استخدم هذا السياق للإجابة:
${ragContext.context}
`;
```

## 📁 مصدر البيانات

المسار الافتراضي:
```
C:\Users\qsayx\Downloads\quranjson-master\quranjson-master\source
```

البنية:
```
source/
├── juz.json           ← الأجزاء (30)
├── surah.json         ← السور (114)
├── surah/             ← نصوص الآيات (114 ملف)
├── tajweed/           ← التجويد (114 ملف)
└── translation/ar/    ← التفسير العربي (114 ملف)
```

## ✅ الميزات

- 🔍 **بحث نصي دقيق** - Text Search Index
- 📝 **نص مبسط للبحث** - بدون تشكيل
- 📖 **التفسير العربي** - من التفسير الميسر
- 🎯 **قواعد التجويد** - مدمجة مع كل آية
- 🔗 **معرف فريد** - ayahKey (2:255)
- ⚡ **Fallback للـ API** - إذا لم تكن البيانات محلية
- 🤖 **جاهز للـ AI** - buildRAGContext
