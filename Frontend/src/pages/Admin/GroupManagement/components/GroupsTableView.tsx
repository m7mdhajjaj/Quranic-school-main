import React from "react";
import { Table, type Column } from "@/components/UI";
import {
  FaEdit,
  FaTrash,
  FaChalkboardTeacher,
  FaUsers,
  FaUserFriends,
  FaCalendar,
  FaSortAmountDown,
  FaSortAmountUp,
} from "react-icons/fa";
import type { Group, SortField, SortOrder } from "../types";

interface GroupsTableViewProps {
  groups: Group[];
  onEdit: (group: Group) => void;
  onDelete: (groupId: string) => void;
  isLoading: boolean;
  selectedGroups: Set<string>;
  onToggleSelection: (groupId: string) => void;
  onSelectAll: () => void;
  sortField: SortField;
  sortOrder: SortOrder;
  onSort: (field: SortField) => void;
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
}) => {
  const columns: Column<Group>[] = [
    {
      key: "checkbox",
      header: (
        <input
          type="checkbox"
          title="تحديد جميع الحلقات"
          aria-label="تحديد جميع الحلقات"
          checked={selectedGroups.size === groups.length && groups.length > 0}
          onChange={onSelectAll}
          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
      ),
      width: "50px",
      align: "center",
      render: (group) => (
        <input
          type="checkbox"
          title={`تحديد حلقة ${group.name}`}
          aria-label={`تحديد حلقة ${group.name}`}
          checked={selectedGroups.has(group._id || "")}
          onChange={() => onToggleSelection(group._id || "")}
          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
      ),
    },
    {
      key: "name",
      header: (
        <div
          className="flex items-center justify-center gap-2 cursor-pointer hover:text-blue-600"
          onClick={() => onSort("name")}>
          <span>اسم الحلقة</span>
          {sortField === "name" &&
            (sortOrder === "asc" ? <FaSortAmountUp /> : <FaSortAmountDown />)}
        </div>
      ),
      sortable: true,
      align: "center",
      render: (group) => (
        <div className="flex justify-center">
          <div className="font-medium text-gray-900">{group.name}</div>
        </div>
      ),
    },
    {
      key: "teacher",
      header: (
        <div
          className="flex items-center justify-center gap-2 cursor-pointer hover:text-blue-600"
          onClick={() => onSort("teacher")}>
          <span>المعلم</span>
          {sortField === "teacher" &&
            (sortOrder === "asc" ? <FaSortAmountUp /> : <FaSortAmountDown />)}
        </div>
      ),
      sortable: true,
      align: "center",
      render: (group) => (
        <div className="flex justify-center">
          <span
            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
              group.teacher === "غير محدد"
                ? "bg-gray-100 text-gray-600"
                : "bg-blue-100 text-blue-700"
            }`}>
            <FaChalkboardTeacher className="w-3 h-3" />
            {group.teacher}
          </span>
        </div>
      ),
    },
    {
      key: "capacity",
      header: (
        <div
          className="flex items-center justify-center gap-2 cursor-pointer hover:text-blue-600"
          onClick={() => onSort("capacity")}>
          <span>السعة القصوى</span>
          {sortField === "capacity" &&
            (sortOrder === "asc" ? <FaSortAmountUp /> : <FaSortAmountDown />)}
        </div>
      ),
      sortable: true,
      align: "center",
      render: (group) => (
        <div className="flex justify-center">
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
            <FaUsers className="w-3 h-3" />
            {group.capacity} طالب
          </span>
        </div>
      ),
    },
    {
      key: "currentStudents",
      header: "الطلاب المشتركين",
      align: "center",
      render: (group) => (
        <div className="flex justify-center">
          <div className="flex flex-col gap-2 min-w-[150px]">
            <div className="flex items-center justify-between">
              <span
                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                  group.isFull
                    ? "bg-red-100 text-red-700"
                    : (group.capacityPercentage || 0) >= 80
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-green-100 text-green-700"
                }`}>
                <FaUserFriends className="w-3 h-3" />
                {group.capacityStatus ||
                  `${group.currentStudents || 0}/${group.capacity || 30}`}
              </span>
              {group.isFull && (
                <span className="text-red-500 text-xs font-bold">ممتلئة</span>
              )}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 relative">
              <div
                className={`h-2 rounded-full transition-all duration-300 absolute top-0 left-0 ${
                  group.isFull
                    ? "bg-red-500"
                    : (group.capacityPercentage || 0) >= 80
                    ? "bg-yellow-500"
                    : "bg-green-500"
                }`}
                style={{
                  width: `${Math.min(group.capacityPercentage || 0, 100)}%`,
                }}></div>
            </div>
            <span className="text-xs text-gray-500 text-center">
              {group.capacityPercentage || 0}%
            </span>
          </div>
        </div>
      ),
    },
    {
      key: "timetable",
      header: "الجدول الأسبوعي",
      align: "center",
      render: (group) => (
        <div className="flex justify-center">
          {group.timetable && group.timetable.length > 0 ? (
            <div className="space-y-1">
              {group.timetable.map((session: any, idx: number) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 text-xs bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">
                  <FaCalendar className="w-3 h-3 text-blue-600 flex-shrink-0" />
                  <span className="font-medium text-blue-900">
                    {session.day}
                  </span>
                  <span className="text-gray-400">•</span>
                  <span className="text-blue-700 font-semibold">
                    {session.startHour} - {session.endHour}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <span className="inline-flex items-center gap-1 text-gray-500 text-sm">
              <FaCalendar className="w-3 h-3" />
              لا يوجد جدول
            </span>
          )}
        </div>
      ),
    },
    {
      key: "description",
      header: "الوصف",
      align: "center",
      render: (group) => (
        <div className="flex justify-center">
          <div className="text-sm text-gray-600 max-w-xs truncate">
            {group.description || "-"}
          </div>
        </div>
      ),
    },
    {
      key: "actions",
      header: "الإجراءات",
      width: "120px",
      align: "center",
      render: (group) => (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => onEdit(group)}
            className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
            title="تعديل"
            aria-label="تعديل الحلقة">
            <FaEdit className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(group._id || "")}
            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
            title="حذف"
            aria-label="حذف الحلقة">
            <FaTrash className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
      <Table
        data={groups}
        columns={columns}
        loading={isLoading}
        emptyMessage="لا توجد حلقات"
        emptyDescription="لم يتم إضافة أي حلقات بعد"
        emptyIcon="👥"
      />
    </div>
  );
};
