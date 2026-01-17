import React from "react";
import { Edit2, Trash2, ChevronUp, ChevronDown, Users } from "lucide-react";
import { FaMale, FaFemale } from "react-icons/fa";
import type { TeacherAssistant, SortField, SortOrder } from "../types";

interface TableViewProps {
  assistants: TeacherAssistant[];
  onEdit: (assistant: TeacherAssistant) => void;
  onDelete: (assistant: TeacherAssistant) => void;
  sortField: SortField;
  sortOrder: SortOrder;
  onSort: (field: SortField) => void;
  selectedIds: Set<string>;
  onToggleSelection: (id: string) => void;
  onToggleSelectAll: () => void;
}

export const TableView: React.FC<TableViewProps> = ({
  assistants,
  onEdit,
  onDelete,
  sortField,
  sortOrder,
  onSort,
  selectedIds,
  onToggleSelection,
  onToggleSelectAll,
}) => {
  const isOnline = (lastSeen?: Date) => {
    if (!lastSeen) return false;
    return new Date(lastSeen).getTime() > Date.now() - 5 * 60 * 1000;
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortOrder === "asc" ? (
      <ChevronUp className="w-4 h-4" />
    ) : (
      <ChevronDown className="w-4 h-4" />
    );
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gradient-to-l from-purple-50 to-indigo-50 border-b border-gray-200">
              <th className="p-4 text-right">
                <input
                  type="checkbox"
                  checked={selectedIds.size === assistants.length && assistants.length > 0}
                  onChange={onToggleSelectAll}
                  className="w-5 h-5 text-purple-600 bg-white border-gray-300 rounded focus:ring-purple-500 cursor-pointer"
                />
              </th>
              <th
                className="p-4 text-right text-sm font-semibold text-gray-700 cursor-pointer hover:bg-purple-100/50 transition-colors"
                onClick={() => onSort("assistantId")}
              >
                <div className="flex items-center gap-1">
                  رقم المساعد
                  <SortIcon field="assistantId" />
                </div>
              </th>
              <th
                className="p-4 text-right text-sm font-semibold text-gray-700 cursor-pointer hover:bg-purple-100/50 transition-colors"
                onClick={() => onSort("firstName")}
              >
                <div className="flex items-center gap-1">
                  الاسم
                  <SortIcon field="firstName" />
                </div>
              </th>
              <th className="p-4 text-right text-sm font-semibold text-gray-700">
                الحالة
              </th>
              <th className="p-4 text-right text-sm font-semibold text-gray-700">
                الجنس
              </th>
              <th
                className="p-4 text-right text-sm font-semibold text-gray-700 cursor-pointer hover:bg-purple-100/50 transition-colors"
                onClick={() => onSort("age")}
              >
                <div className="flex items-center gap-1">
                  العمر
                  <SortIcon field="age" />
                </div>
              </th>
              <th className="p-4 text-right text-sm font-semibold text-gray-700">
                رقم الهاتف
              </th>
              <th
                className="p-4 text-right text-sm font-semibold text-gray-700 cursor-pointer hover:bg-purple-100/50 transition-colors"
                onClick={() => onSort("email")}
              >
                <div className="flex items-center gap-1">
                  البريد الإلكتروني
                  <SortIcon field="email" />
                </div>
              </th>
              <th className="p-4 text-right text-sm font-semibold text-gray-700">
                الحلقات
              </th>
              <th className="p-4 text-right text-sm font-semibold text-gray-700">
                الإجراءات
              </th>
            </tr>
          </thead>
          <tbody>
            {assistants.map((assistant, index) => (
              <tr
                key={assistant._id}
                className={`border-b border-gray-100 hover:bg-purple-50/30 transition-colors ${
                  selectedIds.has(assistant._id) ? "bg-purple-50" : ""
                } ${index % 2 === 0 ? "bg-gray-50/30" : ""}`}
              >
                <td className="p-4">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(assistant._id)}
                    onChange={() => onToggleSelection(assistant._id)}
                    className="w-5 h-5 text-purple-600 bg-white border-gray-300 rounded focus:ring-purple-500 cursor-pointer"
                  />
                </td>
                <td className="p-4">
                  <span className="font-mono text-purple-600 font-semibold">
                    #{assistant.assistantId}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      {assistant.avatar?.url ? (
                        <img
                          src={assistant.avatar.url}
                          alt={assistant.firstName}
                          className="w-10 h-10 rounded-xl object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center">
                          {assistant.gender === 'male' || assistant.gender === 'ذكر' ? (
                            <FaMale className="w-5 h-5 text-purple-600" />
                          ) : (
                            <FaFemale className="w-5 h-5 text-purple-600" />
                          )}
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {assistant.firstName} {assistant.lastName}
                      </p>
                      {assistant.fatherName && (
                        <p className="text-xs text-gray-500">
                          {assistant.fatherName}
                        </p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-2.5 h-2.5 rounded-full ${
                        isOnline(assistant.lastSeen) ? "bg-green-500" : "bg-gray-400"
                      }`}
                    />
                    <span className="text-sm text-gray-600">
                      {isOnline(assistant.lastSeen) ? "متصل" : "غير متصل"}
                    </span>
                  </div>
                </td>
                <td className="p-4">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-sm ${
                      assistant.gender === 'male' || assistant.gender === 'ذكر'
                        ? "bg-blue-100 text-blue-700"
                        : "bg-pink-100 text-pink-700"
                    }`}
                  >
                    {assistant.gender === 'male' || assistant.gender === 'ذكر' ? (
                      <>
                        <FaMale className="w-3 h-3" />
                        ذكر
                      </>
                    ) : (
                      <>
                        <FaFemale className="w-3 h-3" />
                        أنثى
                      </>
                    )}
                  </span>
                </td>
                <td className="p-4">
                  <span className="text-gray-700">
                    {assistant.age ? `${assistant.age} سنة` : "-"}
                  </span>
                </td>
                <td className="p-4">
                  <span dir="ltr" className="text-gray-700 font-mono text-sm">
                    {assistant.phoneNumber}
                  </span>
                </td>
                <td className="p-4">
                  <span className="text-gray-700 text-sm">{assistant.email}</span>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4 text-gray-400" />
                    {assistant.allowedGroups && assistant.allowedGroups.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {assistant.allowedGroups.slice(0, 2).map((group) => (
                          <span
                            key={group._id}
                            className="px-2 py-0.5 bg-purple-50 text-purple-700 text-xs rounded"
                          >
                            {group.name}
                          </span>
                        ))}
                        {assistant.allowedGroups.length > 2 && (
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                            +{assistant.allowedGroups.length - 2}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-400 text-sm">-</span>
                    )}
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onEdit(assistant)}
                      className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                      title="تعديل"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(assistant)}
                      className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="حذف"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
