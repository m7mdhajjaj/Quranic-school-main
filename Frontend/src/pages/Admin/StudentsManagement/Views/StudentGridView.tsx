import React from "react";
import { Edit2, Trash2, Phone, Mail, MapPin, Users, GraduationCap } from "lucide-react";
import type { Student } from "@/Api/studentApi";
import Avatar from "@/components/Avatar/Avatar";

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
    <div className="space-y-3">
      {students.map((student) => (
        <div
          key={student._id}
          className="group bg-white rounded-lg border border-gray-200 hover:border-emerald-300 hover:shadow-md transition-all duration-200"
          dir="rtl"
        >
          <div className="p-4">
            <div className="flex items-center gap-4">
              {/* Avatar */}
              <div className="flex-shrink-0">
                <Avatar
                  user={student}
                  size="md"
                  border="ring"
                  fallbackIcon={<GraduationCap className="w-5 h-5" />}
                />
              </div>

              {/* Main Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-bold text-gray-900 mb-1">
                      {student.firstName} {student.lastName}
                    </h3>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                        #{student.studentId}
                      </span>
                      {student.gender && (
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${
                            student.gender === "ذكر"
                              ? "bg-blue-50 text-blue-700 border border-blue-200"
                              : "bg-pink-50 text-pink-700 border border-pink-200"
                          }`}
                        >
                          {student.gender}
                        </span>
                      )}
                      {student.age && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                          {student.age} سنة
                        </span>
                      )}
                      {student.isActive !== undefined && (
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium ${
                            student.isActive
                              ? "bg-green-50 text-green-700 border border-green-200"
                              : "bg-gray-50 text-gray-600 border border-gray-200"
                          }`}
                        >
                          <div className={`w-1.5 h-1.5 rounded-full ${student.isActive ? "bg-green-500" : "bg-gray-400"}`} />
                          {student.isActive ? "نشط" : "غير نشط"}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions - Icons Only */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => onEdit(student)}
                      className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                      title="تعديل"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`هل أنت متأكد من حذف ${student.firstName} ${student.lastName}؟`)) {
                          onDelete(student);
                        }
                      }}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="حذف"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Contact Info - Compact */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3 pt-3 border-t border-gray-100">
                  {student.phoneNumber && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span className="truncate" dir="ltr">{student.phoneNumber}</span>
                    </div>
                  )}

                  {student.email && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span className="truncate">{student.email}</span>
                    </div>
                  )}

                  {student.group && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Users className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <span className="truncate">{getGroupDisplayName(student.group)}</span>
                    </div>
                  )}

                  {student.teacher && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <GraduationCap className="w-4 h-4 text-blue-600 flex-shrink-0" />
                      <span className="truncate">{getTeacherDisplayName(student.teacher)}</span>
                    </div>
                  )}
                </div>

                {/* Additional Info */}
                {(student.residence || student.idNumber) && (
                  <div className="flex items-center gap-4 mt-2 pt-2 border-t border-gray-50 text-xs text-gray-500">
                    {student.idNumber && (
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono">{student.idNumber}</span>
                      </div>
                    )}
                    {student.residence && (
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>{student.residence}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
