// ============================================================================
// Validation/Warning/warningValidation.js - Warning Validation
// ============================================================================

const { body, param, validationResult } = require("express-validator");

/**
 * Validation middleware للتحقق من صحة البيانات
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "خطأ في البيانات المدخلة",
      errors: errors.array().map((err) => ({
        field: err.path,
        message: err.msg,
      })),
    });
  }
  next();
};

/**
 * Validation rules لإنشاء إنذار
 */
const validateCreateWarning = [
  body("studentId")
    .trim()
    .notEmpty()
    .withMessage("معرف الطالب مطلوب")
    .isMongoId()
    .withMessage("معرف الطالب غير صحيح"),

  body("teacherId")
    .trim()
    .notEmpty()
    .withMessage("معرف المعلم مطلوب")
    .isMongoId()
    .withMessage("معرف المعلم غير صحيح"),

  body("groupName")
    .trim()
    .notEmpty()
    .withMessage("اسم الحلقة مطلوب")
    .isString()
    .withMessage("اسم الحلقة يجب أن يكون نص"),

  body("type")
    .trim()
    .notEmpty()
    .withMessage("نوع الإنذار مطلوب")
    .isIn(["warning", "first", "second", "third", "expulsion"])
    .withMessage("نوع الإنذار غير صحيح"),

  body("reason")
    .trim()
    .notEmpty()
    .withMessage("سبب الإنذار مطلوب")
    .isString()
    .withMessage("سبب الإنذار يجب أن يكون نص")
    .isLength({ min: 3, max: 500 })
    .withMessage("سبب الإنذار يجب أن يكون بين 3 و 500 حرف"),

  handleValidationErrors,
];

/**
 * Validation rules لحذف إنذار بالـ ID
 */
const validateDeleteWarning = [
  param("warningId")
    .trim()
    .notEmpty()
    .withMessage("معرف الإنذار مطلوب")
    .isMongoId()
    .withMessage("معرف الإنذار غير صحيح"),

  handleValidationErrors,
];

/**
 * Validation rules لحذف إنذار بالنوع
 */
const validateDeleteWarningByType = [
  param("studentId")
    .trim()
    .notEmpty()
    .withMessage("معرف الطالب مطلوب")
    .isMongoId()
    .withMessage("معرف الطالب غير صحيح"),

  param("warningType")
    .trim()
    .notEmpty()
    .withMessage("نوع الإنذار مطلوب")
    .isIn(["warning", "first", "second", "third", "expulsion"])
    .withMessage("نوع الإنذار غير صحيح"),

  handleValidationErrors,
];

/**
 * Validation rules لجلب إنذارات طالب
 */
const validateGetStudentWarnings = [
  param("studentId")
    .trim()
    .notEmpty()
    .withMessage("معرف الطالب مطلوب")
    .isMongoId()
    .withMessage("معرف الطالب غير صحيح"),

  handleValidationErrors,
];

/**
 * Validation rules لجلب إنذارات حلقة
 */
const validateGetGroupWarnings = [
  param("groupId")
    .trim()
    .notEmpty()
    .withMessage("معرف الحلقة مطلوب")
    .isMongoId()
    .withMessage("معرف الحلقة غير صحيح"),

  handleValidationErrors,
];

/**
 * Validation rules لحالة الطالب
 */
const validateCheckStudentStatus = [
  param("studentId")
    .trim()
    .notEmpty()
    .withMessage("معرف الطالب مطلوب")
    .isMongoId()
    .withMessage("معرف الطالب غير صحيح"),

  handleValidationErrors,
];

module.exports = {
  validateCreateWarning,
  validateDeleteWarning,
  validateDeleteWarningByType,
  validateGetStudentWarnings,
  validateGetGroupWarnings,
  validateCheckStudentStatus,
};
