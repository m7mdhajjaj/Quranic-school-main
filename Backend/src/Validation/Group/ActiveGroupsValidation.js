// ============================================
// ACTIVE GROUPS VALIDATION
// ============================================
// Validation للتحقق من صحة query parameters لجلب الحلقات النشطة

const { query } = require("express-validator");

/**
 * التحقق من صحة معاملات الاستعلام لجلب الحلقات النشطة
 * يتحقق من معرف المعلم ونوع البيانات المطلوبة
 */
const validateActiveGroupsQuery = [
  query("teacherId")
    .notEmpty()
    .withMessage("معرف المعلم مطلوب")
    .isMongoId()
    .withMessage("معرف المعلم غير صالح"),
  query("type")
    .optional()
    .isIn(["basic", "detailed"])
    .withMessage('نوع البيانات يجب أن يكون "basic" أو "detailed"'),
];

module.exports = {
  validateActiveGroupsQuery,
};
