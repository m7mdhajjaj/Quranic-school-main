/**
 * Filter Panel Component
 * Handles year, month, and group selection
 * Uses shared Filter components
 */

import type { FilterPanelProps } from "../types/arrangement";
import { getMonthName } from "../utils/arrangementHelpers";
import { FilterSelect } from "../../../components/shared/Filter";
import type { FilterOption } from "../../../components/shared/Filter";

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
  const yearOptions: FilterOption[] = availableYears.map((year) => ({
    value: year.toString(),
    label: year.toString(),
  }));

  const monthOptions: FilterOption[] = Array.from({ length: 12 }, (_, i) => ({
    value: (i + 1).toString(),
    label: getMonthName(i + 1),
  }));

  const groupOptions: FilterOption[] =
    user?.groups?.map((group) => ({
      value: group.name,
      label: group.name,
    })) || [];

  return (
    <div className="flex flex-wrap justify-center items-center gap-6 mt-8">
      {/* Year selector */}
      <div className="w-32">
        <FilterSelect
          label="السنة"
          value={selectedYear.toString()}
          onChange={(value) => onYearChange(parseInt(value))}
          options={yearOptions}
          showAllOption={false}
          className=""
        />
      </div>

      {/* Month selector */}
      <div className="w-40">
        <FilterSelect
          label="الشهر"
          value={selectedMonth.toString()}
          onChange={(value) => onMonthChange(parseInt(value))}
          options={monthOptions}
          showAllOption={false}
          className=""
        />
      </div>

      {/* Group selector for teachers with multiple groups */}
      {user?.role === "teacher" && user.groups && user.groups.length > 1 && (
        <div className="w-48">
          <FilterSelect
            label="الحلقة"
            value={selectedGroup}
            onChange={(value) => onGroupChange(value)}
            options={groupOptions}
            showAllOption={false}
            className=""
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
