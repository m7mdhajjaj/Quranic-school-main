const Mark = require("../schema/Mark");
const ExamMark = require("../schema/ExamMark");
const Student = require("../schema/Student");
const Group = require("../schema/Group");
const Attendance = require("../schema/Attendance");
const mongoose = require("mongoose");

// Get student marks for charts (monthly/yearly)
exports.getStudentMarks = async (req, res) => {
  try {
    const { month, year, studentId } = req.query;
    
    // Build date filter
    let dateFilter = {};
    if (year) {
      const startDate = new Date(year, month ? month - 1 : 0, 1);
      const endDate = new Date(year, month ? month : 12, 0);
      dateFilter = {
        createdAt: {
          $gte: startDate,
          $lte: endDate
        }
      };
    }

    // Build student filter
    let studentFilter = {};
    if (studentId) {
      studentFilter.student = studentId;
    }

    const marks = await Mark.aggregate([
      {
        $match: {
          ...studentFilter,
          ...dateFilter
        }
      },
      {
        $group: {
          _id: {
            month: { $month: "$createdAt" },
            year: { $year: "$createdAt" }
          },
          avgMemorization: { $avg: { $toDouble: "$memorizationMark" } },
          avgReview: { $avg: { $toDouble: "$reviewMark" } }
        }
      },
      {
        $project: {
          _id: 0,
          month: "$_id.month",
          year: "$_id.year",
          average: { $avg: ["$avgMemorization", "$avgReview"] }
        }
      },
      { $sort: { year: 1, month: 1 } }
    ]);

    // Format data for charts
    const labels = marks.map(mark => `${mark.month}/${mark.year}`);
    const data = marks.map(mark => Math.round(mark.average * 10) / 10);

    res.json({
      success: true,
      labels,
      data
    });
  } catch (error) {
    console.error("Error in getStudentMarks:", error);
    res.status(500).json({
      success: false,
      message: "خطأ في جلب علامات الطالب"
    });
  }
};

// Get average marks for all students (monthly/yearly)
exports.getAverageMarks = async (req, res) => {
  try {
    const { month, year } = req.query;
    
    // Build date filter
    let dateFilter = {};
    if (year) {
      const startDate = new Date(year, month ? month - 1 : 0, 1);
      const endDate = new Date(year, month ? month : 12, 0);
      dateFilter = {
        createdAt: {
          $gte: startDate,
          $lte: endDate
        }
      };
    }

    const marks = await Mark.aggregate([
      {
        $match: dateFilter
      },
      {
        $group: {
          _id: {
            month: { $month: "$createdAt" },
            year: { $year: "$createdAt" }
          },
          avgMemorization: { $avg: { $toDouble: "$memorizationMark" } },
          avgReview: { $avg: { $toDouble: "$reviewMark" } }
        }
      },
      {
        $project: {
          _id: 0,
          month: "$_id.month",
          year: "$_id.year",
          average: { $avg: ["$avgMemorization", "$avgReview"] }
        }
      },
      { $sort: { year: 1, month: 1 } }
    ]);

    // Format data for charts
    const labels = marks.map(mark => `${mark.month}/${mark.year}`);
    const data = marks.map(mark => Math.round(mark.average * 10) / 10);

    res.json({
      success: true,
      labels,
      data
    });
  } catch (error) {
    console.error("Error in getAverageMarks:", error);
    res.status(500).json({
      success: false,
      message: "خطأ في جلب متوسط العلامات"
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
          $lte: new Date(endDate)
        }
      };
    }

    // Get student info
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "الطالب غير موجود"
      });
    }

    // Get attendance stats
    const attendanceStats = await Attendance.aggregate([
      {
        $match: {
          student: new mongoose.Types.ObjectId(studentId),
          ...dateFilter
        }
      },
      {
        $group: {
          _id: null,
          present: { $sum: { $cond: [{ $eq: ["$status", "present"] }, 1, 0] } },
          absent: { $sum: { $cond: [{ $eq: ["$status", "absent"] }, 1, 0] } },
          excused: { $sum: { $cond: [{ $eq: ["$status", "excused"] }, 1, 0] } },
          late: { $sum: { $cond: [{ $eq: ["$status", "late"] }, 1, 0] } },
          total: { $sum: 1 }
        }
      }
    ]);

    // Get marks stats
    const marksStats = await Mark.aggregate([
      {
        $match: {
          student: new mongoose.Types.ObjectId(studentId),
          ...dateFilter
        }
      },
      {
        $group: {
          _id: null,
          avgMemorization: { $avg: { $toDouble: "$memorizationMark" } },
          avgReview: { $avg: { $toDouble: "$reviewMark" } },
          count: { $sum: 1 }
        }
      }
    ]);

    // Get exam marks stats
    const examStats = await ExamMark.aggregate([
      {
        $match: {
          student: new mongoose.Types.ObjectId(studentId),
          ...dateFilter
        }
      },
      {
        $group: {
          _id: null,
          average: { $avg: { $toDouble: "$mark" } },
          total: { $sum: { $toDouble: "$mark" } },
          count: { $sum: 1 }
        }
      }
    ]);

    const attendance = attendanceStats[0] || { present: 0, absent: 0, excused: 0, late: 0, total: 0 };
    const marks = marksStats[0] || { avgMemorization: 0, avgReview: 0, count: 0 };
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
        percentage: attendance.total > 0 ? Math.round((attendance.present / attendance.total) * 100) : 0
      },
      marks: {
        average: Math.round(((marks.avgMemorization + marks.avgReview) / 2) * 10) / 10,
        total: marks.count * 10, // Assuming max mark is 10
        count: marks.count
      },
      exams: {
        average: Math.round(exams.average * 10) / 10,
        total: Math.round(exams.total * 10) / 10,
        count: exams.count
      },
      rank: 1 // TODO: Calculate actual rank
    };

    res.json(report);
  } catch (error) {
    console.error("Error in getStudentReport:", error);
    res.status(500).json({
      success: false,
      message: "خطأ في جلب تقرير الطالب"
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
          $lte: new Date(endDate)
        }
      };
    }

    // Get group info
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({
        success: false,
        message: "المجموعة غير موجودة"
      });
    }

    // Get students in group
    const students = await Student.find({ group: group.name });
    const studentIds = students.map(s => s._id);

    // Get group attendance average
    const attendanceStats = await Attendance.aggregate([
      {
        $match: {
          student: { $in: studentIds },
          ...dateFilter
        }
      },
      {
        $group: {
          _id: null,
          present: { $sum: { $cond: [{ $eq: ["$status", "present"] }, 1, 0] } },
          total: { $sum: 1 }
        }
      }
    ]);

    // Get group marks average
    const marksStats = await Mark.aggregate([
      {
        $match: {
          student: { $in: studentIds },
          ...dateFilter
        }
      },
      {
        $group: {
          _id: null,
          avgMemorization: { $avg: { $toDouble: "$memorizationMark" } },
          avgReview: { $avg: { $toDouble: "$reviewMark" } }
        }
      }
    ]);

    // Get top students
    const topStudents = await Mark.aggregate([
      {
        $match: {
          student: { $in: studentIds },
          ...dateFilter
        }
      },
      {
        $group: {
          _id: "$student",
          avgMemorization: { $avg: { $toDouble: "$memorizationMark" } },
          avgReview: { $avg: { $toDouble: "$reviewMark" } }
        }
      },
      {
        $addFields: {
          average: { $avg: ["$avgMemorization", "$avgReview"] }
        }
      },
      { $sort: { average: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "students",
          localField: "_id",
          foreignField: "_id",
          as: "student"
        }
      },
      {
        $project: {
          studentId: "$_id",
          name: { $concat: [{ $arrayElemAt: ["$student.firstName", 0] }, " ", { $arrayElemAt: ["$student.fatherName", 0] }] },
          average: { $round: ["$average", 1] }
        }
      }
    ]);

    const attendance = attendanceStats[0] || { present: 0, total: 0 };
    const marks = marksStats[0] || { avgMemorization: 0, avgReview: 0 };

    const report = {
      groupId: group._id,
      groupName: group.name,
      totalStudents: students.length,
      averageAttendance: attendance.total > 0 ? Math.round((attendance.present / attendance.total) * 100) : 0,
      averageMarks: Math.round(((marks.avgMemorization + marks.avgReview) / 2) * 10) / 10,
      topStudents
    };

    res.json(report);
  } catch (error) {
    console.error("Error in getGroupReport:", error);
    res.status(500).json({
      success: false,
      message: "خطأ في جلب تقرير المجموعة"
    });
  }
};

// Export student report as PDF (placeholder)
exports.exportStudentReportPDF = async (req, res) => {
  try {
    // TODO: Implement PDF generation
    res.status(501).json({
      success: false,
      message: "تصدير PDF غير متوفر حالياً"
    });
  } catch (error) {
    console.error("Error in exportStudentReportPDF:", error);
    res.status(500).json({
      success: false,
      message: "خطأ في تصدير تقرير الطالب"
    });
  }
};

// Export group report as PDF (placeholder)
exports.exportGroupReportPDF = async (req, res) => {
  try {
    // TODO: Implement PDF generation
    res.status(501).json({
      success: false,
      message: "تصدير PDF غير متوفر حالياً"
    });
  } catch (error) {
    console.error("Error in exportGroupReportPDF:", error);
    res.status(500).json({
      success: false,
      message: "خطأ في تصدير تقرير المجموعة"
    });
  }
};