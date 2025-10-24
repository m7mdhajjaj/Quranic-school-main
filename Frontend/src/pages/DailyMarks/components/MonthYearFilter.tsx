import type { MonthYearFilterProps } from "../types/dailyMarks";
import { Select } from "../../../components/shared/Select";
import { Calendar } from "lucide-react";

/**
 * Month and Year filter component
 * Uses shared Select component for consistent styling
 */
export const MonthYearFilter = ({
  selectedMonth,
  selectedYear,
  onMonthChange,
  onYearChange,
}: MonthYearFilterProps) => {
  const monthOptions = [
    { value: 1, label: "يناير (1)" },
    { value: 2, label: "فبراير (2)" },
    { value: 3, label: "مارس (3)" },
    { value: 4, label: "أبريل (4)" },
    { value: 5, label: "مايو (5)" },
    { value: 6, label: "يونيو (6)" },
    { value: 7, label: "يوليو (7)" },
    { value: 8, label: "أغسطس (8)" },
    { value: 9, label: "سبتمبر (9)" },
    { value: 10, label: "أكتوبر (10)" },
    { value: 11, label: "نوفمبر (11)" },
    { value: 12, label: "ديسمبر (12)" },
  ];

  const yearOptions = [
    { value: 2023, label: "2023" },
    { value: 2024, label: "2024" },
    { value: 2025, label: "2025" },
    { value: 2026, label: "2026" },
    { value: 2027, label: "2027" },
  ];

  return (
    <div className="mb-8 flex justify-center animate-fade-in">
      <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 w-full max-w-3xl border border-gray-100">
        <div className="flex items-center justify-center gap-3 mb-5">
          <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-2.5 rounded-xl">
            <Calendar className="text-white" size={24} />
          </div>
          <h3 className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
            📅 فلترة العلامات حسب الشهر والسنة
          </h3>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="transform hover:scale-[1.02] transition-transform duration-200">
            <Select
              label="🗓️ اختر الشهر"
              value={selectedMonth}
              onChange={(e) => onMonthChange(Number(e.target.value))}
              options={monthOptions}
              icon={<Calendar size={18} />}
              required
            />
          </div>
          <div className="transform hover:scale-[1.02] transition-transform duration-200">
            <Select
              label="📆 اختر السنة"
              value={selectedYear}
              onChange={(e) => onYearChange(Number(e.target.value))}
              options={yearOptions}
              icon={<Calendar size={18} />}
              required
            />
          </div>
        </div>

        {/* Current Selection Display */}
        <div className="mt-5 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-center gap-2 text-sm">
            <span className="text-gray-600">العرض الحالي:</span>
            <span className="bg-emerald-100 text-emerald-700 px-4 py-1.5 rounded-lg font-bold">
              {monthOptions.find(m => m.value === selectedMonth)?.label} {selectedYear}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
