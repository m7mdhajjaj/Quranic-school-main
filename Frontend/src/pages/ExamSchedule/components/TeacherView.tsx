import React from 'react';
import Table from "@/components/UI/Table";
import type { Column } from "@/components/UI/Table";
import type { Exam } from "@/Api/exam.api";
import { ExamToolbar } from '../components/ExamToolbar';
import { ExamActions } from '../components/ExamActions';
import { createExamColumns } from '../utils';

interface TeacherViewProps {
  exams: Exam[];
  loadingExams: boolean;
  examAverages: Record<string, number | null>;
  query: string;
  setQuery: (q: string) => void;
  dateFilter: string;
  setDateFilter: (d: string) => void;
  typeFilter: string;
  setTypeFilter: (t: string) => void;
  teacherGroups: string[];
  onAddExamClick: () => void;
  onOpenMarks: (exam: Exam) => void;
  onEditExam: (exam: Exam) => void;
  onDeleteExam: (examId: string) => void;
}

export const TeacherView: React.FC<TeacherViewProps> = ({
  exams,
  loadingExams,
  examAverages,
  query,
  setQuery,
  dateFilter,
  setDateFilter,
  typeFilter,
  setTypeFilter,
  teacherGroups,
  onAddExamClick,
  onOpenMarks,
  onEditExam,
  onDeleteExam,
}) => {
  const ActionsCell: React.FC<{ exam: Exam }> = ({ exam }) => (
    <ExamActions
      exam={exam}
      onOpenMarks={onOpenMarks}
      onEditExam={onEditExam}
      onDeleteExam={onDeleteExam}
    />
  );

  const columns: Column<Exam>[] = createExamColumns({
    role: 'teacher',
    examAverages,
    studentMarks: {},
    ActionsComponent: ActionsCell,
  });

  return (
    <div className="space-y-6">
      {/* شريط الأدوات للمعلم */}
      <ExamToolbar
        query={query}
        setQuery={setQuery}
        dateFilter={dateFilter}
        setDateFilter={setDateFilter}
        typeFilter={typeFilter}
        setTypeFilter={setTypeFilter}
        loadingExams={loadingExams}
        role="teacher"
        teacherGroups={teacherGroups}
        onAddExamClick={onAddExamClick}
      />

      {/* جدول الامتحانات */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl border-2 border-emerald-200/60 overflow-hidden">
        <div className="p-5 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            📚 إدارة الامتحانات
          </h2>
          <p className="text-emerald-50 text-sm mt-1">
            يمكنك إضافة وتعديل الامتحانات وإدارة علامات الطلاب
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
              : "ابدأ بإضافة امتحان جديد من الزر أعلاه"
          }
          emptyIcon="📝"
          hoverable
          striped
          responsive
          bordered
        />
      </div>
    </div>
  );
};
