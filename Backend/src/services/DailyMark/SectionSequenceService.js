const Section = require("../../schema/DailyMark/Section");

/**
 * ============================================================================
 * SectionSequenceService (The Strict Edition)
 * ============================================================================
 * خدمة مركزية لإدارة منطق تسلسل الحفظ والمراجعة في حلقات التحفيظ.
 * 
 * المبادئ الحاكمة (Rules of Engagement):
 * 1. الحفظ (Memorization): بناء تراكمي صارم. لا فجوات. الحجر فوق الحجر.
 * 2. المراجعة (Review): مرآة للحفظ.
 *    - لا يمكن مراجعة ما لم يحفظ.
 *    - "نفس الرينجات بالضبط": لا يمكن مراجعة نصف مقطع أو دمج مقطعين.
 *      إذا حفظت (1-10)، تراجع (1-10).
 *    - التسلسل: المراجعة تدور في حلقات (Cycles). بعد مراجعة (1-10)، الدور على (11-20).
 * 3. التزامن (Concurrency): دعم معالجة عدة مقاطع في طلب واحد (Batch Insert) وفهم علاقتها ببعضها.
 */

class SectionSequenceService {

  /**
   * البحث عن آخر نقطة وصل إليها الطالب (مرجعية التسلسل)
   * 
   * @param {string} groupId - معرف الحلقة
   * @param {number} surahNumber - رقم السورة
   * @param {string} type - 'memorization' | 'review'
   * @param {Date} [beforeDate] - للبحث في الماضي (قبل تاريخ معين)
   * @param {string} [excludeSectionId] - عند التعديل، استثناء المقطع الحالي
   */
  async getLastProgress(groupId, surahNumber, type, beforeDate = null, excludeSectionId = null) {
    const metaField = type === 'memorization' ? 'memorizationMeta' : 'reviewMeta';

    // 1. إعداد فلتر البحث
    const query = {
      group: groupId,
      [`${metaField}.surahNumber`]: surahNumber
    };

    if (excludeSectionId) {
       query._id = { $ne: excludeSectionId };
    }

    if (beforeDate) {
        // نبحث في التواريخ السابقة أو نفس اليوم (في حال وجود عدة حصص)
        query.date = { $lte: beforeDate };
    }

    // 2. البحث عن آخر مقطع (الأحدث تاريخاً وإنشاءً)
    const lastSection = await Section.findOne(query)
      .sort({ date: -1, createdAt: -1 })
      .select(`${metaField} date createdAt`);

    if (!lastSection) return null;

    // 3. استخراج تفاصيل السورة المطلوبة فقط من المصفوفة
    const segments = lastSection[metaField]
      .filter(s => s.surahNumber === surahNumber)
      .sort((a, b) => b.ayahEnd - a.ayahEnd); // الأبعد هو الأحدث منطقياً

    if (segments.length === 0) return null;
    const lastSegment = segments[0];

    return {
      lastEnd: lastSegment.ayahEnd,
      nextStart: lastSegment.ayahEnd + 1,
      lastDate: lastSection.date,
      lastStatus: lastSegment.status
    };
  }

  /**
   * البحث عن مقطع يسبق البداية المطلوبة مباشرة (لضمان الاتصال)
   * (نادراً ما تستخدم مباشرة، لكنها مفيدة للتحقق من التفرعات)
   */
  async getPredecessor(groupId, surahNumber, type, requiredEnd, beforeDate = null, excludeSectionId = null) {
      const metaField = type === 'memorization' ? 'memorizationMeta' : 'reviewMeta';
      const query = {
          group: groupId,
          [`${metaField}.surahNumber`]: surahNumber,
          [`${metaField}`]: {
              $elemMatch: {
                  surahNumber: surahNumber,
                  ayahEnd: requiredEnd
              }
          }
      };

      if (excludeSectionId) query._id = { $ne: excludeSectionId };
      if (beforeDate) query.date = { $lte: beforeDate };

      return await Section.findOne(query).select('_id');
  }

  /**
   * التحقق الشامل من صحة البيانات والقواعد المنطقية
   * هذه هي الدالة الرئيسية التي يتم استدعاؤها من الـ Controller
   */
  async validateSequence(newSegments, groupId, type, newSectionDate = null, excludeSectionId = null, siblingSegments = []) {
    if (!newSegments || newSegments.length === 0) return { isValid: true };

    const metaField = type === 'memorization' ? 'memorizationMeta' : 'reviewMeta';
    const typeLabel = type === 'memorization' ? 'الحفظ' : 'المراجعة';
    const newDateStr = newSectionDate ? new Date(newSectionDate).toLocaleDateString('en-CA') : null;

    for (const seg of newSegments) {
      
      // ====================================================
      // 1. منع التكرار (No Duplicates)
      // ====================================================
      const overlapQuery = {
        group: groupId,
        [`${metaField}.surahNumber`]: seg.surahNumber,
        [`${metaField}`]: {
           $elemMatch: {
             surahNumber: seg.surahNumber,
             ayahStart: { $lte: seg.ayahEnd },
             ayahEnd: { $gte: seg.ayahStart }
           }
        }
      };
      if (excludeSectionId) overlapQuery._id = { $ne: excludeSectionId };

      const potentialConflicts = await Section.find(overlapQuery).select(`date ${metaField}`);

      for (const conflictingSection of potentialConflicts) {
         // أ. تكرار الحفظ (ممنوع منعاً باتاً)
         if (type === 'memorization') {
            const conflictSeg = conflictingSection[metaField].find(s => 
                s.surahNumber === seg.surahNumber && 
                s.ayahStart <= seg.ayahEnd && 
                s.ayahEnd >= seg.ayahStart
            );
            const dateStr = new Date(conflictingSection.date).toLocaleDateString('ar-EG');
            return {
              isValid: false,
              message: `🚫 تداخل في الحفظ: الآيات (${seg.ayahStart}-${seg.ayahEnd}) محفوظة سابقاً بتاريخ ${dateStr}. الحفظ لا يتكرر.`
            };
         }
         
         // ب. تكرار المراجعة (ممنوع في نفس اليوم فقط)
         if (type === 'review' && newDateStr) {
             const conflictDateStr = new Date(conflictingSection.date).toLocaleDateString('en-CA');
             if (conflictDateStr === newDateStr) {
                 return {
                     isValid: false,
                     message: `🚫 تكرار مراجعة: الآيات (${seg.ayahStart}-${seg.ayahEnd}) مضافة للمراجعة بالفعل في نفس هذا اليوم.`
                 };
             }
         }
      }

      // ====================================================
      // 2. منطق المراجعة الصارم (Strict Matching Policy)
      // ====================================================
      if (type === 'review') {
          // القاعدة: نطاق المراجعة يجب أن يطابق بدقة نطاق حفظ سابق.
          // الشعار: "نفس الرينجات بالضبط"
          
          let strictMatchFound = false;

          // فحص 1: هل تطابق حفظاً جديداً في نفس الطلب؟ (Local Sibling)
          if (siblingSegments && siblingSegments.length > 0) {
              const siblingMatch = siblingSegments.find(m => 
                  m.surahNumber === seg.surahNumber && 
                  m.ayahStart === seg.ayahStart && 
                  m.ayahEnd === seg.ayahEnd
              );
              if (siblingMatch) strictMatchFound = true;
          }

          // فحص 2: هل تطابق حفظاً تاريخياً في قاعدة البيانات؟ (DB History)
          if (!strictMatchFound) {
             const memQuery = {
                group: groupId,
                "memorizationMeta": {
                    $elemMatch: {
                        surahNumber: seg.surahNumber,
                        ayahStart: seg.ayahStart,
                        ayahEnd: seg.ayahEnd // تطابق تام
                    }
                }
             };
             const exists = await Section.exists(memQuery);
             if (exists) strictMatchFound = true;
          }

          if (!strictMatchFound) {
              return {
                  isValid: false,
                  message: `🚫 نطاق مراجعة غير مسموح: يجب أن يتطابق نطاق المراجعة (${seg.ayahStart}-${seg.ayahEnd}) تماماً مع مقطع تم حفظه سابقاً بنفس الآيات.\n(شعارنا: نفس الرينجات بالضبط، لا أقل ولا أكثر).`
              };
          }

          // فحص التسلسل الزمني للمراجعة (Cycles)
          const lastReview = await this.getLastProgress(groupId, seg.surahNumber, 'review', newSectionDate, excludeSectionId);
          let expectedStart = 1;
          
          if (lastReview) {
             expectedStart = lastReview.nextStart;
          }

          // التحقق من الاتصال (Continuity)
          // هل هذا المقطع يتصل بمقطع سابق محلي (في نفس الطلب)؟
          const hasLocalPredecessor = newSegments.some(s => 
            s !== seg && // ليس نفس المقطع
            s.surahNumber === seg.surahNumber && 
            s.ayahEnd === seg.ayahStart - 1 // ينتهي قبلي مباشرة
          );

          if (!hasLocalPredecessor) {
               // إذا لم يتصل محلياً، يجب أن يطابق التوقع التاريخي
               if (seg.ayahStart !== expectedStart) {
                   // استثناء وحيد: "إعادة الدورة" (Restart Cycle)
                   // إذا كان التوقع هو آية متقدمة (مثلاً 50)، وبدأنا من 1.
                   const isRestart = (seg.ayahStart === 1); 
                   
                   if (!isRestart) {
                        return {
                            isValid: false,
                            message: `🚫 تسلسل مراجعة خاطئ: آخر مراجعة انتهت عند الآية ${expectedStart - 1}. المراجعة التالية يجب أن تبدأ من ${expectedStart}. (أو من 1 لبدء ختمة مراجعة جديدة).`
                        };
                   }
               }
          }
      }

      // ====================================================
      // 3. منطق الحفظ الصارم (Strict No-Gap Policy)
      // ====================================================
      if (type === 'memorization') {
        const lastProgress = await this.getLastProgress(groupId, seg.surahNumber, type, newSectionDate, excludeSectionId);
        
        if (lastProgress) {
            // هل البداية تطابق النهاية المتوقعة؟
            if (seg.ayahStart !== lastProgress.nextStart) {
                
                const dateStr = new Date(lastProgress.lastDate).toLocaleDateString('ar-EG');

                // فحص اتصال محلي (Local Sibling)
                const hasLocalPredecessor = newSegments.some(s => 
                    s !== seg && 
                    s.surahNumber === seg.surahNumber && 
                    s.ayahEnd === seg.ayahStart - 1
                );

                if (hasLocalPredecessor) {
                     continue; // ✅ متصل بمقطع زميل في نفس الحصة
                }

                // خطأ: فجوة حقيقية
                if (seg.ayahStart > lastProgress.nextStart) {
                     return {
                        isValid: false,
                        message: `🚫 فجوة في الحفظ: الوصل السابق كان عند الآية ${lastProgress.lastEnd} (${dateStr}).\nيجب إكمال الحفظ من الآية ${lastProgress.nextStart}.`
                     };
                }
                
                // خطأ: تداخل مع الماضي / إعادة
                if (seg.ayahStart < lastProgress.nextStart) {
                     // نسمح فقط إذا كان يتصل بمقطع قديم "منتهي" عند هذه النقطة (تفرع) - (نادر الحدوث)
                     const predecessor = await Section.findOne({
                         group: groupId,
                         [`${metaField}.surahNumber`]: seg.surahNumber,
                         [`${metaField}.ayahEnd`]: seg.ayahStart - 1,
                         _id: excludeSectionId ? { $ne: excludeSectionId } : { $exists: true }
                     });

                     if (!predecessor && seg.ayahStart !== 1) {
                         return {
                            isValid: false,
                            message: `🚫 تسلسل الحفظ غير متصل: تحاول البدء من ${seg.ayahStart} لكنك واصل سابقاً إلى ${lastProgress.lastEnd}.`
                         };
                     }
                }
            }
        } else {
            // أول مرة يتم حفظ هذه السورة: يجب أن يبدأ من 1.
            if (seg.ayahStart !== 1) {
               // هل يوجد مقطع زميل يبدأ من 1 ويوصلني؟
               const siblingPredecessor = newSegments.find(s => s !== seg && s.surahNumber === seg.surahNumber && s.ayahEnd === seg.ayahStart - 1);
               if (!siblingPredecessor) {
                  return {
                      isValid: false,
                      message: `🚫 بداية خاطئة: أول حفظ في السورة يجب أن يبدأ من الآية 1.`
                  };
               }
            }
        }
      }
    }

    return { isValid: true };
  }

  /**
   * للعثور على نهاية مقطع الحفظ المقابل لبداية معينة.
   * يستخدم هذا لاقتراح "نهاية المراجعة" بحيث تطابق الحفظ الأصلي.
   */
  async getMatchingMemorizationEnd(groupId, surahNumber, ayahStart) {
      const query = {
          group: groupId,
          "memorizationMeta": {
              $elemMatch: {
                  surahNumber: surahNumber,
                  ayahStart: ayahStart
              }
          }
      };

      // قد يكون هناك نسخ متعددة (إذا سمحنا بإعادة الحفظ مستقبلاً)، نأخذ الأحدث
      const section = await Section.findOne(query)
          .sort({ date: -1 })
          .select("memorizationMeta");
      
      if (!section) return null;

      const segment = section.memorizationMeta.find(s => 
          s.surahNumber === surahNumber && s.ayahStart === ayahStart
      );
      
      return segment ? segment.ayahEnd : null;
  }

  /**
   * (Consistency Check) التحقق من الاتساق الداخلي للطلب
   * التأكد من أن المراجعة لا تسبق الحفظ في نفس اللحظة (منطقياً)
   */
  validateConsistency(memorizationMeta, reviewMeta) {
    if (!memorizationMeta || !reviewMeta || memorizationMeta.length === 0 || reviewMeta.length === 0) {
        return { isValid: true };
    }

    // تحقق لكل مقطع مراجعة
    for (const rev of reviewMeta) {
        // هل يوجد مقطع حفظ لنفس السورة؟
        const memSegments = memorizationMeta.filter(m => m.surahNumber === rev.surahNumber);
        
        for (const mem of memSegments) {
            
            // لا يمكنك مراجعة سورة بدأت حفظها للتو
            if (mem.ayahStart === 1) {
                 return {
                     isValid: false,
                     message: `🚫 غير منطقي: لا يمكن مراجعة سورة ${mem.surahNameCanonical} لأنك بدأت حفظها الآن (من الآية 1).`
                 };
            }

            // لا يمكن للمراجعة أن تتقاطع مع الحفظ الجديد (المراجعة للماضي فقط)
            if (rev.ayahEnd >= mem.ayahStart) {
                 return {
                     isValid: false,
                     message: `🚫 تداخل زمني: المراجعة (${rev.ayahStart}-${rev.ayahEnd}) تتداخل مع نطاق الحفظ الجديد (${mem.ayahStart}-${mem.ayahEnd}). المراجعة تكون للمحفوظات القديمة فقط.`
                 };
            }
        }
    }
    return { isValid: true };
  }
}

module.exports = new SectionSequenceService();
