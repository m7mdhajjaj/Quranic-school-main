import { memo, useMemo } from "react";
import type { MonthYearFilterProps } from "../types/types";
import { FilterSelect, FilterContainer, SearchInput } from "@/components/Filters";
import type { FilterOption } from "@/components/Filters";

/**
 * Month and Year filter component
 * Uses shared FilterContainer and FilterSelect components for consistent styling
 */
const MonthYearFilterComponent = ({
  selectedMonth,
  selectedYear,
  onMonthChange,
  onYearChange,
  searchQuery = "",
  onSearchChange,
}: MonthYearFilterProps) => {
  const monthOptions: FilterOption[] = useMemo(() => [
    { value: "1", label: "يناير (1)" },
    { value: "2", label: "فبراير (2)" },
    { value: "3", label: "مارس (3)" },
    { value: "4", label: "أبريل (4)" },
    { value: "5", label: "مايو (5)" },
    { value: "6", label: "يونيو (6)" },
    { value: "7", label: "يوليو (7)" },
    { value: "8", label: "أغسطس (8)" },
    { value: "9", label: "سبتمبر (9)" },
    { value: "10", label: "أكتوبر (10)" },
    { value: "11", label: "نوفمبر (11)" },
    { value: "12", label: "ديسمبر (12)" },
  ], []);

  const yearOptions: FilterOption[] = useMemo(() => [
    { value: "2023", label: "2023" },
    { value: "2024", label: "2024" },
    { value: "2025", label: "2025" },
    { value: "2026", label: "2026" },
    { value: "2027", label: "2027" },
  ], []);

  const selectedMonthLabel = useMemo(() => {
    return monthOptions.find(
      (m) => m.value === selectedMonth.toString()
    )?.label;
  }, [monthOptions, selectedMonth]);

  return (
    <FilterContainer
      title="📅 فلترة العلامات حسب الشهر والسنة"
      variant="gradient"
      showClearButton={false}
      className="mb-8 max-w-5xl mx-auto"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <FilterSelect
          label="🗓️ اختر الشهر"
          value={selectedMonth.toString()}
          options={monthOptions}
          onChange={(value) => onMonthChange(Number(value))}
          showAllOption={false}
        />
        
        <FilterSelect
          label="📆 اختر السنة"
          value={selectedYear.toString()}
          options={yearOptions}
          onChange={(value) => onYearChange(Number(value))}
          showAllOption={false}
        />
      </div>

      {/* Search Input */}
      {onSearchChange && (
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            🔍 ابحث عن المقطع
          </label>
          <SearchInput
            value={searchQuery}
            onChange={onSearchChange}
            placeholder="ابحث بمقطع المراجعة أو الحفظ..."
            size="md"
            showClearButton={true}
          />
        </div>
      )}

      {/* Current Selection Display */}
      <div className="mt-5 pt-4 border-t border-emerald-200">
        <div className="flex items-center justify-center gap-2 text-sm">
          <span className="text-gray-600">العرض الحالي:</span>
          <span className="bg-emerald-100 text-emerald-700 px-4 py-1.5 rounded-lg font-bold">
            {selectedMonthLabel} {selectedYear}
          </span>
        </div>
      </div>
    </FilterContainer>
  );
};

export const MonthYearFilter = memo(MonthYearFilterComponent);
