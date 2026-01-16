/**
 * ============================================================================
 * Rate Limiter Index
 * نقطة التصدير المركزية لـ Rate Limiter Middleware
 * ============================================================================
 */

const {
  authLimiter,
  messageLimiter,
  apiLimiter,
  uploadLimiter,
  passwordResetLimiter,
  aiLimiter,
  strictLimiter,
  createLimiter,
  updateLimiter,
  deleteLimiter,
  createRateLimiter,
} = require('./rateLimiter.middleware');

module.exports = {
  // Pre-configured limiters
  authLimiter,
  messageLimiter,
  apiLimiter,
  uploadLimiter,
  passwordResetLimiter,
  aiLimiter,
  strictLimiter,
  
  // CRUD operation limiters
  createLimiter,
  updateLimiter,
  deleteLimiter,
  
  // Factory function
  createRateLimiter,
};
