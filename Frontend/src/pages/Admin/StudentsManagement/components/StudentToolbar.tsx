import React from "react";
import {
  FaSearch,
  FaFilter,
  FaTh,
  FaList,
} from "react-icons/fa";
import StudentsFilters from "./StudentsFilters";

interface StudentToolbarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  showFilters: boolean;
  onToggleFilters: () => void;
  setShowFilters: (show: boolean) => void;
  activeFiltersCount: number;
  viewMode: "table" | "grid";
  onViewModeChange: () => void;
  // Filter props
  selectedGender: string;
  setSelectedGender: (gender: string) => void;
  groupsFilter: "all" | "withGroups" | "withoutGroups";
  setGroupsFilter: (filter: "all" | "withGroups" | "withoutGroups") => void;
  ageRange: [number, number];
  setAgeRange: (range: [number, number]) => void;
  onResetFilters: () => void;
}

export const StudentToolbar: React.FC<StudentToolbarProps> = React.memo(({
  searchTerm,
  onSearchChange,
  showFilters,
  onToggleFilters,
  setShowFilters,
  activeFiltersCount,
  viewMode,
  onViewModeChange,
  selectedGender,
  setSelectedGender,
  groupsFilter,
  setGroupsFilter,
  ageRange,
  setAgeRange,
  onResetFilters,
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
      <div className="flex flex-col lg:flex-row gap-3">
        {/* Search */}
        <div className="flex-1">
          <div className="relative">
            <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="بحث (الاسم الثلاثي، رقم الهوية، المعلم، الحلقة...)"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pr-10 pl-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          {/* Filter Toggle */}
          <button
            onClick={onToggleFilters}
            className={`px-4 py-2.5 rounded-lg font-medium flex items-center gap-2 text-sm ${
              showFilters || activeFiltersCount > 0
                ? "bg-emerald-600 text-white shadow-sm"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
            aria-label="تبديل الفلاتر"
            title="تبديل الفلاتر">
            <FaFilter className="w-4 h-4" />
            {activeFiltersCount > 0 && (
              <span className="bg-white text-emerald-600 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                {activeFiltersCount}
              </span>
            )}
            فلاتر
          </button>

          {/* View Mode */}
          <button
            onClick={onViewModeChange}
            className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            aria-label={viewMode === "table" ? "عرض الشبكة" : "عرض الجدول"}
            title={viewMode === "table" ? "عرض الشبكة" : "عرض الجدول"}>
            {viewMode === "table" ? <FaTh className="w-4 h-4" /> : <FaList className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Filters Panel */}
      <StudentsFilters
        showFilters={showFilters}
        setShowFilters={setShowFilters}
        searchTerm={searchTerm}
        selectedGender={selectedGender}
        setSelectedGender={setSelectedGender}
        groupsFilter={groupsFilter}
        setGroupsFilter={setGroupsFilter}
        ageRange={ageRange}
        setAgeRange={setAgeRange}
        activeFiltersCount={activeFiltersCount}
        onResetFilters={onResetFilters}
      />
    </div>
  );
});
