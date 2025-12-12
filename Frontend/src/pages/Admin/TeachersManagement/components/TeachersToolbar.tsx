import React from "react";
import {
  FaSearch,
  FaFilter,
  FaTh,
  FaList,
} from "react-icons/fa";
import TeachersFilters from "./TeachersFilters";

interface TeachersToolbarProps {
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

export const TeachersToolbar: React.FC<TeachersToolbarProps> = React.memo(({
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
              placeholder="بحث عن معلم (الاسم الثلاثي، الرباعي، رقم الهوية، البريد، رقم الهاتف، الحلقة...)"
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

          {/* View Mode Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1" title="تبديل طريقة العرض">
            <button
              onClick={() => onViewModeChange()}
              className={`px-3 py-1.5 rounded-md flex items-center gap-2 text-sm font-medium transition-colors ${
                viewMode === 'table'
                  ? 'bg-white text-emerald-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              title="التبديل إلى عرض الجدول"
              aria-label="التبديل إلى عرض الجدول"
            >
              <FaList className="w-4 h-4" />
              <span className="hidden sm:inline">جدول</span>
            </button>
            <button
              onClick={() => onViewModeChange()}
              className={`px-3 py-1.5 rounded-md flex items-center gap-2 text-sm font-medium transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white text-emerald-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              title="التبديل إلى عرض الكاردات"
              aria-label="التبديل إلى عرض الكاردات"
            >
              <FaTh className="w-4 h-4" />
              <span className="hidden sm:inline">كاردات</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filters Panel */}
      <TeachersFilters
        showFilters={showFilters}
        setShowFilters={setShowFilters}
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
