import React from 'react';
import type { Exam } from '../../../Api/examApi';
import type { Column } from '../../../components/shared/Table';
import { AvgBadge, StudentMarkDisplay } from '../components';
import { formatDateArabic, formatTime12Arabic, safeExamId } from '../utils';

export function createExamColumns(params: {
  role: 'student' | 'teacher' | 'admin';
  examAverages: Record<string, number | null>;
  studentMarks: Record<string, string>;
  ActionsComponent?: React.FC<{ exam: Exam }>;
}): Column<Exam>[] {
  const { role, examAverages, studentMarks, ActionsComponent } = params;
  const cols: Column<Exam>[] = [
    {
      key: 'name',
      header: 'اسم الامتحان',
      width: '200px',
  render: (exam: Exam) => (
        <span className="font-semibold text-emerald-900 text-xs md:text-sm break-words">{exam.name}</span>
      ),
    },
    {
      key: 'group',
      header: 'الحلقة',
      width: '140px',
  render: (exam: Exam) =>
        exam.group ? (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 md:px-3 md:py-1 bg-blue-100 text-blue-700 rounded-full text-xs md:text-sm font-medium whitespace-nowrap">
            <span className="hidden sm:inline">📚</span>
            <span className="break-words">{exam.group}</span>
          </span>
        ) : (
          <span className="text-gray-400 text-xs">-</span>
        ),
    },
    {
      key: 'date',
      header: 'التاريخ',
      width: '140px',
  render: (exam: Exam) => (
        <div className="flex items-center justify-center gap-1 md:gap-2">
          <span className="text-emerald-700 font-medium text-xs md:text-sm whitespace-nowrap">{formatDateArabic(exam.date)}</span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 md:h-4 md:w-4 text-emerald-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      ),
    },
    {
      key: 'time',
      header: 'الوقت',
      width: '120px',
  render: (exam: Exam) => (
        <div className="flex items-center justify-center gap-1 md:gap-2">
          <span className="text-emerald-700 font-medium text-xs md:text-sm whitespace-nowrap">{formatTime12Arabic(exam.time)}</span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 md:h-4 md:w-4 text-emerald-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      ),
    },
    {
      key: 'result',
      header: role === 'teacher' || role === 'admin' ? 'متوسط العلامات' : 'النتيجة',
      width: role === 'student' ? '180px' : '140px',
  render: (exam: Exam) => {
  const examId = safeExamId(exam) || '';
        return role === 'teacher' || role === 'admin' ? (
          <AvgBadge value={examAverages[examId]} />
        ) : (
          <StudentMarkDisplay mark={studentMarks[examId]} isDesktop={true} />
        );
      },
    },
  ];

  if (ActionsComponent) {
  cols.push({ 
      key: 'actions', 
      header: 'إجراءات',
      width: '200px',
      render: (exam: Exam) => <ActionsComponent exam={exam} /> 
    });
  }

  return cols;
}
