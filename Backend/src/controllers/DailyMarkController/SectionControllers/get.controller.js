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
    if (type === 'review') {
        const memProgress = await sequenceService.getLastProgress(group, surahNum, 'memorization');
        maxMemorized = memProgress ? memProgress.lastEnd : 0;
    }

    if (!result) {
      // إذا لم يكن هناك سجل سابق للمراجعة، نعيد null مع حد الحفظ
      // هذا يسمح للفرونت إند بمعرفة أن السجل فارغ لكن هناك حد للحفظ
      return sendSuccess(res, {
          nextStart: 1, // Start from 1 if no history
          maxMemorized // Return memorization limit for first-time review
      }, "No previous segment found (First time)");
    }

    sendSuccess(res, {
        lastSegment: { ayahEnd: result.lastEnd, status: result.lastStatus }, // Compatibility structure
        nextStart: result.nextStart,
        lastDate: result.lastDate,
        maxMemorized: result.maxMemorized || maxMemorized // Include limit in response
    }, "Last segment found");
    
  } catch (error) {
    sendError(res, error.message, 500, error);
  }
};
