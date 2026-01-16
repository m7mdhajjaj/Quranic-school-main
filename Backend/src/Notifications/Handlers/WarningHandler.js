const Notification = require("../../schema/Notification");
const { sendRealTimeNotification } = require("../Core/SocketSender");
const { sendPushNotification } = require("../Core/PushSender");

/**
 * إرسال إشعار للطالب عند تلقي إنذار أو تنبيه
 * @param {Object} student - بيانات الطالب
 * @param {Object} warning - بيانات الإنذار
 * @param {Object} io - كائن Socket.IO
 */
exports.notifyStudentWarning = async (student, warning, io) => {
  try {
    console.log(`🔔 notifyStudentWarning called for student: ${student.firstName} ${student.lastName}`);

    let title = "تنبيه";
    let message = warning.reason;
    let messageSummary = "تنبيه جديد";
    let priority = "high";

    // تخصيص الرسالة حسب نوع الإنذار
    switch (warning.type) {
      case "warning":
        title = "تنبيه";
        message = warning.reason;
        messageSummary = "تنبيه سلوكي";
        priority = "medium";
        break;
      case "first":
        title = "إنذار أول";
        message = warning.reason;
        messageSummary = "إنذار أول";
        break;
      case "second":
        title = "إنذار ثاني";
        message = warning.reason;
        messageSummary = "إنذار ثاني";
        break;
      case "third":
        title = "إنذار نهائي";
        message = warning.reason;
        messageSummary = "إنذار نهائي";
        priority = "urgent";
        break;
      case "expulsion":
        title = "قرار فصل";
        message = warning.reason;
        messageSummary = "قرار فصل";
        priority = "urgent";
        break;
      default:
        title = "ملاحظة";
        message = warning.reason;
        messageSummary = "ملاحظة إدارية";
    }

    const notificationData = {
      recipient: student._id,
      recipientModel: "Student",
      type: "warning",
      category: "academic",
      title: title,
      message: message,
      messageSummary: messageSummary,
      priority: priority,
      data: {
        action: "warning_received",
        entityType: "warning",
        warningId: warning._id,
        warningType: warning.type,
        reason: warning.reason,
        teacherId: warning.teacherId,
        groupId: warning.groupId
      }
    };

    // 1. حفظ الإشعار في قاعدة البيانات
    const notification = new Notification(notificationData);
    const savedNotification = await notification.save();

    // 2. إرسال إشعار فوري (Socket.IO)
    if (io) {
      await sendRealTimeNotification(io, savedNotification);
      console.log(`📡 Real-time warning notification sent to student ${student._id}`);
    }

    // 3. إرسال إشعار Push (FCM)
    // نحتاج للتأكد من وجود FCMService
    if (global.fcmService) {
      await sendPushNotification(student._id, savedNotification);
      console.log(`📲 Push notification sent to student ${student._id}`);
    }

  } catch (error) {
    console.error("❌ Error in notifyStudentWarning:", error);
  }
};
