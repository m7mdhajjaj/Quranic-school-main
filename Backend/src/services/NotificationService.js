const Notification = require("../schema/Notification");
const Student = require("../schema/Student");
const Teacher = require("../schema/Teacher");
const cron = require("node-cron");
const moment = require("moment-timezone");
const FCMService = require("./FCMService");
const DeviceToken = require("../schema/DeviceToken");

class NotificationService {
  constructor(io) {
    this.io = io;
    this.timezone = "Asia/Jerusalem";
    this.setupPrayerNotifications();
    console.log("🔔 NotificationService initialized");
  }

  // Create and dispatch a notification
  async createNotification(notificationData) {
    try {
      const notification = new Notification(notificationData);
      const savedNotification = await notification.save();

      // Decide whether to send via Socket.IO or FCM (push) depending on online status.
      const recipientIdStr = savedNotification.recipient.toString();
      const isOnline = global.onlineUsers && global.onlineUsers.has(recipientIdStr);

      // Send real-time socket notification if online
      if (isOnline) {
        try {
          await this.sendRealTimeNotification(savedNotification);
        } catch (err) {
          console.error("Error sending real-time notification to online user:", err);
        }
      }

      // Send push via FCM to offline devices (or always for high-priority/system)
      try {
        const shouldForcePush = savedNotification.isSystemNotification || (savedNotification.priority === "urgent" || savedNotification.priority === "high");
        const sendPush = !isOnline || shouldForcePush;
        if (sendPush && FCMService && FCMService.initialized) {
          const devices = await DeviceToken.find({ user: savedNotification.recipient }).lean();
          const tokenList = devices.map((d) => d.token).filter(Boolean);
          if (tokenList.length > 0) {
            const payload = {
              notification: {
                title: savedNotification.title,
                body: savedNotification.message,
              },
              data: {
                notificationId: savedNotification._id.toString(),
                type: savedNotification.type,
                priority: savedNotification.priority || "medium",
              },
            };
            await FCMService.sendToTokens(tokenList, payload);
            console.log(`📣 Push notification sent via FCM to ${tokenList.length} devices for user ${recipientIdStr}`);
          }
        }
      } catch (fcmErr) {
        console.error("❌ Error sending FCM push:", fcmErr.message || fcmErr);
      }

      console.log(`✅ Notification created: ${savedNotification.title} for ${savedNotification.recipient}`);
      return savedNotification;
    } catch (error) {
      console.error("❌ Error creating notification:", error);
      throw error;
    }
  }

  // Send a real-time notification via Socket.IO
  async sendRealTimeNotification(notification) {
    try {
      const recipientId = notification.recipient.toString();

      if (global.onlineUsers && global.onlineUsers.has(recipientId)) {
        const userData = global.onlineUsers.get(recipientId);
        this.io.to(userData.socketId).emit("newNotification", {
          id: notification._id,
          type: notification.type,
          title: notification.title,
          message: notification.message,
          data: notification.data,
          priority: notification.priority,
          createdAt: notification.createdAt,
          isNew: notification.isNew,
        });

        console.log(`📱 Real-time notification sent to ${userData.firstName} (${notification.type})`);
      } else {
        console.log(`⚠️ User ${recipientId} is offline, skipping Socket.IO emit`);
      }
    } catch (error) {
      console.error("❌ Error sending real-time notification:", error);
    }
  }

  // Schedules and prayer notifications + daily reminders (kept unchanged)
  setupPrayerNotifications() {
    const prayerTimes = [
      { name: "الفجر", time: "05:00", emoji: "🌅" },
      { name: "الظهر", time: "12:30", emoji: "☀️" },
      { name: "العصر", time: "15:45", emoji: "🌤️" },
      { name: "المغرب", time: "18:00", emoji: "🌅" },
      { name: "العشاء", time: "19:30", emoji: "🌙" },
    ];

    prayerTimes.forEach((prayer) => {
      const [hour, minute] = prayer.time.split(":");
      let notificationMinute = parseInt(minute) - 10;
      let notificationHour = parseInt(hour);

      if (notificationMinute < 0) {
        notificationMinute = 60 + notificationMinute;
        notificationHour -= 1;
      }
      if (notificationHour < 0) notificationHour = 23;

      const cronTime = `${notificationMinute} ${notificationHour} * * *`;
      cron.schedule(cronTime, () => {
        this.sendPrayerNotification(prayer.name, prayer.time, prayer.emoji);
      });

      console.log(`⏰ Prayer notification scheduled: ${prayer.name} at ${notificationHour}:${notificationMinute.toString().padStart(2, "0")}`);
    });

    cron.schedule("0 20 * * *", () => {
      this.sendQuranReminderNotification();
    });

    console.log("🛎️ Prayer notifications system activated");
  }

  async sendPrayerNotification(prayerName, prayerTime, emoji) {
    try {
      const message = `${emoji} حان وقت صلاة ${prayerName} - ${prayerTime}\nبارك الله فيكم`;
      this.io.emit("prayerNotification", {
        type: "prayer_time",
        title: `صلاة ${prayerName}`,
        message,
        prayerName,
        prayerTime,
        emoji,
        timestamp: new Date(),
      });
      console.log(`🕰️ Prayer notification broadcasted: ${prayerName} at ${prayerTime}`);
    } catch (error) {
      console.error("❌ Error sending prayer notification:", error);
    }
  }

  async sendQuranReminderNotification() {
    try {
      this.io.emit("quranReminder", {
        type: "quran_reminder",
        title: "تذكير بقراءة القرآن",
        message: "📖 لا تنسَ وردك اليومي من القرآن الكريم",
        emoji: "📖",
        timestamp: new Date(),
      });
      console.log("📖 Daily Quran reminder sent");
    } catch (error) {
      console.error("❌ Error sending Quran reminder:", error);
    }
  }

  // ... other helper notification methods (notifyNewGrade, notifyNewMessage, etc.)
  // For brevity, they can call createNotification(...) which already handles dispatch

  async notifyNewGrade(studentId, subject, grade, teacherName) {
    try {
      let gradeEmoji = "📈";
      let gradeComment = "";
      if (grade >= 90) {
        gradeEmoji = "🏆";
        gradeComment = " - ممتاز!";
      } else if (grade >= 80) {
        gradeEmoji = "⭐";
        gradeComment = " - جيد جداً!";
      } else if (grade >= 70) {
        gradeEmoji = "👍";
        gradeComment = " - جيد";
      } else if (grade >= 60) {
        gradeEmoji = "📝";
        gradeComment = " - مقبول";
      } else {
        gradeEmoji = "💪";
        gradeComment = " - حظ أوفر";
      }

      return await this.createNotification({
        recipient: studentId,
        recipientModel: "Student",
        type: "grade",
        title: `${gradeEmoji} درجة جديدة`,
        message: `حصّلت على ${grade}% في ${subject} من الأستاذ ${teacherName}${gradeComment}`,
        priority: grade >= 90 ? "high" : "medium",
        data: { subject, grade, teacherName, gradeEmoji },
      });
    } catch (error) {
      console.error("❌ Error creating grade notification:", error);
      throw error;
    }
  }

  async notifyNewMessage(recipientId, recipientModel, senderName, messageText) {
    try {
      const shortText = messageText.length > 50 ? messageText.substring(0, 50) + "..." : messageText;
      return await this.createNotification({
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

  async notifyAbsence(studentId, date, teacherName) {
    try {
      const student = await Student.findById(studentId);
      if (!student) throw new Error("Student not found");
      return await this.createNotification({
        recipient: studentId,
        recipientModel: "Student",
        type: "attendance",
        title: `⚠️ تنبيه غياب`,
        message: `تم تسجيل غيابك في تاريخ ${date} من الأستاذ ${teacherName}`,
        priority: "high",
        data: { date, teacherName },
      });
    } catch (error) {
      console.error("❌ Error creating absence notification:", error);
      throw error;
    }
  }

  async notifySystemMessage(recipientId, recipientModel, title, message, priority = "medium", data = {}) {
    try {
      return await this.createNotification({
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

  // Simple stats method
  async getNotificationStats() {
    try {
      const stats = await Notification.aggregate([
        { $group: { _id: "$type", count: { $sum: 1 }, unreadCount: { $sum: { $cond: [{ $eq: ["$isRead", false] }, 1, 0] } } } },
      ]);
      const totalNotifications = await Notification.countDocuments();
      const totalUnread = await Notification.countDocuments({ isRead: false });
      return { totalNotifications, totalUnread, byType: stats, generatedAt: new Date() };
    } catch (error) {
      console.error("❌ Error getting notification stats:", error);
      throw error;
    }
  }

  scheduleDailyCleanup() {
    cron.schedule("0 2 * * *", async () => {
      try {
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const result = await Notification.deleteMany({ isRead: true, readAt: { $lt: thirtyDaysAgo } });
        console.log(`🧹 Daily cleanup: Deleted ${result.deletedCount} old read notifications`);
      } catch (error) {
        console.error("❌ Error during daily cleanup:", error);
      }
    });
    console.log("🧹 Daily notification cleanup scheduled at 2:00 AM");
  }
}

module.exports = NotificationService;
