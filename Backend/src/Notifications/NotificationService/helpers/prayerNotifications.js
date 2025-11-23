const cron = require("node-cron");
const moment = require("moment-timezone");
const adhan = require("adhan");
const FCMService = require("../../config/FCMService");
const DeviceToken = require("../../../schema/DeviceToken");

/**
 * Prayer Notifications Module
 * Handles all prayer-time related notifications and scheduling
 */

class PrayerNotifications {
  constructor(io) {
    this.io = io;
    this.timezone = "Asia/Jerusalem";
    this.coordinates = new adhan.Coordinates(31.9522, 35.2332);
    this.calculationParams = adhan.CalculationMethod.MuslimWorldLeague();
    this.calculationParams.madhab = adhan.Madhab.Shafi;
    this.prayerTasks = {};
  }

  /**
   * Setup prayer notifications system
   */
  setupPrayerNotifications() {
    // Schedule daily prayer time calculation (every day at midnight)
    cron.schedule("0 0 * * *", () => {
      console.log("🕌 Updating daily prayer times...");
      this.scheduleDailyPrayerTimes();
    });

    // Run immediately on server start
    this.scheduleDailyPrayerTimes();

    // Daily Quran reminder at 8 PM
    cron.schedule("0 20 * * *", () => {
      this.sendQuranReminderNotification();
    });

    console.log("🛎️ Dynamic prayer notifications system activated");
  }

  /**
   * Schedule daily prayer times
   */
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
          
          // Calculate notification time (10 minutes before prayer)
          let notificationMinute = prayerMinute - 10;
          let notificationHour = prayerHour;

          if (notificationMinute < 0) {
            notificationMinute = 60 + notificationMinute;
            notificationHour -= 1;
          }
          if (notificationHour < 0) notificationHour = 23;

          const prayerTimeStr = prayerMoment.format("HH:mm");
          console.log(`   ${prayer.emoji} ${prayer.name}: ${prayerTimeStr}`);

          // Schedule reminder 10 minutes before prayer
          const cronTimeBefore = `${notificationMinute} ${notificationHour} * * *`;
          
          // Schedule adhan at prayer time
          const cronTimeAdhan = `${prayerMinute} ${prayerHour} * * *`;
          
          // Cancel previous tasks if they exist
          if (this.prayerTasks[`${prayer.name}_before`]) {
            this.prayerTasks[`${prayer.name}_before`].stop();
          }
          if (this.prayerTasks[`${prayer.name}_adhan`]) {
            this.prayerTasks[`${prayer.name}_adhan`].stop();
          }

          // Create reminder task (10 minutes before)
          this.prayerTasks[`${prayer.name}_before`] = cron.schedule(cronTimeBefore, () => {
            this.sendPrayerReminderNotification(prayer.name, prayerTimeStr, prayer.emoji);
          });

          // Create adhan task (at prayer time)
          this.prayerTasks[`${prayer.name}_adhan`] = cron.schedule(cronTimeAdhan, () => {
            this.sendPrayerAdhanNotification(prayer.name, prayerTimeStr, prayer.emoji);
          });

          console.log(`   ⏰ التنبيه قبل 10 دقائق: ${notificationHour.toString().padStart(2, '0')}:${notificationMinute.toString().padStart(2, '0')}`);
          console.log(`   🔔 الأذان: ${prayerTimeStr}`);
          
          // Immediate check: if prayer time is now or very soon (within a minute)
          const prayerMomentTime = prayerMoment.valueOf();
          const nowTime = now.valueOf();
          const timeDiff = prayerMomentTime - nowTime;
          const minutesDiff = Math.floor(timeDiff / 60000);
          
          // If prayer time is within 1 minute or passed less than 2 minutes ago
          if (minutesDiff >= -2 && minutesDiff <= 1) {
            console.log(`   🔥 إرسال فوري! الصلاة ${minutesDiff < 0 ? 'بدأت منذ' : 'خلال'} ${Math.abs(minutesDiff)} دقيقة`);
            setTimeout(() => {
              this.sendPrayerAdhanNotification(prayer.name, prayerTimeStr, prayer.emoji);
            }, 2000);
          }
          // If reminder time (10 minutes before) is within 1 minute
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
   * Send prayer reminder (10 minutes before)
   * Note: Not saved to database, only broadcast via Socket.IO and FCM
   */
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

  /**
   * Send prayer adhan notification (at prayer time)
   * Note: Not saved to database, only broadcast via Socket.IO and FCM
   */
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

  /**
   * Send daily Quran reminder (8 PM)
   * Note: Not saved to database, only broadcast via Socket.IO and FCM
   */
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
}

module.exports = PrayerNotifications;
