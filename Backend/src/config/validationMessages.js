/**
 * ============================================================================
 * Validation Messages - Central Validation Rules & Messages (V7)
 * ============================================================================
 * 
 * هذا الملف يحتوي على جميع رسائل التحقق المستخدمة في النظام
 * يتم استيراده في الـ SectionSequenceService للتحقق
 * 
 * ✅ القاعدة: التحقق يتم في الـ Backend فقط
 * ✅ الـ Frontend يعرض رسائل الخطأ القادمة من الـ Backend
 */

// ============================================================================
// 🛠️ Helper: Format Error Message
// ============================================================================
const formatErrorMessage = (title, details, solution) => {
  return `❌ ${title}\n\n📝 التفاصيل: ${details}\n\n💡 الحل: ${solution}`;
};

// ============================================================================
// 📝 رسائل أخطاء الحفظ (Memorization)
// ============================================================================
const MEMORIZATION_ERRORS = {
  // تكرار الحفظ ممنوع
  DUPLICATE: (surahNum, ayahStart, ayahEnd, existingDate) => formatErrorMessage(
    "تكرار الحفظ ممنوع",
    `الآيات ${ayahStart} إلى ${ayahEnd} من سورة ${surahNum} محفوظة مسبقاً بتاريخ ${existingDate}.`,
    "لا يمكنك حفظ نفس المقطع مرتين. يرجى مراجعة السجل."
  ),
  
  // فجوة في الحفظ
  GAP: (expectedStart, actualStart) => formatErrorMessage(
    "فجوة في الحفظ (غير متصل)",
    `تحاول البدء من الآية ${actualStart}، بينما آخر حفظ توقف قبل ذلك.`,
    `يجب أن تبدأ من الآية ${expectedStart} لضمان التسلسل.`
  ),
  
  // بداية السورة غير صحيحة
  WRONG_START: (surahNum, ayahStart) => formatErrorMessage(
    "بداية السورة غير صحيحة",
    `تحاول بدء حفظ سورة ${surahNum} من الآية ${ayahStart}.`,
    "يجب أن يبدأ أول حفظ للسورة دائماً من الآية رقم 1."
  ),
  
  // السورة مكتملة الحفظ
  SURAH_COMPLETED: (surahName, ayahCount, lastEnd) => formatErrorMessage(
    "السورة مكتملة الحفظ بالفعل",
    `سورة ${surahName} عدد آياتها ${ayahCount}، وآخر مقطع مسجل ينتهي عند الآية ${lastEnd}.`,
    "لقد أتممت حفظ هذه السورة سابقاً. لا يمكنك إضافة مقاطع حفظ جديدة لها. يمكنك تسجيل \"مراجعة\" إذا أردت تثبيتها."
  ),
  
  // تداخل مع حفظ سابق
  OVERLAP: (ayahStart, maxEnd, nextStart) => formatErrorMessage(
    "تداخل مع حفظ سابق",
    `تحاول إضافة حفظ يبدأ من الآية ${ayahStart}، بينما أعلى آية محفوظة هي ${maxEnd}.`,
    `يجب أن تبدأ الحفظ الجديد من الآية ${nextStart} لتكمل التسلسل.`
  ),
  
  // تعارض في ترتيب التواريخ (التاريخ أقدم لكن الآيات أحدث)
  DATE_ORDER_OLDER: (proposedDate, existingDate, proposedAyahs, existingAyahs) => formatErrorMessage(
    "تعارض في ترتيب التواريخ والآيات (الحفظ)",
    `التاريخ المختار (${proposedDate}) أقدم من تاريخ مقطع موجود (${existingDate})، لكنك تحاول إضافة آيات (${proposedAyahs}) أحدث من آيات ذلك المقطع (${existingAyahs}).`,
    `اختر تاريخاً لاحقاً لـ ${existingDate}، أو اختر آيات أقدم.`
  ),
  
  // تعارض في ترتيب التواريخ (التاريخ أحدث لكن الآيات أقدم)
  DATE_ORDER_NEWER: (proposedDate, existingDate, proposedAyahs, existingAyahs) => formatErrorMessage(
    "تعارض في ترتيب التواريخ والآيات (الحفظ)",
    `التاريخ المختار (${proposedDate}) أحدث من تاريخ مقطع موجود (${existingDate})، لكنك تحاول إضافة آيات (${proposedAyahs}) أقدم من آيات ذلك المقطع (${existingAyahs}).`,
    `اختر تاريخاً أقدم من ${existingDate}، أو اختر آيات أحدث.`
  ),
  
  // مشكلة في تسلسل الحفظ (عام)
  SEQUENCE_ERROR: (details) => formatErrorMessage(
    "مشكلة في تسلسل الحفظ",
    details,
    "يرجى الالتزام بالتسلسل."
  ),
  
  // عدم تطابق مع التسلسل اللاحق
  NEXT_GAP: (ayahEnd, nextStart, nextDate) => formatErrorMessage(
    "عدم تطابق مع التسلسل اللاحق",
    `في تاريخ لاحق (${nextDate})، قمت بحفظ الآيات ابتداءً من الآية ${nextStart}. المقطع الحالي ينتهي عند ${ayahEnd}، مما سيترك فجوة بينهما.`,
    `للحفاظ على التسلسل المتصل، يجب أن يمتد حفظك الحالي حتى الآية ${nextStart - 1} ليلتحم بالحفظ اللاحق.`
  ),
  
  // تداخل مع حفظ لاحق
  NEXT_OVERLAP: (ayahEnd, nextStart, nextDate) => formatErrorMessage(
    "تداخل مع حفظ لاحق",
    `المقطع الجديد ينتهي عند الآية ${ayahEnd}، وهذا يتداخل مع حفظ مسجل بتاريخ لاحق (${nextDate}) يبدأ من الآية ${nextStart}.`,
    `يجب أن ينتهي مقطعك الحالي قبل الآية ${nextStart} لتجنب التكرار.`
  ),
  
  // جسر غير مكتمل
  BRIDGE_INCOMPLETE: (segDesc, gapStart, gapEnd, prevKey, nextKey) => 
    `❌ جسر غير مكتمل: المقطع [${segDesc}] يجب أن يسد الفجوة بالضبط [${gapStart}-${gapEnd}] بين ${prevKey} و ${nextKey}.`
};

// ============================================================================
// 📝 رسائل أخطاء المراجعة (Review)
// ============================================================================
const REVIEW_ERRORS = {
  // لا يوجد حفظ سابق
  NO_MEMORIZATION: (surahNum, ayahStart, ayahEnd) => formatErrorMessage(
    "لا يوجد حفظ سابق لهذه السورة",
    `تحاول مراجعة سورة ${surahNum} (الآيات ${ayahStart}-${ayahEnd})، لكن لم نجد أي حفظ سابق لها.`,
    "يجب حفظ السورة أولاً قبل مراجعتها."
  ),
  
  // المراجعة تتجاوز الحفظ
  EXCEEDS_MEMORIZATION: (reviewEnd, maxMemorized) => formatErrorMessage(
    "المراجعة تتجاوز الحفظ",
    `تحاول مراجعة الآيات حتى ${reviewEnd}، بينما آخر آية محفوظة في هذه السورة هي ${maxMemorized}.`,
    `يجب أن تنتهي المراجعة عند الآية ${maxMemorized} كحد أقصى. لا يمكنك مراجعة ما لم تحفظه بعد.`
  ),
  
  // بداية المراجعة خارج نطاق الحفظ
  START_EXCEEDS: (reviewStart, maxMemorized) => formatErrorMessage(
    "بداية المراجعة خارج نطاق الحفظ",
    `تحاول بدء المراجعة من الآية ${reviewStart}، بينما آخر آية محفوظة هي ${maxMemorized}.`,
    `يجب أن تبدأ المراجعة من آية ضمن ما تم حفظه (1 إلى ${maxMemorized}).`
  ),
  
  // فجوة في المراجعة
  GAP: (surahNum, ayahStart, ayahEnd, lastEnd, expectedStart) => formatErrorMessage(
    "فجوة في المراجعة (غير متصل)",
    `تحاول مراجعة الآيات ${ayahStart}-${ayahEnd} من سورة ${surahNum}، بينما آخر مراجعة توقفت عند الآية ${lastEnd}.`,
    `يجب أن تكمل المراجعة بالتسلسل. ابدأ من الآية ${expectedStart}، أو ابدأ دورة جديدة من الآية 1.`
  ),
  
  // بداية المراجعة غير صحيحة
  WRONG_START: (surahNum, ayahStart) => formatErrorMessage(
    "بداية المراجعة غير صحيحة",
    `تحاول بدء مراجعة سورة ${surahNum} من الآية ${ayahStart}.`,
    "يجب أن تبدأ أول مراجعة للسورة دائماً من الآية رقم 1."
  ),
  
  // تكرار المراجعة في نفس اليوم
  SAME_DAY_DUPLICATE: (surahNum, ayahStart, ayahEnd) => formatErrorMessage(
    "تكرار المراجعة في نفس اليوم",
    `المقطع ${ayahStart}-${ayahEnd} من سورة ${surahNum}.`,
    "لقد قمت بإضافة هذا المقطع للمراجعة في سجل سابق اليوم."
  ),
  
  // تعارض في ترتيب التواريخ (المراجعة)
  DATE_ORDER_OLDER: (proposedDate, existingDate, proposedAyahs, existingAyahs) => formatErrorMessage(
    "تعارض في ترتيب التواريخ والآيات (المراجعة)",
    `التاريخ المختار (${proposedDate}) أقدم من تاريخ مقطع مراجعة موجود (${existingDate})، لكنك تحاول إضافة آيات (${proposedAyahs}) أحدث من آيات ذلك المقطع (${existingAyahs}).`,
    `اختر تاريخاً لاحقاً لـ ${existingDate}، أو اختر آيات أقدم.`
  ),
  
  DATE_ORDER_NEWER: (proposedDate, existingDate, proposedAyahs, existingAyahs) => formatErrorMessage(
    "تعارض في ترتيب التواريخ والآيات (المراجعة)",
    `التاريخ المختار (${proposedDate}) أحدث من تاريخ مقطع مراجعة موجود (${existingDate})، لكنك تحاول إضافة آيات (${proposedAyahs}) أقدم من آيات ذلك المقطع (${existingAyahs}).`,
    `اختر تاريخاً أقدم من ${existingDate}، أو اختر آيات أحدث.`
  )
};

// ============================================================================
// 📝 رسائل أخطاء الاتساق (Consistency)
// ============================================================================
const CONSISTENCY_ERRORS = {
  // لا يمكن حفظ ومراجعة نفس المقطع
  SAME_SEGMENT: (ayahStart, ayahEnd, surahNum) => formatErrorMessage(
    "لا يمكن حفظ ومراجعة نفس المقطع معاً",
    `تحاول حفظ ومراجعة نفس المقطع (${ayahStart}-${ayahEnd}) من سورة ${surahNum} في نفس الطلب.`,
    "يجب أن يسبق الحفظ المراجعة. راجع المقاطع المحفوظة سابقاً فقط."
  ),
  
  // مراجعة سورة جديدة
  REVIEW_NEW_SURAH: (surahNum) => formatErrorMessage(
    "ترتيب غير منطقي",
    `تحاول مراجعة سورة ${surahNum} بينما تقوم ببدء حفظها في نفس الطلب.`,
    "لا يمكن مراجعة سورة لم تحفظ جزءاً منها سابقاً. يجب أن يسبق الحفظ المراجعة بمقطع واحد على الأقل."
  ),
  
  // المراجعة تتداخل مع الحفظ الجديد
  REVIEW_OVERLAPS_MEMORIZATION: (revStart, revEnd, memStart, memEnd) => formatErrorMessage(
    "المراجعة تتداخل مع الحفظ الجديد",
    `المراجعة (${revStart}-${revEnd}) تتداخل مع نطاق الحفظ الجديد (${memStart}-${memEnd}).`,
    `المراجعة تكون للمحفوظات السابقة فقط. يجب أن تنتهي المراجعة قبل الآية ${memStart}.`
  )
};

// ============================================================================
// 📝 رسائل أخطاء الحصص (Quota)
// ============================================================================
const QUOTA_ERRORS = {
  // تجاوز الحد اليومي
  DAILY_LIMIT: (dateKey) => formatErrorMessage(
    "تم تسجيل تسميع لهذا اليوم بالفعل",
    `يوجد سجل تسميع محفوظ بتاريخ اليوم (${dateKey}) لهذه الحلقة.`,
    "يسمح بإضافة سجل واحد فقط لكل يوم (يمكنك إضافة حفظ ومراجعة معاً في نفس السجل، أو تعديل السجل الحالي لإضافة المزيد)."
  ),
  
  // تجاوز الحد الأسبوعي
  WEEKLY_LIMIT: (maxCount, weekStart, weekEnd, currentCount) => formatErrorMessage(
    `تجاوز الحد الأسبوعي (${maxCount} مقاطع)`,
    `هذه الحلقة استنفدت رصيدها لهذا الأسبوع (${weekStart} - ${weekEnd}).\nعدد المقاطع الحالي: ${currentCount}.`,
    `النظام يسمح بـ ${maxCount} أيام تسميع فقط أسبوعياً لكل حلقة (بغض النظر عن المعلم). يرجى اختيار تاريخ في أسبوع آخر أو حذف سجل سابق.`
  ),
  
  // خارج نطاق الأسبوع الحالي (أسبوع قادم)
  FUTURE_WEEK: () => 
    "⚠️ مسموح فقط بتواريخ الأسبوع الحالي.\n\nلا يمكنك اختيار تاريخ من أسبوع قادم.",
  
  // خارج نطاق الأسبوع الحالي (أسبوع ماضي)
  PAST_WEEK: () => 
    "⚠️ مسموح فقط بتواريخ الأسبوع الحالي.\n\nلا يمكنك اختيار تاريخ من أسبوع سابق."
};

// ============================================================================
// 📝 رسائل أخطاء السورة النشطة (Active Surah)
// ============================================================================
const ACTIVE_SURAH_ERRORS = {
  // يجب إكمال السورة الحالية أولاً
  MUST_COMPLETE_CURRENT: (activeSurahName, newSurahName, progress = null) => {
    let detailsText = `لا يمكنك البدء بسورة ${newSurahName} قبل إكمال سورة ${activeSurahName}.`;
    let solutionText = "أكمل السورة الحالية أولاً أو احذف التسجيلات السابقة.";
    
    if (progress) {
      detailsText = `لا يمكنك البدء بسورة ${newSurahName} قبل إكمال سورة ${activeSurahName}.\n\n📊 التقدم الحالي: ${progress.lastAyahEnd}/${progress.totalAyahs} آية (${progress.progressPercent}%)\n⏳ المتبقي: ${progress.remainingAyahs} آية`;
      solutionText = `أكمل الحفظ/المراجعة حتى الآية ${progress.totalAyahs} من سورة ${activeSurahName}، ثم يمكنك البدء بسورة جديدة.`;
    }
    
    return formatErrorMessage(
      "يجب إكمال السورة الحالية أولاً",
      detailsText,
      solutionText
    );
  },
  
  // السورة مكتملة بنجاح
  SURAH_COMPLETED_SUCCESS: (surahName, ayahCount, type) => {
    const typeLabel = type === 'memorization' ? 'الحفظ' : 'المراجعة';
    return `🎉 تهانينا! سورة ${surahName} (${ayahCount} آية) مكتملة ${typeLabel}! يمكنك الآن البدء بسورة جديدة.`;
  }
};

// ============================================================================
// 📤 Exports
// ============================================================================
module.exports = {
  formatErrorMessage,
  MEMORIZATION_ERRORS,
  REVIEW_ERRORS,
  CONSISTENCY_ERRORS,
  QUOTA_ERRORS,
  ACTIVE_SURAH_ERRORS
};
