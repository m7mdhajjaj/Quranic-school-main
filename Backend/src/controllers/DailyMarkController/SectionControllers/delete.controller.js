// ============================================================================
// Delete Section Controller
// ============================================================================
const Section = require("../../../schema/DailyMark/Section");
const DailyMark = require("../../../schema/DailyMark/DailyMark");
const { notifySectionDeleted } = require("../../../Notifications");
const aiSchedulerService = require("../../../services/DailyMark/AiSchedulerService");
const {
  sendSuccess,
  sendError,
  sendNotFound,
} = require("../utils/responseHelpers");

/**
 * Delete a section
 */
exports.deleteSection = async (req, res) => {
  try {
    const section = await Section.findById(req.params.id);
    if (!section) {
      return sendNotFound(res, "المقطع");
    }

    // استخراج معلومات السور المتأثرة قبل الحذف
    // نحتاج لمعرفة السور التي كانت في الحفظ لإجراء الإصلاح عليها
    const affectedSurahs = new Set();
    if (section.memorizationMeta && section.memorizationMeta.length > 0) {
        section.memorizationMeta.forEach(m => affectedSurahs.add(m.surahNumber));
    }
    // ✅ ونضيف سور المراجعة أيضاً لضمان فحص السورة بالكامل (مثل التأكد من عدم وجود مراجعات يتيمة أخرى)
    if (section.reviewMeta && section.reviewMeta.length > 0) {
        section.reviewMeta.forEach(r => affectedSurahs.add(r.surahNumber));
    }

    // إرسال إشعارات في الخلفية
    const io = req.app.get("io");
    if (io && section.group) {
      notifySectionDeleted(section, io).catch(err => 
        console.error("⚠️ Error sending delete notification:", err)
      );
    }

    // تنفيذ عمليات الحذف
    await Promise.all([
      DailyMark.deleteMany({ sectionId: req.params.id }),
      Section.findByIdAndDelete(req.params.id)
    ]);

    // 🤖 AI Scheduler Check (Dry Run)
    // فحص الفجوات دون إصلاحها تلقائياً (User requested manual trigger)
    let detectedRepairs = [];
    if (affectedSurahs.size > 0 && section.group) {
        for (const surahNum of affectedSurahs) {
            try {
                // Pass true for dryRun: Check ONLY
                const checkResult = await aiSchedulerService.repairSequence(section.group, surahNum, true);
                
                if (checkResult && checkResult.needsRepair) {
                   console.log(`⚠️ AI detected gap for Surah ${surahNum}`);
                   detectedRepairs.push({
                       surahNumber: surahNum,
                       details: checkResult.detectedRepairs
                   });
                }
            } catch (repairError) {
                console.error(`⚠️ AI Check failed for Surah ${surahNum}:`, repairError);
            }
        }
    }

    sendSuccess(res, { 
        deletedId: req.params.id,
        repairNeeded: detectedRepairs.length > 0,
        detectedRepairs
    }, "تم حذف المقطع بنجاح.");
  } catch (error) {
    sendError(res, error.message, 500, error);
  }
};
