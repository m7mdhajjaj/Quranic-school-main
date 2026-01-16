/**
 * Mark utilities for Daily Marks
 * Contains helper functions for mark display, colors, and formatting
 * ✅ يستخدم توقيت فلسطين (Asia/Jerusalem) الموحد
 */

import { MARK_THRESHOLDS, MONTH_NAMES } from "../constants";
import { TIMEZONE } from "@/utils/timezone";

/**
 * Get appropriate color classes for a mark based on its value and type
 * @param value - The mark value (0-10)
 * @param markType - Type of mark: "review" or "memorization"
 * @returns Tailwind CSS classes for styling
 */
export const getMarkColor = (
  value: number,
  markType: "review" | "memorization"
): string => {
  if (markType === "review") {
    // علامة المراجعة - تدرجات الأخضر
    if (value >= MARK_THRESHOLDS.EXCELLENT) return "bg-emerald-100 text-emerald-800 border border-emerald-300";
    if (value >= MARK_THRESHOLDS.VERY_GOOD) return "bg-green-100 text-green-800 border border-green-300";
    if (value >= MARK_THRESHOLDS.GOOD) return "bg-lime-100 text-lime-800 border border-lime-300";
    return "bg-red-100 text-red-800 border border-red-300";
  } else {
    // علامة الحفظ - تدرجات الأزرق
    if (value >= MARK_THRESHOLDS.EXCELLENT) return "bg-blue-100 text-blue-800 border border-blue-300";
    if (value >= MARK_THRESHOLDS.VERY_GOOD) return "bg-cyan-100 text-cyan-800 border border-cyan-300";
    if (value >= MARK_THRESHOLDS.GOOD) return "bg-sky-100 text-sky-800 border border-sky-300";
    return "bg-red-100 text-red-800 border border-red-300";
  }
};

/**
 * Format date to localized string
 * @param date - Date object or string
 * @param locale - Locale string (default: "ar-SA")
 * @param options - Intl.DateTimeFormatOptions
 * @returns Formatted date string
 */
export const formatDate = (
  date: Date | string,
  locale: string = "ar-SA",
  options?: Intl.DateTimeFormatOptions
): string => {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return dateObj.toLocaleDateString(locale, { ...options, timeZone: TIMEZONE });
};

/**
 * Get month name in Arabic
 * @param monthNumber - Month number (1-12)
 * @returns Arabic month name
 */
export const getMonthName = (monthNumber: number): string => {
  return MONTH_NAMES[monthNumber - 1] || "";
};

/**
 * Format date with day name
 * @param date - Date to format
 * @returns Object with formattedDate and dayName
 */
export const formatDateWithDay = (date: Date | string) => {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  const formattedDate = dateObj.toLocaleDateString("en-GB", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: TIMEZONE
  });
  const dayName = dateObj.toLocaleDateString("ar-SA", { weekday: "long", timeZone: TIMEZONE });
  return { formattedDate, dayName };
};
