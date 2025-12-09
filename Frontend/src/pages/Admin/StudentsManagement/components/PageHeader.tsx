import React from "react";
import { FaPlus, FaDownload, FaUserGraduate } from "react-icons/fa";
import { Button } from "@/components/UI";

interface StudentsHeaderProps {
  onAddStudent: () => void;
  onExport: () => void;
  hasStudents: boolean;
}

const StudentsHeader: React.FC<StudentsHeaderProps> = ({
  onAddStudent,
  onExport,
  hasStudents,
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 mb-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 rounded-lg">
            <FaUserGraduate className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">إدارة الطلاب</h1>
            <p className="text-gray-500 text-sm mt-0.5">نظام متكامل لإدارة بيانات الطلاب</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            onClick={onExport}
            disabled={!hasStudents}
            variant="secondary"
            size="md"
            leftIcon={<FaDownload />}>
            <span className="hidden sm:inline">تصدير</span>
          </Button>

          <Button
            onClick={onAddStudent}
            variant="primary"
            size="md"
            leftIcon={<FaPlus />}>
            <span className="hidden sm:inline">إضافة طالب</span>
            <span className="sm:hidden">إضافة</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default StudentsHeader;
