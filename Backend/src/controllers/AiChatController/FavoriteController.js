const AiChatFavorite = require('../../schema/AI/AiChatFavorite');
const mongoose = require('mongoose');
const { validationResult } = require('express-validator');

// ═══════════════════════════════════════════════════════════════════════════
// 🔒 Security: Input Sanitization (منع XSS)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * تنظيف Tags من HTML و special characters
 */
function sanitizeTags(tags) {
  if (!Array.isArray(tags)) return [];
  
  return tags
    .map(tag => {
      if (typeof tag !== 'string') return null;
      return tag
        .replace(/<[^>]*>/g, '')        // إزالة HTML tags
        .replace(/[<>"'&]/g, '')        // إزالة special chars
        .trim()
        .substring(0, 50);              // حد أقصى 50 حرف
    })
    .filter(tag => tag && tag.length > 0)
    .slice(0, 10);                      // حد أقصى 10 tags
}

/**
 * تنظيف النص من HTML
 */
function sanitizeText(text, maxLength = 1000) {
  if (!text || typeof text !== 'string') return '';
  return text
    .replace(/<script[^>]*>.*?<\/script>/gi, '') // إزالة scripts
    .replace(/<[^>]*>/g, '')                     // إزالة HTML
    .trim()
    .substring(0, maxLength);
}

/**
 * @desc    Add message to favorites
 * @route   POST /api/ai-chat/favorites
 * @access  Private (Teacher & Student)
 */
const addFavorite = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'بيانات غير صالحة',
        errors: errors.array()
      });
    }

    const { question, answer, tags, note } = req.body;
    const userId = req.user.id;

    // Check if already favorited (same question)
    const existingFavorite = await AiChatFavorite.findOne({
      user: userId,
      question: sanitizeText(question, 1000) // 🔒 تنظيف للمقارنة
    });

    if (existingFavorite) {
      return res.status(400).json({
        success: false,
        message: 'هذه الرسالة موجودة بالفعل في المفضلة'
      });
    }

    // 🔒 تنظيف جميع المدخلات
    const favorite = await AiChatFavorite.create({
      user: userId,
      question: sanitizeText(question, 1000),
      answer: sanitizeText(answer, 5000),
      tags: sanitizeTags(tags),
      note: sanitizeText(note, 500)
    });

    return res.status(201).json({
      success: true,
      message: 'تم إضافة الرسالة إلى المفضلة بنجاح',
      data: favorite
    });

  } catch (error) {
    console.error('Error adding favorite:', error);
    return res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء إضافة الرسالة إلى المفضلة'
    });
  }
};

/**
 * @desc    Get all favorites for logged-in user
 * @route   GET /api/ai-chat/favorites
 * @access  Private (Teacher & Student)
 */
const getFavorites = async (req, res) => {
  try {
    const userId = req.user.id;
    const { search, tag, page = 1, limit = 20 } = req.query;

    const query = { user: userId };

    // Search in question or answer
    if (search) {
      query.$or = [
        { question: { $regex: search, $options: 'i' } },
        { answer: { $regex: search, $options: 'i' } }
      ];
    }

    // Filter by tag
    if (tag) {
      query.tags = tag;
    }

    const skip = (page - 1) * limit;

    const favorites = await AiChatFavorite.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await AiChatFavorite.countDocuments(query);

    return res.status(200).json({
      success: true,
      data: favorites,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error getting favorites:', error);
    return res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء جلب المفضلة'
    });
  }
};

/**
 * @desc    Update favorite note or tags
 * @route   PUT /api/ai-chat/favorites/:id
 * @access  Private (Teacher & Student)
 */
const updateFavorite = async (req, res) => {
  try {
    const { id } = req.params;
    const { tags, note } = req.body;
    const userId = req.user.id;

    const favorite = await AiChatFavorite.findOne({
      _id: id,
      user: userId
    });

    if (!favorite) {
      return res.status(404).json({
        success: false,
        message: 'المفضلة غير موجودة'
      });
    }

    if (tags !== undefined) favorite.tags = tags;
    if (note !== undefined) favorite.note = note;

    await favorite.save();

    return res.status(200).json({
      success: true,
      message: 'تم تحديث المفضلة بنجاح',
      data: favorite
    });

  } catch (error) {
    console.error('Error updating favorite:', error);
    return res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء تحديث المفضلة'
    });
  }
};

/**
 * @desc    Delete favorite
 * @route   DELETE /api/ai-chat/favorites/:id
 * @access  Private (Teacher & Student)
 */
const deleteFavorite = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const favorite = await AiChatFavorite.findOneAndDelete({
      _id: id,
      user: userId
    });

    if (!favorite) {
      return res.status(404).json({
        success: false,
        message: 'المفضلة غير موجودة'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'تم حذف المفضلة بنجاح'
    });

  } catch (error) {
    console.error('Error deleting favorite:', error);
    return res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء حذف المفضلة'
    });
  }
};

/**
 * @desc    Get all unique tags for user
 * @route   GET /api/ai-chat/favorites/tags
 * @access  Private (Teacher & Student)
 */
const getTags = async (req, res) => {
  try {
    const userId = req.user.id;

    // 🔒 إصلاح: استخدام new مع ObjectId (Mongoose 7+ compatible)
    const tags = await AiChatFavorite.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId) } },
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 50 } // 🔒 حد أقصى
    ]);

    return res.status(200).json({
      success: true,
      data: tags.map(t => ({ name: t._id, count: t.count }))
    });

  } catch (error) {
    console.error('Error getting tags:', error);
    return res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء جلب العلامات'
    });
  }
};

module.exports = {
  addFavorite,
  getFavorites,
  updateFavorite,
  deleteFavorite,
  getTags
};
