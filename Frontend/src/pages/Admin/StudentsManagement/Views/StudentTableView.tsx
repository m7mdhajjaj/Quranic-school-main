import React from 'react';
import { Table, type Column } from '@/components/UI';
import { Edit2, Trash2, Phone, Mail, MapPin, Users, GraduationCap } from 'lucide-react';
import { User, UserCheck, Cake } from 'lucide-react';
import type { Student } from '@/Api/studentApi';
import Avatar from '@/components/Avatar/Avatar';
import { showConfirmDialog } from '@/utils/sweetalertUtils';

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
  onToggleAll,
}) => {
  const allSelected =
    selectedStudents &&
    students.length > 0 &&
    students.every((s) => selectedStudents.has(s._id || ''));

  const columns: Column<Student>[] = [
    // Checkbox column for bulk selection
    ...(selectedStudents && onToggleStudent && onToggleAll
      ? [
          {
            key: 'select',
            header: (
              <input
                type="checkbox"
                checked={allSelected}
                onChange={onToggleAll}
                className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500 cursor-pointer"
                title="تحديد الكل"
                aria-label="تحديد الكل"
              />
            ),
            width: '50px',
            align: 'center' as const,
            render: (student: Student) => (
              <input
                type="checkbox"
                checked={selectedStudents.has(student._id || '')}
                onChange={() => onToggleStudent(student._id || '')}
                className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500 cursor-pointer"
                title="تحديد الطالب"
                aria-label="تحديد الطالب"
              />
            ),
          },
        ]
      : []),
    {
      key: 'student',
      header: 'الطالب',
      width: '220px',
      align: 'right' as const,
      render: (student: Student) => (
        <div className="py-1.5">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-sm font-bold text-gray-900 truncate">
              {student.firstName} {student.lastName}
            </span>
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-300 flex-shrink-0">
              #{student.studentId}
            </span>
          </div>
          {student.fatherName && (
            <div className="text-xs text-gray-500 truncate">{student.fatherName}</div>
          )}
        </div>
      ),
    },
    {
      key: 'contact',
      header: 'الاتصال',
      width: '180px',
      align: 'right' as const,
      render: (student: Student) => (
        <div className="space-y-1 py-1.5">
          {student.phoneNumber && (
            <div className="flex items-center gap-1.5 text-sm text-gray-700">
              <Phone className="w-3 h-3 text-emerald-500 flex-shrink-0" />
              <span className="font-mono text-xs" dir="ltr">{student.phoneNumber}</span>
            </div>
          )}
          {student.email && (
            <div className="flex items-center gap-1.5 text-sm text-gray-700">
              <Mail className="w-3 h-3 text-blue-500 flex-shrink-0" />
              <span className="text-xs truncate">{student.email}</span>
            </div>
          )}
          {!student.phoneNumber && !student.email && (
            <span className="text-xs text-gray-400">-</span>
          )}
        </div>
      ),
    },
    {
      key: 'info',
      header: 'المعلومات',
      width: '140px',
      align: 'center' as const,
      render: (student: Student) => (
        <div className="flex flex-wrap items-center justify-center gap-1.5 py-1.5">
          {student.gender && (
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold ${
                student.gender === 'ذكر'
                  ? 'bg-blue-100 text-blue-700 border border-blue-300'
                  : 'bg-pink-100 text-pink-700 border border-pink-300'
              }`}
            >
              {student.gender}
            </span>
          )}
          {student.age && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-700 border border-amber-300">
              {student.age} سنة
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'group',
      header: 'الحلقة',
      width: '130px',
      align: 'center' as const,
      render: (student: Student) => {
        if (student.group) {
          return (
            <div className="flex items-center justify-center py-1.5">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold border border-emerald-300">
                <Users className="w-3 h-3 text-emerald-600" />
                <span className="truncate max-w-[90px]">
                  {getGroupDisplayName(student.group)}
                </span>
              </div>
            </div>
          );
        }
        return (
          <div className="flex items-center justify-center py-1.5">
            <span className="text-xs text-gray-400">-</span>
          </div>
        );
      },
    },
    {
      key: 'teacher',
      header: 'المعلم',
      width: '130px',
      align: 'center' as const,
      render: (student: Student) => {
        if (student.teacher) {
          return (
            <div className="flex items-center justify-center py-1.5">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-violet-100 text-violet-700 rounded-lg text-xs font-bold border border-violet-300">
                <GraduationCap className="w-3 h-3 text-violet-600" />
                <span className="truncate max-w-[90px]">
                  {getTeacherDisplayName(student.teacher)}
                </span>
              </div>
            </div>
          );
        }
        return (
          <div className="flex items-center justify-center py-1.5">
            <span className="text-xs text-gray-400">-</span>
          </div>
        );
      },
    },
    {
      key: 'residence',
      header: 'السكن',
      width: '130px',
      align: 'right' as const,
      render: (student: Student) => (
        <div className="py-1.5">
          {student.residence ? (
            <div className="flex items-center gap-1.5 text-sm text-gray-700">
              <MapPin className="w-3 h-3 text-rose-500 flex-shrink-0" />
              <span className="text-xs truncate">{student.residence}</span>
            </div>
          ) : (
            <span className="text-xs text-gray-400">-</span>
          )}
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'الإجراءات',
      width: '90px',
      align: 'center' as const,
      render: (student: Student) => (
        <div className="flex items-center justify-center gap-1 py-1.5">
          <button
            onClick={() => onEdit(student)}
            className="p-1.5 text-emerald-600 hover:bg-emerald-100 rounded-lg transition-all duration-200 hover:scale-110"
            title="تعديل"
            aria-label="تعديل الطالب"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={async () => {
              const result = await showConfirmDialog(
                "تأكيد الحذف",
                `هل أنت متأكد من حذف الطالب <strong class="text-red-600">${student.firstName} ${student.lastName}</strong>؟<br><span class="text-sm text-gray-600">لا يمكن التراجع عن هذا الإجراء</span>`
              );
              if (result.isConfirmed) {
                onDelete(student);
              }
            }}
            className="p-1.5 text-red-600 hover:bg-red-100 rounded-lg transition-all duration-200 hover:scale-110"
            title="حذف"
            aria-label="حذف الطالب"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div
      className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden"
      dir="rtl"
    >
      <Table
        data={students}
        columns={columns}
        loading={isLoading}
        emptyMessage="لا يوجد طلاب"
        emptyDescription="لم يتم إضافة أي طلاب بعد"
        hoverable={true}
        striped={true}
        headerClassName="bg-gradient-to-r from-emerald-500 via-emerald-600 to-emerald-500 text-white shadow-lg"
        rowClassName={(student, index) => {
          const base = 'transition-colors duration-150';
          const hover = 'hover:bg-emerald-50/50';
          const stripe = index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50';
          return `${base} ${stripe} ${hover}`;
        }}
      />
    </div>
  );
};
