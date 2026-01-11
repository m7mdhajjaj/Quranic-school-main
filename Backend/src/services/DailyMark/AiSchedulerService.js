const Section = require("../../schema/DailyMark/Section");
const sequenceService = require("./SectionSequenceService"); // To re-use the strict validation logic

/**
 * ============================================================================
 * AI Scheduler Service (The Healer)
 * ============================================================================
 * خدمة ذكية لإصلاح فجوات الحفظ وترميم التسلسل الزمني دون كسر القواعد الصارمة.
 * 
 * المبدأ: "املأ الفراغ ولا تحرك الثابت"
 * 
 * الخوارزمية:
 * 1. جمع كل مقاطع الحفظ لسورة معينة وترتيبها زمنياً.
 * 2. اكتشاف الفجوات (Gaps) بين المقاطع.
 * 3. إنشاء "مقاطع تعويضية" للفجوات بتواريخ ذكية (مشتقة من المقطع اللاحق).
 * 4. التحقق من صحة المقاطع الجديدة عبر SectionSequenceService.
 */

class AiSchedulerService {

  /**
   * الوظيفة الرئيسية: إصلاح تسلسل سورة معينة أو جميع السور لحلقة محددة
   * @param {string} groupId - معرف الحلقة
   * @param {number|undefined} surahNumber - رقم السورة (اختياري)
   * @returns {Promise<{ repaired: boolean, actions: Array, message: string, stats?: any }>}
   */
  async repairSequence(groupId, surahNumber) {
    if (!surahNumber) {
        return this.repairAllSequences(groupId);
    }
    return this.repairSingleSequence(groupId, surahNumber);
  }

  /**
   * إصلاح جميع السور التي لها سجلات في الحلقة
   */
  async repairAllSequences(groupId) {
      // جلب جميع أرقام السور الموجودة في السجلات (حفظ أو مراجعة)
      const memSurahs = await Section.distinct("memorizationMeta.surahNumber", { group: groupId });
      const revSurahs = await Section.distinct("reviewMeta.surahNumber", { group: groupId });
      
      // دمج وتوحيد الأرقام
      const allSurahs = [...new Set([...memSurahs, ...revSurahs])].sort((a, b) => a - b);
      
      let totalStats = { gapsFixed: 0, orphansFixed: 0 };
      let allActions = [];

      console.log(`🤖 AI Scheduler: Starting full repair for group ${groupId} on ${allSurahs.length} surahs.`);

      for (const surah of allSurahs) {
          try {
            const result = await this.repairSingleSequence(groupId, surah);
            if (result.repaired && result.stats) {
                totalStats.gapsFixed += result.stats.gapsFixed;
                totalStats.orphansFixed += result.stats.orphansFixed;
                allActions.push(...result.actions);
            }
          } catch (err) {
              console.error(`Error repairing surah ${surah}:`, err);
          }
      }

      const repaired = totalStats.gapsFixed > 0 || totalStats.orphansFixed > 0;
      return {
          repaired,
          stats: totalStats,
          actions: allActions,
          message: repaired 
            ? `تمت الصيانة الشاملة بنجاح: تم إصلاح ${totalStats.gapsFixed} فجوة و ${totalStats.orphansFixed} مراجعة يتيمة في ${allSurahs.length} سورة.`
            : `الفحص الشامل سليم: تم فحص ${allSurahs.length} سورة ولم توجد أي مشاكل.`
      };
  }

  /**
   * إصلاح سورة واحدة محددة
   */
  async repairSingleSequence(groupId, surahNumber) {
    // 1. جلب التاريخ الكامل للسورة (History)
    const history = await Section.find({
      group: groupId,
      "memorizationMeta.surahNumber": surahNumber
    })
    .sort({ date: 1 }) // الأقدم إلى الأحدث
    .lean();

    // --- المرحلة 1: جمع البيانات (حفظ ومراجعة) ---
    let memSegments = [];
    let reviewSegments = [];

    // نحن بحاجة لجلب المراجعات أيضاً (التي قد تكون "يتيمة" بلا حفظ)
    const reviewHistory = await Section.find({
        group: groupId,
        "reviewMeta.surahNumber": surahNumber
    }).lean();

    // تجميع الحفظ
    if (history) {
        history.forEach(doc => {
            const mems = doc.memorizationMeta.filter(m => m.surahNumber === surahNumber);
            mems.forEach(m => {
                memSegments.push({
                    ...m,
                    originalDate: doc.date,
                    originalSectionId: doc._id
                });
            });
        });
    }

    // تجميع المراجعة
    if (reviewHistory) {
         reviewHistory.forEach(doc => {
             const revs = doc.reviewMeta.filter(r => r.surahNumber === surahNumber);
             revs.forEach(r => {
                 reviewSegments.push({
                     ...r,
                     originalDate: doc.date,
                     originalSectionId: doc._id
                 });
             });
         });
    }

    // ترتيب مقاطع الحفظ
    memSegments.sort((a, b) => a.ayahStart - b.ayahStart);

    // --- المرحلة 2: كشف الفجوات في الحفظ (Memorization Gaps) ---
    let repairsNeeded = [];
    let expectedStart = 1;

    for (let i = 0; i < memSegments.length; i++) {
        const current = memSegments[i];

        // هل هناك فجوة قبل هذا المقطع؟
        if (current.ayahStart > expectedStart) {
            const gapStart = expectedStart;
            const gapEnd = current.ayahStart - 1;
            
            const fixDate = current.originalDate;

            repairsNeeded.push({
                type: 'gap_fill',
                surahNumber: surahNumber,
                ayahStart: gapStart,
                ayahEnd: gapEnd,
                targetDate: fixDate,
                referenceSectionId: current.originalSectionId
            });
        }
        expectedStart = Math.max(expectedStart, current.ayahEnd + 1);
    }

    // --- المرحلة 3: كشف المراجعات اليتيمة (Orphan Reviews) ---
    for (const rev of reviewSegments) {
        // هل يوجد حفظ يغطي هذا المراجعة تماماً؟
        const hasParent = memSegments.some(m => 
            m.ayahStart === rev.ayahStart && 
            m.ayahEnd === rev.ayahEnd
        );

        if (!hasParent) {
            // يتيمة!
            repairsNeeded.push({
                type: 'orphan_fix',
                surahNumber: surahNumber,
                ayahStart: rev.ayahStart,
                ayahEnd: rev.ayahEnd,
                targetDate: rev.originalDate,
                referenceSectionId: rev.originalSectionId
            });
            
            // إضافة للتفادي
            memSegments.push({
                ayahStart: rev.ayahStart,
                ayahEnd: rev.ayahEnd
            });
        }
    }

    if (repairsNeeded.length === 0) {
        return { repaired: false, message: "السلسلة سليمة تماماً، لا توجد فجوات ولا مراجعات يتيمة." };
    }

    // --- المرحلة 4: التنفيذ (Execution Phase) ---
    let actionsTaken = [];
    let gapsFixed = 0;
    let orphansFixed = 0;
    
    for (const repair of repairsNeeded) {
        const rangeKey = `${surahNumber}:${repair.ayahStart}-${repair.ayahEnd}`;
        let autoNote = "";

        if (repair.type === 'gap_fill') {
            autoNote = `تم ترميم الفجوة تلقائياً (${rangeKey})`;
            gapsFixed++;
        } else {
            autoNote = `تم إنشاء أصل حفظ للمراجعة اليتيمة (${rangeKey})`;
            orphansFixed++;
        }

        // التحقق (Validation)
        const validation = await sequenceService.validateSequence(
            [{ surahNumber, ayahStart: repair.ayahStart, ayahEnd: repair.ayahEnd, canonicalKey: rangeKey }],
            groupId,
            'memorization',
            repair.targetDate,
            null, 
            [] 
        );

        if (!validation.isValid) {
            console.warn(`⚠️ AiScheduler skipped repair for ${rangeKey}: ${validation.message}`);
            actionsTaken.push(`فشل إصلاح ${rangeKey}: ${validation.message}`);
            continue; 
        }

        const newSegment = {
            surahNumber: repair.surahNumber,
            surahNameCanonical: "", 
            ayahStart: repair.ayahStart,
            ayahEnd: repair.ayahEnd,
            canonicalKey: rangeKey,
            status: 'completed',
            completionNote: autoNote
        };

        await Section.findByIdAndUpdate(repair.referenceSectionId, {
            $push: { memorizationMeta: newSegment }
        });

        actionsTaken.push(`${autoNote}`);
    }

    return {
        repaired: true,
        actions: actionsTaken,
        stats: { gapsFixed, orphansFixed },
        message: `تمت عملية الإصلاح بنجاح. تم معالجة ${actionsTaken.length} مشكلة.`
    };
  }
}

module.exports = new AiSchedulerService();
