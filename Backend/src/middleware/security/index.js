/**
 * ============================================================================
 * Security Middleware Index
 * نقطة التصدير المركزية لـ Security Middleware
 * ============================================================================
 */

const {
  sanitizeNoSQL,
  preventHPP,
  limitRequestSize,
  blockSuspiciousUA,
  securityHeaders,
  ipFilter,
  requestId,
} = require('./security.middleware');

module.exports = {
  sanitizeNoSQL,
  preventHPP,
  limitRequestSize,
  blockSuspiciousUA,
  securityHeaders,
  ipFilter,
  requestId,
};
