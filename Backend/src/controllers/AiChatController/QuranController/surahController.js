/**
 * 📖 Surah Controller
 * يستخدم MongoDB بدل External API
 */

const { QuranSurah, QuranAyah } = require('../../../schema/AI/Quran');

// ═══════════════════════════════════════════════════════════════════════════
// Get all Surahs - جلب جميع السور
// ═══════════════════════════════════════════════════════════════════════════
exports.getAllSurahs = async (req, res) => {
  try {
    const surahs = await QuranSurah.find()
      .sort({ number: 1 })
      .select('number nameArabic nameEnglish ayahCount revelationType')
      .lean();

    // ✅ تحويل البيانات لتكون متوافقة مع external API format
    const formattedSurahs = surahs.map(surah => ({
      number: surah.number,
      name: surah.nameArabic,
      englishName: surah.nameEnglish,
      numberOfAyahs: surah.ayahCount,
      revelationType: surah.revelationType
    }));

    res.json({
      success: true,
      count: formattedSurahs.length,
      data: formattedSurahs
    });
  } catch (error) {
    console.error('Error fetching surahs:', error.message);
    res.status(500).json({ 
      success: false,
      message: 'فشل في جلب السور',
      error: error.message 
    });
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// Get Surah with Ayahs - جلب سورة مع آياتها
// ═══════════════════════════════════════════════════════════════════════════
exports.getSurahWithAyahs = async (req, res) => {
  try {
    const { surahNumber } = req.params;
    const num = parseInt(surahNumber);

    // Validate
    if (!num || num < 1 || num > 114) {
      return res.status(400).json({
        success: false,
        message: 'رقم السورة غير صالح. يجب أن يكون بين 1 و 114'
      });
    }

    // جلب السورة
    const surah = await QuranSurah.findOne({ number: num }).lean();
    
    // ✅ إذا لم نجد السورة في القاعدة، نرجع رسالة واضحة
    if (!surah) {
      console.log(`❌ Surah ${num} not found in database. Database might be empty.`);
      return res.status(404).json({
        success: false,
        message: 'السورة غير موجودة في قاعدة البيانات. يرجى استيراد بيانات القرآن أولاً.',
        hint: 'استخدم POST /api/quran/import لاستيراد البيانات',
        fallbackToExternalAPI: true
      });
    }

    // جلب الآيات
    const ayahs = await QuranAyah.find({ surahNumber: num })
      .sort({ ayahNumber: 1 })
      .lean();

    // ✅ تحويل البيانات لتكون متوافقة مع external API format
    const formattedData = {
      number: surah.number,
      name: surah.nameArabic,
      englishName: surah.nameEnglish,
      englishNameTranslation: surah.englishNameTranslation || surah.nameEnglish,
      numberOfAyahs: surah.ayahCount,
      revelationType: surah.revelationType,
      ayahs: ayahs.map(ayah => ({
        number: ayah.globalAyahNumber || ayah.ayahNumber,
        numberInSurah: ayah.ayahNumber,
        text: ayah.text,
        juz: ayah.juz,
        manzil: ayah.manzil,
        page: ayah.page,
        ruku: ayah.ruku,
        hizbQuarter: ayah.hizbQuarter,
        sajda: ayah.sajda || false
      }))
    };

    res.json({
      success: true,
      data: formattedData
    });
  } catch (error) {
    console.error(`Error fetching surah ${req.params.surahNumber}:`, error.message);
    res.status(500).json({ 
      success: false,
      message: 'فشل في جلب السورة',
      error: error.message 
    });
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// Get specific Ayah - جلب آية محددة
// ═══════════════════════════════════════════════════════════════════════════
exports.getAyah = async (req, res) => {
  try {
    const { surahNumber, ayahNumber } = req.params;
    const surahNum = parseInt(surahNumber);
    const ayahNum = parseInt(ayahNumber);

    // Validate surah
    if (!surahNum || surahNum < 1 || surahNum > 114) {
      return res.status(400).json({
        success: false,
        message: 'رقم السورة غير صالح'
      });
    }

    // جلب الآية
    const ayah = await QuranAyah.findOne({
      surahNumber: surahNum,
      ayahNumber: ayahNum
    }).lean();

    if (!ayah) {
      return res.status(404).json({
        success: false,
        message: `الآية ${surahNum}:${ayahNum} غير موجودة`
      });
    }

    res.json({
      success: true,
      data: ayah
    });
  } catch (error) {
    console.error(`Error fetching ayah:`, error.message);
    res.status(500).json({ 
      success: false,
      message: 'فشل في جلب الآية',
      error: error.message 
    });
  }
};
