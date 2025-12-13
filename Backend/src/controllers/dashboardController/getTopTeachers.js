// ============================================================================
// getTopTeachers.js - Get Top 5 Teachers by Combined Student Marks
// ============================================================================
// يجمع علامات جميع طلاب كل معلم من جميع حلقاته
// ويحسب مجموع علاماتهم (حفظ + مراجعة + امتحان)
// ويرتب المعلمين حسب المجموع الكلي

const Teacher = require("../../schema/Teacher");
const Student = require("../../schema/Student");
const DailyMark = require("../../schema/DailyMark");
const ExamSchedule = require("../../schema/ExamSchedule");

/**
 * Get top 5 teachers by combined marks of all their students
 * يجمع علامات جميع طلاب كل معلم من جميع حلقاته
 * @route GET /api/dashboard/top-teachers
 */
const getTopTeachers = async (req, res) => {
  try {
    console.log("🏆 جلب أفضل 5 معلمين بناءً على مجموع علامات طلابهم...");
    const startTime = Date.now();

    // استخدام Aggregation لجمع علامات طلاب كل معلم
    const topTeachers = await Teacher.aggregate([
      // استخراج أسماء الحلقات من مصفوفة groups
      {
        $addFields: {
          groupNames: {
            $map: {
              input: { $ifNull: ["$groups", []] },
              as: "g",
              in: "$$g.name", // استخدام name من groups
            },
          },
        },
      },
      // جلب جميع الطلاب التابعين للمعلم (من جميع حلقاته)
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
      // جلب علامات الحفظ والمراجعة لجميع طلاب المعلم
      {
        $lookup: {
          from: "marks", // DailyMark collection
          let: { studentIds: "$students._id" },
          pipeline: [
            {
              $match: {
                $expr: { $in: ["$studentId", "$$studentIds"] },
              },
            },
          ],
          as: "dailyMarks",
        },
      },
      // جلب علامات الامتحان لجميع طلاب المعلم
      {
        $lookup: {
          from: "examschedules", // ExamSchedule collection
          let: { studentIds: "$students._id" },
          pipeline: [
            {
              $unwind: {
                path: "$marks",
                preserveNullAndEmptyArrays: false,
              },
            },
            {
              $match: {
                $expr: {
                  $in: ["$marks.student", "$$studentIds"],
                },
              },
            },
            {
              $project: {
                mark: "$marks.mark",
                student: "$marks.student",
              },
            },
          ],
          as: "examMarks",
        },
      },
      // حساب مجموع العلامات لجميع طلاب المعلم
      {
        $addFields: {
          // جمع علامات الحفظ لجميع الطلاب
          totalMemorizationMarks: {
            $sum: {
              $map: {
                input: "$dailyMarks",
                as: "mark",
                in: { $ifNull: ["$$mark.memorizationMark", 0] },
              },
            },
          },
          // جمع علامات المراجعة لجميع الطلاب
          totalReviewMarks: {
            $sum: {
              $map: {
                input: "$dailyMarks",
                as: "mark",
                in: { $ifNull: ["$$mark.reviewMark", 0] },
              },
            },
          },
          // جمع علامات الامتحان لجميع الطلاب
          totalExamMarks: {
            $sum: {
              $map: {
                input: "$examMarks",
                as: "exam",
                in: { $ifNull: ["$$exam.mark", 0] },
              },
            },
          },
          // عدد طلاب المعلم
          studentCount: { $size: "$students" },
          // عدد علامات الحفظ
          memorizationCount: {
            $size: {
              $filter: {
                input: "$dailyMarks",
                as: "mark",
                cond: { $ne: ["$$mark.memorizationMark", null] },
              },
            },
          },
          // عدد علامات المراجعة
          reviewCount: {
            $size: {
              $filter: {
                input: "$dailyMarks",
                as: "mark",
                cond: { $ne: ["$$mark.reviewMark", null] },
              },
            },
          },
          // عدد علامات الامتحان
          examCount: { $size: "$examMarks" },
        },
      },
      // حساب المجموع الكلي لجميع طلاب المعلم
      {
        $addFields: {
          totalMarks: {
            $add: [
              "$totalMemorizationMarks",
              "$totalReviewMarks",
              "$totalExamMarks",
            ],
          },
          // حساب المتوسط
          averageMark: {
            $cond: {
              if: {
                $gt: [
                  {
                    $add: [
                      "$memorizationCount",
                      "$reviewCount",
                      "$examCount",
                    ],
                  },
                  0,
                ],
              },
              then: {
                $divide: [
                  {
                    $add: [
                      "$totalMemorizationMarks",
                      "$totalReviewMarks",
                      "$totalExamMarks",
                    ],
                  },
                  {
                    $add: [
                      "$memorizationCount",
                      "$reviewCount",
                      "$examCount",
                    ],
                  },
                ],
              },
              else: 0,
            },
          },
        },
      },
      // فلترة: فقط المعلمين الذين لديهم طلاب بعلامات
      {
        $match: {
          totalMarks: { $gt: 0 },
        },
      },
      // ترتيب حسب المجموع الكلي (تنازلي)
      {
        $sort: { totalMarks: -1 },
      },
      // أخذ أعلى 5
      {
        $limit: 5,
      },
      // إعداد البيانات للعرض
      {
        $project: {
          _id: 1,
          name: {
            $trim: {
              input: {
                $concat: [
                  { $ifNull: ["$firstName", ""] },
                  " ",
                  { $ifNull: ["$fatherName", ""] },
                  " ",
                  { $ifNull: ["$lastName", ""] },
                ],
              },
            },
          },
          totalMarks: { $round: ["$totalMarks", 2] },
          averageMark: { $round: ["$averageMark", 2] },
          memorizationMarks: { $round: ["$totalMemorizationMarks", 2] },
          reviewMarks: { $round: ["$totalReviewMarks", 2] },
          examMarks: { $round: ["$totalExamMarks", 2] },
          studentCount: 1,
          memorizationCount: 1,
          reviewCount: 1,
          examCount: 1,
          groups: {
            $map: {
              input: { $ifNull: ["$groups", []] },
              as: "g",
              in: "$$g.name",
            },
          },
        },
      },
    ]);

    const duration = Date.now() - startTime;
    console.log(
      `✅ تم جلب ${topTeachers.length} معلم في ${duration}ms`
    );

    return res.status(200).json({
      success: true,
      message: "تم جلب أفضل 5 معلمين بنجاح",
      data: topTeachers,
      count: topTeachers.length,
    });
  } catch (error) {
    console.error("❌ خطأ في جلب أفضل المعلمين:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "حدث خطأ أثناء جلب البيانات",
      data: [],
    });
  }
};

module.exports = getTopTeachers;
