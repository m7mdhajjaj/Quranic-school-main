/**
 * ============================================================================
 * Middleware Index - نقطة التصدير المركزية لجميع Middleware
 * ============================================================================
 * 
 * هذا الملف يوفر نقطة وصول موحدة لجميع middleware في التطبيق
 * يسهل استيراد واستخدام جميع middleware بشكل منظم
 * 
 * البنية:
 * ├── auth/          : المصادقة والصلاحيات
 * ├── validation/    : التحقق من صحة البيانات
 * ├── rateLimiter/   : محدد معدل الطلبات
 * ├── errorHandler/  : معالجة الأخطاء
 * ├── cache/         : التخزين المؤقت (Redis)
 * ├── security/      : وسيطات الأمان
 * └── logging/       : التسجيل والمراقبة
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

// ==================== Security ====================
const security = require('./security');

// ==================== Logging ====================
const logging = require('./logging');

// ==================== Export All Middleware ====================
module.exports = {
  // ============ Authentication & Authorization ============
  // Core authentication
  protect: auth.protect,
  
  // Role-based authorization
  teacherProtect: auth.teacherProtect,
  adminProtect: auth.adminProtect,
  secretaryProtect: auth.secretaryProtect,
  secretaryOrAdminProtect: auth.secretaryOrAdminProtect,
  staffProtect: auth.staffProtect,
  restrictAdmin: auth.restrictAdmin,

  // ============ Validation ============
  validate: validation.validate,
  validateMultiple: validation.validateMultiple,
  sanitizeInput: validation.sanitizeInput,
  requireFields: validation.requireFields,

  // ============ Rate Limiting ============
  authLimiter: rateLimiter.authLimiter,
  messageLimiter: rateLimiter.messageLimiter,
  apiLimiter: rateLimiter.apiLimiter,
  uploadLimiter: rateLimiter.uploadLimiter,
  passwordResetLimiter: rateLimiter.passwordResetLimiter,
  aiLimiter: rateLimiter.aiLimiter,
  strictLimiter: rateLimiter.strictLimiter,
  createRateLimiter: rateLimiter.createRateLimiter,

  // ============ Error Handling ============
  asyncHandler: errorHandler.asyncHandler,
  globalErrorHandler: errorHandler.globalErrorHandler,
  notFound: errorHandler.notFound,
  errorLogger: errorHandler.errorLogger,
  
  // Error Classes
  AppError: errorHandler.AppError,
  ValidationError: errorHandler.ValidationError,
  UnauthorizedError: errorHandler.UnauthorizedError,
  ForbiddenError: errorHandler.ForbiddenError,
  NotFoundError: errorHandler.NotFoundError,
  ConflictError: errorHandler.ConflictError,
  RateLimitError: errorHandler.RateLimitError,

  // ============ Caching ============
  cacheResponse: cache.cacheResponse,
  cacheMiddleware: cache.cacheMiddleware,
  invalidateCache: cache.invalidateCache,
  clearCache: cache.clearCache,
  noCache: cache.noCache,
  warmupCache: cache.warmupCache,
  CACHE_KEYS: cache.CACHE_KEYS,
  CACHE_TTL: cache.CACHE_TTL,

  // ============ Security ============
  sanitizeNoSQL: security.sanitizeNoSQL,
  preventHPP: security.preventHPP,
  limitRequestSize: security.limitRequestSize,
  blockSuspiciousUA: security.blockSuspiciousUA,
  securityHeaders: security.securityHeaders,
  ipFilter: security.ipFilter,
  requestId: security.requestId,

  // ============ Logging ============
  requestLogger: logging.requestLogger,
  performanceMonitor: logging.performanceMonitor,
  getMetrics: logging.getMetrics,
  correlationId: logging.correlationId,
  
  // ============ Grouped Exports (for convenience) ============
  auth,
  validation,
  rateLimiter,
  errorHandler,
  cache,
  security,
  logging,
};
