import React from "react";
import {
  FaSearch,
  FaFilter,
  FaList,
  FaTh,
  FaTimes,
  FaSync,
  FaTrash,
} from "react-icons/fa";

interface GroupsToolbarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  viewMode: "table" | "grid";
  onViewModeChange: (mode: "table" | "grid") => void;
  showFilters: boolean;
  onToggleFilters: () => void;
  activeFiltersCount: number;
  onResetFilters: () => void;
  selectedCount: number;
  onBulkDelete: () => void;
}

export const GroupsToolbar: React.FC<GroupsToolbarProps> = ({
  searchTerm,
  onSearchChange,
  viewMode,
  onViewModeChange,
  showFilters,
  onToggleFilters,
  activeFiltersCount,
  onResetFilters,
  selectedCount,
  onBulkDelete,
}) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
        <div className="relative md:col-span-8">
          <input
            type="text"
            placeholder="ابحث عن حلقة (الاسم، المعلم، المواعيد...)"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
          <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          {searchTerm && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute left-12 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              title="مسح البحث">
              <FaTimes className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex gap-2 md:col-span-4">
          {/* View Mode Toggle */}
          <div className="flex-1 flex items-center border border-gray-300 rounded-xl p-1">
            <button
              onClick={() => onViewModeChange("table")}
              className={`flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-lg transition-all ${
                viewMode === "table"
                  ? "bg-blue-500 text-white shadow-sm"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
              title="عرض جدول">
              <FaList className="w-4 h-4" />
              <span className="text-xs font-medium hidden sm:inline">جدول</span>
            </button>
            <button
              onClick={() => onViewModeChange("grid")}
              className={`flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-lg transition-all ${
                viewMode === "grid"
                  ? "bg-blue-500 text-white shadow-sm"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
              title="عرض شبكة">
              <FaTh className="w-4 h-4" />
              <span className="text-xs font-medium hidden sm:inline">شبكة</span>
            </button>
          </div>

          {/* Filter Button */}
          <button
            onClick={onToggleFilters}
            className={`relative flex items-center justify-center gap-2 px-4 py-3 border-2 rounded-xl transition-all ${
              showFilters
                ? "border-blue-500 bg-blue-50 text-blue-600"
                : "border-gray-300 hover:border-blue-400"
            }`}>
            <FaFilter className="w-4 h-4" />
            <span className="hidden sm:inline">فلاتر</span>
            {activeFiltersCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                {activeFiltersCount}
              </span>
            )}
          </button>

          {/* Reset Filters */}
          {activeFiltersCount > 0 && (
            <button
              onClick={onResetFilters}
              className="px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all"
              title="إعادة تعيين الفلاتر">
              <FaSync className="w-5 h-5 text-gray-600" />
            </button>
          )}

          {selectedCount > 0 && (
            <button
              onClick={onBulkDelete}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all">
              <FaTrash className="w-4 h-4" />
              <span>حذف ({selectedCount})</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
