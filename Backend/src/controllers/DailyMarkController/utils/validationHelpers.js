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

// ============================================================================
// ⏰ Mark Edit Window Validation - نافذة التعديل الزمنية
// ============================================================================

/**
 * مدة نافذة التعديل بعد تاريخ المقطع (بالأيام)
 */
const EDIT_WINDOW_DAYS = 14; // أسبوعين

/**
 * التحقق من أن العلامة قابلة للتعديل
 * - ممنوع قبل تاريخ المقطع
 * - ممنوع بعد أسبوعين من تاريخ المقطع
 * 
 * @param {Date} sectionDate - تاريخ المقطع
 * @param {string} operation - نوع العملية (add, update, delete)
 * @returns {{ isAllowed: boolean, reason?: string, daysUntilOpen?: number, daysUntilClose?: number }}
 */
function checkMarkEditWindow(sectionDate, operation = 'update') {
  if (!sectionDate) {
    return { isAllowed: false, reason: "تاريخ المقطع غير موجود" };
  }

  const now = new Date();
  const sectionDateObj = new Date(sectionDate);
  
  // تصفير الوقت للمقارنة بالأيام فقط
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const sectionDayStart = new Date(sectionDateObj.getFullYear(), sectionDateObj.getMonth(), sectionDateObj.getDate());
  
  // حساب الفرق بالأيام
  const msPerDay = 24 * 60 * 60 * 1000;
  const daysDiff = Math.floor((todayStart - sectionDayStart) / msPerDay);
  
  // حساب تاريخ انتهاء نافذة التعديل
  const editWindowEnd = new Date(sectionDayStart);
  editWindowEnd.setDate(editWindowEnd.getDate() + EDIT_WINDOW_DAYS);
  
  // ❌ قبل تاريخ المقطع
  if (daysDiff < 0) {
    const daysUntilOpen = Math.abs(daysDiff);
    const operationText = operation === 'add' ? 'إضافة' : operation === 'delete' ? 'حذف' : 'تعديل';
    return {
      isAllowed: false,
      reason: `لا يمكن ${operationText} العلامة قبل موعد المقطع. يمكنك ${operationText} العلامة بعد ${daysUntilOpen} يوم`,
      daysUntilOpen,
      sectionDate: sectionDayStart,
      editWindowEnd,
    };
  }
  
  // ❌ بعد نافذة التعديل (أسبوعين)
  if (daysDiff > EDIT_WINDOW_DAYS) {
    const daysOverdue = daysDiff - EDIT_WINDOW_DAYS;
    const operationText = operation === 'add' ? 'إضافة' : operation === 'delete' ? 'حذف' : 'تعديل';
    return {
      isAllowed: false,
      reason: `انتهت فترة ${operationText} العلامة. كان متاحاً حتى ${editWindowEnd.toLocaleDateString('ar-EG')} (قبل ${daysOverdue} يوم)`,
      daysOverdue,
      sectionDate: sectionDayStart,
      editWindowEnd,
    };
  }
  
  // ✅ ضمن النافذة الزمنية
  const daysRemaining = EDIT_WINDOW_DAYS - daysDiff;
  return {
    isAllowed: true,
    daysRemaining,
    sectionDate: sectionDayStart,
    editWindowEnd,
    message: `متبقي ${daysRemaining} يوم للتعديل`,
  };
}

/**
 * التحقق من نافذة التعديل مع رمي خطأ
 * @param {Date} sectionDate - تاريخ المقطع
 * @param {string} operation - نوع العملية
 * @throws {Error} إذا كانت العلامة غير قابلة للتعديل
 */
function validateMarkEditWindow(sectionDate, operation = 'update') {
  const result = checkMarkEditWindow(sectionDate, operation);
  if (!result.isAllowed) {
    const error = new Error(result.reason);
    error.code = 'EDIT_WINDOW_CLOSED';
    error.details = result;
    throw error;
  }
  return result;
}

module.exports = {
  validateMarksArray,
  validateMarkData,
  validateSectionData,
  isValidObjectId,
  isValidDate,
  validateMonthYear,
  // ⏰ Edit Window
  EDIT_WINDOW_DAYS,
  checkMarkEditWindow,
  validateMarkEditWindow,
};
