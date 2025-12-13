// ============================================================================
// services/AttendanceService/index.js - Attendance Daily Reset Service
// ============================================================================
// 
// المسؤوليات:
// ✅ إرسال event عند منتصف الليل (00:00:00) لتحديث قائمة الطلاب الغائبين
// ✅ استخدام timezone محدد (Asia/Riyadh) لضمان التوقيت الصحيح
//
// ============================================================================

const cron = require("node-cron");
const { getAbsentStudentsToday } = require("../../controllers/AttendanceController/getController");

/**
 * خدمة تحديث قائمة الطلاب الغائبين عند بداية يوم جديد
 */
class AttendanceService {
  constructor() {
    this.cronJob = null;
    this.io = null;
  }

  /**
   * ربط Socket.IO بالخدمة
   */
  setIO(io) {
    this.io = io;
  }

  /**
   * بدء خدمة التحديث اليومي
   */
  start() {
    if (!this.io) {
      console.error("❌ [AttendanceService] Socket.IO غير متاح");
      return;
    }

    console.log("🚀 [AttendanceService] Starting daily attendance reset service...");

    // تشغيل cron job عند منتصف الليل كل يوم (00:00:00)
    // Format: minute hour day month day-of-week
    // "0 0 * * *" = كل يوم في الساعة 00:00
    this.midnightJob = cron.schedule(
      "0 0 * * *",
      async () => {
        console.log("🔄 [AttendanceService] بداية يوم جديد - جلب وإرسال بيانات الطلاب الغائبين...");
        
        if (this.io) {
          try {
            // جلب البيانات من Backend مباشرة
            const req = { params: {}, query: {} };
            const res = {
              json: (data) => {
                // إرسال البيانات مباشرة في Socket event
                this.io.to("admin-room").emit("absentStudentsUpdated", {
                  date: new Date(),
                  timestamp: Date.now(),
                  message: "بداية يوم جديد - تم تحديث قائمة الطلاب الغائبين",
                  reason: "midnight_reset",
                  data: data.data || [], // إرسال البيانات مباشرة
                  count: data.count || 0,
                });
                console.log(`📡 [AttendanceService] تم إرسال ${data.count || 0} طالب غائب مباشرة في Socket event`);
              },
              status: () => res,
            };
            
            await getAbsentStudentsToday(req, res);
          } catch (error) {
            console.error("❌ [AttendanceService] خطأ في جلب البيانات:", error);
            // إرسال event بدون بيانات (Frontend سيجلبها)
            this.io.to("admin-room").emit("absentStudentsUpdated", {
              date: new Date(),
              timestamp: Date.now(),
              message: "بداية يوم جديد - حدث خطأ في جلب البيانات",
              reason: "midnight_reset",
            });
          }
        }
      },
      {
        timezone: "Asia/Riyadh", // توقيت السعودية
      }
    );

    // تشغيل cron job كل ساعة كـ backup (في حالة انقطاع Socket أو مشاكل أخرى)
    // "0 * * * *" = كل ساعة في الدقيقة 0
    this.hourlyJob = cron.schedule(
      "0 * * * *",
      async () => {
        console.log("⏰ [AttendanceService] تحديث دوري كل ساعة - جلب وإرسال بيانات...");
        
        if (this.io) {
          try {
            // جلب البيانات من Backend مباشرة
            const req = { params: {}, query: {} };
            const res = {
              json: (data) => {
                // إرسال البيانات مباشرة في Socket event
                this.io.to("admin-room").emit("absentStudentsUpdated", {
                  date: new Date(),
                  timestamp: Date.now(),
                  message: "تحديث دوري كل ساعة",
                  reason: "hourly_backup",
                  data: data.data || [], // إرسال البيانات مباشرة
                  count: data.count || 0,
                });
                console.log(`📡 [AttendanceService] تم إرسال ${data.count || 0} طالب غائب (hourly backup)`);
              },
              status: () => res,
            };
            
            await getAbsentStudentsToday(req, res);
          } catch (error) {
            console.error("❌ [AttendanceService] خطأ في جلب البيانات:", error);
            // إرسال event بدون بيانات (Frontend سيجلبها)
            this.io.to("admin-room").emit("absentStudentsUpdated", {
              date: new Date(),
              timestamp: Date.now(),
              message: "تحديث دوري كل ساعة - حدث خطأ في جلب البيانات",
              reason: "hourly_backup",
            });
          }
        }
      },
      {
        timezone: "Asia/Riyadh", // توقيت السعودية
      }
    );

    console.log("✅ [AttendanceService] Daily attendance reset service started");
    console.log("⏰ [AttendanceService] سيتم إرسال event كل يوم في 00:00:00 (توقيت السعودية)");
    console.log("⏰ [AttendanceService] سيتم إرسال event كل ساعة كـ backup");
  }

  /**
   * إيقاف الخدمة
   */
  stop() {
    if (this.midnightJob) {
      this.midnightJob.stop();
    }
    if (this.hourlyJob) {
      this.hourlyJob.stop();
    }
    console.log("🛑 [AttendanceService] Daily attendance reset service stopped");
  }
}

// Export singleton instance
const attendanceService = new AttendanceService();

module.exports = attendanceService;
