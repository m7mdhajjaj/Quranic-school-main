/**
 * ============================================================================
 * Cache Client - عميل التخزين المؤقت
 * ============================================================================
 * 
 * @deprecated استخدم require('../../config/redis') بدلاً من هذا الملف
 * 
 * هذا الملف موجود للتوافق مع الكود القديم
 * يُعيد تصدير الوظائف من ملف Redis الجديد
 */

const { cache, initializeRedis, isRedisConnected } = require('../../config/redis');

// Re-export for backward compatibility
module.exports = {
  cache,
  redisClient: null, // Deprecated - use cache methods instead
  initializeRedis,
  isRedisConnected,
};
