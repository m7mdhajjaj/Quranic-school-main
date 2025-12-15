import React from "react";
import { FaSearch, FaFilter } from "react-icons/fa";
import { LayoutGrid, List } from "lucide-react";
import StudentsFilters from "./StudentsFilters";

interface StudentToolbarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  showFilters: boolean;
  onToggleFilters: () => void;
  setShowFilters: (show: boolean) => void;
  activeFiltersCount: number;
  viewMode: "table" | "grid";
  onViewModeChange: (mode: "table" | "grid") => void;
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

          {/* View Mode Toggle - Enhanced Design */}
          <div className="relative flex items-center bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-1.5 shadow-inner border border-gray-200" dir="rtl">
            {/* Animated Background Slider */}
            <div
              className={`absolute top-1.5 bottom-1.5 w-[calc(50%-0.375rem)] bg-gradient-to-l from-emerald-500 to-emerald-600 rounded-lg shadow-lg transition-all duration-300 ease-out ${
                viewMode === 'table' ? 'right-1.5' : 'left-1.5'
              }`}
            />
            
            {/* Table View Button */}
            <button
              onClick={() => onViewModeChange('table')}
              className={`relative z-10 flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${
                viewMode === 'table'
                  ? 'text-white shadow-md transform scale-105'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              title="عرض الجدول"
              aria-label="التبديل إلى عرض الجدول"
            >
              <List className={`w-4 h-4 transition-transform duration-300 ${viewMode === 'table' ? 'scale-110' : ''}`} />
              <span className="hidden sm:inline whitespace-nowrap">جدول</span>
            </button>
            
            {/* Grid View Button */}
            <button
              onClick={() => onViewModeChange('grid')}
              className={`relative z-10 flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${
                viewMode === 'grid'
                  ? 'text-white shadow-md transform scale-105'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              title="عرض الكاردات"
              aria-label="التبديل إلى عرض الكاردات"
            >
              <LayoutGrid className={`w-4 h-4 transition-transform duration-300 ${viewMode === 'grid' ? 'scale-110' : ''}`} />
              <span className="hidden sm:inline whitespace-nowrap">كاردات</span>
            </button>
          </div>
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
