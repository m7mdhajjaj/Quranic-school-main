import React, { memo } from "react";
import {
  FaSearch,
  FaFilter,
  FaTh,
  FaList,
} from "react-icons/fa";
import AssistantsFilters from "./AssistantsFilters";
import type { ViewMode, GenderFilter, GroupsAssignmentFilter } from "../types";

export interface AssistantsToolbarProps {
  searchQuery: string;
  onSearchChange: (term: string) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  genderFilter: GenderFilter;
  onGenderFilterChange: (gender: GenderFilter) => void;
  groupsAssignmentFilter: GroupsAssignmentFilter;
  onGroupsAssignmentFilterChange: (filter: GroupsAssignmentFilter) => void;
  totalCount: number;
  // Filter props
  showFilters: boolean;
  onToggleFilters: () => void;
  setShowFilters: (show: boolean) => void;
  activeFiltersCount: number;
  ageRange: [number, number];
  setAgeRange: (range: [number, number]) => void;
  onResetFilters: () => void;
  isSearching?: boolean;
}

export const AssistantsToolbar: React.FC<AssistantsToolbarProps> = memo(({
  searchQuery,
  onSearchChange,
  viewMode,
  onViewModeChange,
  genderFilter,
  onGenderFilterChange,
  groupsAssignmentFilter,
  onGroupsAssignmentFilterChange,
  totalCount,
  showFilters,
  onToggleFilters,
  setShowFilters,
  activeFiltersCount,
  ageRange,
  setAgeRange,
  onResetFilters,
  isSearching = false,
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4 mb-4 sm:mb-6">
      {/* Search + Actions in same row */}
      <div className="flex items-center gap-3">
        {/* Search - takes remaining space */}
        <div className="flex-1">
          <div className="relative">
            {isSearching ? (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-3.5 h-3.5 sm:w-4 sm:h-4" />
            )}
            <input
              type="text"
              placeholder="بحث (الاسم الأول، الثنائي، الثلاثي، رقم الهوية، البريد، الهاتف...)"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pr-9 sm:pr-10 pl-3 sm:pl-4 py-2 sm:py-2.5 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex bg-gray-100 rounded-lg p-0.5 sm:p-1" title="تبديل طريقة العرض">
          <button
            onClick={() => onViewModeChange("table")}
            className={`px-2 sm:px-3 py-1.5 rounded-md flex items-center gap-1 sm:gap-2 text-xs sm:text-sm font-medium transition-colors ${
              viewMode === 'table'
                ? 'bg-white text-emerald-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
            title="التبديل إلى عرض الجدول"
            aria-label="التبديل إلى عرض الجدول"
          >
            <FaList className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">جدول</span>
          </button>
          <button
            onClick={() => onViewModeChange("grid")}
            className={`px-2 sm:px-3 py-1.5 rounded-md flex items-center gap-1 sm:gap-2 text-xs sm:text-sm font-medium transition-colors ${
              viewMode === 'grid'
                ? 'bg-white text-emerald-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
            title="التبديل إلى عرض الكاردات"
            aria-label="التبديل إلى عرض الكاردات"
          >
            <FaTh className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">كاردات</span>
          </button>
        </div>

        {/* Filter Toggle */}
        <button
          onClick={onToggleFilters}
          className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg font-medium flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm ${
            showFilters || activeFiltersCount > 0
              ? "bg-emerald-600 text-white shadow-sm"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
          aria-label="تبديل الفلاتر"
          title="تبديل الفلاتر">
          <FaFilter className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          {activeFiltersCount > 0 && (
            <span className="bg-white text-emerald-600 rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center text-[10px] sm:text-xs font-bold">
              {activeFiltersCount}
            </span>
          )}
        </button>
      </div>

      {/* Filters Panel */}
      <AssistantsFilters
        showFilters={showFilters}
        setShowFilters={setShowFilters}
        selectedGender={genderFilter}
        setSelectedGender={onGenderFilterChange}
        groupsAssignmentFilter={groupsAssignmentFilter}
        setGroupsAssignmentFilter={onGroupsAssignmentFilterChange}
        ageRange={ageRange}
        setAgeRange={setAgeRange}
        activeFiltersCount={activeFiltersCount}
        onResetFilters={onResetFilters}
      />
    </div>
  );
});

AssistantsToolbar.displayName = "AssistantsToolbar";

// Backward compatibility alias
export const Toolbar = AssistantsToolbar;
