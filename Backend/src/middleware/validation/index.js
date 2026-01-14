/**
 * ============================================================================
 * Validation Middleware Index
 * نقطة التصدير المركزية لـ Validation Middleware
 * ============================================================================
 */

const {
  validate,
  validateMultiple,
  sanitizeInput,
  requireFields,
} = require('./validate.middleware');

module.exports = {
  validate,
  validateMultiple,
  sanitizeInput,
  requireFields,
};
