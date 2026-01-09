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
        aiClient = new OpenAI({ apiKey });
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
                    // Fetch specific ayah
                    console.log(`🔍 Fetching Tafsir for Surah ${ref.surah}, Ayah ${ref.ayah}`);
                    const apiUrl = `https://api.quran.com/api/v4/tafsirs/16/by_ayah/${ref.surah}:${ref.ayah}`;
                    const apiRes = await axios.get(apiUrl);
                    const tafsirData = apiRes.data.tafsir;

                    if (tafsirData) {
                        const cleanText = tafsirData.text.replace(/<[^>]*>?/gm, '');
                        console.log('✅ Tafsir retrieved successfully');

                        retrievedContext = `
CONTENT:
Tafsir: ${cleanText}
Edition: ${tafsirData.resource_name}
Surah: ${ref.surah}
Ayah: ${ref.ayah}
`;
                    }
                } else {
                    // Fetch entire surah tafsir
                    console.log(`🔍 Fetching Tafsir for entire Surah ${ref.surah}`);
                    const apiUrl = `https://api.quran.com/api/v4/tafsirs/16/by_chapter/${ref.surah}`;
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
Edition: Tafsir Muyassar
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

        const systemPrompt = `You are a STRICT, source-bound assistant for Qur’an Tafsir.

SOURCE POLICY:
- You MUST rely ONLY on the text returned from Quran.com (Quran Foundation) API.
- The API response text is the ONLY source of truth.
- Do NOT use any outside knowledge or prior training.

NON-NEGOTIABLE RULES:
1) Answer ONLY using the exact Tafsir text provided by the API.
2) For full surah tafsir, present each ayah's tafsir clearly with its number.
3) Format the response in a readable way with proper line breaks.
4) If the API does NOT return Tafsir text or CONTEXT is empty,
   reply EXACTLY with:
   "عذراً، هذه المعلومة غير متوفرة في المصادر المتاحة."
5) If you reply with the fallback sentence, DO NOT include any source, surah, or ayah.
6) Keep the answer minimal and factual.

OUTPUT FORMAT:
- Answer in Arabic unless the user asks for English.
- For single ayah: output the tafsir text verbatim with citation.
- For full surah: present each ayah's tafsir in a clear, organized way.
- Citation format: (المصدر: {tafsir_name}, سورة {surah_number})

PRIORITY:
Textual accuracy, faithful quotation, and zero hallucination.

### RETRIEVED CONTEXT ###
${retrievedContext}
#########################`;

        // Switch to OpenAI Chat Completions API
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini", // Cost-effective and fast
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: message }
            ],
            temperature: 0.1, // Low temperature for factual accuracy
            max_tokens: 3000 // Increased for full surah tafsir
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
