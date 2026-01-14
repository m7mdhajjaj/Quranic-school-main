/**
 * ============================================================================
 * Error Handler Middleware - معالجة الأخطاء المركزية المحسّنة
 * ============================================================================
 * 
 * يوفر:
 * - معالجة موحدة للأخطاء
 * - تسجيل مفصل للأخطاء
 * - أخطاء مخصصة للتطبيق
 * - التعامل مع أخطاء MongoDB
 */

// ============================================================================
// CUSTOM ERROR CLASSES
// ============================================================================

/**
 * خطأ التطبيق الأساسي
 */
class AppError extends Error {
  constructor(message, statusCode = 500, errorCode = null) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.isOperational = true;
    this.timestamp = new Date().toISOString();
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * خطأ التحقق من الصحة
 */
class ValidationError extends AppError {
  constructor(message, errors = []) {
    super(message, 400, 'VALIDATION_ERROR');
    this.errors = errors;
  }
}

/**
 * خطأ غير مصرح
 */
class UnauthorizedError extends AppError {
  constructor(message = 'غير مصرح بالوصول') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

/**
 * خطأ ممنوع
 */
class ForbiddenError extends AppError {
  constructor(message = 'غير مسموح بهذا الإجراء') {
    super(message, 403, 'FORBIDDEN');
  }
}

/**
 * خطأ غير موجود
 */
class NotFoundError extends AppError {
  constructor(message = 'المورد المطلوب غير موجود') {
    super(message, 404, 'NOT_FOUND');
  }
}

/**
 * خطأ تعارض
 */
class ConflictError extends AppError {
  constructor(message = 'تعارض في البيانات') {
    super(message, 409, 'CONFLICT');
  }
}

/**
 * خطأ تجاوز الحد
 */
class RateLimitError extends AppError {
  constructor(message = 'تم تجاوز الحد الأقصى للطلبات') {
    super(message, 429, 'RATE_LIMIT_EXCEEDED');
  }
}

// ============================================================================
// MIDDLEWARE FUNCTIONS
// ============================================================================

/**
 * Async handler wrapper to catch errors in async route handlers
 * يلتقط الأخطاء تلقائياً في controllers async
 * 
 * @param {Function} fn - Async function to wrap
 * @returns {Function} Express middleware
 * 
 * @example
 * router.get('/users', asyncHandler(async (req, res) => {
 *   const users = await User.find();
 *   res.json({ success: true, data: users });
 * }));
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Global error handler middleware
 * معالج الأخطاء العام
 */
const globalErrorHandler = (err, req, res, next) => {
  // Set default values
  err.statusCode = err.statusCode || 500;
  err.message = err.message || 'حدث خطأ في الخادم';

  // Log error
  const errorLog = {
    timestamp: new Date().toISOString(),
    method: req.method,
    path: req.originalUrl,
    statusCode: err.statusCode,
    message: err.message,
    errorCode: err.errorCode,
    userId: req.user?._id,
    ip: req.ip,
  };

  if (err.statusCode >= 500) {
    console.error('❌ Server Error:', errorLog);
    console.error('Stack:', err.stack);
  } else {
    console.log('⚠️ Client Error:', errorLog);
  }

  // Handle specific error types
  let error = { ...err, message: err.message };

  // MongoDB CastError (Invalid ObjectId)
  if (err.name === 'CastError') {
    error = new AppError(`معرف غير صالح: ${err.value}`, 400, 'INVALID_ID');
  }

  // MongoDB Duplicate Key Error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    error = new ConflictError(`${field} موجود مسبقاً`);
  }

  // MongoDB Validation Error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => ({
      field: e.path,
      message: e.message
    }));
    error = new ValidationError('خطأ في التحقق من البيانات', errors);
  }

  // JWT Errors
  if (err.name === 'JsonWebTokenError') {
    error = new UnauthorizedError('رمز المصادقة غير صالح');
  }

  if (err.name === 'TokenExpiredError') {
    error = new UnauthorizedError('انتهت صلاحية رمز المصادقة');
  }

  // Zod Validation Error
  if (err.name === 'ZodError') {
    const errors = err.errors.map(e => ({
      field: e.path.join('.'),
      message: e.message
    }));
    error = new ValidationError('خطأ في البيانات المدخلة', errors);
  }

  // Send response
  const response = {
    success: false,
    message: error.message || err.message,
    errorCode: error.errorCode,
  };

  // Add validation errors if present
  if (error.errors) {
    response.errors = error.errors;
  }

  // Add stack trace in development
  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
    response.originalError = err.message;
  }

  res.status(error.statusCode || err.statusCode).json(response);
};

/**
 * Not found handler
 * معالج الصفحات غير الموجودة
 */
const notFound = (req, res, next) => {
  const error = new NotFoundError(`المسار غير موجود: ${req.originalUrl}`);
  next(error);
};

/**
 * Error logger middleware (optional separate logging)
 * تسجيل الأخطاء (اختياري)
 */
const errorLogger = (err, req, res, next) => {
  const errorInfo = {
    timestamp: new Date().toISOString(),
    type: err.constructor.name,
    message: err.message,
    path: req.path,
    method: req.method,
    ip: req.ip,
    userId: req.user?._id,
    userAgent: req.get('user-agent'),
    stack: err.stack,
  };

  // Here you could send to external logging service
  // await LoggingService.log(errorInfo);

  console.error('📝 Error Log:', JSON.stringify(errorInfo, null, 2));
  next(err);
};

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
  // Middleware
  asyncHandler,
  globalErrorHandler,
  notFound,
  errorLogger,
  
  // Error Classes
  AppError,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  RateLimitError,
};
