const AiScheduler = require("../../../services/DailyMark/AiSchedulerService");
const { sendSuccess, sendError } = require("../utils/responseHelpers");

/**
 * Repair Sequence Controller
 * تفعيل خدمة "المصلح الذكي" لإصلاح فجوات الحفظ والمراجعات اليتيمة
 */
exports.repairSequence = async (req, res) => {
  try {
    const { groupId, surahNumber } = req.body;

    // Validate inputs
    if (!groupId) {
      return sendError(res, "بيانات ناقصة: يجب تحديد معرّف الحلقة.", 400);
    }

    console.log(`🤖 AI Scheduler: Starting repair for Group ${groupId}, Surah: ${surahNumber || 'ALL'}...`);

    // Call the AI Service
    // Pass everything in req.body.options to the service
    const options = req.body.options || {};
    const result = await AiScheduler.repairSequence(groupId, surahNumber, false, options);

    // Handle "No repairs needed" case
    if (result.repaired === false) {
       console.log(`ℹ️ AI Scheduler: ${result.message}`);
       return sendSuccess(res, { status: "no_action", ...result }, result.message);
    }

    // Handle "Repairs executed" case
    if (result.stats) {
        console.log(`✅ AI Scheduler: Fixed ${result.stats.gapsFixed} gaps and ${result.stats.orphansFixed} orphans.`);
    }
    
    return sendSuccess(res, result, result.message);

  } catch (error) {
    console.error("❌ AI Scheduler Error:", error);
    sendError(res, "حدث خطأ أثناء محاولة إصلاح التسلسل.", 500, error);
  }
};
