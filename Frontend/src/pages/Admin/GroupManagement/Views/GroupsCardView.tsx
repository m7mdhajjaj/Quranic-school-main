import React from "react";
import {
  Edit2,
  Trash2,
  Calendar,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  BookOpen,
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

export const GroupsCardView: React.FC<GroupsCardViewProps> = ({
  groups,
  onEdit,
  onDelete,
  isLoading,
  selectedGroups,
  onToggleSelection,
}) => {
  const handleBulkDelete = () => {
    if (selectedGroups.size === 0) return;
    if (window.confirm(`هل أنت متأكد من حذف ${selectedGroups.size} حلقة؟`)) {
      selectedGroups.forEach((groupId) => {
        onDelete(groupId);
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-3 border-emerald-600 border-t-transparent"></div>
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
    <div>
      {/* Bulk Actions Bar */}
      {selectedGroups.size > 0 && (
        <div className="mb-4 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span className="text-sm font-medium text-gray-700">
              تم تحديد {selectedGroups.size} حلقة
            </span>
          </div>
          <button
            onClick={handleBulkDelete}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm font-medium">
            <Trash2 className="w-4 h-4" />
            حذف المحدد
          </button>
        </div>
      )}

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {groups.map((group) => {
          const activeStatus = group.activeStatus;
          const percentage = group.capacityPercentage || 0;
          const current = group.currentStudents || 0;
          const capacity = group.capacity || 30;
          const isSelected = selectedGroups.has(group._id || "");

          return (
            <div
              key={group._id}
              className={`bg-white rounded-xl border-2 transition-all duration-200 hover:shadow-lg flex flex-col ${
                isSelected
                  ? "border-emerald-500 shadow-md"
                  : "border-gray-200 hover:border-emerald-300"
              }`}>
              {/* Card Header */}
              <div className="p-4 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-t-xl">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-white font-bold text-lg mb-1 line-clamp-2">
                      {group.name}
                    </h3>
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold ${
                        activeStatus
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-700"
                      }`}>
                      {activeStatus ? (
                        <CheckCircle2 className="w-3 h-3" />
                      ) : (
                        <XCircle className="w-3 h-3" />
                      )}
                      {activeStatus ? "فعالة" : "غير فعالة"}
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onToggleSelection(group._id || "")}
                    className="w-5 h-5 rounded border-2 border-white/50 text-emerald-600 bg-white/20 cursor-pointer"
                    aria-label={`تحديد حلقة ${group.name}`}
                  />
                </div>

                {/* Capacity Bar */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-white text-xs font-medium">
                    <span>نسبة الإشغال</span>
                    <span className="font-bold">{percentage}%</span>
                  </div>
                  <div className="relative w-full bg-white/20 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        percentage >= 90
                          ? "bg-red-400"
                          : percentage >= 80
                          ? "bg-yellow-400"
                          : "bg-green-400"
                      }`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-center gap-1 text-white text-xs">
                    <Users className="w-3.5 h-3.5" />
                    <span className="font-bold">{current}</span>
                    <span className="opacity-80">/</span>
                    <span className="font-semibold">{capacity}</span>
                  </div>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4 space-y-3 flex-1">
                {/* Teacher */}
                <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-sm flex-shrink-0">
                    {group.teacher === "غير محدد" ? "؟" : group.teacher.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-gray-500 mb-0.5">المعلم</div>
                    <div className="text-sm font-semibold text-gray-900 truncate">
                      {group.teacher}
                    </div>
                  </div>
                </div>

                {/* Timetable */}
                <div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-2">
                    <Clock className="w-3.5 h-3.5" />
                    <span className="font-medium">الجدول الأسبوعي</span>
                  </div>
                  {group.timetable && group.timetable.length > 0 ? (
                    <div className="space-y-1.5 max-h-24 overflow-y-auto custom-scrollbar">
                      {group.timetable.map((session, idx) => (
                        <div
                          key={session._id || idx}
                          className="flex items-center justify-between py-1.5 px-2.5 bg-blue-50/70 rounded-md border border-blue-100 text-xs">
                          <span className="font-semibold text-gray-800">{session.day}</span>
                          <span className="text-gray-600">{session.startHour} - {session.endHour}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-3 text-gray-400 text-xs">
                      <Calendar className="w-5 h-5 mx-auto mb-1 opacity-30" />
                      <p>لا يوجد جدول</p>
                    </div>
                  )}
                </div>

                {/* Description */}
                {group.description && (
                  <div>
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1.5">
                      <BookOpen className="w-3.5 h-3.5" />
                      <span className="font-medium">الوصف</span>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed line-clamp-3">
                      {group.description}
                    </p>
                  </div>
                )}
              </div>

              {/* Card Footer - Actions (Always at bottom) */}
              <div className="px-4 pb-4 pt-2 mt-auto border-t border-gray-100">
                <div className="flex gap-2">
                  <button
                    onClick={() => onEdit(group)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-sm font-medium">
                    <Edit2 className="w-4 h-4" />
                    تعديل
                  </button>
                  <button
                    onClick={() => onDelete(group._id || "")}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors text-sm font-medium">
                    <Trash2 className="w-4 h-4" />
                    حذف
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default GroupsCardView;
