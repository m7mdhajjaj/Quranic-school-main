// ============================================
// UPDATE GROUP ACTIVE STATUS - تحديث حالة الحلقة
// ============================================
// دالة لتحديث activeStatus للحلقة بناءً على عدد الطلاب

const Group = require("../../../schema/Group");
const Student = require("../../../schema/Student");

/**
 * تحديث حالة activeStatus للحلقة
 * الحلقة تكون فعالة إذا: لها معلم وفيها طالب واحد على الأقل
 * @param {string} groupName - اسم الحلقة
 * @returns {Promise<boolean>} الحالة الجديدة
 */
const updateGroupActiveStatus = async (groupName) => {
  try {
    console.log(`🔄 [updateGroupActiveStatus] Checking group: ${groupName}`);

    // جلب الحلقة
    const group = await Group.findOne({ name: groupName });
    if (!group) {
      console.log(`⚠️ Group not found: ${groupName}`);
      return false;
    }

    // التحقق من وجود معلم
    const hasTeacher = !!group.teacher;

    // عد الطلاب
    const studentsCount = await Student.countDocuments({ group: groupName });

    // تحديد الحالة الجديدة: فعالة إذا كان لها معلم وفيها طالب واحد على الأقل
    const newActiveStatus = hasTeacher && studentsCount > 0;

    console.log(`   📊 Teacher: ${hasTeacher ? 'Yes' : 'No'}, Students: ${studentsCount}, New Status: ${newActiveStatus}`);

    // تحديث فقط إذا تغيرت الحالة
    if (group.activeStatus !== newActiveStatus) {
      await Group.updateOne(
        { _id: group._id },
        { $set: { activeStatus: newActiveStatus } }
      );
      console.log(`   ✅ Updated activeStatus to: ${newActiveStatus}`);
    } else {
      console.log(`   ⏩ Status unchanged: ${newActiveStatus}`);
    }

    return newActiveStatus;
  } catch (error) {
    console.error(`❌ Error updating group active status:`, error);
    throw error;
  }
};

/**
 * تحديث حالة الحلقة بعد تعديل طالب
 * يستخدم عند نقل طالب من حلقة لأخرى
 * @param {string} oldGroup - الحلقة القديمة
 * @param {string} newGroup - الحلقة الجديدة
 */
const updateGroupsActiveStatusOnStudentMove = async (oldGroup, newGroup) => {
  try {
    const updates = [];

    // تحديث الحلقة القديمة إذا كانت موجودة
    if (oldGroup && oldGroup !== "غير محدد") {
      updates.push(updateGroupActiveStatus(oldGroup));
    }

    // تحديث الحلقة الجديدة إذا كانت موجودة ومختلفة
    if (newGroup && newGroup !== "غير محدد" && newGroup !== oldGroup) {
      updates.push(updateGroupActiveStatus(newGroup));
    }

    await Promise.all(updates);
  } catch (error) {
    console.error("❌ Error updating groups status on student move:", error);
    throw error;
  }
};

module.exports = {
  updateGroupActiveStatus,
  updateGroupsActiveStatusOnStudentMove,
};
