import React from "react";
import { Search, Filter, LayoutGrid, List, X, RotateCcw } from "lucide-react";
import { FaMale, FaFemale } from "react-icons/fa";
import type { ViewMode, GenderFilter } from "../types";

interface ToolbarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  genderFilter: GenderFilter;
  onGenderFilterChange: (value: GenderFilter) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  totalCount: number;
  showFilters: boolean;
  onToggleFilters: () => void;
  setShowFilters: (show: boolean) => void;
  activeFiltersCount: number;
  ageRange: [number, number];
  setAgeRange: (range: [number, number]) => void;
  onResetFilters: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  searchQuery,
  onSearchChange,
  genderFilter,
  onGenderFilterChange,
  viewMode,
  onViewModeChange,
  totalCount,
  showFilters,
  onToggleFilters,
  activeFiltersCount,
  ageRange,
  setAgeRange,
  onResetFilters,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="بحث بالاسم، رقم المساعد، البريد..."
            className="w-full pr-10 pl-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3">
          {/* Filter Toggle */}
          <button
            onClick={onToggleFilters}
            className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all ${
              showFilters
                ? "bg-purple-50 border-purple-200 text-purple-700"
                : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
            }`}
          >
            <Filter className="w-4 h-4" />
            <span>فلترة</span>
            {activeFiltersCount > 0 && (
              <span className="absolute -top-1 -left-1 w-5 h-5 bg-purple-600 text-white text-xs rounded-full flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </button>

          {/* View Mode */}
          <div className="flex items-center bg-gray-100 rounded-xl p-1">
            <button
              onClick={() => onViewModeChange("table")}
              className={`p-2 rounded-lg transition-all ${
                viewMode === "table"
                  ? "bg-white text-purple-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => onViewModeChange("grid")}
              className={`p-2 rounded-lg transition-all ${
                viewMode === "grid"
                  ? "bg-white text-purple-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>

          {/* Count */}
          <div className="text-sm text-gray-500">
            <span className="font-semibold text-gray-700">{totalCount}</span> مساعد
          </div>
        </div>
      </div>

      {/* Expanded Filters */}
      {showFilters && (
        <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Gender Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">الجنس</label>
              <div className="flex gap-2">
                {[
                  { value: "all", label: "الكل", icon: null },
                  { value: "ذكر", label: "ذكر", icon: FaMale },
                  { value: "أنثى", label: "أنثى", icon: FaFemale },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => onGenderFilterChange(option.value as GenderFilter)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border transition-all ${
                      genderFilter === option.value
                        ? "bg-purple-50 border-purple-300 text-purple-700"
                        : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {option.icon && <option.icon className="w-4 h-4" />}
                    <span>{option.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Age Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                العمر: {ageRange[0]} - {ageRange[1]} سنة
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={ageRange[0]}
                  onChange={(e) => setAgeRange([parseInt(e.target.value), ageRange[1]])}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                />
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={ageRange[1]}
                  onChange={(e) => setAgeRange([ageRange[0], parseInt(e.target.value)])}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                />
              </div>
            </div>

            {/* Reset Filters */}
            <div className="flex items-end">
              <button
                onClick={onResetFilters}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                <span>إعادة تعيين</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
