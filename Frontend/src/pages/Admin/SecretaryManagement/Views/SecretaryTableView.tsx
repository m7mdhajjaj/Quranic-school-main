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
}

export const SecretaryTableView: React.FC<SecretaryTableViewProps> = memo(({
  secretaries,
  onEdit,
  onDelete,
  sortField,
  sortOrder,
  onSort,
  isLoading = false,
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
  const SortableHeader = ({ field, children, className = "" }: { field: SortField; children: React.ReactNode; className?: string }) => (
    <th
      className={`px-6 py-4 font-bold text-sm whitespace-nowrap cursor-pointer hover:bg-white/10 group transition-colors ${className}`}
      onClick={() => onSort(field)}
    >
      <div className="flex items-center justify-center gap-1">
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
                #
              </th>
              <th className="px-4 py-4 text-center font-bold text-sm whitespace-nowrap w-12">
                {/* Expand Icon */}
              </th>
              <SortableHeader field="secretaryId" className="text-center">
                الرقم
              </SortableHeader>
              <SortableHeader field="firstName" className="text-right">
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
              <th className="px-6 py-4 text-center font-bold text-sm whitespace-nowrap w-32">
                الإجراءات
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
                  <tr className="hover:bg-gradient-to-r hover:from-emerald-50 hover:to-teal-50 transition-all duration-300">
                    {/* Row Number */}
                    <td className="px-3 py-4 text-center">
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-gray-100 text-gray-700 text-sm font-semibold">
                        {index + 1}
                      </span>
                    </td>

                    {/* Expand Button */}
                    <td className="px-4 py-4 text-center">
                      <button
                        onClick={() => toggleRow(secretary._id)}
                        className="p-2 hover:bg-emerald-100 rounded-lg transition-colors text-emerald-600"
                        title={isExpanded ? 'إخفاء التفاصيل' : 'عرض التفاصيل'}
                      >
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </button>
                    </td>

                    {/* Secretary ID */}
                    <td className="px-4 py-4 text-center">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                        {secretary.secretaryId}
                      </span>
                    </td>

                    {/* Name with Avatar */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar
                          user={{
                            _id: secretary._id,
                            firstName: secretary.firstName,
                            lastName: secretary.lastName,
                            gender: secretary.gender,
                            role: "secretary",
                            avatar: secretary.avatar,
                          }}
                          userName={`${secretary.firstName} ${secretary.lastName}`}
                          gender={secretary.gender as "male" | "female" | "ذكر" | "أنثى"}
                          size="sm"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-bold text-gray-900 truncate">
                            {secretary.firstName} {secretary.lastName}
                          </div>
                          {secretary.fatherName && (
                            <div className="text-xs text-gray-500 mt-0.5 truncate">
                              {secretary.fatherName}
                            </div>
                          )}
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
                      <div className="flex items-center justify-center gap-2">
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
                  </tr>

                  {/* Expanded Details Row */}
                  {isExpanded && (
                    <tr>
                      <td colSpan={10} className="px-6 py-6 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 border-t-2 border-emerald-300">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          {/* Personal Information Section */}
                          <div className="bg-white rounded-xl border-2 border-emerald-200 p-5 shadow-md">
                            <h4 className="text-base font-bold text-emerald-700 mb-4 pb-3 border-b-2 border-emerald-200 flex items-center gap-2">
                              <div className="w-1 h-6 bg-emerald-500 rounded-full"></div>
                              المعلومات الشخصية
                            </h4>

                            <div className="space-y-3">
                              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                                <span className="text-sm font-semibold text-gray-600">الاسم الكامل:</span>
                                <span className="text-sm font-bold text-gray-900 text-right">
                                  {secretary.firstName} {secretary.fatherName || ''} {secretary.grandFatherName || ''} {secretary.lastName}
                                </span>
                              </div>

                              {secretary.motherName && (
                                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                                  <span className="text-sm font-semibold text-gray-600">اسم الأم:</span>
                                  <span className="text-sm text-gray-900 text-right">{secretary.motherName}</span>
                                </div>
                              )}

                              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                                <span className="text-sm font-semibold text-gray-600 flex items-center gap-1">
                                  <CreditCard className="w-4 h-4" />
                                  رقم الهوية:
                                </span>
                                <span className="text-sm text-gray-900 font-mono" dir="ltr">
                                  {secretary.idNumber || <span className="text-gray-400">غير محدد</span>}
                                </span>
                              </div>

                              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                                <span className="text-sm font-semibold text-gray-600 flex items-center gap-1">
                                  <Calendar className="w-4 h-4" />
                                  تاريخ الميلاد:
                                </span>
                                <span className="text-sm text-gray-900">
                                  {secretary.birthDate || <span className="text-gray-400">غير محدد</span>}
                                </span>
                              </div>

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
                          <div className="bg-white rounded-xl border-2 border-teal-200 p-5 shadow-md">
                            <h4 className="text-base font-bold text-teal-700 mb-4 pb-3 border-b-2 border-teal-200 flex items-center gap-2">
                              <div className="w-1 h-6 bg-teal-500 rounded-full"></div>
                              الصلاحيات
                            </h4>

                            <div className="grid grid-cols-2 gap-3">
                              {/* canManageStudents */}
                              <div className={`flex items-center gap-2 p-2 rounded-lg ${
                                secretary.permissions?.canManageStudents ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-50 text-gray-400'
                              }`}>
                                <div className={`w-2 h-2 rounded-full ${secretary.permissions?.canManageStudents ? 'bg-emerald-500' : 'bg-gray-300'}`}></div>
                                <span className="text-sm font-medium">إدارة الطلاب</span>
                              </div>

                              {/* canManageAttendance */}
                              <div className={`flex items-center gap-2 p-2 rounded-lg ${
                                secretary.permissions?.canManageAttendance ? 'bg-teal-50 text-teal-700' : 'bg-gray-50 text-gray-400'
                              }`}>
                                <div className={`w-2 h-2 rounded-full ${secretary.permissions?.canManageAttendance ? 'bg-teal-500' : 'bg-gray-300'}`}></div>
                                <span className="text-sm font-medium">إدارة الحضور</span>
                              </div>

                              {/* canManageNews */}
                              <div className={`flex items-center gap-2 p-2 rounded-lg ${
                                secretary.permissions?.canManageNews ? 'bg-cyan-50 text-cyan-700' : 'bg-gray-50 text-gray-400'
                              }`}>
                                <div className={`w-2 h-2 rounded-full ${secretary.permissions?.canManageNews ? 'bg-cyan-500' : 'bg-gray-300'}`}></div>
                                <span className="text-sm font-medium">إدارة الأخبار</span>
                              </div>

                              {/* canViewReports */}
                              <div className={`flex items-center gap-2 p-2 rounded-lg ${
                                secretary.permissions?.canViewReports ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-400'
                              }`}>
                                <div className={`w-2 h-2 rounded-full ${secretary.permissions?.canViewReports ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                <span className="text-sm font-medium">عرض التقارير</span>
                              </div>

                              {/* canManageTimetable */}
                              <div className={`flex items-center gap-2 p-2 rounded-lg ${
                                secretary.permissions?.canManageTimetable ? 'bg-lime-50 text-lime-700' : 'bg-gray-50 text-gray-400'
                              }`}>
                                <div className={`w-2 h-2 rounded-full ${secretary.permissions?.canManageTimetable ? 'bg-lime-500' : 'bg-gray-300'}`}></div>
                                <span className="text-sm font-medium">إدارة الجداول</span>
                              </div>

                              {/* canManageMessages */}
                              <div className={`flex items-center gap-2 p-2 rounded-lg ${
                                secretary.permissions?.canManageMessages ? 'bg-sky-50 text-sky-700' : 'bg-gray-50 text-gray-400'
                              }`}>
                                <div className={`w-2 h-2 rounded-full ${secretary.permissions?.canManageMessages ? 'bg-sky-500' : 'bg-gray-300'}`}></div>
                                <span className="text-sm font-medium">إدارة الرسائل</span>
                              </div>
                            </div>

                            {/* Contact Info */}
                            <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Mail className="w-4 h-4 text-emerald-500" />
                                <span dir="ltr">{secretary.email}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Phone className="w-4 h-4 text-emerald-500" />
                                <span dir="ltr">{secretary.phoneNumber}</span>
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
