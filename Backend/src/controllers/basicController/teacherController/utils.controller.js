const Teacher = require("../../../schema/Teacher");
const { calculateAge } = require("../groupController/utils");

/**
 * توليد رقم معلم جديد
 */
const generateTeacherId = async () => {
  try {
    const lastTeacher = await Teacher.findOne()
      .sort({ teacherId: -1 })
      .select("teacherId");

    if (!lastTeacher || !lastTeacher.teacherId) {
      return 1000; // Start teacher IDs from 1000
    }

    const nextId = lastTeacher.teacherId + 1;

    // Safety check: ensure it's within valid range (1000-9999)
    if (nextId > 9999) {
      throw new Error("تم الوصول للحد الأقصى من أرقام المعلمين (9999)");
    }

    return nextId;
  } catch (error) {
    console.error("Error generating teacher ID:", error);
    throw error; // Re-throw to handle in the calling function
  }
};

/**
 * جلب حلقات المعلم
 * @param {String} teacherId - معرف المعلم
 * @returns {Array} - قائمة أسماء الحلقات
 */
const getTeacherGroups = async (teacherId) => {
  try {
    const teacher = await Teacher.findById(teacherId).select("groups");
    
    if (!teacher || !teacher.groups || teacher.groups.length === 0) {
      return [];
    }
    
    return teacher.groups.map(g => g.name);
  } catch (error) {
    console.error("Error fetching teacher groups:", error);
    return [];
  }
};

const CHANGE_TYPES = {
  GROUP_ADDED: "GROUP_ADDED",
  GROUP_REMOVED: "GROUP_REMOVED",
};

/**
 * كشف التغييرات بين نسخة المعلم القديمة والجديدة (الحلقات فقط)
 * @param {Object} oldTeacher - بيانات المعلم قبل التحديث
 * @param {Object} payload - البيانات المرسلة في الطلب
 * @param {Object} updatedTeacher - بيانات المعلم بعد التحديث
 * @returns {Array} - قائمة التغييرات
 */
const detectTeacherChanges = (oldTeacher, payload, updatedTeacher) => {
  const changes = [];

  // 1. كشف تغييرات الحلقات
  const oldGroups = oldTeacher.groups ? oldTeacher.groups.map(g => g.id.toString()) : [];
  const newGroups = updatedTeacher.groups ? updatedTeacher.groups.map(g => g.id.toString()) : [];

  // حلقات مضافة
  updatedTeacher.groups.forEach(group => {
    if (!oldGroups.includes(group.id.toString())) {
      changes.push({
        type: CHANGE_TYPES.GROUP_ADDED,
        meta: { groupName: group.name, groupId: group.id }
      });
    }
  });

  // حلقات محذوفة
  oldTeacher.groups.forEach(group => {
    if (!newGroups.includes(group.id.toString())) {
      changes.push({
        type: CHANGE_TYPES.GROUP_REMOVED,
        meta: { groupName: group.name, groupId: group.id }
      });
    }
  });

  return changes;
};

/**
 * بناء رسالة الإشعار بناءً على نوع التغيير
 * @param {Object} change - كائن التغيير
 * @returns {Object} - { title, message, type }
 */
const buildNotificationMessage = (change) => {
  switch (change.type) {
    case CHANGE_TYPES.GROUP_ADDED:
      return {
        title: "تم تعيين حلقة جديدة",
        message: `تم تعيينك معلماً للحلقة: ${change.meta.groupName}`,
        type: "success",
        link: "/my-groups"
      };
    case CHANGE_TYPES.GROUP_REMOVED:
      return {
        title: "إلغاء تعيين حلقة",
        message: `تم إلغاء تعيينك من الحلقة: ${change.meta.groupName}`,
        type: "alert",
        link: "/my-groups"
      };
    default:
      return null;
  }
};

module.exports = {
  calculateAge,
  generateTeacherId,
  getTeacherGroups,
  detectTeacherChanges,
  buildNotificationMessage
};
