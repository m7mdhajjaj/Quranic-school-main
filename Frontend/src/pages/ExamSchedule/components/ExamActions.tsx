import React from 'react';
import { FileEdit, Trash2 } from 'lucide-react';
import type { Exam } from "@/Api/ExamShedule";

export const ExamActions: React.FC<{
  exam: Exam;
  onEditExam: (exam: Exam) => void;
  onDeleteExam: (examId: string) => void;
}> = ({ exam, onEditExam, onDeleteExam }) => {
  const examId = String(exam._id ?? exam.id);

  return (
    <div className="flex items-center justify-center gap-2">
      {/* زر التعديل */}
      <button
        className="flex items-center gap-1.5 text-sm px-3 py-2 bg-gradient-to-r from-emerald-600 via-teal-700 to-slate-700 hover:from-emerald-700 hover:via-teal-800 hover:to-slate-800 text-white rounded-lg transition-all hover:shadow-lg font-medium transform hover:scale-105"
        onClick={() => onEditExam(exam)}
        title="تعديل الامتحان"
      >
        <FileEdit className="w-4 h-4" />
        <span>تعديل</span>
      </button>
      
      {/* زر الحذف */}
      <button
        className="flex items-center gap-1.5 text-sm px-3 py-2 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white rounded-lg transition-all hover:shadow-lg font-medium transform hover:scale-105"
        onClick={() => onDeleteExam(examId)}
        title="حذف الامتحان"
      >
        <Trash2 className="w-4 h-4" />
        <span>حذف</span>
      </button>
    </div>
  );
};
