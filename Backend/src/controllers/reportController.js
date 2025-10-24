const Mark = require("../schema/DailyMark");
const ExamMark = require("../schema/ExamMark");
const Student = require("../schema/Student");
const Group = require("../schema/Group");
const Attendance = require("../schema/Attendance");
const mongoose = require("mongoose");

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

// Get average marks for all students (monthly/yearly) - للمعلم
exports.getAverageMarks = async (req, res) => {
  try {
    const { month, year, groupName } = req.query;
    const userRole = req.user?.role;
    const userId = req.user?._id || req.user?.id;

    let targetGroupName = groupName;

    // إذا كان معلم ولم يحدد groupName، جيب حلقته الخاصة
    if (!targetGroupName && userRole === "teacher") {
      const Teacher = require("../schema/Teacher");
      const Group = require("../schema/Group");

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

// Get detailed student report
exports.getStudentReport = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { startDate, endDate } = req.query;

    // Build date filter
    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter = {
        createdAt: {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        },
      };
    }

    // Get student info
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "الطالب غير موجود",
      });
    }

    // Get attendance stats
    const attendanceStats = await Attendance.aggregate([
      {
        $match: {
          student: new mongoose.Types.ObjectId(studentId),
          ...dateFilter,
        },
      },
      {
        $group: {
          _id: null,
          present: { $sum: { $cond: [{ $eq: ["$status", "present"] }, 1, 0] } },
          absent: { $sum: { $cond: [{ $eq: ["$status", "absent"] }, 1, 0] } },
          excused: { $sum: { $cond: [{ $eq: ["$status", "excused"] }, 1, 0] } },
          late: { $sum: { $cond: [{ $eq: ["$status", "late"] }, 1, 0] } },
          total: { $sum: 1 },
        },
      },
    ]);

    // Get marks stats
    const marksStats = await Mark.aggregate([
      {
        $match: {
          student: new mongoose.Types.ObjectId(studentId),
          ...dateFilter,
        },
      },
      {
        $group: {
          _id: null,
          avgMemorization: { $avg: { $toDouble: "$memorizationMark" } },
          avgReview: { $avg: { $toDouble: "$reviewMark" } },
          count: { $sum: 1 },
        },
      },
    ]);

    // Get exam marks stats
    const examStats = await ExamMark.aggregate([
      {
        $match: {
          student: new mongoose.Types.ObjectId(studentId),
          ...dateFilter,
        },
      },
      {
        $group: {
          _id: null,
          average: { $avg: { $toDouble: "$mark" } },
          total: { $sum: { $toDouble: "$mark" } },
          count: { $sum: 1 },
        },
      },
    ]);

    const attendance = attendanceStats[0] || {
      present: 0,
      absent: 0,
      excused: 0,
      late: 0,
      total: 0,
    };
    const marks = marksStats[0] || {
      avgMemorization: 0,
      avgReview: 0,
      count: 0,
    };
    const exams = examStats[0] || { average: 0, total: 0, count: 0 };

    const report = {
      studentId: student._id,
      studentName: `${student.firstName} ${student.fatherName} ${student.lastName}`,
      group: student.group,
      attendance: {
        present: attendance.present,
        absent: attendance.absent,
        excused: attendance.excused,
        late: attendance.late,
        percentage:
          attendance.total > 0
            ? Math.round((attendance.present / attendance.total) * 100)
            : 0,
      },
      marks: {
        average:
          Math.round(((marks.avgMemorization + marks.avgReview) / 2) * 10) / 10,
        total: marks.count * 10, // Assuming max mark is 10
        count: marks.count,
      },
      exams: {
        average: Math.round(exams.average * 10) / 10,
        total: Math.round(exams.total * 10) / 10,
        count: exams.count,
      },
      rank: 1, // TODO: Calculate actual rank
    };

    res.json(report);
  } catch (error) {
    console.error("Error in getStudentReport:", error);
    res.status(500).json({
      success: false,
      message: "خطأ في جلب تقرير الطالب",
    });
  }
};

// Get group report
exports.getGroupReport = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { startDate, endDate } = req.query;

    // Build date filter
    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter = {
        createdAt: {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        },
      };
    }

    // Get group info
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({
        success: false,
        message: "المجموعة غير موجودة",
      });
    }

    // Get students in group
    const students = await Student.find({ group: group.name });
    const studentIds = students.map((s) => s._id);

    // Get group attendance average
    const attendanceStats = await Attendance.aggregate([
      {
        $match: {
          student: { $in: studentIds },
          ...dateFilter,
        },
      },
      {
        $group: {
          _id: null,
          present: { $sum: { $cond: [{ $eq: ["$status", "present"] }, 1, 0] } },
          total: { $sum: 1 },
        },
      },
    ]);

    // Get group marks average
    const marksStats = await Mark.aggregate([
      {
        $match: {
          student: { $in: studentIds },
          ...dateFilter,
        },
      },
      {
        $group: {
          _id: null,
          avgMemorization: { $avg: { $toDouble: "$memorizationMark" } },
          avgReview: { $avg: { $toDouble: "$reviewMark" } },
        },
      },
    ]);

    // Get top students
    const topStudents = await Mark.aggregate([
      {
        $match: {
          student: { $in: studentIds },
          ...dateFilter,
        },
      },
      {
        $group: {
          _id: "$student",
          avgMemorization: { $avg: { $toDouble: "$memorizationMark" } },
          avgReview: { $avg: { $toDouble: "$reviewMark" } },
        },
      },
      {
        $addFields: {
          average: { $avg: ["$avgMemorization", "$avgReview"] },
        },
      },
      { $sort: { average: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "students",
          localField: "_id",
          foreignField: "_id",
          as: "student",
        },
      },
      {
        $project: {
          studentId: "$_id",
          name: {
            $concat: [
              { $arrayElemAt: ["$student.firstName", 0] },
              " ",
              { $arrayElemAt: ["$student.fatherName", 0] },
            ],
          },
          average: { $round: ["$average", 1] },
        },
      },
    ]);

    const attendance = attendanceStats[0] || { present: 0, total: 0 };
    const marks = marksStats[0] || { avgMemorization: 0, avgReview: 0 };

    const report = {
      groupId: group._id,
      groupName: group.name,
      totalStudents: students.length,
      averageAttendance:
        attendance.total > 0
          ? Math.round((attendance.present / attendance.total) * 100)
          : 0,
      averageMarks:
        Math.round(((marks.avgMemorization + marks.avgReview) / 2) * 10) / 10,
      topStudents,
    };

    res.json(report);
  } catch (error) {
    console.error("Error in getGroupReport:", error);
    res.status(500).json({
      success: false,
      message: "خطأ في جلب تقرير المجموعة",
    });
  }
};

// Export student report as PDF (placeholder)
exports.exportStudentReportPDF = async (req, res) => {
  try {
    // TODO: Implement PDF generation
    res.status(501).json({
      success: false,
      message: "تصدير PDF غير متوفر حالياً",
    });
  } catch (error) {
    console.error("Error in exportStudentReportPDF:", error);
    res.status(500).json({
      success: false,
      message: "خطأ في تصدير تقرير الطالب",
    });
  }
};

// Export group report as PDF (placeholder)
exports.exportGroupReportPDF = async (req, res) => {
  try {
    // TODO: Implement PDF generation
    res.status(501).json({
      success: false,
      message: "تصدير PDF غير متوفر حالياً",
    });
  } catch (error) {
    console.error("Error in exportGroupReportPDF:", error);
    res.status(500).json({
      success: false,
      message: "خطأ في تصدير تقرير المجموعة",
    });
  }
};
