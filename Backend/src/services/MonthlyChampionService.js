// services/MonthlyChampionService.js
const cron = require("node-cron");
const axios = require("axios");

class MonthlyChampionService {
  constructor() {
    this.cronJob = null;
  }

  // تشغيل Cron Job
  start() {
    // يعمل في الساعة 00:01 من أول يوم في كل شهر
    // Format: minute hour day month day-of-week
    this.cronJob = cron.schedule(
      "1 0 1 * *",
      async () => {
        console.log("🏆 بدء تتويج أبطال الشهر...");
        try {
          await this.crownChampions();
          console.log("✅ تم تتويج الأبطال بنجاح!");
        } catch (error) {
          console.error("❌ خطأ في تتويج الأبطال:", error);
        }
      },
      {
        timezone: "Asia/Riyadh", // توقيت السعودية
      }
    );

    console.log(
      "📅 Cron Job لتتويج أبطال الشهر تم تفعيله (يعمل في 00:01 من أول يوم كل شهر)"
    );
  }

  // إيقاف Cron Job
  stop() {
    if (this.cronJob) {
      this.cronJob.stop();
      console.log("⏸️  تم إيقاف Cron Job");
    }
  }

  // استدعاء API لتتويج الأبطال
  async crownChampions() {
    try {
      // الحصول على توكن الأدمن (يجب إضافته في .env)
      const adminToken = process.env.ADMIN_TOKEN;

      if (!adminToken) {
        console.error("⚠️  ADMIN_TOKEN غير موجود في ملف .env");
        return;
      }

      const response = await axios.post(
        `http://localhost:${
          process.env.PORT || 5005
        }/api/points-game/crown-champions`,
        {},
        {
          headers: {
            Authorization: `Bearer ${adminToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("✅ استجابة API:", response.data.message);
      return response.data;
    } catch (error) {
      console.error("❌ خطأ في استدعاء API:", error.message);
      throw error;
    }
  }

  // تشغيل تتويج الأبطال يدوياً (للاختبار)
  async testCrownChampions() {
    console.log("🧪 اختبار تتويج الأبطال...");
    try {
      await this.crownChampions();
      console.log("✅ الاختبار نجح!");
    } catch (error) {
      console.error("❌ الاختبار فشل:", error);
    }
  }
}

module.exports = new MonthlyChampionService();
