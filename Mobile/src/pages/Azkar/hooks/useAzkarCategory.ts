/**
 * useAzkarCategory Hook (Mobile)
 * Hook لإدارة عرض التصنيف المحدد
 */

import { useMemo } from "react";
import type { AzkarCategory } from "../Types/types";
import { useAzkarProgress } from "./useAzkarProgress";

export const useAzkarCategory = (category: AzkarCategory | null) => {
  const { getCategoryStats } = useAzkarProgress();

  const categoryWithStats = useMemo(() => {
    if (!category) return null;
    const stats = getCategoryStats(category);
    return {
      ...category,
      ...stats,
    };
  }, [category]);

  return {
    categoryWithStats,
  };
};
