const mongoose = require('mongoose');

/**
 * 📖 Quran Juz Schema
 * معلومات الأجزاء الـ 30
 */
const QuranJuzSchema = new mongoose.Schema({
  // رقم الجزء (1-30)
  number: {
    type: Number,
    required: true,
    unique: true,
    min: 1,
    max: 30,
    index: true
  },
  
  // بداية الجزء
  start: {
    surahNumber: { type: Number, required: true },
    surahName: { type: String },
    ayahNumber: { type: Number, required: true }
  },
  
  // نهاية الجزء
  end: {
    surahNumber: { type: Number, required: true },
    surahName: { type: String },
    ayahNumber: { type: Number, required: true }
  }
}, {
  timestamps: true,
  collection: 'quran_juz'
});

module.exports = mongoose.model('QuranJuz', QuranJuzSchema);
