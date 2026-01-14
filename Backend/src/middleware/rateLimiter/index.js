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
  
  // Factory function
  createRateLimiter,
};
