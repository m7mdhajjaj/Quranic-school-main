import { memo, useMemo } from "react";
import type { MonthYearFilterProps } from "../types/types";
import { FilterSelect, SearchInput } from "@/components/Filters";
import { Calendar, Search, RotateCcw } from "lucide-react";
import { MONTH_OPTIONS, generateYearOptions, generateDayOptions } from "../constants";
import { DateRangePicker } from "@/components/UI/DateRangePicker";

/**
 * Month and Year filter component - Simplified Version
 * Navigation buttons moved to table component
 */
const MonthYearFilterComponent = ({
  selectedMonth,
  selectedYear,
  selectedDay = null,
  onMonthChange,
  onYearChange,
  onDayChange,
  searchQuery = "",
  onSearchChange,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
}: MonthYearFilterProps) => {
  const monthOptions = MONTH_OPTIONS;

  // Generate years dynamically (current year ± 2 years)
  const yearOptions = useMemo(() => generateYearOptions(2), []);

  // Generate days based on selected month and year
  const dayOptions = useMemo(() => {
    if (!selectedMonth || !selectedYear) {
      return [{ value: "", label: "كل الأيام" }];
    }
    return generateDayOptions(selectedMonth, selectedYear);
  }, [selectedMonth, selectedYear]);

  // Handle reset filter
  const handleReset = () => {
    onMonthChange(null);
    onYearChange(null);
    if (onDayChange) onDayChange(null);
    if (onSearchChange) onSearchChange("");
    if (onStartDateChange) onStartDateChange(null);
    if (onEndDateChange) onEndDateChange(null);
  };

  return (
    <div className="mb-0">
      {/* Filter Header with Reset Button */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h3 className="text-xl font-bold bg-gradient-to-r from-emerald-700 to-teal-700 bg-clip-text text-transparent">
            📅 فلترة العلامات
          </h3>
        </div>
        {/* Reset Button - على الشمال (آخر يسار) */}
        <button
          onClick={handleReset}
          type="button"
          className="flex items-center justify-center gap-1.5 px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors text-xs font-semibold border border-red-300 hover:border-red-400"
          title="إعادة تعيين الفلتر"
        >
          <RotateCcw size={14} />
          <span>إعادة تعيين</span>
        </button>
      </div>

      {/* Filter Container */}
      <div className="bg-gradient-to-br from-white via-emerald-50/30 to-teal-50/40 border border-emerald-100/50 rounded-2xl shadow-lg backdrop-blur-sm p-6">
        {/* All Filters in One Row */}
        <div className="flex flex-wrap items-end gap-3">
        {/* Search Input - First on the right */}
        {onSearchChange && (
          <div className="flex-1 min-w-[280px] max-w-[400px]">
            <label className="block text-xs font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
              <Search size={14} className="text-emerald-600" />
              <span>البحث</span>
            </label>
            <SearchInput
              value={searchQuery}
              onChange={onSearchChange}
              placeholder="ابحث بمقطع المراجعة أو الحفظ..."
              size="sm"
              showClearButton={true}
            />
          </div>
        )}

        {/* Date Range Picker (New) */}
        {onStartDateChange && onEndDateChange ? (
          <div className="min-w-[240px]">
            <label className="block text-xs font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
              <Calendar size={13} className="text-emerald-600" />
              <span>الفترة الزمنية</span>
            </label>
            <DateRangePicker
              startDate={startDate}
              endDate={endDate}
              onChange={(start, end) => {
                onStartDateChange(start);
                onEndDateChange(end);
              }}
            />
          </div>
        ) : (
          /* Fallback to old Month/Year/Day selectors if new props not provided */
          <>
            {/* Day Selector */}
            {onDayChange && (
              <div className="min-w-[130px]">
                <label className="block text-xs font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
                  <Calendar size={13} className="text-emerald-600" />
                  <span>اليوم</span>
                </label>
                <FilterSelect
                  label=""
                  value={selectedDay?.toString() || ""}
                  options={dayOptions}
                  onChange={(value) => onDayChange(value === "" ? null : Number(value))}
                  showAllOption={false}
                />
              </div>
            )}

            {/* Month Selector */}
            <div className="min-w-[120px]">
              <label className="block text-xs font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
                <Calendar size={13} className="text-emerald-600" />
                <span>الشهر</span>
              </label>
              <FilterSelect
                label=""
                value={selectedMonth?.toString() || ""}
                options={monthOptions}
                onChange={(value) => onMonthChange(value === "" ? null : Number(value))}
                showAllOption={true}
                allOptionLabel="كل الأشهر"
              />
            </div>
            
            {/* Year Selector */}
            <div className="min-w-[110px]">
              <label className="block text-xs font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
                <Calendar size={13} className="text-emerald-600" />
                <span>السنة</span>
              </label>
              <FilterSelect
                label=""
                value={selectedYear?.toString() || ""}
                options={yearOptions}
                onChange={(value) => onYearChange(value === "" ? null : Number(value))}
                showAllOption={true}
                allOptionLabel="كل السنوات"
              />
            </div>
          </>
        )}
        </div>
      </div>
    </div>
  );
};

export const MonthYearFilter = memo(MonthYearFilterComponent);
