/**
 * Helper functions for Ranking screen
 */

import type { StudentWithAverage } from "@/types/ranking.types";

/**
 * Get student full name
 */
export const getFullName = (student: StudentWithAverage): string => {
  const { firstName, fatherName, lastName } = student;
  return `${firstName || ""} ${fatherName || ""} ${lastName || ""}`.trim();
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

/**
 * Get medal color based on rank
 */
export const getMedalColor = (rank: number): string => {
  if (rank === 1) return "#FFD700"; // Gold
  if (rank === 2) return "#C0C0C0"; // Silver
  if (rank === 3) return "#CD7F32"; // Bronze
  return "#9CA3AF"; // Gray
};
