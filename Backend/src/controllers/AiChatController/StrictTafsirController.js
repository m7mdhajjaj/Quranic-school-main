/**
 * 🔒 نظام تفسير ابن كثير الصارم
 * Strict Ibn Kathir Tafsir System
 * 
 * ❌ ممنوع الهلوسة
 * ❌ ممنوع التفسير من العقل
 * ✅ فقط من قاعدة البيانات
 */

const OpenAI = require('openai');
const TafsirIbnKathir = require('../../schema/AI/Quran/TafsirIbnKathir');

// ═══════════════════════════════════════════════════════════════════════════
// 🔧 OpenAI Client
// ═══════════════════════════════════════════════════════════════════════════

let aiClient;
const getOpenAIClient = () => {
  if (!aiClient) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error("OPENAI_API_KEY مفقود");
    aiClient = new OpenAI({ apiKey, timeout: 30000 });
  }
  return aiClient;
};

// ═══════════════════════════════════════════════════════════════════════════
// 📚 قاموس أسماء السور (114 سورة)
// ═══════════════════════════════════════════════════════════════════════════

const SURAH_NAMES = {
  // الفاتحة
  'الفاتحة': 1, 'فاتحة': 1, 'ام الكتاب': 1, 'أم الكتاب': 1, 'السبع المثاني': 1,
  'fatiha': 1, 'al-fatiha': 1, 'alfatiha': 1,
  
  // البقرة
  'البقرة': 2, 'بقرة': 2, 'baqara': 2, 'al-baqara': 2, 'albaqara': 2,
  
  // آل عمران
  'آل عمران': 3, 'ال عمران': 3, 'عمران': 3, 'ali imran': 3,
  
  // النساء
  'النساء': 4, 'نساء': 4, 'nisa': 4, 'an-nisa': 4,
  
  // المائدة
  'المائدة': 5, 'مائدة': 5, 'maida': 5, 'al-maida': 5,
  
  // الأنعام
  'الأنعام': 6, 'الانعام': 6, 'انعام': 6, 'anam': 6,
  
  // الأعراف
  'الأعراف': 7, 'الاعراف': 7, 'اعراف': 7, 'araf': 7,
  
  // الأنفال
  'الأنفال': 8, 'الانفال': 8, 'انفال': 8, 'anfal': 8,
  
  // التوبة
  'التوبة': 9, 'توبة': 9, 'براءة': 9, 'tawba': 9,
  
  // يونس - هود - يوسف
  'يونس': 10, 'yunus': 10,
  'هود': 11, 'hud': 11,
  'يوسف': 12, 'yusuf': 12,
  
  // الرعد - إبراهيم - الحجر
  'الرعد': 13, 'رعد': 13, 'raad': 13,
  'إبراهيم': 14, 'ابراهيم': 14, 'ibrahim': 14,
  'الحجر': 15, 'حجر': 15, 'hijr': 15,
  
  // النحل - الإسراء - الكهف
  'النحل': 16, 'نحل': 16, 'nahl': 16,
  'الإسراء': 17, 'الاسراء': 17, 'اسراء': 17, 'بني إسرائيل': 17, 'isra': 17,
  'الكهف': 18, 'كهف': 18, 'kahf': 18,
  
  // مريم - طه - الأنبياء
  'مريم': 19, 'maryam': 19,
  'طه': 20, 'taha': 20,
  'الأنبياء': 21, 'الانبياء': 21, 'انبياء': 21, 'anbiya': 21,
  
  // الحج - المؤمنون - النور
  'الحج': 22, 'حج': 22, 'hajj': 22,
  'المؤمنون': 23, 'المومنون': 23, 'مؤمنون': 23, 'muminun': 23,
  'النور': 24, 'نور': 24, 'nur': 24,
  
  // الفرقان - الشعراء - النمل - القصص
  'الفرقان': 25, 'فرقان': 25, 'furqan': 25,
  'الشعراء': 26, 'شعراء': 26, 'shuara': 26,
  'النمل': 27, 'نمل': 27, 'naml': 27,
  'القصص': 28, 'قصص': 28, 'qasas': 28,
  
  // العنكبوت - الروم - لقمان - السجدة
  'العنكبوت': 29, 'عنكبوت': 29, 'ankabut': 29,
  'الروم': 30, 'روم': 30, 'rum': 30,
  'لقمان': 31, 'luqman': 31,
  'السجدة': 32, 'سجدة': 32, 'sajda': 32,
  
  // الأحزاب - سبأ - فاطر - يس
  'الأحزاب': 33, 'الاحزاب': 33, 'احزاب': 33, 'ahzab': 33,
  'سبأ': 34, 'سبا': 34, 'saba': 34,
  'فاطر': 35, 'fatir': 35,
  'يس': 36, 'ياسين': 36, 'يسن': 36, 'yasin': 36,
  
  // الصافات - ص - الزمر - غافر
  'الصافات': 37, 'صافات': 37, 'saffat': 37,
  'ص': 38, 'صاد': 38, 'sad': 38,
  'الزمر': 39, 'زمر': 39, 'zumar': 39,
  'غافر': 40, 'المؤمن': 40, 'المومن': 40, 'ghafir': 40,
  
  // فصلت - الشورى - الزخرف - الدخان
  'فصلت': 41, 'حم السجدة': 41, 'fussilat': 41,
  'الشورى': 42, 'شورى': 42, 'shura': 42,
  'الزخرف': 43, 'زخرف': 43, 'zukhruf': 43,
  'الدخان': 44, 'دخان': 44, 'dukhan': 44,
  
  // الجاثية - الأحقاف - محمد - الفتح
  'الجاثية': 45, 'جاثية': 45, 'jathiya': 45,
  'الأحقاف': 46, 'الاحقاف': 46, 'احقاف': 46, 'ahqaf': 46,
  'محمد': 47, 'muhammad': 47,
  'الفتح': 48, 'فتح': 48, 'fath': 48,
  
  // الحجرات - ق - الذاريات - الطور
  'الحجرات': 49, 'حجرات': 49, 'hujurat': 49,
  'ق': 50, 'قاف': 50, 'qaf': 50,
  'الذاريات': 51, 'ذاريات': 51, 'dhariyat': 51,
  'الطور': 52, 'طور': 52, 'tur': 52,
  
  // النجم - القمر - الرحمن - الواقعة
  'النجم': 53, 'نجم': 53, 'najm': 53,
  'القمر': 54, 'قمر': 54, 'qamar': 54,
  'الرحمن': 55, 'رحمن': 55, 'rahman': 55,
  'الواقعة': 56, 'واقعة': 56, 'waqia': 56,
  
  // الحديد - المجادلة - الحشر - الممتحنة
  'الحديد': 57, 'حديد': 57, 'hadid': 57,
  'المجادلة': 58, 'مجادلة': 58, 'mujadila': 58,
  'الحشر': 59, 'حشر': 59, 'hashr': 59,
  'الممتحنة': 60, 'ممتحنة': 60, 'mumtahina': 60,
  
  // الصف - الجمعة - المنافقون - التغابن
  'الصف': 61, 'صف': 61, 'saff': 61,
  'الجمعة': 62, 'جمعة': 62, 'jumua': 62,
  'المنافقون': 63, 'منافقون': 63, 'munafiqun': 63,
  'التغابن': 64, 'تغابن': 64, 'taghabun': 64,
  
  // الطلاق - التحريم - الملك - القلم
  'الطلاق': 65, 'طلاق': 65, 'talaq': 65,
  'التحريم': 66, 'تحريم': 66, 'tahrim': 66,
  'الملك': 67, 'ملك': 67, 'تبارك': 67, 'mulk': 67,
  'القلم': 68, 'قلم': 68, 'نون': 68, 'qalam': 68,
  
  // الحاقة - المعارج - نوح - الجن
  'الحاقة': 69, 'حاقة': 69, 'haqqa': 69,
  'المعارج': 70, 'معارج': 70, 'maarij': 70,
  'نوح': 71, 'nuh': 71,
  'الجن': 72, 'جن': 72, 'jinn': 72,
  
  // المزمل - المدثر - القيامة - الإنسان
  'المزمل': 73, 'مزمل': 73, 'muzzammil': 73,
  'المدثر': 74, 'مدثر': 74, 'muddaththir': 74,
  'القيامة': 75, 'قيامة': 75, 'qiyama': 75,
  'الإنسان': 76, 'الانسان': 76, 'انسان': 76, 'الدهر': 76, 'insan': 76,
  
  // المرسلات - النبأ - النازعات - عبس
  'المرسلات': 77, 'مرسلات': 77, 'mursalat': 77,
  'النبأ': 78, 'نبأ': 78, 'عم': 78, 'عم يتساءلون': 78, 'naba': 78,
  'النازعات': 79, 'نازعات': 79, 'naziat': 79,
  'عبس': 80, 'abasa': 80,
  
  // التكوير - الانفطار - المطففين - الانشقاق
  'التكوير': 81, 'تكوير': 81, 'takwir': 81,
  'الانفطار': 82, 'انفطار': 82, 'infitar': 82,
  'المطففين': 83, 'مطففين': 83, 'mutaffifin': 83,
  'الانشقاق': 84, 'انشقاق': 84, 'inshiqaq': 84,
  
  // البروج - الطارق - الأعلى - الغاشية
  'البروج': 85, 'بروج': 85, 'buruj': 85,
  'الطارق': 86, 'طارق': 86, 'tariq': 86,
  'الأعلى': 87, 'الاعلى': 87, 'اعلى': 87, 'سبح': 87, 'ala': 87,
  'الغاشية': 88, 'غاشية': 88, 'ghashiya': 88,
  
  // الفجر - البلد - الشمس - الليل
  'الفجر': 89, 'فجر': 89, 'fajr': 89,
  'البلد': 90, 'بلد': 90, 'balad': 90,
  'الشمس': 91, 'شمس': 91, 'shams': 91,
  'الليل': 92, 'ليل': 92, 'layl': 92,
  
  // الضحى - الشرح - التين - العلق
  'الضحى': 93, 'ضحى': 93, 'duha': 93,
  'الشرح': 94, 'شرح': 94, 'الانشراح': 94, 'انشراح': 94, 'sharh': 94,
  'التين': 95, 'تين': 95, 'tin': 95,
  'العلق': 96, 'علق': 96, 'اقرأ': 96, 'alaq': 96,
  
  // القدر - البينة - الزلزلة - العاديات
  'القدر': 97, 'قدر': 97, 'qadr': 97,
  'البينة': 98, 'بينة': 98, 'bayyina': 98,
  'الزلزلة': 99, 'زلزلة': 99, 'zalzala': 99,
  'العاديات': 100, 'عاديات': 100, 'adiyat': 100,
  
  // القارعة - التكاثر - العصر - الهمزة
  'القارعة': 101, 'قارعة': 101, 'qaria': 101,
  'التكاثر': 102, 'تكاثر': 102, 'takathur': 102,
  'العصر': 103, 'عصر': 103, 'asr': 103,
  'الهمزة': 104, 'همزة': 104, 'humaza': 104,
  
  // الفيل - قريش - الماعون - الكوثر
  'الفيل': 105, 'فيل': 105, 'fil': 105,
  'قريش': 106, 'ايلاف': 106, 'إيلاف': 106, 'quraysh': 106,
  'الماعون': 107, 'ماعون': 107, 'maun': 107,
  'الكوثر': 108, 'كوثر': 108, 'kawthar': 108,
  
  // الكافرون - النصر - المسد - الإخلاص
  'الكافرون': 109, 'كافرون': 109, 'kafirun': 109,
  'النصر': 110, 'نصر': 110, 'nasr': 110,
  'المسد': 111, 'مسد': 111, 'تبت': 111, 'اللهب': 111, 'masad': 111,
  'الإخلاص': 112, 'الاخلاص': 112, 'اخلاص': 112, 'قل هو الله أحد': 112, 'التوحيد': 112, 'ikhlas': 112,
  
  // الفلق - الناس
  'الفلق': 113, 'فلق': 113, 'falaq': 113,
  'الناس': 114, 'ناس': 114, 'nas': 114
};

// ═══════════════════════════════════════════════════════════════════════════
// 📖 قاموس الآيات المشهورة
// ═══════════════════════════════════════════════════════════════════════════

const FAMOUS_VERSES = {
  // آية الكرسي
  'آية الكرسي': { surah: 2, ayah: 255 },
  'الكرسي': { surah: 2, ayah: 255 },
  'اية الكرسي': { surah: 2, ayah: 255 },
  'ayat al kursi': { surah: 2, ayah: 255 },
  'ayatul kursi': { surah: 2, ayah: 255 },
  'الله لا إله إلا هو الحي القيوم': { surah: 2, ayah: 255 },
  'الله لا اله الا هو الحي القيوم': { surah: 2, ayah: 255 },
  
  // آيات أخرى مشهورة
  'آية النور': { surah: 24, ayah: 35 },
  'الله نور السماوات': { surah: 24, ayah: 35 },
  'آية الدين': { surah: 2, ayah: 282 },
  'أطول آية': { surah: 2, ayah: 282 },
  'خواتيم البقرة': { surah: 2, ayah: 285 },
  'آمن الرسول': { surah: 2, ayah: 285 },
  'إنا أعطيناك الكوثر': { surah: 108, ayah: 1 },
  'قل هو الله أحد': { surah: 112, ayah: 1 },
  'بسم الله الرحمن الرحيم': { surah: 1, ayah: 1 },
  'الحمد لله رب العالمين': { surah: 1, ayah: 2 },
  'إياك نعبد': { surah: 1, ayah: 5 }
};

// ═══════════════════════════════════════════════════════════════════════════
// 🧠 الـ AI Router - استخراج المفتاح القرآني
// ═══════════════════════════════════════════════════════════════════════════

/**
 * استخراج مفتاح الآية من السؤال
 * @returns {{ surah: number, ayah: number } | null}
 */
async function extractVerseKey(question) {
  const text = question.trim();
  const normalizedText = text
    .replace(/[أإآ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .toLowerCase(); // fixed v2

  // 1️⃣ البحث في الآيات المشهورة
  for (const [key, value] of Object.entries(FAMOUS_VERSES)) {
    const normalizedKey = key
      .replace(/[أإآ]/g, 'ا')
      .replace(/ى/g, 'ي')
      .replace(/ة/g, 'ه')
      .toLowerCase();
    if (normalizedText.includes(normalizedKey)) {
      console.log(`📌 Famous verse detected: ${key} → ${value.surah}:${value.ayah}`);
      return value;
    }
  }

  // 2️⃣ البحث بنمط رقمي: "2:255" أو "2-255" أو "2 255"
  const numericPattern = normalizedText.match(/(\d{1,3})\s*[:：\-]\s*(\d{1,3})/);
  if (numericPattern) {
    const surah = parseInt(numericPattern[1]);
    const ayah = parseInt(numericPattern[2]);
    if (surah >= 1 && surah <= 114 && ayah >= 1) {
      console.log(`📌 Numeric pattern: ${surah}:${ayah}`);
      return { surah, ayah };
    }
  }

  // 3️⃣ البحث باسم السورة + رقم الآية
  // نرتب الأسماء من الأطول للأقصر لتجنب التطابق الخاطئ
  // مثال: "الإخلاص" يجب أن يُكتشف قبل "ص"
  let foundSurah = null;
  let foundAyah = null;

  const sortedSurahNames = Object.entries(SURAH_NAMES)
    .sort((a, b) => b[0].length - a[0].length); // الأطول أولاً

  for (const [name, number] of sortedSurahNames) {
    const normalizedName = name
      .replace(/[أإآ]/g, 'ا')
      .replace(/ى/g, 'ي')
      .replace(/ة/g, 'ه')
      .toLowerCase();
    
    // استخدام word boundary للأسماء القصيرة (أقل من 3 أحرف)
    if (normalizedName.length <= 2) {
      // أسماء قصيرة مثل "ص" و "ق" و "طه" - نتحقق من word boundary
      const regex = new RegExp(`(^|\\s|سورة\\s*)${normalizedName}(\\s|$|\\d)`, 'i');
      if (regex.test(normalizedText)) {
        foundSurah = number;
        console.log(`📌 Surah name detected (short): ${name} = ${number}`);
        break;
      }
    } else {
      // أسماء طويلة - البحث العادي
      if (normalizedText.includes(normalizedName)) {
        foundSurah = number;
        console.log(`📌 Surah name detected: ${name} = ${number}`);
        break;
      }
    }
  }

  if (foundSurah) {
    // البحث عن رقم الآية
    const ayahPatterns = [
      /آي[ةه]\s*(?:رقم)?\s*(\d{1,3})/,
      /الآي[ةه]\s*(\d{1,3})/,
      /اي[ةه]\s*(\d{1,3})/,
      /ayah?\s*(\d{1,3})/i,
      /verse\s*(\d{1,3})/i,
      /(\d{1,3})\s*$/
    ];

    for (const pattern of ayahPatterns) {
      const match = normalizedText.match(pattern);
      if (match) {
        foundAyah = parseInt(match[1]);
        console.log(`📌 Ayah number detected: ${foundAyah}`);
        break;
      }
    }

    if (foundAyah) {
      return { surah: foundSurah, ayah: foundAyah };
    }
  }

  // 4️⃣ استخدام AI كـ Router فقط (لا يجيب، فقط يستخرج)
  if (text.length > 5) {
    try {
      const openai = getOpenAIClient();
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `أنت Router لاستخراج رقم السورة والآية فقط.
لا تفسر. لا تشرح. فقط أرجع JSON.

القواعد:
- السور من 1 إلى 114
- إذا ذُكر اسم سورة، حوّله لرقم
- إذا ذُكرت آية مشهورة (مثل آية الكرسي)، أرجع رقمها
- إذا لم تجد مرجعاً واضحاً، أرجع null

أرجع فقط:
{"surah": number|null, "ayah": number|null}`
          },
          { role: "user", content: text }
        ],
        temperature: 0,
        max_tokens: 50
      });

      const content = response.choices[0].message.content.trim();
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed.surah && parsed.surah >= 1 && parsed.surah <= 114 && parsed.ayah) {
          console.log(`🤖 AI Router extracted: ${parsed.surah}:${parsed.ayah}`);
          return parsed;
        }
      }
    } catch (error) {
      console.error("AI Router error:", error.message);
    }
  }

  return null;
}

// ═══════════════════════════════════════════════════════════════════════════
// 🔍 التحقق من نوع السؤال
// ═══════════════════════════════════════════════════════════════════════════

/**
 * تحديد ما إذا كان السؤال من الأنماط المسموحة
 */
function isAllowedQuestionType(question) {
  const text = question.toLowerCase();
  
  // أنماط مسموحة
  const allowedPatterns = [
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
    /interpretation/i
  ];

  // أنماط ممنوعة
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
    /compare/i
  ];

  for (const pattern of forbiddenPatterns) {
    if (pattern.test(text)) {
      return { allowed: false, reason: 'forbidden_pattern' };
    }
  }

  for (const pattern of allowedPatterns) {
    if (pattern.test(text)) {
      return { allowed: true };
    }
  }

  // إذا يحتوي على إشارة لآية، نعتبره مسموح
  if (/آي[ةه]|سور[ةه]|\d{1,3}:\d{1,3}/.test(text)) {
    return { allowed: true };
  }

  return { allowed: false, reason: 'unclear_intent' };
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
    ayahNumber: ayah
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
 * معالج الشات الرئيسي - صارم 100%
 */
exports.chat = async (req, res) => {
  const { message } = req.body;
  const startTime = Date.now();

  // التحقق من وجود رسالة
  if (!message || message.trim().length < 2) {
    return res.status(400).json({
      success: false,
      message: 'يرجى إدخال سؤال صحيح'
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
    hallucination: false
  };

  try {
    // 1️⃣ التحقق من نوع السؤال
    const questionCheck = isAllowedQuestionType(message);
    
    // هل يسأل عن سبب النزول؟
    const asksForNuzul = /سبب\s*(?:ال)?نزول|لماذا\s*نزلت|متى\s*نزلت/i.test(message);

    // 2️⃣ استخراج مفتاح الآية
    const verseKey = await extractVerseKey(message);

    // إذا لم يُعثر على مفتاح ولم يكن السؤال مسموحاً
    if (!verseKey) {
      if (!questionCheck.allowed) {
        requestLog.hallucination = false;
        console.log('📋 Request Log:', requestLog);
        
        return res.json({
          success: true,
          data: {
            message: 'هذا النظام مخصص لتفسير الآيات القرآنية فقط.\n\nيرجى تحديد رقم السورة والآية.\nمثال: "تفسير سورة البقرة آية 255" أو "تفسير 2:255"',
            timestamp: new Date().toISOString(),
            metadata: requestLog
          }
        });
      }
      
      // سؤال عام بدون آية محددة
      requestLog.hallucination = false;
      console.log('📋 Request Log:', requestLog);
      
      return res.json({
        success: true,
        data: {
          message: 'لم أتمكن من تحديد الآية المطلوبة.\n\nيرجى تحديد رقم السورة والآية بوضوح.\nمثال: "تفسير آية الكرسي" أو "تفسير البقرة 255"',
          timestamp: new Date().toISOString(),
          metadata: requestLog
        }
      });
    }

    // 3️⃣ تحديث اللوج
    requestLog.surah = verseKey.surah;
    requestLog.ayah = verseKey.ayah;

    // 4️⃣ جلب التفسير من قاعدة البيانات (Exact Match فقط)
    const tafsir = await fetchTafsirExact(verseKey.surah, verseKey.ayah);

    if (!tafsir) {
      // ❌ لا يوجد تفسير - الرسالة الصارمة
      requestLog.source = null;
      requestLog.confidence = '0%';
      requestLog.hallucination = false;
      console.log('📋 Request Log:', requestLog);

      return res.json({
        success: true,
        data: {
          message: `لا يوجد تفسير محفوظ لهذه الآية في قاعدة البيانات.\n\n📌 الآية المطلوبة: ${verseKey.surah}:${verseKey.ayah}`,
          timestamp: new Date().toISOString(),
          metadata: requestLog
        }
      });
    }

    // 5️⃣ ✅ تفسير موجود - إرجاعه كما هو
    requestLog.source = 'tafsir_ibn_kathir';
    requestLog.confidence = '100%';
    requestLog.hallucination = false;

    const processingTime = Date.now() - startTime;
    console.log(`✅ Tafsir found for ${verseKey.surah}:${verseKey.ayah} in ${processingTime}ms`);
    console.log('📋 Request Log:', requestLog);

    return res.json({
      success: true,
      data: {
        message: formatTafsirResponse(tafsir, asksForNuzul),
        timestamp: new Date().toISOString(),
        metadata: {
          ...requestLog,
          processingTime: `${processingTime}ms`
        }
      }
    });

  } catch (error) {
    console.error('❌ Chat error:', error);
    requestLog.hallucination = false;
    
    return res.status(500).json({
      success: false,
      message: 'حدث خطأ في النظام',
      error: error.message,
      metadata: requestLog
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
      message: 'يرجى إدخال نص للتحويل'
    });
  }

  try {
    const openai = getOpenAIClient();
    const mp3 = await openai.audio.speech.create({
      model: "tts-1",
      voice: "onyx",
      input: text.substring(0, 4096),
      speed: 0.9
    });

    const buffer = Buffer.from(await mp3.arrayBuffer());

    res.set({
      'Content-Type': 'audio/mpeg',
      'Content-Length': buffer.length
    });

    res.send(buffer);
  } catch (error) {
    console.error('TTS Error:', error);
    res.status(500).json({
      success: false,
      message: 'فشل في تحويل النص إلى صوت',
      error: error.message
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
      message: 'يرجى إرسال ملف صوتي'
    });
  }

  try {
    const openai = getOpenAIClient();
    const fs = require('fs');
    
    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(req.file.path),
      model: "whisper-1",
      language: "ar"
    });

    // حذف الملف المؤقت
    fs.unlinkSync(req.file.path);

    res.json({
      success: true,
      text: transcription.text
    });
  } catch (error) {
    console.error('STT Error:', error);
    res.status(500).json({
      success: false,
      message: 'فشل في تحويل الصوت إلى نص',
      error: error.message
    });
  }
};
