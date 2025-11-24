const Notification = require("../../../schema/Notification");
const Student = require("../../../schema/Student");
const DeviceToken = require("../../../schema/DeviceToken");
const FCMService = require("../../config/FCMService");

/**
 * Specific Notification Methods
 * Handles creation of specific notification types (grade, absence, message, etc.)
 */

/**
 * Notify about new or updated grade
 */
async function notifyNewGrade(createNotificationFn, studentId, subject, grade, teacherName, isUpdate = false, oldGrade = null) {
  try {
    let gradeEmoji = "📈";
    let gradeComment = "";
    if (grade >= 18) {
      gradeEmoji = "🏆";
      gradeComment = " - ممتاز!";
    } else if (grade >= 16) {
      gradeEmoji = "⭐";
      gradeComment = " - جيد جداً!";
    } else if (grade >= 14) {
      gradeEmoji = "👍";
      gradeComment = " - جيد";
    } else if (grade >= 12) {
      gradeEmoji = "📝";
      gradeComment = " - مقبول";
    }

    const actionText = isUpdate ? "تحديث علامة" : "علامة جديدة";
    
    let message;
    if (isUpdate && oldGrade !== null) {
      const changeEmoji = grade > oldGrade ? "📈" : grade < oldGrade ? "📉" : "🔄";
      message = `${changeEmoji} تم تحديث علامتك في ${subject} من ${oldGrade}/20 إلى ${grade}/20 بواسطة الأستاذ ${teacherName}${gradeComment}`;
    } else {
      message = `حصّلت على ${grade}/20 في ${subject} من الأستاذ ${teacherName}${gradeComment}`;
    }

    // Send via FCM
    if (FCMService && FCMService.initialized) {
      try {
        const deviceTokens = await DeviceToken.find({ 
          user: studentId,
          userModel: 'Student'
        }).lean();
        
        if (deviceTokens.length > 0) {
          const tokens = deviceTokens.map(d => d.token).filter(Boolean);
          const payload = {
            notification: {
              title: `${gradeEmoji} ${actionText}`,
              body: message,
            },
            data: {
              type: "grade",
              subject,
              grade: grade.toString(),
              teacherName,
              isUpdate: isUpdate.toString(),
              oldGrade: oldGrade ? oldGrade.toString() : "",
            },
          };
          await FCMService.sendToTokens(tokens, payload);
          console.log(`📱 Grade notification sent via FCM to ${tokens.length} devices`);
        }
      } catch (fcmErr) {
        console.error("❌ Error sending grade FCM:", fcmErr);
      }
    }

    return await createNotificationFn({
      recipient: studentId,
      recipientModel: "Student",
      type: "grade",
      title: `${gradeEmoji} ${actionText}`,
      message: message,
      priority: grade >= 18 ? "high" : "medium",
      data: { subject, grade, teacherName, gradeEmoji, isUpdate, oldGrade },
    });
  } catch (error) {
    console.error("❌ Error creating grade notification:", error);
    throw error;
  }
}

/**
 * Notify about new message
 */
async function notifyNewMessage(createNotificationFn, recipientId, recipientModel, senderName, messageText) {
  try {
    const shortText = messageText.length > 50 ? messageText.substring(0, 50) + "..." : messageText;
    return await createNotificationFn({
      recipient: recipientId,
      recipientModel,
      type: "message",
      title: `💬 رسالة جديدة`,
      message: `رسالة من ${senderName}: ${shortText}`,
      priority: "medium",
      data: { senderName, messageText, shortText },
    });
  } catch (error) {
    console.error("❌ Error creating message notification:", error);
    throw error;
  }
}

/**
 * Notify about student absence
 */
async function notifyAbsence(createNotificationFn, studentId, date, teacherName) {
  try {
    const student = await Student.findById(studentId);
    if (!student) throw new Error("Student not found");
    
    const studentName = student.firstName && student.lastName 
      ? `${student.firstName} ${student.lastName}` 
      : student.name || 'الطالب';
    
    console.log(`📢 Sending absence notification to student: ${studentName} (ID: ${studentId})`);
    
    const notificationTitle = `⚠️ تنبيه غياب`;
    const notificationMessage = `تم تسجيل غيابك بتاريخ ${date} بواسطة ${teacherName}. يرجى المتابعة مع معلمك.`;
    
    // FCM will be sent automatically by createNotification in NotificationService
    // No need to send it here to avoid duplication
    
    return await createNotificationFn({
      recipient: studentId,
      recipientModel: "Student",
      type: "attendance",
      title: notificationTitle,
      message: notificationMessage,
      priority: "high",
      data: { 
        date, 
        teacherName,
        studentName,
        absenceType: 'absent'
      },
    });
  } catch (error) {
    console.error("❌ Error creating absence notification:", error);
    throw error;
  }
}

/**
 * Notify about absence removal
 */
async function notifyAbsenceRemoved(createNotificationFn, studentId, date, teacherName) {
  try {
    const student = await Student.findById(studentId);
    if (!student) throw new Error("Student not found");
    
    const studentName = student.firstName && student.lastName 
      ? `${student.firstName} ${student.lastName}` 
      : student.name || 'الطالب';
    
    console.log(`✅ Sending absence removal notification to student: ${studentName} (ID: ${studentId})`);
    
    const notificationTitle = `✅ تم إزالة الغياب`;
    const notificationMessage = `تم إزالة غيابك بتاريخ ${date} بواسطة ${teacherName}. تم تسجيلك حاضراً.`;
    
    // FCM will be sent automatically by createNotification in NotificationService
    // No need to send it here to avoid duplication
    
    return await createNotificationFn({
      recipient: studentId,
      recipientModel: "Student",
      type: "attendance",
      title: notificationTitle,
      message: notificationMessage,
      priority: "medium",
      data: { 
        date, 
        teacherName,
        studentName,
        absenceType: 'removed'
      },
    });
  } catch (error) {
    console.error("❌ Error creating absence removal notification:", error);
    throw error;
  }
}

/**
 * Notify system message
 */
async function notifySystemMessage(createNotificationFn, recipientId, recipientModel, title, message, priority = "medium", data = {}) {
  try {
    return await createNotificationFn({
      recipient: recipientId,
      recipientModel,
      type: "general",
      title: `🔔 ${title}`,
      message,
      priority,
      isSystemNotification: true,
      data,
    });
  } catch (error) {
    console.error("❌ Error creating system notification:", error);
    throw error;
  }
}

module.exports = {
  notifyNewGrade,
  notifyNewMessage,
  notifyAbsence,
  notifyAbsenceRemoved,
  notifySystemMessage,
};
