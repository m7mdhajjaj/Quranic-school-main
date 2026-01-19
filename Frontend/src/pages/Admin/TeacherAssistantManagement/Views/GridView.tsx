import React, { memo, useContext } from "react";
import { Edit, Trash2, Mail, Phone, Calendar, MapPin, HandHelping, CreditCard, Users } from "lucide-react";
import Avatar from "@/components/Avatar/Avatar";
import { UserStatusContext } from "@/Context/UserStatusContext";
import type { TeacherAssistant } from "../types";

interface AssistantGridViewProps {
  assistants: TeacherAssistant[];
  onEdit: (assistant: TeacherAssistant) => void;
  onDelete: (assistant: TeacherAssistant) => void;
  selectedIds?: Set<string>;
  onToggleSelection?: (id: string) => void;
}

export const AssistantGridView: React.FC<AssistantGridViewProps> = memo(({
  assistants,
  onEdit,
  onDelete,
  selectedIds = new Set(),
  onToggleSelection,
}) => {
  // استخدام UserStatusContext للحصول على حالة real-time
  const userStatusContext = useContext(UserStatusContext);
  const isUserOnline = userStatusContext?.isUserOnline || (() => false);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6" dir="rtl">
      {assistants.map((assistant) => (
        <div
          key={assistant._id}
          className={`bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all group relative ${selectedIds.has(assistant._id) ? 'ring-2 ring-emerald-500 shadow-md transform scale-[1.01] sm:scale-[1.02]' : ''}`}
        >
          {/* Checkbox Selection Overlay */}
          <div className="absolute top-2 right-2 z-20">
             <div 
               className={`w-6 h-6 rounded-full border-2 flex items-center justify-center cursor-pointer transition-colors bg-white ${selectedIds.has(assistant._id) ? 'border-emerald-500 bg-emerald-50' : 'border-white/40 hover:border-white'}`}
               onClick={() => onToggleSelection?.(assistant._id)}
             >
               {selectedIds.has(assistant._id) && (
                 <div className="w-3 h-3 bg-emerald-500 rounded-full" />
               )}
             </div>
          </div>

          {/* Header with gradient */}
          <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 p-4 relative">
            
            <div className="absolute top-2 left-2 flex gap-1 z-10">
              <button
                onClick={() => onEdit(assistant)}
                className="p-2 bg-white/20 hover:bg-white/40 rounded-lg transition-colors"
                title="تعديل"
              >
                <Edit className="w-4 h-4 text-white" />
              </button>
              <button
                onClick={() => onDelete(assistant)}
                className="p-2 bg-white/20 hover:bg-red-500 rounded-lg transition-colors"
                title="حذف"
              >
                <Trash2 className="w-4 h-4 text-white" />
              </button>
            </div>
            
            <div className="flex items-center gap-3">
              <Avatar
                user={{
                  _id: assistant._id,
                  firstName: assistant.firstName,
                  lastName: assistant.lastName,
                  gender: assistant.gender,
                  role: "teacherAssistant",
                  avatar: assistant.avatar,
                  lastSeen: assistant.lastSeen,
                }}
                userName={[assistant.firstName, assistant.fatherName, assistant.grandFatherName, assistant.lastName].filter(Boolean).join(" ")}
                gender={assistant.gender as "male" | "female" | "ذكر" | "أنثى"}
                size="lg"
                border="ring"
                showStatus={true}
              />
              <div className="text-white flex-1 min-w-0">
                <h3 className="font-bold text-lg truncate">
                  {[assistant.firstName, assistant.fatherName, assistant.grandFatherName, assistant.lastName].filter(Boolean).join(" ")}
                </h3>
                
                {/* Status Indicator in Header */}
                <div className="flex items-center gap-2 mt-1">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium border ${
                    isUserOnline(assistant._id)
                    ? 'bg-green-500/20 text-white border-green-400/30'
                    : 'bg-white/10 text-white/70 border-white/10'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ml-1.5 ${
                      isUserOnline(assistant._id)
                      ? 'bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.6)]'
                      : 'bg-gray-400'
                    }`}></span>
                    {isUserOnline(assistant._id) ? 'متصل الآن' : 'غير متصل'}
                  </span>

                  {/* حالة التعيين - له حلقة/بدون حلقة */}
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium border ${
                    assistant.allowedGroups && assistant.allowedGroups.length > 0
                    ? 'bg-emerald-500/20 text-white border-emerald-400/30'
                    : 'bg-red-500/20 text-white border-red-400/30'
                  }`}>
                    <Users className="w-2.5 h-2.5 ml-1" />
                    {assistant.allowedGroups && assistant.allowedGroups.length > 0 
                      ? `${assistant.allowedGroups.length} حلقة` 
                      : 'بدون حلقة'}
                  </span>
                  
                  <p className="text-white/80 text-xs flex items-center gap-1">
                    <HandHelping className="w-3 h-3" />
                    #{assistant.assistantId}
                  </p>
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
                assistant.gender === 'male' || assistant.gender === 'ذكر'
                  ? 'bg-blue-50 text-blue-700'
                  : 'bg-pink-50 text-pink-700'
              }`}>
                {assistant.gender === "male" ? "ذكر" : assistant.gender === "female" ? "أنثى" : assistant.gender}
              </span>
            </div>

            {/* Age Row */}
            {assistant.age && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4 text-emerald-500/70" />
                <span className="text-gray-400 text-xs text-nowrap">العمر:</span>
                <span className="font-medium">{assistant.age} سنة</span>
              </div>
            )}

            {/* Mother Name */}
            {assistant.motherName && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span className="text-gray-400 text-xs">اسم الأم:</span>
                <span className="font-medium">{assistant.motherName}</span>
              </div>
            )}

            {/* رقم الهوية */}
            {assistant.idNumber && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <CreditCard className="w-4 h-4 text-emerald-500/70" />
                <span className="text-gray-400 text-xs text-nowrap">رقم الهوية:</span>
                <span dir="ltr" className="font-medium">{assistant.idNumber}</span>
              </div>
            )}

            {/* Phone */}
            {assistant.phoneNumber && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Phone className="w-4 h-4 text-emerald-500/70" />
                <span className="text-gray-400 text-xs text-nowrap">رقم الهاتف:</span>
                <span dir="ltr" className="font-medium">{assistant.phoneNumber}</span>
              </div>
            )}

            {/* Email */}
            {assistant.email && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Mail className="w-4 h-4 text-emerald-500/70" />
                <span className="text-gray-400 text-xs text-nowrap">البريد:</span>
                <span className="truncate font-medium">{assistant.email}</span>
              </div>
            )}

            {/* Residence */}
            {assistant.residence && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="w-4 h-4 text-emerald-500/70" />
                <span className="text-gray-400 text-xs text-nowrap">السكن:</span>
                <span className="truncate font-medium">{assistant.residence}</span>
              </div>
            )}

            {/* Allowed Groups */}
            {assistant.allowedGroups && assistant.allowedGroups.length > 0 && (
              <div className="pt-3 border-t border-gray-100">
                <p className="text-xs text-gray-500 mb-2 font-medium flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" />
                  الحلقات المسموحة:
                </p>
                <div className="flex flex-wrap gap-1">
                  {assistant.allowedGroups.slice(0, 3).map((group) => (
                    <span
                      key={group._id}
                      className="px-2 py-0.5 text-[10px] border rounded-md bg-emerald-50 text-emerald-700 border-emerald-100"
                    >
                      {group.name}
                    </span>
                  ))}
                  {assistant.allowedGroups.length > 3 && (
                    <span className="px-2 py-0.5 bg-gray-50 text-gray-600 text-[10px] border border-gray-100 rounded-md">
                      +{assistant.allowedGroups.length - 3}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
});

AssistantGridView.displayName = "AssistantGridView";

// Backward compatibility alias
export const GridView = AssistantGridView;
