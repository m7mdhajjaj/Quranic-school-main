const mongoose = require('mongoose');

/**
 * 📖 Quran Surah Schema
 * معلومات السور الـ 114
 */
const QuranSurahSchema = new mongoose.Schema({
  // رقم السورة (1-114)
  number: {
    type: Number,
    required: true,
    unique: true,
    min: 1,
    max: 114,
    index: true
  },
  
  // الاسم بالعربية
  nameArabic: {
    type: String,
    required: true,
    index: true
  },
  
  // الاسم بالإنجليزية
  nameEnglish: {
    type: String,
    required: true
  },
  
  // عدد الآيات
  ayahCount: {
    type: Number,
    required: true
  },
  
  // مكان النزول
  revelationPlace: {
    type: String,
    enum: ['Mecca', 'Medina'],
    required: true
  },
  
  // نوع السورة
  revelationType: {
    type: String,
    enum: ['Makkiyah', 'Madaniyah'],
    required: true
  },
  
  // رقم الصفحة الأولى
  startPage: {
    type: Number
  },
  
  // الأجزاء التي تقع فيها السورة
  juzNumbers: [{
    type: Number,
    min: 1,
    max: 30
  }]
}, {
  timestamps: true,
  collection: 'quran_surahs'
});

// Text Index للبحث
QuranSurahSchema.index({ nameArabic: 'text', nameEnglish: 'text' });

module.exports = mongoose.model('QuranSurah', QuranSurahSchema);
