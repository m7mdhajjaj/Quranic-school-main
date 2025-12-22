/**
 * ============================================================================
 * Rate Limiter Index
 * ============================================================================
 */

const { apiLimiter, messageLimiter } = require('./rateLimiter.middleware');

module.exports = {
  apiLimiter,
  messageLimiter,
};
