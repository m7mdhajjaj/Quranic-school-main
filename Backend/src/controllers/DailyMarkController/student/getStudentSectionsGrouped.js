// ============================================================================
// student/getStudentSectionsGrouped.js - Get Student Sections Grouped by Surah
// ============================================================================

const Section = require("../../../schema/DailyMark/Section");
const Mark = require("../../../schema/DailyMark/DailyMark");
const { sendSuccess, sendError } = require("../utils/responseHelpers");
const { getSurahByNumber } = require("../../../utils/Quran/dailyMarkQuranMetadata");
const { createLogger } = require("../../../utils/logger");

const logger = createLogger('StudentSectionsGrouped');

/**
 * Get student sections grouped by Surah with progress tracking
 * @route GET /api/daily-marks/student/:studentId/grouped-sections
 * 
 * @description
 * يجمع المقاطع التي تخص الطالب مجمّعة حسب السور
 * يعرض فقط السور التي بدأ بها المعلم للطالب
 * يحسب نسبة الإتمام لكل سورة
 * يرتب السور حسب ترقيمها
 */
exports.getStudentSectionsGrouped = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { groupId } = req.query; // اختياري: تصفية حسب الحلقة

    logger.debug(`Fetching for student: ${studentId}`);
    logger.debug(`groupId from query: ${groupId}`);

    // 1. Get student's group
    const Student = require("../../../schema/Student/Student");
    const Group = require("../../../schema/Group");
    const mongoose = require("mongoose");
    
    const student = await Student.findById(studentId).select("group groupId");
    
    if (!student) {
      return sendError(res, "الطالب غير موجود", 404);
    }

    logger.debug(`Student data: group=${student.group}, groupId=${student.groupId}`);

    // 2. Build filter for sections
    // نبحث بكلا الطريقتين: groupId (ObjectId) أو group (اسم)
    let sectionFilter = {};
    let resolvedGroupId = null;
    let resolvedGroupName = null;
    
    if (groupId) {
      // التحقق مما إذا كان groupId هو ObjectId صالح أو اسم المجموعة
      const isValidObjectId = mongoose.Types.ObjectId.isValid(groupId);
      logger.debug(`groupId provided: "${groupId}", isValidObjectId: ${isValidObjectId}`);
      
      if (isValidObjectId) {
        resolvedGroupId = groupId;
        // جلب اسم المجموعة أيضاً للبحث المزدوج
        const group = await Group.findById(groupId).select('name');
        if (group) {
          resolvedGroupName = group.name;
        }
      } else {
        // البحث باسم المجموعة
        resolvedGroupName = groupId;
        const group = await Group.findOne({ name: groupId }).select('_id name');
        logger.debug(`Found group by name: ${JSON.stringify(group)}`);
        if (group) {
          resolvedGroupId = group._id;
        }
      }
    } else if (student.groupId) {
      resolvedGroupId = student.groupId;
      // جلب اسم المجموعة
      const group = await Group.findById(student.groupId).select('name');
      if (group) {
        resolvedGroupName = group.name;
      }
    } else if (student.group) {
      resolvedGroupName = student.group;
      // محاولة جلب ObjectId
      const group = await Group.findOne({ name: student.group }).select('_id');
      if (group) {
        resolvedGroupId = group._id;
      }
    }

    // بناء فلتر يبحث بكلا الطريقتين (OR)
    if (resolvedGroupId && resolvedGroupName) {
      sectionFilter = {
        $or: [
          { groupId: resolvedGroupId },
          { group: resolvedGroupName }
        ]
      };
    } else if (resolvedGroupId) {
      sectionFilter = { groupId: resolvedGroupId };
    } else if (resolvedGroupName) {
      sectionFilter = { group: resolvedGroupName };
    }

    logger.debug(`Resolved: groupId=${resolvedGroupId}, groupName="${resolvedGroupName}"`);
    logger.debug(`Final Section Filter: ${JSON.stringify(sectionFilter)}`);

    // 3. Get all sections for this student's group
    const sections = await Section.find(sectionFilter)
      .sort({ date: -1 })
      .lean();

    logger.debug(`Found ${sections.length} sections`);
    
    // Debug: Show first 3 sections details
    if (sections.length > 0) {
      logger.trace("First 3 sections:");
      sections.slice(0, 3).forEach((s, i) => {
        logger.trace(`  ${i+1}. group: "${s.group}", groupId: "${s.groupId}", date: ${s.date}`);
        if (s.memorizationMeta && s.memorizationMeta[0]) {
          logger.trace(`     memorizationMeta[0]: surah ${s.memorizationMeta[0].surahNumber} - ${s.memorizationMeta[0].surahNameCanonical}`);
        }
      });
    }

    // 4. Get all marks for this student
    const marks = await Mark.find({ studentId })
      .populate('sectionId')
      .lean();

    logger.debug(`Found ${marks.length} marks`);

    // Create marks map for quick lookup
    const marksMap = new Map();
    marks.forEach(mark => {
      if (mark.sectionId) {
        marksMap.set(mark.sectionId._id.toString(), mark);
      }
    });

    // 5. Process sections and group by Surah
    const surahMap = new Map();

    sections.forEach(section => {
      // Process memorization segments
      if (section.memorizationMeta && section.memorizationMeta.length > 0) {
        section.memorizationMeta.forEach(segment => {
          processSurahSegment(
            surahMap,
            segment,
            'memorization',
            section,
            marksMap.get(section._id.toString())
          );
        });
      }

      // Process review segments
      if (section.reviewMeta && section.reviewMeta.length > 0) {
        section.reviewMeta.forEach(segment => {
          processSurahSegment(
            surahMap,
            segment,
            'review',
            section,
            marksMap.get(section._id.toString())
          );
        });
      }
    });

    // 6. Convert map to array and calculate progress
    const groupedSurahs = Array.from(surahMap.values())
      .map(surah => {
        // ✅ FIX: Group segments by DATE to count "sessions" instead of sectionId
        // إذا كان هناك حفظ ومراجعة في نفس التاريخ، يُحسبان كجلسة واحدة
        const sessionsMap = new Map();
        
        // Ranges to check "Completed" status (intervals logic)
        const coveredAyahs = new Set();
        
        surah.segments.forEach(seg => {
          // ✅ استخدام التاريخ كمفتاح بدلاً من sectionId
          const dateKey = seg.sectionDate 
            ? new Date(seg.sectionDate).toISOString().split('T')[0] 
            : seg.sectionId.toString(); // fallback to sectionId if no date
          
          if (!sessionsMap.has(dateKey)) {
            sessionsMap.set(dateKey, {
                dateKey: dateKey,
                sectionIds: [seg.sectionId],
                sectionDate: seg.sectionDate,
                hasMemorization: false,
                hasReview: false,
                marks: [], 
                types: []
            });
          } else {
            // إضافة sectionId إذا كان مختلفاً
            const session = sessionsMap.get(dateKey);
            if (!session.sectionIds.some(id => id.toString() === seg.sectionId.toString())) {
              session.sectionIds.push(seg.sectionId);
            }
          }
          
          const session = sessionsMap.get(dateKey);
          if (seg.type === 'memorization') {
              session.hasMemorization = true;
              session.types.push('memorization');
          }
          if (seg.type === 'review') {
              session.hasReview = true;
              session.types.push('review');
          }
          
          // تجميع العلامات
          if (seg.mark) {
            session.marks.push(seg.mark);
          }
          
          // Add range to covered set
          for(let i = seg.ayahStart; i <= seg.ayahEnd; i++) {
              coveredAyahs.add(i);
          }
        });

        // 1. Calculate Status based on FULL Coverage
        // A surah is completed if size of coveredAyahs == totalAyahs (assuming 1 to Total)
        // and Surah has totalAyahs > 0
        const isFullyConstructed = (surah.surahAyahCount > 0 && coveredAyahs.size >= surah.surahAyahCount);
        
        // 2. Counts - ✅ تصحيح: استخدام sessionsMap بدلاً من visitsMap
        const totalSegments = sessionsMap.size; // عدد الجلسات (التواريخ الفريدة)
        
        // ✅ FIX: Completed Segments = Sessions where ALL required marks are present
        // الجلسة مكتملة إذا كانت العلامات المطلوبة موجودة بناءً على نوع المقطع
        const completedSegments = Array.from(sessionsMap.values()).filter(session => {
          // جمع كل العلامات الموجودة في الجلسة
          const hasMemMark = session.marks.some(m => m.memorizationMark && m.memorizationMark > 0);
          const hasRevMark = session.marks.some(m => m.reviewMark && m.reviewMark > 0);
          
          // التحقق بناءً على ما هو موجود في الجلسة:
          // - إذا كانت الجلسة فيها حفظ ومراجعة → يجب أن تكون كلا العلامتين موجودتين
          // - إذا كانت الجلسة فيها حفظ فقط → يجب أن تكون علامة الحفظ موجودة
          // - إذا كانت الجلسة فيها مراجعة فقط → يجب أن تكون علامة المراجعة موجودة
          if (session.hasMemorization && session.hasReview) {
            return hasMemMark && hasRevMark; // يجب كلاهما
          } else if (session.hasMemorization) {
            return hasMemMark; // يجب حفظ فقط
          } else if (session.hasReview) {
            return hasRevMark; // يجب مراجعة فقط
          }
          return false;
        }).length;

        // 3. Average Mark - ✅ تصحيح: استخدام sessionsMap مع نفس منطق الجلسات المكتملة
        const sessions = Array.from(sessionsMap.values());
        // ✅ FIX: استخدام نفس منطق التحقق من الجلسات المكتملة
        const markedSessions = sessions.filter(session => {
          const hasMemMark = session.marks.some(m => m.memorizationMark && m.memorizationMark > 0);
          const hasRevMark = session.marks.some(m => m.reviewMark && m.reviewMark > 0);
          
          if (session.hasMemorization && session.hasReview) {
            return hasMemMark && hasRevMark;
          } else if (session.hasMemorization) {
            return hasMemMark;
          } else if (session.hasReview) {
            return hasRevMark;
          }
          return false;
        });
        
        // ✅ معدل الجلسات = مجموع العلامات / عدد العلامات (من 10)
        let averageMark = 0;
        if (completedSegments > 0) {
          let totalAllMarks = 0;
          let totalMarkCount = 0; // عدد العلامات الفعلية
          
          markedSessions.forEach(session => {
            session.marks.forEach(m => {
              if (session.hasMemorization && m.memorizationMark && m.memorizationMark > 0) {
                totalAllMarks += m.memorizationMark;
                totalMarkCount++;
              }
              if (session.hasReview && m.reviewMark && m.reviewMark > 0) {
                totalAllMarks += m.reviewMark;
                totalMarkCount++;
              }
            });
          });
          
          // المعادلة: مجموع العلامات / عدد العلامات = معدل من 10
          if (totalMarkCount > 0) {
            averageMark = Math.round((totalAllMarks / totalMarkCount) * 10) / 10;
          }
        }

        // 4. Progress Percentage
        // If completed (fully covered) -> 100%
        // Else -> (Max Covered Ayah / Total) ? Or (Unique Covered Count / Total)?
        // User said: "calculate percentage according to [last segment you reached]"
        // So we strictly find the Max Ayah End.
        let maxReachedAyah = 0;
        surah.segments.forEach(s => {
            if (s.ayahEnd > maxReachedAyah) maxReachedAyah = s.ayahEnd;
        });
        
        let progressPercentage = 0;
        if (surah.surahAyahCount > 0) {
            progressPercentage = Math.min(100, Math.round((maxReachedAyah / surah.surahAyahCount) * 100));
        }
        
        // Force 100% if isFullyConstructed (Status override logic)
        if (isFullyConstructed) progressPercentage = 100;

        // ✅ حالتين فقط: مكتمل أو قيد الإكمال (السورة تظهر فقط إذا بدأ بها الطالب)
        let status = 'in_progress'; // الافتراضي: قيد الإكمال
        if (isFullyConstructed) status = 'completed';

        return {
          ...surah,
          totalSegments,
          completedSegments,
          progressPercentage,
          averageMark,
          status, // 'completed' only if fully covered
          segments: surah.segments 
        };
      })
      .sort((a, b) => a.surahNumber - b.surahNumber); // Sort by Surah number

    logger.success(`Grouped into ${groupedSurahs.length} Surahs`);

    sendSuccess(res, {
      student: {
        id: studentId,
        group: student.group,
        groupId: student.groupId
      },
      surahs: groupedSurahs,
      summary: {
        totalSurahs: groupedSurahs.length,
        completedSurahs: groupedSurahs.filter(s => s.status === 'completed').length,
        inProgressSurahs: groupedSurahs.filter(s => s.status === 'in_progress').length,
        notStartedSurahs: groupedSurahs.filter(s => s.status === 'not_started').length,
        totalSegments: groupedSurahs.reduce((sum, s) => sum + s.totalSegments, 0),
        completedSegments: groupedSurahs.reduce((sum, s) => sum + s.completedSegments, 0),
        // ✅ FIX: نسبة التقدم = (عدد السور المكتملة / عدد السور الكلي) * 100
        progressPercent: groupedSurahs.length > 0 
          ? Math.round((groupedSurahs.filter(s => s.status === 'completed').length / groupedSurahs.length) * 100)
          : 0
      }
    }, "تم جلب المقاطع المجمعة بنجاح");

  } catch (error) {
    logger.error("Error fetching grouped sections:", error);
    sendError(res, error.message, 500, error);
  }
};

/**
 * Helper function to process surah segment
 */
function processSurahSegment(surahMap, segment, type, section, mark) {
  const surahNumber = segment.surahNumber;
  // استخدام getSurahByNumber للحصول على بيانات السورة الصحيحة
  const surahInfo = getSurahByNumber(surahNumber) || {
    number: surahNumber,
    name: segment.surahNameCanonical || `سورة ${surahNumber}`,
    ayahCount: segment.surahAyahCount || 0
  };

  // Get or create surah entry
  if (!surahMap.has(surahNumber)) {
    surahMap.set(surahNumber, {
      surahNumber,
      surahName: surahInfo.name,
      surahAyahCount: surahInfo.ayahCount,
      segments: []
    });
  }

  const surahEntry = surahMap.get(surahNumber);

  // Add segment with its details
  surahEntry.segments.push({
    segmentId: segment._id,
    sectionId: section._id,
    sectionDate: section.date,
    type, // 'memorization' or 'review'
    ayahStart: segment.ayahStart,
    ayahEnd: segment.ayahEnd,
    canonicalKey: segment.canonicalKey,
    status: segment.status,
    mark: mark ? {
      memorizationMark: mark.memorizationMark,
      reviewMark: mark.reviewMark,
      _id: mark._id
    } : null,
    sectionInfo: {
      group: section.group,
      teacher: section.teacher,
      marksStatus: section.marksStatus
    }
  });
}
