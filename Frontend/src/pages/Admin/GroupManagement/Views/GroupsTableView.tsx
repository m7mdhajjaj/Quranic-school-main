import React from "react";
import {
  Edit2,
  Trash2,
  Calendar,
  ChevronDown,
  CheckCircle2,
  XCircle,
  UserCheck,
} from "lucide-react";
import type { Group, SortField, SortOrder } from "../types";

interface GroupsTableViewProps {
  groups: Group[];
  onEdit: (group: Group) => void;
  onDelete: (groupId: string) => void;
  isLoading: boolean;
  selectedGroups: Set<string>;
  onToggleSelection: (groupId: string) => void;
  onSelectAll: () => void;
  sortField?: SortField;
  sortOrder?: SortOrder;
  onSort?: (field: SortField) => void;
  isReadOnly?: boolean;
}

export const GroupsTableView: React.FC<GroupsTableViewProps> = ({
  groups,
  onEdit,
  onDelete,
  isLoading,
  selectedGroups,
  onToggleSelection,
  onSelectAll,
  sortField,
  sortOrder,
  onSort,
  isReadOnly = false,
}) => {
  // State for expanded rows
  const [expandedRows, setExpandedRows] = React.useState<Set<string>>(new Set());

  const toggleExpand = (groupId: string) => {
    setExpandedRows((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(groupId)) {
        newSet.delete(groupId);
      } else {
        newSet.add(groupId);
      }
      return newSet;
    });
  };

  const handleBulkDelete = () => {
    if (selectedGroups.size === 0) return;
    if (window.confirm(`هل أنت متأكد من حذف ${selectedGroups.size} حلقة؟`)) {
      selectedGroups.forEach((groupId) => {
        onDelete(groupId);
      });
    }
  };

  return (
    <div className="bg-white rounded-lg sm:rounded-2xl shadow-lg sm:shadow-xl overflow-hidden" dir="rtl">
      {/* Bulk Actions Bar */}
      {selectedGroups.size > 0 && (
        <div className="px-4 py-3 bg-emerald-50 border-b border-emerald-200 flex items-center justify-between">
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
      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px]">
            <thead className="bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 text-white shadow-lg">
              <tr>
                <th className="px-2 sm:px-3 py-3 sm:py-4 text-center font-bold text-xs sm:text-sm whitespace-nowrap w-10 sm:w-12">
                  <input
                    type="checkbox"
                    checked={selectedGroups.size === groups.length && groups.length > 0}
                    onChange={onSelectAll}
                    className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                    aria-label="تحديد جميع الحلقات"
                    title="تحديد الكل"
                  />
                </th>
                <th className="px-2 sm:px-3 py-3 sm:py-4 text-center font-bold text-xs sm:text-sm whitespace-nowrap w-10 sm:w-12">#</th>
                <th className="px-3 sm:px-6 py-3 sm:py-4 text-right font-bold text-xs sm:text-sm whitespace-nowrap">اسم الحلقة</th>
                <th className="px-3 sm:px-6 py-3 sm:py-4 text-center font-bold text-xs sm:text-sm whitespace-nowrap hidden sm:table-cell">حالة النشاط</th>
                <th className="px-3 sm:px-6 py-3 sm:py-4 text-center font-bold text-xs sm:text-sm whitespace-nowrap hidden md:table-cell">المعلم</th>
                <th className="px-3 sm:px-6 py-3 sm:py-4 text-center font-bold text-xs sm:text-sm whitespace-nowrap hidden lg:table-cell">مساعد المعلم</th>
                <th className="px-3 sm:px-6 py-3 sm:py-4 text-center font-bold text-xs sm:text-sm whitespace-nowrap">الطلاب</th>
                <th className="px-3 sm:px-6 py-3 sm:py-4 text-center font-bold text-xs sm:text-sm whitespace-nowrap w-20 sm:w-28">الإجراءات</th>
                <th className="px-2 sm:px-3 py-3 sm:py-4 text-center font-bold text-xs sm:text-sm whitespace-nowrap w-10 sm:w-12"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-10 w-10 border-3 border-emerald-600 border-t-transparent"></div>
                    </div>
                  </td>
                </tr>
              ) : (
                groups.map((group, index) => {
                  const isExpanded = expandedRows.has(group._id || "");
                  const activeStatus = group.activeStatus;
                  const percentage = group.capacityPercentage || 0;
                  const current = group.currentStudents || 0;
                  const capacity = group.capacity || 30;

                  return (
                    <React.Fragment key={group._id}>
                      {/* Main Row */}
                      <tr className="hover:bg-gray-50 transition-colors">
                        <td className="px-3 py-3 text-center">
                          <input
                            type="checkbox"
                            checked={selectedGroups.has(group._id || "")}
                            onChange={() => onToggleSelection(group._id || "")}
                            className="w-4 h-4 rounded border-2 border-gray-400 text-emerald-600"
                            aria-label={`تحديد حلقة ${group.name}`}
                          />
                        </td>
                        <td className="px-3 py-3 text-center">
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-gray-100 text-gray-700 text-sm font-semibold">
                            {index + 1}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <div className="font-semibold text-gray-900">{group.name}</div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold border ${
                              activeStatus
                                ? "bg-green-100 text-green-700 border-green-200"
                                : "bg-red-100 text-red-700 border-red-300"
                            }`}>
                            {activeStatus ? (
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            ) : (
                              <XCircle className="w-3.5 h-3.5" />
                            )}
                            {activeStatus ? "فعالة" : "غير فعالة"}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-center hidden md:table-cell">
                          <span className="text-sm font-medium text-gray-900">{group.teacher}</span>
                        </td>
                        <td className="px-5 py-3 text-center hidden lg:table-cell">
                          <span className="text-sm font-medium text-gray-700">
                            {group.teacherAssistant && typeof group.teacherAssistant === 'object'
                              ? `${group.teacherAssistant.firstName} ${group.teacherAssistant.lastName}`
                              : <span className="text-gray-400 text-xs">لا يوجد</span>}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="inline-flex items-center gap-1 px-3 py-1 bg-gray-50 rounded-lg">
                            <span className="text-sm font-bold text-emerald-600">{current}</span>
                            <span className="text-gray-400">/</span>
                            <span className="text-sm font-semibold text-gray-600">{capacity}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-2">
                            {!isReadOnly && (
                              <>
                                <button
                                  onClick={() => onEdit(group)}
                                  className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-all hover:shadow-sm"
                                  title="تعديل">
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => onDelete(group._id || "")}
                                  className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-all hover:shadow-sm"
                                  title="حذف">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                        <td className="px-2 py-3 text-center">
                          <button
                            onClick={() => toggleExpand(group._id || "")}
                            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                            title={isExpanded ? "إخفاء التفاصيل" : "عرض التفاصيل"}>
                            <ChevronDown className={`w-4 h-4 text-gray-600 transform transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                          </button>
                        </td>
                      </tr>

                      {/* Expanded Details Row */}
                      {isExpanded && (
                        <tr>
                          <td colSpan={9} className="px-6 py-6 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 border-t-2 border-emerald-300">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                              {/* معلومات الحلقة */}
                              <div className="bg-white rounded-xl border-2 border-emerald-200 p-5 shadow-md">
                                <h3 className="text-base font-bold text-emerald-700 mb-4 pb-2 border-b border-emerald-100">
                                  معلومات الحلقة
                                </h3>
                                <div className="space-y-3">
                                  <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">السعة القصوى:</span>
                                    <span className="text-sm font-semibold text-gray-900">{capacity} طالب</span>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">الطلاب الحاليين:</span>
                                    <span className="text-sm font-semibold text-gray-900">{current} طالب</span>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">الأماكن المتاحة:</span>
                                    <span className="text-sm font-semibold text-gray-900">{Math.max(0, capacity - current)} مكان</span>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">نسبة الإشغال:</span>
                                    <span className={`text-sm font-bold ${
                                      percentage >= 90 ? "text-red-600" :
                                      percentage >= 80 ? "text-yellow-600" :
                                      "text-green-600"
                                    }`}>{percentage}%</span>
                                  </div>
                                  <div className="relative w-full bg-gray-200 rounded-full h-2 mt-2 overflow-hidden shadow-inner">
                                    <div
                                      className={`h-full rounded-full transition-all duration-500 ease-out ${
                                        percentage >= 90
                                          ? "bg-gradient-to-r from-red-500 to-red-600 shadow-lg shadow-red-500/50"
                                          : percentage >= 80
                                          ? "bg-gradient-to-r from-yellow-500 to-yellow-600 shadow-lg shadow-yellow-500/50"
                                          : "bg-gradient-to-r from-green-500 to-green-600 shadow-lg shadow-green-500/50"
                                      }`}
                                      style={{ width: `${Math.min(percentage, 100)}%` }}
                                    />
                                  </div>
                                </div>
                              </div>

                              {/* الجدول الزمني */}
                              <div className="bg-white rounded-xl border-2 border-emerald-200 p-5 shadow-md">
                                <h3 className="text-base font-bold text-emerald-700 mb-4 pb-2 border-b border-emerald-100">
                                  الجدول الأسبوعي
                                </h3>
                                {group.timetable && group.timetable.length > 0 ? (
                                  <div className="space-y-2.5">
                                    {group.timetable.map((session, idx) => (
                                      <div key={session._id || idx} className="flex justify-between items-center py-2 px-3 bg-blue-50/50 rounded-lg border border-blue-100">
                                        <div className="flex items-center gap-2">
                                          <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                          <span className="text-sm font-bold text-gray-900">{session.day}</span>
                                        </div>
                                        <span className="text-sm text-gray-600 font-medium">{session.startHour} - {session.endHour}</span>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="text-center py-8 text-gray-400">
                                    <Calendar className="w-8 h-8 mx-auto mb-2 opacity-30" />
                                    <p className="text-sm">لا يوجد جدول زمني</p>
                                  </div>
                                )}
                              </div>

                              {/* الوصف - Full width if exists */}
                              {group.description && (
                                <div className="lg:col-span-2 bg-white rounded-xl border-2 border-emerald-200 p-5 shadow-md">
                                  <h3 className="text-base font-bold text-emerald-700 mb-3 pb-2 border-b border-emerald-100">
                                    الوصف
                                  </h3>
                                  <p className="text-sm text-gray-700 leading-relaxed">
                                    {group.description}
                                  </p>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
    </div>
  );
};

export default GroupsTableView;
