/**
 * الحصول على إحصائيات السكرتيرين
 * @access Admin only
 */
const Secretary = require("../../../schema/Secretary");

const getSecretaryStats = async (req, res) => {
  try {
    // استخدام aggregation للحصول على الإحصائيات
    const stats = await Secretary.aggregate([
      {
        $facet: {
          // العدد الإجمالي
          total: [{ $count: "count" }],
          // عدد الذكور
          male: [
            {
              $match: {
                $or: [{ gender: "ذكر" }, { gender: "male" }],
              },
            },
            { $count: "count" },
          ],
          // عدد الإناث
          female: [
            {
              $match: {
                $or: [{ gender: "أنثى" }, { gender: "female" }],
              },
            },
            { $count: "count" },
          ],
          // متوسط العمر
          avgAge: [
            {
              $match: { age: { $exists: true, $ne: null, $gt: 0 } },
            },
            {
              $group: {
                _id: null,
                avgAge: { $avg: "$age" },
              },
            },
          ],
        },
      },
    ]);

    const result = stats[0];
    const total = result.total[0]?.count || 0;
    const male = result.male[0]?.count || 0;
    const female = result.female[0]?.count || 0;
    const avgAge = result.avgAge[0]?.avgAge || 0;

    // حساب النسب
    const malePercentage = total > 0 ? Math.round((male / total) * 100) : 0;
    const femalePercentage = total > 0 ? Math.round((female / total) * 100) : 0;

    res.status(200).json({
      success: true,
      data: {
        total,
        male,
        female,
        avgAge: Math.round(avgAge * 10) / 10, // تقريب لرقم عشري واحد
        malePercentage,
        femalePercentage,
      },
    });
  } catch (error) {
    console.error("Get secretary stats error:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء جلب إحصائيات السكرتيرين",
    });
  }
};

module.exports = getSecretaryStats;
