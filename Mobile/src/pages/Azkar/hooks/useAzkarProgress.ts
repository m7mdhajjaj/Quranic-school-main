/**
 * useAzkarProgress Hook (Mobile)
 * نفس منطق Frontend لحساب تقدم الأذكار
 */

import type { AzkarCategory, Dhikr } from "../Types/types";

export const useAzkarProgress = () => {
  const calculateCompletedCount = (adhkar: Dhikr[]): number => {
    return adhkar.filter((dhikr) => dhikr.count === 0).length;
  };

  const calculateProgress = (
    completedCount: number,
    totalCount: number
  ): number => {
    if (totalCount === 0) return 0;
    return Math.round((completedCount / totalCount) * 100);
  };

  const isFullyCompleted = (adhkar: Dhikr[]): boolean => {
    return adhkar.every((dhikr) => dhikr.count === 0);
  };

  const getCategoryStats = (category: AzkarCategory) => {
    const completedCount = calculateCompletedCount(category.adhkar);
    const totalCount = category.adhkar.length;
    const progress = calculateProgress(completedCount, totalCount);
    const completed = isFullyCompleted(category.adhkar);

    return {
      completedCount,
      totalCount,
      progress,
      isFullyCompleted: completed,
    };
  };

  return {
    calculateCompletedCount,
    calculateProgress,
    isFullyCompleted,
    getCategoryStats,
  };
};
