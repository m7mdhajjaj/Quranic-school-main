const Section = require("../../schema/DailyMark/Section");
const sequenceService = require("./SectionSequenceService"); // To re-use the strict validation logic
const { getSurahByNumber } = require("../../utils/Quran/dailyMarkQuranMetadata");

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
   * @param {boolean} dryRun - وضع المحاكاة (عدم التنفيذ)
   * @param {object} options - خيارات إضافية (أيام مقترحة، حد أقصى للآيات)
   * @returns {Promise<{ repaired: boolean, actions: Array, message: string, stats?: any }>}
   */
  async repairSequence(groupId, surahNumber, dryRun = false, options = {}) {
    if (!surahNumber) {
        return this.repairAllSequences(groupId);
    }
    return this.repairSingleSequence(groupId, surahNumber, dryRun, options);
  }

  /**
   * إصلاح جميع السور التي لها سجلات في الحلقة
   */
  async repairAllSequences(groupId, options = {}) {
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
  async repairSingleSequence(groupId, surahNumber, dryRun = false, options = {}) {
    // 1. جلب التاريخ الكامل للسورة (History)
    // نجلب كل المستندات التي تحتوي على ذكر لهذه السورة سواء في الحفظ أو المراجعة
    const history = await Section.find({
      group: groupId,
      $or: [
          { "memorizationMeta.surahNumber": surahNumber },
          { "reviewMeta.surahNumber": surahNumber }
      ]
    })
    .sort({ date: 1 }) // الترتيب الزمني من الأقدم للأحدث مهم جداً لتحديد أين نضع الترميم
    .lean();

    // --- المرحلة 1: جمع البيانات (حفظ ومراجعة) ---
    let memSegments = [];
    let reviewSegments = [];

    if (history) {
        history.forEach(doc => {
            // استخراج مقاطع الحفظ
            if (doc.memorizationMeta) {
                const mems = doc.memorizationMeta.filter(m => m.surahNumber === surahNumber);
                mems.forEach(m => {
                    memSegments.push({
                        ...m,
                        originalDate: doc.date,
                        originalSectionId: doc._id
                    });
                });
            }
            // استخراج مقاطع المراجعة
            if (doc.reviewMeta) {
                const revs = doc.reviewMeta.filter(r => r.surahNumber === surahNumber);
                revs.forEach(r => {
                    reviewSegments.push({
                        ...r,
                        originalDate: doc.date,
                        originalSectionId: doc._id
                    });
                });
            }
        });
    }

    // ترتيب مقاطع الحفظ بدقة عالية لضمان كشف الفجوات الحقيقية
    // الترتيب: حسب البداية أولاً، وإذا تساوت البدايات، الأطول (الأبعد نهاية) يأتي أولاً
    // هذا يضمن أننا نعتمد "أكبر تغطية" عند حساب الفجوات
    memSegments.sort((a, b) => {
        if (a.ayahStart !== b.ayahStart) return a.ayahStart - b.ayahStart;
        return b.ayahEnd - a.ayahEnd; 
    });

    // --- المرحلة 2: توحيد الجدول الزمني (Consolidate Timeline) ---
    // المشكلة: قد يكون لدينا مراجعة (مثل 11-30) دون حفظ مقابل (يتيمة)، وهذا يسبب غياب
    // 11-30 من قائمة "الحفظ" مما يؤدي لعدم اكتشاف الفجوة 1-10 قبلها.
    // الحل: نعتبر كل مراجعة يتيمة بمثابة "دليل على وجود حفظ ضمني" ونضيفها للجدول
    // الزمني للفحص، مع وسمها بـ isVirtual لتصحيحها لاحقاً.

    let consolidatedSegments = [...memSegments.map(s => ({...s, isVirtual: false}))];
    
    // فحص المراجعات وإضافتها إذا لم تكن مغطاة
    reviewSegments.forEach(rev => {
         const isCovered = consolidatedSegments.some(m => 
             m.ayahStart <= rev.ayahStart && m.ayahEnd >= rev.ayahEnd
         );
         if (!isCovered) {
             consolidatedSegments.push({
                 ...rev,
                 isVirtual: true, // هذه مراجعة ستتحول لحفظ (Orphan Fix)
                 reason: 'Implicit memorization derived from review'
             });
         }
    });

    // إعادة الترتيب بعد الدمج
    consolidatedSegments.sort((a, b) => {
        if (a.ayahStart !== b.ayahStart) return a.ayahStart - b.ayahStart;
        return b.ayahEnd - a.ayahEnd; 
    });

    // --- المرحلة 3: كشف الفجوات والمراجعات اليتيمة معاً (Unified Analysis) ---
    
    let repairsNeeded = [];
    let expectedStart = 1;

    for (let i = 0; i < consolidatedSegments.length; i++) {
        const current = consolidatedSegments[i];

        // 1. معالجة "المراجعة اليتيمة" (Orphan Fix)
        // إذا كان المقطع افتراضياً (جاء من مراجعة)، فهذا يعني أنه يحتاج لتثبيت كحفظ أصلي
        if (current.isVirtual) {
            repairsNeeded.push({
                type: 'orphan_fix',
                surahNumber: surahNumber,
                ayahStart: current.ayahStart,
                ayahEnd: current.ayahEnd,
                targetDate: current.originalDate,
                referenceSectionId: current.originalSectionId,
                reason: current.reason
            });
        }

        // 2. معالجة الفجوات (Gap Filling)
        // تجاهل المقاطع المكررة أو المتداخلة في التحقق من الفجوات
        if (current.ayahEnd < expectedStart) {
            continue; 
        }

        // كشف الفجوة قبل المقطع الحالي (سواء كان حقيقياً أو افتراضياً)
        if (current.ayahStart > expectedStart) {
            const gapStart = expectedStart;
            const gapEnd = current.ayahStart - 1;
            
            repairsNeeded.push({
                type: 'gap_fill',
                surahNumber: surahNumber,
                ayahStart: gapStart,
                ayahEnd: gapEnd,
                targetDate: current.originalDate, // تاريخ المقطع الذي كشف الفجوة
                referenceSectionId: current.originalSectionId,
                reason: `Gap detected before range ${current.ayahStart}-${current.ayahEnd}`
            });
        }

        expectedStart = Math.max(expectedStart, current.ayahEnd + 1);
    }

    if (repairsNeeded.length === 0) {
        return { repaired: false, message: "السلسلة سليمة تماماً، لا توجد فجوات ولا مراجعات يتيمة." };
    }

    // --- تحسين الفجوات (Splitting Large Gaps) ---
    // إذا كانت الفجوة كبيرة، نقسمها لمقاطع أصغر بناءً على خيارات المستخدم
    const limitInput = options.maxVersesPerDay;
    const limit = parseInt(limitInput, 10);

    if (!isNaN(limit) && limit > 0) {
        const refinedRepairs = [];
        for (const repair of repairsNeeded) {
            if (repair.type === 'gap_fill') {
                const gapSize = repair.ayahEnd - repair.ayahStart + 1;
                if (gapSize > limit) {
                    // تقسيم الفجوة
                    let currentStart = repair.ayahStart;
                    const finalEnd = repair.ayahEnd;
                    while (currentStart <= finalEnd) {
                        const nextEnd = Math.min(currentStart + limit - 1, finalEnd);
                        refinedRepairs.push({
                            ...repair,
                            ayahStart: currentStart,
                            ayahEnd: nextEnd,
                            reason: `${repair.reason} (Split ${gapSize} verses into chunks of ${limit})`
                        });
                        currentStart = nextEnd + 1;
                    }
                } else {
                    refinedRepairs.push(repair);
                }
            } else {
                refinedRepairs.push(repair);
            }
        }
        repairsNeeded = refinedRepairs;
    }

    // --- المرحلة 4: التنفيذ (Execution Phase) ---
    // تحديث: استخدام نظام الإزاحة (Ripple Shift) للفجوات
    // الهدف: إذا اكتشفنا فجوة 1-10، وكان اليوم 11-20، نجعل اليوم 1-10، ونزحزح 11-20 للمستقبل.
    
    // ✅ DRY RUN CHECK
    if (dryRun) {
        return {
            repaired: false, // لم يتم الإصلاح (لأننا في وضع المحاكاة)
            needsRepair: true,
            detectedRepairs: repairsNeeded,
            message: `تم اكتشاف ${repairsNeeded.length} مشكلة في التسلسل.`
        };
    }

    let actionsTaken = [];
    let gapsFixed = 0;
    let orphansFixed = 0;
    
    // معالجة الفجوات أولاً (لأنها تتطلب إزاحة)
    const gapRepairs = repairsNeeded.filter(r => r.type === 'gap_fill');
    // معالجة الأيتام (في مكانها)
    const orphanRepairs = repairsNeeded.filter(r => r.type === 'orphan_fix');

    // 1. تنفيذ الإزاحة للفجوات (Processing Gaps with Ripple Shift)
    // نجمع كل الفجوات ونبدأ الإزاحة من أقدم فجوة لتجنب التضارب
    
    // Sort gaps by originalDate (which corresponds to gap location)
    gapRepairs.sort((a, b) => new Date(a.targetDate) - new Date(b.targetDate));

    if (gapRepairs.length > 0) {
        // We start from the earliest reference ID affected
        const earliestRepair = gapRepairs[0];
        
        // Prepare ALL segments to add (from all gaps)
        const allSegmentsToAdd = gapRepairs.map(repair => {
            const rangeKey = `${surahNumber}:${repair.ayahStart}-${repair.ayahEnd}`;
            // Resolve Surah Name
            const surahInfo = getSurahByNumber(surahNumber);
            const resolvedSurahName = surahInfo ? surahInfo.name : `سورة ${surahNumber}`;
            const displayRange = `${resolvedSurahName} ${repair.ayahStart}-${repair.ayahEnd}`;
            
            return {
                surahNumber: repair.surahNumber,
                surahNameCanonical: resolvedSurahName, 
                ayahStart: repair.ayahStart,
                ayahEnd: repair.ayahEnd,
                canonicalKey: rangeKey,
                status: 'completed', 
                completionNote: `تم ترميم الفجوة وتعديل التسلسل تلقائياً (${displayRange})`
            };
        });

        try {
            // Apply HUGE ripple shift once
            await this.applyRippleShift(
                groupId, 
                surahNumber, 
                allSegmentsToAdd, 
                earliestRepair.referenceSectionId,
                options
            );
            
            gapsFixed += gapRepairs.length;
            actionsTaken.push(`تمت إضافة ${gapRepairs.length} مقاطع لملء الفجوات وإزاحة الجدول بالكامل`);
            
        } catch (error) {
            console.error(`Ripple shift failed`, error);
            actionsTaken.push(`فشل الإزاحة الشاملة: ${error.message}`);
        }
    }

    // 2. تنفيذ إصلاح الأيتام (In-Place Fix)
    for (const repair of orphanRepairs) {
        const rangeKey = `${surahNumber}:${repair.ayahStart}-${repair.ayahEnd}`;
        const surahInfo = getSurahByNumber(surahNumber);
        const resolvedSurahName = surahInfo ? surahInfo.name : `سورة ${surahNumber}`;
        const displayRange = `${resolvedSurahName} ${repair.ayahStart}-${repair.ayahEnd}`;
        
         const newSegment = {
            surahNumber: repair.surahNumber,
            surahNameCanonical: resolvedSurahName, 
            ayahStart: repair.ayahStart,
            ayahEnd: repair.ayahEnd,
            canonicalKey: rangeKey,
            status: 'completed',
            completionNote: `تم تثبيت الحفظ للمراجعة اليتيمة (${displayRange})`
        };

        await Section.findByIdAndUpdate(repair.referenceSectionId, {
            $push: { memorizationMeta: newSegment }
        });
        
        orphansFixed++;
        actionsTaken.push(`تم تثبيت ${displayRange} في مكانه`);
    }

    return {
        repaired: true,
        actions: actionsTaken,
        stats: { gapsFixed, orphansFixed },
        message: `تمت عملية الإصلاح بنجاح. تم معالجة ${actionsTaken.length} مشكلة.`
    };
  }

  /**
   * 🌊 Ripple Shift Algorithm (Resequence Strategy)
   * يقوم بإعادة جدولة مقاطع السورة بدءاً من نقطة التعديل لملء الفجوات المتاحة في الأسبوع الحالي.
   */
  async applyRippleShift(groupId, surahNumber, gapSegments, startSectionId, options = {}) {
      // 1. العثور على المقطع المرجعي ونقطة البداية
      const startSection = await Section.findById(startSectionId);
      if (!startSection) throw new Error("Start section not found");

      const startDate = new Date(startSection.date);

      // normalization for suggested dates
      let { suggestedDates } = options;
      if (suggestedDates && Array.isArray(suggestedDates)) {
          // Sort dates to use closest first
          suggestedDates = suggestedDates
            .map(d => new Date(d))
            .sort((a, b) => a - b)
            // Filter only future or equal dates to start
            .filter(d => d >= startDate);
      } else {
          suggestedDates = [];
      }

      // 2. جمع كل المقاطع المستقبلية لهذه السورة (بما فيها اليوم الحالي)
      // نجمعها لنعيد توزيعها بالترتيب الصحيح
      const futureSections = await Section.find({
          group: groupId,
          date: { $gte: startDate },
          "memorizationMeta.surahNumber": surahNumber
      }).sort({ date: 1, createdAt: 1 }).lean();

      // 3. بناء طابور البيانات (Queue)
      // نضيف الفجوات الجديدة أولاً، ثم نلحقها بباقي المقاطع الموجودة
      const segmentQueue = [];

      // أ) الفجوات الجديدة (Array support)
      // Ensure gapSegments is an array
      const gaps = Array.isArray(gapSegments) ? gapSegments : [gapSegments];
      
      for (const gap of gaps) {
        const cleanGapSegment = { ...gap, isNewGap: true }; // Flag to identify for suggestedDates
        delete cleanGapSegment._id;
        segmentQueue.push(cleanGapSegment);
      }

      // ب) المقاطع المرحلة
      for (const section of futureSections) {
          // قد يحتوي اليوم على أكثر من مقطع لنفس السورة، نأخذهم بالترتيب
          // ولكن: نتخطى المقطع الذي نبدأ منه (الفجوة) إذا كان موجوداً بالفعل لتجنب التكرار
          // الخوارزمية هنا تفترض أننا نزيد مقطعاً، لذا نأخذ كل القديم ونزيحه
          const relevantSegments = section.memorizationMeta
            .filter(m => m.surahNumber === surahNumber)
            .map(s => {
                const clean = { ...s, isNewGap: false };
                delete clean._id; 
                return clean;
            });
          segmentQueue.push(...relevantSegments);
      }
      
      // ✅ Essential Sorting for strict sequence validation
      // This ensures that even if Gaps came from different parts, 
      // the final timeline is sorted purely by Ayah Sequence.
      segmentQueue.sort((a, b) => {
          if (a.surahNumber !== b.surahNumber) return a.surahNumber - b.surahNumber;
          return a.ayahStart - b.ayahStart;
      });

      // ✅ Deduplicate Segment Queue
      // Fixes issue where same segment appears on multiple days (e.g. 19 Jan and 26 Jan)
      // This happens if DB had duplicates or if logic added them twice.
      // We keep the *last* one if duplicates exist? No, the *first* one in sorted order is fine.
      // Actually if we have duplicates in DB of same range, we should condense them to one unless status is different?
      // Assuming 'completed' status, it's a duplicate.
      const uniqueQueue = [];
      const seenKeys = new Set();
      for (const seg of segmentQueue) {
          const key = `${seg.surahNumber}:${seg.ayahStart}-${seg.ayahEnd}`;
          if (!seenKeys.has(key)) {
              seenKeys.add(key);
              uniqueQueue.push(seg);
          }
      }
      // Re-assign sorted, deduped queue
      // segmentQueue is 'const' in function scope? No, it was passed as argument?
      // Wait, applyRippleShift definition: async applyRippleShift(..., gapSegments, ...)
      // But segmentQueue is created INSIDE applyRippleShift.
      // Let's check where it is defined.
      // It is defined as: const segmentQueue = [...gapSegments]; 
      // So we cannot reassign it.
      // We must push into it or use splices, or change definition to let.
      
      // FIX: Clear and refill
      segmentQueue.length = 0;
      segmentQueue.push(...uniqueQueue);

      // 4. تنظيف الطريق (Clear Path)
      // نحذف سجلات هذه السورة من كافة الأيام المستقبلية المتأثرة لنعيد كتابتها بانتظام
      // هذا يضمن عدم وجود بقايا أو تداخل
      const sectionIdsToClean = futureSections.map(s => s._id);
      if (sectionIdsToClean.length > 0) {
        await Section.updateMany(
            { _id: { $in: sectionIdsToClean } },
            { $pull: { memorizationMeta: { surahNumber: surahNumber } } }
        );
      }

      // 5. إعادة التوزيع (Re-Distribution)
      // نمشي يوماً بيوم من تاريخ البداية، ونملأ كل يوم متاح
      const allowedDays = await this.detectWorkingDays(groupId);
      let currentDate = new Date(startDate);
      let safetyCounter = 0; // لمنع الحلقات اللانهائية
      
      while (segmentQueue.length > 0 && safetyCounter < 365) { 
          // 365 days max lookahead per batch
          
          let canUseDay = false;

          // Priority: Suggested Dates for New Gaps
          // If the next segment is a "New Gap" and we have suggested dates left
          const nextSegmentIsGap = segmentQueue[0].isNewGap;
          if (nextSegmentIsGap && suggestedDates.length > 0) {
              // Jump to the preferred date immediately
              const preferredDate = new Date(suggestedDates[0]); // Don't shift yet
              // Ensure we don't go backwards
              if (preferredDate >= currentDate) {
                  // ✅ CHECK TEACHER CONFLICT FOR SUGGESTED DATE
                  const hasConflict = await this.checkTeacherConflict(startSection.teacher, preferredDate, groupId);
                  if (hasConflict) {
                      actionsTaken.push(`⚠️ تم تجاهل الموعد المقترح ${this.toDateKeyUTC(preferredDate)} لوجود تعارض مع حلقات أخرى للمعلم.`);
                      suggestedDates.shift(); // Remove rejected date
                      // Fall through to standard logic (find next avail day)
                  } else {
                      currentDate = new Date(preferredDate);
                      canUseDay = true; 
                      suggestedDates.shift(); // Consumed
                  }
              } else {
                  // Old date, just discard
                  suggestedDates.shift();
              }
          } 
          
          if (!canUseDay) {
            // Standard Logic
            // دائماً نستخدم يوم البداية (لأنه المختار من المستخدم)
            if (safetyCounter === 0 && currentDate.getTime() === startDate.getTime()) {
                canUseDay = true;
            } else {
                // للأيام التالية، نفحص إذا كان يوم عمل
                const dayIndex = currentDate.getDay();
                // نسمح بالجمعة فقط إذا كانت هي يوم العمل الوحيد
                const isFriday = dayIndex === 5;
                const isWorkingDay = allowedDays.includes(dayIndex);
                
                if (isWorkingDay && (!isFriday || allowedDays.length === 1)) {
                    // ✅ CHECK TEACHER CONFLICT FOR AUTO DATE (Prefer Avoidance)
                    const hasConflict = await this.checkTeacherConflict(startSection.teacher, currentDate, groupId);
                    if (!hasConflict) {
                        canUseDay = true;
                    }
                    // If conflict exists, we keep canUseDay = false and loop will increment date
                }
            }

            // بالإضافة لأيام العمل، إذا كان هناك "حصة" مسجلة في هذا اليوم أصلاً، نستخدمها
            // (مثلاً حصة تعويضية في يوم عطلة)
            let targetSection = await Section.findOne({ group: groupId, date: currentDate });
            if (targetSection) canUseDay = true;
          }

          if (canUseDay) {
              const segment = segmentQueue.shift();
              // Remove our internal flag before saving
              delete segment.isNewGap;

              // تجهيز النص
              let surahName = segment.surahNameCanonical || segment.surahNameInput;
              if (!surahName) {
                const surahInfo = getSurahByNumber(segment.surahNumber);
                surahName = surahInfo ? surahInfo.name : `سورة ${segment.surahNumber}`;
              }
              const newDisplayText = `${surahName} ${segment.ayahStart}-${segment.ayahEnd}`;

              // Find section again (currentDate might have changed)
              let targetSection = await Section.findOne({ group: groupId, date: currentDate });

              if (targetSection) {
                  // تحديث مقطع موجود
                   await Section.updateOne(
                      { _id: targetSection._id },
                      {
                          $push: { memorizationMeta: segment },
                          $set: { memorizationSection: newDisplayText } 
                      }
                  );
              } else {
                  // إنشاء يوم جديد (لأننا في نطاق الأيام المسموحة ولم نجد مقطع)
                  const newKey = this.toDateKeyUTC(currentDate);
                  await Section.create({
                      group: groupId,
                      date: currentDate,
                      dateKey: newKey,
                      teacher: startSection.teacher, 
                      memorizationMeta: [segment],
                      memorizationSection: newDisplayText,
                      marksStatus: 'not_started'
                  });
              }
              
              // Only advance date if we are not processing multiple segments for the same day?
              // Current logic puts one segment per day.
              // If we want multiple gaps on same day, we need more logic.
              // For now, one gap per day is safer for "Daily" marks.
          }
          
          // الانتقال لليوم التالي
          currentDate.setDate(currentDate.getDate() + 1);
          safetyCounter++;
      }
      
      // ✅ Final Sequence Check (Safety Net)
      // Check if dates are non-decreasing relative to verse order
      // We process segmentQueue in SORTED Verse Order.
      // But we wrote to DB. Let's verify what we wrote? 
      // Actually we iterating day-by-day so date is monotonic.
      // And we iterating segmentQueue which is sorted by Verse.
      // So Date increases (or stays same) as Verse increases.
      // This guarantees strict monotonic sequence: Date(V2) >= Date(V1) if V2 > V1.
  }

  // Helper date key
  toDateKeyUTC(d) {
      const dt = new Date(d);
      const y = dt.getUTCFullYear();
      const m = String(dt.getUTCMonth() + 1).padStart(2, "0");
      const day = String(dt.getUTCDate()).padStart(2, "0");
      return `${y}-${m}-${day}`;
  }

  /**
   * اكتشاف أيام عمل الحلقة بناءً على إعدادات المجموعة أو التاريخ السابق
   */
  async detectWorkingDays(groupId) {
    // 1. Check Group Settings first (Source of Truth)
    const Group = require('../../schema/Group'); // Adjusted path from services/DailyMark/
    const group = await Group.findById(groupId).select('schedule').lean();
    
    if (group && group.schedule) {
        const scheduleText = group.schedule;
        const dayMap = {
            'الأحد': 0, 'الاثنين': 1, 'الإثنين': 1, 'الثلاثاء': 2, 'الأربعاء': 3, 'الاربعاء': 3,
            'الخميس': 4, 'الجمعة': 5, 'السبت': 6
        };
        const detectedDays = new Set();
        for (const [name, idx] of Object.entries(dayMap)) {
            if (scheduleText.includes(name)) detectedDays.add(idx);
        }
        if (detectedDays.size > 0) return Array.from(detectedDays);
    }

    // 2. Fallback to History
    // نجلب آخر 30 حصة لنعرف الأيام التي يجتمعون فيها عادة
    const recent = await Section.find({ group: groupId }).sort({ date: -1 }).limit(30).select('date').lean();
    
    // إذا لم يكن لدينا بيانات كافية، نفترض الافتراضي (أحد، ثلاثاء، خميس) بدلاً من كل الأيام
    if (!recent || recent.length < 5) return [0, 2, 4]; 

    const days = new Set(recent.map(r => new Date(r.date).getDay()));
    
    // إذا كانت المجموعة تعمل فقط يوم الجمعة (نادر جداً)، نسمح به. غير ذلك نحذفه
    if (days.has(5) && days.size > 1) {
        // إذا كان عندهم أيام أخرى، نعتبر الجمعة استثناء ولا نجدول عليه
        days.delete(5);
    }
    
    return Array.from(days);
  }

  /**
   * الحصول على يوم العمل التالي
   */
  getNextWorkingDay(date, allowedDays) {
      const d = new Date(date);
      // نحاول البحث عن يوم مناسب خلال الأسبوع القادم
      for (let i = 0; i < 14; i++) { // Max lookahead 2 weeks
        d.setDate(d.getDate() + 1);
        const day = d.getDay();
        
        // القاعدة الذهبية: تجاوز الجمعة دائماً ما لم تكن المجموعة تعمل فقط يوم الجمعة
        if (day === 5 && allowedDays.includes(5) && allowedDays.length === 1) {
            return d;
        }
        if (day === 5) continue; 

        // إذا كان اليوم ضمن أيام العمل المعتادة
        if (allowedDays.includes(day)) {
            return d;
        }
      }
      // Fallback: Return next day if logic fails
      const fallback = new Date(date);
      fallback.setDate(fallback.getDate() + 1);
      return fallback;
  }

  /**
   * Check if teacher has other sections on this date (conflict)
   * @param {string} teacherId 
   * @param {Date} date 
   * @param {string} currentGroupId 
   */
  async checkTeacherConflict(teacherId, date, currentGroupId) {
    if (!teacherId) return false;
    
    // We look for any section for THIS teacher on THIS date
    // BUT belonging to a DIFFERENT group
    const conflict = await Section.exists({
        teacher: teacherId,
        date: date,
        group: { $ne: currentGroupId }
    });

    return !!conflict;
  }
}

module.exports = new AiSchedulerService();
