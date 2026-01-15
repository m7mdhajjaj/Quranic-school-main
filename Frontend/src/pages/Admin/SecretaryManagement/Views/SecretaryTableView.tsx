import React, { memo, useState } from "react";
import { Edit2, Trash2, ChevronDown, ChevronUp, Mail, Phone, MapPin, Calendar, Shield, CreditCard } from "lucide-react";
import Avatar from "@/components/Avatar/Avatar";
import type { Secretary, SortField, SortOrder } from "../types";

interface SecretaryTableViewProps {
  secretaries: Secretary[];
  onEdit: (secretary: Secretary) => void;
  onDelete: (secretary: Secretary) => void;
  sortField: SortField;
  sortOrder: SortOrder;
  onSort: (field: SortField) => void;
  isLoading?: boolean;
  selectedIds?: Set<string>;
  onToggleSelection?: (id: string) => void;
  onToggleSelectAll?: () => void;
}

export const SecretaryTableView: React.FC<SecretaryTableViewProps> = memo(({
  secretaries,
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
  const allSelected = secretaries.length > 0 && selectedIds.size === secretaries.length;

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
  if (secretaries.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden p-8" dir="rtl">
        <div className="flex flex-col items-center justify-center gap-3 h-64">
          <div className="text-6xl opacity-30">📭</div>
          <div className="text-gray-500 font-medium text-lg">لا يوجد سكرتيرين</div>
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

  // Count active permissions
  const countPermissions = (permissions: Secretary['permissions']) => {
    if (!permissions) return 0;
    return Object.values(permissions).filter(Boolean).length;
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden" dir="rtl">
      <div className="overflow-x-auto">
        <table className="w-full">
          {/* Table Header */}
          <thead className="bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 text-white shadow-lg">
            <tr>
              <th className="px-3 py-4 text-center font-bold text-sm whitespace-nowrap w-12">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={onToggleSelectAll}
                  className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                />
              </th>
              <th className="px-3 py-4 text-center font-bold text-sm whitespace-nowrap w-12">
                #
              </th>
              <SortableHeader field="firstName" className="text-right" justify="start">
                الاسم الكامل
              </SortableHeader>
              <th className="px-6 py-4 text-center font-bold text-sm whitespace-nowrap">
                البريد الإلكتروني
              </th>
              <th className="px-6 py-4 text-center font-bold text-sm whitespace-nowrap">
                رقم الهاتف
              </th>
              <th className="px-6 py-4 text-center font-bold text-sm whitespace-nowrap">
                الجنس
              </th>
              <SortableHeader field="age" className="text-center">
                العمر
              </SortableHeader>
              <th className="px-6 py-4 text-center font-bold text-sm whitespace-nowrap">
                الصلاحيات
              </th>
              <th className="px-6 py-4 text-center font-bold text-sm whitespace-nowrap w-28">
                الإجراءات
              </th>
              <th className="px-3 py-4 text-center font-bold text-sm whitespace-nowrap w-12">
                {/* Expand */}
              </th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-emerald-100/50">
            {secretaries.map((secretary, index) => {
              const isExpanded = isRowExpanded(secretary._id);
              const permissionCount = countPermissions(secretary.permissions);

              return (
                <React.Fragment key={secretary._id}>
                  {/* Main Row */}
                  <tr className={`hover:bg-gradient-to-r hover:from-emerald-50 hover:to-teal-50 transition-all duration-300 ${selectedIds.has(secretary._id) ? 'bg-emerald-50' : ''}`}>
                    {/* Checkbox */}
                    <td className="px-3 py-4 text-center">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(secretary._id)}
                        onChange={() => onToggleSelection?.(secretary._id)}
                        className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                      />
                    </td>
                    
                    {/* Row Number */}
                    <td className="px-3 py-4 text-center">
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-gray-100 text-gray-700 text-sm font-semibold">
                        {index + 1}
                      </span>
                    </td>

                    {/* Name with Avatar */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {/* Avatar removed as requested */}
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-bold text-gray-900">
                            {[secretary.firstName, secretary.fatherName, secretary.lastName].filter(Boolean).join(' ')}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="px-6 py-4 text-center">
                      <span className="text-sm text-gray-900" dir="ltr">
                        {secretary.email || <span className="text-gray-400">-</span>}
                      </span>
                    </td>

                    {/* Phone */}
                    <td className="px-6 py-4 text-center">
                      <span className="text-sm text-gray-900 font-mono" dir="ltr">
                        {secretary.phoneNumber || <span className="text-gray-400">-</span>}
                      </span>
                    </td>

                    {/* Gender */}
                    <td className="px-6 py-4 text-center">
                      {secretary.gender ? (
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            secretary.gender === 'ذكر' || secretary.gender === 'male'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-teal-100 text-teal-800'
                          }`}
                        >
                          {secretary.gender === "male" ? "ذكر" : secretary.gender === "female" ? "أنثى" : secretary.gender}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>

                    {/* Age */}
                    <td className="px-6 py-4 text-center">
                      {secretary.age ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-semibold">
                          {secretary.age} سنة
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>

                    {/* Permissions Count */}
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium border ${
                        permissionCount >= 4 
                          ? 'bg-green-50 text-green-700 border-green-200' 
                          : permissionCount >= 2 
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-red-50 text-red-700 border-red-200'
                      }`}>
                        <Shield className="w-3 h-3" />
                        <span>{permissionCount} صلاحيات</span>
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => onEdit(secretary)}
                          className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                          title="تعديل"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDelete(secretary)}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                          title="حذف"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>

                    {/* Expand Button */}
                    <td className="px-3 py-4 text-center">
                      <button
                        onClick={() => toggleRow(secretary._id)}
                        className={`p-2 rounded-lg transition-colors ${
                          isExpanded 
                            ? 'bg-emerald-100 text-emerald-600' 
                            : 'hover:bg-gray-100 text-gray-400'
                        }`}
                        title={isExpanded ? 'إخفاء التفاصيل' : 'عرض التفاصيل'}
                      >
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </button>
                    </td>
                  </tr>

                  {/* Expanded Details Row */}
                  {isExpanded && (
                    <tr>
                      <td colSpan={9} className="px-4 py-4 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 border-t-2 border-emerald-300">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          {/* Personal Information Section */}
                          <div className="bg-white rounded-xl border border-emerald-200 p-4 shadow-sm">
                            <h4 className="text-sm font-bold text-emerald-700 mb-3 pb-2 border-b border-emerald-200 flex items-center gap-2">
                              <div className="w-1 h-5 bg-emerald-500 rounded-full"></div>
                              المعلومات الشخصية
                            </h4>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 text-sm">
                              {/* رقم السكرتير */}
                              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                                <span className="text-sm font-semibold text-gray-600 flex items-center gap-1">
                                  <Shield className="w-4 h-4" />
                                  رقم السكرتير:
                                </span>
                                <span className="text-sm font-bold text-emerald-700">
                                  {secretary.secretaryId}
                                </span>
                              </div>

                              {/* حالة الاتصال */}
                              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                                <span className="text-sm font-semibold text-gray-600">حالة الاتصال:</span>
                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                  secretary.lastSeen && new Date(secretary.lastSeen).getTime() > Date.now() - 5 * 60 * 1000 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-gray-100 text-gray-800'
                                }`}>
                                  <span className={`w-1.5 h-1.5 rounded-full ml-1.5 ${
                                    secretary.lastSeen && new Date(secretary.lastSeen).getTime() > Date.now() - 5 * 60 * 1000 
                                    ? 'bg-green-500' 
                                    : 'bg-gray-400'
                                  }`}></span>
                                  {secretary.lastSeen && new Date(secretary.lastSeen).getTime() > Date.now() - 5 * 60 * 1000 ? 'متصل' : 'غير متصل'}
                                </span>
                              </div>

                              {/* الاسم الكامل */}
                              <div className="flex items-center justify-start gap-4 py-2 border-b border-gray-100 col-span-1 md:col-span-2">
                                <span className="text-sm font-semibold text-gray-600">الاسم الكامل:</span>
                                <span className="text-sm font-bold text-gray-900">
                                  {[secretary.firstName, secretary.fatherName, secretary.grandFatherName, secretary.lastName].filter(Boolean).join(' ')}
                                </span>
                              </div>

                              {/* اسم الجد */}
                              {secretary.grandFatherName && (
                                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                                  <span className="text-sm font-semibold text-gray-600">اسم الجد:</span>
                                  <span className="text-sm text-gray-900 text-right">{secretary.grandFatherName}</span>
                                </div>
                              )}

                              {/* اسم الأم */}
                              {secretary.motherName && (
                                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                                  <span className="text-sm font-semibold text-gray-600">اسم الأم:</span>
                                  <span className="text-sm text-gray-900 text-right">{secretary.motherName}</span>
                                </div>
                              )}

                              {/* رقم الهوية */}
                              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                                <span className="text-sm font-semibold text-gray-600 flex items-center gap-1">
                                  <CreditCard className="w-4 h-4" />
                                  رقم الهوية:
                                </span>
                                <span className="text-sm text-gray-900 font-mono" dir="ltr">
                                  {secretary.idNumber || <span className="text-gray-400">غير محدد</span>}
                                </span>
                              </div>

                              {/* البريد الإلكتروني */}
                              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                                <span className="text-sm font-semibold text-gray-600 flex items-center gap-1">
                                  <Mail className="w-4 h-4" />
                                  البريد الإلكتروني:
                                </span>
                                <span className="text-sm text-gray-900" dir="ltr">
                                  {secretary.email || <span className="text-gray-400">غير محدد</span>}
                                </span>
                              </div>

                              {/* رقم الهاتف */}
                              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                                <span className="text-sm font-semibold text-gray-600 flex items-center gap-1">
                                  <Phone className="w-4 h-4" />
                                  رقم الهاتف:
                                </span>
                                <span className="text-sm text-gray-900 font-mono" dir="ltr">
                                  {secretary.phoneNumber || <span className="text-gray-400">غير محدد</span>}
                                </span>
                              </div>

                              {/* تاريخ الميلاد */}
                              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                                <span className="text-sm font-semibold text-gray-600 flex items-center gap-1">
                                  <Calendar className="w-4 h-4" />
                                  تاريخ الميلاد:
                                </span>
                                <span className="text-sm text-gray-900">
                                  {secretary.birthDate || <span className="text-gray-400">غير محدد</span>}
                                  {secretary.age && <span className="text-gray-500 mr-2">({secretary.age} سنة)</span>}
                                </span>
                              </div>

                              {/* الجنس */}
                              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                                <span className="text-sm font-semibold text-gray-600">الجنس:</span>
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  secretary.gender === 'ذكر' || secretary.gender === 'male'
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-pink-100 text-pink-800'
                                }`}>
                                  {secretary.gender === "male" ? "ذكر" : secretary.gender === "female" ? "أنثى" : secretary.gender}
                                </span>
                              </div>

                              {/* مكان الإقامة */}
                              <div className="flex items-center justify-between py-2">
                                <span className="text-sm font-semibold text-gray-600 flex items-center gap-1">
                                  <MapPin className="w-4 h-4" />
                                  مكان الإقامة:
                                </span>
                                <span className="text-sm text-gray-900 text-right">
                                  {secretary.residence || <span className="text-gray-400">غير محدد</span>}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Permissions Section */}
                          <div className="bg-white rounded-xl border border-teal-200 p-4 shadow-sm">
                            <h4 className="text-sm font-bold text-teal-700 mb-3 pb-2 border-b border-teal-200 flex items-center gap-2">
                              <div className="w-1 h-5 bg-teal-500 rounded-full"></div>
                              الصلاحيات
                            </h4>

                            <div className="grid grid-cols-3 gap-2">
                              {/* canManageStudents */}
                              <div className={`flex items-center gap-1.5 p-1.5 rounded-lg text-xs ${
                                secretary.permissions?.canManageStudents ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-50 text-gray-400'
                              }`}>
                                <div className={`w-1.5 h-1.5 rounded-full ${secretary.permissions?.canManageStudents ? 'bg-emerald-500' : 'bg-gray-300'}`}></div>
                                <span className="font-medium">إدارة الطلاب</span>
                              </div>

                              {/* canManageAttendance */}
                              <div className={`flex items-center gap-1.5 p-1.5 rounded-lg text-xs ${
                                secretary.permissions?.canManageAttendance ? 'bg-teal-50 text-teal-700' : 'bg-gray-50 text-gray-400'
                              }`}>
                                <div className={`w-1.5 h-1.5 rounded-full ${secretary.permissions?.canManageAttendance ? 'bg-teal-500' : 'bg-gray-300'}`}></div>
                                <span className="font-medium">إدارة الحضور</span>
                              </div>

                              {/* canManageNews */}
                              <div className={`flex items-center gap-1.5 p-1.5 rounded-lg text-xs ${
                                secretary.permissions?.canManageNews ? 'bg-cyan-50 text-cyan-700' : 'bg-gray-50 text-gray-400'
                              }`}>
                                <div className={`w-1.5 h-1.5 rounded-full ${secretary.permissions?.canManageNews ? 'bg-cyan-500' : 'bg-gray-300'}`}></div>
                                <span className="font-medium">إدارة الأخبار</span>
                              </div>

                              {/* canViewReports */}
                              <div className={`flex items-center gap-1.5 p-1.5 rounded-lg text-xs ${
                                secretary.permissions?.canViewReports ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-400'
                              }`}>
                                <div className={`w-1.5 h-1.5 rounded-full ${secretary.permissions?.canViewReports ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                <span className="font-medium">عرض التقارير</span>
                              </div>

                              {/* canManageTimetable */}
                              <div className={`flex items-center gap-1.5 p-1.5 rounded-lg text-xs ${
                                secretary.permissions?.canManageTimetable ? 'bg-lime-50 text-lime-700' : 'bg-gray-50 text-gray-400'
                              }`}>
                                <div className={`w-1.5 h-1.5 rounded-full ${secretary.permissions?.canManageTimetable ? 'bg-lime-500' : 'bg-gray-300'}`}></div>
                                <span className="font-medium">إدارة الجداول</span>
                              </div>

                              {/* canManageMessages */}
                              <div className={`flex items-center gap-1.5 p-1.5 rounded-lg text-xs ${
                                secretary.permissions?.canManageMessages ? 'bg-sky-50 text-sky-700' : 'bg-gray-50 text-gray-400'
                              }`}>
                                <div className={`w-1.5 h-1.5 rounded-full ${secretary.permissions?.canManageMessages ? 'bg-sky-500' : 'bg-gray-300'}`}></div>
                                <span className="font-medium">إدارة الرسائل</span>
                              </div>
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

SecretaryTableView.displayName = "SecretaryTableView";

export default SecretaryTableView;
