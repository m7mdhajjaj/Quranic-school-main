const smartScheduler = require("../../services/DailyMark/SmartSchedulerService");
const { getSurahByNumber } = require("../../utils/Quran/dailyMarkQuranMetadata");
const Group = require("../../schema/Group");

/**
 * ============================================================================
 * Smart Scheduler Controller
 * ============================================================================
 * API لخدمة الجدولة الذكية - اقتراح تواريخ وسد فجوات
 */

/**
 * POST /api/daily-marks/scheduler/suggest-gaps
 * 
 * اقتراح جدول سد الفجوات لسورة معينة
 * 
 * Body:
 * {
 *   groupId: string (required),
 *   surahNumber: number (required),
 *   chunkSize: number (optional, default: smart 10-15),
 *   priorityDate: Date (optional, default: today),
 *   preferredDays: number[] (optional, e.g. [0, 2, 4]),
 *   maxChunks: number (optional),
 *   type: 'memorization' | 'review' (optional, default: 'memorization')
 * }
 */
const suggestGapFilling = async (req, res) => {
  try {
    const { groupId, surahNumber, chunkSize, priorityDate, preferredDays, maxChunks, type } = req.body;

    if (!groupId) {
      return res.status(400).json({ 
        success: false, 
        message: "معرف الحلقة (groupId) مطلوب" 
      });
    }

    if (!surahNumber || surahNumber < 1 || surahNumber > 114) {
      return res.status(400).json({ 
        success: false, 
        message: "رقم السورة (surahNumber) مطلوب ويجب أن يكون بين 1 و 114" 
      });
    }

    const result = await smartScheduler.suggestGapFilling(groupId, surahNumber, {
      chunkSize: chunkSize ? parseInt(chunkSize, 10) : null,
      priorityDate: priorityDate ? new Date(priorityDate) : new Date(),
      preferredDays: preferredDays || null,
      maxChunks: maxChunks ? parseInt(maxChunks, 10) : null,
      type: type || 'memorization'
    });

    return res.json(result);

  } catch (error) {
    console.error("Error in suggestGapFilling:", error);
    return res.status(500).json({ 
      success: false, 
      message: "خطأ في اقتراح سد الفجوات", 
      error: error.message 
    });
  }
};

/**
 * POST /api/daily-marks/scheduler/suggest-date
 * 
 * اقتراح تاريخ واحد لمقطع جديد
 * 
 * Body:
 * {
 *   groupId: string (required),
 *   surahNumber: number (required),
 *   ayahStart: number (required),
 *   ayahEnd: number (optional, auto-calculated if not provided)
 * }
 */
const suggestSingleDate = async (req, res) => {
  try {
    const { groupId, surahNumber, ayahStart, ayahEnd } = req.body;

    if (!groupId) {
      return res.status(400).json({ 
        success: false, 
        message: "معرف الحلقة (groupId) مطلوب" 
      });
    }

    if (!surahNumber || surahNumber < 1 || surahNumber > 114) {
      return res.status(400).json({ 
        success: false, 
        message: "رقم السورة (surahNumber) مطلوب ويجب أن يكون بين 1 و 114" 
      });
    }

    if (!ayahStart || ayahStart < 1) {
      return res.status(400).json({ 
        success: false, 
        message: "بداية الآيات (ayahStart) مطلوبة ويجب أن تكون أكبر من 0" 
      });
    }

    const result = await smartScheduler.suggestSingleDate(
      groupId, 
      parseInt(surahNumber, 10), 
      parseInt(ayahStart, 10), 
      ayahEnd ? parseInt(ayahEnd, 10) : null
    );

    return res.json(result);

  } catch (error) {
    console.error("Error in suggestSingleDate:", error);
    return res.status(500).json({ 
      success: false, 
      message: "خطأ في اقتراح التاريخ", 
      error: error.message 
    });
  }
};

/**
 * POST /api/daily-marks/scheduler/validate
 * 
 * التحقق من صلاحية تاريخ معين لمقطع (قبل الإدراج)
 * 
 * Body:
 * {
 *   groupId: string (required),
 *   surahNumber: number (required),
 *   ayahStart: number (required),
 *   ayahEnd: number (required),
 *   proposedDate: Date (required)
 * }
 */
const validateBeforeInsert = async (req, res) => {
  try {
    const { groupId, surahNumber, ayahStart, ayahEnd, proposedDate } = req.body;

    if (!groupId || !surahNumber || !ayahStart || !ayahEnd || !proposedDate) {
      return res.status(400).json({ 
        success: false, 
        message: "جميع الحقول مطلوبة: groupId, surahNumber, ayahStart, ayahEnd, proposedDate" 
      });
    }

    const result = await smartScheduler.validateBeforeInsert(
      groupId,
      parseInt(surahNumber, 10),
      parseInt(ayahStart, 10),
      parseInt(ayahEnd, 10),
      new Date(proposedDate)
    );

    return res.json({
      success: true,
      validation: result
    });

  } catch (error) {
    console.error("Error in validateBeforeInsert:", error);
    return res.status(500).json({ 
      success: false, 
      message: "خطأ في التحقق", 
      error: error.message 
    });
  }
};

/**
 * GET /api/daily-marks/scheduler/available-dates
 * 
 * جلب التواريخ المتاحة لحلقة معينة
 * 
 * Query:
 * - groupId: string (required)
 * - count: number (optional, default: 10)
 * - startDate: Date (optional, default: today)
 */
const getAvailableDates = async (req, res) => {
  try {
    const { groupId, count, startDate } = req.query;

    if (!groupId) {
      return res.status(400).json({ 
        success: false, 
        message: "معرف الحلقة (groupId) مطلوب" 
      });
    }

    const result = await smartScheduler.generateAvailableDates(
      groupId,
      count ? parseInt(count, 10) : 10,
      startDate ? new Date(startDate) : new Date()
    );

    return res.json({
      success: true,
      ...result
    });

  } catch (error) {
    console.error("Error in getAvailableDates:", error);
    return res.status(500).json({ 
      success: false, 
      message: "خطأ في جلب التواريخ المتاحة", 
      error: error.message 
    });
  }
};

/**
 * GET /api/daily-marks/scheduler/gaps/:groupId/:surahNumber
 * 
 * اكتشاف الفجوات فقط (بدون اقتراح تواريخ)
 */
const detectGaps = async (req, res) => {
  try {
    const { groupId, surahNumber } = req.params;
    const { type } = req.query;

    if (!groupId || !surahNumber) {
      return res.status(400).json({ 
        success: false, 
        message: "معرف الحلقة ورقم السورة مطلوبان" 
      });
    }

    const { byQuran } = await smartScheduler.getExistingSegments(
      groupId, 
      parseInt(surahNumber, 10), 
      type || 'memorization'
    );

    const gaps = smartScheduler.detectGaps(byQuran, parseInt(surahNumber, 10));
    const surahInfo = getSurahByNumber(parseInt(surahNumber, 10));

    return res.json({
      success: true,
      surahNumber: parseInt(surahNumber, 10),
      surahName: surahInfo?.name || `سورة ${surahNumber}`,
      totalAyahs: surahInfo?.ayahCount || 0,
      existingSegments: byQuran.length,
      gaps: gaps.map(g => ({
        ayahStart: g.ayahStart,
        ayahEnd: g.ayahEnd,
        size: g.size,
        isEndOfSurah: g.isEndOfSurah || false
      })),
      hasGaps: gaps.length > 0,
      totalGapSize: gaps.reduce((sum, g) => sum + g.size, 0)
    });

  } catch (error) {
    console.error("Error in detectGaps:", error);
    return res.status(500).json({ 
      success: false, 
      message: "خطأ في اكتشاف الفجوات", 
      error: error.message 
    });
  }
};

/**
 * POST /api/daily-marks/scheduler/split-chunk
 * 
 * تقسيم فجوة معينة إلى مقاطع (للمعاينة)
 * 
 * Body:
 * {
 *   surahNumber: number,
 *   ayahStart: number,
 *   ayahEnd: number,
 *   chunkSize: number (optional)
 * }
 */
const splitChunk = async (req, res) => {
  try {
    const { surahNumber, ayahStart, ayahEnd, chunkSize } = req.body;

    if (!surahNumber || !ayahStart || !ayahEnd) {
      return res.status(400).json({ 
        success: false, 
        message: "surahNumber, ayahStart, ayahEnd مطلوبة" 
      });
    }

    const gap = {
      surahNumber: parseInt(surahNumber, 10),
      ayahStart: parseInt(ayahStart, 10),
      ayahEnd: parseInt(ayahEnd, 10),
      size: parseInt(ayahEnd, 10) - parseInt(ayahStart, 10) + 1
    };

    const chunks = smartScheduler.splitGapIntoChunks(
      gap, 
      chunkSize ? parseInt(chunkSize, 10) : null
    );

    const surahInfo = getSurahByNumber(gap.surahNumber);

    return res.json({
      success: true,
      originalGap: {
        ...gap,
        surahName: surahInfo?.name || `سورة ${surahNumber}`
      },
      chunks: chunks.map(c => ({
        ...c,
        displayText: `${surahInfo?.name || `سورة ${surahNumber}`} ${c.ayahStart}-${c.ayahEnd}`
      })),
      totalChunks: chunks.length
    });

  } catch (error) {
    console.error("Error in splitChunk:", error);
    return res.status(500).json({ 
      success: false, 
      message: "خطأ في تقسيم الفجوة", 
      error: error.message 
    });
  }
};

/**
 * GET /api/daily-marks/scheduler/weekly-usage/:groupId
 * 
 * استعراض استخدام الأسابيع القادمة
 */
const getWeeklyUsage = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { weeks } = req.query;

    if (!groupId) {
      return res.status(400).json({ 
        success: false, 
        message: "معرف الحلقة مطلوب" 
      });
    }

    const weekCount = weeks ? parseInt(weeks, 10) : 6;
    const weeksList = smartScheduler.generateWeeks(new Date(), weekCount);
    const usage = await smartScheduler.getWeeklyUsage(groupId, weeksList);

    return res.json({
      success: true,
      weeks: weeksList.map(w => ({
        weekNumber: w.weekNumber,
        start: w.start,
        end: w.end,
        dateKey: w.dateKey,
        ...usage[w.dateKey]
      }))
    });

  } catch (error) {
    console.error("Error in getWeeklyUsage:", error);
    return res.status(500).json({ 
      success: false, 
      message: "خطأ في جلب استخدام الأسابيع", 
      error: error.message 
    });
  }
};

/**
 * POST /api/daily-marks/scheduler/validate-auto-fix
 * 
 * التحقق من صلاحية التاريخ مع إصلاح تلقائي
 * إذا التاريخ غير صالح، يقترح تاريخ بديل تلقائياً
 * 
 * Body:
 * {
 *   groupId: string (required),
 *   surahNumber: number (required),
 *   ayahStart: number (required),
 *   ayahEnd: number (required),
 *   proposedDate: Date (required),
 *   autoFix: boolean (optional, default: true)
 * }
 */
const validateAndAutoFix = async (req, res) => {
  try {
    const { groupId, surahNumber, ayahStart, ayahEnd, proposedDate, autoFix = true } = req.body;

    if (!groupId || !surahNumber || !ayahStart || !ayahEnd || !proposedDate) {
      return res.status(400).json({ 
        success: false, 
        message: "جميع الحقول مطلوبة: groupId, surahNumber, ayahStart, ayahEnd, proposedDate" 
      });
    }

    const result = await smartScheduler.validateAndAutoFix(
      groupId,
      parseInt(surahNumber, 10),
      parseInt(ayahStart, 10),
      parseInt(ayahEnd, 10),
      proposedDate,
      autoFix
    );

    return res.json({
      success: true,
      ...result
    });

  } catch (error) {
    console.error("Error in validateAndAutoFix:", error);
    return res.status(500).json({ 
      success: false, 
      message: "خطأ في التحقق والإصلاح التلقائي", 
      error: error.message 
    });
  }
};

/**
 * GET /api/daily-marks/scheduler/debug-order/:groupId/:surahNumber
 * 
 * عرض الترتيب الحالي للمقاطع (للتصحيح)
 */
const debugOrder = async (req, res) => {
  try {
    const { groupId, surahNumber } = req.params;

    if (!groupId || !surahNumber) {
      return res.status(400).json({ 
        success: false, 
        message: "معرف الحلقة ورقم السورة مطلوبان" 
      });
    }

    const result = await smartScheduler.debugShowOrder(groupId, parseInt(surahNumber, 10));
    const surahInfo = getSurahByNumber(parseInt(surahNumber, 10));

    return res.json({
      success: true,
      surahNumber: parseInt(surahNumber, 10),
      surahName: surahInfo?.name || `سورة ${surahNumber}`,
      isMonotonic: result.isMonotonic,
      byDate: result.byDate.map(s => ({
        dateKey: s.dateKey,
        ayahStart: s.ayahStart,
        ayahEnd: s.ayahEnd
      })),
      byQuran: result.byQuran.map(s => ({
        dateKey: s.dateKey,
        ayahStart: s.ayahStart,
        ayahEnd: s.ayahEnd
      }))
    });

  } catch (error) {
    console.error("Error in debugOrder:", error);
    return res.status(500).json({ 
      success: false, 
      message: "خطأ في عرض الترتيب", 
      error: error.message 
    });
  }
};

module.exports = {
  suggestGapFilling,
  suggestSingleDate,
  validateBeforeInsert,
  validateAndAutoFix,
  getAvailableDates,
  detectGaps,
  splitChunk,
  getWeeklyUsage,
  debugOrder
};
