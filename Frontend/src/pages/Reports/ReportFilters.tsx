// ============================================================================
// Reports/ReportFilters.tsx - Filter Component for Reports
// ============================================================================

import React, { useState, useEffect } from "react";
import { 
  FilterContainer, 
  FilterSelect,
  FilterChips,
  type FilterChip
} from "../../components/Filters";
import { validateReportFilters } from "../../Validation/reportValidation";

interface ReportFiltersProps {
  selectedMonth: number | null;
  selectedYear: number | null;
  onMonthChange: (month: number | null) => void;
  onYearChange: (year: number | null) => void;
}

const ReportFiltersComponent: React.FC<ReportFiltersProps> = ({
  selectedMonth,
  selectedYear,
  onMonthChange,
  onYearChange,
}) => {
  const [errors, setErrors] = useState<{ month?: string; year?: string }>({});

  const monthOptions = [
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
  ];

  const yearOptions = [
    { value: "2023", label: "2023" },
    { value: "2024", label: "2024" },
    { value: "2025", label: "2025" },
    { value: "2026", label: "2026" },
    { value: "2027", label: "2027" },
  ];

  // Validate filters when they change
  useEffect(() => {
    const filters = {
      month: selectedMonth || undefined,
      year: selectedYear || undefined,
    };

    const validationErrors = validateReportFilters(filters);
    setErrors(validationErrors);
  }, [selectedMonth, selectedYear]);

  // Handle month change
  const handleMonthChange = (value: string) => {
    const month = value ? Number(value) : null;
    onMonthChange(month);
  };

  // Handle year change
  const handleYearChange = (value: string) => {
    const year = value ? Number(value) : null;
    onYearChange(year);
  };

  // Clear all filters
  const handleClearFilters = () => {
    onMonthChange(null);
    onYearChange(null);
  };

  // Generate active filter chips
  const activeChips: FilterChip[] = [];
  
  if (selectedMonth) {
    const monthLabel = monthOptions.find(opt => opt.value === selectedMonth.toString())?.label || "";
    activeChips.push({
      id: 'month',
      label: 'الشهر',
      value: monthLabel,
    });
  }

  if (selectedYear) {
    activeChips.push({
      id: 'year',
      label: 'السنة',
      value: selectedYear.toString(),
    });
  }

  // Remove individual chip
  const handleRemoveChip = (id: string) => {
    if (id === 'month') {
      onMonthChange(null);
    } else if (id === 'year') {
      onYearChange(null);
    }
  };

  return (
    <FilterContainer
      title="تصفية التقارير حسب الشهر والسنة"
      variant="gradient"
      onClear={handleClearFilters}
      showClearButton={activeChips.length > 0}
      className="max-w-4xl mx-auto">
      
      {/* Filter Selects */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <FilterSelect
            label="اختر الشهر (اختياري)"
            value={selectedMonth?.toString() || ""}
            options={monthOptions}
            onChange={handleMonthChange}
            showAllOption={true}
            allOptionLabel="آخر 6 أشهر"
            className={errors.month ? "border-red-500" : ""}
          />
          {errors.month && (
            <p className="text-red-500 text-xs mt-1">{errors.month}</p>
          )}
        </div>

        <div>
          <FilterSelect
            label="اختر السنة (اختياري)"
            value={selectedYear?.toString() || ""}
            options={yearOptions}
            onChange={handleYearChange}
            showAllOption={true}
            allOptionLabel="آخر 6 أشهر"
            className={errors.year ? "border-red-500" : ""}
          />
          {errors.year && (
            <p className="text-red-500 text-xs mt-1">{errors.year}</p>
          )}
        </div>
      </div>

      {/* Active Filter Chips */}
      {activeChips.length > 0 && (
        <FilterChips
          chips={activeChips}
          onRemove={handleRemoveChip}
          onClearAll={handleClearFilters}
          className="mt-4"
        />
      )}
    </FilterContainer>
  );
};

export default ReportFiltersComponent;
