// ============================================================================
// Query History - الاستعلام عن تاريخ الطلاب
// ============================================================================

const StudentHistory = require("../../../../../schema/Student/StudentHistory");

/**
 * جلب تاريخ طالب كامل
 */
async function getStudentHistory(studentId, options = {}) {
  try {
    const query = StudentHistory.find({ studentId });
    
    // تصفية حسب نوع الحدث
    if (options.eventType) {
      query.where('eventType').equals(options.eventType);
    }
    
    // تحديد الفترة الزمنية
    if (options.startDate) {
      query.where('createdAt').gte(options.startDate);
    }
    if (options.endDate) {
      query.where('createdAt').lte(options.endDate);
    }
    
    // ترتيب وتحديد العدد
    query.sort({ createdAt: -1 });
    
    if (options.limit) {
      query.limit(options.limit);
    }
    
    const history = await query
      .populate('groupId', 'name')
      .populate('teacherId', 'firstName lastName')
      .populate('actionBy.userId', 'firstName lastName')
      .lean();
    
    return history;
  } catch (error) {
    console.error("❌ Error fetching student history:", error);
    return [];
  }
}

/**
 * جلب إحصائيات تاريخ الطالب
 */
async function getStudentHistoryStats(studentId) {
  try {
    const stats = await StudentHistory.aggregate([
      { $match: { studentId: studentId } },
      {
        $group: {
          _id: "$eventType",
          count: { $sum: 1 }
        }
      }
    ]);
    
    // تحويل لصيغة سهلة
    const result = {
      totalEvents: 0,
      warnings: 0,
      groupChanges: 0,
      removals: 0,
      expulsions: 0,
      restorations: 0
    };
    
    stats.forEach(stat => {
      result.totalEvents += stat.count;
      switch(stat._id) {
        case 'WARNING':
          result.warnings = stat.count;
          break;
        case 'GROUP_CHANGE':
          result.groupChanges = stat.count;
          break;
        case 'GROUP_REMOVAL':
          result.removals = stat.count;
          break;
        case 'EXPULSION':
          result.expulsions = stat.count;
          break;
        case 'RESTORATION':
          result.restorations = stat.count;
          break;
      }
    });
    
    return result;
  } catch (error) {
    console.error("❌ Error fetching history stats:", error);
    return null;
  }
}

module.exports = {
  getStudentHistory,
  getStudentHistoryStats
};
