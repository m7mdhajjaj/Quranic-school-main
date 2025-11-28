/**
 * Helper functions for Ranking page
 */

import type { StudentWithAverage } from "../types/ranking";

/**
 * Get student full name
 */
export const getFullName = (student: StudentWithAverage): string => {
  const firstName = student.firstName || "";
  const fatherName = student.fatherName || "";
  const lastName = student.lastName || "";
  return `${firstName} ${fatherName} ${lastName}`.trim() || "-";
};

/**
 * Convert month number to Arabic name
 */
export const getMonthName = (month: number): string => {
  const months = [
    "يناير",
    "فبراير",
    "مارس",
    "إبريل",
    "مايو",
    "يونيو",
    "يوليو",
    "أغسطس",
    "سبتمبر",
    "أكتوبر",
    "نوفمبر",
    "ديسمبر",
  ];
  return months[month - 1] || "";
};

/**
 * Generate available years array (current year - 5 years)
 */
export const generateAvailableYears = (): number[] => {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let i = currentYear; i >= currentYear - 5; i--) {
    years.push(i);
  }
  return years;
};

/**
 * Get current month and year
 */
export const getCurrentPeriod = (): { month: number; year: number } => {
  const now = new Date();
  return {
    month: now.getMonth() + 1,
    year: now.getFullYear(),
  };
};
