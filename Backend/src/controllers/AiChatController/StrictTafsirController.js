/**
 * 🔒 نظام تفسير ابن كثير الصارم
 * Strict Ibn Kathir Tafsir System
 *
 * ❌ ممنوع الهلوسة
 * ❌ ممنوع التفسير من العقل
 * ✅ فقط من قاعدة البيانات
 */

const TafsirIbnKathir = require("../../schema/AI/Quran/TafsirIbnKathir");
const getOpenAIClient = require("../../config/openai");

// ═══════════════════════════════════════════════════════════════════════════
// 📖 استيراد البيانات الموحدة
// ═══════════════════════════════════════════════════════════════════════════

const { 
  SURAH_AYAH_COUNT, 
  SURAH_ARABIC_NAMES, 
  SURAH_CANONICAL,
  SURAH_LIST,
  validateAyahNumber 
} = require("../../data/surahData");

const { normalizeArabic } = require("../../utils/sanitization");

// ═══════════════════════════════════════════════════════════════════════════
// 🧠 نظام التصحيح الإملائي الذكي (Fuzzy Matching + AI)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * حساب مسافة Levenshtein بين كلمتين
 * @returns {number} عدد التعديلات المطلوبة
 */
function levenshteinDistance(str1, str2) {
  const m = str1.length;
  const n = str2.length;
  const dp = Array(m + 1)
    .fill(null)
    .map(() => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }
  return dp[m][n];
}

/**
 * حساب نسبة التشابه بين كلمتين
 * @returns {number} نسبة من 0 إلى 1
 */
function similarity(str1, str2) {
  const maxLen = Math.max(str1.length, str2.length);
  if (maxLen === 0) return 1;
  return 1 - levenshteinDistance(str1, str2) / maxLen;
}

/**
 * البحث الذكي عن اسم السورة (Fuzzy Search)
 * @param {string} input - النص المدخل (قد يحتوي على أخطاء إملائية)
 * @returns {{ surahNumber: number, surahName: string, confidence: number } | null}
 */
function fuzzyFindSurah(input) {
  const normalizedInput = normalizeArabic(input);

  // ✅ استخدام القائمة المستوردة من surahData.js
  let bestMatch = null;
  let bestScore = 0;
  const THRESHOLD = 0.6; // الحد الأدنى للتشابه (60%)

  for (const surah of SURAH_CANONICAL) {
    for (const name of surah.names) {
      const normalizedName = normalizeArabic(name);

      // البحث الدقيق أولاً
      if (normalizedInput.includes(normalizedName)) {
        return {
          surahNumber: surah.number,
          surahName: surah.names[0],
          confidence: 1.0,
        };
      }

      // البحث التقريبي (Fuzzy)
      // نقسم النص إلى كلمات ونبحث في كل كلمة
      const words = normalizedInput.split(/\s+/);
      for (const word of words) {
        if (word.length < 2) continue;

        const score = similarity(word, normalizedName);
        if (score > bestScore && score >= THRESHOLD) {
          bestScore = score;
          bestMatch = {
            surahNumber: surah.number,
            surahName: surah.names[0],
            confidence: score,
          };
        }
      }
    }
  }

  return bestMatch;
}

/**
 * 🔍 البحث عن أقرب السور (للاقتراحات عند الخطأ الإملائي)
 * @param {string} input - النص المدخل (قد يحتوي على أخطاء إملائية)
 * @param {number} limit - عدد الاقتراحات المطلوبة
 * @returns {Array<{ surahNumber: number, surahName: string, confidence: number }>}
 */
function findClosestSurahs(input, limit = 5) {
  const normalizedInput = normalizeArabic(input);
  
  // ✅ استخدام القائمة المستوردة من surahData.js

  // استخراج الكلمات من النص
  const words = normalizedInput.split(/\s+/).filter(w => w.length >= 2);
  
  // حساب التشابه لكل سورة
  const results = [];
  
  for (const surah of SURAH_LIST) {
    const normalizedName = normalizeArabic(surah.name);
    let maxScore = 0;
    
    // مقارنة مع كل كلمة في النص
    for (const word of words) {
      const score = similarity(word, normalizedName);
      if (score > maxScore) {
        maxScore = score;
      }
    }
    
    // مقارنة مع النص كامل
    const fullScore = similarity(normalizedInput, normalizedName);
    if (fullScore > maxScore) {
      maxScore = fullScore;
    }
    
    if (maxScore >= 0.3) { // حد أدنى 30%
      results.push({
        surahNumber: surah.number,
        surahName: surah.name,
        confidence: maxScore
      });
    }
  }
  
  // ترتيب حسب التشابه وإرجاع الأعلى
  return results
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, limit);
}

/**
 * تصحيح الأخطاء الإملائية باستخدام AI
 * @param {string} text - النص المدخل
 * @returns {Promise<{ corrected: string, surah: number | null, ayah: number | null }>}
 */
async function aiSpellingCorrection(text) {
  try {
    const openai = getOpenAIClient();
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `أنت مصحح إملائي لأسماء سور القرآن الكريم.

مهمتك:
1. صحح الأخطاء الإملائية في اسم السورة
2. استخرج رقم السورة (1-114)
3. استخرج رقم الآية إن وُجد

أمثلة:
- "سور انلور ايع 7" → {"surah": 24, "ayah": 7, "corrected": "سورة النور آية 7"}
- "الباقره اية 255" → {"surah": 2, "ayah": 255, "corrected": "سورة البقرة آية 255"}
- "تفسير الفتحه" → {"surah": 1, "ayah": null, "corrected": "سورة الفاتحة"}
- "سوره يسن" → {"surah": 36, "ayah": null, "corrected": "سورة يس"}

أرجع JSON فقط:
{"surah": number|null, "ayah": number|null, "corrected": "النص المصحح"}`,
        },
        { role: "user", content: text },
      ],
      temperature: 0,
      max_tokens: 100,
    });

    const content = response.choices[0].message.content.trim();
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (error) {
    console.error("AI Spelling Correction error:", error.message);
  }
  return { corrected: text, surah: null, ayah: null };
}

// ═══════════════════════════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════════════════════
// �📚 قاموس أسماء السور (114 سورة)
// ═══════════════════════════════════════════════════════════════════════════

const SURAH_NAMES = {
  // الفاتحة
  الفاتحة: 1,
  فاتحة: 1,
  "ام الكتاب": 1,
  "أم الكتاب": 1,
  "السبع المثاني": 1,
  fatiha: 1,
  "al-fatiha": 1,
  alfatiha: 1,

  // البقرة
  البقرة: 2,
  بقرة: 2,
  baqara: 2,
  "al-baqara": 2,
  albaqara: 2,

  // آل عمران
  "آل عمران": 3,
  "ال عمران": 3,
  عمران: 3,
  "ali imran": 3,

  // النساء
  النساء: 4,
  نساء: 4,
  nisa: 4,
  "an-nisa": 4,

  // المائدة
  المائدة: 5,
  مائدة: 5,
  maida: 5,
  "al-maida": 5,

  // الأنعام
  الأنعام: 6,
  الانعام: 6,
  انعام: 6,
  anam: 6,

  // الأعراف
  الأعراف: 7,
  الاعراف: 7,
  اعراف: 7,
  araf: 7,

  // الأنفال
  الأنفال: 8,
  الانفال: 8,
  انفال: 8,
  anfal: 8,

  // التوبة
  التوبة: 9,
  توبة: 9,
  براءة: 9,
  tawba: 9,

  // يونس - هود - يوسف
  يونس: 10,
  yunus: 10,
  هود: 11,
  hud: 11,
  يوسف: 12,
  yusuf: 12,

  // الرعد - إبراهيم - الحجر
  الرعد: 13,
  رعد: 13,
  raad: 13,
  إبراهيم: 14,
  ابراهيم: 14,
  ibrahim: 14,
  الحجر: 15,
  حجر: 15,
  hijr: 15,

  // النحل - الإسراء - الكهف
  النحل: 16,
  نحل: 16,
  nahl: 16,
  الإسراء: 17,
  الاسراء: 17,
  اسراء: 17,
  "بني إسرائيل": 17,
  isra: 17,
  الكهف: 18,
  كهف: 18,
  kahf: 18,

  // مريم - طه - الأنبياء
  مريم: 19,
  maryam: 19,
  طه: 20,
  taha: 20,
  الأنبياء: 21,
  الانبياء: 21,
  انبياء: 21,
  anbiya: 21,

  // الحج - المؤمنون - النور
  الحج: 22,
  حج: 22,
  hajj: 22,
  المؤمنون: 23,
  المومنون: 23,
  مؤمنون: 23,
  muminun: 23,
  النور: 24,
  نور: 24,
  nur: 24,

  // الفرقان - الشعراء - النمل - القصص
  الفرقان: 25,
  فرقان: 25,
  furqan: 25,
  الشعراء: 26,
  شعراء: 26,
  shuara: 26,
  النمل: 27,
  نمل: 27,
  naml: 27,
  القصص: 28,
  قصص: 28,
  qasas: 28,

  // العنكبوت - الروم - لقمان - السجدة
  العنكبوت: 29,
  عنكبوت: 29,
  ankabut: 29,
  الروم: 30,
  روم: 30,
  rum: 30,
  لقمان: 31,
  luqman: 31,
  السجدة: 32,
  سجدة: 32,
  sajda: 32,

  // الأحزاب - سبأ - فاطر - يس
  الأحزاب: 33,
  الاحزاب: 33,
  احزاب: 33,
  ahzab: 33,
  سبأ: 34,
  سبا: 34,
  saba: 34,
  فاطر: 35,
  fatir: 35,
  يس: 36,
  ياسين: 36,
  يسن: 36,
  yasin: 36,

  // الصافات - ص - الزمر - غافر
  الصافات: 37,
  صافات: 37,
  saffat: 37,
  ص: 38,
  صاد: 38,
  sad: 38,
  الزمر: 39,
  زمر: 39,
  zumar: 39,
  غافر: 40,
  المؤمن: 40,
  المومن: 40,
  ghafir: 40,

  // فصلت - الشورى - الزخرف - الدخان
  فصلت: 41,
  "حم السجدة": 41,
  fussilat: 41,
  الشورى: 42,
  شورى: 42,
  shura: 42,
  الزخرف: 43,
  زخرف: 43,
  zukhruf: 43,
  الدخان: 44,
  دخان: 44,
  dukhan: 44,

  // الجاثية - الأحقاف - محمد - الفتح
  الجاثية: 45,
  جاثية: 45,
  jathiya: 45,
  الأحقاف: 46,
  الاحقاف: 46,
  احقاف: 46,
  ahqaf: 46,
  محمد: 47,
  muhammad: 47,
  الفتح: 48,
  فتح: 48,
  fath: 48,

  // الحجرات - ق - الذاريات - الطور
  الحجرات: 49,
  حجرات: 49,
  hujurat: 49,
  ق: 50,
  قاف: 50,
  qaf: 50,
  الذاريات: 51,
  ذاريات: 51,
  dhariyat: 51,
  الطور: 52,
  طور: 52,
  tur: 52,

  // النجم - القمر - الرحمن - الواقعة
  النجم: 53,
  نجم: 53,
  najm: 53,
  القمر: 54,
  قمر: 54,
  qamar: 54,
  الرحمن: 55,
  رحمن: 55,
  rahman: 55,
  الواقعة: 56,
  واقعة: 56,
  waqia: 56,

  // الحديد - المجادلة - الحشر - الممتحنة
  الحديد: 57,
  حديد: 57,
  hadid: 57,
  المجادلة: 58,
  مجادلة: 58,
  mujadila: 58,
  الحشر: 59,
  حشر: 59,
  hashr: 59,
  الممتحنة: 60,
  ممتحنة: 60,
  mumtahina: 60,

  // الصف - الجمعة - المنافقون - التغابن
  الصف: 61,
  صف: 61,
  saff: 61,
  الجمعة: 62,
  جمعة: 62,
  jumua: 62,
  المنافقون: 63,
  منافقون: 63,
  munafiqun: 63,
  التغابن: 64,
  تغابن: 64,
  taghabun: 64,

  // الطلاق - التحريم - الملك - القلم
  الطلاق: 65,
  طلاق: 65,
  talaq: 65,
  التحريم: 66,
  تحريم: 66,
  tahrim: 66,
  الملك: 67,
  ملك: 67,
  تبارك: 67,
  mulk: 67,
  القلم: 68,
  قلم: 68,
  نون: 68,
  qalam: 68,

  // الحاقة - المعارج - نوح - الجن
  الحاقة: 69,
  حاقة: 69,
  haqqa: 69,
  المعارج: 70,
  معارج: 70,
  maarij: 70,
  نوح: 71,
  nuh: 71,
  الجن: 72,
  جن: 72,
  jinn: 72,

  // المزمل - المدثر - القيامة - الإنسان
  المزمل: 73,
  مزمل: 73,
  muzzammil: 73,
  المدثر: 74,
  مدثر: 74,
  muddaththir: 74,
  القيامة: 75,
  قيامة: 75,
  qiyama: 75,
  الإنسان: 76,
  الانسان: 76,
  انسان: 76,
  الدهر: 76,
  insan: 76,

  // المرسلات - النبأ - النازعات - عبس
  المرسلات: 77,
  مرسلات: 77,
  mursalat: 77,
  النبأ: 78,
  نبأ: 78,
  عم: 78,
  "عم يتساءلون": 78,
  naba: 78,
  النازعات: 79,
  نازعات: 79,
  naziat: 79,
  عبس: 80,
  abasa: 80,

  // التكوير - الانفطار - المطففين - الانشقاق
  التكوير: 81,
  تكوير: 81,
  takwir: 81,
  الانفطار: 82,
  انفطار: 82,
  infitar: 82,
  المطففين: 83,
  مطففين: 83,
  mutaffifin: 83,
  الانشقاق: 84,
  انشقاق: 84,
  inshiqaq: 84,

  // البروج - الطارق - الأعلى - الغاشية
  البروج: 85,
  بروج: 85,
  buruj: 85,
  الطارق: 86,
  طارق: 86,
  tariq: 86,
  الأعلى: 87,
  الاعلى: 87,
  اعلى: 87,
  سبح: 87,
  ala: 87,
  الغاشية: 88,
  غاشية: 88,
  ghashiya: 88,

  // الفجر - البلد - الشمس - الليل
  الفجر: 89,
  فجر: 89,
  fajr: 89,
  البلد: 90,
  بلد: 90,
  balad: 90,
  الشمس: 91,
  شمس: 91,
  shams: 91,
  الليل: 92,
  ليل: 92,
  layl: 92,

  // الضحى - الشرح - التين - العلق
  الضحى: 93,
  ضحى: 93,
  duha: 93,
  الشرح: 94,
  شرح: 94,
  الانشراح: 94,
  انشراح: 94,
  sharh: 94,
  التين: 95,
  تين: 95,
  tin: 95,
  العلق: 96,
  علق: 96,
  اقرأ: 96,
  alaq: 96,

  // القدر - البينة - الزلزلة - العاديات
  القدر: 97,
  قدر: 97,
  qadr: 97,
  البينة: 98,
  بينة: 98,
  bayyina: 98,
  الزلزلة: 99,
  زلزلة: 99,
  zalzala: 99,
  العاديات: 100,
  عاديات: 100,
  adiyat: 100,

  // القارعة - التكاثر - العصر - الهمزة
  القارعة: 101,
  قارعة: 101,
  qaria: 101,
  التكاثر: 102,
  تكاثر: 102,
  takathur: 102,
  العصر: 103,
  عصر: 103,
  asr: 103,
  الهمزة: 104,
  همزة: 104,
  humaza: 104,

  // الفيل - قريش - الماعون - الكوثر
  الفيل: 105,
  فيل: 105,
  fil: 105,
  قريش: 106,
  ايلاف: 106,
  إيلاف: 106,
  quraysh: 106,
  الماعون: 107,
  ماعون: 107,
  maun: 107,
  الكوثر: 108,
  كوثر: 108,
  kawthar: 108,

  // الكافرون - النصر - المسد - الإخلاص
  الكافرون: 109,
  كافرون: 109,
  kafirun: 109,
  النصر: 110,
  نصر: 110,
  nasr: 110,
  المسد: 111,
  مسد: 111,
  تبت: 111,
  اللهب: 111,
  masad: 111,
  الإخلاص: 112,
  الاخلاص: 112,
  اخلاص: 112,
   الصمد: 112,
  "قل هو الله أحد": 112,
  التوحيد: 112,
  ikhlas: 112,

  // الفلق - الناس
  الفلق: 113,
  فلق: 113,
  falaq: 113,
  الناس: 114,
  ناس: 114,
  nas: 114,
};

// ═══════════════════════════════════════════════════════════════════════════
// 📖 قاموس الآيات المشهورة
// ═══════════════════════════════════════════════════════════════════════════

const FAMOUS_VERSES = {
  // آية الكرسي
  "آية الكرسي": { surah: 2, ayah: 255 },
  الكرسي: { surah: 2, ayah: 255 },
  "اية الكرسي": { surah: 2, ayah: 255 },
  "ayat al kursi": { surah: 2, ayah: 255 },
  "ayatul kursi": { surah: 2, ayah: 255 },
  "الله لا إله إلا هو الحي القيوم": { surah: 2, ayah: 255 },
  "الله لا اله الا هو الحي القيوم": { surah: 2, ayah: 255 },

  // آيات أخرى مشهورة
  "آية النور": { surah: 24, ayah: 35 },
  "الله نور السماوات": { surah: 24, ayah: 35 },
  "آية الدين": { surah: 2, ayah: 282 },
  "أطول آية": { surah: 2, ayah: 282 },
  "خواتيم البقرة": { surah: 2, ayah: 285 },
  "آمن الرسول": { surah: 2, ayah: 285 },
  "إنا أعطيناك الكوثر": { surah: 108, ayah: 1 },
  "قل هو الله أحد": { surah: 112, ayah: 1 },
  "بسم الله الرحمن الرحيم": { surah: 1, ayah: 1 },
  "الحمد لله رب العالمين": { surah: 1, ayah: 2 },
  "إياك نعبد": { surah: 1, ayah: 5 },
};

// ═══════════════════════════════════════════════════════════════════════════
// 🧠 الـ AI Router - استخراج المفتاح القرآني (مع كشف الأخطاء الإملائية)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * استخراج مفتاح الآية من السؤال
 * @returns {{ 
 *   surah: number, 
 *   ayah: number, 
 *   needsConfirmation?: boolean,
 *   suggestions?: Array<{surahNumber: number, surahName: string, confidence: number}>
 * } | null}
 */
async function extractVerseKey(question) {
  const text = question.trim();
  const normalizedText = normalizeArabic(text);

  console.log(`🔍 Extracting verse key from: "${text}"`);

  // 1️⃣ البحث في الآيات المشهورة
  for (const [key, value] of Object.entries(FAMOUS_VERSES)) {
    const normalizedKey = normalizeArabic(key);
    if (normalizedText.includes(normalizedKey)) {
      console.log(
        `📌 Famous verse detected: ${key} → ${value.surah}:${value.ayah}`,
      );
      return value;
    }
  }

  // 2️⃣ البحث بنمط رقمي: "2:255" أو "2-255"
  const numericPattern = normalizedText.match(
    /(\d{1,3})\s*[:：\-]\s*(\d{1,3})/,
  );
  if (numericPattern) {
    const surah = parseInt(numericPattern[1]);
    const ayah = parseInt(numericPattern[2]);
    if (surah >= 1 && surah <= 114 && ayah >= 1) {
      console.log(`📌 Numeric pattern: ${surah}:${ayah}`);
      return { surah, ayah };
    }
  }

  // 3️⃣ البحث الدقيق باسم السورة في القاموس
  let foundSurah = null;
  let foundAyah = null;

  const sortedSurahNames = Object.entries(SURAH_NAMES).sort(
    (a, b) => b[0].length - a[0].length,
  );

  for (const [name, number] of sortedSurahNames) {
    const normalizedName = normalizeArabic(name);

    if (normalizedName.length <= 2) {
      const regex = new RegExp(
        `(^|\\s|سور[ةه]?\\s*)${normalizedName}(\\s|$|\\d)`,
        "i",
      );
      if (regex.test(normalizedText)) {
        foundSurah = number;
        console.log(`📌 Surah name detected (short): ${name} = ${number}`);
        break;
      }
    } else {
      if (normalizedText.includes(normalizedName)) {
        foundSurah = number;
        console.log(`📌 Surah name detected (exact): ${name} = ${number}`);
        break;
      }
    }
  }

  // 4️⃣ إذا وجدنا تطابق دقيق، نبحث عن رقم الآية
  if (foundSurah) {
    foundAyah = extractAyahNumber(text);
    if (foundAyah) {
      return { surah: foundSurah, ayah: foundAyah };
    }
    // سورة بدون آية - نحتاج رقم الآية
    return { surah: foundSurah, ayah: null, needsAyahNumber: true };
  }

  // 5️⃣ ❌ لم نجد تطابق دقيق - نبحث عن أقرب سور (للاقتراحات)
  const suggestions = findClosestSurahs(text, 3);
  
  if (suggestions.length > 0 && suggestions[0].confidence >= 0.4) {
    // 🔍 هناك اقتراحات - نسأل المستخدم "هل تقصد؟"
    console.log(`🔮 Spelling error detected, suggesting: ${suggestions.map(s => s.surahName).join(', ')}`);
    
    return {
      surah: null,
      ayah: null,
      needsConfirmation: true,
      suggestions: suggestions.slice(0, 2) // أقرب سورتين فقط
    };
  }

  return null;
}

/**
 * استخراج رقم الآية من النص
 */
function extractAyahNumber(text) {
  const ayahPatterns = [
    /آي[ةه]\s*(?:رقم)?\s*(\d{1,3})/,
    /الآي[ةه]\s*(\d{1,3})/,
    /اي[عةه]\s*(\d{1,3})/,
    /ايا\s*(\d{1,3})/,
    /ayah?\s*(\d{1,3})/i,
    /verse\s*(\d{1,3})/i,
    /(\d{1,3})\s*$/,
  ];

  for (const pattern of ayahPatterns) {
    const match = text.match(pattern);
    if (match) {
      return parseInt(match[1]);
    }
  }
  return null;
}

// ═══════════════════════════════════════════════════════════════════════════
// 🔍 التحقق من نوع السؤال
// ═══════════════════════════════════════════════════════════════════════════

/**
 * تحديد نوع السؤال: تفسير، دردشة عامة، أو ممنوع
 */
function classifyQuestion(question) {
  const text = question.toLowerCase().trim();
  const normalizedText = text
    .replace(/[أإآ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه");

  // ═══════════════════════════════════════════════════════════════════════
  // 1️⃣ أنماط الدردشة العامة (التحيات والأسئلة الودية)
  // ═══════════════════════════════════════════════════════════════════════
  const casualPatterns = [
    // تحيات
    /^(مرحبا|اهلا|هلا|السلام عليكم|صباح الخير|مساء الخير|هاي|هي|hello|hi|hey|salam)/i,
    /^(كيف حالك|كيفك|شو اخبارك|شلونك|ازيك|عامل ايه|how are you)/i,
    /^(شكرا|مشكور|الله يعطيك العافيه|يسلمو|thanks|thank you)/i,
    // أسئلة عن البوت
    /^(من انت|مين انت|ما اسمك|شو اسمك|عرفني عن نفسك|who are you|what is your name)/i,
    /^(ماذا تفعل|شو بتعمل|ايش تسوي|what can you do|what do you do)/i,
    /^(كيف استخدمك|كيف اسالك|كيف بشتغل معك|how to use)/i,
    // وداع
    /^(مع السلامه|باي|الى اللقاء|وداعا|bye|goodbye|see you)/i,
    // عبارات قصيرة جداً
    /^(اوك|تمام|حسنا|ok|okay|yes|no|نعم|لا)$/i,
  ];

  for (const pattern of casualPatterns) {
    if (pattern.test(normalizedText)) {
      return { type: "casual", reason: "greeting_or_casual" };
    }
  }

  // ═══════════════════════════════════════════════════════════════════════
  // 2️⃣ أنماط التفسير القرآني (صارم - من قاعدة البيانات فقط)
  // ═══════════════════════════════════════════════════════════════════════
  const tafsirPatterns = [
    /تفسير/,
    /فسر/,
    /معن[ىي]/,
    /شرح/,
    /ما معنى/,
    /ما المقصود/,
    /المقصود ب/,
    /tafsir/i,
    /meaning/i,
    /explain/i,
    /interpretation/i,
  ];

  for (const pattern of tafsirPatterns) {
    if (pattern.test(text)) {
      return { type: "tafsir", reason: "tafsir_keyword" };
    }
  }

  // إذا يحتوي على إشارة لآية أو سورة
  if (/آي[ةه]|سور[ةه]|\d{1,3}:\d{1,3}/.test(text)) {
    return { type: "tafsir", reason: "verse_reference" };
  }

  // التحقق من أسماء السور (بحث دقيق)
  for (const surahName of Object.keys(SURAH_NAMES)) {
    const normalizedSurahName = normalizeArabic(surahName);
    if (normalizedText.includes(normalizedSurahName)) {
      return { type: "tafsir", reason: "surah_name" };
    }
  }

  // 2.5️⃣ البحث الذكي (Fuzzy) - للأخطاء الإملائية
  const fuzzyResult = fuzzyFindSurah(text);
  if (fuzzyResult && fuzzyResult.confidence >= 0.6) {
    console.log(
      `🔮 Fuzzy classification: "${text}" matched "${fuzzyResult.surahName}" (${(fuzzyResult.confidence * 100).toFixed(0)}%)`,
    );
    return { type: "tafsir", reason: "fuzzy_surah_match" };
  }

  // ═══════════════════════════════════════════════════════════════════════
  // 3️⃣ أنماط ممنوعة (فتاوى وأحكام)
  // ═══════════════════════════════════════════════════════════════════════
  const forbiddenPatterns = [
    /رأي/,
    /حكم/,
    /فتو[ىي]/,
    /هل يجوز/,
    /حلال/,
    /حرام/,
    /قارن/,
    /الفرق بين/,
    /opinion/i,
    /fatwa/i,
    /ruling/i,
    /compare/i,
  ];

  for (const pattern of forbiddenPatterns) {
    if (pattern.test(text)) {
      return { type: "forbidden", reason: "fatwa_or_ruling" };
    }
  }

  // ═══════════════════════════════════════════════════════════════════════
  // 4️⃣ إذا يحتوي على رقم + كلمة تشبه سورة/آية → على الأرجح تفسير
  // ═══════════════════════════════════════════════════════════════════════
  if (/\d+/.test(text) && /سور|اي[عهة]|ايا/i.test(normalizedText)) {
    return { type: "tafsir", reason: "number_with_surah_pattern" };
  }

  // ═══════════════════════════════════════════════════════════════════════
  // 5️⃣ أي شيء آخر → دردشة عامة
  // ═══════════════════════════════════════════════════════════════════════
  return { type: "casual", reason: "general_chat" };
}

/**
 * معالجة الدردشة العامة باستخدام AI
 */
async function handleCasualChat(message) {
  try {
    const openai = getOpenAIClient();
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `أنت "المساعد الإسلامي" - مساعد ودود ومفيد في مدرسة قرآنية.

🎯 شخصيتك:
- ودود ومرحب ولطيف
- تتحدث بالعربية الفصحى البسيطة
- تحب مساعدة الطلاب

📚 تخصصك الرئيسي:
- تفسير الآيات القرآنية من تفسير ابن كثير
- يمكنك توجيه المستخدم لسؤالك عن تفسير آية محددة

🎨 **تنسيق الرد (هام جداً):**
إذا طلب المستخدم تفسير آية أو سورة ولم تستطع تحديدها بدقة، حاول أن تجيب بالتنسيق التالي لضمان ظهورها بشكل جميل:

📖 **سورة [اسم السورة] - الآية [رقم الآية]**

📜 **نص الآية:**
[نص الآية]

📚 **تفسير ابن كثير:**
[التفسير المختصر]

📌 **سبب النزول:**
[اختياري - إذا وجد]

⚠️ قواعد مهمة:
- لا تعطي فتاوى أو أحكام شرعية
- لا تفسر آيات من رأسك - يفضل استخدام النصوص المحفوظة أو توجيه المستخدم
- كن مختصراً في ردودك (2-3 جمل كافية للدردشة العامة)
- إذا سُئلت عن شيء لا تعرفه، اعتذر بلطف

💡 عند السؤال عما تفعله، قل:
"أنا هنا لمساعدتك في فهم تفسير الآيات القرآنية من تفسير ابن كثير. يمكنك أن تسألني مثلاً: تفسير سورة الفاتحة، أو تفسير آية الكرسي"`,
        },
        { role: "user", content: message },
      ],
      temperature: 0.7,
      max_tokens: 300,
    });

    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error("Casual chat error:", error.message);
    return "أهلاً بك! أنا هنا لمساعدتك في تفسير الآيات القرآنية. كيف يمكنني مساعدتك؟";
  }
}

// للتوافق مع الكود القديم
function isAllowedQuestionType(question) {
  const classification = classifyQuestion(question);
  if (classification.type === "tafsir") {
    return { allowed: true };
  }
  if (classification.type === "forbidden") {
    return { allowed: false, reason: "forbidden_pattern" };
  }
  return { allowed: false, reason: "unclear_intent" };
}

// ═══════════════════════════════════════════════════════════════════════════
// 📖 جلب التفسير من قاعدة البيانات (Exact Match)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * جلب التفسير بالمفتاح الدقيق فقط
 * @returns {Promise<TafsirDocument | null>}
 */
async function fetchTafsirExact(surah, ayah) {
  console.log(`🔍 Fetching tafsir for ${surah}:${ayah} (exact match)`);

  return TafsirIbnKathir.findOne({
    surahNumber: surah,
    ayahNumber: ayah,
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// 📝 تنسيق الإجابة
// ═══════════════════════════════════════════════════════════════════════════

/**
 * تنسيق التفسير للعرض
 */
function formatTafsirResponse(tafsir, includeNuzul = false) {
  let response = `📖 **سورة ${tafsir.surahName} - الآية ${tafsir.ayahNumber}**\n\n`;
  response += `📜 **نص الآية:**\n${tafsir.ayahText}\n\n`;
  response += `📚 **تفسير ابن كثير:**\n${tafsir.tafsir}`;

  // إضافة سبب النزول فقط إذا طُلب
  if (includeNuzul && tafsir.nuzulReason) {
    response += `\n\n📌 **سبب النزول:**\n${tafsir.nuzulReason}`;
  }

  return response;
}

// ═══════════════════════════════════════════════════════════════════════════
// 🚀 Main Chat Handler - الدالة الرئيسية
// ═══════════════════════════════════════════════════════════════════════════

/**
 * معالج الشات الرئيسي - ودود للدردشة، صارم للتفسير
 */
exports.chat = async (req, res) => {
  const { message } = req.body;
  const startTime = Date.now();

  // التحقق من وجود رسالة
  if (!message || message.trim().length < 2) {
    return res.status(400).json({
      success: false,
      message: "يرجى إدخال سؤال صحيح",
    });
  }

  // لوج الطلب
  const requestLog = {
    timestamp: new Date().toISOString(),
    question: message,
    source: null,
    surah: null,
    ayah: null,
    confidence: null,
    hallucination: false,
    type: null,
  };

  try {
    // 1️⃣ تصنيف السؤال
    const classification = classifyQuestion(message);
    requestLog.type = classification.type;
    console.log(
      `📊 Question classified as: ${classification.type} (${classification.reason})`,
    );

    // ═══════════════════════════════════════════════════════════════════════
    // 💬 معالجة الدردشة العامة
    // ═══════════════════════════════════════════════════════════════════════
    if (classification.type === "casual") {
      requestLog.source = "ai_chat";
      requestLog.hallucination = false;

      const casualResponse = await handleCasualChat(message);
      const processingTime = Date.now() - startTime;

      console.log(`💬 Casual chat response in ${processingTime}ms`);
      console.log("📋 Request Log:", requestLog);

      return res.json({
        success: true,
        data: {
          message: casualResponse,
          timestamp: new Date().toISOString(),
          metadata: {
            ...requestLog,
            processingTime: `${processingTime}ms`,
          },
        },
      });
    }

    // ═══════════════════════════════════════════════════════════════════════
    // 🚫 معالجة الأسئلة الممنوعة (فتاوى وأحكام)
    // ═══════════════════════════════════════════════════════════════════════
    if (classification.type === "forbidden") {
      requestLog.source = null;
      requestLog.hallucination = false;
      console.log("📋 Request Log:", requestLog);

      return res.json({
        success: true,
        data: {
          message:
            "⚠️ عذراً، لا أستطيع الإجابة على أسئلة الفتاوى والأحكام الشرعية.\n\nأنا متخصص فقط في تفسير الآيات القرآنية من تفسير ابن كثير.\n\n💡 يمكنك سؤالي مثلاً:\n• تفسير سورة الفاتحة\n• تفسير آية الكرسي\n• تفسير البقرة 255",
          timestamp: new Date().toISOString(),
          metadata: requestLog,
        },
      });
    }

    // ═══════════════════════════════════════════════════════════════════════
    // 📖 معالجة طلبات التفسير (صارم 100%)
    // ═══════════════════════════════════════════════════════════════════════

    // هل يسأل عن سبب النزول؟
    const asksForNuzul = /سبب\s*(?:ال)?نزول|لماذا\s*نزلت|متى\s*نزلت/i.test(
      message,
    );

    // 2️⃣ استخراج مفتاح الآية
    const verseKey = await extractVerseKey(message);

    // ═══════════════════════════════════════════════════════════════════════
    // 🔍 التحقق من الخطأ الإملائي - اسأل "هل تقصد؟"
    // ═══════════════════════════════════════════════════════════════════════
    if (verseKey && verseKey.needsConfirmation && verseKey.suggestions) {
      requestLog.hallucination = false;
      console.log("🔮 Spelling error - asking for confirmation");

      const suggestionsList = verseKey.suggestions
        .map((s, i) => `${i + 1}. سورة ${s.surahName}`)
        .join('\n');

      return res.json({
        success: true,
        data: {
          message: `🤔 لم أجد سورة بهذا الاسم.\n\n**هل تقصد إحدى هذه السور؟**\n\n${suggestionsList}\n\n💡 اكتب اسم السورة الصحيح أو اختر من الاقتراحات أعلاه.`,
          timestamp: new Date().toISOString(),
          metadata: requestLog,
          // ✅ إرسال الاقتراحات للـ Frontend
          surahSuggestions: verseKey.suggestions.map(s => ({
            surahNumber: s.surahNumber,
            surahName: s.surahName,
            label: `سورة ${s.surahName}`,
            chatText: `تفسير سورة ${s.surahName} آية `
          }))
        },
      });
    }

    // إذا لم يُعثر على مفتاح
    if (!verseKey) {
      requestLog.hallucination = false;
      console.log("📋 Request Log:", requestLog);

      return res.json({
        success: true,
        data: {
          message:
            "لم أتمكن من تحديد الآية المطلوبة. 🤔\n\nيرجى تحديد رقم السورة والآية بوضوح.\n\n💡 أمثلة:\n• تفسير آية الكرسي\n• تفسير سورة البقرة آية 255\n• تفسير 2:255",
          timestamp: new Date().toISOString(),
          metadata: requestLog,
        },
      });
    }

    // ═══════════════════════════════════════════════════════════════════════
    // 📖 إذا وجدنا السورة بدون رقم آية - اطلب رقم الآية
    // ═══════════════════════════════════════════════════════════════════════
    if (verseKey.surah && !verseKey.ayah) {
      // جلب اسم السورة
      const surahNames = Object.entries(SURAH_NAMES).find(([_, num]) => num === verseKey.surah);
      const surahName = surahNames ? surahNames[0] : `رقم ${verseKey.surah}`;

      return res.json({
        success: true,
        data: {
          message: `📖 تم تحديد **سورة ${surahName}**\n\nيرجى تحديد رقم الآية للحصول على التفسير.\n\n💡 مثال: تفسير سورة ${surahName} آية 1`,
          timestamp: new Date().toISOString(),
          metadata: {
            ...requestLog,
            surah: verseKey.surah,
            waitingForAyah: true
          },
        },
      });
    }

    // 3️⃣ تحديث اللوج
    requestLog.surah = verseKey.surah;
    requestLog.ayah = verseKey.ayah;

    // ═══════════════════════════════════════════════════════════════════════
    // 🔢 التحقق من صحة رقم الآية (هل موجودة في السورة؟)
    // ═══════════════════════════════════════════════════════════════════════
    const ayahValidation = validateAyahNumber(verseKey.surah, verseKey.ayah);
    
    if (!ayahValidation.valid) {
      requestLog.hallucination = false;
      console.log(`❌ Invalid ayah: ${verseKey.surah}:${verseKey.ayah} - max is ${ayahValidation.maxAyah}`);

      return res.json({
        success: true,
        data: {
          message: `❌ **الآية ${verseKey.ayah} غير موجودة في سورة ${ayahValidation.surahName}**\n\n📊 سورة ${ayahValidation.surahName} تحتوي على **${ayahValidation.maxAyah} آية** فقط.\n\n💡 يرجى اختيار رقم آية من 1 إلى ${ayahValidation.maxAyah}.\n\n**مثال:** تفسير سورة ${ayahValidation.surahName} آية ${Math.min(5, ayahValidation.maxAyah)}`,
          timestamp: new Date().toISOString(),
          metadata: {
            ...requestLog,
            error: 'ayah_out_of_range',
            surahName: ayahValidation.surahName,
            maxAyah: ayahValidation.maxAyah,
            requestedAyah: verseKey.ayah
          },
        },
      });
    }

    // 4️⃣ جلب التفسير من قاعدة البيانات (Exact Match فقط)
    const tafsir = await fetchTafsirExact(verseKey.surah, verseKey.ayah);

    if (!tafsir) {
      // ❌ لا يوجد تفسير - الرسالة الصارمة
      requestLog.source = null;
      requestLog.confidence = "0%";
      requestLog.hallucination = false;
      console.log("📋 Request Log:", requestLog);

      return res.json({
        success: true,
        data: {
          message: `لا يوجد تفسير محفوظ لهذه الآية في قاعدة البيانات.\n\n📌 الآية المطلوبة: ${verseKey.surah}:${verseKey.ayah}`,
          timestamp: new Date().toISOString(),
          metadata: requestLog,
        },
      });
    }

    // 5️⃣ ✅ تفسير موجود - إرجاعه كما هو
    requestLog.source = "tafsir_ibn_kathir";
    requestLog.confidence = "100%";
    requestLog.hallucination = false;

    const processingTime = Date.now() - startTime;
    console.log(
      `✅ Tafsir found for ${verseKey.surah}:${verseKey.ayah} in ${processingTime}ms`,
    );
    console.log("📋 Request Log:", requestLog);

    return res.json({
      success: true,
      data: {
        message: formatTafsirResponse(tafsir, asksForNuzul),
        timestamp: new Date().toISOString(),
        metadata: {
          ...requestLog,
          processingTime: `${processingTime}ms`,
        },
      },
    });
  } catch (error) {
    console.error("❌ Chat error:", error);
    requestLog.hallucination = false;

    return res.status(500).json({
      success: false,
      message: "حدث خطأ في النظام",
      error: error.message,
      metadata: requestLog,
    });
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// 🔊 TTS - تحويل النص إلى صوت
// ═══════════════════════════════════════════════════════════════════════════

exports.speak = async (req, res) => {
  const { text } = req.body;

  if (!text || text.length < 5) {
    return res.status(400).json({
      success: false,
      message: "يرجى إدخال نص للتحويل",
    });
  }

  console.log(`🔊 TTS Request: ${text.length} chars`);

  try {
    const openai = getOpenAIClient();
    
    // ✅ تقصير النص للحد الأقصى لـ OpenAI TTS (4096 حرف)
    // مع الحفاظ على نهاية منطقية (عند نقطة أو فاصلة)
    let inputText = text;
    if (inputText.length > 4000) {
      inputText = inputText.substring(0, 4000);
      // البحث عن آخر نقطة أو فاصلة للقطع المنطقي
      const lastPeriod = Math.max(
        inputText.lastIndexOf('.'),
        inputText.lastIndexOf('،'),
        inputText.lastIndexOf('.')
      );
      if (lastPeriod > 3000) {
        inputText = inputText.substring(0, lastPeriod + 1);
      }
      console.log(`🔊 TTS: Text truncated from ${text.length} to ${inputText.length} chars`);
    }

    console.log(`🔊 TTS: Sending ${inputText.length} chars to OpenAI...`);
    const startTime = Date.now();

    const mp3 = await openai.audio.speech.create({
      model: "tts-1",
      voice: "onyx",
      input: inputText,
      speed: 0.9,
    });

    const buffer = Buffer.from(await mp3.arrayBuffer());
    const duration = Date.now() - startTime;
    
    console.log(`🔊 TTS: Generated ${buffer.length} bytes in ${duration}ms`);

    res.set({
      "Content-Type": "audio/mpeg",
      "Content-Length": buffer.length,
      "Cache-Control": "public, max-age=3600", // Cache لمدة ساعة
    });

    res.send(buffer);
  } catch (error) {
    console.error("❌ TTS Error:", error.message);
    console.error("❌ TTS Error details:", error);
    res.status(500).json({
      success: false,
      message: "فشل في تحويل النص إلى صوت",
      error: error.message,
    });
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// 🎤 STT - تحويل الصوت إلى نص
// ═══════════════════════════════════════════════════════════════════════════

exports.transcribe = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "يرجى إرسال ملف صوتي",
    });
  }

  try {
    const openai = getOpenAIClient();
    const fs = require("fs");

    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(req.file.path),
      model: "whisper-1",
      language: "ar",
    });

    // حذف الملف المؤقت
    fs.unlinkSync(req.file.path);

    res.json({
      success: true,
      text: transcription.text,
    });
  } catch (error) {
    console.error("STT Error:", error);
    res.status(500).json({
      success: false,
      message: "فشل في تحويل الصوت إلى نص",
      error: error.message,
    });
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// 🔍 اقتراحات السور عند الخطأ الإملائي
// ═══════════════════════════════════════════════════════════════════════════

/**
 * 🔍 الحصول على اقتراحات السور الأقرب
 * GET /api/ai-chat/surah-suggestions?query=الفتحه
 * 
 * يُستخدم عندما المستخدم يكتب اسم سورة بخطأ إملائي
 * يُرجع قائمة بأقرب السور مع نسبة التشابه
 */
exports.getSurahSuggestions = async (req, res) => {
  const { query } = req.query;
  
  if (!query || query.trim().length < 2) {
    return res.status(400).json({
      success: false,
      message: "يرجى إدخال نص للبحث (حرفين على الأقل)",
    });
  }

  try {
    // 1️⃣ البحث الدقيق أولاً
    const exactMatch = fuzzyFindSurah(query);
    
    if (exactMatch && exactMatch.confidence >= 0.9) {
      // تطابق شبه كامل - لا حاجة لاقتراحات
      return res.json({
        success: true,
        exactMatch: true,
        data: {
          surahNumber: exactMatch.surahNumber,
          surahName: exactMatch.surahName,
          confidence: exactMatch.confidence,
          // نص جاهز للشات - الطالب يُكمل برقم الآية
          chatText: `تفسير سورة ${exactMatch.surahName} آية `
        }
      });
    }
    
    // 2️⃣ البحث عن أقرب السور
    const suggestions = findClosestSurahs(query, 5);
    
    if (suggestions.length === 0) {
      return res.json({
        success: true,
        exactMatch: false,
        needsConfirmation: false,
        suggestions: [],
        message: "لم أجد سورة مطابقة. يرجى التأكد من الاسم."
      });
    }
    
    // 3️⃣ إذا أعلى نتيجة أقل من 90% - اسأل "هل تقصد؟"
    const topMatch = suggestions[0];
    
    return res.json({
      success: true,
      exactMatch: false,
      needsConfirmation: topMatch.confidence < 0.9,
      question: `هل تقصد إحدى هذه السور؟`,
      suggestions: suggestions.map(s => ({
        surahNumber: s.surahNumber,
        surahName: s.surahName,
        label: `سورة ${s.surahName}`,
        confidence: Math.round(s.confidence * 100),
        // نص جاهز للشات
        chatText: `تفسير سورة ${s.surahName} آية `
      }))
    });
    
  } catch (error) {
    console.error("Surah suggestions error:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ في البحث",
      error: error.message,
    });
  }
};
