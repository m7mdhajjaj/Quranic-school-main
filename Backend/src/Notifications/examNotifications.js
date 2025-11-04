// ============================================================================
// examNotifications.js - Exam Notification Handlers
// ============================================================================

const Student = require("../schema/Student");
const { formatTime12Arabic } = require("../utils/timeFormatter");

/**
 * Send notification when exam is created
 * @param {Object} exam - The created exam object
 * @param {Object} io - Socket.IO instance (optional, from req.app.get('io'))
 * @returns {Promise<void>}
 */
const notifyExamCreated = async (exam, io = null) => {
  console.log("\n🔔 ========== EXAM NOTIFICATION START ==========");
  console.log(`📝 Exam: ${exam.name}`);
  console.log(`👥 Group: ${exam.group || "N/A"}`);
  console.log(
    `🔧 NotificationService: ${
      global.notificationService ? "✅ Available" : "❌ Not Available"
    }`
  );

  if (!exam.group || !global.notificationService) {
    console.log(
      "⚠️ Cannot send notification: missing group or notificationService"
    );
    console.log("🔔 ========== EXAM NOTIFICATION END (SKIPPED) ==========\n");
    return;
  }

  try {
    // Get all students in this group
    console.log(`🔍 Searching for students in group "${exam.group}"...`);
    const students = await Student.find({
      group: exam.group,
      isActive: true,
    }).select("_id firstName lastName");

    console.log(
      `👥 Found ${students.length} active students in group "${exam.group}"`
    );

    if (!students || students.length === 0) {
      console.log(`⚠️ No students found in group "${exam.group}"`);
      console.log(
        "🔔 ========== EXAM NOTIFICATION END (NO STUDENTS) ==========\n"
      );
      return;
    }

    // Log students list
    students.forEach((student, index) => {
      console.log(
        `   ${index + 1}. ${student.firstName} ${student.lastName} (ID: ${
          student._id
        })`
      );
    });

    const formattedDate = new Date(exam.date).toLocaleDateString("ar-EG", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const formattedTime = formatTime12Arabic(exam.time);

    console.log(`📅 Formatted Date: ${formattedDate}`);
    console.log(`⏰ Time: ${exam.time} → ${formattedTime}`);
    console.log(`\n📤 Sending notifications to ${students.length} students...`);

    // Send notification to each student (Socket.IO + Firebase + Database)
    const notificationPromises = students.map((student, index) => {
      console.log(
        `   ${index + 1}. Sending to ${student.firstName} ${
          student.lastName
        }...`
      );
      return global.notificationService.createNotification({
        recipient: student._id,
        recipientModel: "Student",
        type: "exam",
        title: "📝 امتحان جديد",
        message: `تم إضافة امتحان جديد: ${exam.name} - يوم ${formattedDate} الساعة ${formattedTime}`,
        priority: "high",
        data: {
          examId: exam._id,
          examName: exam.name,
          examDate: exam.date,
          examTime: exam.time,
          groupName: exam.group,
          action: "created",
        },
      });
    });

    await Promise.all(notificationPromises);
    console.log(`\n✅ Exam creation notifications sent successfully!`);
    console.log(
      `   👥 Recipients: ${students.length} students in group "${exam.group}"`
    );
    console.log(
      `   📱 Via: Socket.IO (real-time) + Firebase (push) + Database (persistent)`
    );
    console.log("🔔 ========== EXAM NOTIFICATION END (SUCCESS) ==========\n");
  } catch (error) {
    console.error("\n❌ Error sending exam creation notifications:", error);
    console.log("🔔 ========== EXAM NOTIFICATION END (ERROR) ==========\n");
    // Don't fail the exam creation if notifications fail
  }
};

/**
 * Send notification when exam is deleted
 * @param {Object} exam - The deleted exam object
 * @param {Object} io - Socket.IO instance (optional, from req.app.get('io'))
 * @returns {Promise<void>}
 */
const notifyExamDeleted = async (exam, io = null) => {
  console.log("\n🗑️ ========== EXAM DELETION NOTIFICATION START ==========");
  console.log(`📝 Exam: ${exam.name}`);
  console.log(`👥 Group: ${exam.group || "N/A"}`);

  if (!exam.group || !global.notificationService) {
    console.log(
      "⚠️ Cannot send notification: missing group or notificationService"
    );
    console.log(
      "🗑️ ========== EXAM DELETION NOTIFICATION END (SKIPPED) ==========\n"
    );
    return;
  }

  try {
    console.log(`🔍 Searching for students in group "${exam.group}"...`);
    const students = await Student.find({
      group: exam.group,
      isActive: true,
    }).select("_id firstName lastName");

    console.log(`👥 Found ${students.length} active students`);

    if (!students || students.length === 0) {
      console.log(`⚠️ No students found in group "${exam.group}"`);
      console.log(
        "🗑️ ========== EXAM DELETION NOTIFICATION END (NO STUDENTS) ==========\n"
      );
      return;
    }

    const formattedDate = new Date(exam.date).toLocaleDateString("ar-EG", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const formattedTime = formatTime12Arabic(exam.time);

    console.log(
      `📤 Sending deletion notifications to ${students.length} students...`
    );

    const notificationPromises = students.map((student, index) => {
      console.log(
        `   ${index + 1}. Sending to ${student.firstName} ${
          student.lastName
        }...`
      );
      return global.notificationService.createNotification({
        recipient: student._id,
        recipientModel: "Student",
        type: "exam",
        title: "🗑️ تم إلغاء امتحان",
        message: `تم إلغاء امتحان: ${exam.name} - الذي كان مقرراً يوم ${formattedDate} الساعة ${formattedTime}`,
        priority: "high",
        data: {
          examId: exam._id,
          examName: exam.name,
          examDate: exam.date,
          examTime: exam.time,
          groupName: exam.group,
          action: "deleted",
        },
      });
    });

    await Promise.all(notificationPromises);
    console.log(`\n✅ Exam deletion notifications sent successfully!`);
    console.log(`   👥 Recipients: ${students.length} students`);
    console.log(
      `   📱 Via: Socket.IO (real-time) + Firebase (push) + Database (persistent)`
    );
    console.log(
      "🗑️ ========== EXAM DELETION NOTIFICATION END (SUCCESS) ==========\n"
    );
  } catch (error) {
    console.error("\n❌ Error sending exam deletion notifications:", error);
    console.log(
      "🗑️ ========== EXAM DELETION NOTIFICATION END (ERROR) ==========\n"
    );
  }
};

/**
 * Send notification when exam is updated
 * @param {Object} exam - The updated exam object
 * @param {Object} io - Socket.IO instance (optional, from req.app.get('io'))
 * @returns {Promise<void>}
 */
const notifyExamUpdated = async (exam, io = null) => {
  console.log("\n✏️ ========== EXAM UPDATE NOTIFICATION START ==========");
  console.log(`📝 Exam: ${exam.name}`);
  console.log(`👥 Group: ${exam.group || "N/A"}`);

  if (!exam.group || !global.notificationService) {
    console.log(
      "⚠️ Cannot send notification: missing group or notificationService"
    );
    console.log(
      "✏️ ========== EXAM UPDATE NOTIFICATION END (SKIPPED) ==========\n"
    );
    return;
  }

  try {
    console.log(`🔍 Searching for students in group "${exam.group}"...`);
    const students = await Student.find({
      group: exam.group,
      isActive: true,
    }).select("_id firstName lastName");

    console.log(`👥 Found ${students.length} active students`);

    if (!students || students.length === 0) {
      console.log(`⚠️ No students found in group "${exam.group}"`);
      console.log(
        "✏️ ========== EXAM UPDATE NOTIFICATION END (NO STUDENTS) ==========\n"
      );
      return;
    }

    const formattedDate = new Date(exam.date).toLocaleDateString("ar-EG", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const formattedTime = formatTime12Arabic(exam.time);

    console.log(
      `📤 Sending update notifications to ${students.length} students...`
    );

    const notificationPromises = students.map((student, index) => {
      console.log(
        `   ${index + 1}. Sending to ${student.firstName} ${
          student.lastName
        }...`
      );
      return global.notificationService.createNotification({
        recipient: student._id,
        recipientModel: "Student",
        type: "exam",
        title: "✏️ تم تعديل امتحان",
        message: `تم تعديل امتحان: ${exam.name} - الموعد الجديد يوم ${formattedDate} الساعة ${formattedTime}`,
        priority: "high",
        data: {
          examId: exam._id,
          examName: exam.name,
          examDate: exam.date,
          examTime: exam.time,
          groupName: exam.group,
          action: "updated",
        },
      });
    });

    await Promise.all(notificationPromises);
    console.log(`\n✅ Exam update notifications sent successfully!`);
    console.log(`   👥 Recipients: ${students.length} students`);
    console.log(
      `   📱 Via: Socket.IO (real-time) + Firebase (push) + Database (persistent)`
    );
    console.log(
      "✏️ ========== EXAM UPDATE NOTIFICATION END (SUCCESS) ==========\n"
    );
  } catch (error) {
    console.error("\n❌ Error sending exam update notifications:", error);
    console.log(
      "✏️ ========== EXAM UPDATE NOTIFICATION END (ERROR) ==========\n"
    );
  }
};

module.exports = {
  notifyExamCreated,
  notifyExamDeleted,
  notifyExamUpdated,
};
