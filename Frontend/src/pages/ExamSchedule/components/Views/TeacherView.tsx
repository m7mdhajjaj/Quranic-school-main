import React, { useState } from 'react';
import { Trash2 } from 'lucide-react';
import type { Exam } from "@/Api/ExamShedule";
import { bulkDeleteExams } from '@/Api/ExamShedule';
import { ExamToolbar } from '../ExamToolbar';
import { GroupedExamTable } from '../GroupedExamTable';
import { showSuccessMessage, showErrorMessage, showConfirmDialog } from '@/utils/sweetalertUtils';

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
  marksFilter: string;
  setMarksFilter: (m: string) => void;
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
  marksFilter,
  setMarksFilter,
  teacherGroups,
  onAddExamClick,
  onOpenMarks,
  onEditExam,
  onDeleteExam,
}) => {
  const [selectedExams, setSelectedExams] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);

  // Toggle selection for single exam
  const toggleExamSelection = (examId: string) => {
    setSelectedExams(prev => {
      const newSet = new Set(prev);
      if (newSet.has(examId)) {
        newSet.delete(examId);
      } else {
        newSet.add(examId);
      }
      return newSet;
    });
  };

  // Select/Deselect all exams
  const toggleSelectAll = () => {
    if (selectedExams.size === exams.length) {
      setSelectedExams(new Set());
    } else {
      setSelectedExams(new Set(exams.map(e => String(e._id ?? e.id))));
    }
  };

  // Bulk delete handler
  const handleBulkDelete = async () => {
    if (selectedExams.size === 0) return;

    const result = await showConfirmDialog(
      'حذف جماعي',
      `هل أنت متأكد من حذف ${selectedExams.size} امتحان؟<br/><span class="text-red-600 font-bold">سيتم حذف جميع العلامات المرتبطة!</span>`,
      'نعم، احذف الكل',
      'إلغاء'
    );

    if (!result.isConfirmed) return;

    setIsDeleting(true);
    try {
      const examIds = Array.from(selectedExams);
      const response = await bulkDeleteExams(examIds);
      
      showSuccessMessage('نجاح', response.message);
      setSelectedExams(new Set());
      window.location.reload(); // Reload to refresh data
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'حدث خطأ أثناء الحذف الجماعي';
      showErrorMessage('خطأ', errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };
  return (
    <div className="space-y-6">
      {/* Bulk Delete Bar */}
      {selectedExams.size > 0 && (
        <div className="bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-200 rounded-xl p-4 flex items-center justify-between animate-slideDown">
          <div className="flex items-center gap-3">
            <div className="bg-red-100 p-2 rounded-lg">
              <Trash2 className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="font-bold text-red-800">
                تم تحديد {selectedExams.size} امتحان
              </p>
              <p className="text-sm text-red-600">
                اضغط على "حذف المحدد" لحذف جميع الامتحانات المحددة
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedExams(new Set())}
              className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-all font-medium"
              disabled={isDeleting}
            >
              إلغاء التحديد
            </button>
            <button
              onClick={handleBulkDelete}
              disabled={isDeleting}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white rounded-lg transition-all font-medium disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
              {isDeleting ? 'جاري الحذف...' : 'حذف المحدد'}
            </button>
          </div>
        </div>
      )}

      {/* شريط الأدوات للمعلم */}
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
        role="teacher"
        teacherGroups={teacherGroups}
        onAddExamClick={onAddExamClick}
      />

      {/* جدول الامتحانات المجمع حسب التاريخ */}
      <GroupedExamTable
        exams={exams}
        loading={loadingExams}
        examAverages={examAverages}
        onOpenMarks={onOpenMarks}
        onEditExam={onEditExam}
        onDeleteExam={onDeleteExam}
        selectedExams={selectedExams}
        onToggleExam={toggleExamSelection}
        onToggleAll={toggleSelectAll}
        showCheckboxes={true}
        emptyMessage={query ? "لا توجد نتائج" : "لا توجد امتحانات"}
        emptyDescription={
          query
            ? "جرّب البحث بكلمات أخرى"
            : "ابدأ بإضافة امتحان جديد من الزر أعلاه"
        }
      />
    </div>
  );
};
