const Section = require("../../schema/DailyMark/Section");
const mongoose = require("mongoose");
const { getSurahByNumber } = require("../../utils/Quran/dailyMarkQuranMetadata");
const Group = require("../../schema/Group");
const { toDateKey, TIMEZONE } = require("../../config/timezone");

/**
 * ============================================================================
 * Smart Scheduler Service (The Planner)
 * ============================================================================
 * خدمة جدولة ذكية وصارمة لسد الفجوات وتوزيع المقاطع.
 * 
 * المبادئ الحاكمة:
 * 1. 🔒 Monotonic Order: التاريخ الأحدث ⟹ الآية الأحدث (لا استثناءات)
 * 2. 📅 Weekly Quota: 3 مقاطع كحد أقصى في الأسبوع
 * 3. 🎯 Closest First: الأسبوع الأقرب له الأولوية دائماً
 * 4. 📏 Smart Chunking: تقسيم ذكي للفجوات (10-15 آية افتراضياً)
 * 5. 🛡️ No AI Hallucination: قواعد صارمة لا تعتمد على "ذكاء" قابل للخطأ
 * 
 * الفرق عن AiSchedulerService:
 * - هذه الخدمة تولّد "اقتراحات" جاهزة للمستخدم
 * - AiSchedulerService يصلح الفجوات الموجودة
 * - هذه الخدمة تمنع التعارض قبل الإضافة
 */

class SmartSchedulerService {

  // ============================================================================
  // 🔧 CONFIGURATION
  // ============================================================================
  
  static CONFIG = {
    WEEKLY_QUOTA: 3,                    // الحد الأسبوعي
    DEFAULT_CHUNK_MIN: 10,              // أقل حجم مقطع افتراضي
    DEFAULT_CHUNK_MAX: 15,              // أكبر حجم مقطع افتراضي
    MIN_CHUNK_SIZE: 5,                  // أقل حجم مقبول لمقطع (لا نكسره أكثر)
    MAX_LOOKAHEAD_WEEKS: 12,            // أقصى عدد أسابيع للبحث للأمام
    WEEK_START_DAY: 6,                  // السبت = 6
  };

  // ============================================================================
  // 📅 DATE UTILITIES
  // ============================================================================

  /**
   * تحويل التاريخ إلى مفتاح فريد (YYYY-MM-DD) - توقيت فلسطين
   */
  toDateKeyUTC(d) {
    return toDateKey(d);
  }

  /**
   * الحصول على بداية الأسبوع (السبت) لتاريخ معين
   */
  getWeekStart(date) {
    const d = new Date(date);
    const dayIndex = d.getDay(); // 0 (Sun) to 6 (Sat)
    const distFromSat = (dayIndex + 1) % 7;
    const startOfWeek = new Date(d);
    startOfWeek.setDate(d.getDate() - distFromSat);
    startOfWeek.setHours(0, 0, 0, 0);
    return startOfWeek;
  }

  /**
   * الحصول على نهاية الأسبوع (الجمعة 23:59:59)
   */
  getWeekEnd(weekStart) {
    const endOfWeek = new Date(weekStart);
    endOfWeek.setDate(weekStart.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);
    return endOfWeek;
  }

  /**
   * توليد قائمة الأسابيع المتاحة (من اليوم وصاعداً)
   */
  generateWeeks(startDate, count = SmartSchedulerService.CONFIG.MAX_LOOKAHEAD_WEEKS) {
    const weeks = [];
    let current = this.getWeekStart(startDate);
    
    for (let i = 0; i < count; i++) {
      weeks.push({
        weekNumber: i + 1,
        start: new Date(current),
        end: this.getWeekEnd(current),
        dateKey: this.toDateKeyUTC(current)
      });
      current.setDate(current.getDate() + 7);
    }
    
    return weeks;
  }

  /**
   * الحصول على أيام الأسبوع المتاحة بترتيب
   */
  getWeekDays(weekStart, preferredDays = null) {
    const days = [];
    const current = new Date(weekStart);
    
    for (let i = 0; i < 7; i++) {
      const dayIndex = current.getDay();
      days.push({
        date: new Date(current),
        dateKey: this.toDateKeyUTC(current),
        dayIndex,
        dayName: this.getDayName(dayIndex),
        isPreferred: preferredDays ? preferredDays.includes(dayIndex) : true,
        isFriday: dayIndex === 5
      });
      current.setDate(current.getDate() + 1);
    }
    
    // ترتيب: الأيام المفضلة أولاً، ثم الباقي (عدا الجمعة)
    if (preferredDays && preferredDays.length > 0) {
      days.sort((a, b) => {
        if (a.isPreferred && !b.isPreferred) return -1;
        if (!a.isPreferred && b.isPreferred) return 1;
        if (a.isFriday && !b.isFriday) return 1;
        if (!a.isFriday && b.isFriday) return -1;
        return a.date - b.date;
      });
    }
    
    return days;
  }

  getDayName(dayIndex) {
    const names = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    return names[dayIndex];
  }

  // ============================================================================
  // 📊 DATA COLLECTION
  // ============================================================================

  /**
   * جلب جميع المقاطع الموجودة لسورة معينة (مرتبة قرآنياً وزمنياً)
   */
  async getExistingSegments(groupId, surahNumber, type = 'memorization') {
    const metaField = type === 'memorization' ? 'memorizationMeta' : 'reviewMeta';
    
    const sections = await Section.find({
      group: groupId,
      [`${metaField}.surahNumber`]: surahNumber
    })
    .select(`${metaField} date dateKey`)
    .sort({ date: 1 })
    .lean();

    const segments = [];
    
    for (const section of sections) {
      const relevantMeta = section[metaField].filter(m => m.surahNumber === surahNumber);
      for (const seg of relevantMeta) {
        segments.push({
          surahNumber: seg.surahNumber,
          ayahStart: seg.ayahStart,
          ayahEnd: seg.ayahEnd,
          date: section.date,
          dateKey: section.dateKey,
          sectionId: section._id,
          canonicalKey: `${seg.surahNumber}:${seg.ayahStart}-${seg.ayahEnd}`
        });
      }
    }

    // ترتيب مزدوج: قرآنياً ثم زمنياً
    const byQuran = [...segments].sort((a, b) => a.ayahStart - b.ayahStart);
    const byDate = [...segments].sort((a, b) => new Date(a.date) - new Date(b.date));

    return { byQuran, byDate, all: segments };
  }

  /**
   * جلب عدد المقاطع لكل أسبوع
   */
  async getWeeklyUsage(groupId, weeks) {
    const usage = {};
    
    for (const week of weeks) {
      const count = await Section.countDocuments({
        group: groupId,
        date: { $gte: week.start, $lte: week.end }
      });
      usage[week.dateKey] = {
        count,
        remaining: SmartSchedulerService.CONFIG.WEEKLY_QUOTA - count,
        isFull: count >= SmartSchedulerService.CONFIG.WEEKLY_QUOTA
      };
    }
    
    return usage;
  }

  /**
   * جلب التواريخ المحجوزة (لها مقاطع بالفعل)
   */
  async getOccupiedDates(groupId, startDate, endDate) {
    const sections = await Section.find({
      group: groupId,
      date: { $gte: startDate, $lte: endDate }
    }).select('date dateKey').lean();

    return new Set(sections.map(s => s.dateKey));
  }

  // ============================================================================
  // 🔍 GAP DETECTION
  // ============================================================================

  /**
   * اكتشاف الفجوات في سورة معينة
   * 
   * @param {Array} sortedSegments - المقاطع مرتبة قرآنياً
   * @param {number} surahNumber - رقم السورة
   * @returns {Array} قائمة الفجوات
   */
  detectGaps(sortedSegments, surahNumber) {
    // الفجوة = ما بين مقاطع محفوظة فقط
    // ليست الفجوة = باقي السورة غير المحفوظة بعد آخر مقطع
    
    const gaps = [];
    let expectedStart = 1;

    for (const seg of sortedSegments) {
      // فجوة قبل هذا المقطع؟
      if (seg.ayahStart > expectedStart) {
        gaps.push({
          surahNumber,
          ayahStart: expectedStart,
          ayahEnd: seg.ayahStart - 1,
          size: seg.ayahStart - expectedStart,
          afterSegment: null,
          beforeSegment: seg
        });
      }
      expectedStart = Math.max(expectedStart, seg.ayahEnd + 1);
    }

    // ⚠️ لا نضيف "باقي السورة" كفجوة
    // الفجوة هي فقط ما بين مقاطع موجودة
    // باقي السورة = لم يُحفظ بعد وليست فجوة

    return gaps;
  }

  // ============================================================================
  // 📏 SMART CHUNKING
  // ============================================================================

  /**
   * تقسيم فجوة إلى مقاطع بحجم مثالي
   * 
   * القواعد:
   * - إذا حُدد gapChunkSize: استخدمه
   * - وإلا: وزّع بحيث كل مقطع 10-15 آية
   * - إذا بقي أقل من 10: اتركه كما هو
   */
  splitGapIntoChunks(gap, chunkSize = null) {
    const { ayahStart, ayahEnd, surahNumber, size } = gap;
    const chunks = [];

    // A) المستخدم حدد حجم معين
    if (chunkSize && chunkSize > 0) {
      let current = ayahStart;
      while (current <= ayahEnd) {
        const end = Math.min(current + chunkSize - 1, ayahEnd);
        chunks.push({
          surahNumber,
          ayahStart: current,
          ayahEnd: end,
          size: end - current + 1
        });
        current = end + 1;
      }
      return chunks;
    }

    // B) التقسيم الذكي (10-15 آية)
    const { DEFAULT_CHUNK_MIN, DEFAULT_CHUNK_MAX, MIN_CHUNK_SIZE } = SmartSchedulerService.CONFIG;

    // إذا الفجوة صغيرة جداً، لا نقسمها
    if (size <= DEFAULT_CHUNK_MAX) {
      chunks.push({
        surahNumber,
        ayahStart,
        ayahEnd,
        size
      });
      return chunks;
    }

    // حساب أفضل توزيع
    // الهدف: عدد مقاطع × حجم متساوي ≈ size
    // نريد الحجم بين 10 و 15
    
    const idealChunkCount = Math.ceil(size / DEFAULT_CHUNK_MAX);
    const idealChunkSize = Math.ceil(size / idealChunkCount);
    
    // التأكد أن الحجم ضمن النطاق المطلوب
    let effectiveChunkSize = idealChunkSize;
    if (effectiveChunkSize < DEFAULT_CHUNK_MIN) {
      effectiveChunkSize = DEFAULT_CHUNK_MIN;
    } else if (effectiveChunkSize > DEFAULT_CHUNK_MAX) {
      effectiveChunkSize = DEFAULT_CHUNK_MAX;
    }

    let current = ayahStart;
    while (current <= ayahEnd) {
      const remaining = ayahEnd - current + 1;
      
      // إذا الباقي أقل من الحد الأدنى المعقول، ضمّه للمقطع الحالي
      let thisChunkEnd;
      if (remaining <= effectiveChunkSize + MIN_CHUNK_SIZE) {
        // خذ كل الباقي
        thisChunkEnd = ayahEnd;
      } else {
        thisChunkEnd = Math.min(current + effectiveChunkSize - 1, ayahEnd);
      }

      chunks.push({
        surahNumber,
        ayahStart: current,
        ayahEnd: thisChunkEnd,
        size: thisChunkEnd - current + 1
      });
      
      current = thisChunkEnd + 1;
    }

    return chunks;
  }

  // ============================================================================
  // 📅 DATE SCHEDULING
  // ============================================================================

  /**
   * توليد تواريخ متاحة للمقاطع الجديدة
   * 
   * @param {string} groupId - معرف الحلقة
   * @param {number} chunksNeeded - عدد المقاطع المطلوبة
   * @param {Date} priorityDate - تاريخ الأولوية (افتراضياً: اليوم)
   * @param {Array} preferredDays - أيام الأسبوع المفضلة [0-6]
   * @param {Set} excludeDates - تواريخ مستثناة
   */
  async generateAvailableDates(groupId, chunksNeeded, priorityDate = new Date(), preferredDays = null, excludeDates = new Set()) {
    const weeks = this.generateWeeks(priorityDate);
    const weeklyUsage = await this.getWeeklyUsage(groupId, weeks);
    
    // جلب التواريخ المحجوزة
    const lastWeek = weeks[weeks.length - 1];
    const occupiedDates = await this.getOccupiedDates(groupId, weeks[0].start, lastWeek.end);
    
    // اكتشاف أيام العمل من المجموعة أو التاريخ
    const workingDays = preferredDays || await this.detectWorkingDays(groupId);
    
    const availableDates = [];
    let remaining = chunksNeeded;

    for (const week of weeks) {
      if (remaining <= 0) break;
      
      const usage = weeklyUsage[week.dateKey];
      if (usage.isFull) continue; // الأسبوع ممتلئ
      
      const slotsInWeek = usage.remaining;
      const weekDays = this.getWeekDays(week.start, workingDays);
      
      let addedThisWeek = 0;
      
      for (const day of weekDays) {
        if (remaining <= 0) break;
        if (addedThisWeek >= slotsInWeek) break;
        
        // تجاهل الجمعة إلا إذا كانت اليوم الوحيد المتاح
        if (day.isFriday && workingDays.length > 1) continue;
        
        // تجاهل التواريخ المحجوزة
        if (occupiedDates.has(day.dateKey)) continue;
        
        // تجاهل التواريخ المستثناة
        if (excludeDates.has(day.dateKey)) continue;
        
        // تجاهل التواريخ الماضية
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (day.date < today) continue;
        
        availableDates.push({
          date: day.date,
          dateKey: day.dateKey,
          dayName: day.dayName,
          weekNumber: week.weekNumber,
          isPreferred: day.isPreferred,
          reason: day.isPreferred 
            ? `يوم ${day.dayName} - الأسبوع ${week.weekNumber}` 
            : `يوم بديل (${day.dayName}) - الأسبوع ${week.weekNumber}`
        });
        
        remaining--;
        addedThisWeek++;
      }
    }

    return {
      dates: availableDates,
      requested: chunksNeeded,
      found: availableDates.length,
      shortfall: remaining > 0 ? remaining : 0,
      warnings: remaining > 0 
        ? [`لم يتم إيجاد تواريخ كافية. تم إيجاد ${availableDates.length} من ${chunksNeeded} مطلوب.`]
        : []
    };
  }

  /**
   * اكتشاف أيام العمل من إعدادات المجموعة أو التاريخ
   */
  async detectWorkingDays(groupId) {
    // 1. محاولة من إعدادات المجموعة
    let group = null;
    if (mongoose.Types.ObjectId.isValid(groupId)) {
      group = await Group.findById(groupId).select('schedule').lean();
    } else {
      group = await Group.findOne({ name: groupId }).select('schedule').lean();
    }
    
    if (group && group.schedule) {
      const dayMap = {
        'الأحد': 0, 'الاثنين': 1, 'الإثنين': 1, 'الثلاثاء': 2, 
        'الأربعاء': 3, 'الاربعاء': 3, 'الخميس': 4, 'الجمعة': 5, 'السبت': 6
      };
      const detected = new Set();
      for (const [name, idx] of Object.entries(dayMap)) {
        if (group.schedule.includes(name)) detected.add(idx);
      }
      if (detected.size > 0) return Array.from(detected);
    }

    // 2. من التاريخ
    const recent = await Section.find({ group: groupId })
      .sort({ date: -1 })
      .limit(30)
      .select('date')
      .lean();
    
    if (recent && recent.length >= 5) {
      const days = new Set(recent.map(r => new Date(r.date).getDay()));
      if (days.has(5) && days.size > 1) days.delete(5); // استبعاد الجمعة
      return Array.from(days);
    }

    // 3. افتراضي: أحد، ثلاثاء، خميس
    return [0, 2, 4];
  }

  // ============================================================================
  // 🛡️ MONOTONIC ORDER VALIDATION
  // ============================================================================

  /**
   * التحقق من عدم كسر الترتيب (date1 < date2 ⟹ range1 ≤ range2)
   * 
   * @param {Array} existingByDate - المقاطع الموجودة مرتبة بالتاريخ
   * @param {object} newChunk - المقطع الجديد { date, ayahStart, ayahEnd }
   * @returns {{ isValid: boolean, reason?: string, suggestion?: Date }}
   */
  validateMonotonicOrder(existingByDate, newChunk) {
    const newDate = new Date(newChunk.date);
    newDate.setHours(0, 0, 0, 0);

    for (const existing of existingByDate) {
      const existingDate = new Date(existing.date);
      existingDate.setHours(0, 0, 0, 0);

      // التاريخ الجديد أقدم من الموجود
      if (newDate < existingDate) {
        // يجب أن يكون الرينج الجديد أقدم أو مساوي
        if (newChunk.ayahStart > existing.ayahStart) {
          return {
            isValid: false,
            reason: `التاريخ ${this.toDateKeyUTC(newDate)} يكسر الترتيب: تحاول إضافة آيات (${newChunk.ayahStart}-${newChunk.ayahEnd}) بينما تاريخ لاحق (${this.toDateKeyUTC(existingDate)}) يحتوي على آيات أقدم (${existing.ayahStart}-${existing.ayahEnd}).`,
            conflictingSegment: existing,
            suggestedAction: 'MOVE_DATE_FORWARD'
          };
        }
      }
      
      // التاريخ الجديد أحدث من الموجود
      if (newDate > existingDate) {
        // يجب أن يكون الرينج الجديد أحدث أو مساوي
        if (newChunk.ayahStart < existing.ayahStart) {
          return {
            isValid: false,
            reason: `التاريخ ${this.toDateKeyUTC(newDate)} يكسر الترتيب: تحاول إضافة آيات (${newChunk.ayahStart}-${newChunk.ayahEnd}) وهي أقدم من آيات بتاريخ سابق (${this.toDateKeyUTC(existingDate)}): (${existing.ayahStart}-${existing.ayahEnd}).`,
            conflictingSegment: existing,
            suggestedAction: 'MOVE_DATE_BACKWARD'
          };
        }
      }
    }

    return { isValid: true };
  }

  /**
   * إيجاد أقرب تاريخ صالح للمقطع (يحترم الترتيب)
   * 
   * ✅ V6: إصلاح شامل - يضمن:
   * 1. Monotonic Order: date1 < date2 ⟹ ayahStart1 ≤ ayahStart2
   * 2. لا تعارض مع المقاطع الموجودة
   * 3. إعادة جدولة تلقائية إذا التاريخ المقترح غير صالح
   */
  async findValidDateForChunk(groupId, chunk, existingByDate, availableDates) {
    // ترتيب المقاطع الموجودة حسب التاريخ (الأهم للتحقق من الترتيب الزمني)
    const sortedByDate = [...existingByDate].sort((a, b) => {
      const dateA = new Date(a.date || a.dateKey);
      const dateB = new Date(b.date || b.dateKey);
      return dateA - dateB;
    });
    
    // ترتيب المقاطع حسب الآيات (للتحقق من الترتيب القرآني)
    const sortedByAyah = [...existingByDate].sort((a, b) => a.ayahStart - b.ayahStart);
    
    // إيجاد أين يجب أن يكون هذا المقطع قرآنياً
    let insertIndex = sortedByAyah.findIndex(s => s.ayahStart > chunk.ayahStart);
    if (insertIndex === -1) insertIndex = sortedByAyah.length;
    
    // ============================================
    // حساب الحدود الزمنية الصارمة
    // ============================================
    let minDate = null; // أقل تاريخ ممكن
    let maxDate = null; // أكبر تاريخ ممكن
    let minDateReason = '';
    let maxDateReason = '';
    
    // القاعدة 1: إذا في مقطع قبله قرآنياً → لازم التاريخ يكون بعده
    if (insertIndex > 0) {
      const before = sortedByAyah[insertIndex - 1];
      const beforeDate = new Date(before.date || before.dateKey);
      beforeDate.setHours(0, 0, 0, 0);
      
      // التاريخ الجديد لازم يكون بعد أو يساوي تاريخ المقطع السابق قرآنياً
      // (نفس اليوم مسموح لأن الترتيب داخل اليوم غير مهم)
      minDate = new Date(beforeDate);
      minDateReason = `بعد مقطع (${before.ayahStart}-${before.ayahEnd}) بتاريخ ${this.toDateKeyUTC(beforeDate)}`;
    }
    
    // القاعدة 2: إذا في مقطع بعده قرآنياً → لازم التاريخ يكون قبله
    if (insertIndex < sortedByAyah.length) {
      const after = sortedByAyah[insertIndex];
      const afterDate = new Date(after.date || after.dateKey);
      afterDate.setHours(0, 0, 0, 0);
      
      // التاريخ الجديد لازم يكون قبل أو يساوي تاريخ المقطع اللاحق قرآنياً
      maxDate = new Date(afterDate);
      maxDateReason = `قبل مقطع (${after.ayahStart}-${after.ayahEnd}) بتاريخ ${this.toDateKeyUTC(afterDate)}`;
    }
    
    // ============================================
    // القاعدة 3: التحقق الإضافي من Monotonic Order العكسي
    // لازم نتأكد أن أي مقطع موجود بتاريخ أقدم لديه آيات أقدم
    // ============================================
    for (const existing of sortedByDate) {
      const existingDate = new Date(existing.date || existing.dateKey);
      existingDate.setHours(0, 0, 0, 0);
      
      // إذا المقطع الموجود آياته أحدث من chunk → لازم تاريخه يكون أحدث من chunk
      // يعني: تاريخ chunk لازم يكون قبله
      if (existing.ayahStart > chunk.ayahEnd) {
        // existing أحدث قرآنياً → chunk لازم يكون قبله زمنياً
        if (!maxDate || existingDate < maxDate) {
          maxDate = new Date(existingDate);
          maxDateReason = `قبل مقطع (${existing.ayahStart}-${existing.ayahEnd}) بتاريخ ${this.toDateKeyUTC(existingDate)}`;
        }
      }
      
      // إذا المقطع الموجود آياته أقدم من chunk → لازم تاريخه يكون أقدم من chunk
      // يعني: تاريخ chunk لازم يكون بعده
      if (existing.ayahEnd < chunk.ayahStart) {
        // existing أقدم قرآنياً → chunk لازم يكون بعده زمنياً
        if (!minDate || existingDate > minDate) {
          minDate = new Date(existingDate);
          minDateReason = `بعد مقطع (${existing.ayahStart}-${existing.ayahEnd}) بتاريخ ${this.toDateKeyUTC(existingDate)}`;
        }
      }
    }
    
    // ============================================
    // البحث عن تاريخ مناسب ضمن الحدود
    // ============================================
    for (const slot of availableDates) {
      const slotDate = new Date(slot.date);
      slotDate.setHours(0, 0, 0, 0);
      
      let valid = true;
      let rejectionReason = '';
      
      // التحقق من الحد الأدنى
      if (minDate) {
        const min = new Date(minDate);
        min.setHours(0, 0, 0, 0);
        if (slotDate < min) {
          valid = false;
          rejectionReason = `التاريخ ${slot.dateKey} قبل الحد الأدنى المطلوب (${minDateReason})`;
        }
      }
      
      // التحقق من الحد الأقصى
      if (valid && maxDate) {
        const max = new Date(maxDate);
        max.setHours(0, 0, 0, 0);
        if (slotDate > max) {
          valid = false;
          rejectionReason = `التاريخ ${slot.dateKey} بعد الحد الأقصى المطلوب (${maxDateReason})`;
        }
      }
      
      if (valid) {
        return {
          found: true,
          date: slot.dateKey,
          dateKey: slot.dateKey,
          reason: slot.reason,
          constraints: { 
            minDate: minDate ? this.toDateKeyUTC(minDate) : null, 
            maxDate: maxDate ? this.toDateKeyUTC(maxDate) : null,
            minDateReason,
            maxDateReason
          }
        };
      }
    }
    
    // ============================================
    // لم يُوجد تاريخ صالح - إرجاع سبب مفصل
    // ============================================
    let reason = 'لا يوجد تاريخ متاح يحترم الترتيب القرآني.';
    if (minDate && maxDate) {
      const minStr = this.toDateKeyUTC(minDate);
      const maxStr = this.toDateKeyUTC(maxDate);
      if (new Date(minDate) > new Date(maxDate)) {
        reason = `تعارض في الترتيب: المقطع (${chunk.ayahStart}-${chunk.ayahEnd}) يجب أن يكون بين ${minStr} و ${maxStr}، لكن هذا النطاق غير صالح. قد يكون هناك خطأ في بيانات المقاطع الموجودة.`;
      } else {
        reason = `لا توجد تواريخ متاحة بين ${minStr} و ${maxStr}. جرب توسيع نطاق البحث أو تحرير بعض التواريخ القديمة.`;
      }
    } else if (minDate) {
      reason = `لا توجد تواريخ متاحة بعد ${this.toDateKeyUTC(minDate)} (${minDateReason}).`;
    } else if (maxDate) {
      reason = `لا توجد تواريخ متاحة قبل ${this.toDateKeyUTC(maxDate)} (${maxDateReason}).`;
    }
    
    return {
      found: false,
      reason,
      constraints: { 
        minDate: minDate ? this.toDateKeyUTC(minDate) : null, 
        maxDate: maxDate ? this.toDateKeyUTC(maxDate) : null,
        minDateReason,
        maxDateReason
      }
    };
  }

  // ============================================================================
  // 🎯 MAIN API: SUGGEST GAP FILLING
  // ============================================================================

  /**
   * الوظيفة الرئيسية: اقتراح جدول سد الفجوات
   * 
   * @param {string} groupId - معرف الحلقة
   * @param {number} surahNumber - رقم السورة
   * @param {object} options - خيارات إضافية
   *   - chunkSize: حجم كل مقطع (اختياري)
   *   - priorityDate: تاريخ الأولوية (اختياري)
   *   - preferredDays: أيام الأسبوع المفضلة (اختياري)
   *   - maxChunks: الحد الأقصى للمقاطع المقترحة (اختياري)
   * @returns {Promise<object>} نتيجة الاقتراح
   */
  async suggestGapFilling(groupId, surahNumber, options = {}) {
    const {
      chunkSize = null,
      preferredDays = null,
      maxChunks = null,
      type = 'memorization'
    } = options;

    // ✅ التأكد من أن تاريخ البدء هو اليوم على الأقل
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const priorityDate = options.priorityDate 
      ? new Date(Math.max(new Date(options.priorityDate).getTime(), today.getTime()))
      : today;

    // 1. جمع البيانات
    const { byQuran, byDate } = await this.getExistingSegments(groupId, surahNumber, type);
    const surahInfo = getSurahByNumber(surahNumber);
    const surahName = surahInfo ? surahInfo.name : `سورة ${surahNumber}`;

    // 2. اكتشاف الفجوات
    const gaps = this.detectGaps(byQuran, surahNumber);
    
    if (gaps.length === 0) {
      return {
        success: true,
        hasGaps: false,
        surahName, // ✅ إضافة surahName مباشرة
        message: `لا توجد فجوات في حفظ ${surahName}. التسلسل مكتمل.`,
        suggestions: [],
        stats: {
          surahName,
          totalAyahs: surahInfo?.ayahCount || 0,
          memorizedAyahs: byQuran.reduce((sum, s) => sum + (s.ayahEnd - s.ayahStart + 1), 0),
          existingSegments: byQuran.length
        }
      };
    }

    // 3. تقسيم الفجوات إلى مقاطع
    let allChunks = [];
    for (const gap of gaps) {
      const chunks = this.splitGapIntoChunks(gap, chunkSize);
      allChunks.push(...chunks.map(c => ({ ...c, gapInfo: gap })));
    }

    // تحديد عدد المقاطع
    if (maxChunks && allChunks.length > maxChunks) {
      allChunks = allChunks.slice(0, maxChunks);
    }

    // 4. توليد التواريخ المتاحة
    const dateResult = await this.generateAvailableDates(
      groupId, 
      allChunks.length, 
      priorityDate, 
      preferredDays
    );

    // 5. ربط كل مقطع بتاريخ مع التحقق من الترتيب
    const suggestions = [];
    const warnings = [...dateResult.warnings];
    
    // نحتاج لتحديث existingByDate تدريجياً
    const workingByDate = [...byDate];

    for (let i = 0; i < allChunks.length; i++) {
      const chunk = allChunks[i];
      
      if (i >= dateResult.dates.length) {
        warnings.push(`لم يتم إيجاد تاريخ للمقطع ${chunk.ayahStart}-${chunk.ayahEnd}`);
        continue;
      }

      // البحث عن تاريخ صالح
      const validDate = await this.findValidDateForChunk(
        groupId, 
        chunk, 
        workingByDate, 
        dateResult.dates.slice(i)
      );

      if (validDate.found) {
        const suggestion = {
          surahNumber,
          surahName,
          ayahStart: chunk.ayahStart,
          ayahEnd: chunk.ayahEnd,
          size: chunk.size,
          date: validDate.date,
          dateKey: validDate.dateKey,
          reason: validDate.reason,
          canonicalKey: `${surahNumber}:${chunk.ayahStart}-${chunk.ayahEnd}`,
          displayText: `${surahName} ${chunk.ayahStart}-${chunk.ayahEnd}`
        };
        
        suggestions.push(suggestion);
        
        // إضافة للقائمة المؤقتة للتحقق من المقاطع التالية
        workingByDate.push({
          surahNumber,
          ayahStart: chunk.ayahStart,
          ayahEnd: chunk.ayahEnd,
          date: validDate.date,
          dateKey: validDate.dateKey
        });
        workingByDate.sort((a, b) => new Date(a.date) - new Date(b.date));
      } else {
        warnings.push(`تعذر جدولة المقطع ${chunk.ayahStart}-${chunk.ayahEnd}: ${validDate.reason}`);
      }
    }

    // 6. التحقق النهائي من الترتيب
    const finalCheck = this.validateFinalSchedule([...byDate, ...suggestions]);

    return {
      success: true,
      hasGaps: true,
      surahName, // ✅ إضافة surahName مباشرة
      message: `تم اكتشاف ${gaps.length} فجوة في ${surahName}. تم اقتراح ${suggestions.length} مقطع لسدها.`,
      suggestions,
      gaps: gaps.map(g => ({
        ayahStart: g.ayahStart,
        ayahEnd: g.ayahEnd,
        size: g.size,
        isEndOfSurah: g.isEndOfSurah || false
      })),
      warnings,
      finalCheck,
      stats: {
        surahName,
        totalAyahs: surahInfo?.ayahCount || 0,
        existingSegments: byQuran.length,
        gapsFound: gaps.length,
        chunksProposed: suggestions.length,
        totalGapSize: gaps.reduce((sum, g) => sum + g.size, 0)
      }
    };
  }

  /**
   * التحقق النهائي من الجدول المقترح
   */
  validateFinalSchedule(allSegments) {
    const sorted = [...allSegments].sort((a, b) => new Date(a.date) - new Date(b.date));
    
    const violations = [];
    
    for (let i = 0; i < sorted.length - 1; i++) {
      const current = sorted[i];
      const next = sorted[i + 1];
      
      // التاريخ الحالي أقدم من التالي
      // يجب أن يكون الرينج الحالي أقدم أو مساوي
      if (current.ayahStart > next.ayahStart) {
        violations.push({
          type: 'ORDER_VIOLATION',
          message: `تعارض في الترتيب: (${current.ayahStart}-${current.ayahEnd}) في ${this.toDateKeyUTC(current.date)} قبل (${next.ayahStart}-${next.ayahEnd}) في ${this.toDateKeyUTC(next.date)}`
        });
      }
    }
    
    return {
      isValid: violations.length === 0,
      violations
    };
  }

  // ============================================================================
  // 🎯 SINGLE DATE SUGGESTION
  // ============================================================================

  /**
   * اقتراح تاريخ واحد لمقطع جديد
   * 
   * @param {string} groupId - معرف الحلقة
   * @param {number} surahNumber - رقم السورة
   * @param {number} ayahStart - بداية الآيات
   * @param {number} ayahEnd - نهاية الآيات (اختياري، يُحسب تلقائياً)
   */
  async suggestSingleDate(groupId, surahNumber, ayahStart, ayahEnd = null) {
    const { byDate } = await this.getExistingSegments(groupId, surahNumber);
    const surahInfo = getSurahByNumber(surahNumber);
    
    // إذا لم تحدد النهاية، نقترح 10-15 آية
    if (!ayahEnd) {
      const maxAyah = surahInfo ? surahInfo.ayahCount : 286;
      const idealEnd = Math.min(ayahStart + 14, maxAyah); // 15 آية افتراضياً
      ayahEnd = idealEnd;
    }
    
    const chunk = { surahNumber, ayahStart, ayahEnd };
    
    // توليد تواريخ متاحة
    const dateResult = await this.generateAvailableDates(groupId, 5);
    
    // إيجاد تاريخ صالح
    const validDate = await this.findValidDateForChunk(groupId, chunk, byDate, dateResult.dates);
    
    if (validDate.found) {
      return {
        success: true,
        suggestion: {
          surahNumber,
          surahName: surahInfo?.name || `سورة ${surahNumber}`,
          ayahStart,
          ayahEnd,
          size: ayahEnd - ayahStart + 1,
          date: validDate.date,
          dateKey: validDate.dateKey,
          reason: validDate.reason,
          canonicalKey: `${surahNumber}:${ayahStart}-${ayahEnd}`
        },
        constraints: validDate.constraints
      };
    }
    
    return {
      success: false,
      message: validDate.reason,
      constraints: validDate.constraints,
      suggestion: null
    };
  }

  // ============================================================================
  // 🔄 VALIDATE BEFORE INSERT (V7 - Enhanced)
  // ============================================================================

  /**
   * التحقق قبل الإدراج: هل هذا المقطع بهذا التاريخ يكسر الترتيب؟
   * 
   * ✅ V7 Enhanced:
   * - تحقق شامل من Monotonic Order
   * - معلومات تفصيلية عن سبب الرفض
   * - اقتراح تاريخ بديل ذكي
   * - عرض constraints (minDate/maxDate)
   * - رسائل خطأ واضحة للمستخدم
   * 
   * @param {string} groupId - معرف الحلقة
   * @param {number} surahNumber - رقم السورة
   * @param {number} ayahStart - بداية الآيات
   * @param {number} ayahEnd - نهاية الآيات
   * @param {string} proposedDate - التاريخ المقترح (YYYY-MM-DD)
   * @returns {Promise<object>} نتيجة التحقق
   */
  async validateBeforeInsert(groupId, surahNumber, ayahStart, ayahEnd, proposedDate) {
    const { byDate, byQuran } = await this.getExistingSegments(groupId, surahNumber);
    
    const chunk = {
      surahNumber,
      ayahStart,
      ayahEnd,
      date: proposedDate
    };
    
    // التحقق من Monotonic Order
    const validation = this.validateMonotonicOrder(byDate, chunk);
    
    if (!validation.isValid) {
      // ============================================
      // حساب constraints للتاريخ المقترح
      // ============================================
      let minDate = null;
      let maxDate = null;
      let minDateReason = null;
      let maxDateReason = null;
      
      // فحص كل المقاطع الموجودة لتحديد الـ constraints
      const allSegments = byDate.length > 0 ? byDate : byQuran;
      
      for (const seg of allSegments) {
        const segDate = new Date(seg.date);
        const segDateKey = segDate.toISOString().split('T')[0];
        
        // إذا المقطع الموجود آياته أقل من المقطع الجديد
        // ⟹ تاريخ المقطع الجديد يجب أن يكون >= تاريخ المقطع الموجود
        if (seg.ayahEnd < ayahStart) {
          if (!minDate || segDate > minDate) {
            minDate = segDate;
            minDateReason = `بعد آيات ${seg.ayahStart}-${seg.ayahEnd} (${segDateKey})`;
          }
        }
        
        // إذا المقطع الموجود آياته أكبر من المقطع الجديد
        // ⟹ تاريخ المقطع الجديد يجب أن يكون <= تاريخ المقطع الموجود
        if (seg.ayahStart > ayahEnd) {
          if (!maxDate || segDate < maxDate) {
            maxDate = segDate;
            maxDateReason = `قبل آيات ${seg.ayahStart}-${seg.ayahEnd} (${segDateKey})`;
          }
        }
      }
      
      // تحسين رسالة الخطأ
      let enhancedReason = validation.reason;
      if (minDate && maxDate) {
        enhancedReason = `التاريخ يجب أن يكون بين ${minDate.toISOString().split('T')[0]} و ${maxDate.toISOString().split('T')[0]}`;
      } else if (minDate) {
        enhancedReason = `التاريخ يجب أن يكون بعد ${minDate.toISOString().split('T')[0]} (${minDateReason})`;
      } else if (maxDate) {
        enhancedReason = `التاريخ يجب أن يكون قبل ${maxDate.toISOString().split('T')[0]} (${maxDateReason})`;
      }
      
      // ============================================
      // اقتراح عدة تواريخ بديلة (V8 Enhanced)
      // ============================================
      
      // ✅ البحث يبدأ من اليوم الحالي أو minDate (أيهما أكبر)
      const today = new Date();
      today.setHours(0, 0, 0, 0); // التأكد من بداية اليوم بدقة
      
      const searchStartDate = minDate 
        ? new Date(Math.max(minDate.getTime(), today.getTime()))
        : today;
      
      const dateResult = await this.generateAvailableDates(groupId, 14, searchStartDate); // نطاق أسبوعين من تاريخ البدء
      
      // إيجاد أقرب تاريخ صالح فقط ضمن الـ constraints
      const validAlternatives = [];
      const dayNames = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
      
      for (const slot of dateResult.dates) {
        if (validAlternatives.length >= 1) break; // تاريخ واحد فقط (الأقرب)
        
        const slotDate = new Date(slot.date);
        
        // ✅ فلترة حسب constraints
        if (minDate && slotDate < minDate) continue;
        if (maxDate && slotDate > maxDate) continue;
        
        const testChunk = { ...chunk, date: slot.date };
        const testValidation = this.validateMonotonicOrder(byDate, testChunk);
        
        if (testValidation.isValid) {
          validAlternatives.push({
            date: slot.dateKey,
            dateKey: slot.dateKey,
            dayName: dayNames[slotDate.getDay()],
            weekNumber: slot.weekNumber,
            isPreferred: slot.isPreferred,
            reason: slot.reason
          });
        }
      }
      
      // أول تاريخ صالح كـ suggestedAlternative (للتوافق مع الكود القديم)
      const primaryAlternative = validAlternatives.length > 0 ? validAlternatives[0] : null;
      
      return {
        isValid: false,
        reason: enhancedReason,
        originalReason: validation.reason,
        conflictingSegment: validation.conflictingSegment || null,
        constraints: {
          minDate: minDate ? minDate.toISOString().split('T')[0] : null,
          maxDate: maxDate ? maxDate.toISOString().split('T')[0] : null,
          minDateReason,
          maxDateReason
        },
        proposedDate,
        // ✅ V8: قائمة من التواريخ البديلة
        suggestedAlternatives: validAlternatives,
        // للتوافق مع الكود القديم
        suggestedAlternative: primaryAlternative,
        // معلومات إضافية للـ debug
        debugInfo: {
          existingSegmentsCount: allSegments.length,
          proposedAyahRange: `${ayahStart}-${ayahEnd}`,
          alternativesFound: validAlternatives.length
        }
      };
    }
    
    // ✅ التاريخ صالح
    return { 
      isValid: true,
      proposedDate,
      message: 'التاريخ صالح - يحترم ترتيب الآيات'
    };
  }

  // ============================================================================
  // 🔧 VALIDATE AND AUTO-FIX (V6)
  // ============================================================================

  /**
   * التحقق مع الإصلاح التلقائي
   * 
   * إذا التاريخ المقترح غير صالح:
   * 1. يحاول إيجاد أقرب تاريخ صالح تلقائياً
   * 2. يرجع التاريخ البديل مع السبب
   * 
   * @param {string} groupId - معرف الحلقة
   * @param {number} surahNumber - رقم السورة
   * @param {number} ayahStart - بداية الآيات
   * @param {number} ayahEnd - نهاية الآيات
   * @param {string} proposedDate - التاريخ المقترح (YYYY-MM-DD)
   * @param {boolean} autoFix - إذا true، يحاول إيجاد تاريخ بديل تلقائياً
   * @returns {Promise<object>} نتيجة التحقق مع التاريخ البديل إن وُجد
   */
  async validateAndAutoFix(groupId, surahNumber, ayahStart, ayahEnd, proposedDate, autoFix = true) {
    const { byDate, byQuran } = await this.getExistingSegments(groupId, surahNumber);
    
    const chunk = {
      surahNumber,
      ayahStart,
      ayahEnd,
      date: proposedDate
    };
    
    // التحقق الأولي
    const validation = this.validateMonotonicOrder(byDate, chunk);
    
    if (validation.isValid) {
      return { 
        isValid: true,
        proposedDate,
        message: 'التاريخ صالح'
      };
    }
    
    // التاريخ غير صالح
    if (!autoFix) {
      return {
        isValid: false,
        reason: validation.reason,
        conflictingSegment: validation.conflictingSegment,
        suggestedAction: validation.suggestedAction
      };
    }
    
    // ============================================
    // محاولة الإصلاح التلقائي
    // ============================================
    
    // البحث يبدأ من اليوم الحالي بدقة
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // توليد تواريخ متاحة (نطاق أسبوعين من اليوم)
    const dateResult = await this.generateAvailableDates(
      groupId, 
      14, // نطاق أسبوعين
      today, 
      null
    );
    
    // البحث عن تاريخ صالح
    const alternative = await this.findValidDateForChunk(
      groupId, 
      chunk, 
      byDate, 
      dateResult.dates
    );
    
    if (alternative.found) {
      return {
        isValid: false,
        originalDateInvalid: true,
        reason: validation.reason,
        autoFixed: true,
        suggestedDate: {
          date: alternative.dateKey,
          dateKey: alternative.dateKey,
          reason: alternative.reason,
          constraints: alternative.constraints
        },
        message: `التاريخ ${proposedDate} غير صالح. التاريخ البديل المقترح: ${alternative.dateKey}`
      };
    }
    
    // لا يوجد تاريخ بديل
    return {
      isValid: false,
      originalDateInvalid: true,
      reason: validation.reason,
      autoFixed: false,
      suggestedDate: null,
      constraints: alternative.constraints,
      message: `التاريخ ${proposedDate} غير صالح ولا يوجد تاريخ بديل متاح. ${alternative.reason}`
    };
  }

  // ============================================================================
  // 📊 DEBUG HELPER - عرض الترتيب الحالي
  // ============================================================================

  /**
   * عرض الترتيب الحالي للمقاطع (للتصحيح)
   */
  async debugShowOrder(groupId, surahNumber) {
    const { byDate, byQuran } = await this.getExistingSegments(groupId, surahNumber);
    
    console.log('\n📅 الترتيب حسب التاريخ:');
    byDate.forEach((s, i) => {
      console.log(`  ${i + 1}. ${s.dateKey || this.toDateKeyUTC(s.date)} → الآيات ${s.ayahStart}-${s.ayahEnd}`);
    });
    
    console.log('\n📖 الترتيب القرآني:');
    byQuran.forEach((s, i) => {
      console.log(`  ${i + 1}. الآيات ${s.ayahStart}-${s.ayahEnd} ← ${s.dateKey || this.toDateKeyUTC(s.date)}`);
    });
    
    // التحقق من التطابق
    let isMonotonic = true;
    for (let i = 0; i < byDate.length - 1; i++) {
      const current = byDate[i];
      const next = byDate[i + 1];
      if (current.ayahStart > next.ayahStart) {
        isMonotonic = false;
        console.log(`\n⚠️ تعارض: ${current.dateKey} (${current.ayahStart}-${current.ayahEnd}) قبل ${next.dateKey} (${next.ayahStart}-${next.ayahEnd}) زمنياً لكن آياته أحدث!`);
      }
    }
    
    if (isMonotonic) {
      console.log('\n✅ الترتيب سليم (Monotonic)');
    }
    
    return { byDate, byQuran, isMonotonic };
  }
}

module.exports = new SmartSchedulerService();
