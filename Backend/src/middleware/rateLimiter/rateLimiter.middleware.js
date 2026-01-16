/**
 * ============================================================================
 * Rate Limiter Middleware - محدد معدل الطلبات المحسّن
 * ============================================================================
 * 
 * يستخدم Redis للتخزين (إذا متاح) مع fallback للذاكرة
 * يوفر حماية ضد:
 * - هجمات DDoS
 * - إساءة استخدام API
 * - Brute force attacks
 */

const rateLimit = require('express-rate-limit');

// ============================================================================
// RATE LIMITER CONFIGURATIONS
// ============================================================================

/**
 * Rate limiter for authentication endpoints
 * حماية نقاط المصادقة من هجمات Brute Force
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 دقائق
  max: 10, // 10 محاولات كحد أقصى
  message: {
    success: false,
    message: 'تم تجاوز الحد الأقصى لمحاولات تسجيل الدخول. يرجى المحاولة بعد 15 دقيقة.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // لا تحسب المحاولات الناجحة
  validate: { xForwardedForHeader: false },
  handler: (req, res) => {
    console.log(`🚫 Auth rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      success: false,
      message: 'تم تجاوز الحد الأقصى لمحاولات تسجيل الدخول. يرجى المحاولة لاحقاً.',
      retryAfter: 15 * 60, // ثواني
    });
  },
});

/**
 * Rate limiter for sending messages
 * محدد معدل إرسال الرسائل
 */
const messageLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 دقيقة
  max: 100, // 100 رسالة في الدقيقة
  message: {
    success: false,
    message: 'تم تجاوز الحد الأقصى للرسائل. يرجى الانتظار قليلاً.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  validate: { xForwardedForHeader: false },
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'تم تجاوز الحد الأقصى للرسائل. يرجى الانتظار.',
    });
  },
});

/**
 * Rate limiter for general API calls
 * محدد معدل استدعاءات API العامة
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 دقيقة
  max: 1000, // 1000 طلب لكل 15 دقيقة
  message: {
    success: false,
    message: 'تم تجاوز الحد الأقصى للطلبات.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false },
});

/**
 * Rate limiter for file uploads
 * محدد معدل رفع الملفات
 */
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 ساعة
  max: 50, // 50 رفع في الساعة
  message: {
    success: false,
    message: 'تم تجاوز الحد الأقصى لرفع الملفات. يرجى المحاولة لاحقاً.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false },
});

/**
 * Rate limiter for password reset
 * محدد معدل إعادة تعيين كلمة المرور
 */
const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 ساعة
  max: 5, // 5 محاولات في الساعة
  message: {
    success: false,
    message: 'تم تجاوز الحد الأقصى لطلبات إعادة تعيين كلمة المرور.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  validate: { xForwardedForHeader: false },
});

/**
 * Rate limiter for AI/OpenAI endpoints
 * محدد معدل طلبات الذكاء الاصطناعي
 */
const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 دقيقة
  max: 10, // 10 طلبات في الدقيقة
  message: {
    success: false,
    message: 'تم تجاوز الحد الأقصى لطلبات الذكاء الاصطناعي.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false },
});

/**
 * Strict rate limiter for sensitive operations
 * محدد صارم للعمليات الحساسة
 */
const strictLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 ساعة
  max: 10, // 10 طلبات في الساعة
  message: {
    success: false,
    message: 'تم تجاوز الحد الأقصى للعمليات الحساسة.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false },
});

/**
 * Rate limiter for create operations
 * محدد معدل عمليات الإنشاء
 */
const createLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 دقيقة
  max: 30, // 30 عملية إنشاء في الدقيقة
  message: {
    success: false,
    message: 'تم تجاوز الحد الأقصى لعمليات الإضافة. يرجى الانتظار قليلاً.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false },
  handler: (req, res) => {
    console.log(`🚫 Create rate limit exceeded for user: ${req.user?._id} IP: ${req.ip}`);
    res.status(429).json({
      success: false,
      message: 'تم تجاوز الحد الأقصى لعمليات الإضافة. يرجى الانتظار.',
      retryAfter: 60,
    });
  },
});

/**
 * Rate limiter for update operations
 * محدد معدل عمليات التحديث
 */
const updateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 دقيقة
  max: 50, // 50 عملية تحديث في الدقيقة
  message: {
    success: false,
    message: 'تم تجاوز الحد الأقصى لعمليات التعديل. يرجى الانتظار قليلاً.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false },
  handler: (req, res) => {
    console.log(`🚫 Update rate limit exceeded for user: ${req.user?._id} IP: ${req.ip}`);
    res.status(429).json({
      success: false,
      message: 'تم تجاوز الحد الأقصى لعمليات التعديل. يرجى الانتظار.',
      retryAfter: 60,
    });
  },
});

/**
 * Rate limiter for delete operations
 * محدد معدل عمليات الحذف
 */
const deleteLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 دقيقة
  max: 20, // 20 عملية حذف في الدقيقة
  message: {
    success: false,
    message: 'تم تجاوز الحد الأقصى لعمليات الحذف. يرجى الانتظار قليلاً.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false },
  handler: (req, res) => {
    console.log(`🚫 Delete rate limit exceeded for user: ${req.user?._id} IP: ${req.ip}`);
    res.status(429).json({
      success: false,
      message: 'تم تجاوز الحد الأقصى لعمليات الحذف. يرجى الانتظار.',
      retryAfter: 60,
    });
  },
});

/**
 * Dynamic rate limiter factory
 * إنشاء rate limiter مخصص
 * 
 * @param {Object} options - خيارات التهيئة
 * @returns {Function} Express middleware
 */
const createRateLimiter = (options = {}) => {
  const {
    windowMs = 15 * 60 * 1000,
    max = 100,
    message = 'تم تجاوز الحد الأقصى للطلبات.',
    skipSuccessfulRequests = false,
  } = options;

  return rateLimit({
    windowMs,
    max,
    message: { success: false, message },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests,
    validate: { xForwardedForHeader: false },
  });
};

module.exports = {
  // Pre-configured limiters
  authLimiter,
  messageLimiter,
  apiLimiter,
  uploadLimiter,
  passwordResetLimiter,
  aiLimiter,
  strictLimiter,
  
  // CRUD operation limiters
  createLimiter,
  updateLimiter,
  deleteLimiter,
  
  // Factory function
  createRateLimiter,
};
