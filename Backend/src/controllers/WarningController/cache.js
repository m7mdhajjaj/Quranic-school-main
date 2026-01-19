// ============================================================================
// WarningController/cache.js - Redis Caching Utilities for Warnings
// ============================================================================
// 
// نظام caching متقدم باستخدام Redis مع:
// - TTL ديناميكية
// - Cache warming
// - Invalidation strategies
// ============================================================================

const { cache } = require("../../utils/cache/cacheClient");

// ============================================================================
// CACHE KEYS CONFIGURATION
// ============================================================================

const CACHE_KEYS = {
  TEACHER_STATS: (teacherId) => `warning:stats:teacher:${teacherId}`,
  GROUP_STATS: (groupId) => `warning:stats:group:${groupId}`,
  STUDENT_STATUS: (studentId) => `warning:status:student:${studentId}`,
  STUDENT_WARNINGS: (studentId) => `warning:list:student:${studentId}`,
  GROUP_STUDENTS: (groupId) => `warning:group-students:${groupId}`,
};

const CACHE_TTL = {
  STATS: 300,           // 5 دقائق للإحصائيات
  STATUS: 180,          // 3 دقائق لحالة الطالب
  LIST: 120,            // دقيقتين للقوائم
  SHORT: 60,            // دقيقة للبيانات المتغيرة
};

// ============================================================================
// CACHE INVALIDATION HELPERS
// ============================================================================

/**
 * إبطال جميع الكاش المتعلق بمعلم معين
 * @param {string} teacherId - معرف المعلم
 */
const invalidateTeacherCache = async (teacherId) => {
  const patterns = [
    `warning:stats:teacher:${teacherId}`,
    `cache:/api/groups/teacher-id/${teacherId}*`,
    `cache:/api/attendance/teacher/${teacherId}*`,
  ];

  for (const pattern of patterns) {
    await cache.delPattern(pattern);
  }

  console.log(`🗑️ Redis: Invalidated teacher cache [${teacherId}]`);
};

/**
 * إبطال جميع الكاش المتعلق بطالب معين
 * @param {string} studentId - معرف الطالب
 */
const invalidateStudentCache = async (studentId) => {
  const keys = [
    CACHE_KEYS.STUDENT_STATUS(studentId),
    CACHE_KEYS.STUDENT_WARNINGS(studentId),
  ];

  await cache.delMany(keys);
  console.log(`🗑️ Redis: Invalidated student cache [${studentId}]`);
};

/**
 * إبطال جميع الكاش المتعلق بحلقة معينة
 * @param {string} groupId - معرف الحلقة
 */
const invalidateGroupCache = async (groupId) => {
  const keys = [
    CACHE_KEYS.GROUP_STATS(groupId),
    CACHE_KEYS.GROUP_STUDENTS(groupId),
  ];

  await cache.delMany(keys);
  console.log(`🗑️ Redis: Invalidated group cache [${groupId}]`);
};

/**
 * إبطال شامل عند إنشاء/حذف إنذار
 * @param {Object} params - البيانات {teacherId, studentId, groupId}
 */
const invalidateWarningCache = async ({ teacherId, studentId, groupId }) => {
  await Promise.all([
    teacherId ? invalidateTeacherCache(teacherId) : Promise.resolve(),
    studentId ? invalidateStudentCache(studentId) : Promise.resolve(),
    groupId ? invalidateGroupCache(groupId) : Promise.resolve(),
  ]);

  console.log('🗑️ Redis: Full warning cache invalidation completed');
};

// ============================================================================
// CACHE WARMING (Pre-loading)
// ============================================================================

/**
 * تحميل مسبق لإحصائيات المعلم
 * @param {string} teacherId - معرف المعلم
 * @param {Function} fetchFunction - دالة جلب البيانات
 */
const warmTeacherStatsCache = async (teacherId, fetchFunction) => {
  const key = CACHE_KEYS.TEACHER_STATS(teacherId);
  
  // تحقق إذا كان الكاش موجود
  const exists = await cache.exists(key);
  if (!exists) {
    const data = await fetchFunction();
    await cache.set(key, data, CACHE_TTL.STATS);
    console.log(`🔥 Redis: Warmed teacher stats cache [${teacherId}]`);
  }
};

// ============================================================================
// REDIS-SPECIFIC FEATURES
// ============================================================================

/**
 * تتبع عدد الإنذارات بالوقت الفعلي (Redis Counter)
 * @param {string} teacherId - معرف المعلم
 * @param {number} increment - مقدار الزيادة
 */
const incrementWarningCount = async (teacherId, increment = 1) => {
  const key = `warning:count:teacher:${teacherId}`;
  const count = await cache.incr(key, increment);
  
  // تعيين انتهاء بعد 24 ساعة
  if (count === increment) {
    await cache.expire(key, 86400);
  }
  
  return count;
};

/**
 * إحصائيات الإنذارات اليومية (Redis Hash)
 * @param {string} date - التاريخ (YYYY-MM-DD)
 * @param {Object} stats - الإحصائيات
 */
const storeDailyStats = async (date, stats) => {
  const key = `warning:daily:${date}`;
  await cache.set(key, stats, 86400 * 7); // الاحتفاظ لمدة أسبوع
};

/**
 * جلب إحصائيات الإنذارات اليومية
 * @param {string} date - التاريخ (YYYY-MM-DD)
 */
const getDailyStats = async (date) => {
  const key = `warning:daily:${date}`;
  return await cache.get(key);
};

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
  // Cache Keys
  CACHE_KEYS,
  CACHE_TTL,

  // Invalidation
  invalidateTeacherCache,
  invalidateStudentCache,
  invalidateGroupCache,
  invalidateWarningCache,

  // Cache Warming
  warmTeacherStatsCache,

  // Redis Features
  incrementWarningCount,
  storeDailyStats,
  getDailyStats,
};
