import React from "react";
import { FaUsers, FaPlus, FaDownload } from "react-icons/fa";

interface GroupsHeaderProps {
  isConnected: boolean;

  onAddClick: () => void;
  onExport: () => void;
  hasGroups: boolean;
}

export const GroupsHeader: React.FC<GroupsHeaderProps> = ({

  onAddClick,
  onExport,
  hasGroups,
}) => {
  return (
    <div className="bg-gradient-to-br from-white to-emerald-50/30 rounded-xl shadow-sm border border-emerald-100 p-5 mb-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg shadow-sm">
            <FaUsers className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-700 to-emerald-600 bg-clip-text text-transparent">إدارة الحلقات</h1>
            <p className="text-gray-600 text-sm mt-0.5">نظام متكامل لإدارة حلقات تحفيظ القرآن</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onExport}
            disabled={!hasGroups}
            className="flex items-center gap-2 px-4 py-2.5 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-colors border border-gray-200 disabled:bg-gray-100 disabled:cursor-not-allowed text-sm font-medium">
            <FaDownload className="w-4 h-4" />
            <span className="hidden sm:inline">تصدير</span>
          </button>

          <button
            onClick={onAddClick}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-sm text-sm font-medium">
            <FaPlus className="w-4 h-4" />
            <span className="hidden sm:inline">إضافة حلقة</span>
            <span className="sm:hidden">إضافة</span>
          </button>
        </div>
      </div>
    </div>
  );
};
