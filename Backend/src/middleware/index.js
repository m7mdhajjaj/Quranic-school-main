/**
 * ============================================================================
 * Middleware Index - نقطة التصدير المركزية لجميع Middleware
 * ============================================================================
 * 
 * هذا الملف يوفر نقطة وصول موحدة لجميع middleware في التطبيق
 * يسهل استيراد واستخدام جميع middleware بشكل منظم
 * 
 * البنية:
 * - auth/          : المصادقة والصلاحيات
 * - validation/    : التحقق من صحة البيانات
 * - rateLimiter/   : محدد معدل الطلبات
 * - errorHandler/  : معالجة الأخطاء
 * - cache/         : التخزين المؤقت
 */

// ==================== Authentication & Authorization ====================
const auth = require('./auth');

// ==================== Validation ====================
const validation = require('./validation');

// ==================== Rate Limiting ====================
const rateLimiter = require('./rateLimiter');

// ==================== Error Handling ====================
const errorHandler = require('./errorHandler');

// ==================== Cache ====================
const cache = require('./cache');

// ==================== Export All Middleware ====================
module.exports = {
  // Authentication & Authorization
  ...auth,
  
  // Validation
  ...validation,
  
  // Rate Limiting
  ...rateLimiter,
  
  // Error Handling
  ...errorHandler,
  
  // Caching
  ...cache,
};
