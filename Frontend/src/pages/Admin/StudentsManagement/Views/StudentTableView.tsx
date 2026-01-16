import React, { useState, useContext } from 'react';
import { Edit2, Trash2, Phone, Mail, MapPin, Users, GraduationCap, History } from 'lucide-react';
import { User, UserCheck, Cake, ChevronDown, ChevronUp } from 'lucide-react';
import type { Student } from '@/Api/studentApi';
import { showConfirmDialog } from '@/utils/sweetalertUtils';
import { StudentFullHistorySidebar } from '../components/StudentFullHistorySidebar';
import { OnlineStatus } from '@/components/Avatar/OnlineStatus';
import { UserStatusContext } from '@/Context/UserStatusContext';

interface StudentTableViewProps {
  students: Student[];
  onEdit: (student: Student) => void;
  onDelete: (student: Student) => void;
  isLoading?: boolean;
  onSort?: (field: string) => void;
  sortField?: string;
  sortOrder?: 'asc' | 'desc';
  selectedStudents?: Set<string>;
  onToggleStudent?: (studentId: string) => void;
  onToggleAll?: () => void;
  onStudentRestored?: () => void;
  canRestore?: boolean;
  userRole?: string;
}

// دالة مساعدة للحصول على اسم الحلقة بشكل آمن
const getGroupDisplayName = (
  group: string | { name?: string; id?: string; number?: number } | null | undefined
): string => {
  if (!group) return 'غير محدد';
  if (typeof group === 'string') return group;
  return group.name || 'غير محدد';
};

// دالة مساعدة للحصول على اسم المعلم بشكل آمن
const getTeacherDisplayName = (
  teacher: string | { firstName?: string; lastName?: string; name?: string } | null | undefined
): string => {
  if (!teacher) return 'غير محدد';
  if (typeof teacher === 'string') return teacher;
  if (teacher.firstName || teacher.lastName) {
    return `${teacher.firstName || ''} ${teacher.lastName || ''}`.trim();
  }
  return teacher.name || 'غير محدد';
};

export const StudentTableView: React.FC<StudentTableViewProps> = ({
  students,
  onEdit,
  onDelete,
  isLoading = false,
  selectedStudents,
  onToggleStudent,
  onStudentRestored,
  onToggleAll,
  canRestore = true,
  userRole,
}) => {
  // إخفاء studentId للمعلم والسكرتير والطالب
  const showStudentId = userRole !== 'secretary' && userRole !== 'teacher' && userRole !== 'student';
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [historyStudentId, setHistoryStudentId] = useState<string | null>(null);
  const [historyStudentName, setHistoryStudentName] = useState<string>('');
  const [historyStudent, setHistoryStudent] = useState<any>(null);
  const userStatusContext = useContext(UserStatusContext);
  const isUserOnline = userStatusContext?.isUserOnline || (() => false);

  const toggleRow = (studentId: string) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(studentId)) {
        newSet.delete(studentId);
      } else {
        newSet.add(studentId);
      }
      return newSet;
    });
  };

  const allSelected =
    selectedStudents &&
    students.length > 0 &&
    students.every((s) => selectedStudents.has(s._id || ''));

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden p-8" dir="rtl">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-3 border-emerald-600 border-t-transparent"></div>
        </div>
      </div>
    );
  }

  if (students.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden p-8" dir="rtl">
        <div className="flex flex-col items-center justify-center gap-3 h-64">
          <div className="text-6xl opacity-30">📭</div>
          <div className="text-gray-500 font-medium text-lg">لا يوجد طلاب</div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* History Sidebar */}
      {historyStudentId && (
        <StudentFullHistorySidebar
          isOpen={!!historyStudentId}
          onClose={() => {
            setHistoryStudentId(null);
            setHistoryStudentName('');
            setHistoryStudent(null);
          }}
          studentId={historyStudentId}
          studentName={historyStudentName}
          student={historyStudent}
          onStudentRestored={onStudentRestored}
          canRestore={canRestore}
        />
      )}

      <div className="bg-white rounded-2xl shadow-xl overflow-hidden" dir="rtl">
        <div className="overflow-x-auto">
          <table className="w-full">
            {/* Table Header */}
            <thead className="bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 text-white shadow-lg">
              <tr>
                {selectedStudents && onToggleStudent && onToggleAll && (
                  <th className="px-4 py-4 text-center font-bold text-sm whitespace-nowrap w-12">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={onToggleAll}
                      className="w-4 h-4 text-white border-white rounded focus:ring-white cursor-pointer"
                      aria-label="تحديد جميع الطلاب"
                    />
                  </th>
                )}
                <th className="px-3 py-4 text-center font-bold text-sm whitespace-nowrap w-12">
                  #
                </th>
                {showStudentId && (
                  <th className="px-4 py-4 text-center font-bold text-sm whitespace-nowrap">
                    رقم الطالب
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
                  الحلقة
                </th>
                <th className="px-6 py-4 text-center font-bold text-sm whitespace-nowrap w-32">
                  الإجراءات
                </th>
                <th className="px-4 py-4 text-center font-bold text-sm whitespace-nowrap w-12">
                  {/* Expand */}
                </th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-emerald-100/50">
              {students.map((student, index) => {
                const isExpanded = expandedRows.has(student._id || '');
                return (
                  <React.Fragment key={student._id}>
                    {/* Main Row */}
                    <tr className="hover:bg-gradient-to-r hover:from-emerald-50 hover:to-teal-50 transition-all duration-300">
                      {/* Checkbox */}
                      {selectedStudents && onToggleStudent && (
                        <td className="px-4 py-4 text-center">
                          <input
                            type="checkbox"
                            checked={selectedStudents.has(student._id || '')}
                            onChange={() => onToggleStudent(student._id || '')}
                            className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500 cursor-pointer"
                            aria-label={`تحديد ${student.firstName} ${student.lastName}`}
                          />
                        </td>
                      )}

                      {/* Row Number */}
                      <td className="px-3 py-4 text-center">
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-gray-100 text-gray-700 text-sm font-semibold">
                          {index + 1}
                        </span>
                      </td>

                      {/* Student ID */}
                      {showStudentId && (
                        <td className="px-4 py-4 text-center">
                          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-bold bg-emerald-100 text-emerald-700 border border-emerald-300">
                            #{student.studentId}
                          </span>
                        </td>
                      )}

                      {/* Name */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="font-bold text-gray-900 truncate">
                              {student.firstName} {student.lastName}
                            </div>
                            {student.fatherName && (
                              <div className="text-xs text-gray-500 truncate">
                                {student.fatherName}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="px-6 py-4 text-center">
                        {student.email ? (
                          <span className="text-sm text-gray-700" dir="ltr">
                            {student.email}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>

                      {/* Phone */}
                      <td className="px-6 py-4 text-center">
                        {student.phoneNumber ? (
                          <span className="text-sm text-gray-700 font-mono" dir="ltr">
                            {student.phoneNumber}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>

                      {/* Gender */}
                      <td className="px-6 py-4 text-center">
                        {student.gender ? (
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                              student.gender === 'ذكر'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-pink-100 text-pink-800'
                            }`}
                          >
                            {student.gender}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>

                      {/* Group */}
                      <td className="px-6 py-4 text-center">
                        {(() => {
                          if (student.group) {
                            const groupObj = typeof student.group === 'object' ? student.group : { name: student.group };
                            const isActive = (groupObj as any).isActive !== false;
                            return (
                              <div className="inline-flex flex-col items-center gap-1">
                                <div className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium border ${
                                  isActive
                                    ? 'bg-green-50 text-green-700 border-green-200'
                                    : 'bg-gray-50 text-gray-600 border-gray-200'
                                }`}>
                                  <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                                    isActive ? 'bg-green-500' : 'bg-gray-400'
                                  }`}></div>
                                  <span className="font-semibold truncate max-w-[120px]">
                                    {getGroupDisplayName(student.group)}
                                  </span>
                                </div>
                              </div>
                            );
                          }
                          return (
                            <div className="inline-flex items-center gap-1 px-2 py-1 bg-red-50 rounded border border-red-200">
                              <div className="w-1.5 h-1.5 bg-red-500 rounded-full flex-shrink-0"></div>
                              <span className="text-red-600 text-xs font-medium">لا توجد</span>
                            </div>
                          );
                        })()}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => {
                              setHistoryStudentId(student._id || '');
                              setHistoryStudentName(`${student.firstName} ${student.lastName}`);
                              setHistoryStudent({
                                _id: student._id,
                                firstName: student.firstName,
                                lastName: student.lastName,
                                gender: student.gender,
                                avatar: student.avatar,
                              });
                            }}
                            className="p-2 text-purple-600 hover:bg-purple-100 rounded-lg transition-colors"
                            title="تاريخ الطالب"
                          >
                            <History className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onEdit(student)}
                            className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                            title="تعديل"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onDelete(student)}
                            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                            title="حذف"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>

                      {/* Expand Button - Last Column */}
                      <td className="px-4 py-4 text-center">
                        <button
                          onClick={() => toggleRow(student._id || '')}
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
                                    {student.firstName} {student.lastName}
                                  </span>
                                </div>

                                {student.motherName && (
                                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                                    <span className="text-sm font-semibold text-gray-600">اسم الأم:</span>
                                    <span className="text-sm text-gray-900 text-right">{student.motherName}</span>
                                  </div>
                                )}

                                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                                  <span className="text-sm font-semibold text-gray-600">رقم الهوية:</span>
                                  <span className="text-sm text-gray-900 font-mono">
                                    {student.idNumber || <span className="text-gray-400">غير محدد</span>}
                                  </span>
                                </div>

                                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                                  <span className="text-sm font-semibold text-gray-600">العمر:</span>
                                  <span className="text-sm text-gray-900">{student.age || '-'} سنة</span>
                                </div>

                                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                                  <span className="text-sm font-semibold text-gray-600">تاريخ الميلاد:</span>
                                  <span className="text-sm text-gray-900">
                                    {student.birthDate
                                      ? new Date(student.birthDate).toLocaleDateString('ar-SA')
                                      : '-'}
                                  </span>
                                </div>

                                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                                  <span className="text-sm font-semibold text-gray-600">مكان السكن:</span>
                                  <span className="text-sm text-gray-900 text-right">{student.residence || '-'}</span>
                                </div>
                              </div>
                            </div>

                            {/* Contact & Status Section */}
                            <div className="bg-white rounded-xl border-2 border-emerald-200 p-5 shadow-md">
                              <h4 className="text-base font-bold text-emerald-700 mb-4 pb-3 border-b-2 border-emerald-200 flex items-center gap-2">
                                <div className="w-1 h-6 bg-emerald-500 rounded-full"></div>
                                معلومات الاتصال والحالة
                              </h4>

                              <div className="space-y-3">
                                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                                  <span className="text-sm font-semibold text-gray-600">البريد الإلكتروني:</span>
                                  <span className="text-sm text-gray-900 font-medium" dir="ltr">
                                    {student.email || '-'}
                                  </span>
                                </div>

                                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                                  <span className="text-sm font-semibold text-gray-600">رقم الهاتف:</span>
                                  <span className="text-sm text-gray-900 font-mono font-semibold" dir="ltr">
                                    {student.phoneNumber || '-'}
                                  </span>
                                </div>

                                {student.group && (
                                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                                    <span className="text-sm font-semibold text-gray-600">الحلقة:</span>
                                    <span className="text-sm text-gray-900">{getGroupDisplayName(student.group)}</span>
                                  </div>
                                )}

                                {(student.teacherFullName || student.teacher) && (
                                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                                    <span className="text-sm font-semibold text-gray-600">المعلم:</span>
                                    <span className="text-sm text-gray-900">
                                      {student.teacherFullName || student.teacher}
                                    </span>
                                  </div>
                                )}

                                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                                  <span className="text-sm font-semibold text-gray-600">حالة النشاط:</span>
                                  <span className="text-sm">
                                    {(() => {
                                      const isOnline = isUserOnline(student._id || '');
                                      return (
                                        <span
                                          className={`inline-flex items-center px-3 py-1 rounded-full font-semibold ${
                                            isOnline
                                              ? 'bg-green-100 text-green-800'
                                              : 'bg-gray-100 text-gray-800'
                                          }`}
                                        >
                                          {isOnline ? 'متصل' : 'غير متصل'}
                                        </span>
                                      );
                                    })()}
                                  </span>
                                </div>

                                {student.lastSeen && (
                                  <div className="flex items-center justify-between py-2">
                                    <span className="text-sm font-semibold text-gray-600">آخر ظهور:</span>
                                    <span className="text-sm text-gray-900">
                                      {new Date(student.lastSeen).toLocaleString('ar-SA')}
                                    </span>
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
    </>
  );
};
