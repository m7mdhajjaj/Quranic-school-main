const Notification = require("../schema/Notification");
const Student = require("../schema/Student");
const Teacher = require("../schema/Teacher");
const cron = require("node-cron");
const moment = require("moment-timezone");
const FCMService = require("./FCMService");
const DeviceToken = require("../schema/DeviceToken");
const adhan = require("adhan");

class NotificationService {
  constructor(io) {
    this.io = io;
    this.timezone = "Asia/Jerusalem";
    // إحداثيات فلسطين (القدس) - يمكن تغييرها حسب موقعك
    this.coordinates = new adhan.Coordinates(31.9522, 35.2332);
    this.calculationParams = adhan.CalculationMethod.MuslimWorldLeague();
    this.calculationParams.madhab = adhan.Madhab.Shafi; // المذهب الشافعي
    this.prayerTasks = {}; // لتخزين المهام المجدولة
    this.setupPrayerNotifications();
    console.log("🔔 NotificationService initialized with dynamic prayer times");
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

  // Schedules and prayer notifications + daily reminders with DYNAMIC prayer times
  setupPrayerNotifications() {
    // جدولة يومية لحساب أوقات الصلاة (كل يوم عند منتصف الليل)
    cron.schedule("0 0 * * *", () => {
      console.log("🕌 Updating daily prayer times...");
      this.scheduleDailyPrayerTimes();
    });

    // تشغيل فوري عند بدء السيرفر لحساب أوقات اليوم
    this.scheduleDailyPrayerTimes();

    // تذكير يومي بقراءة القرآن الساعة 8 مساءً
    cron.schedule("0 20 * * *", () => {
      this.sendQuranReminderNotification();
    });

    console.log("🛎️ Dynamic prayer notifications system activated");
  }

  scheduleDailyPrayerTimes() {
    try {
      const today = new Date();
      const prayerTimes = new adhan.PrayerTimes(this.coordinates, today, this.calculationParams);

      const prayers = [
        { name: "الفجر", time: prayerTimes.fajr, emoji: "🌅" },
        { name: "الظهر", time: prayerTimes.dhuhr, emoji: "☀️" },
        { name: "العصر", time: prayerTimes.asr, emoji: "🌤️" },
        { name: "المغرب", time: prayerTimes.maghrib, emoji: "�" },
        { name: "العشاء", time: prayerTimes.isha, emoji: "🌙" },
      ];

      console.log(`\n🕌 أوقات الصلاة لتاريخ ${today.toLocaleDateString('ar-EG')}:`);
      
      prayers.forEach((prayer) => {
        if (prayer.time) {
          const prayerMoment = moment(prayer.time).tz(this.timezone);
          const prayerHour = prayerMoment.hour();
          const prayerMinute = prayerMoment.minute();
          
          // حساب وقت التنبيه (10 دقائق قبل الصلاة)
          let notificationMinute = prayerMinute - 10;
          let notificationHour = prayerHour;

          if (notificationMinute < 0) {
            notificationMinute = 60 + notificationMinute;
            notificationHour -= 1;
          }
          if (notificationHour < 0) notificationHour = 23;

          const prayerTimeStr = prayerMoment.format("HH:mm");
          console.log(`   ${prayer.emoji} ${prayer.name}: ${prayerTimeStr}`);

          // جدولة التنبيه - يعمل مرة واحدة اليوم فقط
          const cronTime = `${notificationMinute} ${notificationHour} * * *`;
          
          // إلغاء المهام السابقة إذا كانت موجودة
          if (this.prayerTasks[prayer.name]) {
            this.prayerTasks[prayer.name].stop();
          }

          // إنشاء مهمة جديدة
          this.prayerTasks[prayer.name] = cron.schedule(cronTime, () => {
            this.sendPrayerNotification(prayer.name, prayerTimeStr, prayer.emoji);
          });

          console.log(`   ⏰ التنبيه سيكون الساعة ${notificationHour.toString().padStart(2, '0')}:${notificationMinute.toString().padStart(2, '0')}`);
        }
      });

      console.log("✅ تم جدولة أوقات الصلاة بنجاح\n");
    } catch (error) {
      console.error("❌ خطأ في جدولة أوقات الصلاة:", error);
    }
  }

  async sendPrayerNotification(prayerName, prayerTime, emoji) {
    try {
      const message = `${emoji} حان وقت صلاة ${prayerName} - ${prayerTime}\nبارك الله فيكم`;
      
      // Broadcast via Socket.IO
      this.io.emit("prayerNotification", {
        type: "prayer_time",
        title: `صلاة ${prayerName}`,
        message,
        prayerName,
        prayerTime,
        emoji,
        timestamp: new Date(),
      });
      
      // Send via FCM to all users
      if (FCMService && FCMService.initialized) {
        try {
          const allDevices = await DeviceToken.find({}).lean();
          const tokenList = allDevices.map((d) => d.token).filter(Boolean);
          if (tokenList.length > 0) {
            const payload = {
              notification: {
                title: `${emoji} صلاة ${prayerName}`,
                body: `حان وقت صلاة ${prayerName} - ${prayerTime}`,
              },
              data: {
                type: "prayer_time",
                prayerName,
                prayerTime,
              },
            };
            await FCMService.sendToTokens(tokenList, payload);
            console.log(`🕌 Prayer notification sent via FCM to ${tokenList.length} devices`);
          }
        } catch (fcmErr) {
          console.error("❌ Error sending prayer FCM:", fcmErr);
        }
      }
      
      console.log(`🕰️ Prayer notification broadcasted: ${prayerName} at ${prayerTime}`);
    } catch (error) {
      console.error("❌ Error sending prayer notification:", error);
    }
  }

  async sendQuranReminderNotification() {
    try {
      // Broadcast via Socket.IO
      this.io.emit("quranReminder", {
        type: "quran_reminder",
        title: "تذكير بقراءة القرآن",
        message: "📖 لا تنسَ وردك اليومي من القرآن الكريم",
        emoji: "📖",
        timestamp: new Date(),
      });
      
      // Send via FCM to all users
      if (FCMService && FCMService.initialized) {
        try {
          const allDevices = await DeviceToken.find({}).lean();
          const tokenList = allDevices.map((d) => d.token).filter(Boolean);
          if (tokenList.length > 0) {
            const payload = {
              notification: {
                title: "📖 تذكير بقراءة القرآن",
                body: "لا تنسَ وردك اليومي من القرآن الكريم",
              },
              data: {
                type: "quran_reminder",
              },
            };
            await FCMService.sendToTokens(tokenList, payload);
            console.log(`📖 Quran reminder sent via FCM to ${tokenList.length} devices`);
          }
        } catch (fcmErr) {
          console.error("❌ Error sending Quran reminder FCM:", fcmErr);
        }
      }
      
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
