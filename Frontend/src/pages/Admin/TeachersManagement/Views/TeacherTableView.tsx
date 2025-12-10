import React from 'react';
import { FaEdit, FaTrash, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import type { Teacher } from '@/Api/teacherApi';
import { useExpandableRows } from '../hooks/useExpandableRows';
import {
  getGroupDisplayName,
  getTeacherFullName,
  formatDateArabic,
  formatDateTimeArabic,
  getActivityStatus,
} from '../utils/teacherHelpers';

interface TeacherTableViewProps {
  teachers: Teacher[];
  onEdit: (teacher: Teacher) => void;
  onDelete: (teacher: Teacher) => void;
  isLoading?: boolean;
  onSort?: (field: string) => void;
  sortField?: string;
  sortOrder?: 'asc' | 'desc';
  selectedTeachers?: Set<string>;
  onToggleTeacher?: (teacherId: string) => void;
  onToggleAll?: () => void;
}

export const TeacherTableView: React.FC<TeacherTableViewProps> = ({
  teachers,
  onEdit,
  onDelete,
  isLoading = false,
  selectedTeachers,
  onToggleTeacher,
  onToggleAll,
}) => {
  const { toggleRow, isRowExpanded } = useExpandableRows();
  const allSelected = selectedTeachers && teachers.length > 0 && teachers.every(t => selectedTeachers.has(t._id || ""));

  if (isLoading) {
    return (
      <div
        className="bg-white rounded-2xl shadow-xl overflow-hidden p-8"
        dir="rtl"
      >
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-3 border-emerald-600 border-t-transparent"></div>
        </div>
      </div>
    );
  }

  if (teachers.length === 0) {
    return (
      <div
        className="bg-white rounded-2xl shadow-xl overflow-hidden p-8"
        dir="rtl"
      >
        <div className="flex flex-col items-center justify-center gap-3 h-64">
          <div className="text-6xl opacity-30">📭</div>
          <div className="text-gray-500 font-medium text-lg">
            لا يوجد معلمين
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden" dir="rtl">
      <div className="overflow-x-auto">
        <table className="w-full">
          {/* Table Header */}
          <thead className="bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 text-white shadow-lg">
            <tr>
              {selectedTeachers && onToggleTeacher && onToggleAll && (
                <th className="px-4 py-4 text-center font-bold text-sm whitespace-nowrap w-12">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={onToggleAll}
                    className="w-4 h-4 text-white border-white rounded focus:ring-white cursor-pointer"
                    aria-label="تحديد جميع المعلمين"
                  />
                </th>
              )}
              <th className="px-4 py-4 text-center font-bold text-sm whitespace-nowrap w-12">
                {/* Expand Icon */}
              </th>
              <th className="px-4 py-4 text-center font-bold text-sm whitespace-nowrap">
                رقم المعلم
              </th>
              <th className="px-6 py-4 text-right font-bold text-sm whitespace-nowrap">
                الاسم الكامل
              </th>
              <th className="px-6 py-4 text-center font-bold text-sm whitespace-nowrap">
                البريد الإلكتروني
              </th>
              <th className="px-6 py-4 text-center font-bold text-sm whitespace-nowrap">
                رقم الهاتف
              </th>
              <th className="px-6 py-4 text-center font-bold text-sm whitespace-nowrap">
                الجنس
              </th>
              <th className="px-6 py-4 text-center font-bold text-sm whitespace-nowrap">
                الحلقات المدرسة
              </th>
              <th className="px-6 py-4 text-center font-bold text-sm whitespace-nowrap w-32">
                الإجراءات
              </th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-emerald-100/50">
            {teachers.map((teacher) => {
              const isExpanded = isRowExpanded(teacher._id);

              return (
                <React.Fragment key={teacher._id}>
                  {/* Main Row */}
                  <tr className="hover:bg-gradient-to-r hover:from-emerald-50 hover:to-teal-50 transition-all duration-300">
                    {/* Checkbox */}
                    {selectedTeachers && onToggleTeacher && (
                      <td className="px-4 py-4 text-center">
                        <input
                          type="checkbox"
                          checked={selectedTeachers.has(teacher._id || "")}
                          onChange={() => onToggleTeacher(teacher._id || "")}
                          className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500 cursor-pointer"
                          aria-label={`تحديد ${teacher.firstName} ${teacher.lastName}`}
                        />
                      </td>
                    )}
                    
                    {/* Expand Button */}
                    <td className="px-4 py-4 text-center">
                      <button
                        onClick={() => toggleRow(teacher._id)}
                        className="p-2 hover:bg-emerald-100 rounded-lg transition-colors text-emerald-600"
                        title={isExpanded ? 'إخفاء التفاصيل' : 'عرض التفاصيل'}
                      >
                        {isExpanded ? (
                          <FaChevronUp className="w-4 h-4" />
                        ) : (
                          <FaChevronDown className="w-4 h-4" />
                        )}
                      </button>
                    </td>

                    {/* Teacher ID */}
                    <td className="px-4 py-4 text-center">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {teacher.teacherId}
                      </span>
                    </td>

                    {/* Name */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-bold text-gray-900 truncate">
                            {teacher.firstName} {teacher.lastName}
                          </div>
                          {teacher.fatherName && (
                            <div className="text-xs text-gray-500 mt-0.5 truncate">
                              {teacher.fatherName}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="px-6 py-4 text-center">
                      <span className="text-sm text-gray-900">
                        {teacher.email}
                      </span>
                    </td>

                    {/* Phone */}
                    <td className="px-6 py-4 text-center">
                      <span
                        className="text-sm text-gray-900 font-mono"
                        dir="ltr"
                      >
                        {teacher.phoneNumber}
                      </span>
                    </td>

                    {/* Gender */}
                    <td className="px-6 py-4 text-center">
                      {teacher.gender ? (
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            teacher.gender === 'ذكر'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-pink-100 text-pink-800'
                          }`}
                        >
                          {teacher.gender}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>

                    {/* Groups */}
                    <td className="px-6 py-4 text-center">
                      {(() => {
                        if (
                          teacher.groups &&
                          Array.isArray(teacher.groups) &&
                          teacher.groups.length > 0
                        ) {
                          if (teacher.groups.length === 1) {
                            return (
                              <div className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 rounded text-xs font-medium border border-green-200">
                                <div className="w-1.5 h-1.5 bg-green-500 rounded-full flex-shrink-0"></div>
                                <span className="font-semibold truncate max-w-[200px]">
                                  {getGroupDisplayName(teacher.groups[0])}
                                </span>
                              </div>
                            );
                          } else {
                            return (
                              <div className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium border border-blue-200">
                                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0"></div>
                                <span className="font-semibold">
                                  {teacher.groups.length} حلقة
                                </span>
                              </div>
                            );
                          }
                        }
                        return (
                          <div className="inline-flex items-center gap-1 px-2 py-1 bg-red-50 rounded border border-red-200">
                            <div className="w-1.5 h-1.5 bg-red-500 rounded-full flex-shrink-0"></div>
                            <span className="text-red-600 text-xs font-medium">
                              لا توجد
                            </span>
                          </div>
                        );
                      })()}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => onEdit(teacher)}
                          className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                          title="تعديل"
                        >
                          <FaEdit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDelete(teacher)}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                          title="حذف"
                        >
                          <FaTrash className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>

                  {/* Expanded Details Row */}
                  {isExpanded && (
                    <tr className="bg-gradient-to-r from-emerald-50/50 to-teal-50/50">
                      <td colSpan={8} className="px-6 py-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Personal Information Section */}
                          <div className="space-y-3">
                            <h4 className="text-sm font-bold text-emerald-700 border-b-2 border-emerald-200 pb-2">
                              المعلومات الشخصية
                            </h4>

                            <div className="space-y-2">
                              <div className="flex items-start gap-2">
                                <span className="text-xs font-semibold text-gray-600 min-w-[100px]">
                                  الاسم الكامل:
                                </span>
                                <span className="text-xs text-gray-900">
                                  {getTeacherFullName(teacher)}
                                </span>
                              </div>

                              {teacher.motherName && (
                                <div className="flex items-start gap-2">
                                  <span className="text-xs font-semibold text-gray-600 min-w-[100px]">
                                    اسم الأم:
                                  </span>
                                  <span className="text-xs text-gray-900">
                                    {teacher.motherName}
                                  </span>
                                </div>
                              )}

                              <div className="flex items-start gap-2">
                                <span className="text-xs font-semibold text-gray-600 min-w-[100px]">
                                  رقم الهوية:
                                </span>
                                <span className="text-xs text-gray-900 font-mono">
                                  {teacher.idNumber || (
                                    <span className="text-gray-400">
                                      غير محدد
                                    </span>
                                  )}
                                </span>
                              </div>

                              <div className="flex items-start gap-2">
                                <span className="text-xs font-semibold text-gray-600 min-w-[100px]">
                                  العمر:
                                </span>
                                <span className="text-xs text-gray-900">
                                  {teacher.age ? (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-medium">
                                      {teacher.age} سنة
                                    </span>
                                  ) : (
                                    <span className="text-gray-400">
                                      غير محدد
                                    </span>
                                  )}
                                </span>
                              </div>

                              <div className="flex items-start gap-2">
                                <span className="text-xs font-semibold text-gray-600 min-w-[100px]">
                                  تاريخ الميلاد:
                                </span>
                                <span className="text-xs text-gray-900">
                                  {formatDateArabic(teacher.birthDate)}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Contact Information Section */}
                          <div className="space-y-3">
                            <h4 className="text-sm font-bold text-emerald-700 border-b-2 border-emerald-200 pb-2">
                              معلومات التواصل
                            </h4>

                            <div className="space-y-2">
                              <div className="flex items-start gap-2">
                                <span className="text-xs font-semibold text-gray-600 min-w-[100px]">
                                  البريد الإلكتروني:
                                </span>
                                <span
                                  className="text-xs text-gray-900"
                                  dir="ltr"
                                >
                                  {teacher.email}
                                </span>
                              </div>

                              <div className="flex items-start gap-2">
                                <span className="text-xs font-semibold text-gray-600 min-w-[100px]">
                                  رقم الهاتف:
                                </span>
                                <span
                                  className="text-xs text-gray-900 font-mono"
                                  dir="ltr"
                                >
                                  {teacher.phoneNumber}
                                </span>
                              </div>

                              {teacher.residence && (
                                <div className="flex items-start gap-2">
                                  <span className="text-xs font-semibold text-gray-600 min-w-[100px]">
                                    مكان السكن:
                                  </span>
                                  <span className="text-xs text-gray-900">
                                    {teacher.residence}
                                  </span>
                                </div>
                              )}

                              <div className="flex items-start gap-2">
                                <span className="text-xs font-semibold text-gray-600 min-w-[100px]">
                                  حالة النشاط:
                                </span>
                                <span className="text-xs">
                                  {(() => {
                                    const status = getActivityStatus(teacher.isActive);
                                    return (
                                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full font-medium ${status.className}`}>
                                        {status.label}
                                      </span>
                                    );
                                  })()}
                                </span>
                              </div>

                              {teacher.lastSeen && (
                                <div className="flex items-start gap-2">
                                  <span className="text-xs font-semibold text-gray-600 min-w-[100px]">
                                    آخر ظهور:
                                  </span>
                                  <span className="text-xs text-gray-900">
                                    {formatDateTimeArabic(teacher.lastSeen)}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Groups Section */}
                          <div className="space-y-3 md:col-span-2">
                            <h4 className="text-sm font-bold text-emerald-700 border-b-2 border-emerald-200 pb-2">
                              الحلقات المُدرَّسة ({teacher.groups?.length || 0})
                            </h4>

                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                              {teacher.groups && teacher.groups.length > 0 ? (
                                teacher.groups.map((group, index) => (
                                  <div
                                    key={index}
                                    className="flex items-center gap-2 p-2 bg-white rounded-lg border border-emerald-100 hover:border-emerald-300 transition-colors"
                                  >
                                    <div className="w-2 h-2 bg-emerald-500 rounded-full flex-shrink-0"></div>
                                    <span className="text-xs text-gray-900 font-medium truncate">
                                      {getGroupDisplayName(group)}
                                    </span>
                                  </div>
                                ))
                              ) : (
                                <div className="text-xs text-gray-400 italic p-2 bg-gray-50 rounded col-span-full">
                                  لا توجد حلقات مُدرَّسة
                                </div>
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
};
