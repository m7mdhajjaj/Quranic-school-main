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

    let title = "تنبيه جديد";
    let message = `لقد تلقيت تنبيهاً جديداً`;
    let priority = "high";

    // تخصيص الرسالة حسب نوع الإنذار
    switch (warning.type) {
      case "warning":
        title = "تنبيه سلوكي";
        message = `لقد تلقيت تنبيهاً من المعلم بسبب: ${warning.reason}`;
        priority = "medium";
        break;
      case "first":
        title = "إنذار أول";
        message = `لقد تلقيت إنذاراً أولاً. يرجى مراجعة المعلم. السبب: ${warning.reason}`;
        break;
      case "second":
        title = "إنذار ثاني";
        message = `لقد تلقيت إنذاراً ثانياً. هذا أمر جدي يتطلب الانتباه. السبب: ${warning.reason}`;
        break;
      case "third":
        title = "إنذار نهائي (فصل)";
        message = `لقد تلقيت إنذاراً نهائياً (فصل). السبب: ${warning.reason}`;
        priority = "urgent";
        break;
      case "expulsion":
        title = "قرار فصل";
        message = `تم إصدار قرار فصل بحقك. السبب: ${warning.reason}`;
        priority = "urgent";
        break;
      default:
        title = "تنبيه إداري";
        message = `لقد تلقيت ملاحظة إدارية: ${warning.reason}`;
    }

    const notificationData = {
      recipient: student._id,
      recipientModel: "Student",
      type: "warning",
      title: title,
      message: message,
      priority: priority,
      data: {
        action: "warning_received",
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
