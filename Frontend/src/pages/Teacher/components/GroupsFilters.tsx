import React from "react";
import { FaTimes } from "react-icons/fa";

interface GroupsFiltersProps {
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
  searchTerm: string;
  activeStatusFilter: "all" | "active" | "inactive";
  setActiveStatusFilter: (filter: "all" | "active" | "inactive") => void;
  activeFiltersCount: number;
  onResetFilters: () => void;
}

const GroupsFilters: React.FC<GroupsFiltersProps> = ({
  showFilters,
  setShowFilters,
  searchTerm,
  activeStatusFilter,
  setActiveStatusFilter,
  activeFiltersCount,
  onResetFilters,
}) => {
  return (
    <>
      {showFilters && (
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm relative mt-4 will-change-opacity">
          {/* Close Button */}
          <button
            onClick={() => setShowFilters(false)}
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
            {/* Active Status Filter */}
            <div className="space-y-2.5">
              <label className="text-xs font-semibold text-gray-700">
                تصفية حسب الحالة
              </label>
              <div className="grid grid-cols-1 gap-2">
                <button
                  onClick={() => setActiveStatusFilter("all")}
                  title="عرض جميع الحلقات"
                  className={`px-3 py-2 rounded-lg text-xs font-medium ${
                    activeStatusFilter === "all"
                      ? "bg-slate-600 text-white shadow-sm"
                      : "bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200"
                  }`}>
                  الكل
                </button>
                <button
                  onClick={() => setActiveStatusFilter("active")}
                  title="عرض الحلقات النشطة فقط"
                  className={`px-3 py-2 rounded-lg text-xs font-medium ${
                    activeStatusFilter === "active"
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "bg-gray-50 text-gray-700 hover:bg-emerald-50 border border-gray-200"
                  }`}>
                  نشطة
                </button>
                <button
                  onClick={() => setActiveStatusFilter("inactive")}
                  title="عرض الحلقات غير النشطة فقط"
                  className={`px-3 py-2 rounded-lg text-xs font-medium ${
                    activeStatusFilter === "inactive"
                      ? "bg-gray-600 text-white shadow-sm"
                      : "bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200"
                  }`}>
                  غير نشطة
                </button>
              </div>
            </div>
          </div>

          {/* Filter Summary & Reset */}
          <div className="mt-5 pt-4 border-t border-gray-200">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-gray-600 font-medium">
                  الفلاتر النشطة:
                </span>

                {activeStatusFilter !== "all" && (
                  <span
                    className={`px-2.5 py-1 rounded-md text-xs font-medium ${
                      activeStatusFilter === "active"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-gray-50 text-gray-700 border border-gray-200"
                    }`}>
                    الحالة: {activeStatusFilter === "active" ? "نشطة" : "غير نشطة"}
                  </span>
                )}

                {searchTerm && (
                  <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md text-xs font-medium border border-slate-200">
                    البحث: "{searchTerm}"
                  </span>
                )}

                {activeFiltersCount === 0 && (
                  <span className="text-xs text-gray-400">
                    لا توجد فلاتر مطبقة
                  </span>
                )}
              </div>

              {/* Reset Filters Button */}
              {activeFiltersCount > 0 && (
                <button
                  onClick={onResetFilters}
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
