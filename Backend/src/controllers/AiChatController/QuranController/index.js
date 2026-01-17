/**
 * 📖 Quran Module - Main Export
 * يجمع جميع الـ controllers للقرآن والتفسير والـ RAG
 */

const surahController = require('./surahController');
const quranMainController = require('./quranMainController');

module.exports = {
  // ═══════════════════════════════════════
  // Surah & Ayah - من surahController
  // ═══════════════════════════════════════
  getAllSurahs: surahController.getAllSurahs,
  getSurahWithAyahs: surahController.getSurahWithAyahs,
  getAyah: surahController.getAyah,

  // ═══════════════════════════════════════
  // Import - استيراد البيانات
  // ═══════════════════════════════════════
  importQuranData: quranMainController.importQuranData,
  getImportStats: quranMainController.getImportStats,

  // ═══════════════════════════════════════
  // Search - البحث في القرآن
  // ═══════════════════════════════════════
  searchQuran: quranMainController.searchQuran,
  searchInSurah: quranMainController.searchInSurah,
  searchWord: quranMainController.searchWord,
  getSimilarAyahs: quranMainController.getSimilarAyahs,
  getAyahContext: quranMainController.getAyahContext,
  buildRAGContext: quranMainController.buildRAGContext,

  // ═══════════════════════════════════════
  // Tafsir - تفسير ابن كثير
  // ═══════════════════════════════════════
  searchTafsir: quranMainController.searchTafsir,
  getTafsir: quranMainController.getTafsir,
  getSurahTafsir: quranMainController.getSurahTafsir,
  searchTafsirByTopic: quranMainController.searchTafsirByTopic,
  buildTafsirRAGContext: quranMainController.buildTafsirRAGContext,
  getTafsirStats: quranMainController.getTafsirStats,
  semanticSearchTafsir: quranMainController.semanticSearchTafsir,

  // ═══════════════════════════════════════
  // Embeddings - البحث الدلالي
  // ═══════════════════════════════════════
  getEmbeddingsStats: quranMainController.getEmbeddingsStats,
  generateAyahEmbeddings: quranMainController.generateAyahEmbeddings,
  generateTafsirEmbeddings: quranMainController.generateTafsirEmbeddings,
  semanticSearchQuran: quranMainController.semanticSearchQuran,
  hybridSearchQuran: quranMainController.hybridSearchQuran,
  buildSemanticRAGContext: quranMainController.buildSemanticRAGContext
};
