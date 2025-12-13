import React from 'react';
import type { Exam } from "@/Api/ExamShedule";
import type { Column } from "@/components/UI/Table";
import { formatArabicDate, formatTime12Arabic } from "@/utils/helpers/dateHelpers";

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

const StudentMarkDisplay: React.FC<{ mark?: string; isDesktop?: boolean }> = ({ mark }) => {
  if (!mark) {
    return <span className="text-gray-400 text-xs">لم يتم الإدخال بعد</span>;
  }
  return (
    <span className="inline-flex items-center px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-semibold">
      {mark}
    </span>
  );
};

// إعادة تصدير للتوافق مع الكود القديم
export { formatArabicDate as formatDateArabic, formatTime12Arabic };

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
      width: '20%',
      align: 'right',
      render: (exam: Exam) => (
        <div className="flex flex-col gap-1">
          <span className="font-semibold text-emerald-900 text-sm break-words">{exam.name}</span>
          {exam.subject && (
            <span className="text-xs text-gray-500">📚 {exam.subject}</span>
          )}
        </div>
      ),
    },
    {
      key: 'type',
      header: 'النوع',
      width: '10%',
      align: 'center',
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
      width: '12%',
      align: 'center',
      render: (exam: Exam) =>
        exam.group ? (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium whitespace-nowrap">
            <span>📚</span>
            <span>{exam.group}</span>
          </span>
        ) : (
          <span className="text-gray-400 text-xs">-</span>
        ),
    },
    {
      key: 'date',
      header: 'التاريخ',
      width: '12%',
      align: 'center',
      render: (exam: Exam) => (
        <div className="flex items-center justify-center gap-2">
          <span className="text-emerald-700 font-medium text-sm whitespace-nowrap">{formatDateArabic(exam.date)}</span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-emerald-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      ),
    },
    {
      key: 'time',
      header: 'الوقت',
      width: '10%',
      align: 'center',
      render: (exam: Exam) => (
        <div className="flex items-center justify-center gap-2">
          <span className="text-emerald-700 font-medium text-sm whitespace-nowrap">{formatTime12Arabic(exam.time)}</span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-emerald-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      ),
    },
    {
      key: 'duration',
      header: 'المدة',
      width: '8%',
      align: 'center',
      render: (exam: Exam) => (
        exam.duration ? (
          <span className="text-sm text-gray-600">
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
      width: '10%',
      align: 'center',
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
      width: role === 'student' ? '12%' : '10%',
      align: 'center',
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
      width: '18%',
      align: 'center',
      render: (exam: Exam) => <ActionsComponent exam={exam} /> 
    });
  }

  return cols;
}
