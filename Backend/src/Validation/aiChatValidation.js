const { body, param, query } = require('express-validator');

// Validation for adding favorite
const validateAddFavorite = [
  body('question')
    .trim()
    .notEmpty().withMessage('السؤال مطلوب')
    .isLength({ min: 3, max: 1000 }).withMessage('السؤال يجب أن يكون بين 3 و 1000 حرف')
    .matches(/^[\u0600-\u06FF\s\w\d.,!?؟]+$/).withMessage('السؤال يحتوي على أحرف غير مسموحة'),
  
  body('answer')
    .trim()
    .notEmpty().withMessage('الجواب مطلوب')
    .isLength({ min: 10 }).withMessage('الجواب يجب أن يكون 10 أحرف على الأقل'),
  
  body('tags')
    .optional()
    .isArray().withMessage('العلامات يجب أن تكون مصفوفة')
    .custom((tags) => {
      if (tags.length > 10) {
        throw new Error('لا يمكن إضافة أكثر من 10 علامات');
      }
      return true;
    }),
  
  body('tags.*')
    .optional()
    .trim()
    .isLength({ min: 2, max: 30 }).withMessage('كل علامة يجب أن تكون بين 2 و 30 حرف')
    .matches(/^[\u0600-\u06FF\s\w]+$/).withMessage('العلامة تحتوي على أحرف غير مسموحة'),
  
  body('note')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('الملاحظة يجب ألا تتجاوز 500 حرف')
];

// Validation for updating favorite
const validateUpdateFavorite = [
  param('id')
    .isMongoId().withMessage('معرف غير صالح'),
  
  body('tags')
    .optional()
    .isArray().withMessage('العلامات يجب أن تكون مصفوفة')
    .custom((tags) => {
      if (tags.length > 10) {
        throw new Error('لا يمكن إضافة أكثر من 10 علامات');
      }
      return true;
    }),
  
  body('tags.*')
    .optional()
    .trim()
    .isLength({ min: 2, max: 30 }).withMessage('كل علامة يجب أن تكون بين 2 و 30 حرف')
    .matches(/^[\u0600-\u06FF\s\w]+$/).withMessage('العلامة تحتوي على أحرف غير مسموحة'),
  
  body('note')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('الملاحظة يجب ألا تتجاوز 500 حرف')
];

// Validation for deleting favorite
const validateDeleteFavorite = [
  param('id')
    .isMongoId().withMessage('معرف غير صالح')
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
    .isInt({ min: 1 }).withMessage('رقم الصفحة يجب أن يكون رقماً صحيحاً أكبر من 0'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('الحد يجب أن يكون بين 1 و 100')
];

// Validation for AI chat message
const validateChatMessage = [
  body('message')
    .trim()
    .notEmpty().withMessage('الرسالة مطلوبة')
    .isLength({ min: 3, max: 2000 }).withMessage('الرسالة يجب أن تكون بين 3 و 2000 حرف')
    .matches(/^[\u0600-\u06FF\s\w\d.,!?؟:؛]+$/).withMessage('الرسالة تحتوي على أحرف غير مسموحة')
];

module.exports = {
  validateAddFavorite,
  validateUpdateFavorite,
  validateDeleteFavorite,
  validateGetFavorites,
  validateChatMessage
};
