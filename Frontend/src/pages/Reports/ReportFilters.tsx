// ============================================================================
// Reports/ReportFilters.tsx - Filter Component for Reports
// ============================================================================

import React, { useState, useEffect } from "react";
import { Card } from "../../components/shared";
import { Select } from "../../components/shared";
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
    { value: "", label: "آخر 6 أشهر" },
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
    { value: "", label: "آخر 6 أشهر" },
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

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    const month = val ? Number(val) : null;
    onMonthChange(month);
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    const year = val ? Number(val) : null;
    onYearChange(year);
  };

  return (
    <Card
      variant="gradient"
      padding="md"
      className="max-w-md mx-auto mb-6 sm:mb-8">
      <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-3 sm:mb-4 text-center">
        فلترة حسب الشهر والسنة
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div>
          <label className="block text-gray-700 text-xs sm:text-sm font-bold mb-2">
            اختر الشهر (اختياري):
          </label>
          <Select
            value={selectedMonth?.toString() || ""}
            onChange={handleMonthChange}
            options={monthOptions}
            className={`w-full ${errors.month ? "border-red-500" : ""}`}
          />
          {errors.month && (
            <p className="text-red-500 text-xs mt-1">{errors.month}</p>
          )}
        </div>
        <div>
          <label className="block text-gray-700 text-xs sm:text-sm font-bold mb-2">
            اختر السنة (اختياري):
          </label>
          <Select
            value={selectedYear?.toString() || ""}
            onChange={handleYearChange}
            options={yearOptions}
            className={`w-full ${errors.year ? "border-red-500" : ""}`}
          />
          {errors.year && (
            <p className="text-red-500 text-xs mt-1">{errors.year}</p>
          )}
        </div>
      </div>
    </Card>
  );
};

export default ReportFiltersComponent;
