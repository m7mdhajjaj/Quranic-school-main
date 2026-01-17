const OpenAI = require('openai');
const { QuranAyah } = require('../../schema/AI/Quran');
const TafsirIbnKathir = require('../../schema/AI/Quran/TafsirIbnKathir');

/**
 * 🧠 Embeddings Service
 * خدمة تحويل النصوص إلى Vectors للبحث الدلالي
 * 
 * يستخدم OpenAI text-embedding-3-small للحصول على embeddings عالية الجودة
 * مع دعم اللغة العربية
 */
class EmbeddingsService {
  
  static openai = null;
  static MODEL = 'text-embedding-3-small'; // 1536 dimensions, cheaper & fast
  static BATCH_SIZE = 100; // OpenAI limit per request

  /**
   * تهيئة OpenAI Client
   */
  static getClient() {
    if (!this.openai) {
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) {
        throw new Error('OPENAI_API_KEY is required for embeddings');
      }
      this.openai = new OpenAI({ apiKey });
    }
    return this.openai;
  }

  // ═══════════════════════════════════════
  // توليد Embedding لنص واحد
  // ═══════════════════════════════════════

  /**
   * توليد embedding لنص واحد
   * @param {string} text - النص المراد تحويله
   * @returns {number[]} - vector بحجم 1536
   */
  static async generateEmbedding(text) {
    const openai = this.getClient();
    
    // تنظيف النص
    const cleanText = text
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 8000); // OpenAI limit

    const response = await openai.embeddings.create({
      model: this.MODEL,
      input: cleanText,
      encoding_format: 'float'
    });

    return response.data[0].embedding;
  }

  // ═══════════════════════════════════════
  // توليد Embeddings لمجموعة نصوص
  // ═══════════════════════════════════════

  /**
   * توليد embeddings لمجموعة نصوص دفعة واحدة
   * @param {string[]} texts - مصفوفة النصوص
   * @returns {number[][]} - مصفوفة vectors
   */
  static async generateBatchEmbeddings(texts) {
    const openai = this.getClient();
    
    // تنظيف النصوص
    const cleanTexts = texts.map(t => 
      t.replace(/\s+/g, ' ').trim().substring(0, 8000)
    );

    const response = await openai.embeddings.create({
      model: this.MODEL,
      input: cleanTexts,
      encoding_format: 'float'
    });

    return response.data.map(d => d.embedding);
  }

  // ═══════════════════════════════════════
  // حساب التشابه بين Vectors
  // ═══════════════════════════════════════

  /**
   * حساب Cosine Similarity بين vectorين
   */
  static cosineSimilarity(vecA, vecB) {
    if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
    
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }
    
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  // ═══════════════════════════════════════
  // توليد Embeddings لجميع الآيات
  // ═══════════════════════════════════════

  /**
   * توليد وحفظ embeddings لجميع آيات القرآن
   * ⚠️ هذه العملية تستغرق وقتاً وتكلفة API
   */
  static async generateAyahEmbeddings(options = {}) {
    const { startFrom = 0, limit = null, forceRegenerate = false } = options;
    
    // جلب الآيات التي تحتاج embeddings
    const query = forceRegenerate ? {} : { embedding: { $exists: false } };
    
    let ayahsQuery = QuranAyah.find(query)
      .sort({ surahNumber: 1, ayahNumber: 1 })
      .skip(startFrom);
    
    if (limit) ayahsQuery = ayahsQuery.limit(limit);
    
    const ayahs = await ayahsQuery;
    
    if (ayahs.length === 0) {
      return { processed: 0, message: 'All ayahs already have embeddings' };
    }

    console.log(`🧠 Generating embeddings for ${ayahs.length} ayahs...`);
    
    let processed = 0;
    let errors = [];

    // معالجة على دفعات
    for (let i = 0; i < ayahs.length; i += this.BATCH_SIZE) {
      const batch = ayahs.slice(i, i + this.BATCH_SIZE);
      
      try {
        // تحضير النصوص (الآية + التفسير للحصول على سياق أفضل)
        const texts = batch.map(a => 
          `${a.textArabic || ''} ${a.tafsirArabic?.substring(0, 500) || ''}`
        );
        
        const embeddings = await this.generateBatchEmbeddings(texts);
        
        // حفظ الـ embeddings
        for (let j = 0; j < batch.length; j++) {
          await QuranAyah.findByIdAndUpdate(batch[j]._id, {
            embedding: embeddings[j]
          });
          processed++;
        }
        
        console.log(`✅ Processed ${processed}/${ayahs.length} ayahs`);
        
        // تأخير لتجنب rate limiting
        if (i + this.BATCH_SIZE < ayahs.length) {
          await new Promise(r => setTimeout(r, 500));
        }
        
      } catch (error) {
        console.error(`❌ Batch error at index ${i}:`, error.message);
        errors.push({ index: i, error: error.message });
      }
    }

    return {
      processed,
      total: ayahs.length,
      errors: errors.length,
      errorDetails: errors
    };
  }

  // ═══════════════════════════════════════
  // توليد Embeddings للتفسير
  // ═══════════════════════════════════════

  /**
   * توليد وحفظ embeddings لتفسير ابن كثير
   */
  static async generateTafsirEmbeddings(options = {}) {
    const { startFrom = 0, limit = null, forceRegenerate = false } = options;
    
    const query = forceRegenerate ? {} : { embedding: { $exists: false } };
    
    let tafsirQuery = TafsirIbnKathir.find(query)
      .sort({ surahNumber: 1, ayahNumber: 1 })
      .skip(startFrom);
    
    if (limit) tafsirQuery = tafsirQuery.limit(limit);
    
    const tafsirs = await tafsirQuery;
    
    if (tafsirs.length === 0) {
      return { processed: 0, message: 'All tafsirs already have embeddings' };
    }

    console.log(`🧠 Generating embeddings for ${tafsirs.length} tafsirs...`);
    
    let processed = 0;
    let errors = [];

    for (let i = 0; i < tafsirs.length; i += this.BATCH_SIZE) {
      const batch = tafsirs.slice(i, i + this.BATCH_SIZE);
      
      try {
        // تحضير النصوص (الآية + التفسير)
        const texts = batch.map(t => 
          `سورة ${t.surahName} آية ${t.ayahNumber}: ${t.ayahText || ''} - التفسير: ${t.tafsir?.substring(0, 1000) || ''}`
        );
        
        const embeddings = await this.generateBatchEmbeddings(texts);
        
        for (let j = 0; j < batch.length; j++) {
          await TafsirIbnKathir.findByIdAndUpdate(batch[j]._id, {
            embedding: embeddings[j]
          });
          processed++;
        }
        
        console.log(`✅ Processed ${processed}/${tafsirs.length} tafsirs`);
        
        if (i + this.BATCH_SIZE < tafsirs.length) {
          await new Promise(r => setTimeout(r, 500));
        }
        
      } catch (error) {
        console.error(`❌ Batch error at index ${i}:`, error.message);
        errors.push({ index: i, error: error.message });
      }
    }

    return {
      processed,
      total: tafsirs.length,
      errors: errors.length,
      errorDetails: errors
    };
  }

  // ═══════════════════════════════════════
  // إحصائيات الـ Embeddings
  // ═══════════════════════════════════════

  static async getStats() {
    const [
      totalAyahs,
      ayahsWithEmbedding,
      totalTafsir,
      tafsirWithEmbedding
    ] = await Promise.all([
      QuranAyah.countDocuments(),
      QuranAyah.countDocuments({ embedding: { $exists: true } }),
      TafsirIbnKathir.countDocuments(),
      TafsirIbnKathir.countDocuments({ embedding: { $exists: true } })
    ]);

    return {
      ayahs: {
        total: totalAyahs,
        withEmbedding: ayahsWithEmbedding,
        percentage: Math.round((ayahsWithEmbedding / totalAyahs) * 100)
      },
      tafsir: {
        total: totalTafsir,
        withEmbedding: tafsirWithEmbedding,
        percentage: Math.round((tafsirWithEmbedding / totalTafsir) * 100)
      }
    };
  }
}

module.exports = EmbeddingsService;
