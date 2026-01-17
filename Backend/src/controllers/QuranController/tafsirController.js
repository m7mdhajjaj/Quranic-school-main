const TafsirRAGService = require('../../../services/Quran/TafsirRAGService');

/**
 * 📚 Tafsir Controller
 * تفسير ابن كثير
 */

/**
 * @desc    Search in Tafsir Ibn Kathir
 * @route   GET /api/quran/tafsir/search
 * @access  Public
 */
exports.searchTafsir = async (req, res) => {
  try {
    const { query, limit = 10, surah } = req.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'يرجى إدخال نص للبحث'
      });
    }

    const results = await TafsirRAGService.search(query, {
      limit: parseInt(limit),
      surahNumber: surah ? parseInt(surah) : null
    });

    res.json({
      success: true,
      count: results.length,
      data: results
    });
  } catch (error) {
    console.error('Error searching tafsir:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في البحث في التفسير'
    });
  }
};

/**
 * @desc    Get Tafsir for specific Ayah
 * @route   GET /api/quran/tafsir/:surahNumber/:ayahNumber
 * @access  Public
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
    console.error('Error getting tafsir:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب التفسير'
    });
  }
};

/**
 * @desc    Get Tafsir for entire Surah
 * @route   GET /api/quran/tafsir/surah/:surahNumber
 * @access  Public
 */
exports.getSurahTafsir = async (req, res) => {
  try {
    const { surahNumber } = req.params;

    const tafsir = await TafsirRAGService.getSurahTafsir(parseInt(surahNumber));

    if (!tafsir || tafsir.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'لا يوجد تفسير لهذه السورة'
      });
    }

    res.json({
      success: true,
      count: tafsir.length,
      data: tafsir
    });
  } catch (error) {
    console.error('Error getting surah tafsir:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب تفسير السورة'
    });
  }
};

/**
 * @desc    Search Tafsir by Topic
 * @route   GET /api/quran/tafsir/topic/:topic
 * @access  Public
 */
exports.searchTafsirByTopic = async (req, res) => {
  try {
    const { topic } = req.params;
    const { limit = 10 } = req.query;

    const results = await TafsirRAGService.searchByTopic(topic, parseInt(limit));

    res.json({
      success: true,
      topic,
      count: results.length,
      data: results
    });
  } catch (error) {
    console.error('Error searching by topic:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في البحث بالموضوع'
    });
  }
};

/**
 * @desc    Build Tafsir RAG Context for AI
 * @route   POST /api/quran/tafsir/rag
 * @access  Public
 */
exports.buildTafsirRAGContext = async (req, res) => {
  try {
    const { query, maxResults = 3 } = req.body;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'يرجى إدخال استعلام'
      });
    }

    const result = await TafsirRAGService.buildRAGContext(query, parseInt(maxResults));

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('Error building tafsir RAG context:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في بناء سياق التفسير'
    });
  }
};

/**
 * @desc    Get Tafsir Statistics
 * @route   GET /api/quran/tafsir/stats
 * @access  Public
 */
exports.getTafsirStats = async (req, res) => {
  try {
    const stats = await TafsirRAGService.getStats();

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error getting tafsir stats:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب إحصائيات التفسير'
    });
  }
};

/**
 * @desc    Semantic Search in Tafsir
 * @route   GET /api/quran/tafsir/semantic-search
 * @access  Public
 */
exports.semanticSearchTafsir = async (req, res) => {
  try {
    const { query, limit = 10, threshold = 0.65, surah } = req.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'يرجى إدخال نص للبحث'
      });
    }

    const results = await TafsirRAGService.semanticSearch(query, {
      limit: parseInt(limit),
      threshold: parseFloat(threshold),
      surahNumber: surah ? parseInt(surah) : null
    });

    res.json({
      success: true,
      count: results.length,
      searchType: 'semantic',
      data: results
    });
  } catch (error) {
    console.error('Error in semantic tafsir search:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في البحث الدلالي في التفسير'
    });
  }
};
