// ============================================================================
// Mark Helpers - دوال مساعدة مشتركة للعلامات
// ============================================================================
// هذا الملف يحتوي على الدوال المشتركة بين operations العلامات

const {
  calculateAndUpdateMonthlyAverage,
} = require("../../../services/StudentAverageService");
const {
  updateSectionMarksStatus,
  updateMultipleSectionsMarksStatus,
} = require("../SectionControllers/sectionMarksStatus");
const { createLogger } = require("../../../utils/logger");

const logger = createLogger('MarkHelpers');

// ============================================================================
// Monthly Average Update
// ============================================================================

/**
 * تحديث المتوسط الشهري لطالب بناءً على تاريخ المقطع
 * @param {ObjectId} studentId - معرف الطالب
 * @param {Object} section - كائن المقطع (يحتوي على date)
 */
async function updateStudentMonthlyAverage(studentId, section) {
  if (section && section.date) {
    logger.debug("🔄 تحديث المتوسط الشهري...");
    const sectionDate = new Date(section.date);
    const month = sectionDate.getMonth() + 1;
    const year = sectionDate.getFullYear();

    try {
      await calculateAndUpdateMonthlyAverage(studentId, month, year);
      logger.debug("✅ تم تحديث المتوسط الشهري");
      return true;
    } catch (avgError) {
      logger.error("⚠️ خطأ في تحديث المتوسط الشهري:", avgError);
      return false;
    }
  }
  return false;
}

/**
 * تحديث المتوسط الشهري لعدة طلاب
 * @param {Array} studentIds - قائمة معرفات الطلاب
 * @param {Number} month - الشهر (اختياري - يستخدم الشهر الحالي)
 * @param {Number} year - السنة (اختياري - يستخدم السنة الحالية)
 */
async function updateMultipleStudentsMonthlyAverage(studentIds, month = null, year = null) {
  logger.debug("🔄 تحديث المتوسطات الشهرية...");
  
  const now = new Date();
  const targetMonth = month || (now.getMonth() + 1);
  const targetYear = year || now.getFullYear();
  
  const updatePromises = studentIds.map(async (studentId) => {
    try {
      await calculateAndUpdateMonthlyAverage(studentId, targetMonth, targetYear);
    } catch (error) {
      logger.error(`⚠️ خطأ في تحديث المتوسط للطالب ${studentId}:`, error);
    }
  });
  
  await Promise.all(updatePromises);
  logger.debug("✅ تم تحديث المتوسطات الشهرية");
}

// ============================================================================
// Section Marks Status Update
// ============================================================================

/**
 * تحديث حالة العلامات لمقطع واحد
 * @param {String} sectionId - معرف المقطع
 * @param {String} group - اسم الحلقة (اختياري)
 */
async function updateSingleSectionStatus(sectionId, group = null) {
  try {
    await updateSectionMarksStatus(sectionId, group);
    logger.debug("✅ تم تحديث حالة علامات المقطع");
    return true;
  } catch (statusError) {
    logger.error("⚠️ خطأ في تحديث حالة علامات المقطع:", statusError);
    return false;
  }
}

/**
 * تحديث حالة العلامات لعدة مقاطع
 * @param {Array} sectionIds - قائمة معرفات المقاطع
 */
async function updateMultipleSectionsStatus(sectionIds) {
  logger.debug("🔄 تحديث حالة علامات المقاطع...");
  try {
    await updateMultipleSectionsMarksStatus(sectionIds);
    logger.debug("✅ تم تحديث حالة علامات المقاطع");
    return true;
  } catch (error) {
    logger.error("⚠️ خطأ في تحديث حالة علامات المقاطع:", error);
    return false;
  }
}

// ============================================================================
// Notification & Socket Helpers
// ============================================================================

/**
 * إرسال إشعار Socket.IO
 * @param {Object} io - Socket.IO instance
 * @param {String} eventName - اسم الحدث
 * @param {Object} data - البيانات المرسلة
 */
function emitSocketEvent(io, eventName, data) {
  if (io) {
    logger.debug(`📡 إرسال حدث ${eventName}...`);
    io.emit(eventName, {
      ...data,
      timestamp: Date.now(),
    });
    logger.debug(`✅ تم إرسال حدث ${eventName}`);
    return true;
  }
  return false;
}

/**
 * إرسال إشعار وحدث Socket للعلامة
 * @param {Object} io - Socket.IO instance
 * @param {Function} notifyFunction - دالة الإشعار
 * @param {Object} mark - العلامة
 * @param {Object} additionalData - بيانات إضافية
 */
async function notifyAndEmitMarkEvent(io, notifyFunction, mark, additionalData = {}) {
  // إرسال الإشعار
  logger.debug("🔔 إرسال الإشعار...");
  await notifyFunction(mark, io, ...Object.values(additionalData));
  
  // إرسال حدث Socket.IO
  const eventName = additionalData.isNew ? "markCreated" : "markUpdated";
  emitSocketEvent(io, eventName, {
    mark,
    ...additionalData,
  });
}

// ============================================================================
// Validation Helpers
// ============================================================================

/**
 * Validate marks array
 * @param {Array} marks - Array of marks to validate
 * @throws {Error} If marks array is invalid
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
 * Collect unique IDs from marks array
 * @param {Array} marks - Array of mark objects
 * @returns {Object} Object with studentIds and sectionIds sets
 */
function collectMarkIds(marks) {
  const studentIds = new Set();
  const sectionIds = new Set();

  marks.forEach((mark) => {
    if (mark.studentId) {
      studentIds.add(mark.studentId.toString());
    }
    if (mark.sectionId) {
      sectionIds.add(mark.sectionId.toString());
    }
  });

  return { studentIds, sectionIds };
}

// ============================================================================
// Exports
// ============================================================================

module.exports = {
  // Monthly Average
  updateStudentMonthlyAverage,
  updateMultipleStudentsMonthlyAverage,
  
  // Section Status
  updateSingleSectionStatus,
  updateMultipleSectionsStatus,
  
  // Notifications & Socket
  emitSocketEvent,
  notifyAndEmitMarkEvent,
  
  // Validation & Utilities
  validateMarksArray,
  collectMarkIds,
};
