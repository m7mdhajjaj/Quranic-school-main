import React from 'react';
import { Table, type Column } from '@/components/UI';
import { Edit2, Trash2, Phone, Mail, MapPin, Users, GraduationCap } from 'lucide-react';
import { User, UserCheck, Cake } from 'lucide-react';
import type { Student } from '@/Api/studentApi';
import Avatar from '@/components/Avatar/Avatar';

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
      width: '250px',
      align: 'right' as const,
      render: (student: Student) => (
        <div className="flex items-center gap-3 py-2">
          <Avatar
            user={student}
            size="sm"
            border="ring"
            fallbackIcon={<GraduationCap className="w-4 h-4" />}
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-bold text-gray-900 truncate">
                {student.firstName} {student.lastName}
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex-shrink-0">
                #{student.studentId}
              </span>
            </div>
            {student.fatherName && (
              <div className="text-xs text-gray-500 truncate">{student.fatherName}</div>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'contact',
      header: 'معلومات الاتصال',
      width: '200px',
      align: 'right' as const,
      render: (student: Student) => (
        <div className="space-y-1.5 py-2">
          {student.phoneNumber && (
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <Phone className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
              <span className="font-mono text-xs" dir="ltr">{student.phoneNumber}</span>
            </div>
          )}
          {student.email && (
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <Mail className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
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
      header: 'المعلومات الشخصية',
      width: '180px',
      align: 'center' as const,
      render: (student: Student) => (
        <div className="flex flex-col items-center gap-2 py-2">
          {student.gender && (
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium ${
                student.gender === 'ذكر'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'bg-pink-50 text-pink-700 border border-pink-200'
              }`}
            >
              {student.gender === 'ذكر' ? (
                <User className="w-3.5 h-3.5" />
              ) : (
                <UserCheck className="w-3.5 h-3.5" />
              )}
              {student.gender}
            </span>
          )}
          {student.age && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
              <Cake className="w-3.5 h-3.5" />
              {student.age} سنة
            </span>
          )}
          {student.idNumber && (
            <span className="text-xs text-gray-600 font-mono bg-gray-50 px-2 py-1 rounded border border-gray-200">
              {student.idNumber}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'group',
      header: 'الحلقة',
      width: '150px',
      align: 'center' as const,
      render: (student: Student) => {
        if (student.group) {
          return (
            <div className="flex items-center justify-center py-2">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-semibold border border-emerald-200 shadow-sm">
                <Users className="w-3.5 h-3.5 text-emerald-600" />
                <span className="truncate max-w-[120px]">
                  {getGroupDisplayName(student.group)}
                </span>
              </div>
            </div>
          );
        }
        return (
          <div className="flex items-center justify-center py-2">
            <span className="text-xs text-gray-400">-</span>
          </div>
        );
      },
    },
    {
      key: 'teacher',
      header: 'المعلم',
      width: '150px',
      align: 'center' as const,
      render: (student: Student) => {
        if (student.teacher) {
          return (
            <div className="flex items-center justify-center py-2">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-violet-50 text-violet-700 rounded-lg text-xs font-semibold border border-violet-200 shadow-sm">
                <GraduationCap className="w-3.5 h-3.5 text-violet-600" />
                <span className="truncate max-w-[120px]">
                  {getTeacherDisplayName(student.teacher)}
                </span>
              </div>
            </div>
          );
        }
        return (
          <div className="flex items-center justify-center py-2">
            <span className="text-xs text-gray-400">-</span>
          </div>
        );
      },
    },
    {
      key: 'residence',
      header: 'مكان السكن',
      width: '150px',
      align: 'right' as const,
      render: (student: Student) => (
        <div className="py-2">
          {student.residence ? (
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
              <span className="text-xs truncate">{student.residence}</span>
            </div>
          ) : (
            <span className="text-xs text-gray-400">-</span>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'الحالة',
      width: '100px',
      align: 'center' as const,
      render: (student: Student) => (
        <div className="flex items-center justify-center py-2">
          {student.isActive !== undefined && (
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium ${
                student.isActive
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'bg-gray-50 text-gray-600 border border-gray-200'
              }`}
            >
              <div className={`w-2 h-2 rounded-full ${student.isActive ? 'bg-green-500' : 'bg-gray-400'}`} />
              {student.isActive ? 'نشط' : 'غير نشط'}
            </span>
          )}
          {student.isActive === undefined && (
            <span className="text-xs text-gray-400">-</span>
          )}
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'الإجراءات',
      width: '100px',
      align: 'center' as const,
      render: (student: Student) => (
        <div className="flex items-center justify-center gap-1 py-2">
          <button
            onClick={() => onEdit(student)}
            className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all duration-200 hover:scale-110"
            title="تعديل"
            aria-label="تعديل الطالب"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              if (window.confirm(`هل أنت متأكد من حذف ${student.firstName} ${student.lastName}؟`)) {
                onDelete(student);
              }
            }}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 hover:scale-110"
            title="حذف"
            aria-label="حذف الطالب"
          >
            <Trash2 className="w-4 h-4" />
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
