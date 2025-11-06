// utils/badgeDefinitions.ts
import type { Badge } from "../types/pointsGame.types";

export const allBadges: Omit<Badge, "count">[] = [
  {
    id: "mosque_30_days",
    name: "المصلي المجتهد",
    icon: "🕌",
    description: "صلى 3 صلوات في المسجد لمدة 30 يوم متتالي",
    requirement: "30 يوم متتالي",
  },
  {
    id: "adhkar_7_days",
    name: "نجم الأذكار",
    icon: "⭐",
    description: "قرأ الأذكار 7 أيام متتالية",
    requirement: "7 أيام متتالية",
  },
  {
    id: "parent_respect_5_times",
    name: "بار بوالديه",
    icon: "❤️",
    description: "حصل على 10/10 في بر الوالدين 5 مرات",
    requirement: "5 مرات 10/10",
  },
  {
    id: "school_30_days",
    name: "الطالب المنضبط",
    icon: "🎒",
    description: "حضر 20 يوم في المدرسة خلال الشهر",
    requirement: "20 يوم في الشهر",
  },
  {
    id: "overall_15_days",
    name: "سلسلة الإنجاز",
    icon: "🔥",
    description: "شارك في اللعبة 15 يوم متتالي",
    requirement: "15 يوم متواصل",
  },
  {
    id: "sunan_keeper",
    name: "المحافظ على السنن",
    icon: "🌙",
    description: "صلى جميع النوافل 7 أيام متتالية",
    requirement: "7 أيام نوافل كاملة",
  },
  {
    id: "mosque_two_week",
    name: "المصلي النشيط",
    icon: "💫",
    description: "صلى صلاتين في المسجد لمدة أسبوع",
    requirement: "أسبوع كامل",
  },
  {
    id: "all_badges",
    name: "البطل الشامل",
    icon: "👑",
    description: "حصل على جميع الشارات",
    requirement: "جميع الشارات",
  },
];

export const prayerNames: Record<string, string> = {
  fajr: "الفجر",
  dhuhr: "الظهر",
  asr: "العصر",
  maghrib: "المغرب",
  isha: "العشاء",
};
