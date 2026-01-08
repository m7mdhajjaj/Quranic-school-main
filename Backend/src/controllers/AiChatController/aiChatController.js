const catchAsync = require('../../utils/catchAsync');
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

// Helper: Extract Surah/Ayah from user message
async function extractVerseReference(text, openai) {
    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { 
                    role: "system", 
                    content: `You are a Quranic reference extractor. Analyze the user's input.
1. If they mention a Surah/Ayah by name/number, extract it.
2. If they quote a verse (in Arabic or English), identify the Surah number (1-114) and Ayah number using your internal knowledge.
Return ONLY a JSON object: {"surah": number, "ayah": number}.
If no specific verse is detected, return {"surah": null, "ayah": null}.` 
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

exports.chat = catchAsync(async (req, res, next) => {
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
        let retrievedContext = "";

        // 2. Fetch Tafsir from API if reference exists
        if (ref.surah && ref.ayah) {
            try {
                // Using Quran.com API (Tafsir Muyassar ID: 16)
                // Endpoint: https://api.quran.com/api/v4/tafsirs/16/by_ayah/{chapter}:{verse}
                const apiUrl = `https://api.quran.com/api/v4/tafsirs/16/by_ayah/${ref.surah}:${ref.ayah}`;
                const apiRes = await axios.get(apiUrl);
                const tafsirData = apiRes.data.tafsir;

                if (tafsirData) {
                    // Strip HTML tags found in Quran.com response
                    const cleanText = tafsirData.text.replace(/<[^>]*>?/gm, '');

                    retrievedContext = `
CONTENT:
Tafsir: ${cleanText}
Edition: ${tafsirData.resource_name} (Tafsir Muyassar)
Surah: ${ref.surah}
Ayah: ${ref.ayah}
`;
                }
            } catch (err) {
                console.error("External API Fetch Error:", err.message);
                // Fallthrough: Context remains empty, handled by system prompt fallback.
            }
        }

        const systemPrompt = `You are a STRICT, source-bound assistant for Qur’an Tafsir.

SOURCE POLICY:
- You MUST rely ONLY on the text returned from Quran.com (Quran Foundation) API.
- The API response text is the ONLY source of truth.
- Do NOT use any outside knowledge or prior training.

NON-NEGOTIABLE RULES:
1) Answer ONLY using the exact Tafsir text provided by the API.
2) Do NOT interpret, infer, summarize, paraphrase, or expand the Tafsir.
3) Do NOT combine meanings from different tafsirs.
4) If the API does NOT return Tafsir text for the requested surah/ayah or CONTEXT is empty,
   reply EXACTLY with:
   "عذراً، هذه المعلومة غير متوفرة في المصادر المتاحة."
5) If you reply with the fallback sentence, DO NOT include any source, surah, or ayah.
6) Keep the answer minimal and factual.

OUTPUT FORMAT:
- Answer in Arabic unless the user asks for English.
- If Tafsir text exists, output it verbatim.
- End with ONE citation line only, exactly in this format:
  (Source: {tafsir_name}, Surah {surah_number}, Ayah {ayah_number})

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
            max_tokens: 500
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
});
