// ============================================================================
// NotificationCache.js - Redis Caching لنظام الإشعارات
// ============================================================================
// 
// ✅ تحسينات الأداء:
// - تخزين عدد الإشعارات غير المقروءة (TTL: 30 ثانية)
// - تخزين آخر الإشعارات (TTL: 60 ثانية)
// - إبطال ذكي عند إضافة/تحديث إشعار
// - دعم أعداد كبيرة من المستخدمين
// - Batch Operations لإرسال دفعي
// - ضغط البيانات للقوائم الكبيرة
// ============================================================================

const { cache } = require('../../config/redis');
const zlib = require('zlib');
const { promisify } = require('util');

// Promisify compression functions
const gzipAsync = promisify(zlib.gzip);
const gunzipAsync = promisify(zlib.gunzip);

// Compression threshold (bytes) - compress only if data is larger
const COMPRESSION_THRESHOLD = 1024; // 1KB

// ============================================================================
// Cache Keys
// ============================================================================

const CACHE_KEYS = {
  unreadCount: (userId) => `notifications:unread:${userId}`,
  stats: (userId) => `notifications:stats:${userId}`,
  recentList: (userId, limit) => `notifications:recent:${userId}:${limit}`,
  list: (userId, page, limit, category) => 
    `notifications:list:${userId}:p${page}:l${limit}:c${category || 'all'}`,
};

// ============================================================================
// TTL Values (بالثواني)
// ============================================================================

const TTL = {
  unreadCount: 30,    // 30 ثانية - يتحدث بشكل متكرر
  stats: 60,          // 1 دقيقة
  recentList: 60,     // 1 دقيقة
  list: 120,          // 2 دقائق - قوائم طويلة
};

// ============================================================================
// Cache Functions
// ============================================================================

/**
 * جلب عدد الإشعارات غير المقروءة من الكاش
 */
const getCachedUnreadCount = async (userId) => {
  return cache.get(CACHE_KEYS.unreadCount(userId));
};

/**
 * حفظ عدد الإشعارات غير المقروءة
 */
const setCachedUnreadCount = async (userId, count) => {
  return cache.set(CACHE_KEYS.unreadCount(userId), count, TTL.unreadCount);
};

/**
 * جلب إحصائيات من الكاش
 */
const getCachedStats = async (userId) => {
  return cache.get(CACHE_KEYS.stats(userId));
};

/**
 * حفظ الإحصائيات
 */
const setCachedStats = async (userId, stats) => {
  return cache.set(CACHE_KEYS.stats(userId), stats, TTL.stats);
};

/**
 * جلب آخر الإشعارات من الكاش
 */
const getCachedRecentNotifications = async (userId, limit = 5) => {
  return cache.get(CACHE_KEYS.recentList(userId, limit));
};

/**
 * حفظ آخر الإشعارات
 */
const setCachedRecentNotifications = async (userId, notifications, limit = 5) => {
  return cache.set(CACHE_KEYS.recentList(userId, limit), notifications, TTL.recentList);
};

/**
 * جلب قائمة الإشعارات من الكاش
 */
const getCachedNotificationList = async (userId, page, limit, category) => {
  return cache.get(CACHE_KEYS.list(userId, page, limit, category));
};

/**
 * حفظ قائمة الإشعارات
 */
const setCachedNotificationList = async (userId, page, limit, category, data) => {
  return cache.set(CACHE_KEYS.list(userId, page, limit, category), data, TTL.list);
};

// ============================================================================
// Cache Invalidation
// ============================================================================

/**
 * إبطال كل كاش مستخدم معين
 */
const invalidateUserCache = async (userId) => {
  if (!userId) return;
  
  try {
    await cache.delPattern(`notifications:*:${userId}*`);
    console.log(`🗑️ Notification cache invalidated for user: ${userId}`);
  } catch (error) {
    console.error('❌ Error invalidating notification cache:', error);
  }
};

/**
 * إبطال كاش العد غير المقروء فقط (أخف)
 */
const invalidateUnreadCountCache = async (userId) => {
  if (!userId) return;
  
  try {
    await cache.del(CACHE_KEYS.unreadCount(userId));
    await cache.del(CACHE_KEYS.stats(userId));
  } catch (error) {
    console.error('❌ Error invalidating unread count cache:', error);
  }
};

/**
 * إبطال كاش عند إضافة إشعار جديد
 */
const invalidateOnNewNotification = async (userId) => {
  if (!userId) return;
  
  try {
    // حذف العد والقوائم الحديثة
    await Promise.all([
      cache.del(CACHE_KEYS.unreadCount(userId)),
      cache.del(CACHE_KEYS.stats(userId)),
      cache.delPattern(`notifications:recent:${userId}*`),
      cache.delPattern(`notifications:list:${userId}:p1:*`), // الصفحة الأولى فقط
    ]);
    console.log(`🔄 Notification cache refreshed for user: ${userId}`);
  } catch (error) {
    console.error('❌ Error invalidating cache on new notification:', error);
  }
};

/**
 * إبطال كاش عند قراءة إشعار
 */
const invalidateOnMarkAsRead = async (userId) => {
  return invalidateUnreadCountCache(userId);
};

/**
 * إبطال كاش عند قراءة الكل
 */
const invalidateOnMarkAllAsRead = async (userId) => {
  return invalidateUserCache(userId);
};

// ============================================================================
// Compression Helpers (للقوائم الكبيرة)
// ============================================================================

/**
 * ضغط البيانات إذا كانت كبيرة
 */
const compressData = async (data) => {
  try {
    const jsonString = JSON.stringify(data);
    if (jsonString.length < COMPRESSION_THRESHOLD) {
      return { data: jsonString, compressed: false };
    }
    
    const compressed = await gzipAsync(Buffer.from(jsonString));
    return { 
      data: compressed.toString('base64'), 
      compressed: true 
    };
  } catch (error) {
    console.error('❌ Compression error:', error);
    return { data: JSON.stringify(data), compressed: false };
  }
};

/**
 * فك ضغط البيانات
 */
const decompressData = async (data, isCompressed) => {
  try {
    if (!isCompressed) {
      return JSON.parse(data);
    }
    
    const buffer = Buffer.from(data, 'base64');
    const decompressed = await gunzipAsync(buffer);
    return JSON.parse(decompressed.toString());
  } catch (error) {
    console.error('❌ Decompression error:', error);
    return null;
  }
};

// ============================================================================
// Compressed Cache Functions (للقوائم الكبيرة)
// ============================================================================

/**
 * حفظ قائمة مضغوطة
 */
const setCachedCompressedList = async (key, data, ttl) => {
  try {
    const { data: processed, compressed } = await compressData(data);
    const cacheData = {
      compressed,
      data: processed,
    };
    return cache.set(key, cacheData, ttl);
  } catch (error) {
    console.error('❌ Error setting compressed cache:', error);
    return null;
  }
};

/**
 * جلب قائمة مضغوطة
 */
const getCachedCompressedList = async (key) => {
  try {
    const cached = await cache.get(key);
    if (!cached) return null;
    
    return await decompressData(cached.data, cached.compressed);
  } catch (error) {
    console.error('❌ Error getting compressed cache:', error);
    return null;
  }
};

// ============================================================================
// Batch Operations (إرسال دفعي)
// ============================================================================

/**
 * إبطال كاش لعدة مستخدمين (دفعي)
 */
const invalidateBatchUsers = async (userIds) => {
  if (!userIds || userIds.length === 0) return;
  
  try {
    const batchSize = 100; // معالجة 100 مستخدم في كل دفعة
    
    for (let i = 0; i < userIds.length; i += batchSize) {
      const batch = userIds.slice(i, i + batchSize);
      const promises = batch.map(userId => 
        invalidateOnNewNotification(userId)
      );
      await Promise.all(promises);
    }
    
    console.log(`🔄 Batch cache invalidated for ${userIds.length} users`);
  } catch (error) {
    console.error('❌ Error in batch cache invalidation:', error);
  }
};

/**
 * تحديث عدد غير المقروء لعدة مستخدمين (دفعي)
 */
const batchIncrementUnreadCount = async (userIds, increment = 1) => {
  if (!userIds || userIds.length === 0) return;
  
  try {
    // إبطال الكاش لكل المستخدمين - سيتم إعادة حساب العدد عند الطلب
    await invalidateBatchUsers(userIds);
  } catch (error) {
    console.error('❌ Error in batch increment:', error);
  }
};

// ============================================================================
// Cursor-based Pagination Cache
// ============================================================================

const CURSOR_CACHE_KEYS = {
  cursorList: (userId, cursor, limit, category) => 
    `notifications:cursor:${userId}:${cursor || 'start'}:l${limit}:c${category || 'all'}`,
};

/**
 * جلب قائمة بناءً على cursor
 */
const getCachedCursorList = async (userId, cursor, limit, category) => {
  const key = CURSOR_CACHE_KEYS.cursorList(userId, cursor, limit, category);
  return getCachedCompressedList(key);
};

/**
 * حفظ قائمة بناءً على cursor
 */
const setCachedCursorList = async (userId, cursor, limit, category, data) => {
  const key = CURSOR_CACHE_KEYS.cursorList(userId, cursor, limit, category);
  return setCachedCompressedList(key, data, TTL.list);
};

// ============================================================================
// Export
// ============================================================================

module.exports = {
  // Cache Keys
  CACHE_KEYS,
  CURSOR_CACHE_KEYS,
  TTL,
  
  // Get Functions
  getCachedUnreadCount,
  getCachedStats,
  getCachedRecentNotifications,
  getCachedNotificationList,
  
  // Set Functions
  setCachedUnreadCount,
  setCachedStats,
  setCachedRecentNotifications,
  setCachedNotificationList,
  
  // Invalidation Functions
  invalidateUserCache,
  invalidateUnreadCountCache,
  invalidateOnNewNotification,
  invalidateOnMarkAsRead,
  invalidateOnMarkAllAsRead,
  
  // Batch Operations
  invalidateBatchUsers,
  batchIncrementUnreadCount,
  
  // Compression Functions
  compressData,
  decompressData,
  setCachedCompressedList,
  getCachedCompressedList,
  
  // Cursor-based Pagination
  getCachedCursorList,
  setCachedCursorList,
};
