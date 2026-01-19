const Section = require("../../../schema/DailyMark/Section");
const Group = require("../../../schema/Group");
const sequenceService = require("../../../services/DailyMark/SectionSequenceService");
const { getSurahByNumber, surahData } = require("../../../utils/Quran/dailyMarkQuranMetadata");
const { createLogger } = require("../../../utils/logger");
const {
  sendSuccess,
  sendError,
  sendNotFound,
} = require("../utils/responseHelpers");

const logger = createLogger('SectionGet');
const { getWeekRange, toDateKey } = require("../../../config/timezone");

// New imports for getFilteredSections
const { updateSectionMarksStatus } = require("./sectionMarksStatus");
const {
  getUserGroupsByRole,
  buildGroupFilter,
  buildDateFilter,
  buildSectionSearchFilter,
} = require("../utils/filterHelpers");

/**
 * Get all sections, sorted by date (newest first)
 * Support filtering by group, teacher and period (week/all)
 */
exports.getSections = async (req, res) => {
  try {
    const { group, teacher, period } = req.query;
    const filter = {};

    if (group) {
      filter.group = group;
    }
    if (teacher) {
      filter.teacher = teacher;
    }

    // ✅ V3: Weekly Filter (Current Week: Sat -> Fri) - Using config/timezone.js
    if (period === 'week') {
      const { startOfWeek, endOfWeek } = getWeekRange(new Date());
      
      // إنشاء نهاية الأسبوع الفعلية (بداية اليوم التالي للجمعة)
      const endOfWeekExclusive = new Date(endOfWeek);
      endOfWeekExclusive.setDate(endOfWeek.getDate() + 1);
      endOfWeekExclusive.setHours(0, 0, 0, 0);

      logger.debug(`Weekly Filter Range: ${toDateKey(startOfWeek)} to ${toDateKey(endOfWeek)}`);

      filter.date = { 
        $gte: startOfWeek, 
        $lt: endOfWeekExclusive 
      };
    }

    const sections = await Section.find(filter)
      .sort({ date: -1 })
      .populate('timetableId', 'day startHour endHour sessionType')
      .populate('groupId', 'name')
      .populate('teacherId', 'firstName lastName');
      
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
      .populate('timetableId', 'day startHour endHour sessionType')
      .populate('groupId', 'name')
      .populate('teacherId', 'firstName lastName');
    if (!section) {
      return sendNotFound(res, "المقطع");
    }
    sendSuccess(res, section, "تم جلب المقطع بنجاح");
  } catch (error) {
    sendError(res, error.message, 500, error);
  }
};

/**
 * Get filtered sections with advanced filters
 * Moved here from getFilteredMarks.js
 */
exports.getFilteredSections = async (req, res) => {
  try {
    logger.info("FILTERED SECTIONS REQUEST");
    const startTime = Date.now();

    const { month, year, day, search, group, startDate, endDate, period } = req.query;

    logger.debug("Filters received:", { month, year, day, search, group, startDate, endDate, period });

    // Get user's group(s) based on role using helper function
    let userGroup, teacherGroups;
    try {
      const groupsData = await getUserGroupsByRole(req.user, group);
      userGroup = groupsData.userGroup;
      teacherGroups = groupsData.teacherGroups;
    } catch (error) {
      return res.status(403).json({
        success: false,
        message: error.message,
      });
    }

    // Build section filter using helper functions
    const groupFilter = buildGroupFilter(req.user, userGroup, group);
    // Initial date filter
    let dateFilter = buildDateFilter(month, year, day, startDate, endDate);
    
    // ✅ V3: Weekly Filter Override (Current Week: Sat -> Fri) - Using timezone.js
    if (period === 'week') {
      const { startOfWeek, endOfWeek } = getWeekRange(new Date());
      
      logger.debug(`Weekly Filter: ${toDateKey(startOfWeek)} -> ${toDateKey(endOfWeek)}`);

      // Override dateFilter to strict Range
      dateFilter = { 
        $gte: startOfWeek, 
        $lte: endOfWeek 
      };
    }

    const searchFilter = buildSectionSearchFilter(search);
    
    // Merge filters properly (handle date and $or from search)
    const sectionFilter = {
      ...groupFilter,
      ...(Object.keys(dateFilter).length > 0 ? { date: dateFilter } : {}),
      ...searchFilter,
    };

    logger.debug("Section filter:", sectionFilter);

    // Find sections
    const sections = await Section.find(sectionFilter)
      .populate("teacher", "firstName lastName")
      .populate("timetableId", "day startHour endHour sessionType")
      .populate("groupId", "name")
      .populate("teacherId", "firstName lastName")
      .sort({ date: -1 })
      .lean();

    // Check if forceRefresh is requested (useful for debugging or fixing status)
    const forceRefresh = req.query.refreshStatus === 'true';
    
    // Use marksStatus from Schema, update if missing (for old sections) or if forceRefresh is requested
    const sectionsWithStatus = await Promise.all(
      sections.map(async (section) => {
        // If marksStatus doesn't exist or marksProgress is missing, or forceRefresh is requested, calculate and update it
        if (!section.marksStatus || !section.marksProgress || forceRefresh) {
          try {
            await updateSectionMarksStatus(section._id.toString(), section.group || userGroup);
            // Fetch updated section
            const updatedSection = await Section.findById(section._id)
              .populate("timetableId", "day startHour endHour sessionType")
              .populate("groupId", "name")
              .populate("teacherId", "firstName lastName")
              .lean();
            return {
              ...updatedSection,
              marksStatus: updatedSection.marksStatus || "not_started",
              marksProgress: updatedSection.marksProgress || {
                totalStudents: 0,
                studentsWithMarks: 0,
                percentage: 0,
              },
            };
          } catch (error) {
            logger.warn(`Error updating status for section ${section._id}:`, error);
            // Return section with default values if update fails
            return {
              ...section,
              marksStatus: section.marksStatus || "not_started",
              marksProgress: section.marksProgress || {
                totalStudents: 0,
                studentsWithMarks: 0,
                percentage: 0,
              },
            };
          }
        }
        // Return section with existing marksStatus from Schema
        return {
          ...section,
          marksStatus: section.marksStatus || "not_started",
          marksProgress: section.marksProgress || {
            totalStudents: 0,
            studentsWithMarks: 0,
            percentage: 0,
          },
        };
      })
    );

    const duration = Date.now() - startTime;
    logger.success(`Fetched ${sectionsWithStatus.length} sections with marks status in ${duration}ms`);
    
    logger.info("FILTERED SECTIONS COMPLETE");

    res.json({
      success: true,
      data: sectionsWithStatus,
      count: sectionsWithStatus.length,
      filters: {
        month: month ? parseInt(month) : null,
        year: year ? parseInt(year) : null,
        day: day ? parseInt(day) : null,
        period: period || 'all',
      },
    });

  } catch (error) {
    logger.error("Error in getFilteredSections:", error);
    sendError(res, error.message, 500, error);
  }
};

/**
 * Get the last recorded segment for a specific Surah and Group
 * Used for auto-increment suggestions in Frontend
 * GET /sections/last-segment?group=...&surah=...&type=memorization|review
 * 
 * ✅ V9: New Review Logic:
 * - Review ALWAYS starts from 1
 * - Review end = max memorized ayah BEFORE the selected date
 * - Same surah: review end = memorization start - 1 (if same surah as memorization)
 */
exports.getLastSegment = async (req, res) => {
  try {
    const { group, surah, type, excludeId, date } = req.query;
    
    if (!group || !surah || !type) {
      return res.status(400).json({ success: false, message: "Missing required params: group, surah, type" });
    }
    
    const surahNum = parseInt(surah);
    
    // ========== MEMORIZATION LOGIC (unchanged) ==========
    if (type === 'memorization') {
      const result = await sequenceService.getLastProgress(group, surahNum, type, null, excludeId);
      
      if (!result) {
        return sendSuccess(res, {
          nextStart: 1,
          maxMemorized: 0,
          suggestedEnd: null
        }, "No previous segment found (First time)");
      }

      return sendSuccess(res, {
        lastSegment: { ayahEnd: result.lastEnd, status: result.lastStatus },
        nextStart: result.nextStart,
        lastDate: result.lastDate,
        maxMemorized: 0,
        suggestedEnd: null
      }, "Last segment found");
    }
    
    // ========== REVIEW LOGIC (V9: Always start from 1) ==========
    if (type === 'review') {
      const targetDate = date ? new Date(date) : new Date();
      const limitDateKey = sequenceService.toDateKeyLocal(targetDate);
      
      // ✅ V9: Get max memorized BEFORE the selected date (strict < not <=)
      const memProgress = await sequenceService.getMaxProgress(
        group, 
        surahNum, 
        'memorization', 
        excludeId, 
        limitDateKey  // This ensures we only count memorization from dates BEFORE this date
      );
      
      const maxMemorized = memProgress ? memProgress.maxEnd : 0;
      
      // ✅ V9: Review ALWAYS starts from 1
      // ✅ V9: Review end = maxMemorized (everything memorized before this date)
      return sendSuccess(res, {
        nextStart: 1, // ✅ Always start from 1 for review
        maxMemorized, // ✅ Max limit for review end
        suggestedEnd: maxMemorized > 0 ? maxMemorized : null, // ✅ Auto-fill end with max memorized
        lastSegment: null,
        lastDate: memProgress?.sectionDate || null
      }, maxMemorized > 0 
        ? `Review available: 1-${maxMemorized}` 
        : "No memorization found before this date");
    }
    
    // Fallback
    sendSuccess(res, { nextStart: 1, maxMemorized: 0, suggestedEnd: null }, "Unknown type");
    
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

/**
 * Check if the weekly quota (3 sections/week) allows adding a new section on this date
 * GET /sections/check-quota?group=...&date=...&excludeId=...
 */
exports.checkQuota = async (req, res) => {
  try {
    const { group, date, excludeId } = req.query;

    if (!group || !date) {
      return res.status(400).json({ 
        success: false, 
        message: "Missing required params: group, date" 
      });
    }

    // ✅ V8: Check Current Week Only FIRST
    const weekCheck = sequenceService.checkCurrentWeekOnly(date);
    if (!weekCheck.isValid) {
        return sendSuccess(res, { 
            allowed: false,
            reason: 'week_limit',
            message: weekCheck.message 
        });
    }

    // 1. Check Weekly Quota
    const check = await sequenceService.checkWeeklyQuota(group, date, excludeId);

    // 2. Check Daily Quota (Already exists logic)
    // We check daily quota too effectively to prevent duplicate days
    const daily = await sequenceService.checkDailyQuota(group, date, excludeId);

    if (!daily.isValid) {
         return sendSuccess(res, { 
             allowed: false,
             reason: 'daily_limit',
             message: daily.message 
         });
    }

    if (!check.isValid) {
        return sendSuccess(res, { 
            allowed: false,
            reason: 'weekly_limit',
            message: check.message 
        });
    }

    sendSuccess(res, { allowed: true }, "Quota check passed");

  } catch (error) {
    sendError(res, error.message, 500, error);
  }
};

/**
 * Get list of fully completed Surahs for a group (Memorization)
 * Used to display "Completed Surahs" list in frontend
 * GET /sections/completed-surahs?group=...
 */
exports.getCompletedSurahs = async (req, res) => {
  try {
    const { group } = req.query;
    if (!group) return sendError(res, "Group is required", 400);

    // Helper to check completions for a specific type
    const checkType = async (type) => {
        const metaField = type === 'memorization' ? 'memorizationMeta' : 'reviewMeta';
        // Ensure we check correct field existence
        const matchStage = { group: group };
        matchStage[`${metaField}.0`] = { $exists: true };

        const pipeline = [
          { $match: matchStage },
          { $unwind: `$${metaField}` },
          { 
            $group: {
              _id: `$${metaField}.surahNumber`,
              maxAyah: { $max: `$${metaField}.ayahEnd` },
              lastCompletedAt: { $max: "$date" } // Approximate completion date
            }
          }
        ];

        const results = await Section.aggregate(pipeline);
        const list = [];
        
        for (const r of results) {
           const info = getSurahByNumber(r._id);
           if (info && r.maxAyah >= info.ayahCount) {
              list.push({
                 surahNumber: info.number,
                 surahName: info.name,
                 totalAyahs: info.ayahCount,
                 completedAt: r.lastCompletedAt,
                 type: type // Identify source
              });
           }
        }
        return list;
    };

    // Run parallel checks
    const [memList, revList] = await Promise.all([
        checkType('memorization'),
        checkType('review')
    ]);

    // Combine and Sort by most recently completed
    const combinedList = [...memList, ...revList].sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));

    sendSuccess(res, combinedList, "Completed Surahs retrieved");

  } catch (error) {
    sendError(res, error.message, 500, error);
  }
};

/**
 * Get full history of a Surah for a group
 * GET /sections/surah-history?group=...&surah=...&type=...
 */
exports.getSurahHistory = async (req, res) => {
  try {
    const { group, surah, type = 'memorization' } = req.query;
    if (!group || !surah) return sendError(res, "Params missing", 400);

    const metaField = type === 'memorization' ? 'memorizationMeta' : 'reviewMeta';
    const surahNum = parseInt(surah);

    // Find all sections containing this surah
    const sections = await Section.find({
       group,
       [`${metaField}.surahNumber`]: surahNum
    })
    .sort({ date: 1 }) // Chronological order
    .select(`date dateKey ${metaField}`);

    // Map to clean history array
    const history = [];
    sections.forEach(sec => {
        const segments = sec[metaField].filter(s => s.surahNumber === surahNum);
        segments.forEach(seg => {
            history.push({
                date: sec.date,
                ayahStart: seg.ayahStart,
                ayahEnd: seg.ayahEnd,
                status: seg.status
            });
        });
    });

    sendSuccess(res, history, "Surah history retrieved");
  } catch (error) {
     sendError(res, error.message, 500, error);
  }
};

/**
 * Get active surahs for a group
 * @route GET /api/daily-marks/sections/active-surahs/:groupId
 * 
 * @description
 * يجلب السور الفعالة والمكتملة للحلقة
 * السورة الفعالة = السورة الحالية التي يجب إكمالها قبل البدء بسورة جديدة
 * ✅ V8: إضافة totalAyahs و progressPercent لعرض التقدم
 */
exports.getActiveSurahs = async (req, res) => {
  try {
    const { groupId } = req.params;

    if (!groupId) {
      return sendError(res, "معرف الحلقة مطلوب", 400);
    }

    // البحث عن المجموعة باستخدام ID أو الاسم
    const mongoose = require('mongoose');
    const { getSurahByNumber } = require('../../../utils/Quran/dailyMarkQuranMetadata');
    const isValidObjectId = mongoose.Types.ObjectId.isValid(groupId);
    
    let group;
    if (isValidObjectId) {
      group = await Group.findById(groupId).select(
        'activeMemorizationSurah activeReviewSurah completedSurahs name'
      );
    } else {
      // البحث باسم المجموعة إذا لم يكن ObjectId صالح
      group = await Group.findOne({ name: groupId }).select(
        'activeMemorizationSurah activeReviewSurah completedSurahs name'
      );
    }

    if (!group) {
      return sendNotFound(res, "الحلقة");
    }

    // ✅ V8: Helper function to add progress info
    const buildActiveSurahData = (activeSurah) => {
      if (!activeSurah?.surahNumber) return null;
      
      const surahInfo = getSurahByNumber(activeSurah.surahNumber);
      const totalAyahs = surahInfo?.ayahCount || 0;
      const lastAyahEnd = activeSurah.lastAyahEnd || 0;
      const remainingAyahs = Math.max(0, totalAyahs - lastAyahEnd);
      const progressPercent = totalAyahs > 0 ? Math.round((lastAyahEnd / totalAyahs) * 100) : 0;
      
      return {
        surahNumber: activeSurah.surahNumber,
        surahName: activeSurah.surahName,
        lastAyahEnd,
        totalAyahs,
        remainingAyahs,
        progressPercent,
        isCompleted: activeSurah.isCompleted,
        startedAt: activeSurah.startedAt,
      };
    };

    // إحصائيات إضافية
    const memorizationStats = {
      activeSurah: buildActiveSurahData(group.activeMemorizationSurah),
      completedCount: group.completedSurahs?.memorization?.length || 0,
      completedSurahs: group.completedSurahs?.memorization || [],
    };

    const reviewStats = {
      activeSurah: buildActiveSurahData(group.activeReviewSurah),
      completedCount: group.completedSurahs?.review?.length || 0,
      completedSurahs: group.completedSurahs?.review || [],
    };

    sendSuccess(res, {
      groupId: group._id.toString(),
      groupName: group.name,
      memorization: memorizationStats,
      review: reviewStats,
    }, "تم جلب السور الفعالة بنجاح");

  } catch (error) {
    logger.error("Error fetching active surahs:", error);
    sendError(res, error.message, 500, error);
  }
};

/**
 * Get detailed active surah info for a group (with progress)
 * @route GET /api/daily-marks/sections/active-surah-info/:groupId
 * 
 * @description
 * يجلب معلومات تفصيلية عن السور الفعالة مع نسبة التقدم
 * يستخدم للتحقق قبل إضافة مقطع جديد
 * ✅ V10: يقبل الآن اسم الحلقة أو معرفها
 */
exports.getActiveSurahInfo = async (req, res) => {
  try {
    const { groupId } = req.params;

    if (!groupId) {
      return sendError(res, "معرف الحلقة مطلوب", 400);
    }

    // ✅ V10: Check if groupId is a valid MongoDB ObjectId or group name
    const mongoose = require("mongoose");
    let group;
    
    if (mongoose.Types.ObjectId.isValid(groupId)) {
      // It's a valid ObjectId - use it directly
      group = await Group.findById(groupId).select('_id');
    }
    
    // If not found by ID, try to find by name
    if (!group) {
      group = await Group.findOne({ name: groupId }).select('_id');
    }

    if (!group) {
      return sendNotFound(res, "الحلقة");
    }

    // استخدام الـ method الجديد من Group Schema with actual ObjectId
    const info = await Group.getActiveSurahInfo(group._id);

    if (!info) {
      return sendNotFound(res, "الحلقة");
    }

    sendSuccess(res, info, "تم جلب معلومات السور الفعالة بنجاح");

  } catch (error) {
    logger.error("Error fetching active surah info:", error);
    sendError(res, error.message, 500, error);
  }
};

/**
 * Reset active surah for a group (Admin/Emergency use)
 * @route POST /api/daily-marks/sections/reset-active-surah
 */
exports.resetActiveSurah = async (req, res) => {
  try {
    const { groupId, type } = req.body;

    if (!groupId || !type) {
      return sendError(res, "معرف الحلقة ونوع السورة مطلوبان", 400);
    }

    if (!['memorization', 'review'].includes(type)) {
      return sendError(res, "نوع السورة يجب أن يكون 'memorization' أو 'review'", 400);
    }

    await Group.resetActiveSurah(groupId, type);

    sendSuccess(res, {
      groupId,
      type,
      reset: true
    }, `تم إعادة تعيين سورة ${type === 'memorization' ? 'الحفظ' : 'المراجعة'} الفعالة`);

  } catch (error) {
    logger.error("Error resetting active surah:", error);
    sendError(res, error.message, 500, error);
  }
};

/**
 * Mark a surah as completed
 * @route POST /api/daily-marks/sections/complete-surah
 */
exports.completeSurah = async (req, res) => {
  try {
    const { groupId, type } = req.body;

    if (!groupId || !type) {
      return sendError(res, "معرف الحلقة ونوع المقطع مطلوبان", 400);
    }

    if (!['memorization', 'review'].includes(type)) {
      return sendError(res, "نوع المقطع يجب أن يكون 'memorization' أو 'review'", 400);
    }

    // Count total segments for this surah
    const activeSurahs = await Group.getActiveSurahs(groupId);
    const activeSurah = type === 'memorization' 
      ? activeSurahs?.memorization 
      : activeSurahs?.review;

    if (!activeSurah || !activeSurah.surahNumber) {
      return sendError(res, "لا توجد سورة فعالة لإكمالها", 400);
    }

    const metaField = type === 'memorization' ? 'memorizationMeta' : 'reviewMeta';
    const totalSegments = await Section.countDocuments({
      groupId,
      [`${metaField}.surahNumber`]: activeSurah.surahNumber
    });

    await Group.completeSurah(groupId, type, totalSegments);

    sendSuccess(res, {
      completedSurah: {
        surahNumber: activeSurah.surahNumber,
        surahName: activeSurah.surahName,
        type,
        totalSegments,
      }
    }, `تم إكمال سورة ${activeSurah.surahName} بنجاح`);

  } catch (error) {
    logger.error("Error completing surah:", error);
    sendError(res, error.message, 500, error);
  }
};
/**
 * Sync active surahs from existing sections
 * Fixes orphaned activeSurah data when sections don't exist
 * @route POST /api/daily-marks/sections/sync-active-surahs
 */
exports.syncActiveSurahs = async (req, res) => {
  try {
    const { groupId, groupName } = req.body;

    // إذا تم إرسال اسم الحلقة بدل الـ ID
    let targetGroupId = groupId;
    if (!targetGroupId && groupName) {
      const group = await Group.findOne({ name: groupName.trim() });
      if (group) {
        targetGroupId = group._id;
      } else {
        return sendError(res, `الحلقة "${groupName}" غير موجودة`, 404);
      }
    }

    const groupActiveSurahService = require("../../../services/DailyMark/GroupActiveSurahService");
    
    const results = await groupActiveSurahService.syncActiveSurahsFromSections(targetGroupId || null);

    sendSuccess(res, results, `تم مزامنة السور الفعالة بنجاح`);

  } catch (error) {
    logger.error("Error syncing active surahs:", error);
    sendError(res, error.message, 500, error);
  }
};