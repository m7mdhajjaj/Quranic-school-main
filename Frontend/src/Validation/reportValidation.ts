// ============================================================================
// Validation/reportValidation.ts - Report Validation Functions
// ============================================================================

export interface ReportFilters {
  month?: number;
  year?: number;
  studentId?: string;
}

export interface ReportValidationErrors {
  month?: string;
  year?: string;
  studentId?: string;
}

/**
 * Validate month value
 * @param month - Month number (1-12)
 * @returns Error message if invalid, undefined if valid
 */
export const validateMonth = (month?: number): string | undefined => {
  if (month === undefined || month === null) return undefined;

  if (month < 1 || month > 12) {
    return "الشهر يجب أن يكون بين 1 و 12";
  }

  return undefined;
};

/**
 * Validate year value
 * @param year - Year number
 * @returns Error message if invalid, undefined if valid
 */
export const validateYear = (year?: number): string | undefined => {
  if (year === undefined || year === null) return undefined;

  const currentYear = new Date().getFullYear();
  const minYear = 2020;
  const maxYear = currentYear + 5;

  if (year < minYear || year > maxYear) {
    return `السنة يجب أن تكون بين ${minYear} و ${maxYear}`;
  }

  return undefined;
};

/**
 * Validate student ID
 * @param studentId - Student ID string
 * @returns Error message if invalid, undefined if valid
 */
export const validateStudentId = (studentId?: string): string | undefined => {
  if (!studentId) return undefined;

  if (studentId.length !== 24) {
    return "معرف الطالب غير صحيح";
  }

  // Check if it's a valid MongoDB ObjectId format
  const objectIdRegex = /^[0-9a-fA-F]{24}$/;
  if (!objectIdRegex.test(studentId)) {
    return "معرف الطالب غير صحيح";
  }

  return undefined;
};

/**
 * Validate report filters
 * @param filters - Report filters object
 * @returns Validation errors object
 */
export const validateReportFilters = (
  filters: ReportFilters
): ReportValidationErrors => {
  const errors: ReportValidationErrors = {};

  const monthError = validateMonth(filters.month);
  if (monthError) {
    errors.month = monthError;
  }

  const yearError = validateYear(filters.year);
  if (yearError) {
    errors.year = yearError;
  }

  const studentIdError = validateStudentId(filters.studentId);
  if (studentIdError) {
    errors.studentId = studentIdError;
  }

  return errors;
};

/**
 * Check if report filters are valid
 * @param filters - Report filters object
 * @returns True if valid, false otherwise
 */
export const isReportFiltersValid = (filters: ReportFilters): boolean => {
  const errors = validateReportFilters(filters);
  return Object.keys(errors).length === 0;
};

/**
 * Get validation error message for a specific field
 * @param filters - Report filters object
 * @param field - Field name to validate
 * @returns Error message for the field
 */
export const getFieldError = (
  filters: ReportFilters,
  field: keyof ReportFilters
): string | undefined => {
  const errors = validateReportFilters(filters);
  return errors[field];
};

/**
 * Validate date range for reports
 * @param startDate - Start date string
 * @param endDate - End date string
 * @returns Error message if invalid, undefined if valid
 */
export const validateDateRange = (
  startDate?: string,
  endDate?: string
): string | undefined => {
  if (!startDate || !endDate) return undefined;

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return "تاريخ غير صحيح";
  }

  if (start > end) {
    return "تاريخ البداية يجب أن يكون قبل تاريخ النهاية";
  }

  // Check if date range is not too far in the future
  const maxFutureDate = new Date();
  maxFutureDate.setFullYear(maxFutureDate.getFullYear() + 1);

  if (end > maxFutureDate) {
    return "التاريخ لا يمكن أن يكون في المستقبل البعيد";
  }

  return undefined;
};

/**
 * Sanitize and format report filters
 * @param filters - Raw report filters
 * @returns Sanitized and formatted filters
 */
export const sanitizeReportFilters = (
  filters: ReportFilters
): ReportFilters => {
  const sanitized: ReportFilters = {};

  if (filters.month !== undefined && filters.month !== null) {
    sanitized.month = Math.max(1, Math.min(12, Math.floor(filters.month)));
  }

  if (filters.year !== undefined && filters.year !== null) {
    const currentYear = new Date().getFullYear();
    sanitized.year = Math.max(
      2020,
      Math.min(currentYear + 5, Math.floor(filters.year))
    );
  }

  if (filters.studentId) {
    sanitized.studentId = filters.studentId.trim();
  }

  return sanitized;
};
