import React from "react";
import {
  FaUsers,
  FaTimes,
} from "react-icons/fa";
import type {
  CapacityFilter,
  StatusFilter,
} from "../types";

interface GroupsFiltersProps {
  // Capacity Filter
  capacityFilter: CapacityFilter;
  onCapacityChange: (value: CapacityFilter) => void;

  // Status Filter
  statusFilter: StatusFilter;
  onStatusChange: (value: StatusFilter) => void;

  // UI State
  showFilters: boolean;

  // Actions
  activeFiltersCount: number;
  onReset: () => void;
  onClose: () => void;
}

export const GroupsFilters: React.FC<GroupsFiltersProps> = ({
  showFilters,
  capacityFilter,
  onCapacityChange,
  statusFilter,
  onStatusChange,
  activeFiltersCount,
  onReset,
  onClose,
}) => {
  return (
    <>
      {showFilters && (
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm relative mt-4 will-change-opacity">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-3 left-3 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
            title="إغلاق الفلاتر">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Capacity Filter */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-purple-100">
              <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-3">
                <FaUsers className="text-purple-600" />
                حجم السعة
              </label>
              <select
                value={capacityFilter}
                title="فلترة الحلقات حسب حجم السعة"
                onChange={(e) => onCapacityChange(e.target.value as CapacityFilter)}
                className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm">
                <option value="all">جميع الأحجام</option>
                <option value="small">صغيرة (≤15 طالب)</option>
                <option value="medium">متوسطة (16-25 طالب)</option>
                <option value="large">كبيرة (&gt;25 طالب)</option>
              </select>
            </div>

            {/* Status Filter */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-green-100">
              <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-3">
                <svg
                  className="w-4 h-4 text-green-600"
                  fill="currentColor"
                  viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                الحالة
              </label>
              <select
                value={statusFilter}
                title="فلترة الحلقات حسب حالة النشاط"
                onChange={(e) => onStatusChange(e.target.value as StatusFilter)}
                className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 text-sm">
                <option value="all">جميع الحالات</option>
                <option value="active">نشطة فقط</option>
                <option value="inactive">غير نشطة فقط</option>
              </select>
            </div>
          </div>

          {/* Filter Summary & Reset */}
          <div className="mt-5 pt-4 border-t border-gray-200">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-gray-600 font-medium">
                  الفلاتر النشطة:
                </span>
                <span className="px-2.5 py-1 bg-blue-100 text-blue-700 rounded-md text-xs font-medium border border-blue-200">
                  {activeFiltersCount} فلتر
                </span>
                {activeFiltersCount === 0 && (
                  <span className="text-xs text-gray-400">
                    لا توجد فلاتر مطبقة
                  </span>
                )}
              </div>

              {/* Reset Filters Button */}
              {activeFiltersCount > 0 && (
                <button
                  onClick={onReset}
                  className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 flex items-center gap-1.5 text-xs font-medium border border-red-200">
                  <FaTimes className="w-3 h-3" />
                  إعادة تعيين
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default GroupsFilters;
