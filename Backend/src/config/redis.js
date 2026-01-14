/**
 * ============================================================================
 * Redis Cache Client - عميل Redis للتخزين المؤقت
 * ============================================================================
 * 
 * عميل Redis محسّن مع:
 * - دعم Redis v5+ (async/await)
 * - إعادة الاتصال التلقائي
 * - Graceful degradation عند عدم توفر Redis
 * - دعم الأنماط والمفاتيح المتعددة
 */

const { createClient } = require('redis');

// ============================================================================
// REDIS CLIENT CONFIGURATION
// ============================================================================

const REDIS_CONFIG = {
  url: process.env.REDIS_URL || `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}`,
  password: process.env.REDIS_PASSWORD || undefined,
  socket: {
    connectTimeout: 10000,
    reconnectStrategy: (retries) => {
      if (retries > 10) {
        console.log('⚠️ Redis: Max reconnection attempts reached');
        return false;
      }
      // Exponential backoff: 100ms, 200ms, 400ms, ... max 3s
      return Math.min(retries * 100, 3000);
    }
  }
};

// ============================================================================
// REDIS CLIENT INSTANCE
// ============================================================================

let redisClient = null;
let isConnected = false;

/**
 * تهيئة اتصال Redis
 */
const initializeRedis = async () => {
  try {
    redisClient = createClient(REDIS_CONFIG);

    // Event handlers
    redisClient.on('connect', () => {
      console.log('🔄 Redis: Connecting...');
    });

    redisClient.on('ready', () => {
      isConnected = true;
      console.log('✅ Redis: Connected and ready');
    });

    redisClient.on('error', (err) => {
      console.log('⚠️ Redis Error:', err.message);
      isConnected = false;
    });

    redisClient.on('end', () => {
      console.log('🔴 Redis: Connection closed');
      isConnected = false;
    });

    redisClient.on('reconnecting', () => {
      console.log('🔄 Redis: Reconnecting...');
    });

    await redisClient.connect();
    return true;
  } catch (error) {
    console.log('⚠️ Redis: Failed to connect -', error.message);
    console.log('📝 Running without cache - all requests will hit database');
    isConnected = false;
    return false;
  }
};

// ============================================================================
// CACHE HELPER FUNCTIONS
// ============================================================================

const cache = {
  /**
   * الحصول على قيمة من Cache
   * @param {string} key - المفتاح
   * @returns {Promise<any>} - القيمة أو null
   */
  get: async (key) => {
    if (!isConnected || !redisClient) return null;
    
    try {
      const data = await redisClient.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.log(`⚠️ Cache GET error [${key}]:`, error.message);
      return null;
    }
  },

  /**
   * حفظ قيمة في Cache مع TTL
   * @param {string} key - المفتاح
   * @param {any} value - القيمة
   * @param {number} ttl - وقت الانتهاء بالثواني (افتراضي: 5 دقائق)
   * @returns {Promise<boolean>}
   */
  set: async (key, value, ttl = 300) => {
    if (!isConnected || !redisClient) return false;
    
    try {
      await redisClient.setEx(key, ttl, JSON.stringify(value));
      return true;
    } catch (error) {
      console.log(`⚠️ Cache SET error [${key}]:`, error.message);
      return false;
    }
  },

  /**
   * حذف مفتاح من Cache
   * @param {string} key - المفتاح
   * @returns {Promise<boolean>}
   */
  del: async (key) => {
    if (!isConnected || !redisClient) return false;
    
    try {
      await redisClient.del(key);
      return true;
    } catch (error) {
      console.log(`⚠️ Cache DEL error [${key}]:`, error.message);
      return false;
    }
  },

  /**
   * حذف مفاتيح متعددة
   * @param {string[]} keys - المفاتيح
   * @returns {Promise<boolean>}
   */
  delMany: async (keys) => {
    if (!isConnected || !redisClient || !keys.length) return false;
    
    try {
      await redisClient.del(keys);
      return true;
    } catch (error) {
      console.log(`⚠️ Cache DEL MANY error:`, error.message);
      return false;
    }
  },

  /**
   * حذف مفاتيح بنمط معين
   * @param {string} pattern - النمط (مثال: "cache:users:*")
   * @returns {Promise<number>} - عدد المفاتيح المحذوفة
   */
  delPattern: async (pattern) => {
    if (!isConnected || !redisClient) return 0;
    
    try {
      const keys = [];
      for await (const key of redisClient.scanIterator({ MATCH: pattern, COUNT: 100 })) {
        keys.push(key);
      }
      
      if (keys.length > 0) {
        await redisClient.del(keys);
        console.log(`🗑️ Cache: Deleted ${keys.length} keys matching [${pattern}]`);
      }
      
      return keys.length;
    } catch (error) {
      console.log(`⚠️ Cache DEL PATTERN error [${pattern}]:`, error.message);
      return 0;
    }
  },

  /**
   * الحصول على قيمة أو تنفيذ callback وحفظها
   * @param {string} key - المفتاح
   * @param {Function} callback - الدالة لتنفيذها إذا لم توجد القيمة
   * @param {number} ttl - وقت الانتهاء بالثواني
   * @returns {Promise<any>}
   */
  getOrSet: async (key, callback, ttl = 300) => {
    // Try to get from cache first
    const cached = await cache.get(key);
    if (cached !== null) {
      return cached;
    }

    // Execute callback and cache result
    const result = await callback();
    if (result !== null && result !== undefined) {
      await cache.set(key, result, ttl);
    }
    
    return result;
  },

  /**
   * التحقق من وجود مفتاح
   * @param {string} key - المفتاح
   * @returns {Promise<boolean>}
   */
  exists: async (key) => {
    if (!isConnected || !redisClient) return false;
    
    try {
      const result = await redisClient.exists(key);
      return result === 1;
    } catch (error) {
      return false;
    }
  },

  /**
   * زيادة قيمة رقمية
   * @param {string} key - المفتاح
   * @param {number} increment - مقدار الزيادة
   * @returns {Promise<number>}
   */
  incr: async (key, increment = 1) => {
    if (!isConnected || !redisClient) return 0;
    
    try {
      return await redisClient.incrBy(key, increment);
    } catch (error) {
      console.log(`⚠️ Cache INCR error [${key}]:`, error.message);
      return 0;
    }
  },

  /**
   * تعيين TTL جديد للمفتاح
   * @param {string} key - المفتاح
   * @param {number} ttl - وقت الانتهاء بالثواني
   * @returns {Promise<boolean>}
   */
  expire: async (key, ttl) => {
    if (!isConnected || !redisClient) return false;
    
    try {
      return await redisClient.expire(key, ttl);
    } catch (error) {
      return false;
    }
  },

  /**
   * الحصول على الوقت المتبقي للمفتاح
   * @param {string} key - المفتاح
   * @returns {Promise<number>} - الثواني المتبقية أو -1 إذا لا يوجد انتهاء
   */
  ttl: async (key) => {
    if (!isConnected || !redisClient) return -2;
    
    try {
      return await redisClient.ttl(key);
    } catch (error) {
      return -2;
    }
  },

  /**
   * مسح كل الـ Cache
   * @returns {Promise<boolean>}
   */
  flushAll: async () => {
    if (!isConnected || !redisClient) return false;
    
    try {
      await redisClient.flushAll();
      console.log('🗑️ Cache: Flushed all keys');
      return true;
    } catch (error) {
      console.log(`⚠️ Cache FLUSH error:`, error.message);
      return false;
    }
  },

  /**
   * التحقق من اتصال Redis
   * @returns {boolean}
   */
  isConnected: () => isConnected,

  /**
   * الحصول على إحصائيات
   * @returns {Promise<Object>}
   */
  getStats: async () => {
    if (!isConnected || !redisClient) {
      return { connected: false };
    }
    
    try {
      const info = await redisClient.info('stats');
      const memory = await redisClient.info('memory');
      const keyspace = await redisClient.info('keyspace');
      
      return {
        connected: true,
        stats: info,
        memory,
        keyspace
      };
    } catch (error) {
      return { connected: true, error: error.message };
    }
  }
};

// ============================================================================
// GRACEFUL SHUTDOWN
// ============================================================================

const closeRedis = async () => {
  if (redisClient && isConnected) {
    try {
      await redisClient.quit();
      console.log('👋 Redis: Connection closed gracefully');
    } catch (error) {
      console.log('⚠️ Redis: Error closing connection -', error.message);
    }
  }
};

// Handle process termination
process.on('SIGINT', closeRedis);
process.on('SIGTERM', closeRedis);

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
  initializeRedis,
  closeRedis,
  cache,
  redisClient: () => redisClient,
  isRedisConnected: () => isConnected
};
