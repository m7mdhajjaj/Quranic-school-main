const { QuranSurah, QuranAyah } = require('../../schema/AI/Quran');
const EmbeddingsService = require('./EmbeddingsService');

/**
 * 📖 Quran RAG Service
 * خدمة البحث الذكي في القرآن الكريم
 * يدعم البحث النصي + البحث الدلالي بالـ Embeddings
 */
class QuranRAGService {

  // ═══════════════════════════════════════
  // البحث الدلالي (Semantic Search)
  // ═══════════════════════════════════════

  /**
   * البحث الدلالي باستخدام Embeddings
   * يبحث بالمعنى وليس بالكلمات فقط
   */
  static async semanticSearch(query, options = {}) {
    const { limit = 10, threshold = 0.7, surahNumber = null } = options;

    try {
      // توليد embedding للاستعلام
      const queryEmbedding = await EmbeddingsService.generateEmbedding(query);

      // جلب الآيات التي لها embeddings
      const filter = { embedding: { $exists: true } };
      if (surahNumber) filter.surahNumber = surahNumber;

      const ayahs = await QuranAyah.find(filter)
        .select('surahNumber ayahNumber ayahKey textArabic tafsirArabic embedding');

      // حساب التشابه مع كل آية
      const results = ayahs
        .map(ayah => ({
          ...ayah.toObject(),
          similarity: EmbeddingsService.cosineSimilarity(queryEmbedding, ayah.embedding)
        }))
        .filter(r => r.similarity >= threshold)
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, limit)
        .map(r => {
          delete r.embedding; // لا نرجع الـ embedding في النتيجة
          return r;
        });

      return results;
    } catch (error) {
      console.error('Semantic search error:', error.message);
      // Fallback to text search
      return this.search(query, options);
    }
  }

  // ═══════════════════════════════════════
  // البحث الهجين (Hybrid Search)
  // ═══════════════════════════════════════

  /**
   * بحث هجين: يجمع بين البحث النصي والدلالي
   * للحصول على أفضل النتائج
   */
  static async hybridSearch(query, options = {}) {
    const { limit = 10 } = options;

    // تشغيل كلا البحثين بالتوازي
    const [textResults, semanticResults] = await Promise.all([
      this.search(query, { ...options, limit: limit * 2 }),
      this.semanticSearch(query, { ...options, limit: limit * 2 }).catch(() => [])
    ]);

    // دمج النتائج مع إزالة التكرار
    const seen = new Set();
    const merged = [];

    // أولوية للنتائج الدلالية
    for (const result of semanticResults) {
      const key = `${result.surahNumber}:${result.ayahNumber}`;
      if (!seen.has(key)) {
        seen.add(key);
        merged.push({ ...result, source: 'semantic' });
      }
    }

    // إضافة نتائج البحث النصي
    for (const result of textResults) {
      const key = `${result.surahNumber}:${result.ayahNumber}`;
      if (!seen.has(key)) {
        seen.add(key);
        merged.push({ ...result, source: 'text' });
      }
    }

    return merged.slice(0, limit);
  }

  // ═══════════════════════════════════════
  // البحث النصي في القرآن
  // ═══════════════════════════════════════

  static async search(query, options = {}) {
    const { limit = 10, surahNumber = null, juzNumber = null } = options;

    try {
      // البحث بالنص
      const filter = { $text: { $search: query } };
      if (surahNumber) filter.surahNumber = surahNumber;
      if (juzNumber) filter.juzNumber = juzNumber;

      const results = await QuranAyah.find(filter, { score: { $meta: 'textScore' } })
        .sort({ score: { $meta: 'textScore' } })
        .limit(limit)
        .select('surahNumber ayahNumber ayahKey textArabic tafsirArabic');

      // إذا لم يجد نتائج، حاول البحث بالـ regex
      if (results.length === 0) {
        return this.searchByRegex(query, { limit, surahNumber, juzNumber });
      }

      return results;
    } catch (error) {
      console.error('Search error:', error);
      // fallback to regex search
      return this.searchByRegex(query, { limit, surahNumber, juzNumber });
    }
  }

  // ═══════════════════════════════════════
  // البحث بالـ Regex
  // ═══════════════════════════════════════

  static async searchByRegex(query, options = {}) {
    const { limit = 10, surahNumber = null, juzNumber = null } = options;

    const filter = {
      $or: [
        { textArabic: { $regex: query, $options: 'i' } },
        { textSimplified: { $regex: query, $options: 'i' } },
        { tafsirArabic: { $regex: query, $options: 'i' } }
      ]
    };

    if (surahNumber) filter.surahNumber = surahNumber;
    if (juzNumber) filter.juzNumber = juzNumber;

    return QuranAyah.find(filter)
      .limit(limit)
      .select('surahNumber ayahNumber ayahKey textArabic tafsirArabic');
  }

  // ═══════════════════════════════════════
  // الحصول على آية مع سياقها
  // ═══════════════════════════════════════

  static async getAyahWithContext(surahNumber, ayahNumber, contextSize = 2) {
    const surah = await QuranSurah.findOne({ number: surahNumber });
    if (!surah) return null;

    const startAyah = Math.max(1, ayahNumber - contextSize);
    const endAyah = Math.min(surah.ayahCount || 286, ayahNumber + contextSize);

    const ayahs = await QuranAyah.find({
      surahNumber,
      ayahNumber: { $gte: startAyah, $lte: endAyah }
    }).sort({ ayahNumber: 1 });

    return {
      surah: {
        number: surah.number,
        name: surah.nameArabic,
        nameEn: surah.nameEnglish
      },
      context: ayahs.map(a => ({
        number: a.ayahNumber,
        text: a.textArabic,
        translation: a.tafsirArabic,
        isTarget: a.ayahNumber === ayahNumber
      }))
    };
  }

  // ═══════════════════════════════════════
  // الحصول على آية محددة
  // ═══════════════════════════════════════

  static async getAyah(surahNumber, ayahNumber) {
    return QuranAyah.findOne({ surahNumber, ayahNumber });
  }

  // ═══════════════════════════════════════
  // الحصول على معلومات السورة
  // ═══════════════════════════════════════

  static async getSurahInfo(surahNumber) {
    return QuranSurah.findOne({ number: surahNumber });
  }

  // ═══════════════════════════════════════
  // الحصول على جميع السور
  // ═══════════════════════════════════════

  static async getAllSurahs() {
    return QuranSurah.find().sort({ number: 1 });
  }

  // ═══════════════════════════════════════
  // الحصول على آيات السورة
  // ═══════════════════════════════════════

  static async getSurahAyahs(surahNumber) {
    return QuranAyah.find({ surahNumber }).sort({ ayahNumber: 1 });
  }

  // ═══════════════════════════════════════
  // البحث عن كلمة محددة
  // ═══════════════════════════════════════

  static async searchWord(word, limit = 50) {
    const escapedWord = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    
    return QuranAyah.find({
      textArabic: { $regex: escapedWord, $options: 'i' }
    })
    .limit(limit)
    .select('surahNumber ayahNumber textArabic');
  }

  // ═══════════════════════════════════════
  // الحصول على آيات مشابهة
  // ═══════════════════════════════════════

  static async getSimilarAyahs(surahNumber, ayahNumber, limit = 5) {
    const ayah = await this.getAyah(surahNumber, ayahNumber);
    if (!ayah) return [];

    // إذا الآية لها embedding، استخدم البحث الدلالي
    if (ayah.embedding) {
      try {
        const filter = { 
          embedding: { $exists: true },
          $or: [
            { surahNumber: { $ne: surahNumber } },
            { ayahNumber: { $ne: ayahNumber } }
          ]
        };

        const ayahs = await QuranAyah.find(filter)
          .select('surahNumber ayahNumber ayahKey textArabic tafsirArabic embedding');

        const results = ayahs
          .map(a => ({
            ...a.toObject(),
            similarity: EmbeddingsService.cosineSimilarity(ayah.embedding, a.embedding)
          }))
          .sort((a, b) => b.similarity - a.similarity)
          .slice(0, limit)
          .map(r => {
            delete r.embedding;
            return r;
          });

        return results;
      } catch (error) {
        console.error('Semantic similar search error:', error.message);
      }
    }

    // Fallback: استخراج كلمات مهمة من الآية
    const words = ayah.textArabic.split(/\s+/).filter(w => w.length > 3).slice(0, 3);
    
    if (words.length === 0) return [];

    const query = words.join(' ');
    
    const results = await this.search(query, { limit: limit + 1 });
    
    // استبعاد الآية الأصلية
    return results.filter(r => 
      !(r.surahNumber === surahNumber && r.ayahNumber === ayahNumber)
    ).slice(0, limit);
  }

  // ═══════════════════════════════════════
  // بناء سياق RAG للـ AI (محسّن)
  // ═══════════════════════════════════════

  /**
   * بناء سياق RAG ذكي للـ AI Chatbot
   * يستخدم البحث الهجين للحصول على أفضل النتائج
   */
  static async buildRAGContext(query, maxResults = 5) {
    // استخدام البحث الهجين للحصول على أفضل النتائج
    const results = await this.hybridSearch(query, { limit: maxResults });

    if (results.length === 0) {
      return {
        found: false,
        context: '',
        source: 'quran_local',
        results: []
      };
    }

    let context = '📖 نتائج البحث في القرآن الكريم:\n\n';

    for (const ayah of results) {
      const surah = await QuranSurah.findOne({ number: ayah.surahNumber });
      context += `═══════════════════════════════════════\n`;
      context += `📌 سورة ${surah?.nameArabic || ayah.surahNumber} - الآية ${ayah.ayahNumber}`;
      if (ayah.similarity) {
        context += ` (تطابق: ${Math.round(ayah.similarity * 100)}%)`;
      }
      context += `\n═══════════════════════════════════════\n`;
      context += `📜 ${ayah.textArabic}\n`;
      if (ayah.tafsirArabic) {
        context += `📝 التفسير: ${ayah.tafsirArabic.substring(0, 500)}...\n`;
      }
      context += '\n';
    }

    return {
      found: true,
      context,
      source: 'quran_hybrid_search',
      searchType: results[0]?.source || 'mixed',
      results: results.map(r => ({
        surahNumber: r.surahNumber,
        ayahNumber: r.ayahNumber,
        ayahKey: r.ayahKey,
        text: r.textArabic,
        similarity: r.similarity,
        source: r.source
      }))
    };
  }

  // ═══════════════════════════════════════
  // بناء سياق RAG دلالي فقط
  // ═══════════════════════════════════════

  static async buildSemanticRAGContext(query, maxResults = 5) {
    const results = await this.semanticSearch(query, { limit: maxResults });

    if (results.length === 0) {
      return this.buildRAGContext(query, maxResults); // Fallback
    }

    let context = '📖 نتائج البحث الدلالي في القرآن الكريم:\n\n';

    for (const ayah of results) {
      const surah = await QuranSurah.findOne({ number: ayah.surahNumber });
      context += `═══════════════════════════════════════\n`;
      context += `📌 سورة ${surah?.nameArabic || ayah.surahNumber} - الآية ${ayah.ayahNumber}`;
      context += ` (تطابق دلالي: ${Math.round(ayah.similarity * 100)}%)\n`;
      context += `═══════════════════════════════════════\n`;
      context += `📜 ${ayah.textArabic}\n`;
      if (ayah.tafsirArabic) {
        context += `📝 التفسير: ${ayah.tafsirArabic.substring(0, 500)}...\n`;
      }
      context += '\n';
    }

    return {
      found: true,
      context,
      source: 'quran_semantic_search',
      results: results.map(r => ({
        surahNumber: r.surahNumber,
        ayahNumber: r.ayahNumber,
        ayahKey: r.ayahKey,
        text: r.textArabic,
        similarity: r.similarity
      }))
    };
  }
}

module.exports = QuranRAGService;
