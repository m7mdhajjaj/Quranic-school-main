/**
 * ============================================================================
 * Rate Limiter Middleware - محدد معدل الطلبات
 * ============================================================================
 */

const rateLimit = require('express-rate-limit');

/**
 * Rate limiter for sending messages
 * محدد معدل إرسال الرسائل
 */
const messageLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // Increased from 20 to 100
  message: { message: 'تم تجاوز الحد الأقصى للرسائل. يرجى الانتظار قليلاً.' },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'تم تجاوز الحد الأقصى للرسائل. يرجى الانتظار.'
    });
  }
});

/**
 * Rate limiter for general API calls
 * محدد معدل استدعاءات API العامة
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Increased from 100 to 1000
  message: { message: 'تم تجاوز الحد الأقصى للطلبات.' },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { messageLimiter, apiLimiter };
