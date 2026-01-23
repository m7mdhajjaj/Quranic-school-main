const fs = require('fs');
const path = require('path');
const { QuranSurah, QuranAyah, TafsirIbnKathir } = require('../../schema/AI/Quran');

// ═══════════════════════════════════════════════════════════════════════════
// 🔒 Security: Safe File Access
// ═══════════════════════════════════════════════════════════════════════════

// مجلد البيانات الآمن - لا يمكن الوصول لملفات خارجه
const SAFE_DATA_DIR = path.resolve(__dirname, '../../data/quran');

/**
 * تطبيع النص العربي (إزالة التشكيل وتوحيد الحروف)
 */
function normalizeArabicText(text) {
  if (!text) return '';
  return text
    .replace(/[\u064B-\u065F\u0670]/g, '') // إزالة التشكيل
    .replace(/[أإآ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ي');
}

/**
 * 🔒 التحقق من مسار الملف (منع Path Traversal)
 * @param {string} userPath - المسار المدخل من المستخدم
 * @returns {string} - المسار الآمن
 * @throws {Error} - إذا كان المسار غير آمن
 */
function getSafeFilePath(userPath) {
  if (!userPath || typeof userPath !== 'string') {
    throw new Error('مسار الملف مطلوب');
  }

  // السماح فقط باسم الملف، ليس مسار كامل (منع ../ و /)
  const fileName = path.basename(userPath);
  
  // منع الأسماء الفارغة أو التي تبدأ بنقطة
  if (!fileName || fileName.startsWith('.')) {
    throw new Error('اسم الملف غير صالح');
  }
  
  const resolvedPath = path.join(SAFE_DATA_DIR, fileName);

  // تأكد من البقاء داخل المجلد الآمن (منع path traversal)
  const normalizedResolved = path.normalize(resolvedPath);
  if (!normalizedResolved.startsWith(SAFE_DATA_DIR)) {
    throw new Error('مسار الملف غير مسموح');
  }

  // تأكد من أن الامتداد .json فقط
  const ext = path.extname(resolvedPath).toLowerCase();
  if (ext !== '.json') {
    throw new Error('نوع الملف غير مدعوم - يجب أن يكون JSON');
  }

  // تأكد من وجود الملف
  if (!fs.existsSync(resolvedPath)) {
    throw new Error(`الملف غير موجود: ${fileName}`);
  }

  return resolvedPath;
}

/**
 * 📖 Quran Import Service
 * خدمة استيراد بيانات القرآن من ملفات JSON
 * 🔒 مع حماية من Path Traversal
 */
class QuranImportService {

  /**
   * استيراد السور
   */
  static async importSurahs(filePath) {
    // 🔒 استخدام المسار الآمن
    const safePath = getSafeFilePath(filePath);
    const data = JSON.parse(fs.readFileSync(safePath, 'utf-8'));
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
    // 🔒 استخدام المسار الآمن
    const safePath = getSafeFilePath(filePath);
    const data = JSON.parse(fs.readFileSync(safePath, 'utf-8'));
    const ayahs = data.ayahs || data;
    
    let imported = 0;
    for (const ayah of ayahs) {
      const textArabic = ayah.text || ayah.textArabic;
      
      await QuranAyah.findOneAndUpdate(
        { ayahKey: `${ayah.surahNumber}:${ayah.ayahNumber}` },
        {
          surahNumber: ayah.surahNumber,
          ayahNumber: ayah.ayahNumber,
          ayahKey: `${ayah.surahNumber}:${ayah.ayahNumber}`,
          textArabic: textArabic,
          // ✅ إضافة textSimplified للبحث
          textSimplified: normalizeArabicText(textArabic),
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
    // 🔒 استخدام المسار الآمن
    const safePath = getSafeFilePath(filePath);
    const data = JSON.parse(fs.readFileSync(safePath, 'utf-8'));
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
