// ============================================================================
// ReportController/studentReport.js - Detailed Student Reports
// ============================================================================

const Mark = require("../../schema/DailyMark/DailyMark");
const ExamMark = require("../../schema/ExamMark");
const Student = require("../../schema/Student");
const Attendance = require("../../schema/Attendance");
const mongoose = require("mongoose");

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
