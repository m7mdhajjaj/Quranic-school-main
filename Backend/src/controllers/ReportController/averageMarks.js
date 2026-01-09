// ============================================================================
// ReportController/averageMarks.js - Average Marks for Groups
// ============================================================================

const Student = require("../../schema/Student");
const Teacher = require("../../schema/Teacher");
const Group = require("../../schema/Group");

// Get average marks for all students (monthly/yearly) - للمعلم
exports.getAverageMarks = async (req, res) => {
  try {
    const { month, year, groupName, groupId } = req.query;
    const userRole = req.user?.role;
    const userId = req.user?._id || req.user?.id;

    let targetGroupName = groupName;

    // إذا تم تمرير groupId، استخدمه للبحث عن اسم الحلقة
    if (groupId && !targetGroupName) {
      const group = await Group.findById(groupId);
      if (group) {
        targetGroupName = group.name;
      }
    }

    // إذا كان معلم ولم يحدد groupName أو groupId، جيب أول حلقة له
    if (!targetGroupName && userRole === "teacher") {
      const teacher = await Teacher.findById(userId);

      if (teacher) {
        // جيب أول حلقة للمعلم
        const group = await Group.findOne({ teacher: teacher._id });

        if (group) {
          targetGroupName = group.name;
        }
      }
    }

    // إذا كان طالب، جيب حلقته
    if (!targetGroupName && userRole === "student") {
      const student = await Student.findById(userId);
      if (student && student.group) {
        targetGroupName = student.group;
      }
    }

    if (!targetGroupName) {
      return res.json({
        success: true,
        labels: [],
        data: [],
        message: "لا توجد حلقة مرتبطة بالمستخدم",
        totalStudents: 0,
        totalRecords: 0,
      });
    }

    // Get all students in the group
    const students = await Student.find({ group: targetGroupName });

    if (!students || students.length === 0) {
      return res.json({
        success: true,
        labels: [],
        data: [],
        message: "لا يوجد طلاب في هذه الحلقة",
        totalStudents: 0,
      });
    }

    // Collect all monthly averages from all students
    const allAverages = {};

    students.forEach((student) => {
      const monthlyAverages = student.monthlyAverages || [];

      monthlyAverages.forEach((avg) => {
        // Filter by year and month if provided
        if (year && avg.year !== parseInt(year)) return;
        if (month && avg.month !== parseInt(month)) return;

        const key = `${avg.month}/${avg.year}`;

        if (!allAverages[key]) {
          allAverages[key] = {
            month: avg.month,
            year: avg.year,
            sum: 0,
            count: 0,
          };
        }

        // Add student's average (الحفظ + المراجعة) / 2
        let studentAvg = 0;
        if (avg.overallAverage !== null && avg.overallAverage !== undefined) {
          studentAvg = avg.overallAverage;
        } else if (
          avg.memorizationAverage !== null &&
          avg.reviewAverage !== null
        ) {
          studentAvg = (avg.memorizationAverage + avg.reviewAverage) / 2;
        }

        allAverages[key].sum += studentAvg;
        allAverages[key].count += 1;
      });
    });

    // Calculate averages and sort
    const sortedAverages = Object.values(allAverages)
      .map((item) => ({
        month: item.month,
        year: item.year,
        average: item.count > 0 ? item.sum / item.count : 0,
      }))
      .sort((a, b) => {
        if (a.year !== b.year) return a.year - b.year;
        return a.month - b.month;
      });

    // Format data for charts
    const labels = sortedAverages.map((avg) => `${avg.month}/${avg.year}`);
    const data = sortedAverages.map((avg) => Math.round(avg.average * 10) / 10);

    res.json({
      success: true,
      labels,
      data,
      groupName: targetGroupName,
      totalStudents: students.length,
      totalRecords: sortedAverages.length,
    });
  } catch (error) {
    console.error("Error in getAverageMarks:", error);
    res.status(500).json({
      success: false,
      message: "خطأ في جلب متوسط العلامات",
    });
  }
};
