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

    res.json({
      success: true,
      count: surahs.length,
      data: surahs
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
    if (!surah) {
      return res.status(404).json({
        success: false,
        message: 'السورة غير موجودة'
      });
    }

    // جلب الآيات
    const ayahs = await QuranAyah.find({ surahNumber: num })
      .sort({ ayahNumber: 1 })
      .lean();

    res.json({
      success: true,
      surah,
      ayahs,
      count: ayahs.length
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
