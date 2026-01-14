const cron = require("node-cron");
const moment = require("moment-timezone");
const adhan = require("adhan");
const FCMService = require("../Core/FCMService");
const DeviceToken = require("../../schema/DeviceToken");
const { TIMEZONE, COORDINATES } = require("../../config/timezone");

/**
 * Prayer Notifications Module
 * Handles all prayer-time related notifications and scheduling
 */

class PrayerJob {
  constructor(io) {
    this.io = io;
    this.timezone = TIMEZONE; // توقيت فلسطين (نابلس)
    this.coordinates = new adhan.Coordinates(COORDINATES.latitude, COORDINATES.longitude);
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
   * Schedule daily prayer times - Adhan only
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

          const prayerTimeStr = prayerMoment.format("HH:mm");
          console.log(`   ${prayer.emoji} ${prayer.name}: ${prayerTimeStr}`);
          
          // Schedule adhan at prayer time only
          const cronTimeAdhan = `${prayerMinute} ${prayerHour} * * *`;
          
          // Cancel previous task if exists
          if (this.prayerTasks[`${prayer.name}_adhan`]) {
            this.prayerTasks[`${prayer.name}_adhan`].stop();
          }

          // Create adhan task (at prayer time with sound)
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
   * Send adhan notification with sound
   * NO DATABASE STORAGE - Only live notification with Adhan sound
   */
  async sendAdhanNotification(prayerName, emoji) {
    try {
      const title = `${emoji} حان الآن موعد صلاة ${prayerName}`;
      const message = `حي على الصلاة، حي على الفلاح`;
      
      // Adhan sound URL from Cloudinary
      const adhanSoundUrl = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/video/upload/quranic-school/sounds/adhan.mp3`;

      // Send via Socket.IO ONLY - No database storage
      this.io.emit("prayerAdhan", {
        type: "adhan_alert",
        title,
        message,
        prayerName,
        emoji,
        soundUrl: adhanSoundUrl,
        timestamp: new Date(),
        // Important: Flag to NOT save in notification center
        ephemeral: true,
        playSound: true,
      });

      console.log(`🕌 Adhan notification sent for ${prayerName} with sound`);
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
