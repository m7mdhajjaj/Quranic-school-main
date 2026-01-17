const mongoose = require('mongoose');

/**
 * 📚 Tafsir Ibn Kathir Schema
 * سكيما تفسير ابن كثير للبحث الذكي
 */
const TafsirIbnKathirSchema = new mongoose.Schema({
  // رقم السورة
  surahNumber: {
    type: Number,
    required: true,
    min: 1,
    max: 114,
    index: true
  },
  
  // اسم السورة
  surahName: {
    type: String,
    required: true
  },
  
  // نوع السورة (مكية/مدنية)
  surahType: {
    type: String
  },
  
  // رقم الآية
  ayahNumber: {
    type: Number,
    required: true,
    min: 1,
    index: true
  },
  
  // معرف فريد "سورة:آية"
  ayahKey: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  
  // نص الآية
  ayahText: {
    type: String,
    required: true
  },
  
  // تفسير ابن كثير الكامل
  tafsir: {
    type: String,
    required: true
  },
  
  // تفسير مختصر
  tafsirShort: {
    type: String
  },
  
  // كلمات مفتاحية
  keywords: [{
    type: String
  }],
  
  // عدد الكلمات
  wordCount: {
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
  collection: 'tafsir_ibn_kathir'
});

// Indexes
TafsirIbnKathirSchema.index({ surahNumber: 1, ayahNumber: 1 }, { unique: true });

module.exports = mongoose.model('TafsirIbnKathir', TafsirIbnKathirSchema);
