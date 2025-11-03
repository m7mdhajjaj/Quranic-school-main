import React from "react";
import { Button } from "../UI";
import {
  FaSearch,
  FaFilter,
  FaPlus,
  FaSync,
  FaTh,
  FaList,
  FaTimes,
} from "react-icons/fa";

interface StudentToolbarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  showFilters: boolean;
  onToggleFilters: () => void;
  activeFiltersCount: number;
  viewMode: "table" | "grid";
  onViewModeChange: () => void;
  onAddStudent: () => void;
  onRefresh: () => void;
  isLoading?: boolean;
  // Filter Props
  selectedGender: string;
  onGenderChange: (value: string) => void;
  onResetFilters: () => void;
}

export const StudentToolbar: React.FC<StudentToolbarProps> = ({
  searchTerm,
  onSearchChange,
  showFilters,
  onToggleFilters,
  activeFiltersCount,
  viewMode,
  onViewModeChange,
  onAddStudent,
  onRefresh,
  isLoading = false,
  selectedGender,
  onGenderChange,
  onResetFilters,
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search */}
        <div className="flex-1">
          <div className="relative">
            <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="بحث عن طالب (الاسم، رقم الهوية، رقم الطالب...)"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          {/* Filter Toggle */}
          <button
            onClick={onToggleFilters}
            className={`px-4 py-3 rounded-lg font-medium transition-all flex items-center gap-2 ${
              showFilters || activeFiltersCount > 0
                ? "bg-emerald-600 text-white shadow-lg"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
            aria-label="تبديل الفلاتر"
            title="تبديل الفلاتر">
            <FaFilter />
            {activeFiltersCount > 0 && (
              <span className="bg-white text-emerald-600 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                {activeFiltersCount}
              </span>
            )}
          </button>

          {/* View Mode */}
          <button
            onClick={onViewModeChange}
            className="px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all"
            aria-label={viewMode === "table" ? "عرض الشبكة" : "عرض الجدول"}
            title={viewMode === "table" ? "عرض الشبكة" : "عرض الجدول"}>
            {viewMode === "table" ? <FaTh /> : <FaList />}
          </button>

          {/* Add Student */}
          <Button
            variant="primary"
            size="md"
            onClick={onAddStudent}
            leftIcon={<FaPlus />}
            className="shadow-lg">
            <span className="hidden sm:inline">إضافة طالب</span>
          </Button>

          {/* Refresh */}
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50"
            aria-label="تحديث قائمة الطلاب"
            title="تحديث قائمة الطلاب">
            <FaSync className={isLoading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Gender Filter */}
            <div>
              <label
                htmlFor="gender-filter"
                className="block text-sm font-medium text-gray-700 mb-2">
                الجنس
              </label>
              <select
                id="gender-filter"
                value={selectedGender}
                onChange={(e) => onGenderChange(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent">
                <option value="all">الكل</option>
                <option value="ذكر">ذكر</option>
                <option value="أنثى">أنثى</option>
              </select>
            </div>
          </div>

          {/* Reset Filters */}
          {activeFiltersCount > 0 && (
            <button
              onClick={onResetFilters}
              className="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-all flex items-center gap-2 text-sm font-medium">
              <FaTimes />
              إعادة تعيين الفلاتر
            </button>
          )}
        </div>
      )}
    </div>
  );
};
