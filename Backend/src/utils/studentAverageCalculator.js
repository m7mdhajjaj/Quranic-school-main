// utils/studentAverageCalculator.js

const Student = require("../schema/Student");
const Mark = require("../schema/Mark");
const Section = require("../schema/Section");

/**
 * حساب وتحديث المعدل الشهري للطالب
 * @param {String} studentId - معرف الطالب
 * @param {Number} month - رقم الشهر (1-12)
 * @param {Number} year - السنة
 * @returns {Object} - المعدلات المحسوبة
 */
const calculateAndUpdateMonthlyAverage = async (studentId, month, year) => {
  try {
    console.log(
      `📊 حساب المعدل الشهري للطالب ${studentId} - الشهر: ${month}/${year}`
    );

    // الحصول على جميع المقاطع في هذا الشهر
    const startDate = new Date(year, month - 1, 1); // أول يوم في الشهر
    const endDate = new Date(year, month, 0); // آخر يوم في الشهر

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

    // الحصول على علامات الطالب في هذا الشهر
    const marks = await Mark.find({
      studentId: studentId,
      sectionId: { $in: sectionIds },
    });

    // إذا لم توجد علامات، احذف المعدل الشهري إن وجد
    if (marks.length === 0) {
      console.log("⚠️ لا توجد علامات للطالب في هذا الشهر - حذف المعدل الشهري");

      const student = await Student.findById(studentId);
      if (student) {
        // حذف المعدل الشهري من المصفوفة
        student.monthlyAverages = student.monthlyAverages.filter(
          (avg) => !(avg.month === month && avg.year === year)
        );
        await student.save();
        console.log("✅ تم حذف المعدل الشهري لعدم وجود علامات");
      }

      return null;
    }

    // حساب المعدلات
    let totalReview = 0;
    let totalMemorization = 0;
    let reviewCount = 0;
    let memorizationCount = 0;

    marks.forEach((mark) => {
      if (mark.reviewMark !== null && mark.reviewMark !== undefined) {
        totalReview += mark.reviewMark;
        reviewCount++;
      }
      if (
        mark.memorizationMark !== null &&
        mark.memorizationMark !== undefined
      ) {
        totalMemorization += mark.memorizationMark;
        memorizationCount++;
      }
    });

    // حساب المعدلات من 10 ثم تحويلها إلى 100
    const reviewAverage =
      reviewCount > 0
        ? parseFloat(((totalReview / reviewCount) * 10).toFixed(2))
        : null;
    const memorizationAverage =
      memorizationCount > 0
        ? parseFloat(((totalMemorization / memorizationCount) * 10).toFixed(2))
        : null;

    // حساب المعدل الإجمالي (متوسط المراجعة والحفظ) من 100
    let overallAverage = null;
    if (reviewAverage !== null && memorizationAverage !== null) {
      overallAverage = parseFloat(
        ((reviewAverage + memorizationAverage) / 2).toFixed(2)
      );
    } else if (reviewAverage !== null) {
      overallAverage = reviewAverage;
    } else if (memorizationAverage !== null) {
      overallAverage = memorizationAverage;
    }

    console.log(`✅ المعدلات المحسوبة (من 100):`, {
      reviewAverage,
      memorizationAverage,
      overallAverage,
      totalMarks: marks.length,
    });

    // تحديث أو إضافة المعدل الشهري في schema الطالب
    const student = await Student.findById(studentId);
    if (!student) {
      console.error("❌ الطالب غير موجود");
      return null;
    }

    // البحث عن المعدل الشهري الموجود
    const existingAverageIndex = student.monthlyAverages.findIndex(
      (avg) => avg.month === month && avg.year === year
    );

    const averageData = {
      month,
      year,
      reviewAverage,
      memorizationAverage,
      overallAverage,
      totalMarks: marks.length,
      lastUpdated: new Date(),
    };

    if (existingAverageIndex !== -1) {
      // تحديث المعدل الموجود
      student.monthlyAverages[existingAverageIndex] = averageData;
      console.log("🔄 تحديث المعدل الشهري الموجود");
    } else {
      // إضافة معدل جديد
      student.monthlyAverages.push(averageData);
      console.log("➕ إضافة معدل شهري جديد");
    }

    await student.save();
    console.log("✅ تم حفظ المعدل الشهري بنجاح");

    return averageData;
  } catch (error) {
    console.error("❌ خطأ في حساب المعدل الشهري:", error);
    throw error;
  }
};

/**
 * الحصول على المعدل الشهري للطالب
 * @param {String} studentId - معرف الطالب
 * @param {Number} month - رقم الشهر (1-12)
 * @param {Number} year - السنة
 * @returns {Object} - المعدل الشهري
 */
const getMonthlyAverage = async (studentId, month, year) => {
  try {
    const student = await Student.findById(studentId);
    if (!student) {
      return null;
    }

    const average = student.monthlyAverages.find(
      (avg) => avg.month === month && avg.year === year
    );

    return average || null;
  } catch (error) {
    console.error("❌ خطأ في الحصول على المعدل الشهري:", error);
    throw error;
  }
};

/**
 * الحصول على جميع المعدلات الشهرية للطالب
 * @param {String} studentId - معرف الطالب
 * @returns {Array} - مصفوفة المعدلات الشهرية
 */
const getAllMonthlyAverages = async (studentId) => {
  try {
    const student = await Student.findById(studentId);
    if (!student) {
      return [];
    }

    // ترتيب المعدلات من الأحدث إلى الأقدم
    return student.monthlyAverages.sort((a, b) => {
      if (a.year !== b.year) {
        return b.year - a.year;
      }
      return b.month - a.month;
    });
  } catch (error) {
    console.error("❌ خطأ في الحصول على جميع المعدلات الشهرية:", error);
    throw error;
  }
};

/**
 * حساب المعدل الإجمالي للطالب (لجميع الأشهر)
 * @param {String} studentId - معرف الطالب
 * @returns {Object} - المعدل الإجمالي
 */
const calculateOverallAverage = async (studentId) => {
  try {
    const student = await Student.findById(studentId);
    if (!student || student.monthlyAverages.length === 0) {
      return null;
    }

    let totalOverall = 0;
    let count = 0;

    student.monthlyAverages.forEach((avg) => {
      if (avg.overallAverage !== null && avg.overallAverage !== undefined) {
        totalOverall += avg.overallAverage;
        count++;
      }
    });

    const overallAverage =
      count > 0 ? parseFloat((totalOverall / count).toFixed(2)) : null;

    return {
      overallAverage,
      monthsCount: count,
      totalMarks: student.monthlyAverages.reduce(
        (sum, avg) => sum + avg.totalMarks,
        0
      ),
    };
  } catch (error) {
    console.error("❌ خطأ في حساب المعدل الإجمالي:", error);
    throw error;
  }
};

module.exports = {
  calculateAndUpdateMonthlyAverage,
  getMonthlyAverage,
  getAllMonthlyAverages,
  calculateOverallAverage,
};
