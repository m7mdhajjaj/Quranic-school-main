import React from "react";
import {
  FaFilter,
  FaTh,
  FaChalkboardTeacher,
  FaUsers,
  FaSync,
  FaTimes,
} from "react-icons/fa";
import type {
  TeacherFilter,
  CapacityFilter,
  StatusFilter,
  OccupancyFilter,
  DayFilter,
  TimeFilter,
} from "../types";

interface GroupsFiltersProps {
  // Teacher Filter
  selectedTeacher: TeacherFilter;
  onTeacherChange: (value: string) => void;
  allTeachers: string[];
  groups: any[];

  // Capacity Filter
  capacityFilter: CapacityFilter;
  onCapacityChange: (value: CapacityFilter) => void;

  // Status Filter
  statusFilter: StatusFilter;
  onStatusChange: (value: StatusFilter) => void;

  // Occupancy Filter
  occupancyFilter: OccupancyFilter;
  onOccupancyChange: (value: OccupancyFilter) => void;

  // Day Filter
  dayFilter: DayFilter;
  onDayChange: (value: DayFilter) => void;

  // Time Filter
  timeFilter: TimeFilter;
  onTimeChange: (value: TimeFilter) => void;

  // Items per page
  groupsPerPage: number;
  onGroupsPerPageChange: (value: number) => void;

  // Actions
  activeFiltersCount: number;
  onReset: () => void;
  onClose: () => void;
}

export const GroupsFilters: React.FC<GroupsFiltersProps> = ({
  selectedTeacher,
  onTeacherChange,
  allTeachers,
  groups,
  capacityFilter,
  onCapacityChange,
  statusFilter,
  onStatusChange,
  occupancyFilter,
  onOccupancyChange,
  dayFilter,
  onDayChange,
  timeFilter,
  onTimeChange,
  groupsPerPage,
  onGroupsPerPageChange,
  activeFiltersCount,
  onReset,
  onClose,
}) => {
  return (
    <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6 rounded-2xl border-2 border-blue-100 shadow-xl animate-fadeIn mt-4">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          <FaFilter className="text-blue-600" />
          الفلاتر المتقدمة والذكية
        </h3>
        <button
          onClick={onClose}
          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-all duration-200"
          title="إغلاق">
          <FaTimes className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {/* Teacher Filter */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-blue-100">
          <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-3">
            <FaChalkboardTeacher className="text-blue-600" />
            المعلم
          </label>
          <select
            value={selectedTeacher}
            title="اختيار المعلم للفلترة"
            onChange={(e) => onTeacherChange(e.target.value)}
            className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm">
            <option value="all">جميع المعلمين</option>
            {allTeachers.map((teacher) => (
              <option key={teacher} value={teacher}>
                {teacher} ({groups.filter((g) => g.teacher === teacher).length})
              </option>
            ))}
          </select>
        </div>

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

        {/* Occupancy Filter */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-orange-100">
          <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-3">
            <svg
              className="w-4 h-4 text-orange-600"
              fill="currentColor"
              viewBox="0 0 20 20">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            الإشغال
          </label>
          <select
            value={occupancyFilter}
            title="فلترة الحلقات حسب مستوى الإشغال"
            onChange={(e) =>
              onOccupancyChange(e.target.value as OccupancyFilter)
            }
            className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 text-sm">
            <option value="all">جميع مستويات الإشغال</option>
            <option value="empty">فارغة (0%)</option>
            <option value="low">إشغال قليل (1-50%)</option>
            <option value="medium">إشغال متوسط (51-80%)</option>
            <option value="high">إشغال عالي (81-99%)</option>
            <option value="full">ممتلئة (100%)</option>
          </select>
        </div>

        {/* Day Filter */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-cyan-100">
          <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-3">
            <svg
              className="w-4 h-4 text-cyan-600"
              fill="currentColor"
              viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                clipRule="evenodd"
              />
            </svg>
            اليوم
          </label>
          <select
            value={dayFilter}
            title="فلترة الحلقات حسب يوم الأسبوع"
            onChange={(e) => onDayChange(e.target.value as DayFilter)}
            className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-cyan-500 text-sm">
            <option value="all">جميع الأيام</option>
            <option value="السبت">السبت</option>
            <option value="الأحد">الأحد</option>
            <option value="الإثنين">الإثنين</option>
            <option value="الثلاثاء">الثلاثاء</option>
            <option value="الأربعاء">الأربعاء</option>
            <option value="الخميس">الخميس</option>
            <option value="الجمعة">الجمعة</option>
          </select>
        </div>

        {/* Time Filter */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-indigo-100">
          <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-3">
            <svg
              className="w-4 h-4 text-indigo-600"
              fill="currentColor"
              viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                clipRule="evenodd"
              />
            </svg>
            الفترة الزمنية
          </label>
          <select
            value={timeFilter}
            title="فلترة الحلقات حسب الفترة الزمنية"
            onChange={(e) => onTimeChange(e.target.value as TimeFilter)}
            className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm">
            <option value="all">جميع الأوقات</option>
            <option value="morning">صباحي (6ص - 12م)</option>
            <option value="afternoon">بعد الظهر (12م - 6م)</option>
            <option value="evening">مسائي (6م - 12م)</option>
          </select>
        </div>

        {/* Items Per Page */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-3">
            <FaTh className="text-gray-600" />
            عدد العرض
          </label>
          <select
            value={groupsPerPage}
            title="اختيار عدد الحلقات المعروضة في الصفحة الواحدة"
            onChange={(e) => onGroupsPerPageChange(parseInt(e.target.value))}
            className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-500 text-sm">
            <option value="5">5 حلقات</option>
            <option value="10">10 حلقات</option>
            <option value="25">25 حلقة</option>
            <option value="50">50 حلقة</option>
            <option value="100">100 حلقة</option>
          </select>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 pt-4 border-t border-gray-200 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span className="font-medium">الفلاتر النشطة:</span>
          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full font-bold">
            {activeFiltersCount}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onReset}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all text-sm font-medium">
            <FaSync className="w-4 h-4 inline ml-2" />
            إعادة تعيين
          </button>
        </div>
      </div>
    </div>
  );
};
