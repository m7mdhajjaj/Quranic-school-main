// ============================================================================
// Restoration History - تسجيل إعادة الطلاب
// ============================================================================

const StudentHistory = require("../../../../../schema/Student/StudentHistory");

/**
 * تسجيل إعادة طالب بعد حذف إنذار
 */
async function logRestorationEvent(studentId, groupData, reason, actor) {
  try {
    const historyEntry = new StudentHistory({
      studentId,
      eventType: "RESTORATION",
      reason: reason || "إعادة إلى الحلقة بعد حذف إنذار",
      
      // Snapshot للحلقة المعاد إليها
      groupId: groupData.groupId,
      groupName: groupData.groupName,
      teacherId: groupData.teacherId,
      teacherName: groupData.teacherName,
      
      actionBy: {
        userId: actor._id,
        userModel: actor.role === 'admin' ? 'Admin' : 'Teacher',
        userName: `${actor.firstName} ${actor.lastName}`
      }
    });

    await historyEntry.save();
    console.log(`✅ Restoration logged: ${groupData.groupName}`);
    return historyEntry;
  } catch (error) {
    console.error("❌ Error logging restoration:", error);
    return null;
  }
}

module.exports = {
  logRestorationEvent
};
