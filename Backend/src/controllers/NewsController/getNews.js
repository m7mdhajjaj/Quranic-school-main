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

    // Filter news based on user role and visibility type
    const userRole = req.user?.role;
    const userId = req.user?._id;

    if (userRole === 'student') {
      const Student = require('../../schema/Student');
      const student = await Student.findById(userId).select('teacher');
      
      if (student && student.teacher) {
        // Get teacher info
        const Teacher = require('../../schema/Teacher');
        const teacher = await Teacher.findOne({
          $expr: {
            $eq: [
              { $concat: ["$firstName", " ", "$lastName"] },
              student.teacher
            ]
          }
        }).select('_id');

        // Students see:
        // 1. General news (من الكل)
        // 2. Group news from their teacher (أخبار معلمهم)
        // 3. Administrative news (أخبار إدارية)
        query.$or = [
          { visibility: 'general' },
          { visibility: 'administrative' },
          { visibility: 'group', author: teacher?._id, authorModel: 'Teacher' }
        ];
        console.log(`📚 Student viewing: general + administrative + their teacher's group news`);
      } else {
        // If no teacher, show only general and administrative
        query.$or = [
          { visibility: 'general' },
          { visibility: 'administrative' }
        ];
        console.log(`📚 Student (no teacher): general + administrative news only`);
      }
    } else if (userRole === 'teacher') {
      // Teachers see:
      // 1. All general news
      // 2. All group news (from all teachers)
      // 3. All administrative news
      console.log(`👨‍🏫 Teacher viewing all news`);
    } else if (userRole === 'admin') {
      // Admins see all news
      console.log(`👨‍💼 Admin viewing all news`);
    }

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

    let query = { isPublished: true };

    // Filter news based on user role and visibility type
    const userRole = req.user?.role;
    const userId = req.user?._id;

    if (userRole === 'student') {
      const Student = require('../../schema/Student');
      const student = await Student.findById(userId).select('teacher');
      
      if (student && student.teacher) {
        // Get teacher info
        const Teacher = require('../../schema/Teacher');
        const teacher = await Teacher.findOne({
          $expr: {
            $eq: [
              { $concat: ["$firstName", " ", "$lastName"] },
              student.teacher
            ]
          }
        }).select('_id');

        // Students see:
        // 1. General published news
        // 2. Group published news from their teacher
        // 3. Administrative published news
        query.$or = [
          { visibility: 'general' },
          { visibility: 'administrative' },
          { visibility: 'group', author: teacher?._id, authorModel: 'Teacher' }
        ];
        console.log(`📚 Student viewing published: general + administrative + their teacher's group news`);
      } else {
        // If no teacher, show only general and administrative
        query.$or = [
          { visibility: 'general' },
          { visibility: 'administrative' }
        ];
        console.log(`📚 Student (no teacher): general + administrative published news only`);
      }
    }

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
