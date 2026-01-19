import React, { memo, useContext } from "react";
import { Edit, Trash2, Calendar, MapPin, Mail, Phone, Users, CreditCard, GraduationCap } from "lucide-react";
import type { Teacher } from "@/Api/teacherApi";
import Avatar from "@/components/Avatar/Avatar";
import { UserStatusContext } from "@/Context/UserStatusContext";
import { getGroupDisplayName } from '../utils/teacherHelpers';

interface TeacherGridViewProps {
  teachers: Teacher[];
  onEdit: (teacher: Teacher) => void;
  onDelete: (teacher: Teacher) => void;
  isReadOnly?: boolean;
  userRole?: string;
  selectedIds?: Set<string>;
  onToggleSelection?: (id: string) => void;
}

export const TeacherGridView: React.FC<TeacherGridViewProps> = memo(({
  teachers,
  onEdit,
  onDelete,
  isReadOnly = false,
  userRole,
  selectedIds = new Set(),
  onToggleSelection,
}) => {
  // استخدام UserStatusContext للحصول على حالة real-time
  const userStatusContext = useContext(UserStatusContext);
  const isUserOnline = userStatusContext?.isUserOnline || (() => false);

  // إخفاء teacherId للسكرتير
  const showTeacherId = userRole !== 'secretary';

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6" dir="rtl">
      {teachers.map((teacher) => (
        <div
          key={teacher._id}
          className={`bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all group relative ${selectedIds.has(teacher._id) ? 'ring-2 ring-emerald-500 shadow-md transform scale-[1.01] sm:scale-[1.02]' : ''}`}
        >
          {/* Checkbox Selection Overlay */}
          {onToggleSelection && (
            <div className="absolute top-2 right-2 z-20">
              <div 
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center cursor-pointer transition-colors bg-white ${selectedIds.has(teacher._id) ? 'border-emerald-500 bg-emerald-50' : 'border-white/40 hover:border-white'}`}
                onClick={() => onToggleSelection(teacher._id)}
              >
                {selectedIds.has(teacher._id) && (
                  <div className="w-3 h-3 bg-emerald-500 rounded-full" />
                )}
              </div>
            </div>
          )}

          {/* Header with gradient */}
          <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 p-4 relative">
            {!isReadOnly && (
              <div className="absolute top-2 left-2 flex gap-1 z-10">
                <button
                  onClick={() => onEdit(teacher)}
                  className="p-2 bg-white/20 hover:bg-white/40 rounded-lg transition-colors"
                  title="تعديل"
                >
                  <Edit className="w-4 h-4 text-white" />
                </button>
                <button
                  onClick={() => onDelete(teacher)}
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
                  _id: teacher._id,
                  firstName: teacher.firstName,
                  lastName: teacher.lastName,
                  gender: teacher.gender,
                  role: "teacher",
                  avatar: teacher.avatar,
                  lastSeen: teacher.lastSeen,
                }}
                userName={[teacher.firstName, teacher.fatherName, teacher.grandFatherName, teacher.lastName].filter(Boolean).join(" ")}
                gender={teacher.gender as "male" | "female" | "ذكر" | "أنثى"}
                size="lg"
                border="ring"
                showStatus={true}
              />
              <div className="text-white flex-1 min-w-0">
                <h3 className="font-bold text-lg truncate">
                  {[teacher.firstName, teacher.fatherName, teacher.grandFatherName, teacher.lastName].filter(Boolean).join(" ")}
                </h3>
                
                {/* Status Indicator in Header */}
                <div className="flex items-center gap-2 mt-1">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium border ${
                    isUserOnline(teacher._id)
                    ? 'bg-green-500/20 text-white border-green-400/30'
                    : 'bg-white/10 text-white/70 border-white/10'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ml-1.5 ${
                      isUserOnline(teacher._id)
                      ? 'bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.6)]'
                      : 'bg-gray-400'
                    }`}></span>
                    {isUserOnline(teacher._id) ? 'متصل الآن' : 'غير متصل'}
                  </span>

                  {/* حالة الحلقات */}
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium border ${
                    teacher.groups && teacher.groups.length > 0
                    ? 'bg-emerald-500/20 text-white border-emerald-400/30'
                    : 'bg-red-500/20 text-white border-red-400/30'
                  }`}>
                    <Users className="w-2.5 h-2.5 ml-1" />
                    {teacher.groups && teacher.groups.length > 0 
                      ? `${teacher.groups.length} حلقة` 
                      : 'بدون حلقة'}
                  </span>
                  
                  {showTeacherId && (
                    <p className="text-white/80 text-xs flex items-center gap-1">
                      <GraduationCap className="w-3 h-3" />
                      #{teacher.teacherId}
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
                teacher.gender === 'male' || teacher.gender === 'ذكر'
                  ? 'bg-blue-50 text-blue-700'
                  : 'bg-pink-50 text-pink-700'
              }`}>
                {teacher.gender === "male" ? "ذكر" : teacher.gender === "female" ? "أنثى" : teacher.gender}
              </span>
            </div>

            {/* Age Row */}
            {teacher.age && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4 text-emerald-500/70" />
                <span className="text-gray-400 text-xs text-nowrap">العمر:</span>
                <span className="font-medium">{teacher.age} سنة</span>
              </div>
            )}

            {/* Mother Name */}
            {teacher.motherName && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span className="text-gray-400 text-xs">اسم الأم:</span>
                <span className="font-medium">{teacher.motherName}</span>
              </div>
            )}

            {/* رقم الهوية */}
            {teacher.idNumber && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <CreditCard className="w-4 h-4 text-emerald-500/70" />
                <span className="text-gray-400 text-xs text-nowrap">رقم الهوية:</span>
                <span dir="ltr" className="font-medium">{teacher.idNumber}</span>
              </div>
            )}

            {/* Phone */}
            {teacher.phoneNumber && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Phone className="w-4 h-4 text-emerald-500/70" />
                <span className="text-gray-400 text-xs text-nowrap">رقم الهاتف:</span>
                <span dir="ltr" className="font-medium">{teacher.phoneNumber}</span>
              </div>
            )}

            {/* Email */}
            {teacher.email && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Mail className="w-4 h-4 text-emerald-500/70" />
                <span className="text-gray-400 text-xs text-nowrap">البريد:</span>
                <span className="truncate font-medium">{teacher.email}</span>
              </div>
            )}

            {/* Residence */}
            {teacher.residence && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="w-4 h-4 text-emerald-500/70" />
                <span className="text-gray-400 text-xs text-nowrap">السكن:</span>
                <span className="truncate font-medium">{teacher.residence}</span>
              </div>
            )}

            {/* Groups */}
            <div className="pt-3 border-t border-gray-100">
              <p className="text-xs text-gray-500 mb-2 font-medium flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                الحلقات:
              </p>
              <div className="flex flex-wrap gap-1">
                {teacher.groups && Array.isArray(teacher.groups) && teacher.groups.length > 0 ? (
                  <>
                    {teacher.groups.slice(0, 3).map((group, index) => (
                      <span key={index} className="px-2 py-0.5 text-[10px] border rounded-md bg-emerald-50 text-emerald-700 border-emerald-100">
                        {getGroupDisplayName(group)}
                      </span>
                    ))}
                    {teacher.groups.length > 3 && (
                      <span className="px-2 py-0.5 bg-gray-50 text-gray-600 text-[10px] border border-gray-100 rounded-md">
                        +{teacher.groups.length - 3}
                      </span>
                    )}
                  </>
                ) : (
                  <span className="px-2 py-0.5 bg-gray-50 text-gray-400 text-[10px] border border-gray-100 rounded-md">
                    لا توجد حلقات
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

TeacherGridView.displayName = "TeacherGridView";
