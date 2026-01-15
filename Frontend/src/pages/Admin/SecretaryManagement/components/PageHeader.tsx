import React, { memo } from "react";
import { FaUserShield, FaPlus, FaDownload } from "react-icons/fa";

interface SecretariesHeaderProps {
  onAddSecretary: () => void;
  onExport: () => void;
}

export const SecretariesHeader: React.FC<SecretariesHeaderProps> = memo(({
  onAddSecretary,
  onExport,
}) => (
  <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 rounded-xl shadow-md p-5 mb-6">
    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-emerald-700 rounded-lg shadow-sm">
          <FaUserShield className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">
            إدارة السكرتيرين
          </h1>
          <p className="text-white/90 text-sm mt-0.5">
            نظام متكامل لإدارة بيانات السكرتيرين
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={onExport}
          className="flex items-center gap-2 px-4 py-2.5 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 transition-colors border border-white/30 text-sm font-medium"
        >
          <FaDownload className="w-4 h-4" />
          <span className="hidden sm:inline">تصدير</span>
        </button>

        <button
          onClick={onAddSecretary}
          className="flex items-center gap-2 px-4 py-2.5 bg-white text-emerald-600 rounded-lg hover:bg-white/90 transition-colors shadow-sm text-sm font-medium font-semibold"
        >
          <FaPlus className="w-4 h-4" />
          <span className="hidden sm:inline">إضافة سكرتير</span>
          <span className="sm:hidden">إضافة</span>
        </button>
      </div>
    </div>
  </div>
));

SecretariesHeader.displayName = "SecretariesHeader";
