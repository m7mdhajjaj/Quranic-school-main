const Teacher = require("../../../schema/Teacher");
const { getUsersByRole } = require("../../../services/PresenceService");

/**
 * جلب إحصائيات المعلمين (محسّنة مع Aggregation)
 * 
 * ✅ Updated: Uses PresenceService for real-time online/offline counts
 */
exports.getTeacherStats = async (req, res) => {
  try {
    // استخدام Aggregation Pipeline للأداء الأفضل
    const stats = await Teacher.aggregate([
      {
        $facet: {
          // إجمالي المعلمين
          total: [{ $count: "count" }],
          
          // ✅ Real-time online/offline من PresenceService (لا نستخدم isActive من DB)
          // active: سيتم حسابها من PresenceService
          // inactive: سيتم حسابها من الفرق
          
          // المعلمين النشطين - Placeholder (سيتم استبدالها)
          // استخدام match مع شرط مستحيل بدلاً من limit: 0
          active: [
            { $match: { _id: null } } // شرط مستحيل - لن يرجع أي نتائج
          ],
          
          // المعلمين غير النشطين - Placeholder
          inactive: [
            { $match: { _id: null } } // شرط مستحيل - لن يرجع أي نتائج
          ],
          
          // التوزيع حسب الجنس
          byGender: [
            {
              $group: {
                _id: "$gender",
                count: { $sum: 1 }
              }
            }
          ],
          
          // التوزيع حسب الحلقات
          byGroups: [
            {
              $project: {
                hasGroups: {
                  $cond: [
                    { $gt: [{ $size: { $ifNull: ["$groups", []] } }, 0] },
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
          
          // متوسط العمر
          avgAge: [
            {
              $group: {
                _id: null,
                average: { $avg: "$age" }
              }
            }
          ],
          
          // التوزيع حسب الخبرة (إذا كان هناك حقل experience)
          byExperience: [
            {
              $match: { experience: { $exists: true, $ne: null } }
            },
            {
              $bucket: {
                groupBy: "$experience",
                boundaries: [0, 3, 6, 11, 100],
                default: "other",
                output: {
                  count: { $sum: 1 }
                }
              }
            }
          ]
        }
      }
    ]);

    // معالجة النتائج
    const result = stats[0];
    
    const totalCount = result.total[0]?.count || 0;
    
    // ✅ Get real-time online/offline counts from PresenceService
    const onlineTeachers = getUsersByRole('teacher');
    const activeCount = onlineTeachers.length; // Real-time online
    const inactiveCount = totalCount - activeCount; // Offline
    
    // معالجة الجنس
    const genderStats = result.byGender.reduce((acc, item) => {
      if (item._id === 'ذكر') acc.male = item.count;
      else if (item._id === 'أنثى') acc.female = item.count;
      return acc;
    }, { male: 0, female: 0 });
    
    // معالجة الحلقات
    const groupStats = result.byGroups.reduce((acc, item) => {
      if (item._id === 'withGroups') acc.withGroups = item.count;
      else if (item._id === 'withoutGroups') acc.withoutGroups = item.count;
      return acc;
    }, { withGroups: 0, withoutGroups: 0 });
    
    // متوسط العمر
    const avgAge = result.avgAge[0]?.average || 0;
    
    // توزيع الخبرة
    const experienceLabels = {
      0: "مبتدئ (0-2 سنة)",
      3: "متوسط (3-5 سنوات)",
      6: "خبير (6-10 سنوات)",
      11: "خبير جداً (+10 سنوات)"
    };
    
    const experienceDistribution = (result.byExperience || []).reduce((acc, item) => {
      const label = experienceLabels[item._id] || "غير محدد";
      acc[label] = item.count;
      return acc;
    }, {});

    return res.status(200).json({
      success: true,
      data: {
        total: totalCount,
        active: activeCount,
        inactive: inactiveCount,
        male: genderStats.male,
        female: genderStats.female,
        withGroups: groupStats.withGroups,
        withoutGroups: groupStats.withoutGroups,
        avgAge: avgAge.toFixed(1),
        experienceDistribution
      }
    });
  } catch (error) {
    console.error("Error fetching teacher stats:", error);
    return res
      .status(500)
      .json({ success: false, message: "حدث خطأ أثناء جلب إحصائيات المعلمين" });
  }
};
