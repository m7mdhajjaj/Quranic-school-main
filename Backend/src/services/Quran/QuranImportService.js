const fs = require('fs');
const path = require('path');
const { QuranSurah, QuranAyah, QuranJuz } = require('../../schema/AI/Quran');
const TafsirIbnKathir = require('../../schema/AI/Quran/TafsirIbnKathir');

/**
 * 📖 Quran Import Service
 * خدمة استيراد بيانات القرآن من ملفات JSON
 */
class QuranImportService {

  /**
   * استيراد السور
   */
  static async importSurahs(filePath) {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    const surahs = data.surahs || data;
    
    let imported = 0;
    for (const surah of surahs) {
      await QuranSurah.findOneAndUpdate(
        { number: surah.number },
        {
          number: surah.number,
          nameArabic: surah.name || surah.nameArabic,
          nameEnglish: surah.englishName || surah.nameEnglish,
          ayahCount: surah.numberOfAyahs || surah.ayahCount,
          revelationType: surah.revelationType || 'Meccan'
        },
        { upsert: true, new: true }
      );
      imported++;
    }
    
    return { imported, collection: 'quran_surahs' };
  }

  /**
   * استيراد الآيات
   */
  static async importAyahs(filePath) {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    const ayahs = data.ayahs || data;
    
    let imported = 0;
    for (const ayah of ayahs) {
      await QuranAyah.findOneAndUpdate(
        { ayahKey: `${ayah.surahNumber}:${ayah.ayahNumber}` },
        {
          surahNumber: ayah.surahNumber,
          ayahNumber: ayah.ayahNumber,
          ayahKey: `${ayah.surahNumber}:${ayah.ayahNumber}`,
          textArabic: ayah.text || ayah.textArabic,
          tafsirArabic: ayah.tafsir || ayah.tafsirArabic,
          juzNumber: ayah.juz || ayah.juzNumber
        },
        { upsert: true, new: true }
      );
      imported++;
    }
    
    return { imported, collection: 'quran_ayahs' };
  }

  /**
   * استيراد تفسير ابن كثير
   */
  static async importTafsirIbnKathir(filePath) {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    const tafsirs = Array.isArray(data) ? data : data.tafsirs || [data];
    
    let imported = 0;
    for (const tafsir of tafsirs) {
      await TafsirIbnKathir.findOneAndUpdate(
        { ayahKey: tafsir.ayahKey || `${tafsir.surahNumber}:${tafsir.ayahNumber}` },
        {
          surahNumber: tafsir.surahNumber,
          surahName: tafsir.surahName,
          surahType: tafsir.surahType,
          ayahNumber: tafsir.ayahNumber,
          ayahKey: tafsir.ayahKey || `${tafsir.surahNumber}:${tafsir.ayahNumber}`,
          ayahText: tafsir.ayahText,
          tafsir: tafsir.tafsir,
          tafsirShort: tafsir.tafsir?.substring(0, 500),
          keywords: tafsir.keywords || []
        },
        { upsert: true, new: true }
      );
      imported++;
    }
    
    return { imported, collection: 'tafsir_ibn_kathir' };
  }

  /**
   * إحصائيات البيانات المستوردة
   */
  static async getStats() {
    const [surahCount, ayahCount, tafsirCount] = await Promise.all([
      QuranSurah.countDocuments(),
      QuranAyah.countDocuments(),
      TafsirIbnKathir.countDocuments()
    ]);

    return {
      surahs: surahCount,
      ayahs: ayahCount,
      tafsir_ibn_kathir: tafsirCount,
      total: surahCount + ayahCount + tafsirCount
    };
  }
}

module.exports = QuranImportService;
