// ============================================================================
// Reports/ReportFilters.tsx - Filter Component for Reports
// ============================================================================

import React from "react";
import { FilterContainer, FilterSelect } from "@/components/Filters";

interface Group {
  _id: string;
  name: string;
  totalStudents: number;
}

interface ReportFiltersProps {
  selectedMonth: number | null;
  selectedYear: number | null;
  onMonthChange: (month: number | null) => void;
  onYearChange: (year: number | null) => void;
  userRole?: string;
  groups?: Group[];
  selectedGroupId?: string;
  onGroupChange?: (groupId: string) => void;
}

// دالة للحصول على آخر 6 شهور
const getLast6Months = () => {
  const months = [];
  const today = new Date();

  for (let i = 0; i < 6; i++) {
    const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const month = date.getMonth() + 1; // 1-12
    const year = date.getFullYear();

    const monthNames = [
      "يناير",
      "فبراير",
      "مارس",
      "أبريل",
      "مايو",
      "يونيو",
      "يوليو",
      "أغسطس",
      "سبتمبر",
      "أكتوبر",
      "نوفمبر",
      "ديسمبر",
    ];

    months.push({
      value: `${month}-${year}`,
      label: `${monthNames[month - 1]} ${year}`,
      month,
      year,
    });
  }

  return months;
};

const ReportFiltersComponent: React.FC<ReportFiltersProps> = ({
  selectedMonth,
  selectedYear,
  onMonthChange,
  onYearChange,
  userRole,
  groups = [],
  selectedGroupId,
  onGroupChange,
}) => {
  const monthOptions = getLast6Months();

  // Handle month-year change
  const handleMonthYearChange = (value: string) => {
    if (!value) {
      onMonthChange(null);
      onYearChange(null);
      return;
    }

    const [month, year] = value.split("-").map(Number);
    onMonthChange(month);
    onYearChange(year);
  };

  // Get current selected value
  const selectedValue =
    selectedMonth && selectedYear ? `${selectedMonth}-${selectedYear}` : "";

  // Clear all filters
  const handleClearFilters = () => {
    onMonthChange(null);
    onYearChange(null);
  };

  return (
    <div className="bg-gradient-to-r from-teal-50 to-emerald-50 rounded-lg shadow-sm p-4 mb-5 border border-teal-100">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4 flex-wrap flex-1">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-teal-500 rounded-md">
              <svg
                className="w-4 h-4 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                />
              </svg>
            </div>
            <span className="text-sm font-bold text-gray-700">تصفية وبحث:</span>
          </div>

          {/* فلتر الحلقة للمعلم */}
          {userRole === "teacher" && groups.length > 0 && (
            <div className="w-[220px]">
              <select
                value={selectedGroupId}
                onChange={(e) => onGroupChange?.(e.target.value)}
                className="w-full px-3 py-2 border border-teal-200 rounded-lg focus:border-teal-500 focus:ring-1 focus:ring-teal-200 transition-all text-sm bg-white">
                {groups.map((group) => (
                  <option key={group._id} value={group._id}>
                    {group.name} ({group.totalStudents} طالب)
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="w-[220px]">
            <FilterSelect
              label=""
              value={selectedValue}
              options={monthOptions}
              onChange={handleMonthYearChange}
              showAllOption={true}
              allOptionLabel="آخر 6 أشهر (الكل)"
            />
          </div>
        </div>

        {(selectedMonth || selectedYear) && (
          <button
            onClick={handleClearFilters}
            className="px-4 py-1.5 bg-white hover:bg-red-50 text-gray-600 hover:text-red-600 rounded-md transition-all duration-200 text-sm font-medium border border-gray-200 hover:border-red-300">
            مسح الفلتر
          </button>
        )}
      </div>
    </div>
  );
};

export default ReportFiltersComponent;
