// ============================================================================
// getTopStudents.js - Get Top 5 Students by Combined Marks
// ============================================================================
// يجمع علامات الحفظ والمراجعة من DailyMark + علامات الامتحان من ExamSchedule
// ويعرض أعلى 5 طلاب بناءً على مجموع العلامات

const Student = require("../../schema/Student");
const DailyMark = require("../../schema/DailyMark");
const ExamSchedule = require("../../schema/ExamSchedule");

/**
 * Get top 5 students by combined marks
 * يجمع: علامات الحفظ + علامات المراجعة + علامات الامتحان
 * @route GET /api/dashboard/top-students
 */
const getTopStudents = async (req, res) => {
  try {
    console.log("🏆 جلب أفضل 5 طلاب بناءً على العلامات المجمعة...");
    const startTime = Date.now();

    // استخدام Aggregation لجمع العلامات من مصادر مختلفة
    const topStudents = await Student.aggregate([
      // جلب علامات الحفظ والمراجعة من DailyMark
      {
        $lookup: {
          from: "marks", // DailyMark collection
          localField: "_id",
          foreignField: "studentId",
          as: "dailyMarks",
        },
      },
      // جلب علامات الامتحان من ExamSchedule
      {
        $lookup: {
          from: "examschedules", // ExamSchedule collection name
          let: { studentId: "$_id" },
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
                  $eq: ["$marks.student", "$$studentId"],
                },
              },
            },
            {
              $project: {
                mark: "$marks.mark",
                examTitle: { $ifNull: ["$title", "$name"] },
                examDate: "$date",
              },
            },
          ],
          as: "examMarks",
        },
      },
      // حساب مجموع العلامات
      {
        $addFields: {
          // جمع علامات الحفظ
          totalMemorizationMarks: {
            $sum: {
              $map: {
                input: "$dailyMarks",
                as: "mark",
                in: { $ifNull: ["$$mark.memorizationMark", 0] },
              },
            },
          },
          // جمع علامات المراجعة
          totalReviewMarks: {
            $sum: {
              $map: {
                input: "$dailyMarks",
                as: "mark",
                in: { $ifNull: ["$$mark.reviewMark", 0] },
              },
            },
          },
          // جمع علامات الامتحان
          totalExamMarks: {
            $sum: {
              $map: {
                input: "$examMarks",
                as: "exam",
                in: { $ifNull: ["$$exam.mark", 0] },
              },
            },
          },
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
      // حساب المجموع الكلي
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
      // فلترة: فقط الطلاب الذين لديهم علامات
      {
        $match: {
          totalMarks: { $gt: 0 },
        },
      },
      // ترتيب حسب المجموع الكلي
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
          memorizationCount: 1,
          reviewCount: 1,
          examCount: 1,
          group: { $ifNull: ["$group", "بدون حلقة"] },
        },
      },
    ]);

    const duration = Date.now() - startTime;
    console.log(
      `✅ تم جلب ${topStudents.length} طالب في ${duration}ms`
    );

    return res.status(200).json({
      success: true,
      message: "تم جلب أفضل 5 طلاب بنجاح",
      data: topStudents,
      count: topStudents.length,
    });
  } catch (error) {
    console.error("❌ خطأ في جلب أفضل الطلاب:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "حدث خطأ أثناء جلب البيانات",
      data: [],
    });
  }
};

module.exports = getTopStudents;
