// ============================================================================
// ReportRoutes/routeHelpers.js - Route Helper Functions
// ============================================================================

/**
 * Validate student ID parameter
 * @param {string} studentId - Student ID to validate
 * @returns {boolean} True if valid, false otherwise
 */
exports.validateStudentId = (studentId) => {
  return studentId && studentId.length === 24; // MongoDB ObjectId length
};

/**
 * Validate group ID parameter
 * @param {string} groupId - Group ID to validate
 * @returns {boolean} True if valid, false otherwise
 */
exports.validateGroupId = (groupId) => {
  return groupId && groupId.length === 24; // MongoDB ObjectId length
};

/**
 * Validate date range parameters
 * @param {string} startDate - Start date string
 * @param {string} endDate - End date string
 * @returns {object} Validation result with isValid and message
 */
exports.validateDateRange = (startDate, endDate) => {
  if (!startDate || !endDate) {
    return { isValid: true, message: null }; // Both optional
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return { isValid: false, message: "تاريخ غير صحيح" };
  }

  if (start > end) {
    return {
      isValid: false,
      message: "تاريخ البداية يجب أن يكون قبل تاريخ النهاية",
    };
  }

  return { isValid: true, message: null };
};

/**
 * Validate month and year parameters
 * @param {string} month - Month string
 * @param {string} year - Year string
 * @returns {object} Validation result with isValid and message
 */
exports.validateMonthYear = (month, year) => {
  if (month && (isNaN(month) || month < 1 || month > 12)) {
    return { isValid: false, message: "الشهر يجب أن يكون بين 1 و 12" };
  }

  if (year && (isNaN(year) || year < 2000 || year > 2100)) {
    return { isValid: false, message: "السنة يجب أن تكون بين 2000 و 2100" };
  }

  return { isValid: true, message: null };
};

/**
 * Extract query parameters for reports
 * @param {object} query - Request query object
 * @returns {object} Extracted and validated parameters
 */
exports.extractReportParams = (query) => {
  const { month, year, startDate, endDate, groupName, studentId } = query;

  return {
    month: month ? parseInt(month) : null,
    year: year ? parseInt(year) : null,
    startDate,
    endDate,
    groupName,
    studentId,
  };
};
