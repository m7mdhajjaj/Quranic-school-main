import { useMemo } from 'react';

/**
 * Navigate to previous month
 * 
 * @param {number} currentMonth - Current month (1-12)
 * @param {number} currentYear - Current year
 * @returns {{ newMonth: number, newYear: number }} New month and year
 */
const getPreviousMonth = (currentMonth: number, currentYear: number) => {
  let newMonth = currentMonth - 1;
  let newYear = currentYear;
  
  if (newMonth < 1) {
    newMonth = 12;
    newYear = currentYear - 1;
  }
  
  return { newMonth, newYear };
};

/**
 * Navigate to next month
 */
const getNextMonth = (currentMonth: number, currentYear: number) => {
  let newMonth = currentMonth + 1;
  let newYear = currentYear;
  
  if (newMonth > 12) {
    newMonth = 1;
    newYear = currentYear + 1;
  }
  
  return { newMonth, newYear };
};

/**
 * Get current month and year
 */
const getCurrentMonthYear = () => {
  const now = new Date();
  return {
    currentMonth: now.getMonth() + 1,
    currentYear: now.getFullYear(),
  };
};

/**
 * Check if given month/year is current month/year
 */
const isCurrentMonthYear = (month: number, year: number): boolean => {
  const { currentMonth, currentYear } = getCurrentMonthYear();
  return month === currentMonth && year === currentYear;
};

interface UseMonthNavigationProps {
  selectedMonth?: number;
  selectedYear?: number;
  onMonthChange?: (month: number) => void;
  onYearChange?: (year: number) => void;
}

interface UseMonthNavigationReturn {
  currentMonth: number;
  currentYear: number;
  isCurrentMonth: boolean;
  handlePreviousMonth: () => void;
  handleNextMonth: () => void;
  handleCurrentMonth: () => void;
  selectedMonthLabel: string;
}

/**
 * Hook for managing month/year navigation
 */
export const useMonthNavigation = ({
  selectedMonth,
  selectedYear,
  onMonthChange,
  onYearChange,
}: UseMonthNavigationProps): UseMonthNavigationReturn => {
  // Get current date values
  const { currentMonth, currentYear } = useMemo(() => getCurrentMonthYear(), []);

  // Check if selected month is current month
  const isCurrentMonth = useMemo(
    () => (selectedMonth && selectedYear ? isCurrentMonthYear(selectedMonth, selectedYear) : false),
    [selectedMonth, selectedYear]
  );

  // Navigation handlers
  const handlePreviousMonth = () => {
    if (!selectedMonth || !selectedYear || !onMonthChange || !onYearChange) return;
    const { newMonth, newYear } = getPreviousMonth(selectedMonth, selectedYear);
    onMonthChange(newMonth);
    if (newYear !== selectedYear) {
      onYearChange(newYear);
    }
  };

  const handleNextMonth = () => {
    if (!selectedMonth || !selectedYear || !onMonthChange || !onYearChange) return;
    const { newMonth, newYear } = getNextMonth(selectedMonth, selectedYear);
    onMonthChange(newMonth);
    if (newYear !== selectedYear) {
      onYearChange(newYear);
    }
  };

  const handleCurrentMonth = () => {
    if (!onMonthChange || !onYearChange) return;
    onMonthChange(currentMonth);
    onYearChange(currentYear);
  };

  // Month label (could be extended to use getMonthName)
  const selectedMonthLabel = useMemo(() => {
    if (!selectedMonth) return '';
    const monthNames = [
      'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
      'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
    ];
    return monthNames[selectedMonth - 1] || '';
  }, [selectedMonth]);

  return {
    currentMonth,
    currentYear,
    isCurrentMonth,
    handlePreviousMonth,
    handleNextMonth,
    handleCurrentMonth,
    selectedMonthLabel,
  };
};
