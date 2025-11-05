import React from "react";
import { FaTrash } from "react-icons/fa";

interface TeachersBulkActionsProps {
  selectedCount: number;
  onBulkDelete: () => void;
}

const TeachersBulkActions: React.FC<TeachersBulkActionsProps> = ({
  selectedCount,
  onBulkDelete,
}) => {
  if (selectedCount === 0) return null;

  return (
    <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 mb-6 flex items-center justify-between">
      <span className="text-blue-900 font-medium">
        تم تحديد {selectedCount} معلم
      </span>
      <button
        onClick={onBulkDelete}
        className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
        <FaTrash className="w-4 h-4" />
        حذف المحدد
      </button>
    </div>
  );
};

export default TeachersBulkActions;
