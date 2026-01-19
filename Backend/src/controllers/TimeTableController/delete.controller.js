// ============================================
// DELETE TIMETABLE CONTROLLER (NEW)
// ============================================
// حذف المواعيد وفك الربط
// ✅ تم إضافة: Redis Cache Invalidation

const TimeTable = require("../../schema/TimeTable");
const Section = require("../../schema/DailyMark/Section");
const { notifyTimetableDeleted } = require("../../Notifications");
const { invalidateTeacherCache } = require("./helpers/scheduleConflict.helper");
const { createLogger } = require("../../utils/logger");

const logger = createLogger('TimetableDelete');

/**
 * حذف موعد
 * @route DELETE /api/timetable/:id
 */
exports.deleteTimetable = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;

    // ✅ 1. جلب الموعد
    const timetable = await TimeTable.findById(id);
    if (!timetable) {
      return res.status(404).json({
        success: false,
        message: "الموعد غير موجود"
      });
    }

    // حفظ البيانات للـ Cache Invalidation
    const teacherId = timetable.teacherId;
    const sessionDate = timetable.sessionDate;

    // ✅ 2. التحقق من الصلاحيات
    if (user?.role === 'teacher') {
      if (timetable.teacherId?.toString() !== user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: "يمكنك حذف مواعيدك فقط"
        });
      }
    }

    // ✅ 3. فك الربط مع Section إذا موجود
    if (timetable.sectionId) {
      await Section.findByIdAndUpdate(timetable.sectionId, {
        timetableId: null,
        hasSchedule: false,
        scheduleStatus: "needs_schedule",
        scheduleInfo: null
      });
      logger.debug(`🔓 تم فك ربط Section ${timetable.sectionId}`);
    }

    // ✅ 4. إرسال إشعارات للطلاب قبل الحذف (في الخلفية)
    const io = req.app.get("io");
    notifyTimetableDeleted(timetable, io).catch(err => 
      logger.error("⚠️ Error sending timetable delete notification:", err)
    );

    // ✅ 5. حذف الموعد
    await TimeTable.findByIdAndDelete(id);
    
    // ✅ 6. إبطال الـ Cache للمعلم في هذا التاريخ
    if (teacherId && sessionDate) {
      await invalidateTeacherCache(teacherId, sessionDate);
      logger.debug(`🗑️ Cache invalidated for teacher ${teacherId} on ${sessionDate.toISOString().split('T')[0]}`);
    }

    logger.info(`🗑️ Timetable deleted: ${id} for group "${timetable.note}"`);

    res.json({
      success: true,
      message: "تم حذف الموعد بنجاح",
      deletedId: id
    });

  } catch (error) {
    logger.error("❌ Error deleting timetable:", error);
    res.status(500).json({
      success: false,
      message: error.message || "حدث خطأ"
    });
  }
};

/**
 * فك ربط موعد من مقطع (بدون حذف الموعد)
 * @route DELETE /api/timetable/:id/unlink
 */
exports.unlinkTimetableFromSection = async (req, res) => {
  try {
    const { id } = req.params;

    // ✅ 1. جلب الموعد
    const timetable = await TimeTable.findById(id);
    if (!timetable) {
      return res.status(404).json({
        success: false,
        message: "الموعد غير موجود"
      });
    }

    // ✅ 2. التحقق من وجود ربط
    if (!timetable.sectionId) {
      return res.status(400).json({
        success: false,
        message: "هذا الموعد غير مرتبط بأي مقطع"
      });
    }

    const sectionId = timetable.sectionId;

    // ✅ 3. فك الربط من كلا الجانبين
    await Promise.all([
      // تحديث TimeTable
      TimeTable.findByIdAndUpdate(id, {
        sectionId: null,
        sessionDate: null,
        isRecurring: true,
        sectionInfo: null
      }),
      // تحديث Section
      Section.findByIdAndUpdate(sectionId, {
        timetableId: null,
        hasSchedule: false,
        scheduleStatus: "needs_schedule",
        scheduleInfo: null
      })
    ]);

    res.json({
      success: true,
      message: "تم فك الربط بنجاح",
      data: {
        timetableId: id,
        sectionId: sectionId
      }
    });

  } catch (error) {
    logger.error("Error unlinking timetable:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ"
    });
  }
};
