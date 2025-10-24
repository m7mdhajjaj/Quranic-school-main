// ============================================================================
// getMonthlyAverage.js - Get Single Monthly Average
// ============================================================================

const Student = require("../../schema/Student");

/**
 * الحصول على المعدل الشهري للطالب
 * @param {String} studentId - معرف الطالب
 * @param {Number} month - رقم الشهر (1-12)
 * @param {Number} year - السنة
 * @returns {Object} - المعدل الشهري أو null
 */
exports.getMonthlyAverage = async (studentId, month, year) => {
  try {
    console.log(
      `🔍 جلب المعدل الشهري للطالب ${studentId} - ${month}/${year}`
    );

    if (!studentId || !month || !year) {
      throw new Error("معرف الطالب والشهر والسنة مطلوبة");
    }

    const student = await Student.findById(studentId);
    if (!student) {
      console.warn("⚠️ الطالب غير موجود");
      return null;
    }

    const average = student.monthlyAverages.find(
      (avg) => avg.month === month && avg.year === year
    );

    if (average) {
      console.log("✅ تم جلب المعدل الشهري بنجاح");
      return average;
    }

    console.log("⚠️ المعدل الشهري غير موجود");
    return null;
  } catch (error) {
    console.error("❌ خطأ في جلب المعدل الشهري:", error);
    throw error;
  }
};
