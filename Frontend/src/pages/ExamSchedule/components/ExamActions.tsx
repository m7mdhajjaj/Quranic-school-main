import React from 'react';
import type { Exam } from "@/Api/exam.api";

export const ExamActions: React.FC<{
  exam: Exam;
  onOpenMarks: (exam: Exam) => void;
  onEditExam: (exam: Exam) => void;
  onDeleteExam: (examId: string) => void;
}> = ({ exam, onOpenMarks, onEditExam, onDeleteExam }) => {
  const examId = String(exam._id ?? exam.id);
  
  return (
    <div className="flex flex-wrap items-center justify-center gap-1 md:gap-2">
      <button 
        className="text-xs md:text-sm whitespace-nowrap px-2 py-1 md:px-3 md:py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors" 
        onClick={() => onOpenMarks(exam)}
      >
        <span className="hidden sm:inline">إضافة العلامات</span>
        <span className="sm:hidden">علامات</span>
      </button>
      <button 
        className="text-xs md:text-sm px-2 py-1 md:px-3 md:py-1.5 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-colors"
        onClick={() => onEditExam(exam)}
      >
        تعديل
      </button>
      <button 
        className="text-xs md:text-sm px-2 py-1 md:px-3 md:py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
        onClick={() => onDeleteExam(examId)}
      >
        حذف
      </button>
    </div>
  );
};
