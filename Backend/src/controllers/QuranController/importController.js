const fs = require('fs');
const path = require('path');
const { QuranSurah, QuranAyah } = require('../../../schema/AI/Quran');
const TafsirIbnKathir = require('../../../schema/AI/Quran/TafsirIbnKathir');

/**
 * 📥 Import Controller
 * استيراد بيانات القرآن
 */

/**
 * @desc    Import Quran data from JSON files
 * @route   POST /api/quran/import
 * @access  Admin
 */
exports.importQuranData = async (req, res) => {
  try {
    const { type = 'all' } = req.body; // 'surahs', 'ayahs', 'tafsir', 'all'

    const stats = {
      surahs: 0,
      ayahs: 0,
      tafsir: 0
    };

    // مسار ملفات JSON
    const dataDir = path.join(__dirname, '../../../data');

    // استيراد السور
    if (type === 'surahs' || type === 'all') {
      const surahsPath = path.join(dataDir, 'surahs.json');
      if (fs.existsSync(surahsPath)) {
        const surahs = JSON.parse(fs.readFileSync(surahsPath, 'utf8'));
        for (const surah of surahs) {
          await QuranSurah.findOneAndUpdate(
            { number: surah.number },
            surah,
            { upsert: true }
          );
          stats.surahs++;
        }
      }
    }

    // استيراد الآيات
    if (type === 'ayahs' || type === 'all') {
      const ayahsPath = path.join(dataDir, 'ayahs.json');
      if (fs.existsSync(ayahsPath)) {
        const ayahs = JSON.parse(fs.readFileSync(ayahsPath, 'utf8'));
        for (const ayah of ayahs) {
          await QuranAyah.findOneAndUpdate(
            { ayahKey: ayah.ayahKey || `${ayah.surahNumber}:${ayah.ayahNumber}` },
            ayah,
            { upsert: true }
          );
          stats.ayahs++;
        }
      }
    }

    // استيراد التفسير
    if (type === 'tafsir' || type === 'all') {
      const tafsirPath = path.join(dataDir, 'tafsir_ibn_kathir.json');
      if (fs.existsSync(tafsirPath)) {
        const tafsirs = JSON.parse(fs.readFileSync(tafsirPath, 'utf8'));
        for (const tafsir of tafsirs) {
          await TafsirIbnKathir.findOneAndUpdate(
            { ayahKey: tafsir.ayahKey },
            tafsir,
            { upsert: true }
          );
          stats.tafsir++;
        }
      }
    }

    res.json({
      success: true,
      message: 'تم استيراد البيانات بنجاح',
      stats
    });
  } catch (error) {
    console.error('Error importing data:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في استيراد البيانات',
      error: error.message
    });
  }
};

/**
 * @desc    Get import statistics
 * @route   GET /api/quran/stats
 * @access  Public
 */
exports.getImportStats = async (req, res) => {
  try {
    const [surahCount, ayahCount, tafsirCount] = await Promise.all([
      QuranSurah.countDocuments(),
      QuranAyah.countDocuments(),
      TafsirIbnKathir.countDocuments()
    ]);

    // التحقق من وجود embeddings
    const ayahsWithEmbeddings = await QuranAyah.countDocuments({ 
      embedding: { $exists: true, $ne: null } 
    });

    const tafsirWithEmbeddings = await TafsirIbnKathir.countDocuments({ 
      embedding: { $exists: true, $ne: null } 
    });

    res.json({
      success: true,
      data: {
        surahs: surahCount,
        ayahs: ayahCount,
        tafsir: tafsirCount,
        embeddings: {
          ayahs: ayahsWithEmbeddings,
          tafsir: tafsirWithEmbeddings,
          ayahsPercentage: ayahCount > 0 ? Math.round((ayahsWithEmbeddings / ayahCount) * 100) : 0,
          tafsirPercentage: tafsirCount > 0 ? Math.round((tafsirWithEmbeddings / tafsirCount) * 100) : 0
        },
        isComplete: surahCount === 114 && ayahCount >= 6236
      }
    });
  } catch (error) {
    console.error('Error getting stats:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب الإحصائيات'
    });
  }
};
