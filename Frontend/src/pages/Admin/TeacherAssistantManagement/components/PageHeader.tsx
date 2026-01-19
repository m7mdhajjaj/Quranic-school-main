import React, { memo } from "react";
import { FaHandsHelping, FaPlus, FaDownload, FaTrash } from "react-icons/fa";

interface AssistantsHeaderProps {
  onAddAssistant: () => void;
  onExport: () => void;
  selectedCount?: number;
  onBulkDelete?: () => void;
}

export const AssistantsHeader: React.FC<AssistantsHeaderProps> = memo(({
  onAddAssistant,
  onExport,
  selectedCount = 0,
  onBulkDelete,
}) => (
  <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 rounded-xl shadow-md p-3 sm:p-4 lg:p-5 mb-4 sm:mb-6">
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="p-2 sm:p-2.5 bg-emerald-700 rounded-lg shadow-sm">
          <FaHandsHelping className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
        </div>
        <div>
          <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-white">
            إدارة مساعدي المدرسين
          </h1>
          <p className="text-white/90 text-xs sm:text-sm mt-0.5 hidden xs:block">
            {selectedCount > 0 ? `تم تحديد ${selectedCount} مساعد` : "نظام متكامل لإدارة بيانات مساعدي المدرسين"}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
        {selectedCount > 0 && onBulkDelete && (
          <button
            onClick={onBulkDelete}
            className="flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-red-500/90 backdrop-blur-sm text-white rounded-lg hover:bg-red-600 transition-colors border border-red-400/30 text-xs sm:text-sm font-medium flex-1 sm:flex-none"
          >
            <FaTrash className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden xs:inline">حذف ({selectedCount})</span>
            <span className="xs:hidden">{selectedCount}</span>
          </button>
        )}

        <button
          onClick={onExport}
          className="flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 transition-colors border border-white/30 text-xs sm:text-sm font-medium flex-1 sm:flex-none"
        >
          <FaDownload className="w-3 h-3 sm:w-4 sm:h-4" />
          <span className="hidden sm:inline">تصدير</span>
        </button>

        <button
          onClick={onAddAssistant}
          className="flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-white text-emerald-600 rounded-lg hover:bg-white/90 transition-colors shadow-sm text-xs sm:text-sm font-medium font-semibold flex-1 sm:flex-none"
        >
          <FaPlus className="w-3 h-3 sm:w-4 sm:h-4" />
          <span className="hidden sm:inline">إضافة مساعد</span>
          <span className="sm:hidden">إضافة</span>
        </button>
      </div>
    </div>
  </div>
));

AssistantsHeader.displayName = "AssistantsHeader";

// Backward compatibility alias
export const PageHeader = AssistantsHeader;
