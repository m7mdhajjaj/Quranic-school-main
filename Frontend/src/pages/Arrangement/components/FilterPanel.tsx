/**
 * Filter Panel Component
 * Handles year, month, and group selection
 * Uses shared Select component
 */

import type { FilterPanelProps } from "../types/arrangement";
import { getMonthName } from "../utils/arrangementHelpers";
import { Select } from "../../../components/shared/Form/Select";
import { Calendar, Users } from "lucide-react";

export const FilterPanel = ({
  selectedYear,
  selectedMonth,
  selectedGroup,
  availableYears,
  user,
  onYearChange,
  onMonthChange,
  onGroupChange,
}: FilterPanelProps) => {
  const yearOptions = availableYears.map((year) => ({
    value: year,
    label: year.toString(),
  }));

  const monthOptions = Array.from({ length: 12 }, (_, i) => ({
    value: i + 1,
    label: getMonthName(i + 1),
  }));

  const groupOptions =
    user?.groups?.map((group) => ({
      value: group.name,
      label: group.name,
    })) || [];

  return (
    <div className="flex flex-wrap justify-center items-center gap-6 mt-8">
      {/* Year selector */}
      <div className="w-32">
        <Select
          label="السنة"
          value={selectedYear}
          onChange={(e) => onYearChange(parseInt(e.target.value))}
          options={yearOptions}
          icon={<Calendar size={18} />}
        />
      </div>

      {/* Month selector */}
      <div className="w-40">
        <Select
          label="الشهر"
          value={selectedMonth}
          onChange={(e) => onMonthChange(parseInt(e.target.value))}
          options={monthOptions}
          icon={<Calendar size={18} />}
        />
      </div>

      {/* Group selector for teachers with multiple groups */}
      {user?.role === "teacher" && user.groups && user.groups.length > 1 && (
        <div className="w-48">
          <Select
            label="الحلقة"
            value={selectedGroup}
            onChange={(e) => onGroupChange(e.target.value)}
            options={groupOptions}
            icon={<Users size={18} />}
          />
        </div>
      )}

      {/* Display group name for teachers with single group or students */}
      {((user?.role === "teacher" && user.groups && user.groups.length === 1) ||
        user?.role === "student") && (
        <div className="relative w-48">
          <label className="block text-sm font-medium text-gray-700 mb-2 text-center">
            الحلقة
          </label>
          <div className="px-4 py-3 bg-emerald-50 border-2 border-emerald-300 rounded-xl shadow-md font-bold text-emerald-800 text-center">
            {user.role === "student" ? user.group : user.groups?.[0]?.name}
          </div>
        </div>
      )}
    </div>
  );
};
