const { TafsirIbnKathir } = require('../../schema/AI/Quran');
const EmbeddingsService = require('./EmbeddingsService');
const { escapeRegex, sanitizeSearchQuery } = require('../../utils/sanitization');

/**
 * 📚 Tafsir RAG Service
 * خدمة البحث الذكي في تفسير ابن كثير
 * يدعم البحث النصي + البحث الدلالي بالـ Embeddings
 */
class TafsirRAGService {

  // ═══════════════════════════════════════
  // البحث الدلالي (Semantic Search)
  // ═══════════════════════════════════════

  /**
   * البحث الدلالي في التفسير باستخدام Embeddings
   * 🔥 محسّن: يستخدم aggregation بدلاً من جلب كل السجلات
   */
  static async semanticSearch(query, options = {}) {
    const { limit = 10, threshold = 0.65, surahNumber = null } = options;

    try {
      // توليد embedding للاستعلام
      const queryEmbedding = await EmbeddingsService.generateEmbedding(query);

      // 🔥 تحسين الأداء: استخدام MongoDB Aggregation
      const matchFilter = { embedding: { $exists: true } };
      if (surahNumber) matchFilter.surahNumber = surahNumber;

      // ✅ استخدام aggregation للحساب على السيرفر
      const results = await TafsirIbnKathir.aggregate([
        { $match: matchFilter },
        { $project: {
          surahNumber: 1,
          surahName: 1,
          ayahNumber: 1,
          ayahKey: 1,
          ayahText: 1,
          tafsirShort: 1,
          embedding: 1
        }},
        // 🔥 حساب dot product (تقريب لـ cosine similarity للـ normalized vectors)
        { $addFields: {
          similarity: {
            $reduce: {
              input: { $range: [0, { $size: { $ifNull: ['$embedding', []] } }] },
              initialValue: 0,
              in: {
                $add: [
                  '$$value',
                  { $multiply: [
                    { $arrayElemAt: ['$embedding', '$$this'] },
                    { $arrayElemAt: [queryEmbedding, '$$this'] }
                  ]}
                ]
              }
            }
          }
        }},
        { $match: { similarity: { $gte: threshold } } },
        { $sort: { similarity: -1 } },
        { $limit: limit },
        { $project: { embedding: 0 } }
      ]);

      return results;
    } catch (error) {
      console.error('Tafsir semantic search error:', error.message);
      return this.search(query, options);
    }
  }

  // ═══════════════════════════════════════
  // البحث الهجين
  // ═══════════════════════════════════════

  /**
   * بحث هجين في التفسير
   */
  static async hybridSearch(query, options = {}) {
    const { limit = 10 } = options;

    const [textResults, semanticResults] = await Promise.all([
      this.search(query, { ...options, limit: limit * 2 }),
      this.semanticSearch(query, { ...options, limit: limit * 2 }).catch(() => [])
    ]);

    const seen = new Set();
    const merged = [];

    for (const result of semanticResults) {
      const key = result.ayahKey;
      if (!seen.has(key)) {
        seen.add(key);
        merged.push({ ...result, source: 'semantic' });
      }
    }

    for (const result of textResults) {
      const key = result.ayahKey;
      if (!seen.has(key)) {
        seen.add(key);
        merged.push({ ...result, source: 'text' });
      }
    }

    return merged.slice(0, limit);
  }

  // ═══════════════════════════════════════
  // البحث في التفسير
  // ═══════════════════════════════════════

  /**
   * البحث في تفسير ابن كثير
   */
  static async search(query, options = {}) {
    const { limit = 10, surahNumber = null } = options;

    try {
      // البحث النصي
      const filter = { $text: { $search: query } };
      if (surahNumber) filter.surahNumber = surahNumber;

      const results = await TafsirIbnKathir.find(filter, { score: { $meta: 'textScore' } })
        .sort({ score: { $meta: 'textScore' } })
        .limit(limit)
        .select('surahNumber surahName ayahNumber ayahKey ayahText tafsirShort');

      if (results.length === 0) {
        return this.searchByRegex(query, options);
      }

      return results;
    } catch (error) {
      return this.searchByRegex(query, options);
    }
  }

  /**
   * البحث بالـ Regex (مع حماية ReDoS)
   */
  static async searchByRegex(query, options = {}) {
    const { limit = 10, surahNumber = null } = options;

    // 🔒 تنظيف المدخل (منع ReDoS)
    const safeQuery = sanitizeSearchQuery(query);
    if (!safeQuery || safeQuery.length < 2) {
      return [];
    }

    const filter = {
      $or: [
        { tafsir: { $regex: safeQuery, $options: 'i' } },
        { ayahText: { $regex: safeQuery, $options: 'i' } },
        { keywords: { $regex: safeQuery, $options: 'i' } }
      ]
    };

    if (surahNumber) filter.surahNumber = parseInt(surahNumber);

    return TafsirIbnKathir.find(filter)
      .limit(Math.min(parseInt(limit), 50)) // 🔒 حد أقصى
      .select('surahNumber surahName ayahNumber ayahKey ayahText tafsirShort')
      .lean();
  }

  // ═══════════════════════════════════════
  // الحصول على تفسير آية
  // ═══════════════════════════════════════

  /**
   * تفسير آية محددة
   */
  static async getTafsir(surahNumber, ayahNumber) {
    return TafsirIbnKathir.findOne({ surahNumber, ayahNumber });
  }

  /**
   * تفسير بالمفتاح
   */
  static async getTafsirByKey(ayahKey) {
    return TafsirIbnKathir.findOne({ ayahKey });
  }

  /**
   * تفسير سورة كاملة
   */
  static async getSurahTafsir(surahNumber) {
    return TafsirIbnKathir.find({ surahNumber })
      .sort({ ayahNumber: 1 })
      .select('ayahNumber ayahText tafsir');
  }

  // ═══════════════════════════════════════
  // بناء سياق RAG للـ AI (محسّن)
  // ═══════════════════════════════════════

  /**
   * بناء سياق من تفسير ابن كثير للـ AI
   * يستخدم البحث الهجين للحصول على أفضل النتائج
   */
  static async buildRAGContext(query, maxResults = 3) {
    // استخدام البحث الهجين
    const results = await this.hybridSearch(query, { limit: maxResults });

    if (results.length === 0) {
      return {
        found: false,
        context: '',
        source: 'tafsir_ibn_kathir',
        results: []
      };
    }

    // ✅ إصلاح N+1 Query - جلب كل التفاسير دفعة واحدة
    const ids = results.map(r => r._id);
    const fullTafsirs = await TafsirIbnKathir.find({ _id: { $in: ids } })
      .select('_id tafsir')
      .lean();
    
    // تحويل إلى Map للوصول السريع O(1)
    const tafsirMap = new Map(fullTafsirs.map(t => [t._id.toString(), t.tafsir]));

    let context = '📚 تفسير ابن كثير:\n\n';

    for (const item of results) {
      // جلب التفسير من الـ Map بدلاً من query جديد
      const fullTafsir = tafsirMap.get(item._id.toString());
      
      context += `═══════════════════════════════════════\n`;
      context += `📌 سورة ${item.surahName} - الآية ${item.ayahNumber}`;
      if (item.similarity) {
        context += ` (تطابق: ${Math.round(item.similarity * 100)}%)`;
      }
      context += `\n═══════════════════════════════════════\n`;
      context += `📜 الآية: ${item.ayahText}\n\n`;
      context += `📝 تفسير ابن كثير:\n${fullTafsir?.substring(0, 1500) || item.tafsirShort}`;
      if (fullTafsir?.length > 1500) context += '...';
      context += '\n\n';
    }

    return {
      found: true,
      context,
      source: 'tafsir_ibn_kathir',
      results: results.map(r => ({
        surahNumber: r.surahNumber,
        surahName: r.surahName,
        ayahNumber: r.ayahNumber,
        ayahKey: r.ayahKey,
        ayahText: r.ayahText
      }))
    };
  }

  // ═══════════════════════════════════════
  // البحث بالموضوع
  // ═══════════════════════════════════════

  /**
   * البحث عن موضوع معين في التفسير
   */
  static async searchByTopic(topic, limit = 10) {
    // كلمات مفتاحية للمواضيع الشائعة
    const topicKeywords = {
      'الصلاة': ['صلاة', 'صلوا', 'ركوع', 'سجود', 'قيام'],
      'الزكاة': ['زكاة', 'صدقة', 'إنفاق', 'مال'],
      'الصوم': ['صيام', 'صوم', 'رمضان', 'إفطار'],
      'الحج': ['حج', 'عمرة', 'كعبة', 'مناسك', 'طواف'],
      'التوحيد': ['توحيد', 'إله', 'عبادة', 'شرك'],
      'الجنة': ['جنة', 'نعيم', 'خلود', 'ثواب'],
      'النار': ['نار', 'جهنم', 'عذاب', 'عقاب'],
      'الأخلاق': ['صدق', 'أمانة', 'صبر', 'شكر', 'تواضع'],
      'القصص': ['قصة', 'نبي', 'رسول', 'قوم']
    };

    // البحث بالكلمات المفتاحية المرتبطة
    const keywords = topicKeywords[topic] || [topic];
    const query = keywords.join(' ');

    return this.search(query, { limit });
  }

  // ═══════════════════════════════════════
  // إحصائيات التفسير
  // ═══════════════════════════════════════

  /**
   * إحصائيات تفسير ابن كثير
   */
  static async getStats() {
    const total = await TafsirIbnKathir.countDocuments();
    
    const surahStats = await TafsirIbnKathir.aggregate([
      { $group: { _id: '$surahNumber', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    return {
      total,
      surahCount: surahStats.length,
      surahStats
    };
  }
}

module.exports = TafsirRAGService;
