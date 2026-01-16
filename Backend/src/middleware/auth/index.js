/**
 * ============================================================================
 * Authentication Middleware Index
 * نقطة التصدير المركزية لجميع middleware المصادقة
 * ============================================================================
 * 
 * البنية:
 * - protect.middleware.js: المصادقة الأساسية بواسطة JWT
 * - role.middleware.js: التحقق من الصلاحيات حسب الدور (teacher, admin, secretary, restrictAdmin)
 */

const { protect } = require("./protect.middleware");
const { 
  teacherProtect, 
  adminProtect, 
  restrictAdmin,
  secretaryProtect,
  secretaryOrAdminProtect,
  staffProtect,
  secretaryGroupsAccess,
  secretaryTeachersAccess,
  secretaryStudentsAccess,
  secretaryTimetableAccess,
} = require("./role.middleware");

module.exports = {
  // Core authentication - المصادقة الأساسية
  protect,
  
  // Role-based authorization - التحقق من الصلاحيات
  teacherProtect,
  adminProtect,
  restrictAdmin,
  secretaryProtect,
  secretaryOrAdminProtect,
  staffProtect,
  
  // Secretary permissions - صلاحيات السكرتير
  secretaryGroupsAccess,
  secretaryTeachersAccess,
  secretaryStudentsAccess,
  secretaryTimetableAccess,
};
