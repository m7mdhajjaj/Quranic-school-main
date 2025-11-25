import { useState } from "react";

/**
 * Custom hook for month/year selection
 * Note: Filtering and averages calculation moved to backend API
 */
export const useSectionsFilter = () => {
  const [selectedMonth, setSelectedMonth] = useState<number>(
    new Date().getMonth() + 1
  ); // Current month (1-12)
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear()
  ); // Current year

  return {
    selectedMonth,
    selectedYear,
    setSelectedMonth,
    setSelectedYear,
  };
};
