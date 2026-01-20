import React from "react";
import { FaPlus, FaDownload, FaUserTie } from "react-icons/fa";

interface TeachersHeaderProps {
  onAddTeacher: () => void;
  onExport: () => void;
  hasTeachers: boolean;
  isReadOnly?: boolean;
}

const TeachersHeader: React.FC<TeachersHeaderProps> = ({
  onAddTeacher,
  onExport,
  hasTeachers,
  isReadOnly = false,
}) => {
  return (
    <div className="bg-gradient-to-r from-emerald-600 via-teal-700 to-slate-700 rounded-2xl shadow-xl p-5 mb-6 border border-white/10">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-white/15 backdrop-blur-sm rounded-xl shadow-sm">
            <FaUserTie className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">👨‍🏫 إدارة المعلمين</h1>
            <p className="text-white/70 text-sm mt-0.5">نظام متكامل لإدارة بيانات المعلمين</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onExport}
            disabled={!hasTeachers}
            className="flex items-center gap-2 px-4 py-2.5 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 transition-colors border border-white/30 disabled:bg-white/10 disabled:cursor-not-allowed text-sm font-medium">
            <FaDownload className="w-4 h-4" />
            <span className="hidden sm:inline">تصدير</span>
          </button>

          {!isReadOnly && (
            <button
              onClick={onAddTeacher}
              className="flex items-center gap-2 px-4 py-2.5 bg-white text-emerald-600 rounded-lg hover:bg-white/90 transition-colors shadow-sm text-sm font-medium font-semibold">
              <FaPlus className="w-4 h-4" />
              <span className="hidden sm:inline">إضافة معلم</span>
              <span className="sm:hidden">إضافة</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeachersHeader;
