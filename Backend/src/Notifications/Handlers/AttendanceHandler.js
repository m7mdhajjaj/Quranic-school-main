// ============================================================================
// AttendanceHandler.js - Attendance Notification Handler
// ============================================================================

const Student = require("../../schema/Student");

/**
 * إرسال إشعار للطالب عند رصد غياب
 * @param {Function} createNotification - دالة إنشاء الإشعار من NotificationManager
 * @param {String} studentId - معرف الطالب
 * @param {String} date - التاريخ المرصود
 * @param {String} teacherName - اسم المعلم
 */
exports.notifyAbsence = async (createNotification, studentId, date, teacherName) => {
  try {
    // التحقق من وجود الطالب
    const student = await Student.findById(studentId).select('_id firstName lastName');
    if (!student) {
      console.error(`❌ [AttendanceHandler] Student not found: ${studentId}`);
      return;
    }

    // إنشاء الإشعار
    const notification = await createNotification({
      recipient: studentId,
      recipientModel: 'Student',
      type: 'attendance',
      category: 'academic',
      title: 'غياب',
      message: `تم رصد غيابك بتاريخ ${date}`,
      messageSummary: `غياب - ${date}`,
      priority: 'high',
      data: {
        actionUrl: '/attendance',
        actionText: 'عرض سجل الحضور',
        action: 'absence_recorded',
        entityType: 'attendance',
        date: date,
        teacherName: teacherName,
        absenceType: 'absence'
      }
    });

    console.log(`✅ [AttendanceHandler] Absence notification sent to student ${studentId} for date ${date}`);
    return notification;

  } catch (error) {
    console.error(`❌ [AttendanceHandler] Error sending absence notification:`, error);
    throw error;
  }
};

/**
 * إرسال إشعار للطالب عند إلغاء غياب (تحويل إلى حضور)
 * @param {Function} createNotification - دالة إنشاء الإشعار من NotificationManager
 * @param {String} studentId - معرف الطالب
 * @param {String} date - التاريخ المرصود
 * @param {String} teacherName - اسم المعلم
 */
exports.notifyAbsenceRemoved = async (createNotification, studentId, date, teacherName) => {
  try {
    // التحقق من وجود الطالب
    const student = await Student.findById(studentId).select('_id firstName lastName');
    if (!student) {
      console.error(`❌ [AttendanceHandler] Student not found: ${studentId}`);
      return;
    }

    // إنشاء الإشعار
    const notification = await createNotification({
      recipient: studentId,
      recipientModel: 'Student',
      type: 'attendance',
      title: 'تعديل حضور',
      message: `تم تعديلك لحاضر بتاريخ ${date}`,
      priority: 'medium',
      data: {
        actionUrl: '/attendance',
        actionText: 'عرض سجل الحضور',
        relatedEntityType: 'attendance',
        date: date,
        teacherName: teacherName,
        absenceType: 'removed'
      }
    });

    console.log(`✅ [AttendanceHandler] Absence removal notification sent to student ${studentId} for date ${date}`);
    return notification;

  } catch (error) {
    console.error(`❌ [AttendanceHandler] Error sending absence removal notification:`, error);
    throw error;
  }
};

/**
 * إرسال إشعار bulk للطلاب الغائبين
 * @param {Function} createNotification - دالة إنشاء الإشعار من NotificationManager
 * @param {Array} absentStudents - قائمة الطلاب الغائبين [{ studentId, name }]
 * @param {String} date - التاريخ المرصود
 * @param {String} teacherName - اسم المعلم
 */
exports.notifyBulkAbsences = async (createNotification, absentStudents, date, teacherName) => {
  try {
    const notifications = [];

    for (const student of absentStudents) {
      try {
        const notification = await createNotification({
          recipient: student.studentId,
          recipientModel: 'Student',
          type: 'attendance',
          title: 'غياب',
          message: `تم رصد غيابك بتاريخ ${date}`,
          priority: 'high',
          data: {
            actionUrl: '/attendance',
            actionText: 'عرض سجل الحضور',
            relatedEntityType: 'attendance',
            date: date,
            teacherName: teacherName,
            absenceType: 'absence'
          }
        });
        notifications.push(notification);
      } catch (err) {
        console.error(`❌ [AttendanceHandler] Error for student ${student.studentId}:`, err.message);
      }
    }

    console.log(`✅ [AttendanceHandler] Sent ${notifications.length} absence notifications for date ${date}`);
    return notifications;

  } catch (error) {
    console.error(`❌ [AttendanceHandler] Error sending bulk absence notifications:`, error);
    throw error;
  }
};
