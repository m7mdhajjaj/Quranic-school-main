// ============================================================================
// Get Ranking By Averages - جلب الترتيب حسب المعدلات الشهرية
// ============================================================================

const Student = require("../../schema/Student");

/**
 * جلب الترتيب بناءً على معدلات الطلاب الشهرية
 * @route GET /api/rankings/by-averages
 * @access Protected
 */
const getRankingByAverages = async (req, res) => {
  try {
    const { month, year, group } = req.query;
    const today = new Date();
    const currentMonth = month ? parseInt(month) : today.getMonth() + 1;
    const currentYear = year ? parseInt(year) : today.getFullYear();

    // Get user's group
    let userGroup = group || null;
    if (req.user) {
      if (req.user.role === "student") {
        userGroup = req.user.group;
      } else if (req.user.role === "teacher") {
        const Teacher = require("../../schema/Teacher");
        const teacher = await Teacher.findById(req.user._id).select("groups");
        if (teacher && teacher.groups && teacher.groups.length > 0) {
          userGroup = userGroup || teacher.groups[0].name;
        }
      }
      // Admin can see all groups or specific group
    }

    // Build query filter
    const filter = {};
    if (userGroup && req.user && req.user.role !== "admin") {
      filter.group = userGroup;
    } else if (userGroup) {
      filter.group = userGroup;
    }

    // Get all students from the group
    const students = await Student.find(filter).select(
      "studentId firstName fatherName lastName group monthlyAverages"
    );

    // Process students and get their averages for the specified month/year
    const studentsWithAverages = students
      .map((student) => {
        // Find the monthly average for the specified period
        const monthlyAvg = student.monthlyAverages.find(
          (avg) => avg.month === currentMonth && avg.year === currentYear
        );

        return {
          _id: student._id,
          studentId: student.studentId,
          firstName: student.firstName,
          fatherName: student.fatherName,
          lastName: student.lastName,
          group: student.group,
          overallAverage: monthlyAvg?.overallAverage || 0,
          reviewAverage: monthlyAvg?.reviewAverage || 0,
          memorizationAverage: monthlyAvg?.memorizationAverage || 0,
          totalMarks: monthlyAvg?.totalMarks || 0,
        };
      })
      // Sort by overall average descending
      .sort((a, b) => b.overallAverage - a.overallAverage)
      // Add rank
      .map((student, index) => ({
        ...student,
        rank: index + 1,
      }));

    res.status(200).json({
      success: true,
      data: studentsWithAverages,
      month: currentMonth,
      year: currentYear,
      group: userGroup,
      totalStudents: studentsWithAverages.length,
    });
  } catch (error) {
    console.error("Error fetching ranking by averages:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء استرجاع الترتيب",
      error: error.message,
    });
  }
};

module.exports = getRankingByAverages;
