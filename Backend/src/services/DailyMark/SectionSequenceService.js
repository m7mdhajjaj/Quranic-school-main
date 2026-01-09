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
   * @returns {Promise<{lastEnd: number, nextStart: number, lastDate: Date} | null>}
   */
  async getLastProgress(groupId, surahNumber, type) {
    const metaField = type === 'memorization' ? 'memorizationMeta' : 'reviewMeta';

    // البحث عن آخر مقطع يحتوي على هذه السورة
    const lastSection = await Section.findOne({
      group: groupId,
      [`${metaField}.surahNumber`]: surahNumber
    })
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

    return {
      lastEnd: lastSegment.ayahEnd,
      nextStart: lastSegment.ayahEnd + 1,
      lastDate: lastSection.date,
      lastStatus: lastSegment.status
    };
  }

  /**
   * التحقق من صحة التسلسل للمقاطع الجديدة
   * @param {Array} newSegments - المقاطع الجديدة المراد إضافتها
   * @param {string} groupId - معرف الحلقة
   * @param {string} type - 'memorization' | 'review'
   * @param {Date} [newSectionDate] - تاريخ المقطع الجديد
   * @param {string} [excludeSectionId] - استثناء مقطع معين
   * @returns {Promise<{isValid: boolean, message?: string}>}
   */
  async validateSequence(newSegments, groupId, type, newSectionDate = null, excludeSectionId = null) {
    if (!newSegments || newSegments.length === 0) return { isValid: true };

    const metaField = type === 'memorization' ? 'memorizationMeta' : 'reviewMeta';
    const typeLabel = type === 'memorization' ? 'الحفظ' : 'المراجعة';
    
    const newDateStr = newSectionDate ? new Date(newSectionDate).toLocaleDateString('en-CA') : null;

    for (const seg of newSegments) {
      // ===================================
      // 1. التحقق من التداخل (Overlap Check)
      // ===================================
      
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
         // الحفظ: ممنوع التداخل مع أي تاريخ سابق
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
         
         // المراجعة: مسموح التكرار، إلا في نفس اليوم! (منع ازدواجية الخطأ)
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

      // =================================== 
      // 1.5 التحقق من أن المراجعة لا تسبق الحفظ (Review <= Memorization Check)
      // ===================================
      if (type === 'review') {
          // جلب آخر نقطة وصل إليها الحفظ لهذه السورة
          const memProgress = await this.getLastProgress(groupId, seg.surahNumber, 'memorization');
          
          const maxMemorized = memProgress ? memProgress.lastEnd : 0;
          
          if (seg.ayahEnd > maxMemorized) {
               return {
                  isValid: false,
                  message: `🚫 لا يمكن وراجعة ما لم يتم حفظه بعد! أقصى آية تم حفظها في سورة ${seg.surahNameCanonical} هي ${maxMemorized}.`
               };
          }
      }

      // ===================================
      // 2. التحقق من التسلسل (Sequence Gap Check)
      // ===================================
      // نطبق هذا الفحص على الحفظ والمراجعة (بناءً على طلب المستخدم للصرامة)
      // لكن بالنسبة للمراجعة، إذا انتهت السورة، قد نبدأ من 1 مجدداً؟ سنفترض تسلسلاً مستمراً.
      
      const lastProgress = await this.getLastProgress(groupId, seg.surahNumber, type);
      
      if (lastProgress) {
          // يجب أن تكون بداية الجديد = نهاية القديم + 1
          if (seg.ayahStart !== lastProgress.nextStart) {
              const dateStr = new Date(lastProgress.lastDate).toLocaleDateString('ar-EG');
              
              // حالة الفجوة (Gap)
              if (seg.ayahStart > lastProgress.nextStart) {
                   return {
                      isValid: false,
                      message: `🚫 فجوة في ${typeLabel}: آخر ${typeLabel} انتهى عند الآية ${lastProgress.lastEnd} (${dateStr}).\nيجب أن يبدأ الجديد من الآية ${lastProgress.nextStart}.`
                   };
              }
              
              // حالة التراجع/التداخل (Overlap/Regression)
              // (للحفظ: مرفوض. للمراجعة: قد يكون مقبولاً لو كان تكراراً قديماً، لكن المستخدم طلب "نهاية الأول بداية الثاني")
              // لذا سنرفضه للحفاظ على التسلسل الصارم المطلوب.
              if (seg.ayahStart < lastProgress.nextStart) {
                   // إذا لم يمسكه فحص التداخل (لأنه قديم جداً وتم مسحه؟ مستبعد)، 
                   // أو إذا كان مراجعة قديمة (مسموح بها نظرياً، لكننا نفرض التسلسل الآن).
                   
                   // إذا كان مراجعة، وطلب "إعادة"، قد يكون منطقياً. لكن سنلتزم بطلب "16 ثم 17".
                   return {
                      isValid: false,
                      message: `🚫 تسلسل ${typeLabel} غير صحيح: يجب إكمال من الآية ${lastProgress.nextStart} (آخر توقف بتاريخ ${dateStr}).`
                   };
              }
          }
      } else {
          // أول مرة يدخل السورة في هذا النوع
          // هل نفرض البدء من 1 دائماً؟ نعم يفضل.
          if (seg.ayahStart !== 1) {
             // تحذير أو منع؟ دعنا نجعله منعاً لضبط البدايات
             return {
                 isValid: false,
                 message: `🚫 بداية خاطئة: عند بدء سورة ${seg.surahNameCanonical} لأول مرة في ${typeLabel}، يجب البدء من الآية 1.`
             };
          }
      }
    }

    return { isValid: true };
  }
}

module.exports = new SectionSequenceService();
