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

      const recipientIdStr = savedNotification.recipient.toString();

      // ✅ إرسال عبر Socket.IO دائماً (سواء Online أو Offline)
      try {
        await this.sendRealTimeNotification(savedNotification);
      } catch (err) {
        console.error("❌ Error sending real-time notification:", err);
      }

      // ✅ إرسال عبر FCM دائماً للإشعارات العاجلة، أو دائماً لضمان الوصول
      try {
        if (FCMService && FCMService.initialized) {
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

      // ✅ بث الإشعار للمستخدم مباشرة (Socket.IO سيتعامل مع التوصيل)
      const notificationPayload = {
        id: notification._id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        data: notification.data,
        priority: notification.priority,
        createdAt: notification.createdAt,
        sentAt: notification.sentAt || new Date(),
        isNew: true,
      };

      // إرسال للمستخدم المحدد (إذا كان متصل سيستقبله، إذا لا فسيتجاهله Socket.IO)
      this.io.to(recipientId).emit("newNotification", notificationPayload);

      // أيضاً محاولة الإرسال عبر socketId إذا كان موجود في onlineUsers
      if (global.onlineUsers && global.onlineUsers.has(recipientId)) {
        const userData = global.onlineUsers.get(recipientId);
        this.io.to(userData.socketId).emit("newNotification", notificationPayload);
        console.log(`📱 Real-time notification sent to ${userData.firstName} (${notification.type})`);
      } else {
        console.log(`📡 Notification broadcasted for user ${recipientId} (will receive if connected)`);
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
      const now = moment().tz(this.timezone);
      const prayerTimes = new adhan.PrayerTimes(this.coordinates, today, this.calculationParams);

      const prayers = [
        { name: "الفجر", time: prayerTimes.fajr, emoji: "🌅" },
        { name: "الظهر", time: prayerTimes.dhuhr, emoji: "☀️" },
        { name: "العصر", time: prayerTimes.asr, emoji: "🌤️" },
        { name: "المغرب", time: prayerTimes.maghrib, emoji: "🌇" },
        { name: "العشاء", time: prayerTimes.isha, emoji: "🌙" },
      ];

      console.log(`\n🕌 أوقات الصلاة لتاريخ ${today.toLocaleDateString('ar-EG')}:`);
      console.log(`⏰ الوقت الحالي: ${now.format('HH:mm:ss')}`);
      
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

          // جدولة التنبيه قبل 10 دقائق من الصلاة
          const cronTimeBefore = `${notificationMinute} ${notificationHour} * * *`;
          
          // جدولة التنبيه عند وقت الأذان
          const cronTimeAdhan = `${prayerMinute} ${prayerHour} * * *`;
          
          // إلغاء المهام السابقة إذا كانت موجودة
          if (this.prayerTasks[`${prayer.name}_before`]) {
            this.prayerTasks[`${prayer.name}_before`].stop();
          }
          if (this.prayerTasks[`${prayer.name}_adhan`]) {
            this.prayerTasks[`${prayer.name}_adhan`].stop();
          }

          // إنشاء مهمة التنبيه قبل 10 دقائق
          this.prayerTasks[`${prayer.name}_before`] = cron.schedule(cronTimeBefore, () => {
            this.sendPrayerReminderNotification(prayer.name, prayerTimeStr, prayer.emoji);
          });

          // إنشاء مهمة التنبيه عند الأذان
          this.prayerTasks[`${prayer.name}_adhan`] = cron.schedule(cronTimeAdhan, () => {
            this.sendPrayerAdhanNotification(prayer.name, prayerTimeStr, prayer.emoji);
          });

          console.log(`   ⏰ التنبيه قبل 10 دقائق: ${notificationHour.toString().padStart(2, '0')}:${notificationMinute.toString().padStart(2, '0')}`);
          console.log(`   🔔 الأذان: ${prayerTimeStr}`);
          
          // فحص فوري: إذا كان وقت الصلاة الآن أو قريب جداً (خلال دقيقة)
          const prayerMomentTime = prayerMoment.valueOf();
          const nowTime = now.valueOf();
          const timeDiff = prayerMomentTime - nowTime;
          const minutesDiff = Math.floor(timeDiff / 60000);
          
          // إذا كان وقت الصلاة خلال دقيقة واحدة أو مضى عليه أقل من دقيقتين
          if (minutesDiff >= -2 && minutesDiff <= 1) {
            console.log(`   🔥 إرسال فوري! الصلاة ${minutesDiff < 0 ? 'بدأت منذ' : 'خلال'} ${Math.abs(minutesDiff)} دقيقة`);
            setTimeout(() => {
              this.sendPrayerAdhanNotification(prayer.name, prayerTimeStr, prayer.emoji);
            }, 2000); // تأخير بسيط للتأكد من اتصال السوكت
          }
          // إذا كان وقت التنبيه (قبل 10 دقائق) خلال دقيقة واحدة
          else if (minutesDiff >= 9 && minutesDiff <= 11) {
            console.log(`   ⚡ إرسال تنبيه فوري! باقي ${minutesDiff} دقيقة على الصلاة`);
            setTimeout(() => {
              this.sendPrayerReminderNotification(prayer.name, prayerTimeStr, prayer.emoji);
            }, 2000);
          }
        }
      });

      console.log("✅ تم جدولة أوقات الصلاة بنجاح\n");
    } catch (error) {
      console.error("❌ خطأ في جدولة أوقات الصلاة:", error);
    }
  }

  async sendPrayerReminderNotification(prayerName, prayerTime, emoji) {
    try {
      const message = `${emoji} تنبيه: باقي 10 دقائق على صلاة ${prayerName} - ${prayerTime}\nاستعدوا للصلاة`;
      
      // Broadcast via Socket.IO
      this.io.emit("prayerReminder", {
        type: "prayer_reminder",
        title: `تنبيه صلاة ${prayerName}`,
        message,
        prayerName,
        prayerTime,
        emoji,
        minutesRemaining: 10,
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
                title: `${emoji} تنبيه صلاة ${prayerName}`,
                body: `باقي 10 دقائق على صلاة ${prayerName} - ${prayerTime}`,
              },
              data: {
                type: "prayer_reminder",
                prayerName,
                prayerTime,
                minutesRemaining: "10",
              },
            };
            await FCMService.sendToTokens(tokenList, payload);
            console.log(`⏰ Prayer reminder sent via FCM to ${tokenList.length} devices`);
          }
        } catch (fcmErr) {
          console.error("❌ Error sending prayer reminder FCM:", fcmErr);
        }
      }
      
      console.log(`⏰ Prayer reminder broadcasted: ${prayerName} in 10 minutes - ${prayerTime}`);
    } catch (error) {
      console.error("❌ Error sending prayer reminder:", error);
    }
  }

  async sendPrayerAdhanNotification(prayerName, prayerTime, emoji) {
    try {
      const message = `${emoji} حان وقت صلاة ${prayerName} - ${prayerTime}\n🕌 الله أكبر الله أكبر\nبارك الله فيكم`;
      
      // Broadcast via Socket.IO
      this.io.emit("prayerAdhan", {
        type: "prayer_adhan",
        title: `أذان ${prayerName}`,
        message,
        prayerName,
        prayerTime,
        emoji,
        isAdhan: true,
        timestamp: new Date(),
      });
      
      // إرسال إشعار لجميع المستخدمين في قاعدة البيانات
      try {
        const [students, teachers] = await Promise.all([
          Student.find({}).select('_id').lean(),
          Teacher.find({}).select('_id').lean()
        ]);

        const notificationPromises = [];
        
        // إشعار للطلاب
        students.forEach((student) => {
          notificationPromises.push(
            Notification.create({
              recipient: student._id,
              recipientModel: 'Student',
              type: 'prayer_time',
              title: `أذان ${prayerName}`,
              message: `${emoji} حان وقت صلاة ${prayerName} - ${prayerTime}`,
              data: { prayerName, prayerTime, isAdhan: true },
            })
          );
        });

        // إشعار للمعلمين
        teachers.forEach((teacher) => {
          notificationPromises.push(
            Notification.create({
              recipient: teacher._id,
              recipientModel: 'Teacher',
              type: 'prayer_time',
              title: `أذان ${prayerName}`,
              message: `${emoji} حان وقت صلاة ${prayerName} - ${prayerTime}`,
              data: { prayerName, prayerTime, isAdhan: true },
            })
          );
        });

        await Promise.all(notificationPromises);
        console.log(`📬 Prayer notifications saved to database for ${students.length + teachers.length} users`);
      } catch (dbErr) {
        console.error("❌ Error saving prayer notifications to database:", dbErr);
      }
      
      // Send via FCM to all users
      if (FCMService && FCMService.initialized) {
        try {
          const allDevices = await DeviceToken.find({}).lean();
          const tokenList = allDevices.map((d) => d.token).filter(Boolean);
          if (tokenList.length > 0) {
            const payload = {
              notification: {
                title: `${emoji} أذان ${prayerName}`,
                body: `حان وقت صلاة ${prayerName} - ${prayerTime}`,
              },
              data: {
                type: "prayer_adhan",
                prayerName,
                prayerTime,
                isAdhan: "true",
              },
            };
            await FCMService.sendToTokens(tokenList, payload);
            console.log(`🔔 Prayer adhan sent via FCM to ${tokenList.length} devices`);
          }
        } catch (fcmErr) {
          console.error("❌ Error sending prayer adhan FCM:", fcmErr);
        }
      }
      
      console.log(`🔔 Prayer adhan broadcasted: ${prayerName} at ${prayerTime}`);
    } catch (error) {
      console.error("❌ Error sending prayer adhan notification:", error);
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

  async notifyNewGrade(studentId, subject, grade, teacherName, isUpdate = false, oldGrade = null) {
    try {
      // العلامات من 0 إلى 20 (مراجعة 10 + حفظ 10)
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
        // رسالة التحديث مع العلامة القديمة والجديدة
        const changeEmoji = grade > oldGrade ? "📈" : grade < oldGrade ? "📉" : "🔄";
        message = `${changeEmoji} تم تحديث علامتك في ${subject} من ${oldGrade}/20 إلى ${grade}/20 بواسطة الأستاذ ${teacherName}${gradeComment}`;
      } else {
        // رسالة علامة جديدة
        message = `حصّلت على ${grade}/20 في ${subject} من الأستاذ ${teacherName}${gradeComment}`;
      }

      // إرسال عبر FCM
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

      return await this.createNotification({
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
      
      const studentName = student.firstName && student.lastName 
        ? `${student.firstName} ${student.lastName}` 
        : student.name || 'الطالب';
      
      console.log(`📢 Sending absence notification to student: ${studentName} (ID: ${studentId})`);
      
      const notificationTitle = `⚠️ تنبيه غياب`;
      const notificationMessage = `تم تسجيل غيابك بتاريخ ${date} بواسطة ${teacherName}. يرجى المتابعة مع معلمك.`;
      
      // إرسال عبر FCM
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
                title: notificationTitle,
                body: notificationMessage,
              },
              data: {
                type: "attendance",
                date,
                teacherName,
                absenceType: "absent",
              },
            };
            await FCMService.sendToTokens(tokens, payload);
            console.log(`📱 Absence notification sent via FCM to ${tokens.length} devices`);
          }
        } catch (fcmErr) {
          console.error("❌ Error sending absence FCM:", fcmErr);
        }
      }
      
      return await this.createNotification({
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
