/**
 * ============================================================================
 * Middleware Index - نقطة التصدير المركزية لجميع Middleware
 * ============================================================================
 * 
 * هذا الملف يوفر نقطة وصول موحدة لجميع middleware في التطبيق
 * يسهل استيراد واستخدام جميع middleware بشكل منظم
 */

// ==================== Authentication Middleware ====================
const auth = require('./auth');

// ==================== Error Handling Middleware ====================
const { 
  asyncHandler, 
  globalErrorHandler, 
  notFound, 
  AppError 
} = require('./errorHandler');

// ==================== Cache Middleware ====================
const { 
  cacheMiddleware, 
  invalidateCache 
} = require('./cacheMiddleware');

// ==================== Export All Middleware ====================
module.exports = {
  // Authentication & Authorization
  ...auth,
  
  // Error Handling
  asyncHandler,
  globalErrorHandler,
  notFound,
  AppError,
  
  // Caching
  cacheMiddleware,
  invalidateCache,
};
