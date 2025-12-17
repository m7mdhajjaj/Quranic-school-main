const Attendance = require("../../schema/Attendance");
const Student = require("../../schema/Student");

// Get attendance records for a specific date
// Removed unused getAttendanceByDate function

// Get all attendance records for a specific student
exports.getStudentAttendance = async (req, res) => {
  try {
    const studentId = req.params.studentId;
    console.log(`Getting attendance records for student ID: ${studentId}`);

    // Verify that the student exists - but don't fail if not found
    try {
      const student = await Student.findById(studentId);
      if (!student) {
        console.log(
          `Student with ID ${studentId} not found, returning empty records`
        );
        // Instead of failing, just return empty records
        return res.json([]);
      }
    } catch (studentError) {
      console.log(`Error finding student: ${studentError.message}`);
      // Don't fail here, continue and try to get records
    }

    // Try to find attendance records for the student
    try {
      const records = await Attendance.find({ studentId }).sort({ date: -1 });
      console.log(
        `Found ${records.length} attendance records for student ID: ${studentId}`
      );
      return res.json(records);
    } catch (recordError) {
      console.log(`Error finding attendance records: ${recordError.message}`);
      // If we can't find records, return empty array instead of error
      return res.json([]);
    }
  } catch (error) {
    console.error(`General error in getStudentAttendance: ${error.message}`);
    // Return empty array instead of error to prevent frontend issues
    return res.json([]);
  }
};

// Get absent students for today with full name, teacher, and group
exports.getAbsentStudentsToday = async (req, res) => {
  try {
    console.log("📋 جلب الطلاب الغائبين لهذا اليوم...");
    const startTime = Date.now();

    // الحصول على اليوم الحالي
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const nextDay = new Date(today);
    nextDay.setDate(today.getDate() + 1);

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

    const duration = Date.now() - startTime;
    console.log(
      `✅ تم جلب ${absentStudents.length} طالب غائب في ${duration}ms`
    );

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
