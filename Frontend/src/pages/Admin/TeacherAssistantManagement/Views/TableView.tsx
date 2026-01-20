import React, { memo, useState, useContext } from "react";
import { Edit2, Trash2, ChevronDown, ChevronUp, HandHelping, Users } from "lucide-react";
import { UserStatusContext } from "@/Context/UserStatusContext";
import type { TeacherAssistant, SortField, SortOrder } from "../types";

interface AssistantTableViewProps {
  assistants: TeacherAssistant[];
  onEdit: (assistant: TeacherAssistant) => void;
  onDelete: (assistant: TeacherAssistant) => void;
  sortField: SortField;
  sortOrder: SortOrder;
  onSort: (field: SortField) => void;
  isLoading?: boolean;
  selectedIds?: Set<string>;
  onToggleSelection?: (id: string) => void;
  onToggleSelectAll?: () => void;
}

export const AssistantTableView: React.FC<AssistantTableViewProps> = memo(({
  assistants,
  onEdit,
  onDelete,
  sortField,
  sortOrder,
  onSort,
  isLoading = false,
  selectedIds = new Set(),
  onToggleSelection,
  onToggleSelectAll,
}) => {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  
  // استخدام UserStatusContext للحصول على حالة real-time
  const userStatusContext = useContext(UserStatusContext);
  const isUserOnline = userStatusContext?.isUserOnline || (() => false);

  const toggleRow = (id: string) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const isRowExpanded = (id: string) => expandedRows.has(id);
  const allSelected = assistants.length > 0 && selectedIds.size === assistants.length;

  // Loading State
  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden p-8" dir="rtl">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-3 border-emerald-600 border-t-transparent"></div>
        </div>
      </div>
    );
  }

  // Empty State
  if (assistants.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden p-8" dir="rtl">
        <div className="flex flex-col items-center justify-center gap-3 h-64">
          <div className="text-6xl opacity-30">📭</div>
          <div className="text-gray-500 font-medium text-lg">لا يوجد مساعدين</div>
        </div>
      </div>
    );
  }

  // Sort Icon Component
  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <ChevronUp className="w-3 h-3 text-white/50 group-hover:text-white/80" />;
    }
    return sortOrder === "asc" ? (
      <ChevronUp className="w-4 h-4 text-white" />
    ) : (
      <ChevronDown className="w-4 h-4 text-white" />
    );
  };

  // Sortable Header Component
  const SortableHeader = ({ field, children, className = "", justify = "center" }: { field: SortField; children: React.ReactNode; className?: string; justify?: "center" | "start" | "end" }) => (
    <th
      className={`px-6 py-4 font-bold text-sm whitespace-nowrap cursor-pointer hover:bg-white/10 group transition-colors ${className}`}
      onClick={() => onSort(field)}
    >
      <div className={`flex items-center gap-1 ${justify === "start" ? "justify-start" : justify === "end" ? "justify-end" : "justify-center"}`}>
        {children}
        <SortIcon field={field} />
      </div>
    </th>
  );

  // Count allowed groups
  const countGroups = (allowedGroups?: TeacherAssistant['allowedGroups']) => {
    return allowedGroups?.length || 0;
  };

  return (
    <div className="bg-white rounded-lg sm:rounded-2xl shadow-lg sm:shadow-xl overflow-hidden" dir="rtl">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px]">
          {/* Table Header */}
          <thead className="bg-gradient-to-r from-emerald-600 via-teal-700 to-slate-700 text-white shadow-lg">
            <tr>
              <th className="px-2 sm:px-3 py-3 sm:py-4 text-center font-bold text-xs sm:text-sm whitespace-nowrap w-10 sm:w-12">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={onToggleSelectAll}
                  className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                  aria-label="تحديد الكل"
                  title="تحديد الكل"
                />
              </th>
              <th className="px-2 sm:px-3 py-3 sm:py-4 text-center font-bold text-xs sm:text-sm whitespace-nowrap w-10 sm:w-12">
                #
              </th>
              <SortableHeader field="firstName" className="text-right" justify="start">
                الاسم الكامل
              </SortableHeader>
              <th className="px-3 sm:px-6 py-3 sm:py-4 text-center font-bold text-xs sm:text-sm whitespace-nowrap hidden md:table-cell">
                البريد الإلكتروني
              </th>
              <th className="px-3 sm:px-6 py-3 sm:py-4 text-center font-bold text-xs sm:text-sm whitespace-nowrap">
                رقم الهاتف
              </th>
              <th className="px-3 sm:px-6 py-3 sm:py-4 text-center font-bold text-xs sm:text-sm whitespace-nowrap hidden sm:table-cell">
                الجنس
              </th>
              <SortableHeader field="age" className="text-center">
                العمر
              </SortableHeader>
              <th className="px-3 sm:px-6 py-3 sm:py-4 text-center font-bold text-xs sm:text-sm whitespace-nowrap hidden lg:table-cell">
                الحلقات
              </th>
              <th className="px-3 sm:px-6 py-3 sm:py-4 text-center font-bold text-xs sm:text-sm whitespace-nowrap w-20 sm:w-28">
                الإجراءات
              </th>
              <th className="px-2 sm:px-3 py-3 sm:py-4 text-center font-bold text-xs sm:text-sm whitespace-nowrap w-10 sm:w-12">
                {/* Expand */}
              </th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-emerald-100/50">
            {assistants.map((assistant, index) => {
              const isExpanded = isRowExpanded(assistant._id);
              const groupsCount = countGroups(assistant.allowedGroups);

              return (
                <React.Fragment key={assistant._id}>
                  {/* Main Row */}
                  <tr className={`hover:bg-gradient-to-r hover:from-emerald-50 hover:to-teal-50 transition-all duration-300 ${selectedIds.has(assistant._id) ? 'bg-emerald-50' : ''}`}>
                    {/* Checkbox */}
                    <td className="px-2 sm:px-3 py-3 sm:py-4 text-center">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(assistant._id)}
                        onChange={() => onToggleSelection?.(assistant._id)}
                        className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                        aria-label={`تحديد ${assistant.firstName} ${assistant.lastName}`}
                        title={`تحديد ${assistant.firstName} ${assistant.lastName}`}
                      />
                    </td>
                    
                    {/* Row Number */}
                    <td className="px-2 sm:px-3 py-3 sm:py-4 text-center">
                      <span className="inline-flex items-center justify-center w-5 h-5 sm:w-7 sm:h-7 rounded-full bg-gray-100 text-gray-700 text-xs sm:text-sm font-semibold">
                        {index + 1}
                      </span>
                    </td>

                    {/* Name with Avatar */}
                    <td className="px-3 sm:px-6 py-3 sm:py-4">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="text-xs sm:text-sm font-bold text-gray-900 truncate">
                            {[assistant.firstName, assistant.fatherName, assistant.lastName].filter(Boolean).join(' ')}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Email - Hidden on mobile */}
                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-center hidden md:table-cell">
                      <span className="text-xs sm:text-sm text-gray-900" dir="ltr">
                        {assistant.email || <span className="text-gray-400">-</span>}
                      </span>
                    </td>

                    {/* Phone */}
                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-center">
                      <span className="text-xs sm:text-sm text-gray-900 font-mono" dir="ltr">
                        {assistant.phoneNumber || <span className="text-gray-400">-</span>}
                      </span>
                    </td>

                    {/* Gender - Hidden on mobile */}
                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-center hidden sm:table-cell">
                      {assistant.gender ? (
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium ${
                            assistant.gender === 'ذكر' || assistant.gender === 'male'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-pink-100 text-pink-800'
                          }`}
                        >
                          {assistant.gender === "male" ? "ذكر" : assistant.gender === "female" ? "أنثى" : assistant.gender}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>

                    {/* Age */}
                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-center">
                      {assistant.age ? (
                        <span className="inline-flex items-center px-2 py-0.5 sm:px-3 sm:py-1 rounded-full bg-amber-100 text-amber-800 text-[10px] sm:text-xs font-semibold">
                          {assistant.age}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>

                    {/* Groups Count - Hidden on mobile/tablet */}
                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-center hidden lg:table-cell">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium border ${
                        groupsCount >= 1 
                          ? 'bg-green-50 text-green-700 border-green-200' 
                          : 'bg-red-50 text-red-700 border-red-200'
                      }`}>
                        <Users className="w-3 h-3" />
                        <span>{groupsCount > 0 ? `${groupsCount} حلقة` : 'بدون حلقة'}</span>
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-3 sm:px-6 py-3 sm:py-4">
                      <div className="flex items-center justify-center gap-0.5 sm:gap-1">
                        <button
                          onClick={() => onEdit(assistant)}
                          className="p-1.5 sm:p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                          title="تعديل"
                        >
                          <Edit2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </button>
                        <button
                          onClick={() => onDelete(assistant)}
                          className="p-1.5 sm:p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                          title="حذف"
                        >
                          <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </button>
                      </div>
                    </td>

                    {/* Expand Button */}
                    <td className="px-2 sm:px-3 py-3 sm:py-4 text-center">
                      <button
                        onClick={() => toggleRow(assistant._id)}
                        className={`p-1.5 sm:p-2 rounded-lg transition-colors ${
                          isExpanded 
                            ? 'bg-emerald-100 text-emerald-600' 
                            : 'hover:bg-gray-100 text-gray-400'
                        }`}
                        title={isExpanded ? 'إخفاء التفاصيل' : 'عرض التفاصيل'}
                      >
                        {isExpanded ? (
                          <ChevronUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        )}
                      </button>
                    </td>
                  </tr>

                  {/* Expanded Details Row */}
                  {isExpanded && (
                    <tr>
                      <td colSpan={10} className="px-2 sm:px-4 py-3 sm:py-4 bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-50 border-t-2 border-emerald-300">
                        {/* Two columns layout */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 mb-3 sm:mb-4">
                          {/* Right Side - المعلومات الشخصية */}
                          <div className="bg-white rounded-lg sm:rounded-xl border border-emerald-200 p-3 sm:p-4 shadow-sm">
                            <h4 className="text-xs sm:text-sm font-bold text-emerald-700 mb-2 sm:mb-3 pb-2 border-b border-emerald-200 flex items-center gap-2">
                              <div className="w-1 h-4 sm:h-5 bg-emerald-500 rounded-full"></div>
                              المعلومات الشخصية
                            </h4>

                            <div className="space-y-2 sm:space-y-3">
                              {/* رقم المستخدم */}
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-semibold text-gray-600">رقم المستخدم:</span>
                                <span className="text-sm font-bold text-emerald-700 font-mono" dir="ltr">
                                  {assistant.assistantId || <span className="text-gray-400">-</span>}
                                </span>
                              </div>

                              {/* الاسم الكامل */}
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-semibold text-gray-600">الاسم الكامل:</span>
                                <span className="text-sm font-bold text-gray-900">
                                  {[assistant.firstName, assistant.fatherName, assistant.grandFatherName, assistant.lastName].filter(Boolean).join(' ')}
                                </span>
                              </div>

                              {/* اسم الأم */}
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-semibold text-gray-600">اسم الأم:</span>
                                <span className="text-sm text-gray-900">
                                  {assistant.motherName || <span className="text-gray-400">-</span>}
                                </span>
                              </div>

                              {/* رقم الهوية */}
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-semibold text-gray-600">رقم الهوية:</span>
                                <span className="text-sm text-gray-900 font-mono" dir="ltr">
                                  {assistant.idNumber || <span className="text-gray-400">-</span>}
                                </span>
                              </div>

                              {/* العمر */}
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-semibold text-gray-600">العمر:</span>
                                {assistant.age ? (
                                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-semibold">
                                    {assistant.age} سنة
                                  </span>
                                ) : (
                                  <span className="text-gray-400">-</span>
                                )}
                              </div>

                              {/* تاريخ الميلاد */}
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-semibold text-gray-600">تاريخ الميلاد:</span>
                                <span className="text-sm text-gray-900">
                                  {assistant.birthDate ? new Date(assistant.birthDate).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'Asia/Jerusalem' }) : <span className="text-gray-400">-</span>}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Left Side - معلومات التواصل */}
                          <div className="bg-white rounded-xl border border-teal-200 p-4 shadow-sm">
                            <h4 className="text-sm font-bold text-teal-700 mb-3 pb-2 border-b border-teal-200 flex items-center gap-2">
                              <div className="w-1 h-5 bg-teal-500 rounded-full"></div>
                              معلومات التواصل
                            </h4>

                            <div className="space-y-3">
                              {/* البريد الإلكتروني */}
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-semibold text-gray-600">البريد الإلكتروني:</span>
                                <span className="text-sm text-gray-900" dir="ltr">
                                  {assistant.email || <span className="text-gray-400">-</span>}
                                </span>
                              </div>

                              {/* رقم الهاتف */}
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-semibold text-gray-600">رقم الهاتف:</span>
                                <span className="text-sm text-gray-900 font-mono" dir="ltr">
                                  {assistant.phoneNumber || <span className="text-gray-400">-</span>}
                                </span>
                              </div>

                              {/* مكان السكن */}
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-semibold text-gray-600">مكان السكن:</span>
                                <span className="text-sm text-gray-900">
                                  {assistant.residence || <span className="text-gray-400">-</span>}
                                </span>
                              </div>

                              {/* حالة النشاط */}
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-semibold text-gray-600">حالة النشاط:</span>
                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                  isUserOnline(assistant._id)
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-gray-100 text-gray-800'
                                }`}>
                                  <span className={`w-1.5 h-1.5 rounded-full ml-1.5 ${
                                    isUserOnline(assistant._id)
                                    ? 'bg-green-500' 
                                    : 'bg-gray-400'
                                  }`}></span>
                                  {isUserOnline(assistant._id) ? 'متصل' : 'غير متصل'}
                                </span>
                              </div>

                              {/* آخر ظهور */}
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-semibold text-gray-600">آخر ظهور:</span>
                                <span className="text-sm text-gray-900">
                                  {assistant.lastSeen 
                                    ? new Date(assistant.lastSeen).toLocaleString('ar-EG', { dateStyle: 'short', timeStyle: 'short', timeZone: 'Asia/Jerusalem' })
                                    : <span className="text-gray-400">-</span>
                                  }
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Allowed Groups Section - Compact */}
                        <div className="bg-white rounded-xl border border-emerald-200 p-3 shadow-sm">
                          <div className="flex items-center gap-4">
                            <h4 className="text-sm font-bold text-emerald-700 flex items-center gap-2 whitespace-nowrap">
                              <HandHelping className="w-4 h-4" />
                              الحلقات المسموحة:
                            </h4>
                            
                            <div className="flex items-center gap-2 flex-wrap">
                              {assistant.allowedGroups && assistant.allowedGroups.length > 0 ? (
                                assistant.allowedGroups.map((group) => (
                                  <span
                                    key={group._id}
                                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700"
                                  >
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                    {group.name}
                                  </span>
                                ))
                              ) : (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-400">
                                  <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
                                  لا توجد حلقات مسموحة
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
});

AssistantTableView.displayName = "AssistantTableView";

// Backward compatibility alias
export const TableView = AssistantTableView;
