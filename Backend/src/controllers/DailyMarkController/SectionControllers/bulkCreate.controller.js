const Section = require("../../../schema/DailyMark/Section");
const Group = require("../../../schema/Group");
const { sendSuccess, sendError } = require("../utils/responseHelpers");
const mongoose = require("mongoose");
const { toDateKey, getWeekKey, addDays } = require("../../../config/timezone");
const { createLogger } = require("../../../utils/logger");
const { getSurahByNumber } = require("../../../utils/Quran/dailyMarkQuranMetadata");

const logger = createLogger('BulkCreate');

/**
 * 🚀 SMART BULK CREATE - مع احترام الترتيب الزمني
 * 
 * القواعد:
 * 1. الحصة اليومية: 1 مقطع/يوم
 * 2. الحصة الأسبوعية: 3 مقاطع/أسبوع
 * 3. الترتيب الزمني: آيات أقدم = تاريخ أقدم
 * 4. عدم التداخل
 */
exports.bulkCreateSections = async (req, res) => {
  try {
    const { sections, groupId } = req.body;

    logger.info("BULK CREATE REQUEST");
    logger.debug(`Received:`, JSON.stringify({ sectionsCount: sections?.length, groupId }, null, 2));

    if (!sections || !Array.isArray(sections) || sections.length === 0) {
      logger.warn("No sections provided");
      return sendError(res, "يجب توفير قائمة بالمقاطع المراد إنشائها", 400);
    }

    if (!groupId) {
      logger.warn("No groupId provided");
      return sendError(res, "يجب تحديد معرّف الحلقة", 400);
    }

    // العثور على الحلقة
    let group;
    if (mongoose.Types.ObjectId.isValid(groupId)) {
      group = await Group.findById(groupId);
    }
    if (!group) {
      group = await Group.findOne({ name: groupId });
    }
    if (!group) {
      logger.warn(`Group not found: ${groupId}`);
      return sendError(res, "الحلقة غير موجودة", 404);
    }

    // التحقق من وجود memorizationMeta
    if (!sections[0].memorizationMeta || !sections[0].memorizationMeta[0]) {
      logger.warn("Invalid section structure", sections[0]);
      return sendError(res, "بنية المقطع غير صحيحة", 400);
    }

    const surahNumber = sections[0].memorizationMeta[0].surahNumber;
    const WEEKLY_LIMIT = 3;

    logger.debug(`Surah: ${surahNumber}, Group: ${group.name}`);
    logger.debug(`Sections needed: ${sections.length}`);

    // ============================================
    // 🔒 ACTIVE SURAH VALIDATION - التحقق من السورة الفعالة
    // ============================================
    const canAdd = await Group.canAddSegment(group._id, surahNumber, 'memorization');
    if (!canAdd.allowed) {
      logger.warn("Active Surah Check failed:", canAdd.reason);
      return sendError(res, canAdd.reason, 400);
    }
    // ============================================

    // ======================================================
    // الخطوة 1: جلب المقاطع الموجودة للسورة مرتبة بالآية
    // ======================================================
    const existingSurahSections = await Section.find({
      group: group._id,
      'memorizationMeta.surahNumber': surahNumber
    }).sort({ 'memorizationMeta.ayahStart': 1 }).lean();

    const existingRanges = existingSurahSections.map(s => {
      const meta = s.memorizationMeta.find(m => m.surahNumber === surahNumber);
      return {
        ayahStart: meta.ayahStart,
        ayahEnd: meta.ayahEnd,
        date: new Date(s.date),
        dateKey: s.dateKey,
        isExisting: true
      };
    }).sort((a, b) => a.ayahStart - b.ayahStart);

    logger.debug(`Existing surah sections: ${existingRanges.length}`);
    existingRanges.forEach(r => logger.trace(`   (٠${r.ayahStart}-${r.ayahEnd}) → ${r.dateKey}`));

    // ======================================================
    // الخطوة 2: جلب كل التواريخ المحجوزة للحلقة
    // ======================================================
    const allGroupSections = await Section.find({ group: group._id })
      .select('dateKey date')
      .lean();

    const occupiedDateKeys = new Set(allGroupSections.map(s => s.dateKey));

    // حساب استخدام كل أسبوع
    const weeklyUsage = {};
    for (const sec of allGroupSections) {
      const weekKey = getWeekKey(sec.date);
      weeklyUsage[weekKey] = (weeklyUsage[weekKey] || 0) + 1;
    }

    // ======================================================
    // الخطوة 3: تصفية وترتيب المقاطع الجديدة
    // ======================================================
    const validSections = sections.filter(s => {
      const meta = s.memorizationMeta[0];
      const hasOverlap = existingRanges.some(ex => 
        ex.ayahStart <= meta.ayahEnd && ex.ayahEnd >= meta.ayahStart
      );
      if (hasOverlap) {
        logger.debug(`Skipping overlap: ${meta.ayahStart}-${meta.ayahEnd}`);
      }
      return !hasOverlap;
    });

    if (validSections.length === 0) {
      // جميع المقاطع موجودة أصلاً - هذا نجاح وليس خطأ!
      logger.info("All sections already exist - nothing to create");
      return sendSuccess(res, {
        created: 0,
        total: sections.length,
        skipped: sections.length,
        sections: [],
        message: 'جميع المقاطع موجودة مسبقاً'
      }, 'جميع المقاطع المطلوبة موجودة مسبقاً - لا حاجة للإنشاء');
    }

    // ترتيب حسب الآية
    validSections.sort((a, b) => 
      a.memorizationMeta[0].ayahStart - b.memorizationMeta[0].ayahStart
    );

    logger.debug(`Valid new sections: ${validSections.length}`);

    // ======================================================
    // الخطوة 4: دمج كل المقاطع وترتيبها
    // ======================================================
    const allRanges = [
      ...existingRanges,
      ...validSections.map(s => ({
        ayahStart: s.memorizationMeta[0].ayahStart,
        ayahEnd: s.memorizationMeta[0].ayahEnd,
        surahName: s.memorizationMeta[0].surahName,
        isExisting: false,
        date: null,
        dateKey: null
      }))
    ].sort((a, b) => a.ayahStart - b.ayahStart);

    logger.trace(`Merged ranges (sorted by ayah):`);
    allRanges.forEach((r, i) => {
      logger.trace(`   ${i+1}. (${r.ayahStart}-${r.ayahEnd}) ${r.isExisting ? '✓ ' + r.dateKey : '○ NEW'}`);
    });

    // ======================================================
    // الخطوة 5: تحديد النطاق الزمني لكل مقطع جديد
    // ======================================================
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = addDays(today, 1);

    // تتبع التواريخ والأسابيع المستخدمة في هذا الطلب
    const tempOccupied = new Set(occupiedDateKeys);
    const tempWeeklyUsage = { ...weeklyUsage };

    const createdSections = [];
    const errors = [];

    logger.debug("Finding dates with ordering constraint...");

    for (let i = 0; i < allRanges.length; i++) {
      const range = allRanges[i];
      
      if (range.isExisting) continue; // تخطي الموجود

      // تحديد الحدود الزمنية
      // الحد الأدنى: بعد المقطع السابق (أو غداً)
      let minDate = new Date(tomorrow);
      for (let j = i - 1; j >= 0; j--) {
        if (allRanges[j].date) {
          minDate = addDays(allRanges[j].date, 1);
          break;
        }
      }
      if (minDate < tomorrow) minDate = new Date(tomorrow);

      // الحد الأقصى: قبل المقطع اللاحق (أو 3 أشهر)
      let maxDate = addDays(today, 90);
      for (let j = i + 1; j < allRanges.length; j++) {
        if (allRanges[j].date) {
          maxDate = addDays(allRanges[j].date, -1);
          break;
        }
      }

      logger.trace(`   (${range.ayahStart}-${range.ayahEnd})`);
      logger.trace(`      Range: ${toDateKey(minDate)} → ${toDateKey(maxDate)}`);

      // البحث عن تاريخ متاح ضمن النطاق
      let foundDate = null;
      let candidateDate = new Date(minDate);
      let attempts = 0;

      while (candidateDate <= maxDate && attempts < 90) {
        const candidateDateKey = toDateKey(candidateDate);
        const weekKey = getWeekKey(candidateDate);

        const isDateFree = !tempOccupied.has(candidateDateKey);
        const currentWeekUsage = tempWeeklyUsage[weekKey] || 0;
        const isWeekFree = currentWeekUsage < WEEKLY_LIMIT;

        if (isDateFree && isWeekFree) {
          foundDate = {
            date: new Date(candidateDate),
            dateKey: candidateDateKey,
            weekKey: weekKey
          };
          
          // تحديث التتبع
          tempOccupied.add(candidateDateKey);
          tempWeeklyUsage[weekKey] = currentWeekUsage + 1;
          
          // تحديث range للمقاطع التالية
          range.date = foundDate.date;
          range.dateKey = foundDate.dateKey;
          
          logger.debug(`      Found: ${candidateDateKey} (Week ${weekKey}: ${currentWeekUsage + 1}/${WEEKLY_LIMIT})`);
          break;
        }

        candidateDate = addDays(candidateDate, 1);
        attempts++;
      }

      if (!foundDate) {
        logger.warn(`      No date available in range!`);
        errors.push({
          section: `${range.surahName} (${range.ayahStart}-${range.ayahEnd})`,
          error: `لا يوجد تاريخ متاح بين ${toDateKey(minDate)} و ${toDateKey(maxDate)}`
        });
        continue;
      }

      // إنشاء المقطع
      try {
        const sectionDoc = {
          date: foundDate.date,
          dateKey: foundDate.dateKey,
          group: group._id,
          memorizationMeta: [{
            surahNumber: surahNumber,
            surahNameCanonical: range.surahName,
            ayahStart: range.ayahStart,
            ayahEnd: range.ayahEnd,
            canonicalKey: `${surahNumber}:${range.ayahStart}-${range.ayahEnd}`,
            status: 'not_started'
          }],
          memorizationSection: `${range.surahName} (${range.ayahStart}-${range.ayahEnd})`,
          reviewMeta: [],
          reviewSection: ''
        };

        const newSection = await Section.create(sectionDoc);
        createdSections.push(newSection);

      } catch (err) {
        logger.error(`      Error:`, err.message);
        errors.push({
          section: `${range.surahName} (${range.ayahStart}-${range.ayahEnd})`,
          error: err.message
        });
      }
    }

    // حساب المقاطع المتخطاة (الموجودة أصلاً)
    const skippedCount = sections.length - validSections.length;

    // ============================================
    // 🔄 UPDATE ACTIVE SURAH - تحديث السورة الفعالة بعد الإنشاء الجماعي
    // ============================================
    if (createdSections.length > 0) {
      const surahInfo = getSurahByNumber(surahNumber);
      const totalAyahs = surahInfo?.ayahCount || 0;
      
      // حساب آخر آية تم الوصول إليها (من جميع المقاطع المنشأة + الموجودة)
      let maxAyahEnd = 0;
      for (const range of allRanges) {
        if (range.ayahEnd > maxAyahEnd) {
          maxAyahEnd = range.ayahEnd;
        }
      }
      
      // التحقق من السورة الفعالة
      const activeSurahs = await Group.getActiveSurahs(group._id);
      
      if (!activeSurahs?.memorization?.surahNumber || activeSurahs.memorization.isCompleted) {
        // تفعيل سورة جديدة
        await Group.activateSurah(
          group._id,
          surahNumber,
          surahInfo?.name || `سورة ${surahNumber}`,
          maxAyahEnd,
          'memorization'
        );
      } else {
        // تحديث آخر آية
        await Group.updateLastAyah(group._id, maxAyahEnd, 'memorization');
      }
      
      // ✅ التحقق من إكمال السورة تلقائياً
      if (totalAyahs > 0 && maxAyahEnd >= totalAyahs) {
        await Group.checkAndCompleteSurah(group._id, maxAyahEnd, totalAyahs, 'memorization');
        logger.info(`🎉 سورة ${surahInfo?.name} مكتملة الحفظ! (${maxAyahEnd}/${totalAyahs})`);
      }
    }
    // ============================================

    logger.info("BULK CREATE RESULT");
    logger.success(`Created: ${createdSections.length}`);
    logger.debug(`Skipped: ${skippedCount}`);
    if (errors.length > 0) logger.warn(`Errors: ${errors.length}`);

    if (createdSections.length === 0 && errors.length > 0) {
      return sendError(res, `فشل إنشاء جميع المقاطع: ${errors.map(e => e.error).join(', ')}`, 400);
    }

    return sendSuccess(res, {
      created: createdSections.length,
      skipped: skippedCount,
      total: sections.length,
      sections: createdSections,
      errors: errors.length > 0 ? errors : undefined
    }, `تم إنشاء ${createdSections.length} من ${sections.length} مقطع بنجاح${skippedCount > 0 ? ` (تم تخطي ${skippedCount} مقطع موجود)` : ''}`);

  } catch (err) {
    logger.error("Bulk create error:", err);
    return sendError(res, err.message, 500);
  }
};
