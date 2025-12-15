/**
 * useAzkarCategories Hook (Mobile)
 * Hook لإدارة قائمة التصنيفات
 */

import { useMemo } from "react";
import type { AzkarCategory } from "../Types/types";
import { useAzkarProgress } from "./useAzkarProgress";

export const useAzkarCategories = (categories: AzkarCategory[]) => {
  const { getCategoryStats } = useAzkarProgress();

  const categoriesWithStats = useMemo(() => {
    return categories.map((category) => ({
      ...category,
      ...getCategoryStats(category),
    }));
  }, [categories, getCategoryStats]);

  const totalStats = useMemo(() => {
    const totalCompleted = categoriesWithStats.reduce(
      (sum, cat) => sum + cat.completedCount,
      0
    );
    const totalAll = categoriesWithStats.reduce(
      (sum, cat) => sum + cat.totalCount,
      0
    );
    const allCompleted = categoriesWithStats.every(
      (cat) => cat.isFullyCompleted
    );

    return {
      totalCompleted,
      totalAll,
      progress:
        totalAll > 0 ? Math.round((totalCompleted / totalAll) * 100) : 0,
      allCompleted,
    };
  }, [categoriesWithStats]);

  return {
    categoriesWithStats,
    totalStats,
  };
};
