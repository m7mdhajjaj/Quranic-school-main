/**
 * ============================================================================
 * Cache Middleware - Middleware التخزين المؤقت
 * ============================================================================
 * 
 * يستخدم Redis للتخزين المؤقت لطلبات GET
 * يحسن الأداء عن طريق تقليل استعلامات قاعدة البيانات
 */

const { cache } = require('../utils/cache/redisClient');

/**
 * Cache middleware for GET requests
 * Middleware التخزين المؤقت لطلبات GET
 * 
 * @param {number} duration - Cache duration in seconds (default: 5 minutes)
 * @returns {Function} Express middleware function
 * 
 * الوظائف:
 * - يعمل فقط على طلبات GET
 * - يتحقق من وجود البيانات في Cache
 * - يحفظ الاستجابة الناجحة في Cache
 * - يتجاوز العملية إذا Redis غير متصل
 */
const cacheMiddleware = (duration = 300) => {
  return async (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Skip if Redis is not connected
    if (!cache.isConnected()) {
      return next();
    }

    try {
      // Generate cache key from URL and query params
      const cacheKey = `cache:${req.originalUrl || req.url}`;
      
      // Try to get from cache
      const cachedData = await cache.get(cacheKey);
      
      if (cachedData) {
        console.log(`✅ Cache HIT: ${cacheKey}`);
        return res.json(cachedData);
      }

      console.log(`❌ Cache MISS: ${cacheKey}`);

      // Store original res.json function
      const originalJson = res.json.bind(res);

      // Override res.json to cache the response
      res.json = (body) => {
        // Only cache successful responses
        if (body && body.success !== false) {
          cache.set(cacheKey, body, duration)
            .then(() => console.log(`💾 Cached: ${cacheKey} for ${duration}s`))
            .catch(err => console.log(`⚠️ Cache save error:`, err.message));
        }
        
        return originalJson(body);
      };

      next();
    } catch (error) {
      console.log('⚠️ Cache middleware error:', error.message);
      next();
    }
  };
};

/**
 * Invalidate cache by pattern
 */
const invalidateCache = async (pattern) => {
  try {
    await cache.delPattern(pattern);
    console.log(`🗑️ Cache invalidated: ${pattern}`);
  } catch (error) {
    console.log('⚠️ Cache invalidation error:', error.message);
  }
};

module.exports = { cacheMiddleware, invalidateCache };
