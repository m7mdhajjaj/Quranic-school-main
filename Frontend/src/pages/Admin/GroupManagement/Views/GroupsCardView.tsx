import React from "react";
import {
  Edit2,
  Trash2,
  Users,
  Clock,
  User,
  MoreVertical,
} from "lucide-react";
import type { Group } from "../types";

interface GroupsCardViewProps {
  groups: Group[];
  onEdit: (group: Group) => void;
  onDelete: (groupId: string) => void;
  isLoading: boolean;
  selectedGroups: Set<string>;
  onToggleSelection: (groupId: string) => void;
  onSelectAll: () => void;
  isReadOnly?: boolean;
}

// دالة لحساب المدة الإجمالية من الجدول
const calculateTotalDuration = (timetable: Array<{ startHour: string; endHour: string }> | undefined): string => {
  if (!timetable || timetable.length === 0) return "غير محدد";
  
  const timeToMinutes = (time: string): number => {
    const match = time.match(/^(\d{1,2}):(\d{2})\s?(AM|PM)$/i);
    if (!match) return 0;
    
    let hours = parseInt(match[1]);
    const minutes = parseInt(match[2]);
    const period = match[3].toUpperCase();
    
    if (period === 'PM' && hours !== 12) {
      hours += 12;
    } else if (period === 'AM' && hours === 12) {
      hours = 0;
    }
    
    return hours * 60 + minutes;
  };

  const calculateDuration = (startHour: string, endHour: string): number => {
    const start = timeToMinutes(startHour);
    const end = timeToMinutes(endHour);
    return end > start ? end - start : 0;
  };

  const totalMinutes = timetable.reduce(
    (total, session) => total + calculateDuration(session.startHour, session.endHour),
    0
  );

  if (totalMinutes === 0) return "غير محدد";

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours > 0) {
    return minutes > 0 ? `${hours}س ${minutes}د` : `${hours} ساعة`;
  }
  return `${minutes} دقيقة`;
};

export const GroupsCardView: React.FC<GroupsCardViewProps> = ({
  groups,
  onEdit,
  onDelete,
  isLoading,
  selectedGroups,
  onToggleSelection,
  isReadOnly = false,
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-100 p-4 animate-pulse">
            <div className="h-5 bg-gray-200 rounded w-3/4 mb-3"></div>
            <div className="h-4 bg-gray-100 rounded w-1/2 mb-4"></div>
            <div className="h-2 bg-gray-200 rounded-full mb-2"></div>
            <div className="h-3 bg-gray-100 rounded w-1/3"></div>
          </div>
        ))}
      </div>
    );
  }

  if (groups.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white rounded-lg sm:rounded-2xl shadow-sm border border-gray-100">
        <div className="text-6xl opacity-30 mb-4">👥</div>
        <div className="text-gray-500 font-medium text-lg mb-2">لا توجد حلقات</div>
        <div className="text-gray-400 text-sm">لم يتم إضافة أي حلقات بعد</div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6" dir="rtl">
      {groups.map((group) => {
        const activeStatus = group.activeStatus === true;
        const percentage = group.capacityPercentage || 0;
        const current = group.currentStudents || 0;
        const capacity = group.capacity || 30;
        const isSelected = selectedGroups.has(group._id || "");
        const duration = calculateTotalDuration(group.timetable);

        return (
          <div
            key={group._id}
            className={`bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all group relative ${
              isSelected
                ? "ring-2 ring-emerald-500 shadow-md transform scale-[1.01] sm:scale-[1.02]"
                : ""
            }`}
          >
            {/* Checkbox Selection Overlay */}
            <div className="absolute top-2 right-2 z-20">
              <div
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center cursor-pointer transition-colors bg-white ${
                  isSelected
                    ? "border-emerald-500 bg-emerald-50"
                    : "border-white/40 hover:border-white"
                }`}
                onClick={() => onToggleSelection(group._id || "")}
              >
                {isSelected && (
                  <div className="w-3 h-3 bg-emerald-500 rounded-full" />
                )}
              </div>
            </div>

            {/* Header with gradient */}
            <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 p-4 relative">
              {!isReadOnly && (
                <div className="absolute top-2 left-2 flex gap-1 z-10">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(group);
                    }}
                    className="p-2 bg-white/20 hover:bg-white/40 rounded-lg transition-colors"
                    title="تعديل"
                  >
                    <Edit2 className="w-4 h-4 text-white" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm(`هل أنت متأكد من حذف "${group.name}"؟`)) {
                        onDelete(group._id || "");
                      }
                    }}
                    className="p-2 bg-white/20 hover:bg-red-500 rounded-lg transition-colors"
                    title="حذف"
                  >
                    <Trash2 className="w-4 h-4 text-white" />
                  </button>
                </div>
              )}

              <div className="text-white flex-1 min-w-0">
                <h3 className="font-bold text-lg truncate mb-2">
                  {group.name}
                </h3>
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium border ${
                      activeStatus
                        ? "bg-green-500/20 text-white border-green-400/30"
                        : "bg-white/10 text-white/70 border-white/10"
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ml-1.5 ${
                        activeStatus ? "bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.6)]" : "bg-gray-400"
                      }`}
                    ></span>
                    {activeStatus ? "فعالة" : "غير فعالة"}
                  </span>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-4 space-y-3">
              {/* Teacher */}
              <div className="flex items-center gap-2 text-sm text-gray-600 pb-3 border-b border-gray-100">
                <User className="w-4 h-4 text-emerald-500/70" />
                <span className="text-gray-400 text-xs text-nowrap">المعلم:</span>
                <span className="font-medium truncate">{group.teacher || "غير محدد"}</span>
              </div>

              {/* Stats Row */}
              <div className="space-y-2.5">
                {/* Student Count */}
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Users className="w-4 h-4 text-emerald-500/70" />
                  <span className="text-gray-400 text-xs text-nowrap">عدد الطلاب:</span>
                  <span className="font-medium">
                    {current} / {capacity}
                  </span>
                </div>

                {/* Duration */}
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4 text-emerald-500/70" />
                  <span className="text-gray-400 text-xs text-nowrap">المدة:</span>
                  <span className="font-medium">{duration}</span>
                </div>

                {/* Occupancy Progress Bar */}
                <div className="pt-2">
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
                    <span className="text-gray-400">نسبة الإشغال</span>
                    <span className="font-semibold text-gray-700">{percentage}%</span>
                  </div>
                  <div className="relative w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        percentage >= 90
                          ? "bg-red-500"
                          : percentage >= 70
                          ? "bg-yellow-500"
                          : "bg-emerald-500"
                      }`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default GroupsCardView;
