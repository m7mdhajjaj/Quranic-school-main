// ============================================================================
// calculateMonthlyAverage.js - Calculate and Update Monthly Average
// ============================================================================

const Student = require("../../schema/Student");
const Mark = require("../../schema/DailyMark/DailyMark");
const Section = require("../../schema/DailyMark/Section");
const {
  calculateReviewAverage,
  calculateMemorizationAverage,
  calculateOverallMarkAverage,
  countMarksByType,
} = require("./helpers/markCalculations");
const { getMonthDateRange } = require("./helpers/dateHelpers");

/**
 * حساب وتحديث المعدل الشهري للطالب
 * @param {String} studentId - معرف الطالب
 * @param {Number} month - رقم الشهر (1-12)
 * @param {Number} year - السنة
 * @returns {Object} - المعدلات المحسوبة
 */
exports.calculateAndUpdateMonthlyAverage = async (studentId, month, year) => {
  try {
    console.log(
      `📊 حساب المعدل الشهري للطالب ${studentId} - الشهر: ${month}/${year}`
    );

    // Validate inputs
    if (!studentId || !month || !year) {
      throw new Error("معرف الطالب والشهر والسنة مطلوبة");
    }

    // Get date range for the month
    const { startDate, endDate } = getMonthDateRange(month, year);

    // Get all sections in this month
    const sectionsInMonth = await Section.find({
      date: {
        $gte: startDate,
        $lte: endDate,
      },
    });

    if (sectionsInMonth.length === 0) {
      console.log("⚠️ لا توجد مقاطع في هذا الشهر");
      return null;
    }

    const sectionIds = sectionsInMonth.map((s) => s._id);

    // Get student marks in this month
    const marks = await Mark.find({
      studentId: studentId,
      sectionId: { $in: sectionIds },
    });

    // If no marks exist, delete the monthly average if it exists
    if (marks.length === 0) {
      console.log("⚠️ لا توجد علامات للطالب في هذا الشهر - حذف المعدل الشهري");

      const student = await Student.findById(studentId);
      if (student) {
        student.monthlyAverages = student.monthlyAverages.filter(
          (avg) => !(avg.month === month && avg.year === year)
        );
        await student.save();
        console.log("✅ تم حذف المعدل الشهري لعدم وجود علامات");
      }

      return null;
    }

    console.log(`📝 وجدت ${marks.length} علامة للطالب`);

    // Calculate averages using helper functions
    const reviewAverage = calculateReviewAverage(marks);
    const memorizationAverage = calculateMemorizationAverage(marks);
    const overallAverage = calculateOverallMarkAverage(
      reviewAverage,
      memorizationAverage
    );

    // Count marks by type
    const markCounts = countMarksByType(marks);

    console.log(`✅ المعدلات المحسوبة (من 100):`, {
      reviewAverage,
      memorizationAverage,
      overallAverage,
      ...markCounts,
    });

    // Find or create student
    const student = await Student.findById(studentId);
    if (!student) {
      console.error("❌ الطالب غير موجود");
      return null;
    }

    // Prepare average data
    const averageData = {
      month,
      year,
      reviewAverage,
      memorizationAverage,
      overallAverage,
      totalMarks: marks.length,
      reviewMarksCount: markCounts.reviewCount,
      memorizationMarksCount: markCounts.memorizationCount,
      lastUpdated: new Date(),
    };

    // Find existing average index
    const existingAverageIndex = student.monthlyAverages.findIndex(
      (avg) => avg.month === month && avg.year === year
    );

    if (existingAverageIndex !== -1) {
      // Update existing average
      student.monthlyAverages[existingAverageIndex] = averageData;
      console.log("🔄 تحديث المعدل الشهري الموجود");
    } else {
      // Add new average
      student.monthlyAverages.push(averageData);
      console.log("➕ إضافة معدل شهري جديد");
    }

    // Save to database
    await student.save();
    console.log("✅ تم حفظ المعدل الشهري بنجاح");

    return averageData;
  } catch (error) {
    console.error("❌ خطأ في حساب المعدل الشهري:", error);
    throw error;
  }
};
