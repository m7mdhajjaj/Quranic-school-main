const { body, param, query, validationResult } = require('express-validator');

/**
 * 🔒 AI Chat Validation - التحقق الصارم للشات بوت
 * Strict validation for Tafsir AI system
 */

// ═══════════════════════════════════════════════════════════════════════════
// 🛡️ Error Handler Middleware
// ═══════════════════════════════════════════════════════════════════════════

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'خطأ في البيانات المدخلة',
      errors: errors.array().map(e => e.msg)
    });
  }
  next();
};

// ═══════════════════════════════════════════════════════════════════════════
// 💬 Chat Message Validation
// ═══════════════════════════════════════════════════════════════════════════

const validateChatMessage = [
  body('message')
    .trim()
    .notEmpty().withMessage('الرسالة مطلوبة')
    .isLength({ min: 2, max: 2000 }).withMessage('الرسالة يجب أن تكون بين 2 و 2000 حرف'),
  handleValidationErrors
];

// ═══════════════════════════════════════════════════════════════════════════
// 🔊 TTS (Text-to-Speech) Validation
// ═══════════════════════════════════════════════════════════════════════════

const validateTTS = [
  body('text')
    .trim()
    .notEmpty().withMessage('النص مطلوب')
    .isLength({ min: 5, max: 4096 }).withMessage('النص يجب أن يكون بين 5 و 4096 حرف'),
  handleValidationErrors
];

// ═══════════════════════════════════════════════════════════════════════════
// 🎤 Transcribe Audio Validation
// ═══════════════════════════════════════════════════════════════════════════

const validateTranscribe = [
  // Audio file is checked via multer middleware
  // This just validates any additional fields
  handleValidationErrors
];

// ═══════════════════════════════════════════════════════════════════════════
// ⭐ Favorites Validation
// ═══════════════════════════════════════════════════════════════════════════

// Validation for adding favorite
const validateAddFavorite = [
  body('question')
    .trim()
    .notEmpty().withMessage('السؤال مطلوب')
    .isLength({ min: 3, max: 1000 }).withMessage('السؤال يجب أن يكون بين 3 و 1000 حرف'),
  
  body('answer')
    .trim()
    .notEmpty().withMessage('الجواب مطلوب')
    .isLength({ min: 10 }).withMessage('الجواب يجب أن يكون 10 أحرف على الأقل'),
  
  body('tags')
    .optional()
    .isArray().withMessage('العلامات يجب أن تكون مصفوفة')
    .custom((tags) => {
      if (tags && tags.length > 10) {
        throw new Error('لا يمكن إضافة أكثر من 10 علامات');
      }
      return true;
    }),
  
  body('tags.*')
    .optional()
    .trim()
    .isLength({ min: 2, max: 30 }).withMessage('كل علامة يجب أن تكون بين 2 و 30 حرف'),
  
  body('note')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('الملاحظة يجب ألا تتجاوز 500 حرف'),
  
  handleValidationErrors
];

// Validation for updating favorite
const validateUpdateFavorite = [
  param('id')
    .isMongoId().withMessage('معرف غير صالح'),
  
  body('tags')
    .optional()
    .isArray().withMessage('العلامات يجب أن تكون مصفوفة')
    .custom((tags) => {
      if (tags && tags.length > 10) {
        throw new Error('لا يمكن إضافة أكثر من 10 علامات');
      }
      return true;
    }),
  
  body('tags.*')
    .optional()
    .trim()
    .isLength({ min: 2, max: 30 }).withMessage('كل علامة يجب أن تكون بين 2 و 30 حرف'),
  
  body('note')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('الملاحظة يجب ألا تتجاوز 500 حرف'),
  
  handleValidationErrors
];

// Validation for deleting favorite
const validateDeleteFavorite = [
  param('id')
    .isMongoId().withMessage('معرف غير صالح'),
  handleValidationErrors
];

// Validation for getting favorites
const validateGetFavorites = [
  query('search')
    .optional()
    .trim()
    .isLength({ min: 2, max: 200 }).withMessage('البحث يجب أن يكون بين 2 و 200 حرف'),
  
  query('tag')
    .optional()
    .trim()
    .isLength({ min: 2, max: 30 }).withMessage('العلامة يجب أن تكون بين 2 و 30 حرف'),
  
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('رقم الصفحة يجب أن يكون رقماً صحيحاً أكبر من 0')
    .toInt(),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('الحد يجب أن يكون بين 1 و 100')
    .toInt(),
  
  handleValidationErrors
];

// ═══════════════════════════════════════════════════════════════════════════
// 📤 Module Exports
// ═══════════════════════════════════════════════════════════════════════════

module.exports = {
  // Chat
  validateChatMessage,
  validateTTS,
  validateTranscribe,
  
  // Favorites
  validateAddFavorite,
  validateUpdateFavorite,
  validateDeleteFavorite,
  validateGetFavorites,
  
  // Error Handler
  handleValidationErrors
};
