// ============================================================================
// Duration Helpers - دوال حساب المدة والوقت
// ============================================================================

/**
 * تحويل الوقت من صيغة 12 ساعة (AM/PM) إلى دقائق
 * @param time - الوقت بصيغة "12:00 PM" أو "11:30 AM"
 * @returns عدد الدقائق من منتصف الليل
 */
export const timeToMinutes = (time: string): number => {
  const match = time.match(/^(\d{1,2}):(\d{2})\s?(AM|PM)$/i);
  if (!match) return 0;
  
  let hours = parseInt(match[1]);
  const minutes = parseInt(match[2]);
  const period = match[3].toUpperCase();
  
  // تحويل إلى صيغة 24 ساعة
  if (period === 'PM' && hours !== 12) {
    hours += 12; // 1 PM = 13, 2 PM = 14, etc.
  } else if (period === 'AM' && hours === 12) {
    hours = 0; // 12 AM = midnight
  }
  // 12 PM = 12 (noon) - لا تغيير
  // 11 AM = 11 - لا تغيير (للتوقيت الشتوي)
  
  return hours * 60 + minutes;
};

/**
 * حساب مدة الحصة بالدقائق
 * يدعم التوقيت الصيفي (12 PM - 9 PM) والشتوي (11 AM - 8 PM)
 * @param startHour - وقت البداية
 * @param endHour - وقت النهاية
 * @returns المدة بالدقائق
 */
export const calculateDuration = (startHour: string, endHour: string): number => {
  const start = timeToMinutes(startHour);
  const end = timeToMinutes(endHour);
  
  // إذا كانت النهاية أصغر من البداية، تعني أن الحصة تمتد إلى اليوم التالي
  // لكن في حالتنا جميع الأوقات في نفس اليوم (11 AM - 9 PM)
  return end > start ? end - start : 0;
};

/**
 * تنسيق المدة بصيغة قابلة للقراءة
 * @param minutes - المدة بالدقائق
 * @returns النص المنسق (مثل: "1س 30د" أو "45 دقيقة")
 */
export const formatDuration = (minutes: number): string => {
  if (minutes === 0) return '0 دقيقة';
  
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours > 0 && mins > 0) {
    return `${hours}س ${mins}د`;
  }
  
  if (hours > 0) {
    return hours === 1 ? 'ساعة واحدة' : `${hours} ساعة`;
  }
  
  return `${mins} دقيقة`;
};

/**
 * حساب المدة الإجمالية لمجموعة حصص
 * @param sessions - مصفوفة الحصص
 * @returns المدة الإجمالية بالدقائق
 */
export const calculateTotalDuration = (
  sessions: Array<{ startHour: string; endHour: string }>
): number => {
  return sessions.reduce(
    (total, session) => total + calculateDuration(session.startHour, session.endHour),
    0
  );
};
