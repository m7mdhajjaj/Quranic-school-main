// ============================================================================
// Response Helpers - دوال الاستجابة المشتركة
// ============================================================================

/**
 * Send success response
 * @param {Object} res - Express response object
 * @param {*} data - Response data
 * @param {string} message - Success message
 * @param {number} statusCode - HTTP status code (default: 200)
 * @param {Object} extra - Additional fields
 */
function sendSuccess(res, data, message, statusCode = 200, extra = {}) {
  res.status(statusCode).json({
    success: true,
    data,
    message,
    ...extra,
  });
}

/**
 * Send error response
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code (default: 500)
 * @param {*} error - Error details (only in development)
 */
function sendError(res, message, statusCode = 500, error = null) {
  const response = {
    success: false,
    message,
  };

  if (process.env.NODE_ENV === "development" && error) {
    response.error = error.toString();
  }

  res.status(statusCode).json(response);
}

/**
 * Send validation error response
 * @param {Object} res - Express response object
 * @param {string} message - Validation error message
 */
function sendValidationError(res, message) {
  sendError(res, message, 400);
}

/**
 * Send not found response
 * @param {Object} res - Express response object
 * @param {string} resource - Resource name
 */
function sendNotFound(res, resource = "المورد") {
  sendError(res, `${resource} غير موجود`, 404);
}

/**
 * Send created response
 * @param {Object} res - Express response object
 * @param {*} data - Created resource data
 * @param {string} message - Success message
 */
function sendCreated(res, data, message) {
  sendSuccess(res, data, message, 201);
}

/**
 * Format pagination response
 * @param {number} total - Total count
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 */
function formatPagination(total, page, limit) {
  return {
    total,
    page: parseInt(page),
    limit: parseInt(limit),
    pages: Math.ceil(total / limit),
  };
}

module.exports = {
  sendSuccess,
  sendError,
  sendValidationError,
  sendNotFound,
  sendCreated,
  formatPagination,
};
