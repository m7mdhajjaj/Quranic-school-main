// ============================================================================
// ReportController/groupReport.js - Group Reports
// ============================================================================

const Mark = require("../../schema/DailyMark/DailyMark");
const Student = require("../../schema/Student");
const Group = require("../../schema/Group");
const Attendance = require("../../schema/Attendance");

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
