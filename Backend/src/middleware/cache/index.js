/**
 * ============================================================================
 * Cache Middleware Index
 * نقطة التصدير المركزية لـ Cache Middleware
 * ============================================================================
 */

const {
  cacheResponse,
  cacheMiddleware,
  invalidateCache,
  clearCache,
  noCache,
  warmupCache
} = require('./cache.middleware');

const { CACHE_KEYS, CACHE_TTL } = require('./cacheKeys');

module.exports = {
  // Middleware
  cacheResponse,
  cacheMiddleware,
  invalidateCache,
  clearCache,
  noCache,
  warmupCache,
  
  // Constants
  CACHE_KEYS,
  CACHE_TTL,
};
