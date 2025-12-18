/**
 * Helper function to send activity creation notifications
 * Sends Firebase notifications and Socket.IO events to all students
 * 
 * ✅ Updated: Uses PresenceService to send to online users via Socket,
 * and saves to DB for offline users
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
      // ✅ Get ALL students (not just isActive)
      const Student = require("../../schema/Student");
      const { isUserOnline, onlineUsersManager } = require("../../services/PresenceService");
      
      const allStudents = await Student.find({});

      let sentToOnline = 0;
      let savedForOffline = 0;

      // Send notification to each student
      for (const student of allStudents) {
        const studentId = student._id.toString();
        
        // Create notification (will be sent via Socket if online, or saved to DB)
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

        if (isUserOnline(studentId)) {
          sentToOnline++;
        } else {
          savedForOffline++;
        }
      }

      console.log(
        `✅ Activity notifications: ${sentToOnline} sent to online, ${savedForOffline} saved for offline (total: ${allStudents.length})`
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
 * Sends Firebase notifications and Socket.IO events to all students
 * 
 * ✅ Updated: Uses PresenceService to send to online users via Socket,
 * and saves to DB for offline users
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
      // ✅ Get ALL students (not just isActive)
      const Student = require("../../schema/Student");
      const { isUserOnline } = require("../../services/PresenceService");
      
      const allStudents = await Student.find({});

      let sentToOnline = 0;
      let savedForOffline = 0;

      // Send notification to each student
      for (const student of allStudents) {
        const studentId = student._id.toString();
        
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

        if (isUserOnline(studentId)) {
          sentToOnline++;
        } else {
          savedForOffline++;
        }
      }

      console.log(
        `✅ Activity update notifications: ${sentToOnline} sent to online, ${savedForOffline} saved for offline (total: ${allStudents.length})`
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
