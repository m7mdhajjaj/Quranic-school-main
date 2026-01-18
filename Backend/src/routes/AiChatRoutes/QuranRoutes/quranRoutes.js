const express = require('express');
const router = express.Router();
const quranController = require('../../../controllers/AiChatController/QuranController');
const {
  validateSearchQuran,
  validateSurahNumber,
  validateAyahNumber,
  validateSearchTafsir,
  validateRAGContext,
  validateTopicSearch
} = require('../../../Validation/Quran/quranValidation');

/**
 * Quran Routes
 * Routes for accessing Quran data (Surahs, Ayahs, Search, RAG)
 */

// ============================================================================
// Surah & Ayah Routes - جلب البيانات الأساسية
// ============================================================================

// Get all Surahs
router.get('/surahs', quranController.getAllSurahs);

// Get specific Surah with its Ayahs (removed validation temporarily for debugging)
router.get('/surah/:surahNumber', quranController.getSurahWithAyahs);

// Get specific Ayah (removed validation temporarily for debugging)  
router.get('/ayah/:surahNumber/:ayahNumber', quranController.getAyah);

// ============================================================================
// Import Routes - لاستيراد بيانات القرآن من JSON
// ============================================================================

// استيراد جميع بيانات القرآن (السور، الآيات، التفسير، التجويد)
router.post('/import', quranController.importQuranData);

// الحصول على إحصائيات البيانات المستوردة
router.get('/stats', quranController.getImportStats);

// ============================================================================
// RAG Search Routes - للبحث الذكي في القرآن
// ============================================================================

// البحث في القرآن الكريم
// GET /api/quran/search?query=...&limit=10&surah=...&juz=...
router.get('/search', validateSearchQuran, quranController.searchQuran);

// البحث في سورة محددة
// GET /api/quran/search/surah/:surahNumber?query=...
router.get('/search/surah/:surahNumber', validateSurahNumber, quranController.searchInSurah);

// البحث عن كلمة محددة
// GET /api/quran/search/word?word=...&limit=50
router.get('/search/word', quranController.searchWord);

// الحصول على آيات مشابهة
// GET /api/quran/similar?surah=...&ayah=...&limit=5
router.get('/similar', quranController.getSimilarAyahs);

// الحصول على سياق الآية (للـ AI Chatbot)
// GET /api/quran/context?surah=...&ayah=...&size=2
router.get('/context', quranController.getAyahContext);

// بناء سياق RAG للـ AI
// POST /api/quran/rag { query, maxResults }
router.post('/rag', validateRAGContext, quranController.buildRAGContext);

// ============================================================================
// Tafsir Ibn Kathir Routes - تفسير ابن كثير
// ============================================================================

// البحث في تفسير ابن كثير
// GET /api/quran/tafsir/search?query=...&limit=10
router.get('/tafsir/search', validateSearchTafsir, quranController.searchTafsir);

// الحصول على تفسير آية معينة
// GET /api/quran/tafsir/:surahNumber/:ayahNumber
router.get('/tafsir/:surahNumber/:ayahNumber', validateAyahNumber, quranController.getTafsir);

// الحصول على تفسير سورة كاملة
// GET /api/quran/tafsir/surah/:surahNumber
router.get('/tafsir/surah/:surahNumber', validateSurahNumber, quranController.getSurahTafsir);

// البحث حسب الموضوع في التفسير
// GET /api/quran/tafsir/topic/:topic
router.get('/tafsir/topic/:topic', quranController.searchTafsirByTopic);

// بناء سياق RAG للتفسير (للـ AI)
// POST /api/quran/tafsir/rag { query, maxResults }
router.post('/tafsir/rag', validateRAGContext, quranController.buildTafsirRAGContext);

// إحصائيات التفسير
// GET /api/quran/tafsir/stats
router.get('/tafsir/stats', quranController.getTafsirStats);

// البحث الدلالي في التفسير
// GET /api/quran/tafsir/semantic-search?query=...
router.get('/tafsir/semantic-search', quranController.semanticSearchTafsir);

// ============================================================================
// Embeddings & Semantic Search Routes - البحث الدلالي
// ============================================================================

// إحصائيات الـ Embeddings
// GET /api/quran/embeddings/stats
router.get('/embeddings/stats', quranController.getEmbeddingsStats);

// توليد embeddings للآيات
// POST /api/quran/embeddings/ayahs { startFrom, limit, forceRegenerate }
router.post('/embeddings/ayahs', quranController.generateAyahEmbeddings);

// توليد embeddings للتفسير
// POST /api/quran/embeddings/tafsir { startFrom, limit, forceRegenerate }
router.post('/embeddings/tafsir', quranController.generateTafsirEmbeddings);

// البحث الدلالي في القرآن
// GET /api/quran/semantic-search?query=...&limit=10
router.get('/semantic-search', quranController.semanticSearchQuran);

// البحث الهجين (نصي + دلالي)
// GET /api/quran/hybrid-search?query=...&limit=10
router.get('/hybrid-search', quranController.hybridSearchQuran);

// بناء سياق RAG دلالي
// POST /api/quran/semantic-rag { query, maxResults }
router.post('/semantic-rag', validateRAGContext, quranController.buildSemanticRAGContext);

module.exports = router;
