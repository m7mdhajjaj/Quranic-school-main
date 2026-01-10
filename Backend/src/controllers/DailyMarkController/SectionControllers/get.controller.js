const Section = require("../../../schema/DailyMark/Section");
const sequenceService = require("../../../services/DailyMark/SectionSequenceService");
const {
  sendSuccess,
  sendError,
  sendNotFound,
} = require("../utils/responseHelpers");

/**
 * Get all sections, sorted by date (newest first)
 * Support filtering by group and teacher via query params
 */
exports.getSections = async (req, res) => {
  try {
    const { group, teacher } = req.query;
    const filter = {};

    if (group) {
      filter.group = group;
    }
    if (teacher) {
      filter.teacher = teacher;
    }

    const sections = await Section.find(filter)
      .sort({ date: -1 })
      .populate('timetableId', 'day startHour endHour sessionType');
      
    sendSuccess(res, sections, "تم جلب المقاطع بنجاح");
  } catch (error) {
    sendError(res, error.message, 500, error);
  }
};

/**
 * Get a single section
 */
exports.getSection = async (req, res) => {
  try {
    const section = await Section.findById(req.params.id)
      .populate('timetableId', 'day startHour endHour sessionType');
    if (!section) {
      return sendNotFound(res, "المقطع");
    }
    sendSuccess(res, section, "تم جلب المقطع بنجاح");
  } catch (error) {
    sendError(res, error.message, 500, error);
  }
};

/**
 * Get the last recorded segment for a specific Surah and Group
 * Used for auto-increment suggestions in Frontend
 * GET /sections/last-segment?group=...&surah=...&type=memorization|review
 * 
 * ✅ V3: Still uses getLastProgress for backward compatibility
 * Note: For date-aware validation, use /neighbor-segments endpoint
 */
exports.getLastSegment = async (req, res) => {
  try {
    const { group, surah, type } = req.query;
    
    if (!group || !surah || !type) {
      return res.status(400).json({ success: false, message: "Missing required params: group, surah, type" });
    }
    
    const surahNum = parseInt(surah);
    
    // استخدام الخدمة المركزية للبحث
    const result = await sequenceService.getLastProgress(group, surahNum, type);
    
    // إذا لم يوجد سجل سابق (مثلاً أول مراجعة)، نحاول جلب حد الحفظ فقط إذا كان الطلب للمراجعة
    let maxMemorized = 0;
    
    // NEW: Suggested End (Strict Range Matching)
    let suggestedEnd = null;
    const startPoint = result ? result.nextStart : 1;

    if (type === 'review') {
        const memProgress = await sequenceService.getLastProgress(group, surahNum, 'memorization');
        maxMemorized = memProgress ? memProgress.lastEnd : 0;

        // Try to find the Exact Memorization Segment that starts at 'startPoint'
        suggestedEnd = await sequenceService.getMatchingMemorizationEnd(group, surahNum, startPoint);
    }

    if (!result) {
      // إذا لم يكن هناك سجل سابق للمراجعة، نعيد null مع حد الحفظ
      // هذا يسمح للفرونت إند بمعرفة أن السجل فارغ لكن هناك حد للحفظ
      return sendSuccess(res, {
          nextStart: 1, // Start from 1 if no history
          maxMemorized, // Return memorization limit for first-time review
          suggestedEnd // Return strictly matched end if found
      }, "No previous segment found (First time)");
    }

    sendSuccess(res, {
        lastSegment: { ayahEnd: result.lastEnd, status: result.lastStatus }, // Compatibility structure
        nextStart: result.nextStart,
        lastDate: result.lastDate,
        maxMemorized: result.maxMemorized || maxMemorized, // Include limit in response
        suggestedEnd // Return strictly matched end
    }, "Last segment found");
    
  } catch (error) {
    sendError(res, error.message, 500, error);
  }
};

/**
 * ✅ V3: Get neighbor segments for backfilling validation
 * GET /sections/neighbor-segments?group=...&surah=...&type=memorization|review&date=YYYY-MM-DD
 * 
 * Returns the closest segments BEFORE and AFTER the specified date
 * Useful for:
 * - Frontend backfilling UI
 * - Validation preview before submission
 * - Understanding chronological context
 */
exports.getNeighborSegments = async (req, res) => {
  try {
    const { group, surah, type, date } = req.query;
    
    if (!group || !surah || !type || !date) {
      return res.status(400).json({ 
        success: false, 
        message: "Missing required params: group, surah, type, date" 
      });
    }
    
    const surahNum = parseInt(surah);
    const targetDate = new Date(date);
    
    if (isNaN(targetDate.getTime())) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid date format. Use YYYY-MM-DD" 
      });
    }
    
    // استدعاء الخدمة الجديدة
    const neighbors = await sequenceService.getNeighborSegments(
      group, 
      surahNum, 
      type, 
      targetDate
    );
    
    // حساب الاقتراحات بناءً على الجيران
    let suggestions = {
      canInsert: false,
      suggestedStart: null,
      suggestedEnd: null,
      reason: null
    };
    
    if (!neighbors.previous && !neighbors.next) {
      // لا يوجد جيران - أول مقطع
      suggestions = {
        canInsert: true,
        suggestedStart: 1,
        suggestedEnd: null, // المستخدم يحدد
        reason: "أول مقطع في السورة"
      };
    } else if (neighbors.previous && !neighbors.next) {
      // يوجد سابق فقط - استمرار عادي
      suggestions = {
        canInsert: true,
        suggestedStart: neighbors.previous.ayahEnd + 1,
        suggestedEnd: null,
        reason: "استمرار من المقطع السابق"
      };
    } else if (!neighbors.previous && neighbors.next) {
      // يوجد لاحق فقط - يجب البدء من 1
      suggestions = {
        canInsert: true,
        suggestedStart: 1,
        suggestedEnd: neighbors.next.ayahStart - 1,
        reason: "سد الفجوة قبل المقطع اللاحق"
      };
    } else {
      // يوجد سابق ولاحق - backfilling
      const gapStart = neighbors.previous.ayahEnd + 1;
      const gapEnd = neighbors.next.ayahStart - 1;
      
      if (gapStart <= gapEnd) {
        suggestions = {
          canInsert: true,
          suggestedStart: gapStart,
          suggestedEnd: gapEnd,
          reason: "سد الفجوة بين المقاطع الموجودة"
        };
      } else {
        suggestions = {
          canInsert: false,
          suggestedStart: null,
          suggestedEnd: null,
          reason: "لا توجد فجوة - المقاطع متصلة بالفعل"
        };
      }
    }
    
    sendSuccess(res, {
      neighbors,
      suggestions,
      context: {
        group,
        surahNumber: surahNum,
        type,
        targetDate: date
      }
    }, "Neighbor segments retrieved successfully");
    
  } catch (error) {
    sendError(res, error.message, 500, error);
  }
};
