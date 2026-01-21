const Section = require("../../schema/DailyMark/Section");
const { getSurahByNumber } = require("../../utils/Quran/dailyMarkQuranMetadata");
const { toDateKey, TIMEZONE } = require("../../config/timezone");
const { WEEKLY_QUOTA } = require("../../config/constants");
const { createLogger } = require("../../utils/logger");
const {
  formatErrorMessage,
  MEMORIZATION_ERRORS,
  REVIEW_ERRORS,
  CONSISTENCY_ERRORS,
  QUOTA_ERRORS,
  ACTIVE_SURAH_ERRORS
} = require("../../config/validationMessages");

const logger = createLogger('SectionSequence');

/**
 * ============================================================================
 * SectionSequenceService (V7 Edition)
 * ============================================================================
 * خدمة مركزية لإدارة منطق تسلسل الحفظ والمراجعة في حلقات التحفيظ.
 * 
 * المبادئ الحاكمة (Rules of Engagement):
 * 1. الحفظ (Memorization): بناء تراكمي صارم. لا فجوات. الحجر فوق الحجر.
 * 2. المراجعة (Review): ✅ V7 - مرنة الرينج
 *    - لا يمكن مراجعة ما لم يحفظ (ayahEnd ≤ maxMemorizedAyah).
 *    - يمكن دمج عدة مقاطع في مراجعة واحدة (مثلاً 1-50 دفعة واحدة).
 *    - التسلسل إجباري: ابدأ من 1، ثم أكمل بالتتالي.
 *    - بعد إكمال دورة المراجعة، يمكن البدء من 1 مجدداً.
 * 3. التواريخ: ✅ V7 - الأسبوع الحالي فقط (لا يمكن اختيار أسابيع سابقة/قادمة).
 * 4. التزامن (Concurrency): دعم معالجة عدة مقاطع في طلب واحد (Batch Insert).
 */

class SectionSequenceService {

  /**
   * Detect if any Surah is completed in this batch
   * Checks if the segment ends at the last Ayah of the Surah
   * @param {Array} segments - The new segments
   * @param {string} type - 'memorization' or 'review'
   */
  detectCompletedSurahs(segments, type) {
    const completed = [];
    if (!segments || !Array.isArray(segments)) return completed;

    for (const seg of segments) {
      if (!seg || !seg.surahNumber) continue;
      
      const meta = getSurahByNumber(seg.surahNumber);
      if (meta && seg.ayahEnd >= meta.ayahCount) {
         completed.push({
             surahNumber: seg.surahNumber,
             surahName: meta.name,
             type: type, // 'memorization' or 'review'
             ayahCount: meta.ayahCount
         });
      }
    }
    return completed;
  }

  /**
   * Helper: Convert Date to dateKey (YYYY-MM-DD in Palestine timezone)
   * استخدام توقيت فلسطين لضمان التوافق مع باقي النظام
   * @deprecated استخدم toDateKey مباشرة من config/timezone.js
   */
  toDateKeyLocal(date) {
    return toDateKey(date);
  }

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
   * 🆕 البحث عن أعلى قيمة ayahEnd موجودة بغض النظر عن التاريخ
   * هذا ضروري للتحقق بعد حذف مقطع - يجب أن نعرف أين وصلنا فعلياً
   * 
   * @param {string} groupId - معرف الحلقة
   * @param {number} surahNumber - رقم السورة
   * @param {string} type - 'memorization' | 'review'
   * @param {string} [excludeSectionId] - استثناء مقطع معين (عند التعديل)
   * @returns {Promise<{maxEnd: number, nextStart: number, sectionDate: Date}|null>}
   */
  async getMaxProgress(groupId, surahNumber, type, excludeSectionId = null, limitDateKey = null) {
    const metaField = type === 'memorization' ? 'memorizationMeta' : 'reviewMeta';

    const query = {
      group: groupId,
      [`${metaField}.surahNumber`]: surahNumber
    };

    if (excludeSectionId) {
      query._id = { $ne: excludeSectionId };
    }

    // جلب جميع المقاطع لهذه السورة
    const sections = await Section.find(query)
      .select(`${metaField} date`)
      .lean();

    if (!sections || sections.length === 0) return null;

    // البحث عن أعلى قيمة ayahEnd بين جميع المقاطع
    let maxEnd = 0;
    let maxDate = null;

    for (const section of sections) {
      // إذا تم تحديد حد للتاريخ، نتجاهل أي سجلات في نفس اليوم أو بعده
      if (limitDateKey) {
        const sectionDateKey = this.toDateKeyLocal(section.date);
        if (sectionDateKey >= limitDateKey) continue;
      }

      const segments = section[metaField].filter(s => s.surahNumber === surahNumber);
      for (const seg of segments) {
        if (seg.ayahEnd > maxEnd) {
          maxEnd = seg.ayahEnd;
          maxDate = section.date;
        }
      }
    }

    if (maxEnd === 0) return null;

    return {
      maxEnd,
      nextStart: maxEnd + 1,
      sectionDate: maxDate
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
    
    // ✅ استخدام dateKey بدلاً من التحويل اليدوي
    const newDateKey = newSectionDate 
      ? this.toDateKeyLocal(newSectionDate) 
      : null;

    // ====================================================
    // 🆕 V6: فحص الترتيب الزمني الصارم (Monotonic Order) - للحفظ والمراجعة
    // القاعدة: date1 < date2 ⟹ ayahStart1 ≤ ayahStart2
    // ====================================================
    if (newSectionDate) {
      for (const seg of newSegments) {
        const monotonicCheck = await this.validateMonotonicOrder(
          groupId, 
          seg.surahNumber, 
          seg.ayahStart, 
          seg.ayahEnd, 
          newSectionDate, 
          excludeSectionId,
          type // ✅ V6: تمرير النوع للتحقق من الحفظ أو المراجعة
        );
        
        if (!monotonicCheck.isValid) {
          return monotonicCheck;
        }
      }
    }

    for (const seg of newSegments) {
      
      // ====================================================
      // 1. منع التداخل والتكرار (Overlap & Duplicate Check)
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

      const potentialConflicts = await Section.find(overlapQuery).select(`date dateKey ${metaField}`);

      for (const conflictingSection of potentialConflicts) {
         // أ. تكرار الحفظ (ممنوع منعاً باتاً - في أي تاريخ)
         if (type === 'memorization') {
            const conflictSeg = conflictingSection[metaField].find(s => 
                s.surahNumber === seg.surahNumber && 
                s.ayahStart <= seg.ayahEnd && 
                s.ayahEnd >= seg.ayahStart
            );
            
            if (conflictSeg) {
              const dateStr = new Date(conflictingSection.date).toLocaleDateString('ar-EG', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                timeZone: TIMEZONE
              });
              
              return {
                isValid: false,
                message: MEMORIZATION_ERRORS.DUPLICATE(seg.surahNumber, seg.ayahStart, seg.ayahEnd, dateStr)
              };
            }
         }
         
         // ب. تكرار المراجعة (ممنوع في نفس اليوم فقط - باستخدام dateKey)
         if (type === 'review' && newDateKey) {
             const conflictDateKey = conflictingSection.dateKey || this.toDateKeyLocal(conflictingSection.date);
             
             if (conflictDateKey === newDateKey) {
                 const exactMatch = conflictingSection[metaField].find(s =>
                   s.surahNumber === seg.surahNumber &&
                   s.ayahStart === seg.ayahStart &&
                   s.ayahEnd === seg.ayahEnd
                 );
                 
                 if (exactMatch) {
                   return {
                     isValid: false,
                     message: REVIEW_ERRORS.SAME_DAY_DUPLICATE(seg.surahNumber, seg.ayahStart, seg.ayahEnd)
                   };
                 }
             }
         }
      }

      // ====================================================
      // 2. منطق المراجعة المرن (V9: Review ALWAYS starts from 1)
      // ====================================================
      if (type === 'review') {
          // ✅ V9: القواعد الجديدة للمراجعة:
          // 1. المراجعة تبدأ دائماً من 1
          // 2. نهاية المراجعة = آخر آية محفوظة قبل التاريخ المحدد (ليس نفس اليوم)
          // 3. إذا كانت نفس سورة الحفظ في نفس اليوم: review.end = memorization.start - 1
          
          // ✅ V9: Review range is flexible (previously forced start from 1)
          
          // الحصول على أقصى تقدم في الحفظ لهذه السورة
          // ✅ V9: تمرير newDateKey لضمان احتساب المحفوظات السابقة فقط (قبل اليوم الحالي)
          const maxMemProgress = await this.getMaxProgress(groupId, seg.surahNumber, 'memorization', null, newDateKey);
          
          // ✅ V9: Check if there's same-day memorization for the same surah (sibling)
          let sameDayMemEnd = 0;
          if (siblingSegments && siblingSegments.length > 0) {
              const siblingOfSameSurah = siblingSegments.filter(m => m.surahNumber === seg.surahNumber);
              for (const sib of siblingOfSameSurah) {
                  if (sib.ayahStart && sib.ayahStart > 1) {
                      // If memorization starts from X, review can only go up to X-1
                      sameDayMemEnd = sib.ayahStart - 1;
                  }
              }
          }
          
          // أقصى آية محفوظة (من DB قبل اليوم الحالي)
          const maxMemorizedAyah = maxMemProgress?.maxEnd || 0;
          
          // ✅ V9: Determine the actual review limit
          // If same-day memorization exists, use the lower value
          let reviewLimit = maxMemorizedAyah;
          if (sameDayMemEnd > 0 && sameDayMemEnd < reviewLimit) {
              reviewLimit = sameDayMemEnd;
          }
          
          // ✅ فحص 1: لا يمكن مراجعة ما لم يُحفظ قبل هذا التاريخ
          if (maxMemorizedAyah === 0 && sameDayMemEnd === 0) {
              return {
                  isValid: false,
                  message: REVIEW_ERRORS.NO_MEMORIZATION(seg.surahNumber, seg.ayahStart, seg.ayahEnd)
              };
          }
          
          // ✅ V9: If no memorization before this date, but there's same-day memorization
          if (maxMemorizedAyah === 0 && sameDayMemEnd > 0) {
              return {
                  isValid: false,
                  message: `❌ لا يمكن مراجعة سورة ${seg.surahNumber} في نفس يوم الحفظ. يجب حفظها أولاً ثم مراجعتها في يوم لاحق.`
              };
          }
          
          // ✅ فحص 2: لا يمكن للمراجعة أن تتجاوز آخر آية محفوظة قبل هذا التاريخ
          if (seg.ayahEnd > reviewLimit) {
              if (sameDayMemEnd > 0) {
                  return {
                      isValid: false,
                      message: `❌ نهاية المراجعة (${seg.ayahEnd}) تتجاوز الحد المسموح (${reviewLimit}). يوجد حفظ جديد في نفس اليوم يبدأ من ${sameDayMemEnd + 1}.`
                  };
              }
              return {
                  isValid: false,
                  message: REVIEW_ERRORS.EXCEEDS_MEMORIZATION(seg.ayahEnd, maxMemorizedAyah)
              };
          }
      }

      // ====================================================
      // 3. منطق الحفظ الصارم (DATE-AWARE with Backfilling Support)
      // ====================================================
      if (type === 'memorization') {
        // ✅ V4: فحص مزدوج - الجيران الزمنيين + أعلى قيمة موجودة
        
        // أ) جلب الجيران الزمنيين (للتحقق من الـ Backfilling)
        const neighbors = await this.getNeighborSegments(
          groupId, 
          seg.surahNumber, 
          type, 
          newSectionDate, 
          excludeSectionId
        );

        // ب) 🆕 جلب أعلى قيمة ayahEnd موجودة (بغض النظر عن التاريخ)
        // هذا يغطي حالة: "حذفت مقطع 11-20، الآن أريد إضافة مقطع جديد"
        const maxProgress = await this.getMaxProgress(
          groupId,
          seg.surahNumber,
          type,
          excludeSectionId
        );

        // [منطق إضافي] التحقق من السورة المكتملة (باستخدام maxProgress)
        const surahInfo = getSurahByNumber(seg.surahNumber);
        if (maxProgress && surahInfo) {
            if (maxProgress.maxEnd >= surahInfo.ayahCount) {
                 return {
                    isValid: false,
                    message: MEMORIZATION_ERRORS.SURAH_COMPLETED(surahInfo.name || surahInfo.nameAr, surahInfo.ayahCount, maxProgress.maxEnd)
                 };
            }
        }

        // التحقق من اتصال محلي (Local Sibling) في نفس الطلب
        // 🆕 نقلته لأعلى لاستخدامه في فحص maxProgress
        const hasLocalPredecessor = newSegments.some(s => 
          s !== seg && 
          s.surahNumber === seg.surahNumber && 
          s.ayahEnd === seg.ayahStart - 1
        );

        const hasLocalSuccessor = newSegments.some(s => 
          s !== seg && 
          s.surahNumber === seg.surahNumber && 
          s.ayahStart === seg.ayahEnd + 1
        );
        
        // 🆕 التحقق من أن المقطع الجديد يبدأ من بعد أعلى قيمة موجودة
        // (مهم جداً لحالة: حذفت 11-20، الآن أحاول إضافة 15-25 → خطأ!)
        if (maxProgress && seg.ayahStart <= maxProgress.maxEnd) {
            // التحقق: هل المقطع الجديد يتداخل مع ما تم حفظه سابقاً؟
            // نسمح فقط إذا كان المقطع جديد تماماً (ayahStart > maxEnd)
            // أو إذا كان ترميماً صحيحاً (الجيران الزمنيين سيتحققون من هذا)
            
            // إذا لم يكن هناك جار سابق زمنياً (يعني لا يوجد backfilling)
            // ولكن يوجد maxProgress، فهذا يعني محاولة إعادة حفظ
            if (!neighbors.previous && !hasLocalPredecessor && seg.ayahStart !== 1) {
                return {
                    isValid: false,
                    message: MEMORIZATION_ERRORS.OVERLAP(seg.ayahStart, maxProgress.maxEnd, maxProgress.nextStart)
                };
            }
        }

        // إذا كان متصل محلياً، نتجاهل فحص الجيران الخارجيين لهذا الاتجاه
        const effectivePrevious = hasLocalPredecessor ? null : neighbors.previous;
        const effectiveNext = hasLocalSuccessor ? null : neighbors.next;

        // التحقق من الإدراج بين الجيران
        const validationResult = this.validateInsertionWithNeighbors(
          seg,
          effectivePrevious,
          effectiveNext,
          type
        );

        if (!validationResult.isValid) {
          // Reformat error if it's not formatted 
          if (!validationResult.message.startsWith('❌')) {
              validationResult.message = MEMORIZATION_ERRORS.SEQUENCE_ERROR(validationResult.message);
          }
          return validationResult;
        }

        // فحص إضافي: أول حفظ في السورة يجب أن يبدأ من 1
        // 🆕 V4: نتحقق أيضاً من maxProgress - إذا لا يوجد أي حفظ سابق
        if (!neighbors.previous && !hasLocalPredecessor && !maxProgress && seg.ayahStart !== 1) {
          return {
            isValid: false,
            message: MEMORIZATION_ERRORS.WRONG_START(seg.surahNumber, seg.ayahStart)
          };
        }

        // ملاحظة: فحص maxProgress والتداخل تم أعلاه (بعد جلب maxProgress مباشرة)
      }
    }

    return { isValid: true };
  }

  /**
   * ✅ V7: التحقق من أن التاريخ ضمن الأسبوع الحالي (Current Week Only Rule)
   * يمنع اختيار تواريخ خارج الأسبوع الحالي (السبت - الجمعة)
   * 
   * @param {Date} date - التاريخ المراد التحقق منه
   * @returns {{ isValid: boolean, message?: string }}
   */
  checkCurrentWeekOnly(date) {
      if (!date) return { isValid: true };
      
      // الحصول على "الآن" بتوقيت فلسطين
      const now = new Date();
      
      // حساب بداية ونهاية الأسبوع الحالي
      const dayIndex = now.getDay(); // 0 (Sun) to 6 (Sat)
      const distFromSat = (dayIndex + 1) % 7; // عدد الأيام للعودة للسبت
      
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - distFromSat);
      startOfWeek.setHours(0, 0, 0, 0);
      
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 7); // نهاية الجمعة (= بداية السبت القادم)
      endOfWeek.setHours(0, 0, 0, 0);
      
      // التحقق من التاريخ المُدخل
      const inputDate = new Date(date);
      inputDate.setHours(0, 0, 0, 0);
      
      // تنسيق التواريخ للعرض
      const formatDate = (dateObj) => {
         return dateObj.toLocaleDateString('ar-EG', { 
             weekday: 'long',
             day: 'numeric', 
             month: 'numeric',
             timeZone: TIMEZONE 
         });
      };
      
      // التحقق: هل التاريخ ضمن الأسبوع الحالي؟
      if (inputDate < startOfWeek || inputDate >= endOfWeek) {
          const isInFuture = inputDate >= endOfWeek;
          
          return {
              isValid: false,
              message: isInFuture 
                  ? QUOTA_ERRORS.FUTURE_WEEK()
                  : QUOTA_ERRORS.PAST_WEEK()
          };
      }
      
      return { isValid: true };
  }

  /**
   * ✅ التحقق من وجود تسميع سابق لنفس اليوم (One Section Per Day Rule)
   * تمنع إضافة أكثر من سجل واحد لنفس الحلقة في نفس اليوم (24H).
   */
  async checkDailyQuota(groupId, date, excludeSectionId = null) {
      if (!date || !groupId) return { isValid: true, isBlocked: false };

      const dateKey = this.toDateKeyLocal(date);
      
      const query = {
          group: groupId,
          dateKey: dateKey
      };

      if (excludeSectionId) {
          query._id = { $ne: excludeSectionId };
      }

      const existingSection = await Section.findOne(query).select('_id');

      if (existingSection) {
          return {
              isValid: false,
              isBlocked: true,
              message: QUOTA_ERRORS.DAILY_LIMIT(dateKey)
          };
      }

      return { isValid: true, isBlocked: false };
  }

  /**
   * ✅ التحقق من الحد الأسبوعي (3 مقاطع كحد أقصى)
   * تمنع إضافة أكثر من 3 سجلات للحلقة في الأسبوع الواحد (السبت - الجمعة).
   * يتم حساب التواريخ بدقة لضمان التعامل مع نويقلات الأشهر (مثلاً نهاية فبراير).
   */
  async checkWeeklyQuota(groupId, date, excludeSectionId = null) {
      if (!date || !groupId) return { isValid: true };

      // 1. تحديد بداية ونهاية الأسبوع بدقة (UTC لضمان التوافق)
      const d = new Date(date);
      
      // السبت = 6، الجمعة = 5
      // نريد العودة إلى أقرب يوم سبت (بداية الأسبوع)
      const dayIndex = d.getDay(); // 0 (Sun) to 6 (Sat)
      const distFromSat = (dayIndex + 1) % 7; // عدد الأيام للعودة للوراء للوصول للسبت
      
      const startOfWeek = new Date(d);
      startOfWeek.setDate(d.getDate() - distFromSat);
      startOfWeek.setHours(0, 0, 0, 0); // تصفير الوقت
      
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 7); // الجمعة نهاية اليوم (أو السبت القادم بداية اليوم)
      endOfWeek.setHours(0, 0, 0, 0); 
      
      // 2. الاستعلام عن المقاطع في هذا النطاق
      const query = {
          group: groupId,
          date: { $gte: startOfWeek, $lt: endOfWeek }
      };

      if (excludeSectionId) {
          query._id = { $ne: excludeSectionId };
      }

      const count = await Section.countDocuments(query);
      
      // 3. التحقق من الحد (WEEKLY_QUOTA من config/constants)
      if (count >= WEEKLY_QUOTA) {
          // تنسيق التاريخ للعرض في الرسالة بشكل مقروء
          const formatDate = (dateObj) => {
             return dateObj.toLocaleDateString('ar-EG', { day: 'numeric', month: 'numeric', timeZone: TIMEZONE });
          };

          return {
              isValid: false,
              message: QUOTA_ERRORS.WEEKLY_LIMIT(
                  WEEKLY_QUOTA, 
                  formatDate(startOfWeek), 
                  formatDate(new Date(endOfWeek.getTime() - 1)), 
                  count
              )
          };
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
   * 
   * ✅ V6: قواعد جديدة:
   * 1. لا يمكن حفظ ومراجعة نفس المقطع من نفس السورة في نفس الطلب
   * 2. المراجعة تكون للمقاطع المحفوظة سابقاً فقط (الحفظ يسبق المراجعة بمقطع على الأقل)
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
            
            // ✅ V6: لا يمكنك مراجعة سورة بدأت حفظها للتو (أول مقطع)
            if (mem.ayahStart === 1) {
                 return {
                     isValid: false,
                     message: CONSISTENCY_ERRORS.REVIEW_NEW_SURAH(rev.surahNumber)
                 };
            }

            // ✅ V6: لا يمكن مراجعة نفس المقطع الذي يتم حفظه الآن (تطابق تام)
            if (rev.ayahStart === mem.ayahStart && rev.ayahEnd === mem.ayahEnd) {
                 return {
                     isValid: false,
                     message: CONSISTENCY_ERRORS.SAME_SEGMENT(rev.ayahStart, rev.ayahEnd, rev.surahNumber)
                 };
            }

            // ✅ V6: لا يمكن للمراجعة أن تتقاطع مع الحفظ الجديد (المراجعة للماضي فقط)
            // المراجعة يجب أن تنتهي قبل بداية الحفظ الجديد
            if (rev.ayahEnd >= mem.ayahStart) {
                 return {
                     isValid: false,
                     message: CONSISTENCY_ERRORS.REVIEW_OVERLAPS_MEMORIZATION(rev.ayahStart, rev.ayahEnd, mem.ayahStart, mem.ayahEnd)
                 };
            }
        }
    }
    return { isValid: true };
  }

  /**
   * ============================================================================
   * 🆕 V3: DATE-AWARE NEIGHBOR QUERIES (Backfilling Support)
   * ============================================================================
   */

  /**
   * Get the closest segment BEFORE and AFTER a given date for backfilling validation
   * 
   * @param {string} groupId - الحلقة
   * @param {number} surahNumber - رقم السورة
   * @param {string} type - 'memorization' | 'review'
   * @param {Date} targetDate - التاريخ المستهدف للمقطع الجديد
   * @param {string} excludeSectionId - استثناء مقطع معين (عند التعديل)
   * @returns {Promise<{previous: object|null, next: object|null}>}
   */
  async getNeighborSegments(groupId, surahNumber, type, targetDate, excludeSectionId = null) {
    const metaField = type === 'memorization' ? 'memorizationMeta' : 'reviewMeta';
    
    const baseQuery = {
      group: groupId,
      [`${metaField}.surahNumber`]: surahNumber
    };

    if (excludeSectionId) {
      baseQuery._id = { $ne: excludeSectionId };
    }

    // 1. Find previous neighbor (أقرب مقطع قبل targetDate)
    const previousSection = await Section.findOne({
      ...baseQuery,
      date: { $lt: targetDate }
    })
      .sort({ date: -1 }) // الأحدث من بين المقاطع السابقة
      .select(`${metaField} date dateKey`)
      .lean();

    let previousNeighbor = null;
    if (previousSection) {
      const segments = previousSection[metaField].filter(s => s.surahNumber === surahNumber);
      if (segments.length > 0) {
        // نأخذ المقطع ذو أكبر ayahEnd (الأبعد في السورة)
        const latest = segments.reduce((max, seg) => seg.ayahEnd > max.ayahEnd ? seg : max);
        previousNeighbor = {
          ayahStart: latest.ayahStart,
          ayahEnd: latest.ayahEnd,
          canonicalKey: latest.canonicalKey,
          date: previousSection.date,
          dateKey: previousSection.dateKey
        };
      }
    }

    // 2. Find next neighbor (أقرب مقطع بعد targetDate)
    const nextSection = await Section.findOne({
      ...baseQuery,
      date: { $gt: targetDate }
    })
      .sort({ date: 1 }) // الأقدم من بين المقاطع اللاحقة
      .select(`${metaField} date dateKey`)
      .lean();

    let nextNeighbor = null;
    if (nextSection) {
      const segments = nextSection[metaField].filter(s => s.surahNumber === surahNumber);
      if (segments.length > 0) {
        // نأخذ المقطع ذو أصغر ayahStart (الأقرب في السورة)
        const earliest = segments.reduce((min, seg) => seg.ayahStart < min.ayahStart ? seg : min);
        nextNeighbor = {
          ayahStart: earliest.ayahStart,
          ayahEnd: earliest.ayahEnd,
          canonicalKey: earliest.canonicalKey,
          date: nextSection.date,
          dateKey: nextSection.dateKey
        };
      }
    }

    return { previous: previousNeighbor, next: nextNeighbor };
  }

  /**
   * Validate that a new segment fits perfectly between its neighbors (date-aware)
   * 
   * @param {object} newSegment - المقطع الجديد { surahNumber, ayahStart, ayahEnd, canonicalKey }
   * @param {object|null} previousNeighbor - المقطع السابق زمنياً
   * @param {object|null} nextNeighbor - المقطع اللاحق زمنياً
   * @param {string} type - 'memorization' | 'review'
   * @returns {{ isValid: boolean, message?: string }}
   */
  validateInsertionWithNeighbors(newSegment, previousNeighbor, nextNeighbor, type) {
    const typeLabel = type === 'memorization' ? 'الحفظ' : 'المراجعة';
    const segDesc = `${newSegment.canonicalKey}`;

    // A) Check if previousNeighbor exists
    if (previousNeighbor) {
      // 0. Completion check: هل السورة مكتملة بالفعل؟
      if (type === 'memorization') {
         const surahInfo = getSurahByNumber(newSegment.surahNumber);
         if (surahInfo && previousNeighbor.ayahEnd >= surahInfo.ayahCount) {
             return {
                 isValid: false,
                 message: MEMORIZATION_ERRORS.SURAH_COMPLETED(
                   surahInfo.name, 
                   surahInfo.ayahCount, 
                   previousNeighbor.ayahEnd
                 )
             };
         }
      }

      // 1. Gap check (للحفظ فقط): المقطع الجديد يجب أن يبدأ من نهاية السابق + 1
      if (type === 'memorization') {
        const expectedStart = previousNeighbor.ayahEnd + 1;
        if (newSegment.ayahStart !== expectedStart) {
          return {
            isValid: false,
            message: MEMORIZATION_ERRORS.GAP(expectedStart, newSegment.ayahStart)
          };
        }
      }

      // 2. Overlap check: المقطع الجديد لا يجب أن يتداخل مع السابق
      if (newSegment.ayahStart <= previousNeighbor.ayahEnd) {
        return {
          isValid: false,
          message: MEMORIZATION_ERRORS.OVERLAP(
            newSegment.ayahStart, 
            previousNeighbor.ayahEnd, 
            previousNeighbor.ayahEnd + 1
          )
        };
      }
    }

    // B) Check if nextNeighbor exists
    if (nextNeighbor) {
      // 1. Gap check (للحفظ فقط): المقطع الجديد يجب أن ينتهي عند بداية اللاحق - 1
      if (type === 'memorization') {
        const expectedEnd = nextNeighbor.ayahStart - 1;
        if (newSegment.ayahEnd !== expectedEnd) {
          const nextDate = nextNeighbor.dateKey ? 
            new Date(nextNeighbor.date).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric', timeZone: TIMEZONE }) 
            : 'غير معروف';
          
          return {
            isValid: false,
            message: MEMORIZATION_ERRORS.NEXT_GAP(newSegment.ayahEnd, nextNeighbor.ayahStart, nextDate)
          };
        }
      }

      // 2. Overlap check: المقطع الجديد لا يجب أن يتداخل مع اللاحق
      if (newSegment.ayahEnd >= nextNeighbor.ayahStart) {
        const nextDate = nextNeighbor.dateKey ? 
          new Date(nextNeighbor.date).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric', timeZone: TIMEZONE }) 
          : 'غير معروف';
        
        return {
          isValid: false,
          message: MEMORIZATION_ERRORS.NEXT_OVERLAP(newSegment.ayahEnd, nextNeighbor.ayahStart, nextDate)
        };
      }
    }

    // C) Perfect bridge: إذا كان هناك جيران من الطرفين (للحفظ)
    if (type === 'memorization' && previousNeighbor && nextNeighbor) {
      // يجب أن يسد المقطع الجديد الفجوة بالضبط
      const gapStart = previousNeighbor.ayahEnd + 1;
      const gapEnd = nextNeighbor.ayahStart - 1;
      
      if (newSegment.ayahStart !== gapStart || newSegment.ayahEnd !== gapEnd) {
        return {
          isValid: false,
          message: MEMORIZATION_ERRORS.BRIDGE_INCOMPLETE(segDesc, gapStart, gapEnd, previousNeighbor.canonicalKey, nextNeighbor.canonicalKey)
        };
      }
    }

    return { isValid: true };
  }

  // ============================================================================
  // 🆕 V6: MONOTONIC ORDER VALIDATION - للحفظ والمراجعة
  // ============================================================================

  /**
   * 🔒 التحقق من الترتيب الزمني الصارم (Monotonic Order)
   * 
   * القاعدة الذهبية: إذا كان date1 < date2 ⟹ لازم يكون ayahStart1 ≤ ayahStart2
   * 
   * يمنع حالات مثل:
   * - تاريخ 10/1 → آيات 50-60
   * - تاريخ 11/1 → آيات 11-20 ❌ (تاريخ أحدث لكن آيات أقدم)
   * 
   * ✅ V6: يُطبق على الحفظ والمراجعة (لنفس السورة)
   * 
   * @param {string} groupId - معرف الحلقة
   * @param {number} surahNumber - رقم السورة
   * @param {number} ayahStart - بداية المقطع الجديد
   * @param {number} ayahEnd - نهاية المقطع الجديد
   * @param {Date} proposedDate - التاريخ المقترح
   * @param {string} excludeSectionId - استثناء مقطع (عند التعديل)
   * @param {string} type - 'memorization' أو 'review'
   * @returns {Promise<{isValid: boolean, message?: string}>}
   */
  async validateMonotonicOrder(groupId, surahNumber, ayahStart, ayahEnd, proposedDate, excludeSectionId = null, type = 'memorization') {
    const metaField = type === 'memorization' ? 'memorizationMeta' : 'reviewMeta';
    const typeLabel = type === 'memorization' ? 'الحفظ' : 'المراجعة';
    
    // 🔍 LOG: بداية التحقق من الترتيب
    console.log('\n========== validateMonotonicOrder START ==========');
    console.log('📥 Input Params:', {
      groupId,
      surahNumber,
      ayahStart,
      ayahEnd,
      proposedDate,
      proposedDateKey: this.toDateKeyLocal(proposedDate),
      excludeSectionId,
      type
    });
    
    // جلب جميع المقاطع الموجودة لهذه السورة (من نفس النوع)
    const query = {
      group: groupId,
      [`${metaField}.surahNumber`]: surahNumber
    };
    
    if (excludeSectionId) {
      query._id = { $ne: excludeSectionId };
    }
    
    console.log('🔍 MongoDB Query:', JSON.stringify(query, null, 2));
    
    const sections = await Section.find(query)
      .select(`${metaField} date dateKey`)
      .lean();
    
    console.log('📊 Found Sections Count:', sections?.length || 0);
    
    if (!sections || sections.length === 0) {
      console.log('✅ No existing sections - VALID');
      console.log('========== validateMonotonicOrder END ==========\n');
      return { isValid: true }; // لا توجد مقاطع سابقة
    }
    
    // بناء قائمة المقاطع مع تواريخها
    const existingSegments = [];
    for (const section of sections) {
      const metas = section[metaField].filter(m => m.surahNumber === surahNumber);
      for (const m of metas) {
        existingSegments.push({
          ayahStart: m.ayahStart,
          ayahEnd: m.ayahEnd,
          date: section.date,
          dateKey: section.dateKey,
          sectionId: section._id
        });
      }
    }
    
    // ترتيب حسب التاريخ
    existingSegments.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    console.log('📋 Existing Segments (sorted by date):');
    existingSegments.forEach((seg, i) => {
      console.log(`   ${i + 1}. Date: ${seg.dateKey} | Ayahs: ${seg.ayahStart}-${seg.ayahEnd} | SectionId: ${seg.sectionId}`);
    });
    
    const proposedTime = new Date(proposedDate);
    proposedTime.setHours(0, 0, 0, 0);
    console.log('📅 Proposed Date (normalized):', proposedTime.toISOString());
    
    for (const existing of existingSegments) {
      const existingTime = new Date(existing.date);
      existingTime.setHours(0, 0, 0, 0);
      
      console.log(`\n🔄 Comparing with: DateKey=${existing.dateKey}, Ayahs=${existing.ayahStart}-${existing.ayahEnd}`);
      console.log(`   proposedTime: ${proposedTime.toISOString()}`);
      console.log(`   existingTime: ${existingTime.toISOString()}`);
      console.log(`   proposedTime < existingTime: ${proposedTime < existingTime}`);
      console.log(`   proposedTime > existingTime: ${proposedTime > existingTime}`);
      console.log(`   proposedTime === existingTime: ${proposedTime.getTime() === existingTime.getTime()}`);
      
      // حالة 1: التاريخ المقترح أقدم من الموجود
      if (proposedTime < existingTime) {
        console.log(`   📌 Case 1: Proposed date is OLDER than existing`);
        console.log(`   Check: ayahStart(${ayahStart}) > existing.ayahStart(${existing.ayahStart}) = ${ayahStart > existing.ayahStart}`);
        // يجب أن تكون الآيات المقترحة أقدم أو مساوية
        if (ayahStart > existing.ayahStart) {
          console.log('   ❌ CONFLICT DETECTED - Proposed ayahs are NEWER but date is OLDER');
          console.log('========== validateMonotonicOrder END (INVALID) ==========\n');
          
          // استخدام الرسائل المركزية حسب النوع
          const errorFn = type === 'memorization' 
            ? MEMORIZATION_ERRORS.DATE_ORDER_OLDER 
            : REVIEW_ERRORS.DATE_ORDER_OLDER;
          
          return {
            isValid: false,
            message: errorFn(
              this.toDateKeyLocal(proposedDate),
              existing.dateKey,
              `${ayahStart}-${ayahEnd}`,
              `${existing.ayahStart}-${existing.ayahEnd}`
            )
          };
        }
      }
      
      // حالة 2: التاريخ المقترح أحدث من الموجود
      if (proposedTime > existingTime) {
        console.log(`   📌 Case 2: Proposed date is NEWER than existing`);
        console.log(`   Check: ayahStart(${ayahStart}) < existing.ayahStart(${existing.ayahStart}) = ${ayahStart < existing.ayahStart}`);
        // يجب أن تكون الآيات المقترحة أحدث أو مساوية
        if (ayahStart < existing.ayahStart) {
          console.log('   ❌ CONFLICT DETECTED - Proposed ayahs are OLDER but date is NEWER');
          console.log('========== validateMonotonicOrder END (INVALID) ==========\n');
          
          // استخدام الرسائل المركزية حسب النوع
          const errorFn = type === 'memorization' 
            ? MEMORIZATION_ERRORS.DATE_ORDER_NEWER 
            : REVIEW_ERRORS.DATE_ORDER_NEWER;
          
          return {
            isValid: false,
            message: errorFn(
              this.toDateKeyLocal(proposedDate),
              existing.dateKey,
              `${ayahStart}-${ayahEnd}`,
              `${existing.ayahStart}-${existing.ayahEnd}`
            )
          };
        }
      }
      
      console.log('   ✅ No conflict with this segment');
    }
    
    console.log('\n✅ All checks passed - VALID');
    console.log('========== validateMonotonicOrder END ==========\n');
    return { isValid: true };
  }
}

module.exports = new SectionSequenceService();
