// ============================================================================
// utils/logger.js - نظام Logging موحد
// ============================================================================
// 
// استبدال console.log بنظام logging منظم
// يمكن تعطيل الـ logs في الـ production بسهولة
//
// ============================================================================

/**
 * مستوى البيئة الحالية
 */
const isProduction = process.env.NODE_ENV === 'production';
const isTest = process.env.NODE_ENV === 'test';
const logLevel = process.env.LOG_LEVEL || (isProduction ? 'warn' : 'debug');

/**
 * مستويات الـ logging
 */
const LOG_LEVELS = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
  trace: 4
};

/**
 * الألوان للـ console (تستخدم في التطوير فقط)
 */
const COLORS = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
  green: '\x1b[32m'
};

/**
 * الحصول على مستوى الـ log الحالي
 */
function getCurrentLevel() {
  return LOG_LEVELS[logLevel] ?? LOG_LEVELS.debug;
}

/**
 * تنسيق الوقت
 */
function getTimestamp() {
  return new Date().toISOString();
}

/**
 * تنسيق الرسالة
 */
function formatMessage(level, module, message, data = null) {
  const timestamp = getTimestamp();
  const dataStr = data ? ` ${JSON.stringify(data)}` : '';
  return `[${timestamp}] [${level.toUpperCase()}] [${module}] ${message}${dataStr}`;
}

/**
 * ============================================================================
 * Logger Class
 * ============================================================================
 */

class Logger {
  constructor(moduleName = 'App') {
    this.module = moduleName;
  }

  /**
   * Error - الأخطاء الحرجة (دائماً يظهر)
   */
  error(message, data = null) {
    const formatted = formatMessage('error', this.module, message, data);
    console.error(`${COLORS.red}❌ ${formatted}${COLORS.reset}`);
  }

  /**
   * Warn - التحذيرات المهمة
   */
  warn(message, data = null) {
    if (getCurrentLevel() >= LOG_LEVELS.warn) {
      const formatted = formatMessage('warn', this.module, message, data);
      console.warn(`${COLORS.yellow}⚠️ ${formatted}${COLORS.reset}`);
    }
  }

  /**
   * Info - معلومات عامة
   */
  info(message, data = null) {
    if (getCurrentLevel() >= LOG_LEVELS.info) {
      const formatted = formatMessage('info', this.module, message, data);
      console.log(`${COLORS.blue}ℹ️ ${formatted}${COLORS.reset}`);
    }
  }

  /**
   * Debug - معلومات التصحيح (تطوير فقط)
   */
  debug(message, data = null) {
    if (getCurrentLevel() >= LOG_LEVELS.debug && !isProduction) {
      const formatted = formatMessage('debug', this.module, message, data);
      console.log(`${COLORS.cyan}🔍 ${formatted}${COLORS.reset}`);
    }
  }

  /**
   * Trace - تفاصيل دقيقة جداً
   */
  trace(message, data = null) {
    if (getCurrentLevel() >= LOG_LEVELS.trace && !isProduction) {
      const formatted = formatMessage('trace', this.module, message, data);
      console.log(`${COLORS.gray}📋 ${formatted}${COLORS.reset}`);
    }
  }

  /**
   * Success - رسائل النجاح
   */
  success(message, data = null) {
    if (getCurrentLevel() >= LOG_LEVELS.info) {
      const formatted = formatMessage('success', this.module, message, data);
      console.log(`${COLORS.green}✅ ${formatted}${COLORS.reset}`);
    }
  }

  /**
   * إنشاء logger فرعي لوحدة معينة
   */
  child(subModule) {
    return new Logger(`${this.module}:${subModule}`);
  }
}

/**
 * ============================================================================
 * Factory Functions
 * ============================================================================
 */

/**
 * إنشاء logger جديد لوحدة معينة
 * @param {string} moduleName - اسم الوحدة
 * @returns {Logger}
 * 
 * @example
 * const logger = createLogger('TimeTable');
 * logger.debug('Fetching timetables', { userId: '123' });
 * logger.info('Timetable created successfully');
 * logger.error('Failed to create timetable', { error: err.message });
 */
function createLogger(moduleName) {
  return new Logger(moduleName);
}

/**
 * Logger افتراضي للاستخدام السريع
 */
const defaultLogger = new Logger('App');

/**
 * ============================================================================
 * Exports
 * ============================================================================
 */

module.exports = {
  Logger,
  createLogger,
  logger: defaultLogger,
  
  // للتوافق السريع
  debug: (msg, data) => defaultLogger.debug(msg, data),
  info: (msg, data) => defaultLogger.info(msg, data),
  warn: (msg, data) => defaultLogger.warn(msg, data),
  error: (msg, data) => defaultLogger.error(msg, data),
  success: (msg, data) => defaultLogger.success(msg, data)
};
