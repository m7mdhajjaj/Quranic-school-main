// ============================================================================
// calculateOverallAverage.js - Calculate Overall Average
// ============================================================================

const Student = require("../../schema/Student");

/**
 * حساب المعدل الإجمالي للطالب (لجميع الأشهر)
 * @param {String} studentId - معرف الطالب
 * @returns {Object} - المعدل الإجمالي والإحصائيات
 */
exports.calculateOverallAverage = async (studentId) => {
  try {
    console.log(`📊 حساب المعدل الإجمالي للطالب ${studentId}`);

    if (!studentId) {
      throw new Error("معرف الطالب مطلوب");
    }

    const student = await Student.findById(studentId);
    if (!student || !student.monthlyAverages || student.monthlyAverages.length === 0) {
      console.log("⚠️ لا توجد معدلات شهرية للطالب");
      return null;
    }

    let totalOverall = 0;
    let totalReview = 0;
    let totalMemorization = 0;
    let count = 0;
    let totalMarks = 0;

    student.monthlyAverages.forEach((avg) => {
      if (avg.overallAverage !== null && avg.overallAverage !== undefined) {
        totalOverall += avg.overallAverage;
        count++;
      }
      if (avg.reviewAverage !== null && avg.reviewAverage !== undefined) {
        totalReview += avg.reviewAverage;
      }
      if (
        avg.memorizationAverage !== null &&
        avg.memorizationAverage !== undefined
      ) {
        totalMemorization += avg.memorizationAverage;
      }
      totalMarks += avg.totalMarks || 0;
    });

    if (count === 0) {
      console.log("⚠️ لا توجد معدلات إجمالية صحيحة");
      return null;
    }

    const result = {
      overallAverage: parseFloat((totalOverall / count).toFixed(2)),
      reviewAverage: parseFloat((totalReview / student.monthlyAverages.length).toFixed(2)),
      memorizationAverage: parseFloat((totalMemorization / student.monthlyAverages.length).toFixed(2)),
      monthsCount: student.monthlyAverages.length,
      totalMarks: totalMarks,
      calculatedAt: new Date(),
    };

    console.log("✅ تم حساب المعدل الإجمالي:", result);
    return result;
  } catch (error) {
    console.error("❌ خطأ في حساب المعدل الإجمالي:", error);
    throw error;
  }
};

/**
 * Calculate average for a specific year
 * @param {String} studentId - معرف الطالب
 * @param {Number} year - السنة
 * @returns {Object} - Average for the year
 */
exports.calculateYearlyAverage = async (studentId, year) => {
  try {
    console.log(`📊 حساب المعدل السنوي للطالب ${studentId} - السنة: ${year}`);

    if (!studentId || !year) {
      throw new Error("معرف الطالب والسنة مطلوبة");
    }

    const student = await Student.findById(studentId);
    if (!student) {
      return null;
    }

    const yearAverages = student.monthlyAverages.filter((avg) => avg.year === year);

    if (yearAverages.length === 0) {
      console.log(`⚠️ لا توجد معدلات شهرية للسنة ${year}`);
      return null;
    }

    let totalOverall = 0;
    let totalReview = 0;
    let totalMemorization = 0;
    let count = 0;

    yearAverages.forEach((avg) => {
      if (avg.overallAverage !== null && avg.overallAverage !== undefined) {
        totalOverall += avg.overallAverage;
        count++;
      }
      if (avg.reviewAverage !== null && avg.reviewAverage !== undefined) {
        totalReview += avg.reviewAverage;
      }
      if (
        avg.memorizationAverage !== null &&
        avg.memorizationAverage !== undefined
      ) {
        totalMemorization += avg.memorizationAverage;
      }
    });

    const result = {
      year,
      overallAverage:
        count > 0 ? parseFloat((totalOverall / count).toFixed(2)) : null,
      reviewAverage: parseFloat((totalReview / yearAverages.length).toFixed(2)),
      memorizationAverage: parseFloat((totalMemorization / yearAverages.length).toFixed(2)),
      monthsCount: yearAverages.length,
      totalMarks: yearAverages.reduce((sum, avg) => sum + (avg.totalMarks || 0), 0),
    };

    console.log(`✅ تم حساب المعدل السنوي للسنة ${year}:`, result);
    return result;
  } catch (error) {
    console.error("❌ خطأ في حساب المعدل السنوي:", error);
    throw error;
  }
};

/**
 * Compare two students overall averages
 * @param {String} studentId1 - معرف الطالب الأول
 * @param {String} studentId2 - معرف الطالب الثاني
 * @returns {Object} - Comparison result
 */
exports.compareStudentAverages = async (studentId1, studentId2) => {
  try {
    console.log(`🔄 مقارنة المعدلات بين الطالبين ${studentId1} و ${studentId2}`);

    const avg1 = await exports.calculateOverallAverage(studentId1);
    const avg2 = await exports.calculateOverallAverage(studentId2);

    if (!avg1 || !avg2) {
      console.log("⚠️ لا يمكن مقارنة - أحد الطالبين بدون معدلات");
      return null;
    }

    const diff = avg1.overallAverage - avg2.overallAverage;

    const result = {
      student1: {
        id: studentId1,
        average: avg1.overallAverage,
      },
      student2: {
        id: studentId2,
        average: avg2.overallAverage,
      },
      difference: parseFloat(diff.toFixed(2)),
      winner: diff > 0 ? studentId1 : diff < 0 ? studentId2 : "تعادل",
    };

    console.log("✅ تمت المقارنة:", result);
    return result;
  } catch (error) {
    console.error("❌ خطأ في مقارنة المعدلات:", error);
    throw error;
  }
};
