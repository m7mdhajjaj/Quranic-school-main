import { useMemo, useCallback } from "react";
import { MONTH_OPTIONS, generateYearOptions, generateDayOptions } from "../constants";
import type { MonthYearFilterProps } from "../types/types";

export function useMonthYearFilterLogic(props: MonthYearFilterProps) {
  const {
    selectedMonth,
    selectedYear,
    onMonthChange,
    onYearChange,
    onDayChange,
    onSearchChange,
    onStartDateChange,
    onEndDateChange,
  } = props;

  const monthOptions = MONTH_OPTIONS;

  const yearOptions = useMemo(() => generateYearOptions(2), []);

  const dayOptions = useMemo(() => {
    if (!selectedMonth || !selectedYear) {
      return [{ value: "", label: "كل الأيام" }];
    }
    return generateDayOptions(selectedMonth, selectedYear);
  }, [selectedMonth, selectedYear]);

  const handleReset = useCallback(() => {
    onMonthChange(null);
    onYearChange(null);
    if (onDayChange) onDayChange(null);
    if (onSearchChange) onSearchChange("");
    if (onStartDateChange) onStartDateChange(null);
    if (onEndDateChange) onEndDateChange(null);
  }, [onMonthChange, onYearChange, onDayChange, onSearchChange, onStartDateChange, onEndDateChange]);

  return {
    monthOptions,
    yearOptions,
    dayOptions,
    handleReset,
  };
}
