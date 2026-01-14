/**
 * ============================================================================
 * Cache Keys - مفاتيح التخزين المؤقت
 * ============================================================================
 * 
 * تعريفات مفاتيح Cache الموحدة لتسهيل إدارتها وتجنب التكرار
 */

/**
 * أنماط المفاتيح
 */
const CACHE_KEYS = {
  // ==================== Students ====================
  STUDENTS: {
    ALL: 'students:all',
    BY_ID: (id) => `students:${id}`,
    BY_GROUP: (groupId) => `students:group:${groupId}`,
    RANKINGS: 'students:rankings',
    PATTERN: 'students:*'
  },

  // ==================== Teachers ====================
  TEACHERS: {
    ALL: 'teachers:all',
    BY_ID: (id) => `teachers:${id}`,
    PATTERN: 'teachers:*'
  },

  // ==================== Secretaries ====================
  SECRETARIES: {
    ALL: 'secretaries:all',
    BY_ID: (id) => `secretaries:${id}`,
    PATTERN: 'secretaries:*'
  },

  // ==================== Groups ====================
  GROUPS: {
    ALL: 'groups:all',
    BY_ID: (id) => `groups:${id}`,
    WITH_STUDENTS: (id) => `groups:${id}:students`,
    PATTERN: 'groups:*'
  },

  // ==================== Daily Marks ====================
  DAILY_MARKS: {
    BY_STUDENT: (studentId) => `daily-marks:student:${studentId}`,
    BY_SECTION: (sectionId) => `daily-marks:section:${sectionId}`,
    BY_DATE: (date) => `daily-marks:date:${date}`,
    PATTERN: 'daily-marks:*'
  },

  // ==================== Attendance ====================
  ATTENDANCE: {
    BY_STUDENT: (studentId) => `attendance:student:${studentId}`,
    BY_GROUP: (groupId) => `attendance:group:${groupId}`,
    BY_DATE: (date) => `attendance:date:${date}`,
    PATTERN: 'attendance:*'
  },

  // ==================== Rankings ====================
  RANKINGS: {
    GLOBAL: 'rankings:global',
    BY_GROUP: (groupId) => `rankings:group:${groupId}`,
    MONTHLY: (month) => `rankings:monthly:${month}`,
    PATTERN: 'rankings:*'
  },

  // ==================== News ====================
  NEWS: {
    ALL: 'news:all',
    LATEST: 'news:latest',
    BY_ID: (id) => `news:${id}`,
    PATTERN: 'news:*'
  },

  // ==================== Timetable ====================
  TIMETABLE: {
    BY_GROUP: (groupId) => `timetable:group:${groupId}`,
    BY_TEACHER: (teacherId) => `timetable:teacher:${teacherId}`,
    PATTERN: 'timetable:*'
  },

  // ==================== Dashboard ====================
  DASHBOARD: {
    ADMIN: 'dashboard:admin',
    TEACHER: (teacherId) => `dashboard:teacher:${teacherId}`,
    STUDENT: (studentId) => `dashboard:student:${studentId}`,
    STATS: 'dashboard:stats',
    PATTERN: 'dashboard:*'
  },

  // ==================== Sections ====================
  SECTIONS: {
    ALL: 'sections:all',
    BY_ID: (id) => `sections:${id}`,
    ACTIVE: 'sections:active',
    PATTERN: 'sections:*'
  },

  // ==================== Exams ====================
  EXAMS: {
    SCHEDULE: 'exams:schedule',
    BY_GROUP: (groupId) => `exams:group:${groupId}`,
    PATTERN: 'exams:*'
  },

  // ==================== Goals ====================
  GOALS: {
    BY_STUDENT: (studentId) => `goals:student:${studentId}`,
    BY_GROUP: (groupId) => `goals:group:${groupId}`,
    PATTERN: 'goals:*'
  },

  // ==================== Warnings ====================
  WARNINGS: {
    BY_STUDENT: (studentId) => `warnings:student:${studentId}`,
    ACTIVE: 'warnings:active',
    PATTERN: 'warnings:*'
  },

  // ==================== Quran ====================
  QURAN: {
    SURAHS: 'quran:surahs',
    PROGRESS: (studentId) => `quran:progress:${studentId}`,
    PATTERN: 'quran:*'
  },

  // ==================== API Response Cache ====================
  API: {
    REQUEST: (path) => `api:${path}`,
    PATTERN: 'api:*'
  }
};

/**
 * مدة التخزين المؤقت بالثواني
 */
const CACHE_TTL = {
  // فترات قصيرة (1-5 دقائق)
  SHORT: 60,           // 1 دقيقة
  DEFAULT: 300,        // 5 دقائق
  
  // فترات متوسطة (15-30 دقيقة)
  MEDIUM: 900,         // 15 دقيقة
  LONG: 1800,          // 30 دقيقة
  
  // فترات طويلة (ساعة+)
  HOUR: 3600,          // 1 ساعة
  HALF_DAY: 43200,     // 12 ساعة
  DAY: 86400,          // 24 ساعة
  WEEK: 604800,        // أسبوع

  // حسب نوع البيانات
  STUDENTS: 600,       // 10 دقائق
  RANKINGS: 300,       // 5 دقائق (تتغير كثيراً)
  NEWS: 1800,          // 30 دقيقة
  TIMETABLE: 3600,     // ساعة (نادراً يتغير)
  QURAN: 86400,        // يوم (بيانات ثابتة)
  DASHBOARD: 120,      // دقيقتين (يحتاج تحديث متكرر)
};

module.exports = {
  CACHE_KEYS,
  CACHE_TTL
};
