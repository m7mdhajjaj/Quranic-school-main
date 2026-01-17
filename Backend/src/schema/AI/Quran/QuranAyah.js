const mongoose = require('mongoose');

/**
 * 📖 Quran Ayah Schema
 * الآيات مع النص والتفسير والتجويد
 * مُحسَّن للبحث الدقيق
 */
const QuranAyahSchema = new mongoose.Schema({
  // ═══════════════════════════════════════
  // المعرفات الأساسية
  // ═══════════════════════════════════════
  
  // رقم السورة
  surahNumber: {
    type: Number,
    required: true,
    min: 1,
    max: 114,
    index: true
  },
  
  // رقم الآية في السورة
  ayahNumber: {
    type: Number,
    required: true,
    min: 1,
    index: true
  },
  
  // معرف فريد: "سورة:آية" مثل "2:255"
  ayahKey: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  
  // ═══════════════════════════════════════
  // النص القرآني
  // ═══════════════════════════════════════
  
  // نص الآية بالرسم العثماني
  textArabic: {
    type: String,
    required: true
  },
  
  // نص الآية بدون تشكيل (للبحث)
  textSimplified: {
    type: String,
    index: true
  },
  
  // ═══════════════════════════════════════
  // التفسير العربي
  // ═══════════════════════════════════════
  
  tafsirArabic: {
    type: String,
    default: ''
  },
  
  // ═══════════════════════════════════════
  // التجويد
  // ═══════════════════════════════════════
  
  tajweedRules: [{
    start: Number,      // موقع البداية في النص
    end: Number,        // موقع النهاية
    rule: {             // نوع القاعدة
      type: String,
      enum: [
        'hamzat_wasl',      // همزة الوصل
        'lam_shamsiyyah',   // اللام الشمسية
        'madd_2',           // مد 2 حركات
        'madd_6',           // مد 6 حركات
        'madd_246',         // مد 2-4-6 حركات
        'ghunnah',          // غنة
        'ikhfaa',           // إخفاء
        'idghaam',          // إدغام
        'iqlaab',           // إقلاب
        'qalqalah',         // قلقلة
        'other'             // أخرى
      ]
    }
  }],
  
  // ═══════════════════════════════════════
  // معلومات إضافية
  // ═══════════════════════════════════════
  
  // رقم الجزء
  juzNumber: {
    type: Number,
    min: 1,
    max: 30,
    index: true
  },
  
  // رقم الصفحة
  pageNumber: {
    type: Number
  },
  
  // هل فيها سجدة؟
  hasSajda: {
    type: Boolean,
    default: false
  },
  
  // ═══════════════════════════════════════
  // للبحث المتقدم
  // ═══════════════════════════════════════
  
  // كلمات الآية (للبحث بالكلمات)
  words: [{
    type: String
  }],
  
  // عدد الكلمات
  wordCount: {
    type: Number
  },
  
  // عدد الحروف
  letterCount: {
    type: Number
  },

  // ═══════════════════════════════════════
  // Embedding للبحث الدلالي (Semantic Search)
  // ═══════════════════════════════════════
  
  // Vector embedding من OpenAI (1536 dimensions)
  embedding: {
    type: [Number],
    select: false  // لا يُجلب افتراضياً لتوفير الذاكرة
  }
  
}, {
  timestamps: true,
  collection: 'quran_ayahs'
});

// ═══════════════════════════════════════
// Indexes للبحث السريع
// ═══════════════════════════════════════

// Compound index للبحث بالسورة والآية
QuranAyahSchema.index({ surahNumber: 1, ayahNumber: 1 }, { unique: true });

// Compound index للبحث بالجزء
QuranAyahSchema.index({ juzNumber: 1, surahNumber: 1, ayahNumber: 1 });

// Text Index للبحث النصي في الآية والتفسير
QuranAyahSchema.index(
  { textArabic: 'text', tafsirArabic: 'text', textSimplified: 'text' },
  { 
    weights: { textArabic: 10, textSimplified: 8, tafsirArabic: 5 },
    name: 'quran_text_search',
    default_language: 'arabic'
  }
);

// ═══════════════════════════════════════
// Middleware قبل الحفظ
// ═══════════════════════════════════════

QuranAyahSchema.pre('save', function(next) {
  // إنشاء ayahKey
  this.ayahKey = `${this.surahNumber}:${this.ayahNumber}`;
  
  // استخراج الكلمات
  if (this.textArabic) {
    this.words = this.textArabic.split(/\s+/).filter(w => w.length > 0);
    this.wordCount = this.words.length;
    this.letterCount = this.textArabic.replace(/\s/g, '').length;
    
    // إنشاء نص مبسط بدون تشكيل للبحث
    this.textSimplified = this.textArabic
      .replace(/[\u064B-\u0652]/g, '')  // إزالة التشكيل
      .replace(/[\u0670\u0671]/g, 'ا')  // توحيد الألف
      .replace(/ٱ/g, 'ا')               // الألف الوصل
      .replace(/ى/g, 'ي')               // الألف المقصورة
      .replace(/ة/g, 'ه');              // التاء المربوطة
  }
  
  next();
});

// ═══════════════════════════════════════
// Methods
// ═══════════════════════════════════════

// الحصول على مرجع الآية
QuranAyahSchema.methods.getReference = function() {
  return `${this.surahNumber}:${this.ayahNumber}`;
};

// ═══════════════════════════════════════
// Statics للبحث
// ═══════════════════════════════════════

// البحث في القرآن
QuranAyahSchema.statics.searchQuran = async function(query, options = {}) {
  const { limit = 20, surahNumber = null, juzNumber = null } = options;
  
  const filter = { $text: { $search: query } };
  
  if (surahNumber) filter.surahNumber = surahNumber;
  if (juzNumber) filter.juzNumber = juzNumber;
  
  return this.find(filter, { score: { $meta: 'textScore' } })
    .sort({ score: { $meta: 'textScore' } })
    .limit(limit)
    .select('surahNumber ayahNumber textArabic tafsirArabic ayahKey');
};

// الحصول على آية بالمفتاح
QuranAyahSchema.statics.getByKey = async function(key) {
  return this.findOne({ ayahKey: key });
};

// الحصول على آيات سورة
QuranAyahSchema.statics.getBySurah = async function(surahNumber) {
  return this.find({ surahNumber })
    .sort({ ayahNumber: 1 })
    .select('ayahNumber textArabic tafsirArabic tajweedRules');
};

// الحصول على آيات جزء
QuranAyahSchema.statics.getByJuz = async function(juzNumber) {
  return this.find({ juzNumber })
    .sort({ surahNumber: 1, ayahNumber: 1 })
    .select('surahNumber ayahNumber textArabic');
};

module.exports = mongoose.model('QuranAyah', QuranAyahSchema);
