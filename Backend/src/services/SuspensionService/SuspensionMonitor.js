// ============================================================================
// SuspensionMonitor.js - خدمة مراقبة انتهاء الفصل المؤقت
// ============================================================================

const cron = require('node-cron');
const dayjs = require('dayjs');
const duration = require('dayjs/plugin/duration');
const Warning = require('../../schema/Warning');
const Student = require('../../schema/Student');

dayjs.extend(duration);

class SuspensionMonitor {
  constructor(io) {
    this.io = io;
    this.cronJob = null;
  }

  /**
   * بدء مراقبة الفصل المؤقت
   * يتم فحص كل دقيقة للطلاب الذين انتهت مدة فصلهم
   */
  start() {
    console.log('🚀 Starting Suspension Monitor Service...');

    // تشغيل cron job كل دقيقة
    this.cronJob = cron.schedule('* * * * *', async () => {
      await this.checkExpiredSuspensions();
    });

    console.log('✅ Suspension Monitor Service Started - Running every minute');
  }

  /**
   * إيقاف مراقبة الفصل
   */
  stop() {
    if (this.cronJob) {
      this.cronJob.stop();
      console.log('⛔ Suspension Monitor Service Stopped');
    }
  }

  /**
   * فحص الطلاب الذين انتهت مدة فصلهم
   */
  async checkExpiredSuspensions() {
    try {
      const now = dayjs();

      // جلب الطلاب المفصولين مؤقتاً والذين انتهت مدة فصلهم
      const expiredSuspensions = await Warning.find({
        isActive: true,
        suspensionType: 'temporary',
        endDate: { $lte: now.toDate() },
      })
        .populate('studentId', 'firstName lastName username')
        .populate('groupId', 'name');

      if (expiredSuspensions.length === 0) {
        return;
      }

      console.log(`⏰ Found ${expiredSuspensions.length} expired suspensions to restore`);

      for (const warning of expiredSuspensions) {
        await this.restoreStudent(warning);
      }
    } catch (error) {
      console.error('❌ Error checking expired suspensions:', error);
    }
  }

  /**
   * إعادة الطالب إلى حلقته بعد انتهاء مدة الفصل
   */
  async restoreStudent(warning) {
    try {
      const student = warning.studentId;

      if (!student || !warning.originalGroup) {
        console.error('❌ Cannot restore student - missing data');
        return;
      }

      // إعادة الطالب إلى حلقته الأصلية
      await Student.findByIdAndUpdate(student._id, {
        group: warning.originalGroup,
      });

      // تحديث حالة الإنذار
      warning.isActive = false;
      warning.cancelledEarly = false;
      await warning.save();

      console.log(
        `✅ Student ${student.firstName} ${student.lastName} restored to group ${warning.originalGroup}`
      );

      // إرسال إشعار عبر Socket.IO
      this.io.emit('suspensionExpired', {
        studentId: student._id,
        studentName: `${student.firstName} ${student.lastName}`,
        groupName: warning.originalGroup,
        warningId: warning._id,
        message: `تم إعادة الطالب ${student.firstName} ${student.lastName} إلى الحلقة ${warning.originalGroup}`,
        timestamp: new Date(),
      });

      // إرسال إشعار للطالب نفسه
      this.io.to(`user_${student._id}`).emit('suspensionRestored', {
        message: 'تم إعادتك إلى حلقتك بعد انتهاء مدة الفصل',
        groupName: warning.originalGroup,
        timestamp: new Date(),
      });

      // تحديث إحصائيات الإنذارات
      this.io.emit('warningStatisticsUpdated', {
        timestamp: new Date(),
      });
    } catch (error) {
      console.error('❌ Error restoring student:', error);
    }
  }

  /**
   * حساب الوقت المتبقي للفصل
   */
  calculateTimeRemaining(endDate) {
    const now = dayjs();
    const end = dayjs(endDate);
    const diffMs = end.diff(now);

    if (diffMs <= 0) {
      return {
        expired: true,
        countdown: 'منتهي',
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        totalMilliseconds: 0,
      };
    }

    const dur = dayjs.duration(diffMs);
    const days = Math.floor(dur.asDays());
    const hours = dur.hours();
    const minutes = dur.minutes();
    const seconds = dur.seconds();

    let countdown;
    if (days > 0) {
      countdown = `${days}d ${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`;
    } else {
      countdown = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }

    return {
      expired: false,
      countdown,
      days,
      hours,
      minutes,
      seconds,
      totalMilliseconds: diffMs,
    };
  }

  /**
   * جلب جميع الطلاب المفصولين مؤقتاً مع العداد التنازلي
   */
  async getActiveSuspensionsWithCountdown() {
    try {
      const suspensions = await Warning.find({
        isActive: true,
        suspensionType: 'temporary',
      })
        .populate('studentId', 'firstName lastName username profileImage')
        .populate('teacherId', 'firstName lastName')
        .populate('groupId', 'name')
        .sort({ endDate: 1 });

      return suspensions.map((warning) => {
        const timeRemaining = this.calculateTimeRemaining(warning.endDate);
        return {
          _id: warning._id,
          student: warning.studentId,
          teacher: warning.teacherId,
          group: warning.groupId,
          originalGroup: warning.originalGroup,
          type: warning.type,
          suspensionType: warning.suspensionType,
          reason: warning.reason,
          startDate: warning.startDate,
          endDate: warning.endDate,
          ...timeRemaining,
          penalties: warning.penalties,
          createdAt: warning.createdAt,
        };
      });
    } catch (error) {
      console.error('❌ Error getting active suspensions:', error);
      return [];
    }
  }
}

module.exports = SuspensionMonitor;
