const redis = require('redis');

// Create Redis client
const redisClient = redis.createClient({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  retry_strategy: (options) => {
    if (options.error && options.error.code === 'ECONNREFUSED') {
      console.log('⚠️ Redis connection refused - running without cache');
      return undefined; // Don't retry
    }
    if (options.total_retry_time > 1000 * 60 * 60) {
      return new Error('Redis retry time exhausted');
    }
    if (options.attempt > 10) {
      return undefined;
    }
    return Math.min(options.attempt * 100, 3000);
  }
});

// Redis connection events
redisClient.on('connect', () => {
  console.log('✅ Redis connected successfully');
});

redisClient.on('error', (err) => {
  console.log('⚠️ Redis error:', err.message);
  console.log('📝 Running without cache - all requests will hit database');
});

redisClient.on('end', () => {
  console.log('🔴 Redis connection closed');
});

// Helper functions
const cache = {
  /**
   * Get value from cache
   */
  get: async (key) => {
    if (!redisClient.connected) return null;
    
    try {
      return new Promise((resolve, reject) => {
        redisClient.get(key, (err, data) => {
          if (err) {
            console.log(`⚠️ Cache GET error for key ${key}:`, err.message);
            resolve(null);
          } else {
            resolve(data ? JSON.parse(data) : null);
          }
        });
      });
    } catch (error) {
      console.log(`⚠️ Cache GET error for key ${key}:`, error.message);
      return null;
    }
  },

  /**
   * Set value in cache with expiration (in seconds)
   */
  set: async (key, value, expirationInSeconds = 300) => {
    if (!redisClient.connected) return false;
    
    try {
      return new Promise((resolve, reject) => {
        redisClient.setex(key, expirationInSeconds, JSON.stringify(value), (err) => {
          if (err) {
            console.log(`⚠️ Cache SET error for key ${key}:`, err.message);
            resolve(false);
          } else {
            resolve(true);
          }
        });
      });
    } catch (error) {
      console.log(`⚠️ Cache SET error for key ${key}:`, error.message);
      return false;
    }
  },

  /**
   * Delete value from cache
   */
  del: async (key) => {
    if (!redisClient.connected) return false;
    
    try {
      return new Promise((resolve, reject) => {
        redisClient.del(key, (err) => {
          if (err) {
            console.log(`⚠️ Cache DEL error for key ${key}:`, err.message);
            resolve(false);
          } else {
            resolve(true);
          }
        });
      });
    } catch (error) {
      console.log(`⚠️ Cache DEL error for key ${key}:`, error.message);
      return false;
    }
  },

  /**
   * Delete all keys matching pattern
   */
  delPattern: async (pattern) => {
    if (!redisClient.connected) return false;
    
    try {
      return new Promise((resolve, reject) => {
        redisClient.keys(pattern, (err, keys) => {
          if (err || !keys || keys.length === 0) {
            resolve(false);
            return;
          }
          
          redisClient.del(...keys, (delErr) => {
            if (delErr) {
              console.log(`⚠️ Cache DEL pattern error for ${pattern}:`, delErr.message);
              resolve(false);
            } else {
              console.log(`🗑️ Deleted ${keys.length} cache keys matching ${pattern}`);
              resolve(true);
            }
          });
        });
      });
    } catch (error) {
      console.log(`⚠️ Cache DEL pattern error for ${pattern}:`, error.message);
      return false;
    }
  },

  /**
   * Check if Redis is connected
   */
  isConnected: () => {
    return redisClient.connected || false;
  }
};

module.exports = { redisClient, cache };
