// ============================================================================
// getAllMonthlyAverages.js - Get All Monthly Averages
// ============================================================================

const Student = require("../../schema/Student");

/**
 * الحصول على جميع المعدلات الشهرية للطالب
 * @param {String} studentId - معرف الطالب
 * @returns {Array} - مصفوفة المعدلات الشهرية
 */
exports.getAllMonthlyAverages = async (studentId) => {
  try {
    console.log(`🔍 جلب جميع المعدلات الشهرية للطالب ${studentId}`);

    if (!studentId) {
      throw new Error("معرف الطالب مطلوب");
    }

    const student = await Student.findById(studentId);
    if (!student) {
      console.warn("⚠️ الطالب غير موجود");
      return [];
    }

    if (!student.monthlyAverages || student.monthlyAverages.length === 0) {
      console.log("⚠️ لا توجد معدلات شهرية للطالب");
      return [];
    }

    // Sort from newest to oldest
    const sorted = student.monthlyAverages.sort((a, b) => {
      if (a.year !== b.year) {
        return b.year - a.year;
      }
      return b.month - a.month;
    });

    console.log(`✅ تم جلب ${sorted.length} معدل شهري`);
    return sorted;
  } catch (error) {
    console.error("❌ خطأ في جلب المعدلات الشهرية:", error);
    throw error;
  }
};

/**
 * الحصول على المعدلات الشهرية مع تصفية
 * @param {String} studentId - معرف الطالب
 * @param {Object} filter - معايير التصفية { year, month }
 * @returns {Array} - مصفوفة معدلات مصفاة
 */
exports.getAllMonthlyAveragesWithFilter = async (studentId, filter = {}) => {
  try {
    console.log(`🔍 جلب المعدلات الشهرية مع التصفية للطالب ${studentId}`);

    const student = await Student.findById(studentId);
    if (!student) {
      return [];
    }

    let averages = student.monthlyAverages || [];

    // Apply year filter
    if (filter.year) {
      averages = averages.filter((avg) => avg.year === filter.year);
      console.log(`📅 تصفية حسب السنة: ${filter.year}`);
    }

    // Apply month filter
    if (filter.month) {
      averages = averages.filter((avg) => avg.month === filter.month);
      console.log(`📅 تصفية حسب الشهر: ${filter.month}`);
    }

    // Apply minimum overall average filter
    if (filter.minOverall) {
      averages = averages.filter(
        (avg) => avg.overallAverage >= filter.minOverall
      );
      console.log(`📊 تصفية حسب الحد الأدنى: ${filter.minOverall}`);
    }

    // Sort from newest to oldest
    const sorted = averages.sort((a, b) => {
      if (a.year !== b.year) {
        return b.year - a.year;
      }
      return b.month - a.month;
    });

    console.log(`✅ تم جلب ${sorted.length} معدل بعد التصفية`);
    return sorted;
  } catch (error) {
    console.error("❌ خطأ في جلب المعدلات المصفاة:", error);
    throw error;
  }
};

/**
 * Get the latest monthly average
 * @param {String} studentId - معرف الطالب
 * @returns {Object} - Latest average or null
 */
exports.getLatestMonthlyAverage = async (studentId) => {
  try {
    console.log(`🔍 جلب أحدث معدل شهري للطالب ${studentId}`);

    const student = await Student.findById(studentId);
    if (!student || !student.monthlyAverages || student.monthlyAverages.length === 0) {
      return null;
    }

    // Sort and get the first (newest)
    const sorted = student.monthlyAverages.sort((a, b) => {
      if (a.year !== b.year) {
        return b.year - a.year;
      }
      return b.month - a.month;
    });

    console.log(`✅ تم جلب أحدث معدل: ${sorted[0].month}/${sorted[0].year}`);
    return sorted[0];
  } catch (error) {
    console.error("❌ خطأ في جلب أحدث معدل:", error);
    throw error;
  }
};
