const Section = require("../../schema/DailyMark/Section");

/**
 * SectionSequenceService
 * مسؤول عن تتبع تسلسل الحفظ والمراجعة وضمان عدم وجود فجوات أو تداخلات.
 */
class SectionSequenceService {

  /**
   * الحصول على آخر نقطة توقف لهذه المجموعة في سورة معينة
   * @param {string} groupId - معرف الحلقة
   * @param {number} surahNumber - رقم السورة
   * @param {string} type - 'memorization' | 'review'
   * @param {Date} [beforeDate] - تاريخ مرجعي
   * @param {string} [excludeSectionId] - استثناء مقطع معين
   * @returns {Promise<{lastEnd: number, nextStart: number, lastDate: Date} | null>}
   */
  async getLastProgress(groupId, surahNumber, type, beforeDate = null, excludeSectionId = null) {
    const metaField = type === 'memorization' ? 'memorizationMeta' : 'reviewMeta';

    // إعداد الاستعلام
    const query = {
      group: groupId,
      [`${metaField}.surahNumber`]: surahNumber
    };

    if (excludeSectionId) {
       query._id = { $ne: excludeSectionId };
    }

    // إذا تم تحديد تاريخ، ابحث عما قبله أو *نفس اليوم* (للسماح بعدة مقاطع في نفس اليوم)
    // نستخدم $lte لأننا نريد شمول المقاطع التي تم إنشاؤها في نفس اليوم وتم حفظها سابقاً
    // هذا مهم عندما يضيف المستخدم (1-5) ثم (6-10) في نفس التاريخ.
    if (beforeDate) {
        query.date = { $lte: beforeDate };
    }

    // البحث عن آخر مقطع يحتوي على هذه السورة
    const lastSection = await Section.findOne(query)
    .sort({ date: -1, createdAt: -1 })
    .select(`${metaField} date createdAt`);

    if (!lastSection) {
       return null;
    }

    // استخراج المقاطع الخاصة بهذه السورة فقط
    const segments = lastSection[metaField].filter(s => s.surahNumber === surahNumber);
    
    if (segments.length === 0) return null;

    // ترتيب تنازلي حسب نهاية الآية (للحصول على أبعد نقطة وصلوا إليها)
    segments.sort((a, b) => b.ayahEnd - a.ayahEnd);
    const lastSegment = segments[0];

    // إذا كنا نبحث عن مراجعة، دعنا نجلب أيضاً حد الحفظ لهذه السورة
    let maxMemorized = null;
    if (type === 'review') {
        const memProgress = await this.getLastProgress(groupId, surahNumber, 'memorization', beforeDate, excludeSectionId);
        maxMemorized = memProgress ? memProgress.lastEnd : 0;
    }

    return {
      lastEnd: lastSegment.ayahEnd,
      nextStart: lastSegment.ayahEnd + 1,
      lastDate: lastSection.date,
      lastStatus: lastSegment.status,
      maxMemorized 
    };
  }

  /**
   * البحث عن مقطع يسبق البداية المطلوبة مباشرة (لضمان الاتصال)
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

      if (excludeSectionId) {
          query._id = { $ne: excludeSectionId };
      }
      
      if (beforeDate) {
          query.date = { $lte: beforeDate };
      }

      return await Section.findOne(query).select('_id');
  }

  /**
   * التحقق من صحة التسلسل للمقاطع الجديدة
   * @param {Array} newSegments 
   * @param {string} groupId 
   * @param {string} type 
   * @param {Date} [newSectionDate] 
   * @param {string} [excludeSectionId] 
   * @param {Array} [siblingSegments] 
   * @returns {Promise<{isValid: boolean, message?: string}>}
   */
  async validateSequence(newSegments, groupId, type, newSectionDate = null, excludeSectionId = null, siblingSegments = []) {
    if (!newSegments || newSegments.length === 0) return { isValid: true };

    const metaField = type === 'memorization' ? 'memorizationMeta' : 'reviewMeta';
    const typeLabel = type === 'memorization' ? 'الحفظ' : 'المراجعة';
    
    const newDateStr = newSectionDate ? new Date(newSectionDate).toLocaleDateString('en-CA') : null;

    for (const seg of newSegments) {
      // 1. Overlap Check (Strict for Memorization, Same-Day for Review)
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

      if (excludeSectionId) {
        overlapQuery._id = { $ne: excludeSectionId };
      }

      const potentialConflicts = await Section.find(overlapQuery).select(`date ${metaField}`);

      for (const conflictingSection of potentialConflicts) {
         if (type === 'memorization') {
            const conflictSeg = conflictingSection[metaField].find(s => 
                s.surahNumber === seg.surahNumber && 
                s.ayahStart <= seg.ayahEnd && 
                s.ayahEnd >= seg.ayahStart
            );
            const dateStr = new Date(conflictingSection.date).toLocaleDateString('ar-EG');
            return {
              isValid: false,
              message: `🚫 تداخل في الحفظ: الآيات (${seg.ayahStart}-${seg.ayahEnd}) من سورة ${seg.surahNameCanonical} تتداخل مع مقطع سابق (${conflictSeg.ayahStart}-${conflictSeg.ayahEnd}) بتاريخ ${dateStr}. الحفظ لا يتكرر.`
            };
         }
         
         if (type === 'review' && newDateStr) {
             const conflictDateStr = new Date(conflictingSection.date).toLocaleDateString('en-CA');
             
             if (conflictDateStr === newDateStr) {
                 return {
                     isValid: false,
                     message: `🚫 تكرار في المراجعة: هذا المقطع (${seg.surahNameCanonical} ${seg.ayahStart}-${seg.ayahEnd}) مضاف بالفعل في نفس اليوم.`
                 };
             }
         }
      }

      // 1.5 Review <= Memorization Logic
      if (type === 'review') {
          const memProgress = await this.getLastProgress(groupId, seg.surahNumber, 'memorization', newSectionDate, excludeSectionId);
          
          let maxMemorized = memProgress ? memProgress.lastEnd : 0;

          if (siblingSegments && siblingSegments.length > 0) {
              const currentMem = siblingSegments.find(m => m.surahNumber === seg.surahNumber);
              if (currentMem) {
                  maxMemorized = Math.max(maxMemorized, currentMem.ayahEnd);
              }
          }
          
          if (maxMemorized === 0) {
             return {
                 isValid: false,
                 message: `🚫 لا يمكن إضافة مراجعة لسورة ${seg.surahNameCanonical} لأنه لم يتم البدء بحفظها أبداً.`
             };
          }

          if (seg.ayahEnd > maxMemorized) {
               return {
                  isValid: false,
                  message: `🚫 لا يمكن مراجعة ما لم يتم حفظه بعد! أقصى آية تم حفظها في سورة ${seg.surahNameCanonical} هي ${maxMemorized}.`
               };
          }
      }

      // 2. Sequence Gap Check
      const lastProgress = await this.getLastProgress(groupId, seg.surahNumber, type, newSectionDate, excludeSectionId);
      
      if (lastProgress) {
          if (seg.ayahStart !== lastProgress.nextStart) {
              const dateStr = new Date(lastProgress.lastDate).toLocaleDateString('ar-EG');
              
              // Case 1: Gap detected (Starting after the known end)
              if (seg.ayahStart > lastProgress.nextStart) {
                   return {
                      isValid: false,
                      message: `🚫 فجوة في ${typeLabel}: آخر ${typeLabel} انتهى عند الآية ${lastProgress.lastEnd} (${dateStr}).\nيجب أن يبدأ الجديد من الآية ${lastProgress.nextStart}.`
                   };
              }
              
              // Case 2: Overlap/Restart detected (Starting BEFORE the known end)
              if (seg.ayahStart < lastProgress.nextStart) {
                   // --- NEW LOGIC: Check if this "Start" connects to ANY valid predecessor ---
                   // Check database for a segment that specifically ends at (start - 1)
                   const predecessor = await Section.findOne({
                       group: groupId,
                       [`${metaField}.surahNumber`]: seg.surahNumber,
                       [`${metaField}.ayahEnd`]: seg.ayahStart - 1,
                       _id: excludeSectionId ? { $ne: excludeSectionId } : { $exists: true }
                   });

                   const hasLocalPredecessor = newSegments.some(s => s.surahNumber === seg.surahNumber && s.ayahEnd === seg.ayahStart - 1);
                   
                   const isValidConnection = (seg.ayahStart === 1) || !!predecessor || hasLocalPredecessor;

                   if (!isValidConnection) {
                       return {
                          isValid: false,
                          message: `🚫 تسلسل ${typeLabel} غير صحيح: (الآية ${seg.ayahStart}) يجب أن تكون متصلة بآخر حفظ وصل عند (الآية ${seg.ayahStart - 1}). لم يتم العثور على المقطع السابق.`
                       };
                   }
                   // If valid connection found, we ALLOW it
              }
          }
      } else {
          // If no last progress, it MUST start at 1 OR connect to a local sibling
          if (seg.ayahStart !== 1) {
             const siblingPredecessor = newSegments.find(s => s !== seg && s.surahNumber === seg.surahNumber && s.ayahEnd === seg.ayahStart - 1);
             if (!siblingPredecessor) {
                return {
                    isValid: false,
                    message: `🚫 بداية خاطئة: عند بدء سورة ${seg.surahNameCanonical} لأول مرة في ${typeLabel}، يجب البدء من الآية 1.`
                };
             }
          }
      }
    }

    return { isValid: true };
  }

  /**
   * التحقق من الاتساق بين الحفظ والمراجعة في نفس الطلب (Cross-Consistency)
   * القاعدة: مقطع المراجعة يجب أن يكون "قبل" مقطع الحفظ في نفس السورة.
   * @param {Array} memorizationMeta 
   * @param {Array} reviewMeta 
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
            
            // حالة خاصة: إذا كان الحفظ يبدأ من الآية 1، لا يمكن وجود مراجعة لنفس السورة
            if (mem.ayahStart === 1) {
                 return {
                     isValid: false,
                     message: `🚫 لا يمكن إضافة مراجعة لسورة ${mem.surahNameCanonical} لأنك بدأت حفظها للتو (من الآية 1).`
                 };
            }

            // القاعدة: التحقق من التداخل
            // إذا كانت المراجعة تتجاوز أو تساوي بداية الحفظ
            if (rev.ayahEnd >= mem.ayahStart) {
                 return {
                     isValid: false,
                     message: `🚫 تداخل في النطاقات (${mem.surahNameCanonical}):\nالمراجعة (${rev.ayahStart}-${rev.ayahEnd}) تتداخل مع الحفظ الجديد (${mem.ayahStart}-${mem.ayahEnd}).\nيجب أن تنتهي المراجعة عند الآية ${mem.ayahStart - 1} كحد أقصى.`
                 };
            }
        }
    }
    return { isValid: true };
  }
}

module.exports = new SectionSequenceService();
