import React, { memo, useContext } from "react";
import { Edit, Trash2, Mail, Phone, Calendar, MapPin, Users, GraduationCap, CreditCard } from "lucide-react";
import type { Student } from "@/Api/studentApi";
import Avatar from "@/components/Avatar/Avatar";
import { UserStatusContext } from "@/Context/UserStatusContext";

interface StudentGridViewProps {
  students: Student[];
  onEdit: (student: Student) => void;
  onDelete: (student: Student) => void;
  userRole?: string;
  isReadOnly?: boolean;
  selectedIds?: Set<string>;
  onToggleSelection?: (id: string) => void;
}

// دالة مساعدة للحصول على اسم الحلقة بشكل آمن
const getGroupDisplayName = (
  group: string | { name?: string; id?: string; number?: number } | null | undefined
): string => {
  if (!group) return "غير محدد";
  if (typeof group === "string") return group;
  return group.name || "غير محدد";
};

export const StudentGridView: React.FC<StudentGridViewProps> = memo(({
  students,
  onEdit,
  onDelete,
  userRole,
  isReadOnly = false,
  selectedIds = new Set(),
  onToggleSelection,
}) => {
  // استخدام UserStatusContext للحصول على حالة real-time
  const userStatusContext = useContext(UserStatusContext);
  const isUserOnline = userStatusContext?.isUserOnline || (() => false);

  // إخفاء studentId للمعلم والسكرتير والطالب
  const showStudentId = userRole !== 'secretary' && userRole !== 'teacher' && userRole !== 'student';

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6" dir="rtl">
      {students.map((student) => (
        <div
          key={student._id}
          className={`bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all group relative ${selectedIds.has(student._id) ? 'ring-2 ring-emerald-500 shadow-md transform scale-[1.01] sm:scale-[1.02]' : ''}`}
        >
          {/* Checkbox Selection Overlay */}
          {onToggleSelection && (
            <div className="absolute top-2 right-2 z-20">
              <div 
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center cursor-pointer transition-colors bg-white ${selectedIds.has(student._id) ? 'border-emerald-500 bg-emerald-50' : 'border-white/40 hover:border-white'}`}
                onClick={() => onToggleSelection(student._id)}
              >
                {selectedIds.has(student._id) && (
                  <div className="w-3 h-3 bg-emerald-500 rounded-full" />
                )}
              </div>
            </div>
          )}

          {/* Header with gradient */}
          <div className="bg-gradient-to-r from-emerald-600 via-teal-700 to-slate-700 p-4 relative">
            {!isReadOnly && (
              <div className="absolute top-2 left-2 flex gap-1 z-10">
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
            )}
            
            <div className="flex items-center gap-3">
              <Avatar
                user={{
                  _id: student._id,
                  firstName: student.firstName,
                  lastName: student.lastName,
                  gender: student.gender,
                  role: "student",
                  avatar: student.avatar,
                  lastSeen: student.lastSeen,
                }}
                userName={[student.firstName, student.fatherName, student.grandFatherName, student.lastName].filter(Boolean).join(" ")}
                gender={student.gender as "male" | "female" | "ذكر" | "أنثى"}
                size="lg"
                border="ring"
                showStatus={true}
              />
              <div className="text-white flex-1 min-w-0">
                <h3 className="font-bold text-lg truncate">
                  {[student.firstName, student.fatherName, student.grandFatherName, student.lastName].filter(Boolean).join(" ")}
                </h3>
                
                {/* Status Indicator in Header */}
                <div className="flex items-center gap-2 mt-1">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium border ${
                    isUserOnline(student._id)
                    ? 'bg-green-500/20 text-white border-green-400/30'
                    : 'bg-white/10 text-white/70 border-white/10'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ml-1.5 ${
                      isUserOnline(student._id)
                      ? 'bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.6)]'
                      : 'bg-gray-400'
                    }`}></span>
                    {isUserOnline(student._id) ? 'متصل الآن' : 'غير متصل'}
                  </span>
                  
                  {showStudentId && (
                    <p className="text-white/80 text-xs flex items-center gap-1">
                      <GraduationCap className="w-3 h-3" />
                      #{student.studentId}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 space-y-3">
            {/* Gender Row */}
            <div className="flex items-center justify-start text-sm pb-2 border-b border-gray-50">
              <span className="text-gray-400 text-xs ml-2">الجنس:</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                student.gender === 'male' || student.gender === 'ذكر'
                  ? 'bg-blue-50 text-blue-700'
                  : 'bg-pink-50 text-pink-700'
              }`}>
                {student.gender === "male" ? "ذكر" : student.gender === "female" ? "أنثى" : student.gender}
              </span>
            </div>

            {/* Age Row */}
            {student.age && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4 text-emerald-500/70" />
                <span className="text-gray-400 text-xs text-nowrap">العمر:</span>
                <span className="font-medium">{student.age} سنة</span>
              </div>
            )}

            {/* Mother Name */}
            {student.motherName && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span className="text-gray-400 text-xs">اسم الأم:</span>
                <span className="font-medium">{student.motherName}</span>
              </div>
            )}

            {/* رقم الهوية */}
            {student.idNumber && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <CreditCard className="w-4 h-4 text-emerald-500/70" />
                <span className="text-gray-400 text-xs text-nowrap">رقم الهوية:</span>
                <span dir="ltr" className="font-medium">{student.idNumber}</span>
              </div>
            )}

            {/* Phone */}
            {student.phoneNumber && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Phone className="w-4 h-4 text-emerald-500/70" />
                <span className="text-gray-400 text-xs text-nowrap">رقم الهاتف:</span>
                <span dir="ltr" className="font-medium">{student.phoneNumber}</span>
              </div>
            )}

            {/* Email */}
            {student.email && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Mail className="w-4 h-4 text-emerald-500/70" />
                <span className="text-gray-400 text-xs text-nowrap">البريد:</span>
                <span className="truncate font-medium">{student.email}</span>
              </div>
            )}

            {/* Residence */}
            {student.residence && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="w-4 h-4 text-emerald-500/70" />
                <span className="text-gray-400 text-xs text-nowrap">السكن:</span>
                <span className="truncate font-medium">{student.residence}</span>
              </div>
            )}

            {/* Group & Teacher */}
            <div className="pt-3 border-t border-gray-100">
              <p className="text-xs text-gray-500 mb-2 font-medium flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                الحلقة والمعلم:
              </p>
              <div className="flex flex-wrap gap-1">
                {student.group ? (
                  <span className="px-2 py-0.5 text-[10px] border rounded-md bg-emerald-50 text-emerald-700 border-emerald-100">
                    {getGroupDisplayName(student.group)}
                  </span>
                ) : (
                  <span className="px-2 py-0.5 bg-gray-50 text-gray-400 text-[10px] border border-gray-100 rounded-md">
                    لا توجد حلقة
                  </span>
                )}
                {(student.teacherFullName || student.teacher) && (
                  <span className="px-2 py-0.5 text-[10px] border rounded-md bg-teal-50 text-teal-700 border-teal-100">
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
});

StudentGridView.displayName = "StudentGridView";
