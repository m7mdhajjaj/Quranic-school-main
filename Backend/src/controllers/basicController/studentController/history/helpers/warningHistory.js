// ============================================================================
// Warning History - تسجيل أحداث الإنذارات
// ============================================================================

const StudentHistory = require("../../../../../schema/Student/StudentHistory");

/**
 * تسجيل إنذار في التاريخ
 */
async function logWarningEvent(warningData, actor) {
  try {
    const historyEntry = new StudentHistory({
      studentId: warningData.studentId,
      eventType: "WARNING",
      warningLevel: warningData.type, // warning, first, second, third
      reason: warningData.reason,
      
      // Snapshot للحلقة والمعلم
      groupId: warningData.groupId,
      groupName: warningData.groupName,
      teacherId: warningData.teacherId,
      teacherName: warningData.teacherName,
      
      // من قام بالإجراء
      actionBy: {
        userId: actor._id,
        userModel: actor.role === 'admin' ? 'Admin' : 'Teacher',
        userName: `${actor.firstName} ${actor.lastName}`
      },
      
      // ربط بالإنذار الأصلي
      warningId: warningData._id
    });

    await historyEntry.save();
    console.log(`✅ Warning logged to history: ${warningData.type}`);
    return historyEntry;
  } catch (error) {
    console.error("❌ Error logging warning to history:", error);
    return null;
  }
}

/**
 * تسجيل فصل طالب
 */
async function logExpulsionEvent(studentId, warningData, actor) {
  try {
    const historyEntry = new StudentHistory({
      studentId,
      eventType: "EXPULSION",
      reason: warningData.reason,
      
      // Snapshot للحلقة قبل الفصل
      groupId: warningData.groupId,
      groupName: warningData.groupName,
      teacherId: warningData.teacherId,
      teacherName: warningData.teacherName,
      
      actionBy: {
        userId: actor._id,
        userModel: actor.role === 'admin' ? 'Admin' : 'Teacher',
        userName: `${actor.firstName} ${actor.lastName}`
      },
      
      warningId: warningData._id
    });

    await historyEntry.save();
    console.log(`✅ Expulsion logged for student ${studentId}`);
    return historyEntry;
  } catch (error) {
    console.error("❌ Error logging expulsion:", error);
    return null;
  }
}

module.exports = {
  logWarningEvent,
  logExpulsionEvent
};
