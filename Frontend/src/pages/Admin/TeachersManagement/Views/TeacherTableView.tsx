import React, { useContext } from 'react';
import { Edit2, Trash2 } from "lucide-react";
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import type { Teacher } from '@/Api/teacherApi';
import { useExpandableRows } from '../hooks/useExpandableRows';
import { UserStatusContext } from '@/Context/UserStatusContext';
import {
  getGroupDisplayName,
  getTeacherFullName,
  formatDateArabic,
  formatDateTimeArabic,
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
  isReadOnly?: boolean;
  userRole?: string;
}

export const TeacherTableView: React.FC<TeacherTableViewProps> = ({
  teachers,
  onEdit,
  onDelete,
  isLoading = false,
  selectedTeachers,
  onToggleTeacher,
  onToggleAll,
  isReadOnly = false,
  userRole,
}) => {
  // إخفاء teacherId للسكرتير
  const showTeacherId = userRole !== 'secretary';
  
  const { toggleRow, isRowExpanded } = useExpandableRows();
  const userStatusContext = useContext(UserStatusContext);
  const isUserOnline = userStatusContext?.isUserOnline || (() => false);

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
              <th className="px-3 py-4 text-center font-bold text-sm whitespace-nowrap w-12">
                #
              </th>
              {showTeacherId && (
                <th className="px-4 py-4 text-center font-bold text-sm whitespace-nowrap">
                  رقم المعلم
                </th>
              )}
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
              {!isReadOnly && (
                <th className="px-6 py-4 text-center font-bold text-sm whitespace-nowrap w-32">
                  الإجراءات
                </th>
              )}
              <th className="px-4 py-4 text-center font-bold text-sm whitespace-nowrap w-12">
                {/* Expand */}
              </th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-emerald-100/50">
            {teachers.map((teacher, index) => {
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

                    {/* Row Number */}
                    <td className="px-3 py-4 text-center">
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-gray-100 text-gray-700 text-sm font-semibold">
                        {index + 1}
                      </span>
                    </td>

                    {/* Teacher ID */}
                    {showTeacherId && (
                      <td className="px-4 py-4 text-center">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {teacher.teacherId}
                        </span>
                      </td>
                    )}

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
                    {!isReadOnly && (
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => onEdit(teacher)}
                            className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                            title="تعديل"
                          >
                                <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onDelete(teacher)}
                            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                            title="حذف"
                          >
            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    )}

                    {/* Expand Button - Last Column */}
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
                                <span className="text-sm font-semibold text-gray-600">
                                  الاسم الكامل:
                                </span>
                                <span className="text-sm font-bold text-gray-900 text-right">
                                  {getTeacherFullName(teacher)}
                                </span>
                              </div>

                              {teacher.motherName && (
                                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                                  <span className="text-sm font-semibold text-gray-600">
                                    اسم الأم:
                                  </span>
                                  <span className="text-sm text-gray-900 text-right">
                                    {teacher.motherName}
                                  </span>
                                </div>
                              )}

                              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                                <span className="text-sm font-semibold text-gray-600">
                                  رقم الهوية:
                                </span>
                                <span className="text-sm text-gray-900 font-mono">
                                  {teacher.idNumber || (
                                    <span className="text-gray-400">
                                      غير محدد
                                    </span>
                                  )}
                                </span>
                              </div>

                              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                                <span className="text-sm font-semibold text-gray-600">
                                  العمر:
                                </span>
                                <span className="text-sm">
                                  {teacher.age ? (
                                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-amber-100 text-amber-800 font-semibold">
                                      {teacher.age} سنة
                                    </span>
                                  ) : (
                                    <span className="text-gray-400">
                                      غير محدد
                                    </span>
                                  )}
                                </span>
                              </div>

                              <div className="flex items-center justify-between py-2">
                                <span className="text-sm font-semibold text-gray-600">
                                  تاريخ الميلاد:
                                </span>
                                <span className="text-sm text-gray-900">
                                  {formatDateArabic(teacher.birthDate)}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Contact Information Section */}
                          <div className="bg-white rounded-xl border-2 border-emerald-200 p-5 shadow-md">
                            <h4 className="text-base font-bold text-emerald-700 mb-4 pb-3 border-b-2 border-emerald-200 flex items-center gap-2">
                              <div className="w-1 h-6 bg-emerald-500 rounded-full"></div>
                              معلومات التواصل
                            </h4>

                            <div className="space-y-3">
                              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                                <span className="text-sm font-semibold text-gray-600">
                                  البريد الإلكتروني:
                                </span>
                                <span
                                  className="text-sm text-gray-900 font-medium"
                                  dir="ltr"
                                >
                                  {teacher.email}
                                </span>
                              </div>

                              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                                <span className="text-sm font-semibold text-gray-600">
                                  رقم الهاتف:
                                </span>
                                <span
                                  className="text-sm text-gray-900 font-mono font-semibold"
                                  dir="ltr"
                                >
                                  {teacher.phoneNumber}
                                </span>
                              </div>

                              {teacher.residence && (
                                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                                  <span className="text-sm font-semibold text-gray-600">
                                    مكان السكن:
                                  </span>
                                  <span className="text-sm text-gray-900 text-right">
                                    {teacher.residence}
                                  </span>
                                </div>
                              )}

                              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                                <span className="text-sm font-semibold text-gray-600">
                                  حالة النشاط:
                                </span>
                                <span className="text-sm">
                                  {(() => {
                                    const isOnline = isUserOnline(teacher._id || '');
                                    return (
                                      <span className={`inline-flex items-center px-3 py-1 rounded-full font-semibold ${
                                        isOnline 
                                          ? 'bg-green-100 text-green-800' 
                                          : 'bg-gray-100 text-gray-800'
                                      }`}>
                                        {isOnline ? 'متصل' : 'غير متصل'}
                                      </span>
                                    );
                                  })()}
                                </span>
                              </div>

                              {teacher.lastSeen && (
                                <div className="flex items-center justify-between py-2">
                                  <span className="text-sm font-semibold text-gray-600">
                                    آخر ظهور:
                                  </span>
                                  <span className="text-sm text-gray-900">
                                    {formatDateTimeArabic(teacher.lastSeen)}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Groups Section - Full Width */}
                          <div className="lg:col-span-2 bg-white rounded-xl border-2 border-emerald-200 p-5 shadow-md">
                            <h4 className="text-base font-bold text-emerald-700 mb-4 pb-3 border-b-2 border-emerald-200 flex items-center gap-2">
                              <div className="w-1 h-6 bg-emerald-500 rounded-full"></div>
                              الحلقات المُدرَّسة ({teacher.groups?.length || 0})
                            </h4>

                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                              {teacher.groups && teacher.groups.length > 0 ? (
                                teacher.groups.map((group, index) => {
                                  const groupObj = typeof group === 'object' ? group : { name: group };
                                  const isActive = (groupObj as any).isActive !== false;
                                  return (
                                    <div
                                      key={index}
                                      className={`flex flex-col gap-2 p-3 rounded-lg border-2 transition-all ${
                                        isActive
                                          ? 'bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200 hover:border-emerald-400'
                                          : 'bg-gradient-to-br from-gray-50 to-slate-50 border-gray-200 hover:border-gray-400'
                                      } hover:shadow-md`}
                                    >
                                      <div className="flex items-center gap-2">
                                        <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                                          isActive ? 'bg-emerald-500' : 'bg-gray-400'
                                        }`}></div>
                                        <span className="text-sm text-gray-900 font-semibold truncate">
                                          {getGroupDisplayName(group)}
                                        </span>
                                      </div>
                                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full w-fit ${
                                        isActive
                                          ? 'bg-emerald-100 text-emerald-700'
                                          : 'bg-gray-100 text-gray-600'
                                      }`}>
                                        {isActive ? 'نشط' : 'غير نشط'}
                                      </span>
                                    </div>
                                  );
                                })
                              ) : (
                                <div className="text-sm text-gray-500 italic p-4 bg-gray-50 rounded-lg col-span-full text-center border-2 border-dashed border-gray-200">
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
