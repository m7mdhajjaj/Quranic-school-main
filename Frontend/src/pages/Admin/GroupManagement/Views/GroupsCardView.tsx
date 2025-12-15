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
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 animate-pulse">
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
      <div className="flex flex-col items-center justify-center py-20 bg-white rounded-lg border border-gray-200">
        <div className="text-6xl opacity-30 mb-4">👥</div>
        <div className="text-gray-500 font-medium text-lg mb-2">لا توجد حلقات</div>
        <div className="text-gray-400 text-sm">لم يتم إضافة أي حلقات بعد</div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
            className={`group relative bg-white rounded-lg border transition-all duration-200 hover:shadow-md ${
              isSelected
                ? "border-emerald-500 shadow-md"
                : "border-gray-200 hover:border-emerald-300"
            }`}
            dir="rtl"
          >
            {/* Selection Checkbox */}
            <div className="absolute top-3 left-3 z-10">
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => onToggleSelection(group._id || "")}
                className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                onClick={(e) => e.stopPropagation()}
                title={`تحديد حلقة ${group.name}`}
                aria-label={`تحديد حلقة ${group.name}`}
              />
            </div>

            {/* Card Content */}
            <div className="p-4">
              {/* Header */}
              <div className="mb-3 pr-6">
                <h3 className="text-base font-bold text-gray-900 mb-1.5 line-clamp-1">
                  {group.name}
                </h3>
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium ${
                      activeStatus
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-gray-50 text-gray-600 border border-gray-200"
                    }`}
                  >
                    <div className={`w-1.5 h-1.5 rounded-full ${activeStatus ? "bg-emerald-500" : "bg-gray-400"}`} />
                    {activeStatus ? "فعالة" : "غير فعالة"}
                  </span>
                </div>
              </div>

              {/* Teacher */}
              <div className="flex items-center gap-2 mb-3 pb-3 border-b border-gray-100">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-semibold text-xs shadow-sm flex-shrink-0">
                  {group.teacher && group.teacher !== "غير محدد" 
                    ? group.teacher.charAt(0).toUpperCase() 
                    : "؟"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-gray-500 mb-0.5">المعلم</div>
                  <div className="text-sm font-semibold text-gray-900 truncate">
                    {group.teacher || "غير محدد"}
                  </div>
                </div>
              </div>

              {/* Stats Row */}
              <div className="space-y-2.5 mb-3">
                {/* Student Count */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users className="w-4 h-4 text-emerald-600" />
                    <span>عدد الطلاب</span>
                  </div>
                  <span className="text-sm font-bold text-gray-900">
                    {current} / {capacity}
                  </span>
                </div>

                {/* Duration */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span>المدة</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">
                    {duration}
                  </span>
                </div>

                {/* Occupancy Progress Bar */}
                <div className="pt-1">
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                    <span>نسبة الإشغال</span>
                    <span className="font-semibold">{percentage}%</span>
                  </div>
                  <div className="relative w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
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

              {/* Actions - Icons Only */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(group);
                  }}
                  className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                  title="تعديل"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm(`هل أنت متأكد من حذف "${group.name}"؟`)) {
                      onDelete(group._id || "");
                    }
                  }}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="حذف"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default GroupsCardView;
