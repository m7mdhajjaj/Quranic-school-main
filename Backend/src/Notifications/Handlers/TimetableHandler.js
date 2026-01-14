// ============================================================================
// TimetableHandler - إشعارات الجدول الزمني
// ============================================================================
// إرسال إشعارات للطلاب عند إضافة/تعديل/حذف مواعيد الحلقات

const Notification = require("../../schema/Notification");
const Student = require("../../schema/Student");
const Group = require("../../schema/Group");
const mongoose = require("mongoose");
const { sendRealTimeNotification } = require("../Core/NotificationManager");
const { sendPushNotification } = require("../Core/PushSender");

/**
 * Helper: جلب طلاب الحلقة
 * @param {String} groupIdentifier - اسم أو ID الحلقة
 * @returns {Promise<Array>} - قائمة الطلاب
 */
const getGroupStudents = async (groupIdentifier) => {
  if (!groupIdentifier) return [];

  let students = [];
  let groupName = groupIdentifier;

  // 1. Try direct match (Name or ID)
  students = await Student.find({ group: groupIdentifier }).select('_id firstName lastName');

  // 2. If no students found and it looks like an ObjectId, try finding by Name
  if (students.length === 0 && mongoose.Types.ObjectId.isValid(groupIdentifier)) {
    const groupDoc = await Group.findById(groupIdentifier);
    if (groupDoc) {
      students = await Student.find({ group: groupDoc.name }).select('_id firstName lastName');
      groupName = groupDoc.name;
    }
  }

  // 3. If still no students and it looks like a Name, try finding by ID
  if (students.length === 0 && !mongoose.Types.ObjectId.isValid(groupIdentifier)) {
    const groupDoc = await Group.findOne({ name: groupIdentifier });
    if (groupDoc) {
      students = await Student.find({ group: groupDoc._id.toString() }).select('_id firstName lastName');
      groupName = groupDoc.name;
    }
  }

  return { students, groupName };
};

/**
 * إشعار بإضافة موعد جديد
 * @param {Object} timetable - بيانات الموعد
 * @param {Object} io - Socket.io instance
 */
exports.notifyTimetableCreated = async (timetable, io) => {
  try {
    if (!timetable) return;

    const groupIdentifier = timetable.note || timetable.groupId;
    if (!groupIdentifier) {
      console.log("📅 No group for timetable, skipping notification");
      return;
    }

    const { students, groupName } = await getGroupStudents(groupIdentifier);
    if (!students.length) {
      console.log(`📅 No students in group ${groupName}, skipping notification`);
      return;
    }

    // تنسيق التاريخ
    const dateStr = timetable.sessionDate 
      ? new Date(timetable.sessionDate).toLocaleDateString("ar-EG", { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })
      : timetable.day;

    const sessionTypeText = {
      'hifz': 'حفظ',
      'murajaah': 'مراجعة',
      'both': 'حفظ ومراجعة'
    }[timetable.sessionType] || 'حلقة';

    const notifications = students.map((student) => ({
      recipient: student._id,
      recipientModel: "Student",
      type: "timetable",
      title: "📅 موعد جديد",
      message: `تم إضافة موعد ${sessionTypeText} لحلقة ${groupName} يوم ${dateStr} من ${timetable.startHour} إلى ${timetable.endHour}`,
      data: {
        timetableId: timetable._id,
        action: "timetable_created",
        sessionDate: timetable.sessionDate,
        startHour: timetable.startHour,
        endHour: timetable.endHour,
      },
    }));

    // إرسال الإشعارات
    for (const noteData of notifications) {
      const notification = new Notification(noteData);
      await notification.save();

      if (io) {
        await sendRealTimeNotification(io, notification);
      }

      await sendPushNotification(noteData.recipient, notification);
    }

    console.log(`📅 Sent timetable created notifications to ${students.length} students`);
  } catch (error) {
    console.error("❌ Error in notifyTimetableCreated:", error);
  }
};

/**
 * إشعار بتعديل موعد
 * @param {Object} timetable - بيانات الموعد بعد التعديل
 * @param {Object} changes - التغييرات (old vs new)
 * @param {Object} io - Socket.io instance
 */
exports.notifyTimetableUpdated = async (timetable, changes, io) => {
  try {
    if (!timetable) return;

    const groupIdentifier = timetable.note || timetable.groupId;
    if (!groupIdentifier) return;

    const { students, groupName } = await getGroupStudents(groupIdentifier);
    if (!students.length) return;

    // بناء رسالة التغييرات
    let changeDetails = [];
    if (changes.startHour || changes.endHour) {
      changeDetails.push(`الوقت: ${timetable.startHour} - ${timetable.endHour}`);
    }
    if (changes.sessionDate) {
      const newDate = new Date(timetable.sessionDate).toLocaleDateString("ar-EG");
      changeDetails.push(`التاريخ: ${newDate}`);
    }
    if (changes.day) {
      changeDetails.push(`اليوم: ${timetable.day}`);
    }

    const dateStr = timetable.sessionDate 
      ? new Date(timetable.sessionDate).toLocaleDateString("ar-EG")
      : timetable.day;

    const notifications = students.map((student) => ({
      recipient: student._id,
      recipientModel: "Student",
      type: "timetable",
      title: "✏️ تعديل موعد",
      message: `تم تعديل موعد حلقة ${groupName} (${dateStr}): ${changeDetails.join(', ') || 'تحديث بسيط'}`,
      data: {
        timetableId: timetable._id,
        action: "timetable_updated",
        changes: changes,
      },
    }));

    for (const noteData of notifications) {
      const notification = new Notification(noteData);
      await notification.save();

      if (io) {
        await sendRealTimeNotification(io, notification);
      }

      await sendPushNotification(noteData.recipient, notification);
    }

    console.log(`✏️ Sent timetable updated notifications to ${students.length} students`);
  } catch (error) {
    console.error("❌ Error in notifyTimetableUpdated:", error);
  }
};

/**
 * إشعار بحذف موعد
 * @param {Object} timetable - بيانات الموعد المحذوف
 * @param {Object} io - Socket.io instance
 */
exports.notifyTimetableDeleted = async (timetable, io) => {
  try {
    if (!timetable) return;

    const groupIdentifier = timetable.note || timetable.groupId;
    if (!groupIdentifier) return;

    const { students, groupName } = await getGroupStudents(groupIdentifier);
    if (!students.length) return;

    const dateStr = timetable.sessionDate 
      ? new Date(timetable.sessionDate).toLocaleDateString("ar-EG")
      : timetable.day;

    const notifications = students.map((student) => ({
      recipient: student._id,
      recipientModel: "Student",
      type: "timetable",
      title: "🗑️ إلغاء موعد",
      message: `تم إلغاء موعد حلقة ${groupName} يوم ${dateStr} (${timetable.startHour} - ${timetable.endHour})`,
      data: {
        timetableId: timetable._id,
        action: "timetable_deleted",
        sessionDate: timetable.sessionDate,
      },
    }));

    for (const noteData of notifications) {
      const notification = new Notification(noteData);
      await notification.save();

      if (io) {
        await sendRealTimeNotification(io, notification);
      }

      await sendPushNotification(noteData.recipient, notification);
    }

    console.log(`🗑️ Sent timetable deleted notifications to ${students.length} students`);
  } catch (error) {
    console.error("❌ Error in notifyTimetableDeleted:", error);
  }
};
