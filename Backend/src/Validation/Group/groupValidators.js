// Group Validation using express-validator
const { body, param, query, validationResult } = require('express-validator');

/**
 * Middleware للتحقق من نتائج الـ validation
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const formattedErrors = {};
    errors.array().forEach(error => {
      formattedErrors[error.path] = error.msg;
    });
    
    return res.status(400).json({
      success: false,
      message: 'بيانات غير صحيحة',
      errors: formattedErrors,
    });
  }
  
  next();
};

/**
 * Validation rules لإنشاء حلقة جديدة
 */
const createGroupValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('اسم الحلقة مطلوب')
    .isLength({ min: 2, max: 100 }).withMessage('اسم الحلقة يجب أن يكون بين 2 و 100 حرف')
    .matches(/^[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF\s\d\-'\.]+$/)
    .withMessage('اسم الحلقة يجب أن يحتوي على أحرف عربية وأرقام فقط'),

  body('teacher')
    .optional({ nullable: true })
    .trim()
    .custom((value) => {
      if (!value) return true;
      // قبول ObjectId أو teacher ID أو اسم المعلم
      const isObjectId = /^[0-9a-fA-F]{24}$/.test(value);
      const isTeacherId = /^\d{8}$/.test(value);
      const isArabicName = /^[\u0600-\u06FF\s\-'\.]+$/.test(value) && value.length >= 2;
      
      if (!isObjectId && !isTeacherId && !isArabicName) {
        throw new Error('معرف المعلم غير صحيح');
      }
      return true;
    }),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('الوصف يجب ألا يتجاوز 500 حرف'),

  body('capacity')
    .optional()
    .isInt({ min: 1, max: 50 }).withMessage('السعة يجب أن تكون بين 1 و 50 طالب')
    .toInt(),

  body('schedule')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('الجدول الزمني يجب ألا يتجاوز 100 حرف')
    .matches(/^[\u0600-\u06FF\s0-9:-]*$/).withMessage('صيغة الجدول غير صحيحة'),

  body('isActive')
    .optional()
    .isBoolean().withMessage('حالة الحلقة يجب أن تكون true أو false')
    .toBoolean(),

  handleValidationErrors,
];

/**
 * Validation rules لتحديث حلقة
 */
const updateGroupValidation = [
  param('id')
    .isMongoId().withMessage('معرف الحلقة غير صحيح'),

  body('name')
    .optional()
    .trim()
    .notEmpty().withMessage('اسم الحلقة لا يمكن أن يكون فارغاً')
    .isLength({ min: 2, max: 100 }).withMessage('اسم الحلقة يجب أن يكون بين 2 و 100 حرف')
    .matches(/^[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF\s\d\-'\.]+$/)
    .withMessage('اسم الحلقة يجب أن يحتوي على أحرف عربية وأرقام فقط'),

  body('teacher')
    .optional({ nullable: true })
    .trim()
    .custom((value) => {
      if (!value) return true;
      const isObjectId = /^[0-9a-fA-F]{24}$/.test(value);
      const isTeacherId = /^\d{8}$/.test(value);
      const isArabicName = /^[\u0600-\u06FF\s\-'\.]+$/.test(value) && value.length >= 2;
      
      if (!isObjectId && !isTeacherId && !isArabicName) {
        throw new Error('معرف المعلم غير صحيح');
      }
      return true;
    }),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('الوصف يجب ألا يتجاوز 500 حرف'),

  body('capacity')
    .optional()
    .isInt({ min: 1, max: 50 }).withMessage('السعة يجب أن تكون بين 1 و 50 طالب')
    .toInt(),

  body('schedule')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('الجدول الزمني يجب ألا يتجاوز 100 حرف')
    .matches(/^[\u0600-\u06FF\s0-9:-]*$/).withMessage('صيغة الجدول غير صحيحة'),

  body('isActive')
    .optional()
    .isBoolean().withMessage('حالة الحلقة يجب أن تكون true أو false')
    .toBoolean(),

  handleValidationErrors,
];

/**
 * Validation rules لحذف حلقة
 */
const deleteGroupValidation = [
  param('id')
    .isMongoId().withMessage('معرف الحلقة غير صحيح'),

  handleValidationErrors,
];

/**
 * Validation rules لجلب حلقة بالمعرف
 */
const getGroupByIdValidation = [
  param('id')
    .isMongoId().withMessage('معرف الحلقة غير صحيح'),

  handleValidationErrors,
];

/**
 * Validation rules لجلب طلاب حلقة
 */
const getGroupStudentsValidation = [
  param('id')
    .isMongoId().withMessage('معرف الحلقة غير صحيح'),

  query('includeDetails')
    .optional()
    .isIn(['true', 'false']).withMessage('includeDetails يجب أن تكون true أو false'),

  handleValidationErrors,
];

/**
 * Validation rules لإعادة تسمية حلقة
 */
const renameGroupValidation = [
  body('oldName')
    .trim()
    .notEmpty().withMessage('الاسم القديم للحلقة مطلوب')
    .isLength({ min: 2, max: 100 }).withMessage('الاسم القديم يجب أن يكون بين 2 و 100 حرف'),

  body('newName')
    .trim()
    .notEmpty().withMessage('الاسم الجديد للحلقة مطلوب')
    .isLength({ min: 2, max: 100 }).withMessage('الاسم الجديد يجب أن يكون بين 2 و 100 حرف')
    .matches(/^[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF\s\d\-'\.]+$/)
    .withMessage('الاسم الجديد يجب أن يحتوي على أحرف عربية وأرقام فقط')
    .custom((value, { req }) => {
      if (value === req.body.oldName) {
        throw new Error('الاسم الجديد يجب أن يكون مختلفاً عن الاسم القديم');
      }
      return true;
    }),

  handleValidationErrors,
];

/**
 * Validation rules لجلب حلقات المعلم بفلاتر
 */
const getGroupsByTeacherIdValidation = [
  param('teacherId')
    .isMongoId().withMessage('معرف المعلم غير صحيح'),

  query('filter')
    .optional()
    .isIn(['all', 'withStudents', 'withoutStudents'])
    .withMessage('filter يجب أن يكون: all, withStudents, أو withoutStudents'),

  query('includeStudents')
    .optional()
    .isIn(['true', 'false']).withMessage('includeStudents يجب أن تكون true أو false'),

  handleValidationErrors,
];

module.exports = {
  createGroupValidation,
  updateGroupValidation,
  deleteGroupValidation,
  getGroupByIdValidation,
  getGroupStudentsValidation,
  renameGroupValidation,
  getGroupsByTeacherIdValidation,
  handleValidationErrors,
};
