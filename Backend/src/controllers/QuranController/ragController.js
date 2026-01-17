const QuranRAGService = require('../../../services/Quran/QuranRAGService');

/**
 * 🔍 RAG Controller
 * البحث الذكي في القرآن
 */

/**
 * @desc    Search in Quran
 * @route   GET /api/quran/search
 * @access  Public
 */
exports.searchQuran = async (req, res) => {
  try {
    const { query, limit = 10, surah, juz } = req.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'يرجى إدخال نص للبحث'
      });
    }

    const results = await QuranRAGService.search(query, {
      limit: parseInt(limit),
      surahNumber: surah ? parseInt(surah) : null,
      juzNumber: juz ? parseInt(juz) : null
    });

    res.json({
      success: true,
      count: results.length,
      data: results
    });
  } catch (error) {
    console.error('Error searching:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في البحث'
    });
  }
};

/**
 * @desc    Search in specific Surah
 * @route   GET /api/quran/search/surah/:surahNumber
 * @access  Public
 */
exports.searchInSurah = async (req, res) => {
  try {
    const { surahNumber } = req.params;
    const { query, limit = 10 } = req.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'يرجى إدخال نص للبحث'
      });
    }

    const results = await QuranRAGService.search(query, {
      limit: parseInt(limit),
      surahNumber: parseInt(surahNumber)
    });

    res.json({
      success: true,
      count: results.length,
      data: results
    });
  } catch (error) {
    console.error('Error searching in surah:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في البحث'
    });
  }
};

/**
 * @desc    Search for a specific word
 * @route   GET /api/quran/search/word
 * @access  Public
 */
exports.searchWord = async (req, res) => {
  try {
    const { word, limit = 50 } = req.query;

    if (!word) {
      return res.status(400).json({
        success: false,
        message: 'يرجى إدخال كلمة للبحث'
      });
    }

    const results = await QuranRAGService.searchWord(word, parseInt(limit));

    res.json({
      success: true,
      count: results.length,
      data: results
    });
  } catch (error) {
    console.error('Error searching word:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في البحث'
    });
  }
};

/**
 * @desc    Get similar Ayahs
 * @route   GET /api/quran/similar
 * @access  Public
 */
exports.getSimilarAyahs = async (req, res) => {
  try {
    const { surah, ayah, limit = 5 } = req.query;

    if (!surah || !ayah) {
      return res.status(400).json({
        success: false,
        message: 'يرجى تحديد السورة والآية'
      });
    }

    const results = await QuranRAGService.getSimilarAyahs(
      parseInt(surah),
      parseInt(ayah),
      parseInt(limit)
    );

    res.json({
      success: true,
      count: results.length,
      data: results
    });
  } catch (error) {
    console.error('Error getting similar ayahs:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في البحث عن آيات مشابهة'
    });
  }
};

/**
 * @desc    Get Ayah with context
 * @route   GET /api/quran/context
 * @access  Public
 */
exports.getAyahContext = async (req, res) => {
  try {
    const { surah, ayah, size = 2 } = req.query;

    if (!surah || !ayah) {
      return res.status(400).json({
        success: false,
        message: 'يرجى تحديد السورة والآية'
      });
    }

    const result = await QuranRAGService.getAyahWithContext(
      parseInt(surah),
      parseInt(ayah),
      parseInt(size)
    );

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'الآية غير موجودة'
      });
    }

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error getting ayah context:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب سياق الآية'
    });
  }
};

/**
 * @desc    Build RAG context for AI
 * @route   POST /api/quran/rag
 * @access  Public
 */
exports.buildRAGContext = async (req, res) => {
  try {
    const { query, maxResults = 5 } = req.body;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'يرجى إدخال استعلام'
      });
    }

    const result = await QuranRAGService.buildRAGContext(query, parseInt(maxResults));

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('Error building RAG context:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في بناء سياق RAG'
    });
  }
};

/**
 * @desc    Semantic search in Quran
 * @route   GET /api/quran/semantic-search
 * @access  Public
 */
exports.semanticSearchQuran = async (req, res) => {
  try {
    const { query, limit = 10, threshold = 0.7, surah } = req.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'يرجى إدخال نص للبحث'
      });
    }

    const results = await QuranRAGService.semanticSearch(query, {
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
    console.error('Error in semantic search:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في البحث الدلالي'
    });
  }
};

/**
 * @desc    Hybrid search (text + semantic)
 * @route   GET /api/quran/hybrid-search
 * @access  Public
 */
exports.hybridSearchQuran = async (req, res) => {
  try {
    const { query, limit = 10 } = req.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'يرجى إدخال نص للبحث'
      });
    }

    const results = await QuranRAGService.hybridSearch(query, {
      limit: parseInt(limit)
    });

    res.json({
      success: true,
      count: results.length,
      searchType: 'hybrid',
      data: results
    });
  } catch (error) {
    console.error('Error in hybrid search:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في البحث الهجين'
    });
  }
};

/**
 * @desc    Build semantic RAG context
 * @route   POST /api/quran/semantic-rag
 * @access  Public
 */
exports.buildSemanticRAGContext = async (req, res) => {
  try {
    const { query, maxResults = 5 } = req.body;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'يرجى إدخال استعلام'
      });
    }

    const result = await QuranRAGService.buildSemanticRAGContext(query, parseInt(maxResults));

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('Error building semantic RAG context:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في بناء سياق RAG الدلالي'
    });
  }
};
