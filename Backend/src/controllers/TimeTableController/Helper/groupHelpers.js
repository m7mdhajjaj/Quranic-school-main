// ============================================================================
// GROUP HELPERS - عمليات الحلقات في جدول المواعيد
// ============================================================================

const Group = require("../../../schema/Group");

/**
 * إضافة موعد إلى جدول الحلقة
 * @param {String} groupName - اسم الحلقة
 * @param {Object} timetableData - بيانات الموعد (day, startHour, endHour, timetableId)
 * @returns {Promise<Boolean>} - true إذا تمت الإضافة بنجاح
 */
const addTimetableToGroup = async (groupName, timetableData) => {
  try {
    if (!groupName || !groupName.trim()) {
      console.log("⚠️ لا يوجد اسم حلقة محدد");
      return false;
    }

    const group = await Group.findOne({ name: groupName.trim() });
    if (!group) {
      console.log(`⚠️ لم يتم العثور على حلقة باسم: ${groupName}`);
      return false;
    }

    // تحقق من عدم وجود نفس الموعد مسبقاً
    const existingTimetable = group.timetable || [];
    const alreadyExists = existingTimetable.some(
      (t) =>
        t.day === timetableData.day &&
        t.startHour === timetableData.startHour &&
        t.endHour === timetableData.endHour
    );

    if (alreadyExists) {
      console.log(`ℹ️ الموعد موجود بالفعل في جدول الحلقة: ${groupName}`);
      return false;
    }

    // أضف الموعد إلى جدول الحلقة
    group.timetable = group.timetable || [];
    group.timetable.push({
      day: timetableData.day,
      startHour: timetableData.startHour,
      endHour: timetableData.endHour,
      timetableId: timetableData.timetableId,
    });

    await group.save();
    console.log(`✅ تمت إضافة الموعد تلقائياً إلى جدول الحلقة: ${groupName}`);
    return true;
  } catch (error) {
    console.error("خطأ في إضافة الموعد إلى جدول الحلقة:", error);
    return false;
  }
};

/**
 * إزالة موعد من جدول الحلقة
 * @param {String} groupName - اسم الحلقة
 * @param {String} sessionId - معرف الموعد
 * @returns {Promise<Boolean>} - true إذا تمت الإزالة بنجاح
 */
const removeTimetableFromGroup = async (groupName, sessionId) => {
  try {
    if (!groupName || !groupName.trim()) {
      return false;
    }

    const group = await Group.findOne({ name: groupName.trim() });
    if (!group) {
      return false;
    }

    group.timetable =
      group.timetable?.filter(
        (t) => t.sessionId?.toString() !== sessionId.toString()
      ) || [];

    await group.save();
    console.log(`🗑️ تمت إزالة الموعد من جدول الحلقة: ${groupName}`);
    return true;
  } catch (error) {
    console.error("خطأ في إزالة الموعد من جدول الحلقة:", error);
    return false;
  }
};

/**
 * تحديث موعد في جدول الحلقة
 * @param {String} groupName - اسم الحلقة
 * @param {String} sessionId - معرف الموعد
 * @param {Object} sessionData - بيانات الموعد المحدثة (day, startHour, endHour)
 * @returns {Promise<Boolean>} - true إذا تم التحديث بنجاح
 */
const updateTimetableInGroup = async (groupName, sessionId, sessionData) => {
  try {
    if (!groupName || !groupName.trim()) {
      return false;
    }

    const group = await Group.findOne({ name: groupName.trim() });
    if (!group) {
      return false;
    }

    // تحقق من وجود الموعد
    const timetableIndex = group.timetable?.findIndex(
      (t) => t.sessionId?.toString() === sessionId.toString()
    );

    if (timetableIndex === -1 || timetableIndex === undefined) {
      // إضافة موعد جديد إذا لم يكن موجوداً
      group.timetable = group.timetable || [];
      group.timetable.push({
        day: sessionData.day,
        startHour: sessionData.startHour,
        endHour: sessionData.endHour,
        sessionId: sessionId,
      });
      console.log(`✅ تمت إضافة الموعد المحدث إلى جدول الحلقة: ${groupName}`);
    } else {
      // تحديث الموعد الموجود
      group.timetable[timetableIndex] = {
        day: sessionData.day,
        startHour: sessionData.startHour,
        endHour: sessionData.endHour,
        sessionId: sessionId,
      };
      console.log(`🔄 تم تحديث الموعد في جدول الحلقة: ${groupName}`);
    }

    await group.save();
    return true;
  } catch (error) {
    console.error("خطأ في تحديث جدول الحلقة:", error);
    return false;
  }
};

module.exports = {
  addTimetableToGroup,
  removeTimetableFromGroup,
  updateTimetableInGroup,
};
