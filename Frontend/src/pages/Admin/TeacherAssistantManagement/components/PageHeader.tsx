import React from "react";
import { UserPlus, Download, Trash2, HandHelping } from "lucide-react";

interface PageHeaderProps {
  onAddAssistant: () => void;
  onExport: () => void;
  selectedCount: number;
  onBulkDelete: () => void;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  onAddAssistant,
  onExport,
  selectedCount,
  onBulkDelete,
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      {/* Title */}
      <div className="flex items-center gap-3">
        <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl shadow-lg">
          <HandHelping className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">إدارة مساعدي المدرسين</h1>
          <p className="text-gray-500 text-sm">إضافة وتعديل وحذف مساعدي المدرسين</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {selectedCount > 0 && (
          <button
            onClick={onBulkDelete}
            className="flex items-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors shadow-sm"
          >
            <Trash2 className="w-4 h-4" />
            <span>حذف ({selectedCount})</span>
          </button>
        )}

        <button
          onClick={onExport}
          className="flex items-center gap-2 px-4 py-2.5 bg-white text-gray-700 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors shadow-sm"
        >
          <Download className="w-4 h-4" />
          <span className="hidden sm:inline">تصدير</span>
        </button>

        <button
          onClick={onAddAssistant}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-l from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg shadow-purple-500/25"
        >
          <UserPlus className="w-4 h-4" />
          <span>إضافة مساعد</span>
        </button>
      </div>
    </div>
  );
};
