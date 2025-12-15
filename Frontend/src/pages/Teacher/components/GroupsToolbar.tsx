import React from "react";
import { FaSearch, FaFilter } from "react-icons/fa";
import GroupsFilters from "./GroupsFilters";

interface GroupsToolbarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  showFilters: boolean;
  onToggleFilters: () => void;
  setShowFilters: (show: boolean) => void;
  activeFiltersCount: number;
  activeStatusFilter: "all" | "active" | "inactive";
  setActiveStatusFilter: (filter: "all" | "active" | "inactive") => void;
  onResetFilters: () => void;
}

export const GroupsToolbar: React.FC<GroupsToolbarProps> = React.memo(({
  searchTerm,
  onSearchChange,
  showFilters,
  onToggleFilters,
  setShowFilters,
  activeFiltersCount,
  activeStatusFilter,
  setActiveStatusFilter,
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
              placeholder="بحث عن حلقة..."
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
        </div>
      </div>

      {/* Filters Panel */}
      <GroupsFilters
        showFilters={showFilters}
        setShowFilters={setShowFilters}
        searchTerm={searchTerm}
        activeStatusFilter={activeStatusFilter}
        setActiveStatusFilter={setActiveStatusFilter}
        activeFiltersCount={activeFiltersCount}
        onResetFilters={onResetFilters}
      />
    </div>
  );
});
