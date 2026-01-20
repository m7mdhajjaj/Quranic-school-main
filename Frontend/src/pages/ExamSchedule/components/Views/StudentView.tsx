import React from 'react';
import Table from "@/components/UI/Table";
import type { Column } from "@/components/UI/Table";
import type { Exam } from "@/Api/ExamShedule";
import { ExamToolbar } from '../ExamToolbar';
import { createExamColumns } from '../../utils';

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
  marksFilter: string;
  setMarksFilter: (m: string) => void;
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
  marksFilter,
  setMarksFilter,
}) => {
  const columns: Column<Exam>[] = createExamColumns({
    role: 'student',
    examAverages: {},
    studentMarks,
    ActionsComponent: undefined,
  });

  return (
    <div className="space-y-5 max-w-[98%] mx-auto">
      {/* شريط البحث للطالب */}
      <ExamToolbar
        query={query}
        setQuery={setQuery}
        dateFilter={dateFilter}
        setDateFilter={setDateFilter}
        typeFilter={typeFilter}
        setTypeFilter={setTypeFilter}
        marksFilter={marksFilter}
        setMarksFilter={setMarksFilter}
        loadingExams={loadingExams}
        role="student"
        teacherGroups={[]}
        onAddExamClick={() => {}}
      />

      {/* جدول الامتحانات */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
        <div className="p-5 bg-gradient-to-r from-emerald-600 via-teal-700 to-slate-700">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            📖 امتحاناتي
          </h2>
          <p className="text-white/80 text-sm mt-1">
            تابع امتحاناتك القادمة واطلع على نتائجك
          </p>
        </div>
        <div className="border-t border-slate-200">
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
    </div>
  );
};
