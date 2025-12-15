// ============================================================================
// Validation Helpers - دوال التحقق المشتركة
// ============================================================================

/**
 * Validate marks array
 * @param {Array} marks - Array of marks
 * @throws {Error} If marks is not a valid array
 */
function validateMarksArray(marks) {
  if (!Array.isArray(marks)) {
    throw new Error("marks يجب أن تكون قائمة (array)");
  }

  if (marks.length === 0) {
    throw new Error("marks يجب أن تحتوي على عنصر واحد على الأقل");
  }

  return true;
}

/**
 * Validate mark data
 * @param {Object} mark - Mark object
 * @returns {boolean}
 */
function validateMarkData(mark) {
  if (!mark.studentId) {
    throw new Error("studentId مطلوب");
  }

  if (!mark.sectionId) {
    throw new Error("sectionId مطلوب");
  }

  // At least one mark should be provided
  if (
    mark.reviewMark === undefined &&
    mark.reviewMark === null &&
    mark.memorizationMark === undefined &&
    mark.memorizationMark === null
  ) {
    throw new Error("يجب تقديم علامة واحدة على الأقل");
  }

  return true;
}

/**
 * Validate section data
 * @param {Object} section - Section object
 * @returns {boolean}
 */
function validateSectionData(section) {
  if (!section.date) {
    throw new Error("تاريخ المقطع مطلوب");
  }

  if (!section.group) {
    throw new Error("اسم الحلقة مطلوب");
  }

  return true;
}

/**
 * Validate MongoDB ObjectId format
 * @param {string} id - ID to validate
 * @returns {boolean}
 */
function isValidObjectId(id) {
  if (!id) return false;
  return /^[0-9a-fA-F]{24}$/.test(id.toString());
}

/**
 * Validate date format
 * @param {string|Date} date - Date to validate
 * @returns {boolean}
 */
function isValidDate(date) {
  const dateObj = new Date(date);
  return dateObj instanceof Date && !isNaN(dateObj);
}

/**
 * Validate month and year
 * @param {number} month - Month (1-12)
 * @param {number} year - Year
 * @returns {boolean}
 */
function validateMonthYear(month, year) {
  if (month !== undefined) {
    const monthNum = parseInt(month);
    if (isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
      throw new Error("الشهر يجب أن يكون بين 1 و 12");
    }
  }

  if (year !== undefined) {
    const yearNum = parseInt(year);
    if (isNaN(yearNum) || yearNum < 2000 || yearNum > 2100) {
      throw new Error("السنة غير صالحة");
    }
  }

  return true;
}

module.exports = {
  validateMarksArray,
  validateMarkData,
  validateSectionData,
  isValidObjectId,
  isValidDate,
  validateMonthYear,
};
