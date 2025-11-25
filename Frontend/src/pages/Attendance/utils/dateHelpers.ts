// utils/dateHelpers.ts
import { AR_MONTHS } from "@/utils/constants/arabicMonths";

// إعادة تصدير AR_MONTHS للاستخدام في ملفات Absence
export { AR_MONTHS };

export const todayISO = () => new Date().toISOString().split("T")[0];

export const isDateTooOld = (date: string): boolean => {
  const selectedDate = new Date(date);
  const now = new Date();
  const ONE_WEEK = 7 * 24 * 60 * 60 * 1000;
  const timeDiff = now.getTime() - selectedDate.getTime();
  return timeDiff > ONE_WEEK;
};

export const getDaysAgo = (date: string): number => {
  const selectedDate = new Date(date);
  const now = new Date();
  const timeDiff = now.getTime() - selectedDate.getTime();
  return Math.round(timeDiff / (1000 * 60 * 60 * 24));
};
