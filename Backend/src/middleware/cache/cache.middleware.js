/**
 * ============================================================================
 * Cache Middleware - وسيط التخزين المؤقت المحسّن
 * ============================================================================
 * 
 * يستخدم Redis للتخزين المؤقت مع:
 * - دعم GET requests فقط
 * - مفاتيح ديناميكية
 * - Graceful degradation عند عدم توفر Redis
 * - إمكانية إبطال Cache بأنماط
 */

const { cache } = require('../../config/redis');
const { CACHE_TTL } = require('./cacheKeys');

/**
 * Cache Response Middleware
 * يخزن استجابات API في Redis
 * 
 * @param {Object} options - خيارات التخزين المؤقت
 * @param {number} options.ttl - مدة التخزين بالثواني (افتراضي: 5 دقائق)
 * @param {Function} options.keyGenerator - دالة لتوليد المفتاح (اختياري)
 * @param {boolean} options.useQueryParams - تضمين query params في المفتاح
 * @param {string[]} options.varyByHeaders - Headers للتنويع
 * @returns {Function} Express middleware
 * 
 * @example
 * // استخدام بسيط
 * router.get('/students', cacheResponse(), getStudents);
 * 
 * // مع TTL مخصص
 * router.get('/rankings', cacheResponse({ ttl: CACHE_TTL.SHORT }), getRankings);
 * 
 * // مع key generator مخصص
 * router.get('/students/:id', cacheResponse({ 
 *   keyGenerator: (req) => `students:${req.params.id}` 
 * }), getStudent);
 */
const cacheResponse = (options = {}) => {
  const {
    ttl = CACHE_TTL.DEFAULT,
    keyGenerator = null,
    useQueryParams = true,
    varyByHeaders = []
  } = options;

  return async (req, res, next) => {
    // Skip non-GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Skip if cache is not connected
    if (!cache.isConnected()) {
      return next();
    }

    try {
      // Generate cache key
      let cacheKey;
      
      if (keyGenerator && typeof keyGenerator === 'function') {
        cacheKey = keyGenerator(req);
      } else {
        // Default key generation
        let key = `api:${req.baseUrl}${req.path}`;
        
        // Include query params
        if (useQueryParams && Object.keys(req.query).length > 0) {
          const sortedQuery = Object.keys(req.query)
            .sort()
            .map(k => `${k}=${req.query[k]}`)
            .join('&');
          key += `?${sortedQuery}`;
        }
        
        // Include user role for personalized responses
        if (req.user?.role) {
          key += `:role:${req.user.role}`;
        }
        
        // Include specified headers
        for (const header of varyByHeaders) {
          const value = req.headers[header.toLowerCase()];
          if (value) {
            key += `:${header}:${value}`;
          }
        }
        
        cacheKey = key;
      }

      // Try to get from cache
      const cachedData = await cache.get(cacheKey);
      
      if (cachedData) {
        // Cache HIT
        res.set('X-Cache', 'HIT');
        res.set('X-Cache-Key', cacheKey);
        return res.json(cachedData);
      }

      // Cache MISS - intercept response
      res.set('X-Cache', 'MISS');
      
      const originalJson = res.json.bind(res);
      
      res.json = async (body) => {
        // Only cache successful responses
        if (body && body.success !== false && res.statusCode < 400) {
          cache.set(cacheKey, body, ttl).catch(err => {
            console.log(`⚠️ Cache save error:`, err.message);
          });
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
 * إبطال Cache بأنماط متعددة
 * 
 * @param {string|string[]} patterns - نمط أو أنماط المفاتيح
 * @returns {Function} Express middleware
 * 
 * @example
 * router.post('/students', invalidateCache('students:*'), createStudent);
 * router.put('/students/:id', invalidateCache(['students:*', 'rankings:*']), updateStudent);
 */
const invalidateCache = (patterns) => {
  return async (req, res, next) => {
    const originalJson = res.json.bind(res);
    
    res.json = async (body) => {
      // Invalidate cache after successful operation
      if (body && body.success !== false && res.statusCode < 400) {
        const patternsArray = Array.isArray(patterns) ? patterns : [patterns];
        
        for (const pattern of patternsArray) {
          // Replace dynamic parts in pattern
          let finalPattern = pattern
            .replace(':id', req.params.id || '*')
            .replace(':studentId', req.params.studentId || req.body?.studentId || '*')
            .replace(':groupId', req.params.groupId || req.body?.groupId || '*');
          
          cache.delPattern(finalPattern).catch(err => {
            console.log(`⚠️ Cache invalidation error:`, err.message);
          });
        }
      }
      
      return originalJson(body);
    };
    
    next();
  };
};

/**
 * إبطال Cache مباشرة (للاستخدام في Controllers)
 * 
 * @param {string|string[]} patterns - نمط أو أنماط المفاتيح
 * @returns {Promise<void>}
 */
const clearCache = async (patterns) => {
  if (!cache.isConnected()) return;
  
  const patternsArray = Array.isArray(patterns) ? patterns : [patterns];
  
  for (const pattern of patternsArray) {
    await cache.delPattern(pattern);
  }
};

/**
 * Middleware لمنع التخزين المؤقت
 * يستخدم للمسارات التي لا يجب أن تُخزن مؤقتاً
 */
const noCache = (req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  res.set('Surrogate-Control', 'no-store');
  next();
};

/**
 * Cache warmup - تسخين الـ Cache
 * يستخدم لتحميل البيانات الشائعة عند بدء التطبيق
 * 
 * @param {Object[]} warmupItems - عناصر التسخين
 * @returns {Promise<void>}
 */
const warmupCache = async (warmupItems) => {
  if (!cache.isConnected()) {
    console.log('⚠️ Cache warmup skipped - Redis not connected');
    return;
  }

  console.log('🔥 Starting cache warmup...');
  
  for (const item of warmupItems) {
    try {
      const data = await item.fetch();
      if (data) {
        await cache.set(item.key, data, item.ttl || CACHE_TTL.LONG);
        console.log(`   ✅ Warmed: ${item.key}`);
      }
    } catch (error) {
      console.log(`   ⚠️ Warmup failed for ${item.key}:`, error.message);
    }
  }
  
  console.log('🔥 Cache warmup complete');
};

/**
 * Legacy cacheMiddleware for backward compatibility
 * @deprecated استخدم cacheResponse بدلاً منه
 */
const cacheMiddleware = (duration = 300) => {
  return cacheResponse({ ttl: duration });
};

module.exports = {
  cacheResponse,
  cacheMiddleware,  // للتوافق مع الكود القديم
  invalidateCache,
  clearCache,
  noCache,
  warmupCache
};
