const Notification = require("../models/Notification");
const Student = require("../models/Student");
const Teacher = require("../models/Teacher");
const cron = require("node-cron");
const moment = require("moment-timezone");

class NotificationService {
  constructor(io) {
    this.io = io;
    this.timezone = "Asia/Jerusalem"; // منطقة زمنية فلسطين/الأردن
    this.setupPrayerNotifications();
    console.log("🔔 NotificationService initialized");
  }

  // إنشاء إشعار جديد
  async createNotification(notificationData) {
    try {
      const notification = new Notification(notificationData);
      const savedNotification = await notification.save();

      // إرسال الإشعار عبر Socket.IO فوراً
      await this.sendRealTimeNotification(savedNotification);

      console.log(
        `✅ Notification created: ${savedNotification.title} for ${savedNotification.recipient}`
      );
      return savedNotification;
    } catch (error) {
      console.error("❌ Error creating notification:", error);
      throw error;
    }
  }

  // إرسال إشعار فوري عبر Socket.IO
  async sendRealTimeNotification(notification) {
    try {
      const recipientId = notification.recipient.toString();

      // البحث عن المستخدم في onlineUsers
      if (global.onlineUsers && global.onlineUsers.has(recipientId)) {
        const userData = global.onlineUsers.get(recipientId);

        // إرسال الإشعار للمستخدم المتصل
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

        console.log(
          `📱 Real-time notification sent to ${userData.firstName} (${notification.type})`
        );
      } else {
        console.log(
          `⚠️ User ${recipientId} is offline, notification stored for later`
        );
      }
    } catch (error) {
      console.error("❌ Error sending real-time notification:", error);
    }
  }

  // إعداد إشعارات الصلاة
  setupPrayerNotifications() {
    // أوقات الصلاة (يمكن تخصيصها حسب المنطقة)
    const prayerTimes = [
      { name: "الفجر", time: "05:00", emoji: "🌅" },
      { name: "الظهر", time: "12:30", emoji: "☀️" },
      { name: "العصر", time: "15:45", emoji: "🌤️" },
      { name: "المغرب", time: "18:00", emoji: "🌅" },
      { name: "العشاء", time: "19:30", emoji: "🌙" },
    ];

    prayerTimes.forEach((prayer) => {
      // إشعار قبل 10 دقائق من كل صلاة
      const [hour, minute] = prayer.time.split(":");
      let notificationMinute = parseInt(minute) - 10;
      let notificationHour = parseInt(hour);

      // التعامل مع الوقت السالب
      if (notificationMinute < 0) {
        notificationMinute = 60 + notificationMinute;
        notificationHour -= 1;
      }

      // التعامل مع الساعة السالبة (منتصف الليل)
      if (notificationHour < 0) {
        notificationHour = 23;
      }

      // جدولة الإشعار
      const cronTime = `${notificationMinute} ${notificationHour} * * *`;

      cron.schedule(cronTime, () => {
        this.sendPrayerNotification(prayer.name, prayer.time, prayer.emoji);
      });

      console.log(
        `⏰ Prayer notification scheduled: ${
          prayer.name
        } at ${notificationHour}:${notificationMinute
          .toString()
          .padStart(2, "0")}`
      );
    });

    // إشعار تذكير بقراءة القرآن في المساء
    cron.schedule("0 20 * * *", () => {
      this.sendQuranReminderNotification();
    });

    console.log("🕌 Prayer notifications system activated");
  }

  // إرسال إشعار الصلاة لجميع المستخدمين المتصلين
  async sendPrayerNotification(prayerName, prayerTime, emoji) {
    try {
      const message = `${emoji} حان وقت صلاة ${prayerName} - ${prayerTime}\nبارك الله فيكم`;

      // إرسال لجميع المستخدمين المتصلين عبر Socket.IO
      this.io.emit("prayerNotification", {
        type: "prayer_time",
        title: `صلاة ${prayerName}`,
        message: message,
        prayerName,
        prayerTime,
        emoji,
        timestamp: new Date(),
      });

      console.log(
        `🕌 Prayer notification broadcasted: ${prayerName} at ${prayerTime}`
      );
    } catch (error) {
      console.error("❌ Error sending prayer notification:", error);
    }
  }

  // تذكير بقراءة القرآن
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

  // إشعار عند إضافة درجة جديدة
  async notifyNewGrade(studentId, subject, grade, teacherName) {
    try {
      let gradeEmoji = "📊";
      let gradeComment = "";

      // تحديد الإيموجي والتعليق حسب الدرجة
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
        gradeComment = " - يحتاج تحسين";
      }

      return await this.createNotification({
        recipient: studentId,
        recipientModel: "Student",
        type: "grade",
        title: `${gradeEmoji} درجة جديدة`,
        message: `حصلت على ${grade}% في ${subject} من الأستاذ ${teacherName}${gradeComment}`,
        priority: grade >= 90 ? "high" : "medium",
        data: { subject, grade, teacherName, gradeEmoji },
      });
    } catch (error) {
      console.error("❌ Error creating grade notification:", error);
      throw error;
    }
  }

  // إشعار عند وصول رسالة جديدة
  async notifyNewMessage(recipientId, recipientModel, senderName, messageText) {
    try {
      const shortText =
        messageText.length > 50
          ? messageText.substring(0, 50) + "..."
          : messageText;

      return await this.createNotification({
        recipient: recipientId,
        recipientModel: recipientModel,
        type: "message",
        title: "💬 رسالة جديدة",
        message: `رسالة من ${senderName}: ${shortText}`,
        priority: "medium",
        data: { senderName, messageText, shortText },
      });
    } catch (error) {
      console.error("❌ Error creating message notification:", error);
      throw error;
    }
  }

  // إشعار عند تسجيل الغياب
  async notifyAbsence(studentId, date, teacherName) {
    try {
      const student = await Student.findById(studentId);
      if (!student) {
        throw new Error("Student not found");
      }

      return await this.createNotification({
        recipient: studentId,
        recipientModel: "Student",
        type: "attendance",
        title: "⚠️ تنبيه غياب",
        message: `تم تسجيل غيابك في تاريخ ${date} من قِبل الأستاذ ${teacherName}`,
        priority: "high",
        data: {
          date,
          teacherName,
          studentName: student.firstName + " " + student.fatherName,
        },
      });
    } catch (error) {
      console.error("❌ Error creating absence notification:", error);
      throw error;
    }
  }

  // إشعار عام للنظام
  async notifySystemMessage(
    recipientId,
    recipientModel,
    title,
    message,
    priority = "medium",
    data = {}
  ) {
    try {
      return await this.createNotification({
        recipient: recipientId,
        recipientModel: recipientModel,
        type: "general",
        title: `🔔 ${title}`,
        message: message,
        priority: priority,
        isSystemNotification: true,
        data: data,
      });
    } catch (error) {
      console.error("❌ Error creating system notification:", error);
      throw error;
    }
  }

  // إرسال إشعار لجميع الطلاب في حلقة معينة
  async notifyGroup(
    groupName,
    title,
    message,
    type = "general",
    priority = "medium"
  ) {
    try {
      const students = await Student.find({ group: groupName, isActive: true });

      const notifications = students.map((student) => ({
        recipient: student._id,
        recipientModel: "Student",
        type: type,
        title: title,
        message: message,
        priority: priority,
        data: { groupName },
      }));

      const savedNotifications = await Notification.insertMany(notifications);

      // إرسال الإشعارات فوراً لكل طالب متصل
      for (const notification of savedNotifications) {
        await this.sendRealTimeNotification(notification);
      }

      console.log(
        `📢 Group notification sent to ${students.length} students in ${groupName}`
      );
      return savedNotifications;
    } catch (error) {
      console.error("❌ Error sending group notification:", error);
      throw error;
    }
  }

  // الحصول على إحصائيات الإشعارات
  async getNotificationStats() {
    try {
      const stats = await Notification.aggregate([
        {
          $group: {
            _id: "$type",
            count: { $sum: 1 },
            unreadCount: {
              $sum: { $cond: [{ $eq: ["$isRead", false] }, 1, 0] },
            },
          },
        },
      ]);

      const totalNotifications = await Notification.countDocuments();
      const totalUnread = await Notification.countDocuments({ isRead: false });

      return {
        totalNotifications,
        totalUnread,
        byType: stats,
        generatedAt: new Date(),
      };
    } catch (error) {
      console.error("❌ Error getting notification stats:", error);
      throw error;
    }
  }

  // تنظيف الإشعارات القديمة (تشغل مرة واحدة يومياً)
  scheduleDailyCleanup() {
    cron.schedule("0 2 * * *", async () => {
      try {
        // حذف الإشعارات المقروءة الأقدم من 30 يوم
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const result = await Notification.deleteMany({
          isRead: true,
          readAt: { $lt: thirtyDaysAgo },
        });

        console.log(
          `🧹 Daily cleanup: Deleted ${result.deletedCount} old read notifications`
        );
      } catch (error) {
        console.error("❌ Error during daily cleanup:", error);
      }
    });

    console.log("🧹 Daily notification cleanup scheduled at 2:00 AM");
  }
}

module.exports = NotificationService;
