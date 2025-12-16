/**
 * Prayer Times Types - Mobile
 * جميع الواجهات والأنواع الخاصة بصفحة مواقيت الصلاة
 */

export interface PrayerTime {
  name: string;
  time: string;
  icon: string;
}

export interface NextPrayer {
  name: string;
  timeLeft: string;
}

export interface PrayerCardProps {
  prayer: PrayerTime;
}

export interface DateCardProps {
  currentDate: string;
  hijriDate: string;
}

export interface NextPrayerCardProps {
  nextPrayer: NextPrayer;
}
