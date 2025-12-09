import React from "react";
import { FaTimes } from "react-icons/fa";

interface StudentsFiltersProps {
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
  searchTerm: string;
  selectedGender: string;
  setSelectedGender: (gender: string) => void;
  groupsFilter: "all" | "withGroups" | "withoutGroups";
  setGroupsFilter: (filter: "all" | "withGroups" | "withoutGroups") => void;
  ageRange: [number, number];
  setAgeRange: (range: [number, number]) => void;
  activeFiltersCount: number;
  onResetFilters: () => void;
}

const StudentsFilters: React.FC<StudentsFiltersProps> = ({
  showFilters,
  setShowFilters,
  searchTerm,
  selectedGender,
  setSelectedGender,
  groupsFilter,
  setGroupsFilter,
  ageRange,
  setAgeRange,
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
            {/* Gender Filter */}
            <div className="space-y-2.5">
              <label className="text-xs font-semibold text-gray-700">
                تصفية حسب الجنس
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setSelectedGender("all")}
                  title="عرض جميع الطلاب"
                  className={`px-3 py-2 rounded-lg text-xs font-medium ${
                    selectedGender === "all"
                      ? "bg-slate-600 text-white shadow-sm"
                      : "bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200"
                  }`}>
                  الكل
                </button>
                <button
                  onClick={() => setSelectedGender("ذكر")}
                  title="عرض الطلاب الذكور فقط"
                  className={`px-3 py-2 rounded-lg text-xs font-medium ${
                    selectedGender === "ذكر"
                      ? "bg-blue-600 text-white shadow-sm"
                      : "bg-gray-50 text-gray-700 hover:bg-blue-50 border border-gray-200"
                  }`}>
                  ذكر
                </button>
                <button
                  onClick={() => setSelectedGender("أنثى")}
                  title="عرض الطالبات الإناث فقط"
                  className={`px-3 py-2 rounded-lg text-xs font-medium ${
                    selectedGender === "أنثى"
                      ? "bg-pink-600 text-white shadow-sm"
                      : "bg-gray-50 text-gray-700 hover:bg-pink-50 border border-gray-200"
                  }`}>
                  أنثى
                </button>
              </div>
            </div>

            {/* Groups Filter */}
            <div className="space-y-2.5">
              <label className="text-xs font-semibold text-gray-700">
                تصفية حسب الحلقات
              </label>
              <div className="grid grid-cols-1 gap-2">
                <button
                  onClick={() => setGroupsFilter("all")}
                  title="عرض جميع الطلاب"
                  className={`px-3 py-2 rounded-lg text-xs font-medium ${
                    groupsFilter === "all"
                      ? "bg-slate-600 text-white shadow-sm"
                      : "bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200"
                  }`}>
                  الكل
                </button>
                <button
                  onClick={() => setGroupsFilter("withGroups")}
                  title="عرض الطلاب الذين لديهم حلقات"
                  className={`px-3 py-2 rounded-lg text-xs font-medium ${
                    groupsFilter === "withGroups"
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "bg-gray-50 text-gray-700 hover:bg-emerald-50 border border-gray-200"
                  }`}>
                  لديهم حلقات
                </button>
                <button
                  onClick={() => setGroupsFilter("withoutGroups")}
                  title="عرض الطلاب الذين لا ينتمون لأي حلقة"
                  className={`px-3 py-2 rounded-lg text-xs font-medium ${
                    groupsFilter === "withoutGroups"
                      ? "bg-orange-600 text-white shadow-sm"
                      : "bg-gray-50 text-gray-700 hover:bg-orange-50 border border-gray-200"
                  }`}>
                  بلا حلقات
                </button>
              </div>
            </div>

            {/* Age Range Filter */}
            <div className="space-y-2.5">
              <label className="text-xs font-semibold text-gray-700">
                العمر: {ageRange[0]} - {ageRange[1]} سنة
              </label>
              <div className="space-y-2">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={ageRange[1]}
                  onChange={(e) =>
                    setAgeRange([ageRange[0], parseInt(e.target.value)])
                  }
                  aria-label="الحد الأقصى للعمر"
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex justify-between text-xs text-gray-400">
                  <span>0</span>
                  <span>50</span>
                  <span>100</span>
                </div>
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
                {selectedGender !== "all" && (
                  <span
                    className={`px-2.5 py-1 rounded-md text-xs font-medium ${
                      selectedGender === "ذكر"
                        ? "bg-blue-50 text-blue-700 border border-blue-200"
                        : "bg-pink-50 text-pink-700 border border-pink-200"
                    }`}>
                    الجنس: {selectedGender}
                  </span>
                )}

                {groupsFilter !== "all" && (
                  <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-md text-xs font-medium border border-emerald-200">
                    الحلقات:{" "}
                    {groupsFilter === "withGroups" ? "لديهم حلقات" : "بلا حلقات"}
                  </span>
                )}

                {(ageRange[0] !== 0 || ageRange[1] !== 100) && (
                  <span className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-md text-xs font-medium border border-gray-200">
                    العمر: {ageRange[0]}-{ageRange[1]}
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

export default StudentsFilters;
