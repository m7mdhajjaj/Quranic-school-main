/**
 * Helper function to send activity creation notifications
 * Sends Firebase notifications and Socket.IO events to all active students
 */
exports.sendActivityNotifications = async (
  activity,
  title,
  date,
  category
) => {
  // Send Firebase notifications
  if (global.notificationService) {
    try {
      // Get all active students
      const Student = require("../../schema/Student");
      const activeStudents = await Student.find({ isActive: true });

      // Send notification to each student
      for (const student of activeStudents) {
        await global.notificationService.createNotification({
          recipient: student._id,
          recipientModel: "Student",
          type: "activity",
          title: "📅 نشاط جديد",
          message: `تم إضافة نشاط جديد: ${title}`,
          priority: "medium",
          data: {
            activityId: activity._id,
            activityTitle: title,
            activityDate: date,
            category: category,
          },
        });
      }

      console.log(
        `✅ Sent new activity notifications to ${activeStudents.length} students`
      );
    } catch (notificationError) {
      console.error("❌ Error sending activity notifications:", notificationError);
      // Don't fail activity creation due to notification issues
    }
  } else {
    console.log("⚠️ Notification service not available");
  }

  // Emit Socket.IO event
  if (global.io) {
    console.log("📡 Broadcasting activity created event");
    global.io.to("activities").emit("activityCreated", activity);
  } else {
    console.log("⚠️ Socket.IO not available");
  }
};

/**
 * Helper function to send activity update notifications
 * Sends Firebase notifications and Socket.IO events to all active students
 */
exports.sendActivityUpdateNotifications = async (
  activity,
  title,
  date,
  category
) => {
  // Send Firebase notifications
  if (global.notificationService) {
    try {
      // Get all active students
      const Student = require("../../schema/Student");
      const activeStudents = await Student.find({ isActive: true });

      // Send notification to each student
      for (const student of activeStudents) {
        await global.notificationService.createNotification({
          recipient: student._id,
          recipientModel: "Student",
          type: "activity",
          title: "🔄 تحديث نشاط",
          message: `تم تعديل النشاط: ${title}`,
          priority: "medium",
          data: {
            activityId: activity._id,
            activityTitle: title,
            activityDate: date,
            category: category,
          },
        });
      }

      console.log(
        `✅ Sent activity update notifications to ${activeStudents.length} students`
      );
    } catch (notificationError) {
      console.error("❌ Error sending activity update notifications:", notificationError);
      // Don't fail activity update due to notification issues
    }
  } else {
    console.log("⚠️ Notification service not available");
  }

  // Emit Socket.IO event
  if (global.io) {
    console.log("📡 Broadcasting activity updated event");
    global.io.to("activities").emit("activityUpdated", activity);
  } else {
    console.log("⚠️ Socket.IO not available");
  }
};
