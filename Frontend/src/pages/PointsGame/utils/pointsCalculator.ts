// utils/pointsCalculator.ts
import type {
  PrayerStatus,
  Prayers,
  Nawafel,
  Adhkar,
  Halaqah,
} from "../types/pointsGame.types";

export const getPrayerPoints = (status: PrayerStatus): number => {
  switch (status) {
    case "mosque":
      return 12;
    case "home":
      return 5;
    case "late":
      return 2;
    case "missed":
      return 0;
    default:
      return 0;
  }
};

export const calculateTotalPoints = (
  prayers: Prayers,
  nawafel: Nawafel,
  parentRespect: number,
  schoolAttendance: boolean,
  dailyStudy: number,
  adhkar: Adhkar,
  halaqah: Halaqah
): number => {
  let total = 0;

  // نقاط الصلوات الفروض
  Object.values(prayers).forEach((prayer) => {
    total += getPrayerPoints(prayer.status);
  });

  // نقاط النوافل
  if (nawafel.duha) total += 5;
  if (nawafel.qiyamAlayl) total += 10;
  if (nawafel.rawatib) total += 5;
  if (nawafel.witr) total += 5;

  // نقاط بر الوالدين
  total += parentRespect;

  // نقاط المدرسة
  if (schoolAttendance) total += 5;
  total += dailyStudy * 2;

  // نقاط الأذكار
  if (adhkar.morning) total += 5;
  if (adhkar.evening) total += 5;
  if (adhkar.sleep) total += 3;
  if (adhkar.afterPrayer) total += 5;

  // نقاط الحلقة
  total += Math.floor(halaqah.memorizedMinutes / 10) * 5;
  total += Math.floor(halaqah.reviewedMinutes / 10) * 3;

  return total;
};

export const getMotivationalMessage = (totalPoints: number): string => {
  if (totalPoints >= 100) {
    return "أنت طالب مثالي! استمر في التميز 🌟";
  } else if (totalPoints >= 70) {
    return "أداء رائع! بقليل من الجهد ستصل للكمال 💪";
  } else if (totalPoints >= 50) {
    return "أداء جيد! حاول تحسين نقاطك في الأيام القادمة 📈";
  } else {
    return "ابدأ بخطوات صغيرة، وستصل للقمة بإذن الله! 🚀";
  }
};
