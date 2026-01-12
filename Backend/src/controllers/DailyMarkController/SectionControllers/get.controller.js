const Section = require("../../../schema/DailyMark/Section");
const sequenceService = require("../../../services/DailyMark/SectionSequenceService");
const { getSurahByNumber, surahData } = require("../../../utils/Quran/dailyMarkQuranMetadata");
const {
  sendSuccess,
  sendError,
  sendNotFound,
} = require("../utils/responseHelpers");

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

    // ✅ V3: Weekly Filter (Current Week: Sat -> Fri)
    if (period === 'week') {
      const d = new Date();
      // Calculate start of week (Saturday)
      const dayIndex = d.getDay(); // 0-6
      const distFromSat = (dayIndex + 1) % 7;
      
      const startOfWeek = new Date(d);
      startOfWeek.setDate(d.getDate() - distFromSat);
      startOfWeek.setHours(0, 0, 0, 0);
      
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 7);
      endOfWeek.setHours(0, 0, 0, 0);

      filter.date = { 
        $gte: startOfWeek, 
        $lt: endOfWeek 
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
    console.log("🔍 ========== FILTERED SECTIONS REQUEST ==========");
    const startTime = Date.now();

    const { month, year, day, search, group, startDate, endDate, period } = req.query;

    console.log("📋 Filters received:", { month, year, day, search, group, startDate, endDate, period });

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
    
    // ✅ V3: Weekly Filter Override (Current Week: Sat -> Fri)
    if (period === 'week') {
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Reset time to ensure clean date calculation

      // Calculate start of week (Saturday)
      // dayIndex: 0 (Sun) ... 6 (Sat)
      // distFromSat: Sun(0)->1, Mon(1)->2, ..., Fri(5)->6, Sat(6)->0
      const dayIndex = today.getDay();
      const distFromSat = (dayIndex + 1) % 7;
      
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - distFromSat);
      startOfWeek.setHours(0, 0, 0, 0); // Start of Saturday (00:00:00)
      
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6); // End of Friday
      endOfWeek.setHours(23, 59, 59, 999); // End of Friday (23:59:59)

      console.log(`📅 Applying Weekly Filter: ${startOfWeek.toDateString()} -> ${endOfWeek.toDateString()}`);

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

    console.log("🔧 Section filter:", sectionFilter);

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
            console.error(`⚠️ Error updating status for section ${section._id}:`, error);
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
    console.log(`✅ Fetched ${sectionsWithStatus.length} sections with marks status in ${duration}ms`);
    
    console.log("🔍 ========== FILTERED SECTIONS COMPLETE ==========\n");

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
    console.error("❌ Error in getFilteredSections:", error);
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
    const { group, surah, type, excludeId } = req.query;
    
    if (!group || !surah || !type) {
      return res.status(400).json({ success: false, message: "Missing required params: group, surah, type" });
    }
    
    const surahNum = parseInt(surah);
    
    // استخدام الخدمة المركزية للبحث
    const result = await sequenceService.getLastProgress(group, surahNum, type, null, excludeId);
    
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
