// ============================================
// GROUP STATS VALIDATION
// ============================================
// Validation للتحقق من صحة parameters لجلب إحصائيات الحلقة

const { param, query } = require("express-validator");

/**
 * التحقق من صحة معاملات جلب إحصائيات الحلقة
 */
const validateGroupStats = [
  param("groupName")
    .notEmpty()
    .withMessage("اسم الحلقة مطلوب")
    .trim(),
  query("month")
    .optional()
    .isInt({ min: 1, max: 12 })
    .withMessage("الشهر يجب أن يكون رقماً بين 1 و 12"),
  query("year")
    .optional()
    .isInt({ min: 2000, max: 2100 })
    .withMessage("السنة يجب أن تكون رقماً بين 2000 و 2100"),
];

module.exports = {
  validateGroupStats,
};
