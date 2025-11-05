import React from "react";

interface TeachersFiltersProps {
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
  searchTerm: string;
  selectedGender: string;
  setSelectedGender: (gender: string) => void;
  groupsFilter: "all" | "withGroups" | "withoutGroups";
  setGroupsFilter: (filter: "all" | "withGroups" | "withoutGroups") => void;
  ageRange: [number, number];
  setAgeRange: (range: [number, number]) => void;
  teachersPerPage: number;
  setTeachersPerPage: (perPage: number) => void;
  activeFiltersCount: number;
}

const TeachersFilters: React.FC<TeachersFiltersProps> = ({
  showFilters,
  setShowFilters,
  searchTerm,
  selectedGender,
  setSelectedGender,
  groupsFilter,
  setGroupsFilter,
  ageRange,
  setAgeRange,
  teachersPerPage,
  setTeachersPerPage,
  activeFiltersCount,
}) => {
  return (
    <>
      {showFilters && (
        <div className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-2xl border-2 border-gray-100 shadow-lg animate-fadeIn relative mb-6">
          {/* Close Button */}
          <button
            onClick={() => setShowFilters(false)}
            className="absolute top-4 left-4 p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-full transition-all duration-200"
            title="إغلاق الفلاتر">
            <svg
              className="w-5 h-5"
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Gender Filter */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                <div className="w-2 h-2 rounded-full bg-pink-500"></div>
                تصفية حسب الجنس
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setSelectedGender("all")}
                  title="عرض جميع المعلمين"
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    selectedGender === "all"
                      ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}>
                  الكل
                </button>
                <button
                  onClick={() => setSelectedGender("ذكر")}
                  title="عرض المعلمين الذكور فقط"
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    selectedGender === "ذكر"
                      ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}>
                  ذكر
                </button>
                <button
                  onClick={() => setSelectedGender("أنثى")}
                  title="عرض المعلمات الإناث فقط"
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    selectedGender === "أنثى"
                      ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}>
                  أنثى
                </button>
              </div>
            </div>

            {/* Groups Filter */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                تصفية حسب الحلقات
              </label>
              <div className="grid grid-cols-1 gap-2">
                <button
                  onClick={() => setGroupsFilter("all")}
                  title="عرض جميع المعلمين"
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    groupsFilter === "all"
                      ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}>
                  الكل
                </button>
                <button
                  onClick={() => setGroupsFilter("withGroups")}
                  title="عرض المعلمين الذين لديهم حلقات"
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    groupsFilter === "withGroups"
                      ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-md"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}>
                  🎯 لديهم حلقات
                </button>
                <button
                  onClick={() => setGroupsFilter("withoutGroups")}
                  title="عرض المعلمين الذين لا يدرسون أي حلقة"
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    groupsFilter === "withoutGroups"
                      ? "bg-gradient-to-r from-red-500 to-pink-600 text-white shadow-md"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}>
                  🚫 بلا حلقات
                </button>
              </div>
            </div>

            {/* Age Range Filter */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
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
                  className="w-full h-2 bg-gradient-to-r from-green-200 to-green-400 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>0</span>
                  <span>50</span>
                  <span>100</span>
                </div>
              </div>
            </div>

            {/* Items per page */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                عدد المعلمين
              </label>
              <select
                value={teachersPerPage}
                onChange={(e) => {
                  setTeachersPerPage(parseInt(e.target.value));
                }}
                aria-label="عدد المعلمين في الصفحة"
                className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all">
                <option value="10">10 معلمين</option>
                <option value="25">25 معلم</option>
                <option value="50">50 معلم</option>
                <option value="100">100 معلم</option>
              </select>
            </div>
          </div>

          {/* Filter Summary */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-gray-600 font-medium">
                الفلاتر النشطة:
              </span>
              {selectedGender !== "all" && (
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    selectedGender === "ذكر"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-pink-100 text-pink-800"
                  }`}>
                  الجنس: {selectedGender}
                </span>
              )}

              {groupsFilter !== "all" && (
                <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium">
                  الحلقات:{" "}
                  {groupsFilter === "withGroups" ? "لديهم حلقات" : "بلا حلقات"}
                </span>
              )}

              {(ageRange[0] !== 0 || ageRange[1] !== 100) && (
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                  العمر: {ageRange[0]}-{ageRange[1]}
                </span>
              )}

              {searchTerm && (
                <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
                  البحث: "{searchTerm}"
                </span>
              )}

              {activeFiltersCount === 0 && (
                <span className="text-xs text-gray-400 italic">
                  لا توجد فلاتر مطبقة
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TeachersFilters;
