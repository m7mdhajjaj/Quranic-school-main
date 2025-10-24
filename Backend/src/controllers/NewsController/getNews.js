// ============================================================================
// getNews.js - Get News Operations
// ============================================================================

const News = require("../../schema/News");

/**
 * Get all news items
 * @route GET /api/news
 */
exports.getAllNews = async (req, res) => {
  try {
    console.log("📰 Fetching all news...");
    const startTime = Date.now();

    const { page = 1, limit = 10, status } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (status === "published") query.isPublished = true;
    if (status === "draft") query.isPublished = false;

    const news = await News.find(query)
      .populate({
        path: 'author',
        select: 'firstName lastName name email'
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await News.countDocuments(query);

    const duration = Date.now() - startTime;
    console.log(`✅ Fetched ${news.length} news items in ${duration}ms`);

    res.json({
      success: true,
      data: news,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("❌ Error fetching news:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء جلب الأخبار",
      error: error.message,
    });
  }
};

/**
 * Get single news item by ID
 * @route GET /api/news/:id
 */
exports.getNewsById = async (req, res) => {
  try {
    console.log("📰 Fetching news by ID:", req.params.id);

    const news = await News.findById(req.params.id);

    if (!news) {
      return res.status(404).json({
        success: false,
        message: "الخبر غير موجود",
      });
    }

    console.log("✅ News found");

    res.json({
      success: true,
      data: news,
    });
  } catch (error) {
    console.error("❌ Error fetching news:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء جلب الخبر",
      error: error.message,
    });
  }
};

/**
 * Search news by title or content
 * @route GET /api/news/search/:query
 */
exports.searchNews = async (req, res) => {
  try {
    console.log("🔍 Searching news for:", req.params.query);

    const { query } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const results = await News.find({
      $or: [
        { title: { $regex: query, $options: "i" } },
        { content: { $regex: query, $options: "i" } },
      ],
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await News.countDocuments({
      $or: [
        { title: { $regex: query, $options: "i" } },
        { content: { $regex: query, $options: "i" } },
      ],
    });

    console.log(`✅ Found ${results.length} news items`);

    res.json({
      success: true,
      data: results,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("❌ Error searching news:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء البحث",
      error: error.message,
    });
  }
};

/**
 * Get published news only
 * @route GET /api/news/published
 */
exports.getPublishedNews = async (req, res) => {
  try {
    console.log("📰 Fetching published news...");

    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const news = await News.find({ isPublished: true })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await News.countDocuments({ isPublished: true });

    res.json({
      success: true,
      data: news,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("❌ Error fetching published news:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء جلب الأخبار",
      error: error.message,
    });
  }
};
