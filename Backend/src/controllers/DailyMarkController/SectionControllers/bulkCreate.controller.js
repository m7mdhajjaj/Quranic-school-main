const Section = require("../../../schema/DailyMark/Section");
const Group = require("../../../schema/Group");
const { sendSuccess, sendError } = require("../utils/responseHelpers");
const mongoose = require("mongoose");

/**
 * Helper: توليد dateKey من تاريخ
 */
function toDateKeyUTC(date) {
  const dt = new Date(date);
  const y = dt.getUTCFullYear();
  const m = String(dt.getUTCMonth() + 1).padStart(2, "0");
  const day = String(dt.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/**
 * Helper: إضافة أيام لتاريخ
 */
function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Helper: حساب رقم الأسبوع لتاريخ معين
 */
function getWeekKey(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const startOfYear = new Date(d.getFullYear(), 0, 1);
  const dayOfYear = Math.floor((d - startOfYear) / (24 * 60 * 60 * 1000));
  const weekNumber = Math.ceil((dayOfYear + startOfYear.getDay() + 1) / 7);
  return `${d.getFullYear()}-W${weekNumber}`;
}

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

    console.log(`\n🚀 ========== BULK CREATE REQUEST ==========`);
    console.log(`📦 Received:`, JSON.stringify({ sectionsCount: sections?.length, groupId }, null, 2));

    if (!sections || !Array.isArray(sections) || sections.length === 0) {
      console.log(`❌ Error: No sections provided`);
      return sendError(res, "يجب توفير قائمة بالمقاطع المراد إنشائها", 400);
    }

    if (!groupId) {
      console.log(`❌ Error: No groupId provided`);
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
      console.log(`❌ Error: Group not found: ${groupId}`);
      return sendError(res, "الحلقة غير موجودة", 404);
    }

    // التحقق من وجود memorizationMeta
    if (!sections[0].memorizationMeta || !sections[0].memorizationMeta[0]) {
      console.log(`❌ Error: Invalid section structure`, sections[0]);
      return sendError(res, "بنية المقطع غير صحيحة", 400);
    }

    const surahNumber = sections[0].memorizationMeta[0].surahNumber;
    const WEEKLY_LIMIT = 3;

    console.log(`📖 Surah: ${surahNumber}, Group: ${group.name}`);
    console.log(`📦 Sections needed: ${sections.length}`);

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

    console.log(`📚 Existing surah sections: ${existingRanges.length}`);
    existingRanges.forEach(r => console.log(`   📌 (${r.ayahStart}-${r.ayahEnd}) → ${r.dateKey}`));

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
        console.log(`⚠️ Skipping overlap: ${meta.ayahStart}-${meta.ayahEnd}`);
      }
      return !hasOverlap;
    });

    if (validSections.length === 0) {
      // جميع المقاطع موجودة أصلاً - هذا نجاح وليس خطأ!
      console.log(`✅ All sections already exist - nothing to create`);
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

    console.log(`✅ Valid new sections: ${validSections.length}`);

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

    console.log(`\n📊 Merged ranges (sorted by ayah):`);
    allRanges.forEach((r, i) => {
      console.log(`   ${i+1}. (${r.ayahStart}-${r.ayahEnd}) ${r.isExisting ? '✓ ' + r.dateKey : '◯ NEW'}`);
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

    console.log(`\n🔍 Finding dates with ordering constraint...`);

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

      console.log(`\n   📌 (${range.ayahStart}-${range.ayahEnd})`);
      console.log(`      Range: ${toDateKeyUTC(minDate)} → ${toDateKeyUTC(maxDate)}`);

      // البحث عن تاريخ متاح ضمن النطاق
      let foundDate = null;
      let candidateDate = new Date(minDate);
      let attempts = 0;

      while (candidateDate <= maxDate && attempts < 90) {
        const candidateDateKey = toDateKeyUTC(candidateDate);
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
          
          console.log(`      ✅ Found: ${candidateDateKey} (Week ${weekKey}: ${currentWeekUsage + 1}/${WEEKLY_LIMIT})`);
          break;
        }

        candidateDate = addDays(candidateDate, 1);
        attempts++;
      }

      if (!foundDate) {
        console.log(`      ❌ No date available in range!`);
        errors.push({
          section: `${range.surahName} (${range.ayahStart}-${range.ayahEnd})`,
          error: `لا يوجد تاريخ متاح بين ${toDateKeyUTC(minDate)} و ${toDateKeyUTC(maxDate)}`
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
        console.error(`      ❌ Error:`, err.message);
        errors.push({
          section: `${range.surahName} (${range.ayahStart}-${range.ayahEnd})`,
          error: err.message
        });
      }
    }

    // حساب المقاطع المتخطاة (الموجودة أصلاً)
    const skippedCount = sections.length - validSections.length;

    console.log(`\n📊 ========== RESULT ==========`);
    console.log(`✅ Created: ${createdSections.length}`);
    console.log(`⏭️ Skipped: ${skippedCount}`);
    console.log(`❌ Errors: ${errors.length}`);
    console.log(`================================\n`);

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
    console.error("❌ Bulk create error:", err);
    return sendError(res, err.message, 500);
  }
};
