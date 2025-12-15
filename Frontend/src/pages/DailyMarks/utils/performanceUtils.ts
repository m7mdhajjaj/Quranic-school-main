/**
 * Performance utilities for Daily Marks
 * Contains helper functions for performance level calculations and display
 */

import { PERFORMANCE_THRESHOLDS } from "../constants";

export interface PerformanceLevel {
  label: string;
  color: string;
  emoji: string;
}

/**
 * Calculate performance level based on average score
 * @param average - The average score
 * @param max - Maximum possible score (default: 10)
 * @returns Performance level object with label, color, and emoji
 */
export const getPerformanceLevel = (
  average: number,
  max: number = 10
): PerformanceLevel => {
  const percentage = (average / max) * 100;
  
  if (percentage >= PERFORMANCE_THRESHOLDS.EXCELLENT) {
    return { label: "ممتاز", color: "emerald", emoji: "🌟" };
  }
  
  if (percentage >= PERFORMANCE_THRESHOLDS.VERY_GOOD) {
    return { label: "جيد جداً", color: "blue", emoji: "⭐" };
  }
  
  if (percentage >= PERFORMANCE_THRESHOLDS.GOOD) {
    return { label: "جيد", color: "amber", emoji: "✨" };
  }
  
  return { label: "يحتاج تحسين", color: "red", emoji: "📚" };
};

/**
 * Calculate percentage from average
 * @param average - The average score
 * @param max - Maximum possible score (default: 10)
 * @returns Percentage value
 */
export const calculatePercentage = (
  average: number,
  max: number = 10
): number => {
  return Math.round((average / max) * 100);
};
