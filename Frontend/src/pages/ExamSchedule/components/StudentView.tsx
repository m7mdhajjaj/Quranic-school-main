import React from 'react';
import Table from "@/components/UI/Table";
import type { Column } from "@/components/UI/Table";
import type { Exam } from "@/Api/exam.api";
import { ExamToolbar } from '../components/ExamToolbar';
import { createExamColumns } from '../utils';

interface StudentViewProps {
  exams: Exam[];
  loadingExams: boolean;
  studentMarks: Record<string, string>;
  query: string;
  setQuery: (q: string) => void;
  dateFilter: string;
  setDateFilter: (d: string) => void;
  typeFilter: string;
  setTypeFilter: (t: string) => void;
}

export const StudentView: React.FC<StudentViewProps> = ({
  exams,
  loadingExams,
  studentMarks,
  query,
  setQuery,
  dateFilter,
  setDateFilter,
  typeFilter,
  setTypeFilter,
}) => {
  const columns: Column<Exam>[] = createExamColumns({
    role: 'student',
    examAverages: {},
    studentMarks,
    ActionsComponent: undefined,
  });

  return (
    <div className="space-y-6">
      {/* شريط البحث للطالب */}
      <ExamToolbar
        query={query}
        setQuery={setQuery}
        dateFilter={dateFilter}
        setDateFilter={setDateFilter}
        typeFilter={typeFilter}
        setTypeFilter={setTypeFilter}
        loadingExams={loadingExams}
        role="student"
        teacherGroups={[]}
        onAddExamClick={() => {}}
      />

      {/* جدول الامتحانات */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl border-2 border-blue-200/60 overflow-hidden">
        <div className="p-5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            📖 امتحاناتي
          </h2>
          <p className="text-blue-50 text-sm mt-1">
            تابع امتحاناتك القادمة واطلع على نتائجك
          </p>
        </div>
        <Table
          columns={columns}
          data={exams}
          loading={loadingExams}
          emptyMessage={query ? "لا توجد نتائج" : "لا توجد امتحانات"}
          emptyDescription={
            query
              ? "جرّب البحث بكلمات أخرى"
              : "لا توجد امتحانات مجدولة حالياً"
          }
          emptyIcon="📚"
          hoverable
          striped
          responsive
          bordered
        />
      </div>
    </div>
  );
};
