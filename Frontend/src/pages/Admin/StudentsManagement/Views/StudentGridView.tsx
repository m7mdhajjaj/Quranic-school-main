import React from "react";
import { Edit2, Trash2, Phone, Mail, MapPin, Users, GraduationCap } from "lucide-react";
import type { Student } from "@/Api/studentApi";
import Avatar from "@/components/Avatar/Avatar";
import { showConfirmDialog } from "@/utils/sweetalertUtils";

interface StudentGridViewProps {
  students: Student[];
  onEdit: (student: Student) => void;
  onDelete: (student: Student) => void;
}

// دالة مساعدة للحصول على اسم الحلقة بشكل آمن
const getGroupDisplayName = (
  group: string | { name?: string; id?: string; number?: number } | null | undefined
): string => {
  if (!group) return "غير محدد";
  if (typeof group === "string") return group;
  return group.name || "غير محدد";
};

// دالة مساعدة للحصول على اسم المعلم بشكل آمن
const getTeacherDisplayName = (
  teacher: string | { firstName?: string; lastName?: string; name?: string } | null | undefined
): string => {
  if (!teacher) return "غير محدد";
  if (typeof teacher === "string") return teacher;
  if (teacher.firstName || teacher.lastName) {
    return `${teacher.firstName || ""} ${teacher.lastName || ""}`.trim();
  }
  return teacher.name || "غير محدد";
};

export const StudentGridView: React.FC<StudentGridViewProps> = ({
  students,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {students.map((student) => (
        <div
          key={student._id}
          className="group bg-gradient-to-br from-white to-gray-50/30 rounded-xl border-2 border-gray-200 hover:border-emerald-400 hover:shadow-xl transition-all duration-300 overflow-hidden"
          dir="rtl"
        >
          {/* Header with gradient */}
          <div className="h-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500"></div>
          
          <div className="p-5">
            {/* Student Name & ID */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg font-bold text-gray-900 truncate">
                    {student.firstName} {student.lastName}
                  </h3>
                  <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-sm flex-shrink-0">
                    #{student.studentId}
                  </span>
                </div>
                {student.fatherName && (
                  <p className="text-sm text-gray-600 mb-2">والده: {student.fatherName}</p>
                )}
                <div className="flex items-center gap-2 flex-wrap mt-2">
                  {student.gender && (
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold shadow-sm ${
                        student.gender === "ذكر"
                          ? "bg-blue-100 text-blue-700 border border-blue-300"
                          : "bg-pink-100 text-pink-700 border border-pink-300"
                      }`}
                    >
                      {student.gender}
                    </span>
                  )}
                  {student.age && (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-100 text-amber-700 border border-amber-300 shadow-sm">
                      {student.age} سنة
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-1 flex-shrink-0">
                <button
                  onClick={() => onEdit(student)}
                  className="p-2 text-emerald-600 hover:bg-emerald-100 rounded-lg transition-all hover:scale-110 shadow-sm"
                  title="تعديل"
                >
                  <Edit2 className="w-4 h-4" />
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
                  className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-all hover:scale-110 shadow-sm"
                  title="حذف"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Contact Info */}
            <div className="space-y-2.5 mb-4">
              {student.phoneNumber && (
                <div className="flex items-center gap-2 text-sm text-gray-700 bg-emerald-50/50 rounded-lg px-3 py-2 border border-emerald-100">
                  <Phone className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span className="text-xs font-medium" dir="ltr">{student.phoneNumber}</span>
                </div>
              )}

              {student.email && (
                <div className="flex items-center gap-2 text-sm text-gray-700 bg-blue-50/50 rounded-lg px-3 py-2 border border-blue-100">
                  <Mail className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <span className="text-xs truncate">{student.email}</span>
                </div>
              )}

              {student.idNumber && (
                <div className="flex items-center gap-2 text-sm text-gray-700 bg-gray-50 rounded-lg px-3 py-2 border border-gray-200">
                  <span className="text-xs text-gray-500">رقم الهوية:</span>
                  <span className="font-mono text-xs font-semibold">{student.idNumber}</span>
                </div>
              )}

              {student.residence && (
                <div className="flex items-center gap-2 text-sm text-gray-700 bg-rose-50/50 rounded-lg px-3 py-2 border border-rose-100">
                  <MapPin className="w-4 h-4 text-rose-600 flex-shrink-0" />
                  <span className="text-xs">{student.residence}</span>
                </div>
              )}
            </div>

            {/* Group & Teacher Info */}
            <div className="grid grid-cols-2 gap-2 pt-3 border-t-2 border-gray-100">
              {student.group ? (
                <div className="flex flex-col items-center gap-1.5 bg-emerald-50 rounded-lg px-3 py-2.5 border border-emerald-200">
                  <Users className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-bold text-emerald-700 text-center">
                    {getGroupDisplayName(student.group)}
                  </span>
                  <span className="text-[10px] text-emerald-600">الحلقة</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-1.5 bg-gray-50 rounded-lg px-3 py-2.5 border border-gray-200">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span className="text-xs text-gray-500">غير محدد</span>
                  <span className="text-[10px] text-gray-400">الحلقة</span>
                </div>
              )}

              {(() => {
                // استخدام teacherFullName إذا كان متوفراً، وإلا استخدام teacher
                const teacherName = student.teacherFullName || student.teacher;
                return teacherName && teacherName !== 'غير محدد' ? (
                  <div className="flex flex-col items-center gap-1.5 bg-violet-50 rounded-lg px-3 py-2.5 border border-violet-200">
                    <GraduationCap className="w-4 h-4 text-violet-600" />
                    <span className="text-xs font-bold text-violet-700 text-center truncate w-full" title={teacherName}>
                      {teacherName}
                    </span>
                    <span className="text-[10px] text-violet-600">المعلم</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-1.5 bg-gray-50 rounded-lg px-3 py-2.5 border border-gray-200">
                    <GraduationCap className="w-4 h-4 text-gray-400" />
                    <span className="text-xs text-gray-500">غير محدد</span>
                    <span className="text-[10px] text-gray-400">المعلم</span>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
