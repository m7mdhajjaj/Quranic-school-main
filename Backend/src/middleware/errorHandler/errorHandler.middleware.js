/**
 * ============================================================================
 * Error Handler Middleware - معالجة الأخطاء المركزية
 * ============================================================================
 */

/**
 * Async handler wrapper to catch errors in async route handlers
 * يلتقط الأخطاء تلقائياً في controllers async
 */
exports.asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Global error handler middleware
 * معالج الأخطاء العام
 */
exports.globalErrorHandler = (err, req, res, next) => {
  console.error("❌ Error:", err);

  const statusCode = err.statusCode || 500;
  const message = err.message || "حدث خطأ في الخادم";

  res.status(statusCode).json({
    success: false,
    message,
    error: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
};

/**
 * Not found handler
 * معالج الصفحات غير الموجودة
 */
exports.notFound = (req, res, next) => {
  const error = new Error(`Not found - ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

/**
 * Custom error creator
 * إنشاء خطأ مخصص
 */
class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

exports.AppError = AppError;
