import React from 'react';
import { PillButton } from './PillButton';
import type { Exam } from "@/Api/examApi";
import { safeExamId } from '../utils';

export const ExamActions: React.FC<{
  exam: Exam;
  onOpenMarks: (exam: Exam) => void;
  onEditExam: (exam: Exam) => void;
  onDeleteExam: (examId: string) => void;
}> = ({ exam, onOpenMarks, onEditExam, onDeleteExam }) => {
  const examId = safeExamId(exam) || '';
  return (
    <div className="flex flex-wrap items-center justify-center gap-1 md:gap-2">
      <PillButton 
        className="text-xs md:text-sm whitespace-nowrap px-2 py-1 md:px-3 md:py-1.5" 
        onClick={() => onOpenMarks(exam)}
      >
        <span className="hidden sm:inline">إضافة العلامات</span>
        <span className="sm:hidden">علامات</span>
      </PillButton>
      <PillButton 
        variant="warn" 
        className="text-xs md:text-sm px-2 py-1 md:px-3 md:py-1.5"
        onClick={() => onEditExam(exam)}
      >
        تعديل
      </PillButton>
      <PillButton 
        variant="danger" 
        className="text-xs md:text-sm px-2 py-1 md:px-3 md:py-1.5"
        onClick={() => onDeleteExam(examId)}
      >
        حذف
      </PillButton>
    </div>
  );
};
