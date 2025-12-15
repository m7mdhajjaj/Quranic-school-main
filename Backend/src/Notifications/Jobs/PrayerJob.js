const cron = require("node-cron");
const moment = require("moment-timezone");
const adhan = require("adhan");
const FCMService = require("../Core/FCMService");
const DeviceToken = require("../../schema/DeviceToken");

/**
 * Prayer Notifications Module
 * Handles all prayer-time related notifications and scheduling
 */

class PrayerJob {
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
            this.sendAdhanNotification(prayer.name, prayer.emoji);
          });
        }
      });
    } catch (error) {
      console.error("❌ Error scheduling prayer times:", error);
    }
  }

  /**
   * Send prayer reminder (10 mins before)
   */
  async sendPrayerReminderNotification(prayerName, prayerTime, emoji) {
    try {
      const title = `${emoji} اقتربت صلاة ${prayerName}`;
      const message = `باقي 10 دقائق على موعد صلاة ${prayerName} (${prayerTime})`;

      // Send via Socket.IO
      this.io.emit("prayerNotification", {
        type: "prayer_reminder",
        title,
        message,
        prayerName,
        prayerTime,
        timestamp: new Date(),
      });

      // Send via FCM
      if (FCMService && FCMService.initialized) {
        const payload = {
          notification: { title, body: message },
          data: { type: "prayer_reminder", prayerName, prayerTime },
        };
        // Send to 'all' topic or all tokens (simplified here to topic if supported, or we skip for now to avoid mass DB query)
        // For now, we'll skip mass FCM for prayers to avoid quota issues unless implemented with topics
        // await FCMService.sendToTopic('prayers', payload); 
      }
      
      console.log(`🕌 Prayer reminder sent for ${prayerName}`);
    } catch (error) {
      console.error("❌ Error sending prayer reminder:", error);
    }
  }

  /**
   * Send adhan notification
   */
  async sendAdhanNotification(prayerName, emoji) {
    try {
      const title = `${emoji} حان الآن موعد صلاة ${prayerName}`;
      const message = `حي على الصلاة، حي على الفلاح`;

      // Send via Socket.IO
      this.io.emit("prayerNotification", {
        type: "prayer_adhan",
        title,
        message,
        prayerName,
        timestamp: new Date(),
      });

      console.log(`🕌 Adhan notification sent for ${prayerName}`);
    } catch (error) {
      console.error("❌ Error sending adhan notification:", error);
    }
  }

  /**
   * Send daily Quran reminder
   */
  async sendQuranReminderNotification() {
    try {
      const title = "📖 ورد القرآن اليومي";
      const message = "لا تنس قراءة وردك اليومي من القرآن الكريم";

      // Send via Socket.IO
      this.io.emit("quranReminder", {
        type: "quran_reminder",
        title,
        message,
        timestamp: new Date(),
      });

      // Send via FCM (using topic if available)
      if (FCMService && FCMService.initialized) {
        // await FCMService.sendToTopic('quran_reminders', ...);
      }

      console.log("📖 Quran reminder sent");
    } catch (error) {
      console.error("❌ Error sending Quran reminder:", error);
    }
  }
}

module.exports = PrayerJob;
