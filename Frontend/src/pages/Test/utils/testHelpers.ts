// ============================================================================
// Test Utils - دوال مساعدة للاختبار
// ============================================================================

/**
 * حساب النسبة المئوية
 */
export const calculatePercentage = (score: number, total: number): number => {
  if (total === 0) return 0;
  return Math.round((score / total) * 100);
};

/**
 * التحقق من مستوى الأداء
 */
export const getPerformanceLevel = (
  percentage: number
): {
  isPerfect: boolean;
  isGood: boolean;
  isAverage: boolean;
} => {
  return {
    isPerfect: percentage === 100,
    isGood: percentage >= 70,
    isAverage: percentage >= 50,
  };
};

/**
 * الحصول على رسالة تحفيزية
 */
export const getMotivationalMessage = (percentage: number): string => {
  const { isPerfect, isGood, isAverage } = getPerformanceLevel(percentage);

  if (isPerfect) {
    return "🌟 ما شاء الله! حفظك ممتاز، استمر في المراجعة!";
  }
  if (isGood) {
    return "💪 أداء جيد جداً! واصل الاجتهاد لتصل للكمال";
  }
  if (isAverage) {
    return "📖 نتيجة مقبولة، المزيد من المراجعة سيحسن أداءك";
  }
  return "🤲 لا تيأس، الممارسة والمراجعة المستمرة هي المفتاح";
};

/**
 * الحصول على أيقونة النتيجة
 */
export const getResultIcon = (percentage: number): string => {
  const { isPerfect, isGood, isAverage } = getPerformanceLevel(percentage);

  if (isPerfect) return "🏆";
  if (isGood) return "🌟";
  if (isAverage) return "👍";
  return "📝";
};

/**
 * الحصول على عنوان النتيجة
 */
export const getResultTitle = (percentage: number): string => {
  const { isPerfect, isGood, isAverage } = getPerformanceLevel(percentage);

  if (isPerfect) return "ممتاز! نتيجة كاملة! 🎉";
  if (isGood) return "أحسنت! نتيجة رائعة! 🌟";
  if (isAverage) return "جيد! يمكنك التحسين 💪";
  return "حاول مرة أخرى 📚";
};

/**
 * الحصول على لون gradient حسب الأداء
 */
export const getPerformanceGradient = (percentage: number): string => {
  const { isPerfect, isGood, isAverage } = getPerformanceLevel(percentage);

  if (isPerfect) return "from-yellow-400 to-orange-400";
  if (isGood) return "from-emerald-400 to-teal-400";
  if (isAverage) return "from-blue-400 to-cyan-400";
  return "from-gray-400 to-slate-400";
};

/**
 * الحصول على لون الدائرة التقدمية
 */
export const getProgressColor = (percentage: number): string => {
  const { isPerfect, isGood, isAverage } = getPerformanceLevel(percentage);

  if (isPerfect) return "#f59e0b";
  if (isGood) return "#10b981";
  if (isAverage) return "#3b82f6";
  return "#6b7280";
};

/**
 * تنسيق الوقت (دقائق:ثواني)
 */
export const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

/**
 * حساب إجمالي الآيات من السور المختارة
 */
export const calculateTotalAyahs = (
  selectedSurahs: number[],
  surahs: any[]
): number => {
  return selectedSurahs.reduce((sum, num) => {
    const surah = surahs.find((s) => s.number === num);
    return sum + (surah?.numberOfAyahs || 0);
  }, 0);
};

/**
 * التحقق من حالة المؤقت (طبيعي، تحذير، خطر)
 */
export const getTimerState = (
  timer: number
): {
  isDanger: boolean;
  isWarning: boolean;
  isNormal: boolean;
} => {
  return {
    isDanger: timer <= 5,
    isWarning: timer <= 10 && timer > 5,
    isNormal: timer > 10,
  };
};

/**
 * الحصول على CSS classes للمؤقت
 */
export const getTimerClasses = (timer: number): string => {
  const { isDanger, isWarning } = getTimerState(timer);

  if (isDanger) {
    return "bg-gradient-to-br from-red-500 to-pink-500 text-white animate-pulse scale-110";
  }
  if (isWarning) {
    return "bg-gradient-to-br from-yellow-400 to-orange-400 text-white";
  }
  return "bg-gradient-to-br from-blue-500 to-indigo-500 text-white";
};

/**
 * الحصول على رسالة المؤقت
 */
export const getTimerMessage = (timer: number): string => {
  const { isDanger, isWarning } = getTimerState(timer);

  if (isDanger) return "⚠️ أسرع!";
  if (isWarning) return "⏱️ الوقت المتبقي";
  return "⏱️ الوقت المتبقي";
};

/**
 * الحصول على رسالة تشجيعية أثناء الاختبار
 */
export const getTestEncouragementMessage = (timer: number): string => {
  const { isDanger } = getTimerState(timer);

  if (isDanger) return "⚡ أسرع! الوقت ينفد";
  return "💡 فكّر جيداً قبل الإجابة";
};

/**
 * حساب نسبة التقدم في الاختبار
 */
export const calculateProgress = (
  currentIndex: number,
  total: number
): number => {
  if (total === 0) return 0;
  return ((currentIndex + 1) / total) * 100;
};
