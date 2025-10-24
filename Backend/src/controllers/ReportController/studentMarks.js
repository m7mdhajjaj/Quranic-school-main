// ============================================================================
// ReportController/studentMarks.js - Student Marks for Charts
// ============================================================================

const Student = require("../../schema/Student");

// Get student marks for charts (monthly/yearly)
exports.getStudentMarks = async (req, res) => {
  try {
    const { month, year, studentId } = req.query;

    if (!studentId) {
      return res.status(400).json({
        success: false,
        message: "معرف الطالب مطلوب",
      });
    }

    // Get student with monthly averages
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "الطالب غير موجود",
      });
    }

    // Filter monthly averages based on month and year
    let filteredAverages = student.monthlyAverages || [];

    if (year) {
      filteredAverages = filteredAverages.filter(
        (avg) => avg.year === parseInt(year)
      );

      if (month) {
        filteredAverages = filteredAverages.filter(
          (avg) => avg.month === parseInt(month)
        );
      }
    }

    // Sort by year and month
    filteredAverages.sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return a.month - b.month;
    });

    // Format data for charts
    const labels = filteredAverages.map((avg) => `${avg.month}/${avg.year}`);
    const data = filteredAverages.map((avg) => {
      // المعدل = (الحفظ + المراجعة) / 2
      if (avg.overallAverage !== null && avg.overallAverage !== undefined) {
        return Math.round(avg.overallAverage * 10) / 10;
      }

      // إذا لم يكن هناك معدل إجمالي محفوظ، احسبه من الحفظ والمراجعة
      if (avg.memorizationAverage !== null && avg.reviewAverage !== null) {
        return (
          Math.round(((avg.memorizationAverage + avg.reviewAverage) / 2) * 10) /
          10
        );
      }

      return 0;
    });

    res.json({
      success: true,
      labels,
      data,
      studentName: `${student.firstName} ${student.lastName}`,
      totalRecords: filteredAverages.length,
    });
  } catch (error) {
    console.error("Error in getStudentMarks:", error);
    res.status(500).json({
      success: false,
      message: "خطأ في جلب علامات الطالب",
    });
  }
};
