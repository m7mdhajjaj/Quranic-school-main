// ============================================================================
// Group History - تسجيل النقل بين الحلقات
// ============================================================================

const StudentHistory = require("../../../../../schema/Student/StudentHistory");

/**
 * تسجيل نقل طالب بين حلقات
 */
async function logGroupChangeEvent(studentId, fromGroup, toGroup, reason, actor) {
  try {
    const historyEntry = new StudentHistory({
      studentId,
      eventType: "GROUP_CHANGE",
      reason: reason || "نقل بين حلقات",
      
      // الحلقة الجديدة
      groupId: toGroup.groupId,
      groupName: toGroup.groupName,
      teacherId: toGroup.teacherId,
      teacherName: toGroup.teacherName,
      
      // الحلقة السابقة
      previousGroup: {
        groupId: fromGroup.groupId,
        groupName: fromGroup.groupName,
        teacherId: fromGroup.teacherId,
        teacherName: fromGroup.teacherName,
      },
      
      actionBy: {
        userId: actor._id,
        userModel: actor.role === 'admin' ? 'Admin' : 'Teacher',
        userName: `${actor.firstName} ${actor.lastName}`
      }
    });

    await historyEntry.save();
    console.log(`✅ Group change logged: ${fromGroup.groupName} → ${toGroup.groupName}`);
    return historyEntry;
  } catch (error) {
    console.error("❌ Error logging group change:", error);
    return null;
  }
}

/**
 * تسجيل إزالة طالب من حلقة
 */
async function logGroupRemovalEvent(studentId, groupData, reason, actor) {
  try {
    const historyEntry = new StudentHistory({
      studentId,
      eventType: "GROUP_REMOVAL",
      reason: reason || "إزالة من الحلقة",
      
      // Snapshot للحلقة السابقة
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
    console.log(`✅ Group removal logged: ${groupData.groupName}`);
    return historyEntry;
  } catch (error) {
    console.error("❌ Error logging group removal:", error);
    return null;
  }
}

module.exports = {
  logGroupChangeEvent,
  logGroupRemovalEvent
};
