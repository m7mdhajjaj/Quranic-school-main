// ============================================================================
// Validation/ReportValidation.js - Report Validation Functions
// ============================================================================

const { body, query, param, validationResult } = require("express-validator");

/**
 * Validate student marks query parameters
 */
const validateStudentMarksQuery = [
  query("studentId").optional().isMongoId().withMessage("معرف الطالب غير صحيح"),

  query("month")
    .optional()
    .isInt({ min: 1, max: 12 })
    .withMessage("الشهر يجب أن يكون بين 1 و 12"),

  query("year")
    .optional()
    .isInt({ min: 2020, max: 2030 })
    .withMessage("السنة يجب أن تكون بين 2020 و 2030"),
];

/**
 * Validate average marks query parameters
 */
const validateAverageMarksQuery = [
  query("groupName")
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("اسم الحلقة يجب أن يكون بين 1 و 100 حرف"),

  query("month")
    .optional()
    .isInt({ min: 1, max: 12 })
    .withMessage("الشهر يجب أن يكون بين 1 و 12"),

  query("year")
    .optional()
    .isInt({ min: 2020, max: 2030 })
    .withMessage("السنة يجب أن تكون بين 2020 و 2030"),
];

/**
 * Validate student report parameters
 */
const validateStudentReportParams = [
  param("studentId").isMongoId().withMessage("معرف الطالب غير صحيح"),

  query("startDate")
    .optional()
    .isISO8601()
    .withMessage("تاريخ البداية غير صحيح"),

  query("endDate").optional().isISO8601().withMessage("تاريخ النهاية غير صحيح"),
];

/**
 * Validate group report parameters
 */
const validateGroupReportParams = [
  param("groupId").isMongoId().withMessage("معرف المجموعة غير صحيح"),

  query("startDate")
    .optional()
    .isISO8601()
    .withMessage("تاريخ البداية غير صحيح"),

  query("endDate").optional().isISO8601().withMessage("تاريخ النهاية غير صحيح"),
];

/**
 * Validate export report parameters
 */
const validateExportReportParams = [
  param("id").isMongoId().withMessage("المعرف غير صحيح"),
];

/**
 * Custom validation for date range
 */
const validateDateRange = (req, res, next) => {
  const { startDate, endDate } = req.query;

  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start > end) {
      return res.status(400).json({
        success: false,
        message: "تاريخ البداية يجب أن يكون قبل تاريخ النهاية",
      });
    }

    // Check if date range is not too far in the future
    const maxFutureDate = new Date();
    maxFutureDate.setFullYear(maxFutureDate.getFullYear() + 1);

    if (end > maxFutureDate) {
      return res.status(400).json({
        success: false,
        message: "التاريخ لا يمكن أن يكون في المستقبل البعيد",
      });
    }
  }

  next();
};

/**
 * Handle validation errors
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((error) => error.msg);
    return res.status(400).json({
      success: false,
      message: "بيانات غير صحيحة",
      errors: errorMessages,
    });
  }

  next();
};

/**
 * Sanitize query parameters
 */
const sanitizeQueryParams = (req, res, next) => {
  // Sanitize month
  if (req.query.month) {
    const month = parseInt(req.query.month);
    req.query.month = Math.max(1, Math.min(12, month));
  }

  // Sanitize year
  if (req.query.year) {
    const year = parseInt(req.query.year);
    const currentYear = new Date().getFullYear();
    req.query.year = Math.max(2020, Math.min(currentYear + 5, year));
  }

  // Sanitize groupName
  if (req.query.groupName) {
    req.query.groupName = req.query.groupName.trim();
  }

  next();
};

module.exports = {
  validateStudentMarksQuery,
  validateAverageMarksQuery,
  validateStudentReportParams,
  validateGroupReportParams,
  validateExportReportParams,
  validateDateRange,
  handleValidationErrors,
  sanitizeQueryParams,
};
