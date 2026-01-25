/**
 * 🔒 نظام تفسير ابن كثير الصارم
 * Strict Ibn Kathir Tafsir System
 *
 * ❌ ممنوع الهلوسة
 * ❌ ممنوع التفسير من العقل
 * ❌ ممنوع التجويد والفتاوى
 * ✅ فقط من قاعدة البيانات
 * ✅ الرد على التحيات البسيطة فقط
 */

const TafsirIbnKathir = require('../../schema/AI/Quran/TafsirIbnKathir');
const getOpenAIClient = require('../../config/openai');
const { normalizeArabic } = require('../../utils/sanitization');
const { SURAH_CANONICAL, validateAyahNumber } = require('../../data/surahData');
const {
  fuzzyFindSurah,
  findClosestSurahs,
} = require('../../utils/textAnalysis');

// ═══════════════════════════════════════════════════════════════════════════
// 🧠 الـ AI Router - استخراج المفتاح القرآني
// ═══════════════════════════════════════════════════════════════════════════

/**
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

  // 1️⃣ البحث عن نمط رقمي: "2:255" أو "2-255"
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

  //search for patterns like "سورة البقرة آية 255" or "سورة الفاتحة 1"
  let foundSurah = null;
  let foundAyah = null;
  let longestMatchLength = 0; // ✅ لتتبع أطول تطابق

  // ✅ البحث عن أطول اسم مطابق لتجنب التداخل
  // مثال: "ابراهيم" يحتوي على "براه" (براءة)، لكن "ابراهيم" أطول فيجب اختياره
  for (const surah of SURAH_CANONICAL) {
    for (const name of surah.names) {
      const normalizedName = normalizeArabic(name);

      // مطابقة دقيقة أو كجزء من الكلمة مع حدود
      if (normalizedName.length <= 2) {
        // للأسماء القصيرة (طه، يس، ق) نحتاج مطابقة دقيقة مع فواصل
        const regex = new RegExp(
          `(^|\\s|سور[ةه]?\\s*)${normalizedName}(\\s|$|\\d)`,
          'i',
        );
        if (regex.test(normalizedText)) {
          // ✅ فقط إذا كان هذا الاسم أطول من التطابق السابق
          if (normalizedName.length > longestMatchLength) {
            foundSurah = surah.number;
            longestMatchLength = normalizedName.length;
            console.log(
              `📌 Surah name detected (short): ${name} = ${surah.number} (length: ${longestMatchLength})`,
            );
          }
        }
      } else {
        if (normalizedText.includes(normalizedName)) {
          // ✅ فقط إذا كان هذا الاسم أطول من التطابق السابق
          if (normalizedName.length > longestMatchLength) {
            foundSurah = surah.number;
            longestMatchLength = normalizedName.length;
            console.log(
              `📌 Surah name detected (exact): ${name} = ${surah.number} (length: ${longestMatchLength})`,
            );
          }
        }
      }
    }
    // ✅ لا نتوقف عند أول تطابق، نستمر للبحث عن الأطول
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
  // نرفع الحد الأدنى للثقة لتجنب الاقتراحات العشوائية
  // إلا إذا كان السؤال يحتوي على كلمة "تفسير" صريحة أو "سورة/آية"
  const hasTafsirKeyword = /تفسير|فسر|معن[ىي]|شرح|سور[ةه]|آي[ةه]|اي[ةه]/.test(
    text,
  );
  const minConfidence = hasTafsirKeyword ? 0.45 : 0.7; // تم رفع العتبة

  const suggestions = findClosestSurahs(text, 3);

  if (suggestions.length > 0 && suggestions[0].confidence >= minConfidence) {
    console.log(
      `🔮 Spelling error detected, suggesting: ${suggestions.map((s) => s.surahName).join(', ')}`,
    );
    return {
      surah: null,
      ayah: null,
      needsConfirmation: true,
      suggestions: suggestions.slice(0, 3),
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
// 🔍 التحقق من نوع السؤال (Strict Mode)
// ═══════════════════════════════════════════════════════════════════════════

function classifyQuestion(question) {
  const text = question.toLowerCase().trim();

  //no english letters allowed
  if (/[a-zA-Z]/.test(text)) {
    return { type: 'forbidden', reason: 'english_language_detected' };
  }

  const normalizedText = normalizeArabic(text);

  // ═══════════════════════════════════════════════════════════════════════════
  // 1️⃣ أنماط الدردشة العامة - كل سؤال مع جوابه
  // ═══════════════════════════════════════════════════════════════════════════
  const casualCategories = [
    // 🟢 التحيات والسلام
    {
      subType: 'greeting',
      patterns: [
        /^(مرح+با+|اه+لا+|ه+لا+|هاي+|هي+)/i,
        /^(السلام\s*عليكم|سلام)/i,
        /^(صباح\s*الخير|مساء\s*الخير|صباحو|مساءو)/i,
      ],
      response: 'رد بتحية إسلامية ودودة (وعليكم السلام ورحمة الله) وترحيب قصير.',
    },
    // 🟢 أطول سورة
    {
      subType: 'longest_surah',
      patterns: [
        /(اطول|أطول|اكبر|أكبر)\s*(سور[ةه])/i,
        /ما\s*(هي|هى)?\s*(اطول|أطول)\s*(سور[ةه])/i,
      ],
      response: '📖 أطول سورة في القرآن الكريم هي **سورة البقرة**، وعدد آياتها **286 آية**.',
    },

    // 🟢 أقصر سورة
    // {
    //   subType: 'shortest_surah',
    //   patterns: [
    //     /(اقصر|أقصر|اصغر|أصغر)\s*(سور[ةه])/i,
    //     /ما\s*(هي|هى)?\s*(اقصر|أقصر)\s*(سور[ةه])/i,
    //   ],
    //   response: '📖 أقصر سورة في القرآن الكريم هي **سورة الكوثر**، وعدد آياتها **3 آيات**.',
    // },

    // // 🟢 عدد السور
    // {
    //   subType: 'surah_count',
    //   patterns: [
    //     /(كم|عدد)\s*(سور[ةه]|السور)/i,
    //     /^(كم عدد السور بالقران )/i,
    //     /كم\s*سور[ةه]\s*(في|ب|فى)?\s*(القرآن|القران|المصحف)/i,
    //   ],
    //   response: '📖 عدد سور القرآن الكريم **114 سورة**.',
    // },

    // // 🟢 السؤال عن الحال
    // {
    //   subType: 'how_are_you',
    //   patterns: [
    //     /^(كيف\s*حالك|كيفك|شو\s*اخبارك|شو\s*الأخبار|كيف\s*الحال)/i,
    //     /^(كيف\s*امورك)/i,
    //     /^(شلونك|اشلونك|ازيك|عامل\s*ايه)/i,
    //     /^(كيف\s*الدنيا|طمنّي\s*عليك)/i,
    //   ],
    //   response: 'رد بالحمد (بخير والحمد لله) ورحب بالمستخدم واسأله كيف تساعده.',
    // },

    // 🟢 الشكر والمجاملة
    {
      subType: 'thanks',
      patterns: [
        /^(شكرا+|شكراً+|مشكور+|يسلمو+|تسلم)/i,
        /^(الله\s*يعطيك\s*العافيه|جزاك\s*الله\s*خيرا)/i,
      ],
      response: "رد بـ 'عفواً' أو 'وجزاكم الله خيراً' مع دعوة طيبة.",
    },

    // 🟢 السؤال عن الهوية (من أنت؟)
    {
      subType: 'identity',
      patterns: [
        /^(من\s*انت|مين\s*انت|شو\s*اسمك|ما\s*اسمك|وش\s*اسمك)/i,
        /^(عرفني\s*عن\s*نفسك|احكي\s*لي\s*عن\s*حالك)/i,
      ],
      response: "عرّف بنفسك: 'أنا المساعد القرآني، متخصص في تفسير القرآن الكريم من كتاب ابن كثير'.",
    },

    // 🟢 السؤال عن الوظيفة (ماذا تفعل؟)
    {
      subType: 'action',
      patterns: [
        /^(شو\s*بتعمل|ايش\s*تسوي|ماذا\s*تفعل)/i,
        /^(شو\s*وظيفتك|بتشتغل\s*ايه)/i,
      ],
      response: 'اشرح أن وظيفتك هي جلب التفسير الموثوق لأي آية من كتاب ابن كثير.',
    },

    // 🟢 السؤال عن طريقة الاستخدام
    {
      subType: 'usage',
      patterns: [
        /^(كيف\s*استخدمك|كيف\s*اسالك|كيف\s*اشتغل\s*معك)/i,
        /^(شو\s*بقدر\s*اعمل\s*فيك|كيف\s*بتفيدني)/i,
      ],
      response: "اشرح للمستخدم: 'اكتب اسم السورة ورقم الآية (مثال: تفسير سورة الإخلاص آية 1)'.",
    },

    // 🟢 الوداع
    {
      subType: 'goodbye',
      patterns: [
        /^(مع\s*السلامه|باي+|وداعا|الى\s*اللقاء)/i,
        /^(نشوفك\s*بخير|تصبح\s*على\s*خير)/i,
      ],
      response: 'رد بوداع لطيف ودعاء بالتوفيق (في أمان الله).',
    },

    // 🟢 الردود القصيرة
    {
      subType: 'short_reply',
      patterns: [
        /^(اوك|تمام|حسنا|طيب|ماشي)$/i,
        /^(نعم|لا|اه|أه)$/i,
      ],
      response: 'رد قصير جداً للإقرار (تفضل، أنا معك، كيف أساعدك؟).',
    },

    // 🟢 طلب التحدث بالإنجليزية
    {
      subType: 'english_request',
      patterns: [
        /(احكي|تكلم|اكتب|رد|تحدث|حكي)\s*(ب)?(ال)?(انجليزي|إنجليزي|انكليزي|إنكليزي|انجليزية|إنجليزية)/i,
        /(بالانجليزي|بالإنجليزي|بالانكليزي|بالإنكليزي)/i,
        /english/i,
      ],
      response: 'عذراً، أنا أدعم التحدث باللغة العربية فقط. كيف يمكنني مساعدتك؟',
    },
  ];

  for (const category of casualCategories) {
    for (const pattern of category.patterns) {
      if (pattern.test(text) || pattern.test(normalizedText)) {
        return {
          type: 'casual',
          reason: 'casual_chat',
          subType: category.subType,
          customResponse: category.response,
        };
      }
    }
  }

  // 2️⃣ 🚫 الممنوعات الصريحة (الأولوية القصوى)
  const forbiddenPatterns = [
    // فتاوى وأحكام شرعية (تم التوسيع لتشمل الأحكام الفقهية)
    /رأي/,
    /حكم/,
    /فتو[ىي]/,
    /هل يجوز/,
    /حلال/,
    /حرام/,
    /قارن/,
    /الفرق بين/,
    /ما\s*حكم/,
    /ماحكم/,
    /هل\s*يصح/,
    /هل\s*تصح/,
    /مباح/,
    /مكروه/,
    /واجب/,
    /سنة/,
    /بدعة/,
    /كفارة/,
    /فدية/,
    /زكاة/,
    /صلاة/,
    /صلاه/,
    /وضوء/,
    /صيام/,
    /حج/,
    /عمرة/,
    /طهارة/,
    /طلاق/,
    /زواج/,
    /ميراث/,
    /عده/,
    /نفاس/,
    /حيض/,
    /جنابة/,
    /استحاضة/,

    // تجويد
    /تجويد/,
    /مخارج/,
    /صفات/,
    /إدغام/,
    /ادغام/,
    /إخفاء/,
    /اخفاء/,
    /إقلاب/,
    /اقلاب/,
    /إظهار/,
    /اظهار/,
    /مد/,
    /غن[ةه]/,
    /قلقلة/,
    /ترقيق/,
    /تفخيم/,
    // مواضيع أخرى
    /حديث/,
    /سيرة/,
    /تاريخ/,
    /فقه/,
    /عقيدة/,
  ];

  for (const pattern of forbiddenPatterns) {
    if (pattern.test(text)) {
      return { type: 'forbidden', reason: 'forbidden_topic' };
    }
  }

  // 3️⃣ أنماط التفسير القرآني (المسموح - العربية فقط)
  const tafsirPatterns = [
    /تفسير/,
    /فسر/,
    /معن[ىي]/,
    /شرح/,
    /ما معنى/,
    /ما المقصود/,
    /المقصود ب/,
  ];

  for (const pattern of tafsirPatterns) {
    if (pattern.test(text)) {
      return { type: 'tafsir', reason: 'tafsir_keyword' };
    }
  }

  // إذا يحتوي على إشارة لآية أو سورة
  if (/آي[ةه]|سور[ةه]|\d{1,3}:\d{1,3}/.test(text)) {
    return { type: 'tafsir', reason: 'verse_reference' };
  }

  // البحث عن اسم سورة
  for (const surah of SURAH_CANONICAL) {
    for (const name of surah.names) {
      if (normalizedText.includes(normalizeArabic(name))) {
        return { type: 'tafsir', reason: 'surah_name' };
      }
    }
  }

  // 4️⃣ البحث الذكي (Fuzzy)
  // تم رفع العتبة إلى 0.75 لأن أقل من ذلك قد يخلط كلمات عامة بأسماء سور
  const fuzzyResult = fuzzyFindSurah(text);
  if (fuzzyResult && fuzzyResult.confidence >= 0.75) {
    return { type: 'tafsir', reason: 'fuzzy_surah_match' };
  }

  // إذا وصلنا هنا ولم يتم تصنيف السؤال كـ forbidden أو tafsir، سيتم رفضه في النهاية.

  // 4️⃣ محاولة أخيرة: رقم + كلمة تشبه آية
  if (/\d+/.test(text) && /سور|اي[عهة]|ايا/i.test(normalizedText)) {
    return { type: 'tafsir', reason: 'number_with_surah_pattern' };
  }

  // 5️⃣ أي شيء آخر -> ممنوع (Strict Mode)
  return { type: 'forbidden', reason: 'unknown_topic_strict_mode' };
}

/**
 * معالجة الدردشة العامة باستخدام AI (مع قيود صارمة)
 */
async function handleCasualChat(message, subType = 'greeting', customResponse = '') {
  try {
    const openai = getOpenAIClient();

    // استخدام الرد المخصص إذا تم تمريره، وإلا استخدام رد افتراضي
    const contextInstruction = customResponse || 'رد ترحيبي عام ومختصر.';

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `أنت "المساعد القرآني" - متخصص في تفسير القرآن الكريم من كتاب ابن كثير.

📝 المطلوب منك:
${contextInstruction}

✅ قواعد صارمة:
- تحدث بالعربية الفصحى فقط (ممنوع الإنجليزية).
- كن لطيفاً ومختصراً جداً (جملة أو جملتين).
- لا تخرج عن سياق التفسير القرآني.
`,
        },
        { role: 'user', content: message },
      ],
      temperature: 0.6,
      max_tokens: 100,
    });

    return response.choices[0].message.content.trim();
  } catch (error) {
    return 'أهلاً بك! أنا هنا لمساعدتك في تفسير الآيات القرآنية. كيف يمكنني مساعدتك؟';
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// 📝 تنسيق الإجابة
// ═══════════════════════════════════════════════════════════════════════════

function formatTafsirResponse(tafsir, includeNuzul = false) {
  let response = `📖 **سورة ${tafsir.surahName} - الآية ${tafsir.ayahNumber}**\n\n`;
  response += `📜 **نص الآية:**\n${tafsir.ayahText}\n\n`;
  response += `📚 **تفسير ابن كثير:**\n${tafsir.tafsir}`;

  if (includeNuzul && tafsir.nuzulReason) {
    response += `\n\n📌 **سبب النزول:**\n${tafsir.nuzulReason}`;
  }

  return response;
}

// ═══════════════════════════════════════════════════════════════════════════
// 🚀 Main Chat Handler
// ═══════════════════════════════════════════════════════════════════════════

exports.chat = async (req, res) => {
  const { message } = req.body;
  const startTime = Date.now();

  if (!message || message.trim().length < 2) {
    return res
      .status(400)
      .json({ success: false, message: 'يرجى إدخال سؤال صحيح' });
  }

  const requestLog = {
    timestamp: new Date().toISOString(),
    question: message,
    type: null,
  };

  try {
    // 1️⃣ تصنيف السؤال
    const classification = classifyQuestion(message);
    requestLog.type = classification.type;
    console.log(
      `📊 Validating Question: ${classification.type} (${classification.reason})`,
    );

    // حالة: دردشة عامة (تحيات)
    if (classification.type === 'casual') {
      const casualResponse = await handleCasualChat(
        message,
        classification.subType,
        classification.customResponse || '',
      );
      return res.json({
        success: true,
        data: {
          message: casualResponse,
          timestamp: new Date().toISOString(),
          metadata: {
            ...requestLog,
            processingTime: `${Date.now() - startTime}ms`,
          },
        },
      });
    }

    // حالة: ممنوع (تجويد، فتاوى، اللغة الإنجليزية، أو غير معروف)
    if (classification.type === 'forbidden') {
      let errorMessage =
        '⚠️ عذراً، أنا غير مصرح لي بالإجابة على هذا النوع من الأسئلة.\n\nتخصصي هو **تفسير القرآن الكريم فقط** من تفسير ابن كثير.\n\n❌ لا يمكنني الإجابة عن:\n- أحكام التجويد والقراءات\n- الفتاوى الحلال والحرام\n- الأسئلة العامة\n\n💡 يمكنك سؤالي: تفسير سورة الفاتحة، تفسير آية الكرسي..';

      if (classification.reason === 'english_language_detected') {
        errorMessage =
          '⚠️ **عذراً، يرجى التحدث باللغة العربية فقط.**\n\nأنا مبرمج لفهم والرد على الأسئلة باللغة العربية حصراً.';
      }

      return res.json({
        success: true,
        data: {
          message: errorMessage,
          timestamp: new Date().toISOString(),
          metadata: requestLog,
        },
      });
    }

    // حالة: تفسير (tafsir)

    // هل سأل عن سبب النزول؟
    const asksForNuzul = /سبب\s*(?:ال)?نزول|لماذا\s*نزلت|متى\s*نزلت/i.test(
      message,
    );

    // 2️⃣ استخراج مفتاح الآية
    const verseKey = await extractVerseKey(message);

    // التحقق من الخطأ الإملائي (اقتراحات)
    if (verseKey && verseKey.needsConfirmation && verseKey.suggestions) {
      const suggestionsList = verseKey.suggestions
        .map((s, i) => `${i + 1}. سورة ${s.surahName}`)
        .join('\n');

      return res.json({
        success: true,
        data: {
          message: `🤔 لم أجد سورة بهذا الاسم.\n\n**هل تقصد إحدى هذه السور؟**\n\n${suggestionsList}\n\n💡 اختر الاسم الصحيح.`,
          timestamp: new Date().toISOString(),
          metadata: requestLog,
          surahSuggestions: verseKey.suggestions.map((s) => ({
            surahNumber: s.surahNumber,
            surahName: s.surahName,
            label: `سورة ${s.surahName}`,
            chatText: `تفسير سورة ${s.surahName} آية `,
          })),
        },
      });
    }

    // لم يتم التعرف على الآية
    if (!verseKey) {
      return res.json({
        success: true,
        data: {
          message:
            'لم أتمكن من تحديد الآية المطلوبة بدقة. 🤔\n\nيرجى تحديد **رقم السورة والآية** بوضوح.\n\nمثال: تفسير سورة البقرة آية 255',
          timestamp: new Date().toISOString(),
          metadata: requestLog,
        },
      });
    }

    // سورة بدون آية -> اطلب رقم الآية
    if (verseKey.surah && !verseKey.ayah) {
      // جلب اسم السورة من SURAH_CANONICAL
      const surahInfo = SURAH_CANONICAL.find(
        (s) => s.number === verseKey.surah,
      );
      const surahName = surahInfo
        ? surahInfo.names[0]
        : `رقم ${verseKey.surah}`;

      return res.json({
        success: true,
        data: {
          message: `📖 تم تحديد **سورة ${surahName}**\n\nيرجى كتابة رقم الآية التي تريد تفسيرها.\n\n💡 مثال: تفسير سورة ${surahName} آية 1`,
          timestamp: new Date().toISOString(),
          metadata: {
            ...requestLog,
            surah: verseKey.surah,
            waitingForAyah: true,
          },
        },
      });
    }

    // 3️⃣ التحقق من صحة رقم الآية
    const ayahValidation = validateAyahNumber(verseKey.surah, verseKey.ayah);
    if (!ayahValidation.valid) {
      return res.json({
        success: true,
        data: {
          message: `❌ **الآية ${verseKey.ayah} غير موجودة في سورة ${ayahValidation.surahName}**\n\n📊 السورة تحتوي على **${ayahValidation.maxAyah} آية** فقط.`,
          timestamp: new Date().toISOString(),
          metadata: { ...requestLog, error: 'ayah_out_of_range' },
        },
      });
    }

    // 4️⃣ جلب التفسير من قاعدة البيانات (Strict Mode: Exact Match only)
    const tafsir = await TafsirIbnKathir.findOne({
      surahNumber: verseKey.surah,
      ayahNumber: verseKey.ayah,
    });

    if (!tafsir) {
      return res.json({
        success: true,
        data: {
          message: `عذراً، لم أجد تفسيراً محفوظاً لهذه الآية في قاعدة البيانات حالياً.\n\nالآية: ${verseKey.surah}:${verseKey.ayah}`,
          timestamp: new Date().toISOString(),
          metadata: requestLog,
        },
      });
    }

    // 5️⃣ إرسال الرد النهائي
    const processingTime = Date.now() - startTime;
    return res.json({
      success: true,
      data: {
        message: formatTafsirResponse(tafsir, asksForNuzul),
        timestamp: new Date().toISOString(),
        metadata: { ...requestLog, processingTime: `${processingTime}ms` },
      },
    });
  } catch (error) {
    console.error('❌ Chat error:', error);
    return res.status(500).json({
      success: false,
      message: 'حدث خطأ في النظام',
      error: error.message,
    });
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// 🔊 TTS - تحويل النص إلى صوت
// ═══════════════════════════════════════════════════════════════════════════

exports.speak = async (req, res) => {
  const { text } = req.body;
  if (!text || text.length < 5)
    return res.status(400).json({ success: false, message: 'النص قصير جداً' });

  try {
    const openai = getOpenAIClient();
    // تقصير النص إذا لزم الأمر - 4000 حرف كثير جداً، سنقلله لـ 1000 لضمان السرعة
    // أو نأخذ أول فقرتين فقط
    let inputText = text;
    if (inputText.length > 4000) {
      // محاولة ذكية: خذ أول 1000 حرف لكن توقف عند نهاية جملة
      const truncated = inputText.substring(0, 1000);
      const lastPeriod = truncated.lastIndexOf('.');
      inputText =
        lastPeriod > 0 ? truncated.substring(0, lastPeriod + 1) : truncated;
    }

    const mp3 = await openai.audio.speech.create({
      model: 'tts-1',
      voice: 'onyx',
      input: inputText,
      speed: 1.1, // تسريع الصوت قليلاً (10%) لتقليل مدة التوليد
    });

    const buffer = Buffer.from(await mp3.arrayBuffer());

    res.set({
      'Content-Type': 'audio/mpeg',
      'Content-Length': buffer.length,
      'Cache-Control': 'public, max-age=3600',
    });
    res.send(buffer);
  } catch (error) {
    console.error('TTS Error:', error);
    res.status(500).json({ success: false, message: 'فشل تحويل الصوت' });
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// 🎤 STT - تحويل الصوت إلى نص
// ═══════════════════════════════════════════════════════════════════════════

exports.transcribe = async (req, res) => {
  if (!req.file)
    return res
      .status(400)
      .json({ success: false, message: 'يرجى إرسال ملف صوتي' });

  try {
    const openai = getOpenAIClient();
    const fs = require('fs');

    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(req.file.path),
      model: 'whisper-1',
      language: 'ar',
    });

    fs.unlinkSync(req.file.path);
    res.json({ success: true, text: transcription.text });
  } catch (error) {
    console.error('STT Error:', error);
    res.status(500).json({ success: false, message: 'فشل تحويل الصوت' });
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// 🔍 اقتراحات السور
// ═══════════════════════════════════════════════════════════════════════════

exports.getSurahSuggestions = async (req, res) => {
  const { query } = req.query;
  if (!query || query.trim().length < 2) {
    return res.status(400).json({ success: false, message: 'نص البحث قصير' });
  }

  try {
    const exactMatch = fuzzyFindSurah(query);
    if (exactMatch && exactMatch.confidence >= 0.9) {
      return res.json({
        success: true,
        exactMatch: true,
        data: {
          surahNumber: exactMatch.surahNumber,
          surahName: exactMatch.surahName,
          chatText: `تفسير سورة ${exactMatch.surahName} آية `,
        },
      });
    }

    const suggestions = findClosestSurahs(query, 5);
    return res.json({
      success: true,
      exactMatch: false,
      suggestions: suggestions.map((s) => ({
        ...s,
        label: `سورة ${s.surahName}`,
        chatText: `تفسير سورة ${s.surahName} آية `,
      })),
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
