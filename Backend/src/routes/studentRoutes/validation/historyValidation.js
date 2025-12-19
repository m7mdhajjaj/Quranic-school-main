// ============================================================================
// studentRoutes/validation/historyValidation.js - Student History Validation
// ============================================================================

const { param, query, validationResult } = require("express-validator");

/**
 * Validation middleware للتحقق من صحة البيانات
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log("❌ Validation Errors:", errors.array());
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
 * Validation rules لجلب تاريخ الطالب
 */
const validateGetStudentHistory = [
  param("studentId")
    .trim()
    .notEmpty()
    .withMessage("معرف الطالب مطلوب")
    .isMongoId()
    .withMessage("معرف الطالب غير صحيح"),

  query("eventType")
    .optional()
    .isIn(["WARNING", "WARNING_ESCALATION", "WARNING_REMOVAL", "SUSPENSION", "EXPULSION", "RESTORATION"])
    .withMessage("نوع الحدث غير صحيح"),

  query("startDate")
    .optional()
    .isISO8601()
    .withMessage("تاريخ البداية غير صحيح"),

  query("endDate")
    .optional()
    .isISO8601()
    .withMessage("تاريخ النهاية غير صحيح"),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 1000 })
    .withMessage("عدد النتائج يجب أن يكون بين 1 و 1000"),

  handleValidationErrors,
];

/**
 * Validation rules لجلب إحصائيات التاريخ
 */
const validateGetHistoryStats = [
  param("studentId")
    .trim()
    .notEmpty()
    .withMessage("معرف الطالب مطلوب")
    .isMongoId()
    .withMessage("معرف الطالب غير صحيح"),

  handleValidationErrors,
];

module.exports = {
  validateGetStudentHistory,
  validateGetHistoryStats,
};
