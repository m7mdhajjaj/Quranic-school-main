// ============================================================================
// getNews.js - Get News Operations
// ============================================================================

const News = require("../../schema/News");

// ----------------------------------------------------------------------------
// Helpers (teacher-name based resolution; ignores groups completely)
// ----------------------------------------------------------------------------
const normalizeName = (value) => (value || "").toString().trim().replace(/\s+/g, " ");

const escapeRegex = (value) =>
  (value || "").toString().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * Resolve Teacher _id from a Student.teacher string reliably.
 * - Case-insensitive
 * - Whitespace-insensitive (treat multiple spaces as one)
 * - Does NOT use groups at all (as requested)
 */
const resolveTeacherIdFromStudent = async ({ studentTeacherName, studentGroupName }) => {
  // 1) Prefer resolving by group -> Group.teacher (most reliable)
  const Group = require("../../schema/Group");
  const groupName = normalizeName(studentGroupName);
  if (groupName && groupName !== "غير محدد") {
    const group = await Group.findOne({ name: groupName }).select("teacher");
    if (group?.teacher) return group.teacher;
  }

  // 2) Fallback: resolve by teacher full-name string stored on Student
  const Teacher = require("../../schema/Teacher");
  const raw = normalizeName(studentTeacherName);
  if (!raw || raw === "غير محدد") return null;

  // Convert "A   B" -> /^A\s+B$/i
  const nameRegex = `^${escapeRegex(raw).replace(/\s+/g, "\\s+")}$`;

  // Match concat(firstName + " " + lastName) against regex, case-insensitive.
  const teacher = await Teacher.findOne({
    $expr: {
      $regexMatch: {
        input: { $concat: ["$firstName", " ", "$lastName"] },
        regex: nameRegex,
        options: "i",
      },
    },
  }).select("_id");

  return teacher?._id || null;
};

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
      const student = await Student.findById(userId).select('teacher group');
      
      console.log(`🔍 Debug Student News: ID=${userId}, TeacherName=${student?.teacher}, Group=${student?.group}`);

      const teacherId = await resolveTeacherIdFromStudent({
        studentTeacherName: student?.teacher,
        studentGroupName: student?.group,
      });
      if (teacherId) console.log(`✅ Found teacher by name (normalized): ${teacherId}`);
      else console.log(`❌ No teacher found by name (normalized): ${student?.teacher}`);

      if (teacherId) {
        // Students see:
        // 1. General news (عام - لكل الطلاب)
        // 2. Group news from their teacher ONLY (طلاب المعلم - فقط أخبار معلمهم)
        query.$or = [
          { visibility: 'general' },
          { visibility: 'group', author: teacherId }
        ];
        console.log(`📚 Student viewing: general + their teacher's group news only (Teacher ID: ${teacherId})`);
        console.log('🔍 Query:', JSON.stringify(query));
      } else {
        // If no teacher found, show only general news
        query.visibility = 'general';
        console.log(`📚 Student (no teacher found): general news only`);
      }
    } else if (userRole === 'teacher') {
      // Teachers see:
      // 1. All general news
      // 2. Their own group news ONLY
      query.$or = [
        { visibility: 'general' },
        { visibility: 'group', author: userId }
      ];
      console.log(`👨‍🏫 Teacher viewing general news + their own group news`);
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
      const student = await Student.findById(userId).select('teacher group');
      
      console.log(`🔍 Debug Student News (Published): ID=${userId}, TeacherName=${student?.teacher}, Group=${student?.group}`);

      const teacherId = await resolveTeacherIdFromStudent({
        studentTeacherName: student?.teacher,
        studentGroupName: student?.group,
      });
      if (teacherId) console.log(`✅ Found teacher by name (normalized): ${teacherId}`);
      else console.log(`❌ No teacher found by name (normalized): ${student?.teacher}`);

      if (teacherId) {
        // Students see:
        // 1. General published news (عام)
        // 2. Group published news from their teacher ONLY (حلقة - فقط أخبار معلمهم)
        query.$or = [
          { visibility: 'general' },
          { visibility: 'group', author: teacherId }
        ];
        console.log(`📚 Student viewing published: general + their teacher's group news only (Teacher ID: ${teacherId})`);
        console.log('🔍 Query (Published):', JSON.stringify(query));
      } else {
        // If no teacher found, show only general
        query.visibility = 'general';
        console.log(`📚 Student (no teacher found): general published news only`);
      }
    } else if (userRole === 'teacher') {
      // Teachers see:
      // 1. All general news
      // 2. Their own group news ONLY
      query.$or = [
        { visibility: 'general', isPublished: true },
        { visibility: 'group', author: userId, isPublished: true }
      ];
      // Simplify query structure
      query = {
        isPublished: true,
        $or: [
          { visibility: 'general' },
          { visibility: 'group', author: userId }
        ]
      };
      console.log(`👨‍🏫 Teacher viewing published: general + their own group news`);
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
