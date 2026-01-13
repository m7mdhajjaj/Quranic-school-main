// const catchAsync = require('../../utils/catchAsync');
const OpenAI = require('openai');
const axios = require('axios');

// Initialize OpenAI Client lazy or safely
let aiClient;
const getOpenAIClient = () => {
    if (!aiClient) {
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
            throw new Error("API Key is missing in environment variables.");
        }
        aiClient = new OpenAI({ 
            apiKey,
            timeout: 80000, // 80 seconds timeout
            maxRetries: 2
        });
    }
    return aiClient;
};

// Surah names dictionary (Arabic)
const surahNames = {
    'الفاتحة': 1, 'البقرة': 2, 'آل عمران': 3, 'النساء': 4, 'المائدة': 5,
    'الأنعام': 6, 'الأعراف': 7, 'الأنفال': 8, 'التوبة': 9, 'يونس': 10,
    'هود': 11, 'يوسف': 12, 'الرعد': 13, 'إبراهيم': 14, 'الحجر': 15,
    'النحل': 16, 'الإسراء': 17, 'الكهف': 18, 'مريم': 19, 'طه': 20,
    'الأنبياء': 21, 'الحج': 22, 'المؤمنون': 23, 'النور': 24, 'الفرقان': 25,
    'الشعراء': 26, 'النمل': 27, 'القصص': 28, 'العنكبوت': 29, 'الروم': 30,
    'لقمان': 31, 'السجدة': 32, 'الأحزاب': 33, 'سبأ': 34, 'فاطر': 35,
    'يس': 36, 'الصافات': 37, 'ص': 38, 'الزمر': 39, 'غافر': 40,
    'فصلت': 41, 'الشورى': 42, 'الزخرف': 43, 'الدخان': 44, 'الجاثية': 45,
    'الأحقاف': 46, 'محمد': 47, 'الفتح': 48, 'الحجرات': 49, 'ق': 50,
    'الذاريات': 51, 'الطور': 52, 'النجم': 53, 'القمر': 54, 'الرحمن': 55,
    'الواقعة': 56, 'الحديد': 57, 'المجادلة': 58, 'الحشر': 59, 'الممتحنة': 60,
    'الصف': 61, 'الجمعة': 62, 'المنافقون': 63, 'التغابن': 64, 'الطلاق': 65,
    'التحريم': 66, 'الملك': 67, 'القلم': 68, 'الحاقة': 69, 'المعارج': 70,
    'نوح': 71, 'الجن': 72, 'المزمل': 73, 'المدثر': 74, 'القيامة': 75,
    'الإنسان': 76, 'المرسلات': 77, 'النبأ': 78, 'النازعات': 79, 'عبس': 80,
    'التكوير': 81, 'الانفطار': 82, 'المطففين': 83, 'الانشقاق': 84, 'البروج': 85,
    'الطارق': 86, 'الأعلى': 87, 'الغاشية': 88, 'الفجر': 89, 'البلد': 90,
    'الشمس': 91, 'الليل': 92, 'الضحى': 93, 'الشرح': 94, 'التين': 95,
    'العلق': 96, 'القدر': 97, 'البينة': 98, 'الزلزلة': 99, 'العاديات': 100,
    'القارعة': 101, 'التكاثر': 102, 'العصر': 103, 'الهمزة': 104, 'الفيل': 105,
    'قريش': 106, 'الماعون': 107, 'الكوثر': 108, 'الكافرون': 109, 'النصر': 110,
    'المسد': 111, 'الإخلاص': 112, 'الفلق': 113, 'الناس': 114
};

// Get surah name by number
const getSurahNameByNumber = (num) => {
    return Object.keys(surahNames).find(key => surahNames[key] === num) || '';
};

// Helper: Extract Surah/Ayah from user message
async function extractVerseReference(text, openai) {
    // First, try to extract using regex patterns for common Arabic formats
    const normalizedText = text.trim().replace(/\s+/g, ' ');
    
    // Try to find any surah name in the text
    let foundSurah = null;
    let foundAyah = null;
    
    // Search for surah name in the text
    for (const [name, number] of Object.entries(surahNames)) {
        if (normalizedText.includes(name)) {
            foundSurah = number;
            break;
        }
    }
    
    if (foundSurah) {
        // Now try to find ayah number with various patterns
        
        // Pattern 1: "آية [number]" or "الآية [number]"
        const ayahPattern1 = /(?:الآية|آية|الايه|ايه)\s+(?:رقم\s+)?(\d+)/i;
        const match1 = normalizedText.match(ayahPattern1);
        if (match1) {
            foundAyah = parseInt(match1[1]);
        }
        
        // Pattern 2: "الآية الأولى/الثانية/الثالثة" etc.
        if (!foundAyah) {
            const arabicNumbers = {
                'الأولى': 1, 'الاولى': 1, 'اولى': 1, 'أولى': 1,
                'الثانية': 2, 'الثانيه': 2, 'ثانية': 2,
                'الثالثة': 3, 'الثالثه': 3, 'ثالثة': 3,
                'الرابعة': 4, 'الرابعه': 4, 'رابعة': 4,
                'الخامسة': 5, 'الخامسه': 5, 'خامسة': 5,
                'الأخيرة': -1, 'الاخيره': -1, 'أخيرة': -1
            };
            
            for (const [word, num] of Object.entries(arabicNumbers)) {
                if (normalizedText.includes(word)) {
                    foundAyah = num;
                    break;
                }
            }
        }
        
        // Pattern 3: "[number] من سورة" - number before surah name
        if (!foundAyah) {
            const ayahPattern3 = /(?:رقم\s+)?(\d+)\s+من\s+سورة/i;
            const match3 = normalizedText.match(ayahPattern3);
            if (match3) {
                foundAyah = parseInt(match3[1]);
            }
        }
        
        // Pattern 4: Just a number after the surah name
        if (!foundAyah) {
            const ayahPattern4 = /(\d{1,3})(?:\s|$)/;
            const afterSurahText = normalizedText.split(Object.keys(surahNames).find(n => normalizedText.includes(n)) || '')[1];
            if (afterSurahText) {
                const match4 = afterSurahText.match(ayahPattern4);
                if (match4) {
                    const num = parseInt(match4[1]);
                    // Only consider it if it's a reasonable ayah number (1-286)
                    if (num >= 1 && num <= 286) {
                        foundAyah = num;
                    }
                }
            }
        }
        
        // Return null for ayah if not explicitly mentioned (to fetch whole surah)
        return { surah: foundSurah, ayah: foundAyah };
    }
    
    // Pattern for questions about specific verses without mentioning "surah"
    // Example: "تفسير آية الكرسي" or "ما معنى آية الكرسي"
    const famousVerses = {
        'الكرسي': { surah: 2, ayah: 255 },
        'آية الكرسي': { surah: 2, ayah: 255 },
        'النور': { surah: 24, ayah: 35 },
        'الدين': { surah: 107, ayah: 1 }
    };
    
    for (const [verse, ref] of Object.entries(famousVerses)) {
        if (normalizedText.includes(verse)) {
            return ref;
        }
    }
    
    // Fallback to AI extraction if regex fails
    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { 
                    role: "system", 
                    content: `You are a Quranic reference extractor. Analyze the user's input in Arabic or English.
1. If they mention a Surah by name or number, extract it (Surah numbers: 1-114).
2. If they mention an Ayah number, extract it.
3. Common Arabic patterns:
   - "سورة طه" = Surah 20
   - "الآية الأولى" or "الاية الاولى" = Ayah 1
   - If only Surah mentioned, default Ayah to 1
Return ONLY a JSON object: {"surah": number, "ayah": number}.
If no specific verse is detected, return {"surah": null, "ayah": null}.

Here are all Surah names with numbers:
${Object.entries(surahNames).map(([name, num]) => `${name}: ${num}`).join(', ')}` 
                },
                { role: "user", content: text }
            ],
            temperature: 0,
            max_tokens: 100
        });

        const content = response.choices[0].message.content.trim();
        const jsonBlock = content.match(/{[\s\S]*}/);
        if (jsonBlock) {
            return JSON.parse(jsonBlock[0]);
        }
        return { surah: null, ayah: null };
    } catch (error) {
        console.error("Error extracting verse reference:", error);
        return { surah: null, ayah: null };
    }
}

exports.chat = async (req, res, next) => {
    const { message } = req.body;

    if (!message) {
        return res.status(400).json({
            success: false,
            message: 'يرجى إدخال رسالة',
        });
    }

    try {
        const openai = getOpenAIClient();

        // 1. Identify Surah & Ayah from the message
        const ref = await extractVerseReference(message, openai);
        console.log('📖 Extracted reference:', ref);
        let retrievedContext = "";

        // 2. Fetch Tafsir from API if reference exists
        if (ref.surah) {
            try {
                if (ref.ayah) {
                    // Fetch specific ayah text
                    console.log(`🔍 Fetching Tafsir for Surah ${ref.surah}, Ayah ${ref.ayah}`);
                    
                    // Get verse text
                    const verseUrl = `https://api.quran.com/api/v4/verses/by_key/${ref.surah}:${ref.ayah}?translations=131&fields=text_uthmani`;
                    const verseRes = await axios.get(verseUrl);
                    const verseText = verseRes.data.verse?.text_uthmani || '';
                    
                    // Get tafsir
                    const apiUrl = `https://api.quran.com/api/v4/tafsirs/14/by_ayah/${ref.surah}:${ref.ayah}`;
                    const apiRes = await axios.get(apiUrl);
                    const tafsirData = apiRes.data.tafsir;

                    if (tafsirData) {
                        const cleanText = tafsirData.text.replace(/<[^>]*>?/gm, '');
                        const surahName = getSurahNameByNumber(ref.surah);
                        console.log('✅ Tafsir retrieved successfully');

                        retrievedContext = `
CONTENT:
Surah Name: ${surahName}
Surah Number: ${ref.surah}
Ayah Number: ${ref.ayah}
Verse Text: ${verseText}
Tafsir: ${cleanText}
Edition: ${tafsirData.resource_name}
`;
                    }
                } else {
                    // Fetch entire surah tafsir
                    console.log(`🔍 Fetching Tafsir for entire Surah ${ref.surah}`);
                    const apiUrl = `https://api.quran.com/api/v4/tafsirs/14/by_chapter/${ref.surah}`;
                    const apiRes = await axios.get(apiUrl);
                    const tafsirs = apiRes.data.tafsirs;

                    if (tafsirs && tafsirs.length > 0) {
                        let fullTafsir = '';
                        tafsirs.forEach((tafsir, index) => {
                            const cleanText = tafsir.text.replace(/<[^>]*>?/gm, '');
                            fullTafsir += `\n[آية ${index + 1}]: ${cleanText}\n`;
                        });
                        console.log(`✅ Full Surah Tafsir retrieved (${tafsirs.length} ayahs)`);

                        retrievedContext = `
CONTENT:
Full Surah Tafsir:
${fullTafsir}
Edition: تفسير ابن كثير
Surah: ${ref.surah}
`;
                    }
                }
            } catch (err) {
                console.error("❌ External API Fetch Error:", err.message);
                // Fallthrough: Context remains empty, handled by system prompt fallback.
            }
        } else {
            console.log('⚠️ No valid Surah reference found in message');
        }

        const systemPrompt = `أنت مساعد قرآني ذكي ومتخصص.

━━━━━━━━━━━━━━━━━━
القواعد الشرعية (إلزامية)
━━━━━━━━━━━━━━━━━━
1. يُمنع منعًا باتًا استخدام الصوت الاصطناعي لتلاوة القرآن الكريم.
2. يُسمح باستخدام الصوت الاصطناعي فقط لشرح الآيات أو قراءة التفسير.
3. عند التعامل مع نص قرآني:
   - لا يتم تحويله إلى صوت.
   - يُعرض نصيًا فقط.
4. عند التعامل مع تفسير:
   - يُسمح بتحويل نص التفسير فقط إلى صوت.

━━━━━━━━━━━━━━━━━━
قواعد المصدر العلمي
━━━━━━━━━━━━━━━━━━
5. مصدر التفسير الوحيد المعتمد هو: تفسير ابن كثير.
6. يُمنع استخدام أو خلط أي تفسير آخر.
7. يُمنع الاجتهاد الشخصي أو إضافة عبارات إنشائية.
8. يجب الحفاظ على المعنى الأصلي لتفسير ابن كثير دون تغيير.

━━━━━━━━━━━━━━━━━━
قواعد التفسير المختصر
━━━━━━━━━━━━━━━━━━
9. التفسير يجب أن يشرح الآية المطلوبة فقط.
10. يُمنع:
    - عرض مقدمات السور
    - ذكر أسماء السورة أو كونها مكية أو مدنية
    - ذكر عدد الآيات أو الكلمات أو الحروف
    - ذكر الخلافات أو الأسانيد أو الروايات المطوّلة
11. طول التفسير لا يتجاوز 1 إلى 3 جمل واضحة.
12. في الحروف المقطعة:
    - يُذكر فقط أنها مما استأثر الله بعلم معناها، كما قال ابن كثير.

━━━━━━━━━━━━━━━━━━
قواعد الصوت (TTS)
━━━━━━━━━━━━━━━━━━
13. الصوت يجب أن يكون:
    - عربيًا واضحًا
    - هادئًا
    - تعليميًا
    - محايد النبرة
14. تُضاف توقفات طبيعية بين الجمل.
15. يُمنع استخدام نبرة درامية أو عاطفية زائدة.
16. النص الذي يُحوّل إلى صوت هو نص التفسير فقط.

━━━━━━━━━━━━━━━━━━
قواعد تقنية
━━━━━━━━━━━━━━━━━━
17. لا يُعاد توليد الصوت إذا كان موجودًا مسبقًا (استخدم التخزين المؤقت).
18. لا تُرسل أي بيانات مستخدم لخدمة الصوت.
19. يُرسل فقط نص التفسير الخالص.

━━━━━━━━━━━━━━━━━━
تنسيق الإخراج النصي
━━━━━━━━━━━━━━━━━━

==============================
📖 السورة: {اسم السورة} ({رقم}) | الآية: ({رقم})
==============================
🕉 نص الآية:
﴿ {النص القرآني بالرسم العثماني} ﴾

📜 التفسير (ابن كثير – مختصر):
- {خلاصة المعنى المباشر للآية}

عند تفعيل الصوت:
- يتم تحويل نص "التفسير فقط" إلى صوت.
- لا يتم تحويل نص الآية إلى صوت.

### CONTEXT ###
${retrievedContext}
#############`;

        // Switch to OpenAI Chat Completions API
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: message }
            ],
            temperature: 0,
            max_tokens: 16000 // زيادة للنصوص الطويلة
        });

        const aiResponse = completion.choices[0].message.content;

        res.status(200).json({
            success: true,
            data: {
                message: aiResponse,
            },
        });
    } catch (error) {
        console.error("OpenAI API Error:", error);

        // Standard error handling
        let errorMessage = "عذراً، حدث خطأ في النظام.";
        let technicalDetail = error.message || String(error);

        if (technicalDetail.includes('API key')) {
            errorMessage = "مفتاح API غير صالح.";
        } else if (technicalDetail.includes('429')) {
            errorMessage = "عذراً، لقد تجاوزت الحد المسموح به من الطلبات (Quota Exceeded). يرجى المحاولة لاحقاً.";
        } else if (technicalDetail.includes('401')) {
             errorMessage = "خطأ في المصادقة (Authentication Error).";
        }

        res.status(500).json({
            success: false,
            message: errorMessage,
            error: errorMessage 
        });
    }
};

// Text-to-Speech Endpoint
exports.generateSpeech = async (req, res) => {
    try {
        const { text } = req.body;
        if (!text) {
             return res.status(400).json({ success: false, message: 'Text is required' });
        }

        const openai = getOpenAIClient();
        
        // Using "onyx" for a deep, calm, and authoritative voice suitable for Tafsir
        const mp3 = await openai.audio.speech.create({
            model: "tts-1",
            voice: "onyx", 
            input: text,
        });

        const buffer = Buffer.from(await mp3.arrayBuffer());

        res.set('Content-Type', 'audio/mpeg');
        res.set('Content-Length', buffer.length);
        res.send(buffer);

    } catch (error) {
        console.error('TTS Generation Error:', error);
        res.status(500).json({ success: false, message: 'Failed to generate speech' });
    }
};
