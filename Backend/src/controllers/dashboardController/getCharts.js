const Student = require("../../schema/Student");
const Teacher = require("../../schema/Teacher");
const Group = require("../../schema/Group");
const DailyMark = require("../../schema/DailyMark");
const Attendance = require("../../schema/Attendance");

/**
 * Get detailed charts data for dashboard
 * @route GET /api/dashboard/charts
 */
const getDashboardCharts = async (req, res) => {
  try {
    console.log("📈 جلب بيانات الرسوم البيانية...");

    const [
      groupDistribution,
      genderDistribution,
      marksDistribution,
      attendanceByMonth,
      monthlyAttendanceStats,
      topStudentsData,
      topTeachersData,
    ] = await Promise.all([
      // Students distribution by group - طريقة مباشرة وأكثر كفاءة
      Student.aggregate([
        {
          // تجميع حسب حقل group (سواء كان string أو ObjectId)
          $group: {
            _id: "$group",
            count: { $sum: 1 },
          },
        },
        {
          // إزالة الطلاب بدون حلقة
          $match: {
            _id: { $exists: true, $ne: null, $ne: "" },
          },
        },
        {
          // ترتيب حسب العدد
          $sort: { count: -1 },
        },
        {
          // تحديد العدد لأفضل 10 حلقات
          $limit: 10,
        },
      ]),

      // Students by gender - تجميع الجنس بشكل موحد
      Student.aggregate([
        {
          $group: {
            _id: "$gender",
            count: { $sum: 1 },
          },
        },
        {
          // تحويل القيم للإنجليزية لتسهيل العرض في Frontend
          $project: {
            _id: {
              $switch: {
                branches: [
                  { case: { $eq: ["$_id", "ذكر"] }, then: "male" },
                  { case: { $eq: ["$_id", "أنثى"] }, then: "female" },
                  { case: { $eq: ["$_id", "انثى"] }, then: "female" },
                ],
                default: "$_id",
              },
            },
            count: 1,
          },
        },
      ]),

      // Marks distribution
      DailyMark.aggregate([
        {
          $bucket: {
            groupBy: "$mark",
            boundaries: [0, 50, 70, 85, 100],
            default: "other",
            output: {
              count: { $sum: 1 },
              avgMark: { $avg: "$mark" },
            },
          },
        },
      ]),

      // Attendance by month (last 6 months)
      Attendance.aggregate([
        {
          $match: {
            date: {
              $gte: new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000),
            },
          },
        },
        {
          $group: {
            _id: {
              year: { $year: "$date" },
              month: { $month: "$date" },
            },
            total: { $sum: 1 },
            present: {
              $sum: {
                $cond: [{ $eq: ["$status", "present"] }, 1, 0],
              },
            },
          },
        },
        {
          $sort: { "_id.year": 1, "_id.month": 1 },
        },
      ]),

      // Monthly attendance statistics (current month)
      Attendance.aggregate([
        {
          $match: {
            date: {
              $gte: new Date(
                new Date().getFullYear(),
                new Date().getMonth(),
                1
              ),
              $lte: new Date(),
            },
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            present: {
              $sum: { $cond: [{ $eq: ["$isPresent", true] }, 1, 0] },
            },
            absent: {
              $sum: { $cond: [{ $eq: ["$isPresent", false] }, 1, 0] },
            },
          },
        },
      ]),

      // Top Students - بناءً على الدرجات والحضور
      Student.aggregate([
        {
          $lookup: {
            from: "marks", // DailyMark collection
            localField: "_id",
            foreignField: "studentId",
            as: "marks",
          },
        },
        {
          $lookup: {
            from: "attendances",
            localField: "_id",
            foreignField: "studentId",
            as: "attendances",
          },
        },
        {
          $addFields: {
            // حساب متوسط الدرجات (reviewMark + memorizationMark)
            allMarks: {
              $reduce: {
                input: "$marks",
                initialValue: [],
                in: {
                  $concatArrays: [
                    "$$value",
                    {
                      $cond: [
                        { $ne: ["$$this.reviewMark", null] },
                        ["$$this.reviewMark"],
                        [],
                      ],
                    },
                    {
                      $cond: [
                        { $ne: ["$$this.memorizationMark", null] },
                        ["$$this.memorizationMark"],
                        [],
                      ],
                    },
                  ],
                },
              },
            },
          },
        },
        {
          $project: {
            firstName: 1,
            lastName: 1,
            group: 1,
            // حساب معدل الدرجات
            avgMark: { $avg: "$allMarks" },
            totalMarks: { $size: "$marks" },
            // حساب نسبة الحضور
            totalAttendance: { $size: "$attendances" },
            presentCount: {
              $size: {
                $filter: {
                  input: "$attendances",
                  as: "att",
                  cond: { $eq: ["$$att.isPresent", true] },
                },
              },
            },
          },
        },
        {
          $addFields: {
            // دمج الاسم الأول والأخير
            name: {
              $concat: [
                { $ifNull: ["$firstName", ""] },
                " ",
                { $ifNull: ["$lastName", ""] },
              ],
            },
          },
        },
        {
          $addFields: {
            // نسبة الحضور
            attendanceRate: {
              $cond: [
                { $gt: ["$totalAttendance", 0] },
                {
                  $multiply: [
                    { $divide: ["$presentCount", "$totalAttendance"] },
                    100,
                  ],
                },
                0,
              ],
            },
            // النقاط الكلية (70% للدرجات + 30% للحضور)
            totalScore: {
              $add: [
                { $multiply: [{ $ifNull: ["$avgMark", 0] }, 7] }, // من 10 إلى 70
                {
                  $multiply: [
                    {
                      $cond: [
                        { $gt: ["$totalAttendance", 0] },
                        {
                          $multiply: [
                            { $divide: ["$presentCount", "$totalAttendance"] },
                            100,
                          ],
                        },
                        0,
                      ],
                    },
                    0.3,
                  ],
                },
              ],
            },
          },
        },
        {
          $match: {
            totalScore: { $gt: 0 }, // فقط الطلاب الذين لديهم نشاط
          },
        },
        {
          $sort: { totalScore: -1 },
        },
        {
          $limit: 5,
        },
        {
          $project: {
            name: 1,
            group: 1,
            value: { $round: ["$totalScore", 1] },
            avgMark: { $round: [{ $ifNull: ["$avgMark", 0] }, 1] },
            attendanceRate: { $round: ["$attendanceRate", 1] },
          },
        },
      ]),

      // Top Teachers - بناءً على عدد الطلاب والدرجات والحضور المسجل
      Teacher.aggregate([
        {
          // استخراج أسماء الحلقات من مصفوفة groups
          $addFields: {
            groupNames: {
              $map: {
                input: { $ifNull: ["$groups", []] },
                as: "g",
                in: "$$g.name", // استخدام name بدلاً من groupId
              },
            },
          },
        },
        {
          $lookup: {
            from: "students",
            let: { teacherGroupNames: "$groupNames" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    // مطابقة student.group (string) مع أسماء حلقات المعلم
                    $and: [
                      { $ne: ["$group", null] },
                      { $ne: ["$group", ""] },
                      { $in: ["$group", "$$teacherGroupNames"] },
                    ],
                  },
                },
              },
            ],
            as: "students",
          },
        },
        {
          // جلب الدرجات للطلاب التابعين للمعلم
          $lookup: {
            from: "marks",
            let: { studentIds: "$students._id" },
            pipeline: [
              {
                $match: {
                  $expr: { $in: ["$studentId", "$$studentIds"] },
                },
              },
            ],
            as: "marksRecorded",
          },
        },
        {
          // جلب سجلات الحضور للطلاب التابعين للمعلم
          $lookup: {
            from: "attendances",
            let: { studentIds: "$students._id" },
            pipeline: [
              {
                $match: {
                  $expr: { $in: ["$studentId", "$$studentIds"] },
                },
              },
            ],
            as: "attendanceRecords",
          },
        },
        {
          $project: {
            firstName: 1,
            lastName: 1,
            group: 1,
            studentCount: { $size: "$students" },
            marksCount: { $size: "$marksRecorded" },
            attendanceCount: { $size: "$attendanceRecords" },
            // حساب مقاطع الحفظ والمراجعة
            memorizedCount: {
              $size: {
                $filter: {
                  input: "$marksRecorded",
                  as: "mark",
                  cond: { $ne: ["$$mark.memorizationMark", null] },
                },
              },
            },
            reviewCount: {
              $size: {
                $filter: {
                  input: "$marksRecorded",
                  as: "mark",
                  cond: { $ne: ["$$mark.reviewMark", null] },
                },
              },
            },
          },
        },
        {
          $addFields: {
            // دمج الاسم الأول والأخير
            name: {
              $concat: [
                { $ifNull: ["$firstName", ""] },
                " ",
                { $ifNull: ["$lastName", ""] },
              ],
            },
          },
        },
        {
          $addFields: {
            // نظام النقاط بسيط:
            // عدد الطلاب × 5 + عدد الدرجات × 2 + عدد سجلات الحضور × 1
            totalScore: {
              $add: [
                { $multiply: ["$studentCount", 5] },
                { $multiply: ["$marksCount", 2] },
                { $multiply: ["$attendanceCount", 1] },
                { $multiply: ["$memorizedCount", 3] },
                { $multiply: ["$reviewCount", 2] },
              ],
            },
          },
        },
        {
          $sort: { totalScore: -1, studentCount: -1 },
        },
        {
          $limit: 5,
        },
        {
          $project: {
            name: 1,
            value: { $round: ["$totalScore", 1] },
            studentCount: 1,
            marksCount: 1,
            attendanceCount: 1,
            memorizedCount: 1,
            reviewCount: 1,
          },
        },
      ]),
    ]);

    // حساب إحصائيات الحضور الشهري
    const attendanceStats = {
      present: monthlyAttendanceStats[0]?.present || 0,
      absent: monthlyAttendanceStats[0]?.absent || 0,
      late: 0, // لا يوجد حقل للتأخير في Schema الحالي
      total: monthlyAttendanceStats[0]?.total || 0,
    };

    const chartsData = {
      groupDistribution,
      genderDistribution,
      marksDistribution,
      attendanceByMonth,
      monthlyAttendance: attendanceStats,
      topStudents: topStudentsData,
      topTeachers: topTeachersData,
    };

    console.log("✅ تم جلب بيانات الرسوم البيانية بنجاح");
    console.log(
      "📊 Group Distribution:",
      JSON.stringify(groupDistribution, null, 2)
    );
    console.log(
      "📊 Gender Distribution:",
      JSON.stringify(genderDistribution, null, 2)
    );
    console.log(
      "📊 Monthly Attendance:",
      JSON.stringify(attendanceStats, null, 2)
    );
    console.log("🏆 Top Students:", JSON.stringify(topStudentsData, null, 2));
    console.log("👨‍🏫 Top Teachers:", JSON.stringify(topTeachersData, null, 2));

    res.status(200).json({
      success: true,
      message: "تم جلب بيانات الرسوم البيانية بنجاح",
      data: chartsData,
    });
  } catch (error) {
    console.error("❌ خطأ في جلب بيانات الرسوم البيانية:", error);
    res.status(500).json({
      success: false,
      message: "خطأ في جلب بيانات الرسوم البيانية",
      error: error.message,
    });
  }
};

module.exports = getDashboardCharts;
