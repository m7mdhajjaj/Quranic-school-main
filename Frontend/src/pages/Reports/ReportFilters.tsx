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
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header with gradient - مثل DailyMarks */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-700 to-slate-700 px-5 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/15 backdrop-blur-sm p-2.5 rounded-xl">
              <svg
                className="w-5 h-5 text-white"
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
            <div>
              <h3 className="text-white font-bold text-base">تصفية وبحث</h3>
              <p className="text-white/70 text-xs">
                اختر الفترة الزمنية للتقارير
              </p>
            </div>
          </div>

          {(selectedMonth || selectedYear) && (
            <button
              onClick={handleClearFilters}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/15 hover:bg-white/25 backdrop-blur-sm rounded-lg text-white text-sm font-medium transition-all">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              مسح
            </button>
          )}
        </div>
      </div>

      {/* Filters Content */}
      <div className="p-5 bg-gradient-to-br from-slate-50 via-emerald-50/20 to-teal-50/30">
        <div className="flex items-center gap-4 flex-wrap">
          {/* فلتر الحلقة للمعلم */}
          {userRole === "teacher" && groups.length > 0 && (
            <div className="w-full md:w-auto md:min-w-[220px]">
              <label htmlFor="group-select" className="block text-sm font-semibold text-slate-700 mb-2">
                الحلقة
              </label>
              <select
                id="group-select"
                title="اختر الحلقة"
                value={selectedGroupId}
                onChange={(e) => onGroupChange?.(e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all text-sm bg-white shadow-sm">
                {groups.map((group) => (
                  <option key={group._id} value={group._id}>
                    {group.name} ({group.totalStudents} طالب)
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="w-full md:w-auto md:min-w-[220px]">
            <FilterSelect
              label="الفترة الزمنية"
              value={selectedValue}
              options={monthOptions}
              onChange={handleMonthYearChange}
              showAllOption={true}
              allOptionLabel="آخر 6 أشهر (الكل)"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportFiltersComponent;
