/**
 * 📖 Quran Main Controller
 * يحتوي على جميع عمليات القرآن والتفسير والـ RAG
 */

const QuranRAGService = require('../../../services/Quran/QuranRAGService');
const TafsirRAGService = require('../../../services/Quran/TafsirRAGService');
const QuranImportService = require('../../../services/Quran/QuranImportService');
const EmbeddingsService = require('../../../services/Quran/EmbeddingsService');
const { QuranSurah, QuranAyah } = require('../../../schema/AI/Quran');
const TafsirIbnKathir = require('../../../schema/AI/Quran/TafsirIbnKathir');

// ═══════════════════════════════════════════════════════════════════════════
// Import Routes - استيراد البيانات
// ═══════════════════════════════════════════════════════════════════════════

/**
 * استيراد بيانات القرآن من JSON
 */
exports.importQuranData = async (req, res) => {
  try {
    const { type, filePath } = req.body;

    if (!type || !filePath) {
      return res.status(400).json({
        success: false,
        message: 'يرجى تحديد نوع البيانات ومسار الملف'
      });
    }

    let result;
    switch (type) {
      case 'surahs':
        result = await QuranImportService.importSurahs(filePath);
        break;
      case 'ayahs':
        result = await QuranImportService.importAyahs(filePath);
        break;
      case 'tafsir':
        result = await QuranImportService.importTafsirIbnKathir(filePath);
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'نوع البيانات غير مدعوم'
        });
    }

    res.json({
      success: true,
      message: `تم استيراد ${result.imported} سجل بنجاح`,
      data: result
    });
  } catch (error) {
    console.error('Import error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * إحصائيات البيانات المستوردة
 */
exports.getImportStats = async (req, res) => {
  try {
    const stats = await QuranImportService.getStats();
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// Search Routes - البحث في القرآن
// ═══════════════════════════════════════════════════════════════════════════

/**
 * البحث في القرآن
 */
exports.searchQuran = async (req, res) => {
  try {
    const { query, limit = 10, surah, juz } = req.query;

    const results = await QuranRAGService.search(query, {
      limit: parseInt(limit),
      surahNumber: surah ? parseInt(surah) : null,
      juzNumber: juz ? parseInt(juz) : null
    });

    res.json({
      success: true,
      count: results.length,
      data: results
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * البحث في سورة محددة
 */
exports.searchInSurah = async (req, res) => {
  try {
    const { surahNumber } = req.params;
    const { query, limit = 20 } = req.query;

    const results = await QuranRAGService.search(query, {
      limit: parseInt(limit),
      surahNumber: parseInt(surahNumber)
    });

    res.json({
      success: true,
      count: results.length,
      data: results
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * البحث عن كلمة
 */
exports.searchWord = async (req, res) => {
  try {
    const { word, limit = 50 } = req.query;

    if (!word) {
      return res.status(400).json({
        success: false,
        message: 'يرجى تحديد كلمة للبحث'
      });
    }

    const results = await QuranRAGService.searchByRegex(word, {
      limit: parseInt(limit)
    });

    res.json({
      success: true,
      count: results.length,
      data: results
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * الحصول على آيات مشابهة
 */
exports.getSimilarAyahs = async (req, res) => {
  try {
    const { surah, ayah, limit = 5 } = req.query;

    if (!surah || !ayah) {
      return res.status(400).json({
        success: false,
        message: 'يرجى تحديد السورة والآية'
      });
    }

    // جلب الآية الأصلية
    const targetAyah = await QuranAyah.findOne({
      surahNumber: parseInt(surah),
      ayahNumber: parseInt(ayah)
    });

    if (!targetAyah) {
      return res.status(404).json({
        success: false,
        message: 'الآية غير موجودة'
      });
    }

    // البحث عن آيات مشابهة
    const results = await QuranRAGService.semanticSearch(targetAyah.textArabic, {
      limit: parseInt(limit) + 1
    });

    // استبعاد الآية نفسها
    const filtered = results.filter(
      r => !(r.surahNumber === parseInt(surah) && r.ayahNumber === parseInt(ayah))
    );

    res.json({
      success: true,
      count: filtered.length,
      data: filtered.slice(0, parseInt(limit))
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * الحصول على سياق الآية
 */
exports.getAyahContext = async (req, res) => {
  try {
    const { surah, ayah, size = 2 } = req.query;

    if (!surah || !ayah) {
      return res.status(400).json({
        success: false,
        message: 'يرجى تحديد السورة والآية'
      });
    }

    const context = await QuranRAGService.getAyahWithContext(
      parseInt(surah),
      parseInt(ayah),
      parseInt(size)
    );

    if (!context) {
      return res.status(404).json({
        success: false,
        message: 'السورة غير موجودة'
      });
    }

    res.json({
      success: true,
      data: context
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * بناء سياق RAG للـ AI
 */
exports.buildRAGContext = async (req, res) => {
  try {
    const { query, maxResults = 5 } = req.body;

    const results = await QuranRAGService.search(query, {
      limit: maxResults
    });

    // بناء السياق النصي
    const context = results.map(r => 
      `[${r.ayahKey}] ${r.textArabic}\nالتفسير: ${r.tafsirArabic || 'غير متوفر'}`
    ).join('\n\n');

    res.json({
      success: true,
      data: {
        context,
        sources: results.map(r => ({
          ayahKey: r.ayahKey,
          text: r.textArabic
        }))
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// Tafsir Routes - تفسير ابن كثير
// ═══════════════════════════════════════════════════════════════════════════

/**
 * البحث في التفسير
 */
exports.searchTafsir = async (req, res) => {
  try {
    const { query, limit = 10 } = req.query;

    const results = await TafsirRAGService.search(query, {
      limit: parseInt(limit)
    });

    res.json({
      success: true,
      count: results.length,
      data: results
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * الحصول على تفسير آية
 */
exports.getTafsir = async (req, res) => {
  try {
    const { surahNumber, ayahNumber } = req.params;

    const tafsir = await TafsirRAGService.getTafsir(
      parseInt(surahNumber),
      parseInt(ayahNumber)
    );

    if (!tafsir) {
      return res.status(404).json({
        success: false,
        message: 'التفسير غير موجود لهذه الآية'
      });
    }

    res.json({
      success: true,
      data: tafsir
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * الحصول على تفسير سورة كاملة
 */
exports.getSurahTafsir = async (req, res) => {
  try {
    const { surahNumber } = req.params;

    const tafsirs = await TafsirIbnKathir.find({
      surahNumber: parseInt(surahNumber)
    }).sort({ ayahNumber: 1 });

    res.json({
      success: true,
      count: tafsirs.length,
      data: tafsirs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * البحث في التفسير حسب الموضوع
 */
exports.searchTafsirByTopic = async (req, res) => {
  try {
    const { topic } = req.params;
    const { limit = 20 } = req.query;

    const results = await TafsirIbnKathir.find({
      $or: [
        { keywords: { $regex: topic, $options: 'i' } },
        { tafsir: { $regex: topic, $options: 'i' } }
      ]
    }).limit(parseInt(limit));

    res.json({
      success: true,
      count: results.length,
      data: results
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * بناء سياق RAG للتفسير
 */
exports.buildTafsirRAGContext = async (req, res) => {
  try {
    const { query, maxResults = 5 } = req.body;

    const results = await TafsirRAGService.search(query, {
      limit: maxResults
    });

    const context = results.map(r => 
      `[${r.ayahKey}] ${r.ayahText}\nتفسير ابن كثير: ${r.tafsirShort || r.tafsir}`
    ).join('\n\n');

    res.json({
      success: true,
      data: {
        context,
        sources: results.map(r => ({
          ayahKey: r.ayahKey,
          surahName: r.surahName,
          ayahText: r.ayahText
        }))
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * إحصائيات التفسير
 */
exports.getTafsirStats = async (req, res) => {
  try {
    const count = await TafsirIbnKathir.countDocuments();
    const withEmbeddings = await TafsirIbnKathir.countDocuments({
      embedding: { $exists: true }
    });

    // توزيع حسب السور
    const bySurah = await TafsirIbnKathir.aggregate([
      { $group: { _id: '$surahNumber', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      data: {
        total: count,
        withEmbeddings,
        embeddingsCoverage: count > 0 ? ((withEmbeddings / count) * 100).toFixed(1) + '%' : '0%',
        surahsCount: bySurah.length,
        distribution: bySurah
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * البحث الدلالي في التفسير
 */
exports.semanticSearchTafsir = async (req, res) => {
  try {
    const { query, limit = 10 } = req.query;

    const results = await TafsirRAGService.semanticSearch(query, {
      limit: parseInt(limit)
    });

    res.json({
      success: true,
      count: results.length,
      data: results
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// Embeddings Routes - الـ Embeddings
// ═══════════════════════════════════════════════════════════════════════════

/**
 * إحصائيات الـ Embeddings
 */
exports.getEmbeddingsStats = async (req, res) => {
  try {
    const [ayahsTotal, ayahsWithEmb, tafsirTotal, tafsirWithEmb] = await Promise.all([
      QuranAyah.countDocuments(),
      QuranAyah.countDocuments({ embedding: { $exists: true } }),
      TafsirIbnKathir.countDocuments(),
      TafsirIbnKathir.countDocuments({ embedding: { $exists: true } })
    ]);

    res.json({
      success: true,
      data: {
        ayahs: {
          total: ayahsTotal,
          withEmbeddings: ayahsWithEmb,
          coverage: ayahsTotal > 0 ? ((ayahsWithEmb / ayahsTotal) * 100).toFixed(1) + '%' : '0%'
        },
        tafsir: {
          total: tafsirTotal,
          withEmbeddings: tafsirWithEmb,
          coverage: tafsirTotal > 0 ? ((tafsirWithEmb / tafsirTotal) * 100).toFixed(1) + '%' : '0%'
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * توليد embeddings للآيات
 */
exports.generateAyahEmbeddings = async (req, res) => {
  try {
    const { startFrom = 0, limit = 100, forceRegenerate = false } = req.body;

    const filter = forceRegenerate ? {} : { embedding: { $exists: false } };
    const ayahs = await QuranAyah.find(filter)
      .skip(startFrom)
      .limit(limit)
      .select('_id ayahKey textArabic');

    let generated = 0;
    for (const ayah of ayahs) {
      try {
        const embedding = await EmbeddingsService.generateEmbedding(ayah.textArabic);
        await QuranAyah.updateOne({ _id: ayah._id }, { embedding });
        generated++;
      } catch (err) {
        console.error(`Embedding error for ${ayah.ayahKey}:`, err.message);
      }
    }

    res.json({
      success: true,
      message: `تم توليد embeddings لـ ${generated} آية`,
      data: { generated, total: ayahs.length }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * توليد embeddings للتفسير
 */
exports.generateTafsirEmbeddings = async (req, res) => {
  try {
    const { startFrom = 0, limit = 100, forceRegenerate = false } = req.body;

    const filter = forceRegenerate ? {} : { embedding: { $exists: false } };
    const tafsirs = await TafsirIbnKathir.find(filter)
      .skip(startFrom)
      .limit(limit)
      .select('_id ayahKey tafsirShort tafsir');

    let generated = 0;
    for (const tafsir of tafsirs) {
      try {
        const text = tafsir.tafsirShort || tafsir.tafsir?.substring(0, 1000);
        if (text) {
          const embedding = await EmbeddingsService.generateEmbedding(text);
          await TafsirIbnKathir.updateOne({ _id: tafsir._id }, { embedding });
          generated++;
        }
      } catch (err) {
        console.error(`Embedding error for ${tafsir.ayahKey}:`, err.message);
      }
    }

    res.json({
      success: true,
      message: `تم توليد embeddings لـ ${generated} تفسير`,
      data: { generated, total: tafsirs.length }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * البحث الدلالي في القرآن
 */
exports.semanticSearchQuran = async (req, res) => {
  try {
    const { query, limit = 10 } = req.query;

    const results = await QuranRAGService.semanticSearch(query, {
      limit: parseInt(limit)
    });

    res.json({
      success: true,
      count: results.length,
      data: results
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * البحث الهجين
 */
exports.hybridSearchQuran = async (req, res) => {
  try {
    const { query, limit = 10 } = req.query;

    const results = await QuranRAGService.hybridSearch(query, {
      limit: parseInt(limit)
    });

    res.json({
      success: true,
      count: results.length,
      data: results
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * بناء سياق RAG دلالي
 */
exports.buildSemanticRAGContext = async (req, res) => {
  try {
    const { query, maxResults = 5 } = req.body;

    const results = await QuranRAGService.hybridSearch(query, {
      limit: maxResults
    });

    const context = results.map(r => 
      `[${r.ayahKey}] ${r.textArabic} (تشابه: ${r.similarity ? (r.similarity * 100).toFixed(0) + '%' : 'N/A'})`
    ).join('\n\n');

    res.json({
      success: true,
      data: {
        context,
        sources: results.map(r => ({
          ayahKey: r.ayahKey,
          text: r.textArabic,
          similarity: r.similarity,
          source: r.source
        }))
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
