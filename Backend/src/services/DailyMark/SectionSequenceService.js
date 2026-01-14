const Section = require("../../schema/DailyMark/Section");
const { getSurahByNumber } = require("../../utils/Quran/dailyMarkQuranMetadata");

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


  // helper to format clear arabic errors
  formatErrorMessage(title, details, advice) {
      return `❌ ${title}\n\n📝 التفاصيل: ${details}\n\n💡 الحل: ${advice}`;
  }

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
   * Helper: Convert Date to dateKey (YYYY-MM-DD in UTC)
   */
  toDateKeyUTC(date) {
    const dt = new Date(date);
    const y = dt.getUTCFullYear();
    const m = String(dt.getUTCMonth() + 1).padStart(2, "0");
    const day = String(dt.getUTCDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
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
  async getMaxProgress(groupId, surahNumber, type, excludeSectionId = null) {
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
      ? this.toDateKeyUTC(newSectionDate) 
      : null;

    // ====================================================
    // 🆕 V5: فحص الترتيب الزمني الصارم (Monotonic Order)
    // القاعدة: date1 < date2 ⟹ ayahStart1 ≤ ayahStart2
    // ====================================================
    if (newSectionDate && type === 'memorization') {
      for (const seg of newSegments) {
        const monotonicCheck = await this.validateMonotonicOrder(
          groupId, 
          seg.surahNumber, 
          seg.ayahStart, 
          seg.ayahEnd, 
          newSectionDate, 
          excludeSectionId
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
                day: 'numeric'
              });
              
              // رسالة مفصلة للمستخدم - تكرار حفظ
              return {
                isValid: false,
                message: this.formatErrorMessage(
                    "تكرار الحفظ ممنوع",
                    `الآيات ${seg.ayahStart} إلى ${seg.ayahEnd} من سورة ${seg.surahNumber} محفوظة مسبقاً بتاريخ ${dateStr}.`,
                    "لا يمكنك حفظ نفس المقطع مرتين. يرجى مراجعة السجل."
                )
              };
            }
         }
         
         // ب. تكرار المراجعة (ممنوع في نفس اليوم فقط - باستخدام dateKey)
         if (type === 'review' && newDateKey) {
             const conflictDateKey = conflictingSection.dateKey || this.toDateKeyUTC(conflictingSection.date);
             
             if (conflictDateKey === newDateKey) {
                 const exactMatch = conflictingSection[metaField].find(s =>
                   s.surahNumber === seg.surahNumber &&
                   s.ayahStart === seg.ayahStart &&
                   s.ayahEnd === seg.ayahEnd
                 );
                 
                 if (exactMatch) {
                   return {
                     isValid: false,
                     message: this.formatErrorMessage(
                         "تكرار المراجعة في نفس اليوم",
                         `المقطع ${seg.ayahStart}-${seg.ayahEnd} من سورة ${seg.surahNumber}.`,
                         "لقد قمت بإضافة هذا المقطع للمراجعة في سجل سابق اليوم."
                     )
                   };
                 }
             }
         }
      }

      // ====================================================
      // 2. منطق المراجعة الصارم (Exact Match to Memorization)
      // ====================================================
      if (type === 'review') {
          // القاعدة: نطاق المراجعة يجب أن يطابق بدقة نطاق حفظ سابق.
          
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

             // ✅ إضافة شرط التاريخ: يجب أن يكون الحفظ قد تم في وقت سابق أو نفس وقت المراجعة
             if (newSectionDate) {
                 memQuery.date = { $lte: newSectionDate };
             }

             const exists = await Section.exists(memQuery);
             if (exists) strictMatchFound = true;
          }

          if (!strictMatchFound) {
              return {
                  isValid: false,
                  message: this.formatErrorMessage(
                      "المراجعة غير مطابقة للحفظ السابق",
                      `المقطع المطلوب: سورة ${seg.surahNumber} (الآيات ${seg.ayahStart}-${seg.ayahEnd})`,
                      "لم نجد سجلاً سابقاً لهذا المقطع بنفس البداية والنهاية. يجب أن تراجع نفس المقطع الذي حفظته سابقاً بالضبط (نفس عدد الآيات)، لا يمكنك زيادة أو إنقاص الآيات في المراجعة."
                  )
              };
          }

          // فحص التسلسل الزمني للمراجعة (Cycles) - اختياري وتحذيري
          const lastReview = await this.getLastProgress(groupId, seg.surahNumber, 'review', newSectionDate, excludeSectionId);
          let expectedStart = 1;
          
          if (lastReview) {
             expectedStart = lastReview.nextStart;
          }

          // التحقق من الاتصال (Continuity)
          const hasLocalPredecessor = newSegments.some(s => 
            s !== seg && 
            s.surahNumber === seg.surahNumber && 
            s.ayahEnd === seg.ayahStart - 1
          );

          if (!hasLocalPredecessor && seg.ayahStart !== expectedStart && seg.ayahStart !== 1) {
              // تحذير فقط (لا نمنع، لكن نعلم المستخدم)
              console.warn(`⚠️ تنبيه: المراجعة [${seg.surahNumber}:${seg.ayahStart}-${seg.ayahEnd}] لا تتبع التسلسل المتوقع (كان متوقع من ${expectedStart}).`);
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
                    message: this.formatErrorMessage(
                        "السورة مكتملة الحفظ بالفعل",
                        `سورة ${surahInfo.name || surahInfo.nameAr} عدد آياتها ${surahInfo.ayahCount}، وآخر مقطع مسجل ينتهي عند الآية ${maxProgress.maxEnd}.`,
                        `لقد أتممت حفظ هذه السورة سابقاً. لا يمكنك إضافة مقاطع حفظ جديدة لها. يمكنك تسجيل "مراجعة" إذا أردت تثبيتها.`
                    )
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
                    message: this.formatErrorMessage(
                        "تداخل مع حفظ سابق",
                        `تحاول إضافة حفظ يبدأ من الآية ${seg.ayahStart}، بينما أعلى آية محفوظة هي ${maxProgress.maxEnd}.`,
                        `يجب أن تبدأ الحفظ الجديد من الآية ${maxProgress.nextStart} لتكمل التسلسل.`
                    )
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
              validationResult.message = this.formatErrorMessage("مشكلة في تسلسل الحفظ", validationResult.message, "يرجى الالتزام بالتسلسل.");
          }
          return validationResult;
        }

        // فحص إضافي: أول حفظ في السورة يجب أن يبدأ من 1
        // 🆕 V4: نتحقق أيضاً من maxProgress - إذا لا يوجد أي حفظ سابق
        if (!neighbors.previous && !hasLocalPredecessor && !maxProgress && seg.ayahStart !== 1) {
          return {
            isValid: false,
            message: this.formatErrorMessage(
                "بداية السورة غير صحيحة",
                `تحاول بدء حفظ سورة ${seg.surahNumber} من الآية ${seg.ayahStart}.`,
                "يجب أن يبدأ أول حفظ للسورة دائماً من الآية رقم 1."
            )
          };
        }

        // ملاحظة: فحص maxProgress والتداخل تم أعلاه (بعد جلب maxProgress مباشرة)
      }
    }

    return { isValid: true };
  }

  /**
   * ✅ التحقق من وجود تسميع سابق لنفس اليوم (One Section Per Day Rule)
   * تمنع إضافة أكثر من سجل واحد لنفس الحلقة في نفس اليوم (24H).
   */
  async checkDailyQuota(groupId, date, excludeSectionId = null) {
      if (!date || !groupId) return { isValid: true, isBlocked: false };

      const dateKey = this.toDateKeyUTC(date);
      
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
              message: this.formatErrorMessage(
                  "تم تسجيل تسميع لهذا اليوم بالفعل",
                  `يوجد سجل تسميع محفوظ بتاريخ اليوم (${dateKey}) لهذه الحلقة.`,
                  "يسمح بإضافة سجل واحد فقط لكل يوم (يمكنك إضافة حفظ ومراجعة معاً في نفس السجل، أو تعديل السجل الحالي لإضافة المزيد)."
              )
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
      
      // 3. التحقق من الحد (3 مقاطع)
      if (count >= 3) {
          // تنسيق التاريخ للعرض في الرسالة بشكل مقروء
          const formatDate = (dateObj) => {
             return dateObj.toLocaleDateString('ar-EG', { day: 'numeric', month: 'numeric' });
          };

          return {
              isValid: false,
              message: this.formatErrorMessage(
                  "تجاوز الحد الأسبوعي (3 مقاطع)",
                  `هذه الحلقة استنفدت رصيدها لهذا الأسبوع (${formatDate(startOfWeek)} - ${formatDate(new Date(endOfWeek.getTime() - 1))}).\nعدد المقاطع الحالي: ${count}.`,
                  "النظام يسمح بـ 3 أيام تسميع فقط أسبوعياً لكل حلقة (بغض النظر عن المعلم). يرجى اختيار تاريخ في أسبوع آخر أو حذف سجل سابق."
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
                     message: this.formatErrorMessage(
                         "ترتيب غير منطقي",
                         `تحاول مراجعة سورة ${mem.surahNumber} بينما تقوم ببدء حفظها في نفس الطلب.`,
                         "لا يمكن مراجعة سورة لم تكتمل حفظاً بعد، أو على الأقل لم تحفظ جزءاً كافياً منها سابقاً."
                     )
                 };
            }

            // لا يمكن للمراجعة أن تتقاطع مع الحفظ الجديد (المراجعة للماضي فقط)
            if (rev.ayahEnd >= mem.ayahStart) {
                 return {
                     isValid: false,
                     message: this.formatErrorMessage(
                         "تداخل زمني بين الحفظ والمراجعة",
                         `المراجعة (${rev.ayahStart}-${rev.ayahEnd}) تتداخل مع نطاق الحفظ الجديد (${mem.ayahStart}-${mem.ayahEnd}).`,
                         "المراجعة تكون للمحفوظات القديمة فقط، ولا يمكن مراجعة ما يتم حفظه الآن."
                     )
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
                 message: this.formatErrorMessage(
                     "السورة مكتملة الحفظ",
                     `لقد أتممت حفظ سورة ${surahInfo.name} بالكامل (وصلت للآية ${previousNeighbor.ayahEnd} من ${surahInfo.ayahCount}).`,
                     "لا يمكن إضافة مقاطع حفظ جديدة لهذه السورة. يمكنك البدء بمراجعتها أو الانتقال لسورة أخرى."
                 )
             };
         }
      }

      // 1. Gap check (للحفظ فقط): المقطع الجديد يجب أن يبدأ من نهاية السابق + 1
      if (type === 'memorization') {
        const expectedStart = previousNeighbor.ayahEnd + 1;
        if (newSegment.ayahStart !== expectedStart) {
          const prevDate = previousNeighbor.dateKey ? 
            new Date(previousNeighbor.date).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' }) 
            : 'غير معروف';
          
          return {
            isValid: false,
            message: this.formatErrorMessage(
                "فجوة في الحفظ (غير متصل)",
                `المقطع الجديد يبدأ من الآية ${newSegment.ayahStart}، بينما آخر حفظ سابق لك لهذه السورة توقف عند الآية ${previousNeighbor.ayahEnd}، بتاريخ ${prevDate}.`,
                `يجب أن تكمل الحفظ مباشرة دون ترك آيات. ابدأ من الآية ${expectedStart}.`
            )
          };
        }
      }

      // 2. Overlap check: المقطع الجديد لا يجب أن يتداخل مع السابق
      if (newSegment.ayahStart <= previousNeighbor.ayahEnd) {
        return {
          isValid: false,
          message: this.formatErrorMessage(
              "تداخل مع حفظ سابق",
              `المقطع ${newSegment.ayahStart}-${newSegment.ayahEnd} يتداخل مع مقطع سابق (${previousNeighbor.ayahStart}-${previousNeighbor.ayahEnd}) تم حفظه في ${previousNeighbor.dateKey || ''}.`,
              "لا يمكن إعادة حفظ ما تم حفظه سابقاً. تحقق من التواريخ السابقة."
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
            new Date(nextNeighbor.date).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' }) 
            : 'غير معروف';
          
          return {
            isValid: false,
            message: this.formatErrorMessage(
                "عدم تطابق مع التسلسل اللاحق",
                `في تاريخ لاحق (${nextDate})، قمت بحفظ الآيات ابتداءً من الآية ${nextNeighbor.ayahStart}. المقطع الحالي ينتهي عند ${newSegment.ayahEnd}، مما سيترك فجوة بينهما.`,
                `للحفاظ على التسلسل المتصل، يجب أن يمتد حفظك الحالي حتى الآية ${expectedEnd} ليلتحم بالحفظ اللاحق.`
            )
          };
        }
      }

      // 2. Overlap check: المقطع الجديد لا يجب أن يتداخل مع اللاحق
      if (newSegment.ayahEnd >= nextNeighbor.ayahStart) {
        const nextDate = nextNeighbor.dateKey ? 
          new Date(nextNeighbor.date).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' }) 
          : 'غير معروف';
        
        return {
          isValid: false,
          message: this.formatErrorMessage(
              "تداخل مع حفظ لاحق",
              `المقطع الجديد ينتهي عند الآية ${newSegment.ayahEnd}، وهذا يتداخل مع حفظ مسجل بتاريخ لاحق (${nextDate}) يبدأ من الآية ${nextNeighbor.ayahStart}.`,
              `يجب أن ينتهي مقطعك الحالي قبل الآية ${nextNeighbor.ayahStart} لتجنب التكرار.`
          )
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
          message: `❌ جسر غير مكتمل: المقطع [${segDesc}] يجب أن يسد الفجوة بالضبط [${gapStart}-${gapEnd}] بين ${previousNeighbor.canonicalKey} و ${nextNeighbor.canonicalKey}.`
        };
      }
    }

    return { isValid: true };
  }

  // ============================================================================
  // 🆕 V5: MONOTONIC ORDER VALIDATION
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
   * @param {string} groupId - معرف الحلقة
   * @param {number} surahNumber - رقم السورة
   * @param {number} ayahStart - بداية المقطع الجديد
   * @param {number} ayahEnd - نهاية المقطع الجديد
   * @param {Date} proposedDate - التاريخ المقترح
   * @param {string} excludeSectionId - استثناء مقطع (عند التعديل)
   * @returns {Promise<{isValid: boolean, message?: string}>}
   */
  async validateMonotonicOrder(groupId, surahNumber, ayahStart, ayahEnd, proposedDate, excludeSectionId = null) {
    const metaField = 'memorizationMeta';
    
    // جلب جميع المقاطع الموجودة لهذه السورة
    const query = {
      group: groupId,
      [`${metaField}.surahNumber`]: surahNumber
    };
    
    if (excludeSectionId) {
      query._id = { $ne: excludeSectionId };
    }
    
    const sections = await Section.find(query)
      .select(`${metaField} date dateKey`)
      .lean();
    
    if (!sections || sections.length === 0) {
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
          dateKey: section.dateKey
        });
      }
    }
    
    // ترتيب حسب التاريخ
    existingSegments.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    const proposedTime = new Date(proposedDate);
    proposedTime.setHours(0, 0, 0, 0);
    
    for (const existing of existingSegments) {
      const existingTime = new Date(existing.date);
      existingTime.setHours(0, 0, 0, 0);
      
      // حالة 1: التاريخ المقترح أقدم من الموجود
      if (proposedTime < existingTime) {
        // يجب أن تكون الآيات المقترحة أقدم أو مساوية
        if (ayahStart > existing.ayahStart) {
          return {
            isValid: false,
            message: this.formatErrorMessage(
              "تعارض في ترتيب التواريخ والآيات",
              `التاريخ المختار (${this.toDateKeyUTC(proposedDate)}) أقدم من تاريخ مقطع موجود (${existing.dateKey})، لكنك تحاول إضافة آيات (${ayahStart}-${ayahEnd}) أحدث من آيات ذلك المقطع (${existing.ayahStart}-${existing.ayahEnd}).`,
              `اختر تاريخاً لاحقاً لـ ${existing.dateKey}، أو اختر آيات أقدم من الآية ${existing.ayahStart}.`
            )
          };
        }
      }
      
      // حالة 2: التاريخ المقترح أحدث من الموجود
      if (proposedTime > existingTime) {
        // يجب أن تكون الآيات المقترحة أحدث أو مساوية
        if (ayahStart < existing.ayahStart) {
          return {
            isValid: false,
            message: this.formatErrorMessage(
              "تعارض في ترتيب التواريخ والآيات",
              `التاريخ المختار (${this.toDateKeyUTC(proposedDate)}) أحدث من تاريخ مقطع موجود (${existing.dateKey})، لكنك تحاول إضافة آيات (${ayahStart}-${ayahEnd}) أقدم من آيات ذلك المقطع (${existing.ayahStart}-${existing.ayahEnd}).`,
              `اختر تاريخاً أقدم من ${existing.dateKey}، أو اختر آيات أحدث من الآية ${existing.ayahEnd}.`
            )
          };
        }
      }
    }
    
    return { isValid: true };
  }
}

module.exports = new SectionSequenceService();
