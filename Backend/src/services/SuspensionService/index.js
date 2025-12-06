// ============================================================================
// services/SuspensionService/index.js - Suspension Auto-Monitor Service
// ============================================================================
// 
// المسؤوليات:
// ✅ المراقبة التلقائية لانتهاء الفصل المؤقت (Cron Job كل دقيقة)
// ✅ إرسال إشعارات Socket.IO عند انتهاء الفصل
// ✅ استخدام helpers من WarningController لتجنب التكرار
//
// ❌ لا يتعامل مع: إنشاء/حذف الإنذارات (مسؤولية Controller)
// ❌ لا يتعامل مع: منطق الفصل/الإعادة الفوري (مسؤولية helpers)
// ============================================================================

const cron = require("node-cron");
const Warning = require("../../schema/Warning");
const dayjs = require("dayjs");

/**
 * خدمة المراقبة التلقائية للفصل المؤقت
 * تعمل في الخلفية باستخدام node-cron
 */
class SuspensionService {
  constructor() {
    this.cronJob = null;
    this.io = null;
  }

  /**
   * تعيين Socket.IO instance
   */
  setIO(io) {
    this.io = io;
    console.log("🔌 Socket.IO connected to Suspension Service");
  }

  /**
   * بدء خدمة المراقبة
   */
  start() {
    console.log("🚀 Starting Suspension Service...");

    // تشغيل كل دقيقة
    this.cronJob = cron.schedule("* * * * *", async () => {
      await this.checkExpiredSuspensions();
    });

    console.log("✅ Suspension Service started successfully");
    console.log("⏰ Checking for expired suspensions every minute");
  }

  /**
   * التحقق من الفصل المنتهي
   * استخدام الـ helper functions من الكونترولر لتجنب التكرار
   */
  async checkExpiredSuspensions() {
    try {
      const now = new Date();
      const { restoreStudentToGroup } = require("../../controllers/WarningController/helpers");

      // البحث عن جميع الفصول المؤقتة النشطة التي انتهت
      const expiredSuspensions = await Warning.find({
        isActive: true,
        suspensionType: "temporary",
        endDate: { $lte: now },
      }).populate("studentId", "firstName lastName group");

      if (expiredSuspensions.length > 0) {
        console.log(
          `⚠️ Found ${expiredSuspensions.length} expired suspension(s) - Auto-restoring...`
        );

        for (const suspension of expiredSuspensions) {
          try {
            // استخدام الـ helper function لإعادة الطالب
            const restored = await restoreStudentToGroup(suspension);

            if (restored) {
              // تعطيل الإنذار بعد الإعادة الناجحة
              suspension.isActive = false;
              await suspension.save();

              console.log(
                `✅ Suspension ended for student: ${suspension.studentId?.firstName} ${suspension.studentId?.lastName}`
              );

              // 🔔 إرسال إشعارات Socket.IO
              if (this.io) {
                const student = suspension.studentId;

                // إشعار عام بانتهاء الفصل
                this.io.emit('suspensionExpired', {
                  studentId: student._id,
                  studentName: `${student.firstName} ${student.lastName}`,
                  groupName: suspension.originalGroup,
                  warningId: suspension._id,
                  message: `تم إعادة الطالب ${student.firstName} ${student.lastName} إلى الحلقة ${suspension.originalGroup}`,
                  timestamp: new Date(),
                });

                // إشعار للطالب نفسه
                this.io.to(`user_${student._id}`).emit('suspensionRestored', {
                  message: 'تم إعادتك إلى حلقتك بعد انتهاء مدة الفصل',
                  groupName: suspension.originalGroup,
                  timestamp: new Date(),
                });

                // تحديث إحصائيات الإنذارات
                this.io.emit('warningStatisticsUpdated', {
                  timestamp: new Date(),
                });

                console.log(`📡 Socket.IO notifications sent for student ${student._id}`);
              }
            }
          } catch (innerError) {
            console.error(`❌ Error processing suspension ${suspension._id}:`, innerError);
          }
        }

        console.log(`✅ Processed ${expiredSuspensions.length} expired suspension(s)`);
      }
    } catch (error) {
      console.error("❌ Error checking expired suspensions:", error);
    }
  }

  /**
   * إيقاف الخدمة
   */
  stop() {
    if (this.cronJob) {
      this.cronJob.stop();
      console.log("🛑 Suspension Service stopped");
    }
  }

  /**
   * الحصول على إحصائيات الفصل
   */
  async getStatistics() {
    try {
      const now = new Date();

      const [
        totalActive,
        temporarySuspensions,
        permanentSuspensions,
        expiredCount,
      ] = await Promise.all([
        Warning.countDocuments({
          isActive: true,
          suspensionType: { $in: ["temporary", "permanent"] },
        }),
        Warning.countDocuments({
          isActive: true,
          suspensionType: "temporary",
        }),
        Warning.countDocuments({
          isActive: true,
          suspensionType: "permanent",
        }),
        Warning.countDocuments({
          isActive: true,
          suspensionType: "temporary",
          endDate: { $lte: now },
        }),
      ]);

      return {
        total: totalActive,
        temporary: temporarySuspensions,
        permanent: permanentSuspensions,
        pendingExpiration: expiredCount,
      };
    } catch (error) {
      console.error("Error getting suspension statistics:", error);
      return null;
    }
  }

  /**
   * إلغاء فصل طالب مبكراً (من قبل إداري)
   */
  async cancelSuspension(warningId, adminId) {
    try {
      const warning = await Warning.findById(warningId);

      if (!warning) {
        throw new Error("الإنذار غير موجود");
      }

      if (!warning.isActive) {
        throw new Error("الفصل غير نشط");
      }

      if (warning.suspensionType === "permanent") {
        throw new Error("لا يمكن إلغاء الفصل الدائم");
      }

      warning.isActive = false;
      warning.cancelledEarly = true;
      warning.cancelledAt = new Date();
      warning.cancelledBy = adminId;

      await warning.save();

      console.log(`✅ Suspension cancelled early for warning ID: ${warningId}`);

      return warning;
    } catch (error) {
      console.error("Error cancelling suspension:", error);
      throw error;
    }
  }
}

// تصدير instance واحد فقط (Singleton)
module.exports = new SuspensionService();
