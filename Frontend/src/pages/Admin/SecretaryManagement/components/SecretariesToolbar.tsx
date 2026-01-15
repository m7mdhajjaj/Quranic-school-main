import React, { memo } from "react";
import {
  FaSearch,
  FaFilter,
  FaTh,
  FaList,
} from "react-icons/fa";
import SecretariesFilters from "./SecretariesFilters";
import type { ViewMode, GenderFilter } from "../types";

export interface SecretariesToolbarProps {
  searchQuery: string;
  onSearchChange: (term: string) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  genderFilter: GenderFilter;
  onGenderFilterChange: (gender: GenderFilter) => void;
  totalCount: number;
  // Filter props
  showFilters: boolean;
  onToggleFilters: () => void;
  setShowFilters: (show: boolean) => void;
  activeFiltersCount: number;
  ageRange: [number, number];
  setAgeRange: (range: [number, number]) => void;
  onResetFilters: () => void;
  onExport: () => void;
}

export const SecretariesToolbar: React.FC<SecretariesToolbarProps> = memo(({
  searchQuery,
  onSearchChange,
  viewMode,
  onViewModeChange,
  genderFilter,
  onGenderFilterChange,
  totalCount,
  showFilters,
  onToggleFilters,
  setShowFilters,
  activeFiltersCount,
  ageRange,
  setAgeRange,
  onResetFilters,
  onExport,
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
              placeholder="بحث عن سكرتير (الاسم، البريد، رقم الهاتف، رقم الهوية...)"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pr-10 pl-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
             {/* Export Button */}
          <button
            onClick={onExport}
            className="px-4 py-2.5 rounded-lg font-medium flex items-center gap-2 text-sm bg-blue-600 text-white hover:bg-blue-700 shadow-sm transition-colors"
            title="تصدير إلى Excel"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            <span className="hidden sm:inline">تصدير</span>
          </button>

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
              onClick={() => onViewModeChange("table")}
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
              onClick={() => onViewModeChange("grid")}
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
      <SecretariesFilters
        showFilters={showFilters}
        setShowFilters={setShowFilters}
        selectedGender={genderFilter}
        setSelectedGender={onGenderFilterChange}
        ageRange={ageRange}
        setAgeRange={setAgeRange}
        activeFiltersCount={activeFiltersCount}
        onResetFilters={onResetFilters}
      />

      {/* Results Count */}
      <div className="mt-3 text-sm text-gray-500">
        عرض {totalCount} سكرتير
      </div>
    </div>
  );
});

SecretariesToolbar.displayName = "SecretariesToolbar";
