import React from "react";
import { Edit, Trash2, Mail, Phone, Calendar, MapPin, Users, GraduationCap } from "lucide-react";
import type { Student } from "@/Api/studentApi";
import Avatar from "@/components/Avatar/Avatar";

interface StudentGridViewProps {
  students: Student[];
  onEdit: (student: Student) => void;
  onDelete: (student: Student) => void;
  userRole?: string;
}

// دالة مساعدة للحصول على اسم الحلقة بشكل آمن
const getGroupDisplayName = (
  group: string | { name?: string; id?: string; number?: number } | null | undefined
): string => {
  if (!group) return "غير محدد";
  if (typeof group === "string") return group;
  return group.name || "غير محدد";
};

export const StudentGridView: React.FC<StudentGridViewProps> = ({
  students,
  onEdit,
  onDelete,
  userRole,
}) => {
  // إخفاء studentId للمعلم والسكرتير والطالب
  const showStudentId = userRole !== 'secretary' && userRole !== 'teacher' && userRole !== 'student';

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {students.map((student) => (
        <div
          key={student._id}
          className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all group"
        >
          {/* Header with gradient */}
          <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 p-4 relative">
            <div className="absolute top-2 left-2 flex gap-1">
              <button
                onClick={() => onEdit(student)}
                className="p-2 bg-white/20 hover:bg-white/40 rounded-lg transition-colors"
                title="تعديل"
              >
                <Edit className="w-4 h-4 text-white" />
              </button>
              <button
                onClick={() => onDelete(student)}
                className="p-2 bg-white/20 hover:bg-red-500 rounded-lg transition-colors"
                title="حذف"
              >
                <Trash2 className="w-4 h-4 text-white" />
              </button>
            </div>
            
            <div className="flex items-center gap-3">
              <Avatar
                user={{
                  _id: student._id,
                  firstName: student.firstName,
                  lastName: student.lastName,
                  gender: student.gender,
                  role: "student",
                }}
                userName={`${student.firstName} ${student.lastName}`}
                gender={student.gender as "male" | "female" | "ذكر" | "أنثى"}
                size="lg"
                border="ring"
                showStatus={false}
              />
              <div className="text-white">
                <h3 className="font-bold text-lg">
                  {student.firstName} {student.lastName}
                </h3>
                {showStudentId && (
                  <p className="text-white/80 text-sm flex items-center gap-1">
                    <GraduationCap className="w-3 h-3" />
                    طالب #{student.studentId}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 space-y-3">
            {student.email && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Mail className="w-4 h-4 text-gray-400" />
                <span className="truncate">{student.email}</span>
              </div>
            )}
            
            {student.phoneNumber && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Phone className="w-4 h-4 text-gray-400" />
                <span dir="ltr">{student.phoneNumber}</span>
              </div>
            )}

            {student.age && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span>{student.age} سنة</span>
              </div>
            )}

            {student.residence && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span className="truncate">{student.residence}</span>
              </div>
            )}

            {/* Group & Teacher */}
            <div className="pt-3 border-t border-gray-100">
              <div className="flex flex-wrap gap-2">
                {student.group ? (
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs rounded-full flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {getGroupDisplayName(student.group)}
                  </span>
                ) : (
                  <span className="text-xs text-gray-400">لا توجد حلقة</span>
                )}
                {(student.teacherFullName || student.teacher) && (
                  <span className="px-2 py-0.5 bg-violet-100 text-violet-700 text-xs rounded-full flex items-center gap-1">
                    <GraduationCap className="w-3 h-3" />
                    {student.teacherFullName || student.teacher}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
