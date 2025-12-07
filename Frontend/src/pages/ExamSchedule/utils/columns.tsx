import React from 'react';
import type { Exam } from "@/Api/exam.api";
import type { Column } from "@/components/UI/Table";

// Helper components
const AvgBadge: React.FC<{ value?: number | null }> = ({ value }) => {
  if (value == null) {
    return <span className="text-gray-400 text-xs">-</span>;
  }
  const color = value >= 85 ? 'green' : value >= 70 ? 'blue' : value >= 50 ? 'yellow' : 'red';
  return (
    <span className={`inline-flex items-center px-3 py-1 bg-${color}-100 text-${color}-700 rounded-full text-sm font-semibold`}>
      {value.toFixed(1)}%
    </span>
  );
};

const StudentMarkDisplay: React.FC<{ mark?: string; isDesktop?: boolean }> = ({ mark, isDesktop }) => {
  if (!mark) {
    return <span className="text-gray-400 text-xs">لم يتم الإدخال بعد</span>;
  }
  return (
    <span className="inline-flex items-center px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-semibold">
      {mark}
    </span>
  );
};

// Helper functions
const formatDateArabic = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });
};

const formatTime12Arabic = (timeStr: string) => {
  if (!timeStr) return '-';
  const [hours, minutes] = timeStr.split(':');
  const hour = parseInt(hours);
  const period = hour >= 12 ? 'م' : 'ص';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes} ${period}`;
};

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
        <div className="flex flex-col gap-1">
          <span className="font-semibold text-emerald-900 text-xs md:text-sm break-words">{exam.name}</span>
          {exam.subject && (
            <span className="text-xs text-gray-500">📚 {exam.subject}</span>
          )}
        </div>
      ),
    },
    {
      key: 'type',
      header: 'النوع',
      width: '100px',
  render: (exam: Exam) => (
        exam.type ? (
          <span className="inline-flex items-center px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium whitespace-nowrap">
            {exam.type}
          </span>
        ) : (
          <span className="text-gray-400 text-xs">-</span>
        )
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
      key: 'duration',
      header: 'المدة',
      width: '100px',
  render: (exam: Exam) => (
        exam.duration ? (
          <span className="text-xs text-gray-600">
            ⏱️ {exam.duration} دقيقة
          </span>
        ) : (
          <span className="text-gray-400 text-xs">-</span>
        )
      ),
    },
    {
      key: 'marks',
      header: 'الدرجات',
      width: '120px',
  render: (exam: Exam) => (
        (exam.totalMarks || exam.passingMarks) ? (
          <div className="flex flex-col text-xs">
            {exam.totalMarks && (
              <span className="text-gray-600">الكلي: {exam.totalMarks}</span>
            )}
            {exam.passingMarks !== undefined && (
              <span className="text-emerald-600">النجاح: {exam.passingMarks}</span>
            )}
          </div>
        ) : (
          <span className="text-gray-400 text-xs">-</span>
        )
      ),
    },
    {
      key: 'result',
      header: role === 'teacher' || role === 'admin' ? 'متوسط العلامات' : 'النتيجة',
      width: role === 'student' ? '180px' : '140px',
  render: (exam: Exam) => {
        const examId = String(exam._id ?? exam.id);
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
