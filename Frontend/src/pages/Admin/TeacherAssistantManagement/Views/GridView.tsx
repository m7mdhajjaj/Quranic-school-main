import React from "react";
import { Edit2, Trash2, Mail, Phone, MapPin, Users } from "lucide-react";
import { FaMale, FaFemale } from "react-icons/fa";
import type { TeacherAssistant } from "../types";

interface GridViewProps {
  assistants: TeacherAssistant[];
  onEdit: (assistant: TeacherAssistant) => void;
  onDelete: (assistant: TeacherAssistant) => void;
  selectedIds: Set<string>;
  onToggleSelection: (id: string) => void;
}

export const GridView: React.FC<GridViewProps> = ({
  assistants,
  onEdit,
  onDelete,
  selectedIds,
  onToggleSelection,
}) => {
  const isOnline = (lastSeen?: Date) => {
    if (!lastSeen) return false;
    return new Date(lastSeen).getTime() > Date.now() - 5 * 60 * 1000;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {assistants.map((assistant) => (
        <div
          key={assistant._id}
          className={`relative bg-white rounded-2xl border-2 shadow-sm hover:shadow-lg transition-all overflow-hidden group ${
            selectedIds.has(assistant._id)
              ? "border-purple-400 ring-2 ring-purple-200"
              : "border-gray-100 hover:border-purple-200"
          }`}
        >
          {/* Selection Checkbox */}
          <div className="absolute top-3 right-3 z-10">
            <input
              type="checkbox"
              checked={selectedIds.has(assistant._id)}
              onChange={() => onToggleSelection(assistant._id)}
              className="w-5 h-5 text-purple-600 bg-white border-gray-300 rounded focus:ring-purple-500 cursor-pointer"
            />
          </div>

          {/* Header with gradient */}
          <div className="h-20 bg-gradient-to-l from-purple-600 via-indigo-600 to-purple-700 relative">
            <div className="absolute -bottom-10 right-4">
              <div className="relative">
                {assistant.avatar?.url ? (
                  <img
                    src={assistant.avatar.url}
                    alt={assistant.firstName}
                    className="w-20 h-20 rounded-xl border-4 border-white shadow-lg object-cover"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-xl border-4 border-white shadow-lg bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center">
                    {assistant.gender === 'male' || assistant.gender === 'ذكر' ? (
                      <FaMale className="w-8 h-8 text-purple-600" />
                    ) : (
                      <FaFemale className="w-8 h-8 text-purple-600" />
                    )}
                  </div>
                )}
                {/* Online indicator */}
                <div
                  className={`absolute -bottom-1 -left-1 w-5 h-5 rounded-full border-2 border-white ${
                    isOnline(assistant.lastSeen) ? "bg-green-500" : "bg-gray-400"
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="pt-12 p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-bold text-gray-900 text-lg">
                  {assistant.firstName} {assistant.lastName}
                </h3>
                <span className="text-sm text-purple-600 font-medium">
                  #{assistant.assistantId}
                </span>
              </div>
            </div>

            {/* Info */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Mail className="w-4 h-4 text-gray-400" />
                <span className="truncate">{assistant.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Phone className="w-4 h-4 text-gray-400" />
                <span dir="ltr">{assistant.phoneNumber}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span className="truncate">{assistant.residence || "-"}</span>
              </div>
            </div>

            {/* Groups */}
            {assistant.allowedGroups && assistant.allowedGroups.length > 0 && (
              <div className="mb-4">
                <div className="flex items-center gap-1.5 text-sm text-gray-600 mb-2">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span>الحلقات:</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {assistant.allowedGroups.slice(0, 3).map((group) => (
                    <span
                      key={group._id}
                      className="px-2 py-1 bg-purple-50 text-purple-700 text-xs rounded-lg"
                    >
                      {group.name}
                    </span>
                  ))}
                  {assistant.allowedGroups.length > 3 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-lg">
                      +{assistant.allowedGroups.length - 3}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <span
                className={`text-xs px-2 py-1 rounded-full ${
                  assistant.gender === 'male' || assistant.gender === 'ذكر'
                    ? "bg-blue-100 text-blue-700"
                    : "bg-pink-100 text-pink-700"
                }`}
              >
                {assistant.gender === 'male' || assistant.gender === 'ذكر' ? 'ذكر' : 'أنثى'}
                {assistant.age && ` • ${assistant.age} سنة`}
              </span>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => onEdit(assistant)}
                  className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                  title="تعديل"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDelete(assistant)}
                  className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="حذف"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
