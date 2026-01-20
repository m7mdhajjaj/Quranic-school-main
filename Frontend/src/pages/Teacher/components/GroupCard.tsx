import React from "react";
import { Users, BookOpen, Clock, GraduationCap } from "lucide-react";
import type { TeacherGroup } from "../types";

interface GroupCardProps {
  group: TeacherGroup;
  onClick: () => void;
  onTimetableClick?: (e: React.MouseEvent) => void;
}

export const GroupCard: React.FC<GroupCardProps> = React.memo(({ group, onClick, onTimetableClick }) => {
  const studentCount = group.currentStudents || group.totalStudents || 0;
  const capacity = group.capacity || 30;
  const activeStatus = group.activeStatus === true;
  const occupancyPercentage = capacity > 0 ? Math.round((studentCount / capacity) * 100) : 0;

  // تحديد لون التدرج حسب الحالة
  const gradientClass = activeStatus
    ? "from-emerald-600 via-teal-700 to-slate-700"
    : "from-gray-400 via-gray-500 to-gray-600";
  
  const bgGradientClass = activeStatus
    ? "from-emerald-50 via-teal-50/60 to-cyan-50/40"
    : "from-gray-50 via-gray-50/50 to-gray-50/30";

  return (
    <div
      onClick={onClick}
      className={`group relative bg-gradient-to-br ${bgGradientClass} rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer border-2 ${
        activeStatus
          ? "border-emerald-200 hover:border-teal-400"
          : "border-gray-200 hover:border-gray-300"
      } overflow-hidden transform hover:scale-[1.02] hover:-translate-y-1`}
      dir="rtl"
    >
      {/* شريط علوي ملون */}
      <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${gradientClass}`}></div>

      {/* تأثير خلفي متحرك */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradientClass} opacity-0 group-hover:opacity-[0.03] transition-opacity duration-500`}></div>

      <div className="relative z-10 p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-3">
              <div className={`p-2.5 rounded-xl bg-gradient-to-br ${gradientClass} shadow-md`}>
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 group-hover:text-emerald-700 transition-colors truncate">
                {group.name}
              </h3>
            </div>
          </div>
          <div
            className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm border ${
              activeStatus
                ? "bg-emerald-100 text-emerald-700 border-emerald-300"
                : "bg-gray-100 text-gray-600 border-gray-300"
            }`}
          >
            <div className="flex items-center gap-1.5">
              <div className={`w-2 h-2 rounded-full ${activeStatus ? "bg-emerald-500 animate-pulse" : "bg-gray-400"}`}></div>
              {activeStatus ? "نشطة" : "غير نشطة"}
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {/* عدد الطلاب */}
          <div className="bg-white/90 backdrop-blur-sm rounded-xl p-3 border border-emerald-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 mb-1">
              <Users className={`w-4 h-4 ${activeStatus ? "text-emerald-600" : "text-gray-500"}`} />
              <span className="text-xs text-gray-600">الطلاب</span>
            </div>
            <div className="text-lg font-bold text-gray-900">{studentCount}</div>
          </div>

          {/* السعة */}
          <div className="bg-white/90 backdrop-blur-sm rounded-xl p-3 border border-emerald-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 mb-1">
              <BookOpen className={`w-4 h-4 ${activeStatus ? "text-teal-600" : "text-gray-500"}`} />
              <span className="text-xs text-gray-600">السعة</span>
            </div>
            <div className="text-lg font-bold text-gray-900">{capacity}</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
            <span className="font-medium">نسبة الإشغال</span>
            <span className="font-bold text-gray-900">{occupancyPercentage}%</span>
          </div>
          <div className="relative">
            <progress
              value={Math.min(occupancyPercentage, 100)}
              max={100}
              aria-label="نسبة الإشغال"
              className={`w-full h-2.5 overflow-hidden rounded-full shadow-inner [&::-webkit-progress-bar]:bg-gray-200/80 [&::-webkit-progress-bar]:rounded-full ${
                occupancyPercentage >= 90
                  ? "[&::-webkit-progress-value]:bg-gradient-to-r [&::-webkit-progress-value]:from-red-500 [&::-webkit-progress-value]:to-rose-600 [&::-webkit-progress-value]:rounded-full"
                  : occupancyPercentage >= 70
                  ? "[&::-webkit-progress-value]:bg-gradient-to-r [&::-webkit-progress-value]:from-amber-500 [&::-webkit-progress-value]:to-orange-500 [&::-webkit-progress-value]:rounded-full"
                  : activeStatus
                  ? "[&::-webkit-progress-value]:bg-gradient-to-r [&::-webkit-progress-value]:from-emerald-600 [&::-webkit-progress-value]:via-teal-700 [&::-webkit-progress-value]:to-slate-700 [&::-webkit-progress-value]:rounded-full"
                  : "[&::-webkit-progress-value]:bg-gradient-to-r [&::-webkit-progress-value]:from-gray-400 [&::-webkit-progress-value]:to-gray-500 [&::-webkit-progress-value]:rounded-full"
              }`}
            />
            <div className="pointer-events-none absolute inset-0 rounded-full bg-white/10 animate-pulse" />
          </div>
        </div>

        {/* Footer */}
        <div 
          className="pt-4 border-t border-white/60 flex items-center justify-between"
          onClick={(e) => e.stopPropagation()} // منع تنفيذ onClick للكارد عند الضغط على Footer
        >
          <div className="flex items-center gap-2">
            <div className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
              studentCount === 0
                ? "bg-gray-100 text-gray-600"
                : activeStatus
                ? "bg-emerald-100 text-emerald-700"
                : "bg-blue-100 text-blue-700"
            }`}>
              {studentCount === 0 ? "لا يوجد طلاب" : `${studentCount} طالب`}
            </div>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation(); // منع تنفيذ onClick للكارد
              e.preventDefault(); // منع أي سلوك افتراضي
              if (onTimetableClick) {
                onTimetableClick(e);
              }
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold text-sm transition-all relative z-20 cursor-pointer ${
              activeStatus
                ? "bg-gradient-to-r from-emerald-600 via-teal-700 to-slate-700 text-white shadow-md hover:shadow-lg group-hover:gap-2"
                : "bg-gray-200 text-gray-700 group-hover:bg-gray-300"
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>عرض الأوقات</span>
          </button>
        </div>
      </div>

      {/* تأثير لامع عند hover */}
      <div className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none`}></div>
    </div>
  );
});

GroupCard.displayName = "GroupCard";
