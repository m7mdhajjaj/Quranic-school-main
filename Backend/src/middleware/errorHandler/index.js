/**
 * ============================================================================
 * Error Handler Index
 * نقطة التصدير المركزية لـ Error Handler Middleware
 * ============================================================================
 */

const { 
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
} = require('./errorHandler.middleware');

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
