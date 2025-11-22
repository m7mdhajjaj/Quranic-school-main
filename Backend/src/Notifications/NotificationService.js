const Notification = require("../schema/Notification");
const Student = require("../schema/Student");
const Teacher = require("../schema/Teacher");
const cron = require("node-cron");
const moment = require("moment-timezone");
const FCMService = require("./config/FCMService");
const DeviceToken = require("../schema/DeviceToken");
const adhan = require("adhan");

/**
 * NotificationService - خدمة الإشعارات المركزية
 * 
 * ملاحظة هامة: إشعارات الصلاة لا تُحفظ في قاعدة البيانات
 * - يتم بثها فقط عبر Socket.IO و FCM للتنبيه الفوري
 * - لا تظهر في Notification Header للمستخدمين
 * - باقي الإشعارات (علامات، غياب، امتحانات، إلخ) تُحفظ عادياً
 */
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

      // إرسال للمستخدم المحدد عبر غرفة الـ userId
      this.io.to(recipientId).emit("newNotification", notificationPayload);
      console.log(`📤 Notification sent to room: ${recipientId} - ${notification.title}`);

      // أيضاً محاولة الإرسال عبر socketId إذا كان موجود في onlineUsers
      if (global.onlineUsers && global.onlineUsers.has(recipientId)) {
        const userData = global.onlineUsers.get(recipientId);
        this.io.to(userData.socketId).emit("newNotification", notificationPayload);
        console.log(`📱 Real-time notification sent to ${userData.firstName} (${notification.type}) via socketId`);
      } else {
        console.log(`📡 User ${recipientId} not in onlineUsers, notification sent to room only`);
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

  /**
   * إرسال تنبيه الصلاة (قبل 10 دقائق)
   * ملاحظة: لا يتم حفظ هذا الإشعار في قاعدة البيانات
   * يُرسل فقط عبر Socket.IO و FCM للتنبيه الفوري
   */
  async sendPrayerReminderNotification(prayerName, prayerTime, emoji) {
    try {
      const message = `${emoji} تنبيه: باقي 10 دقائق على صلاة ${prayerName} - ${prayerTime}\nاستعدوا للصلاة`;
      
      // Broadcast via Socket.IO only (no database notification)
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

  /**
   * إرسال إشعار الأذان (عند وقت الصلاة)
   * ملاحظة: لا يتم حفظ هذا الإشعار في قاعدة البيانات
   * يُرسل فقط عبر Socket.IO و FCM للتنبيه الفوري دون ظهوره في Notification Header
   */
  async sendPrayerAdhanNotification(prayerName, prayerTime, emoji) {
    try {
      const message = `${emoji} حان وقت صلاة ${prayerName} - ${prayerTime}\n🕌 الله أكبر الله أكبر\nبارك الله فيكم`;
      
      // Broadcast via Socket.IO only (no database notifications)
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
      
      // ⚠️ تم إلغاء حفظ إشعارات الصلاة في قاعدة البيانات
      // فقط يتم البث عبر Socket.IO و FCM للتنبيه الفوري
      // دون إضافة إشعار في Notification Header
      
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

  /**
   * إرسال تذكير القرآن اليومي (8 مساءً)
   * ملاحظة: لا يتم حفظ هذا الإشعار في قاعدة البيانات
   * يُرسل فقط عبر Socket.IO و FCM كتذكير فوري
   */
  async sendQuranReminderNotification() {
    try {
      // Broadcast via Socket.IO only (no database notification)
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

  async notifyAbsenceRemoved(studentId, date, teacherName) {
    try {
      const student = await Student.findById(studentId);
      if (!student) throw new Error("Student not found");
      
      const studentName = student.firstName && student.lastName 
        ? `${student.firstName} ${student.lastName}` 
        : student.name || 'الطالب';
      
      console.log(`✅ Sending absence removal notification to student: ${studentName} (ID: ${studentId})`);
      
      const notificationTitle = `✅ تم إزالة الغياب`;
      const notificationMessage = `تم إزالة غيابك بتاريخ ${date} بواسطة ${teacherName}. تم تسجيلك حاضراً.`;
      
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
                absenceType: "removed",
              },
            };
            await FCMService.sendToTokens(tokens, payload);
            console.log(`📱 Absence removal notification sent via FCM to ${tokens.length} devices`);
          }
        } catch (fcmErr) {
          console.error("❌ Error sending absence removal FCM:", fcmErr);
        }
      }
      
      return await this.createNotification({
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

// ============================================================================
// Helper functions for direct notification sending (without class instance)
// ============================================================================

/**
 * Send push notification to multiple devices using Firebase FCM
 * @param {Array<String>} userIds - Array of user IDs to send notification to
 * @param {String} title - Notification title
 * @param {String} message - Notification message body
 * @param {Object} data - Additional data payload
 * @returns {Promise<Object>} FCM response
 */
async function sendNotificationToDevices(userIds, title, message, data = {}) {
  try {
    if (!FCMService || !FCMService.initialized) {
      console.warn("⚠️ FCM Service not initialized. Skipping push notification.");
      return { success: false, message: "FCM not initialized" };
    }

    if (!Array.isArray(userIds) || userIds.length === 0) {
      console.warn("⚠️ No user IDs provided for notification");
      return { success: false, message: "No user IDs" };
    }

    // Get all device tokens for the provided user IDs
    const deviceTokens = await DeviceToken.find({
      user: { $in: userIds },
    })
      .lean()
      .select("token user");

    if (!deviceTokens || deviceTokens.length === 0) {
      console.warn(`⚠️ No device tokens found for ${userIds.length} users`);
      return { success: false, message: "No device tokens found" };
    }

    const tokens = deviceTokens.map((d) => d.token).filter(Boolean);

    if (tokens.length === 0) {
      console.warn("⚠️ No valid tokens found after filtering");
      return { success: false, message: "No valid tokens" };
    }

    // Prepare FCM payload
    const payload = {
      notification: {
        title: title,
        body: message,
      },
      data: {
        ...data,
        sentAt: new Date().toISOString(),
      },
    };

    // Send notification via FCM
    const response = await FCMService.sendToTokens(tokens, payload);

    if (response) {
      console.log(
        `✅ Push notification sent to ${tokens.length} devices for ${userIds.length} users`
      );
      console.log(`   📊 Success: ${response.successCount}, Failed: ${response.failureCount}`);

      return {
        success: true,
        successCount: response.successCount,
        failureCount: response.failureCount,
        totalTokens: tokens.length,
      };
    }

    return { success: false, message: "FCM sendToTokens returned null" };
  } catch (error) {
    console.error("❌ Error sending notification to devices:", error);
    throw error;
  }
}

/**
 * Send notification to a single user (creates DB notification + sends push)
 * @param {String} userId - User ID to send notification to
 * @param {String} userModel - User model ('Student' or 'Teacher')
 * @param {String} title - Notification title
 * @param {String} message - Notification message
 * @param {String} type - Notification type (e.g., 'news', 'grade', 'attendance')
 * @param {Object} data - Additional data payload
 * @returns {Promise<Object>} Created notification
 */
async function sendNotificationToUser(userId, userModel, title, message, type = "general", data = {}) {
  try {
    // Create notification in database
    const notification = new Notification({
      recipient: userId,
      recipientModel: userModel,
      title: title,
      message: message,
      type: type,
      data: data,
      isRead: false,
    });

    await notification.save();

    // Send push notification
    await sendNotificationToDevices([userId], title, message, {
      ...data,
      notificationId: notification._id.toString(),
      type: type,
    });

    // Send via Socket.IO if available
    if (global.io) {
      global.io.to(userId.toString()).emit("newNotification", {
        id: notification._id,
        type: type,
        title: title,
        message: message,
        data: data,
        createdAt: notification.createdAt,
        isNew: true,
      });
    }

    console.log(`✅ Notification sent to user ${userId}: ${title}`);
    return notification;
  } catch (error) {
    console.error("❌ Error sending notification to user:", error);
    throw error;
  }
}

// Export both the class and helper functions
module.exports = NotificationService;
module.exports.sendNotificationToDevices = sendNotificationToDevices;
module.exports.sendNotificationToUser = sendNotificationToUser;
