const Attendance = require("../../schema/Attendance");
const Student = require("../../schema/Student");

// Get all attendance records for a specific student
exports.getStudentAttendance = async (req, res) => {
  try {
    const studentId = req.params.studentId;

    // Verify that the student exists - but don't fail if not found
      const student = await Student.findById(studentId);
      if (!student) {
        return res.json([]);
    }

    // Find attendance records for the student
      const records = await Attendance.find({ studentId }).sort({ date: -1 });
      return res.json(records);
  } catch (error) {
    console.error(`Error in getStudentAttendance: ${error.message}`);
    return res.json([]);
  }
};

// Get absent students for today with full name, teacher, and group
exports.getAbsentStudentsToday = async (req, res) => {
  try {
    // ✅ FIX: Use UTC-based date for consistent matching
    const now = new Date();
    const todayKey = now.toISOString().split('T')[0]; // YYYY-MM-DD in UTC
    const today = new Date(todayKey + 'T00:00:00.000Z');
    const nextDay = new Date(todayKey + 'T00:00:00.000Z');
    nextDay.setUTCDate(nextDay.getUTCDate() + 1);

    console.log(`📅 [AbsentToday] Searching: ${today.toISOString()} to ${nextDay.toISOString()}`);

    // استخدام Aggregation لجلب البيانات بشكل محسّن مع اسم المعلم الثلاثي
    const absentStudents = await Attendance.aggregate([
      // Match absent records for today
      {
        $match: {
          date: {
            $gte: today,
            $lt: nextDay,
          },
          isPresent: false,
        },
      },
      // Join with Student collection
      {
        $lookup: {
          from: "students",
          localField: "studentId",
          foreignField: "_id",
          as: "student",
        },
      },
      // Unwind student array
      {
        $unwind: {
          path: "$student",
          preserveNullAndEmptyArrays: false,
        },
      },
      // Exclude Expelled Students
      {
        $lookup: {
          from: "warnings",
          let: { studentId: "$student._id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$studentId", "$$studentId"] },
                    { $eq: ["$status", "active"] },
                    { $in: ["$type", ["third", "expulsion"]] }
                  ]
                }
              }
            }
          ],
          as: "expulsionCheck"
        }
      },
      {
         $match: {
           expulsionCheck: { $size: 0 }
         }
      },
      // Join with Group collection للحصول على teacher ObjectId
      {
        $lookup: {
          from: "groups",
          localField: "student.group",
          foreignField: "name",
          as: "groupInfo",
        },
      },
      // Unwind group array (قد يكون هناك أكثر من حلقة بنفس الاسم، نأخذ الأولى)
      {
        $unwind: {
          path: "$groupInfo",
          preserveNullAndEmptyArrays: true,
        },
      },
      // Join with Teacher collection للحصول على اسم المعلم الثلاثي
      {
        $lookup: {
          from: "teachers",
          localField: "groupInfo.teacher",
          foreignField: "_id",
          as: "teacherInfo",
        },
      },
      // Unwind teacher array
      {
        $unwind: {
          path: "$teacherInfo",
          preserveNullAndEmptyArrays: true,
        },
      },
      // Project only needed fields
      {
        $project: {
          _id: "$student._id",
          fullName: {
            $trim: {
              input: {
                $concat: [
                  { $ifNull: ["$student.firstName", ""] },
                  " ",
                  { $ifNull: ["$student.fatherName", ""] },
                  " ",
                  { $ifNull: ["$student.lastName", ""] },
                ],
              },
            },
          },
          teacher: {
            $cond: {
              if: { $and: ["$teacherInfo.firstName", "$teacherInfo.lastName"] },
              then: {
                $trim: {
                  input: {
                    $concat: [
                      { $ifNull: ["$teacherInfo.firstName", ""] },
                      " ",
                      { $ifNull: ["$teacherInfo.fatherName", ""] },
                      " ",
                      { $ifNull: ["$teacherInfo.lastName", ""] },
                    ],
                  },
                },
              },
              else: { $ifNull: ["$student.teacher", "غير محدد"] },
            },
          },
          group: { $ifNull: ["$student.group", "بدون حلقة"] },
        },
      },
      // Sort by name
      {
        $sort: { fullName: 1 },
      },
    ]);

    return res.json({
      success: true,
      data: absentStudents,
      count: absentStudents.length,
    });
  } catch (error) {
    console.error("❌ خطأ في جلب الطلاب الغائبين:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "حدث خطأ أثناء جلب البيانات",
      data: [],
    });
  }
};
