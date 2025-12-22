/**
 * ============================================================================
 * Authentication Middleware Index
 * نقطة التصدير المركزية لجميع middleware المصادقة
 * ============================================================================
 * 
 * البنية:
 * - protect.middleware.js: المصادقة الأساسية بواسطة JWT
 * - role.middleware.js: التحقق من الصلاحيات حسب الدور (teacher, admin, restrictAdmin)
 */

const { protect } = require("./protect.middleware");
const { teacherProtect, adminProtect, restrictAdmin } = require("./role.middleware");

module.exports = {
  // Core authentication - المصادقة الأساسية
  protect,
  
  // Role-based authorization - التحقق من الصلاحيات
  teacherProtect,
  adminProtect,
  restrictAdmin,
};
