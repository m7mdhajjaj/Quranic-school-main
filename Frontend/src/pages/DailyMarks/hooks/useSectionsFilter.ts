import { useState } from "react";

interface UseSectionsFilterReturn {
  selectedMonth: number | null;
  selectedYear: number | null;
  selectedDay: number | null;
  setSelectedMonth: React.Dispatch<React.SetStateAction<number | null>>;
  setSelectedYear: React.Dispatch<React.SetStateAction<number | null>>;
  setSelectedDay: React.Dispatch<React.SetStateAction<number | null>>;
}

/**
 * Custom hook for month/year/day filter state management
 * 
 * @description
 * - Manages filter state for sections
 * - Default: null values (show all sections)
 * - Note: Filtering and averages calculation moved to backend API
 * 
 * @returns {UseSectionsFilterReturn} Filter state and setters
 */
export const useSectionsFilter = (): UseSectionsFilterReturn => {
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null); // null = all months
  const [selectedYear, setSelectedYear] = useState<number | null>(null); // null = all years
  const [selectedDay, setSelectedDay] = useState<number | null>(null); // null = all days

  return {
    selectedMonth,
    selectedYear,
    selectedDay,
    setSelectedMonth,
    setSelectedYear,
    setSelectedDay,
  };
};
