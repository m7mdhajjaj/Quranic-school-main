// controllers/basicController/teacherAssistantController/stats.controller.js
const TeacherAssistant = require("../../../schema/TeacherAssistant");

/**
 * جلب إحصائيات مساعدي المدرسين
 * @route GET /api/teacher-assistants/stats
 * @access Admin only
 */
const getAssistantStats = async (req, res) => {
  try {
    // استخدام Aggregation للأداء الأفضل
    const stats = await TeacherAssistant.aggregate([
      {
        $facet: {
          // إجمالي المساعدين
          total: [{ $count: "count" }],
          
          // التوزيع حسب الجنس
          byGender: [
            {
              $group: {
                _id: "$gender",
                count: { $sum: 1 }
              }
            }
          ],
          
          // متوسط العمر
          avgAge: [
            {
              $group: {
                _id: null,
                average: { $avg: "$age" }
              }
            }
          ],
          
          // التوزيع حسب الحلقات المسموحة
          byAllowedGroups: [
            {
              $project: {
                hasGroups: {
                  $cond: [
                    { $gt: [{ $size: { $ifNull: ["$allowedGroups", []] } }, 0] },
                    "withGroups",
                    "withoutGroups"
                  ]
                }
              }
            },
            {
              $group: {
                _id: "$hasGroups",
                count: { $sum: 1 }
              }
            }
          ],
          
          // التوزيع حسب المعلم المعين
          byAssignedTeacher: [
            {
              $project: {
                hasTeacher: {
                  $cond: [
                    { $ne: ["$assignedTeacher", null] },
                    "withTeacher",
                    "withoutTeacher"
                  ]
                }
              }
            },
            {
              $group: {
                _id: "$hasTeacher",
                count: { $sum: 1 }
              }
            }
          ]
        }
      }
    ]);

    // معالجة النتائج
    const result = stats[0];
    
    const total = result.total[0]?.count || 0;
    
    // معالجة الجنس
    let male = 0, female = 0;
    result.byGender.forEach(item => {
      if (item._id === 'male' || item._id === 'ذكر') male = item.count;
      if (item._id === 'female' || item._id === 'أنثى') female = item.count;
    });
    
    const avgAge = Math.round(result.avgAge[0]?.average || 0);
    
    // معالجة الحلقات
    let withGroups = 0, withoutGroups = 0;
    result.byAllowedGroups.forEach(item => {
      if (item._id === 'withGroups') withGroups = item.count;
      if (item._id === 'withoutGroups') withoutGroups = item.count;
    });
    
    // معالجة المعلم المعين
    let withTeacher = 0, withoutTeacher = 0;
    result.byAssignedTeacher.forEach(item => {
      if (item._id === 'withTeacher') withTeacher = item.count;
      if (item._id === 'withoutTeacher') withoutTeacher = item.count;
    });

    res.status(200).json({
      success: true,
      data: {
        total,
        male,
        female,
        avgAge,
        malePercentage: total > 0 ? Math.round((male / total) * 100) : 0,
        femalePercentage: total > 0 ? Math.round((female / total) * 100) : 0,
        withGroups,
        withoutGroups,
        withTeacher,
        withoutTeacher,
      },
    });
  } catch (error) {
    console.error('Error fetching assistant stats:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء جلب الإحصائيات',
    });
  }
};

module.exports = {
  getAssistantStats,
};
