const smartScheduler = require("../../../services/DailyMark/SmartSchedulerService");
const Section = require("../../../schema/DailyMark/Section");
const { sendSuccess, sendError } = require("../utils/responseHelpers");

/**
 * Repair Sequence Controller
 * تحليل وإصلاح الفجوات لجميع السور
 */
exports.repairSequence = async (req, res) => {
  try {
    const { groupId, surahNumber, chunkSize, options } = req.body;

    // Validate inputs
    if (!groupId) {
      return sendError(res, "بيانات ناقصة: يجب تحديد معرّف الحلقة.", 400);
    }

    const effectiveChunkSize = chunkSize || options?.maxVersesPerDay || 10;

    // إذا تم تحديد سورة معينة
    if (surahNumber) {
      console.log(`🤖 Smart Scheduler: Analyzing Surah ${surahNumber} for Group ${groupId}...`);
      
      const result = await smartScheduler.suggestGapFilling(groupId, surahNumber, {
        chunkSize: effectiveChunkSize
      });

      if (!result.success) {
        return sendError(res, result.message, 400);
      }

      return sendSuccess(res, result, result.message);
    }

    // إذا لم يتم تحديد سورة، نحلل جميع السور
    console.log(`🤖 Smart Scheduler: Full analysis for Group ${groupId}...`);

    // جلب جميع السور الموجودة في الحلقة
    const memSurahs = await Section.distinct("memorizationMeta.surahNumber", { group: groupId });
    const revSurahs = await Section.distinct("reviewMeta.surahNumber", { group: groupId });
    const allSurahs = [...new Set([...memSurahs, ...revSurahs])].filter(Boolean).sort((a, b) => a - b);

    if (allSurahs.length === 0) {
      return sendSuccess(res, {
        success: true,
        repaired: false,
        message: "لا توجد سجلات قرآنية في هذه الحلقة."
      }, "لا توجد سجلات");
    }

    // تحليل كل سورة
    let totalGaps = 0;
    let surahsWithGaps = [];
    let allSuggestions = [];

    for (const surah of allSurahs) {
      try {
        const result = await smartScheduler.suggestGapFilling(groupId, surah, {
          chunkSize: effectiveChunkSize
        });

        if (result.success && result.gaps && result.gaps.length > 0) {
          totalGaps += result.gaps.length;
          surahsWithGaps.push({
            surahNumber: surah,
            surahName: result.surahName,
            gapsCount: result.gaps.length,
            gaps: result.gaps
          });
          
          if (result.suggestions) {
            allSuggestions.push(...result.suggestions.map(s => ({
              ...s,
              surahNumber: surah,
              surahName: result.surahName
            })));
          }
        }
      } catch (err) {
        console.error(`Error analyzing Surah ${surah}:`, err.message);
      }
    }

    if (totalGaps === 0) {
      return sendSuccess(res, {
        success: true,
        repaired: false,
        surahsAnalyzed: allSurahs.length,
        message: `تم فحص ${allSurahs.length} سورة - لا توجد فجوات! ✅`
      }, "السجلات سليمة");
    }

    return sendSuccess(res, {
      success: true,
      repaired: false,
      surahsAnalyzed: allSurahs.length,
      totalGaps,
      surahsWithGaps,
      suggestions: allSuggestions,
      message: `تم اكتشاف ${totalGaps} فجوة في ${surahsWithGaps.length} سورة`
    }, `تم اكتشاف ${totalGaps} فجوة`);

  } catch (error) {
    console.error("❌ Smart Scheduler Error:", error);
    sendError(res, "حدث خطأ أثناء التحليل.", 500, error);
  }
};
