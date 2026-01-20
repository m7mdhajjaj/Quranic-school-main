import React, { useMemo } from 'react';
import type { Exam } from "@/Api/ExamShedule";
import { ExamActions } from './ExamActions';
import { formatDateArabic, formatTime12Arabic } from '../utils';
import { LoadingSpinner } from '@/components/UI';

interface GroupedExamTableProps {
  exams: Exam[];
  loading: boolean;
  examAverages: Record<string, number | null>;
  onEditExam: (exam: Exam) => void;
  onDeleteExam: (examId: string) => void;
  emptyMessage?: string;
  emptyDescription?: string;
  // Bulk delete props
  selectedExams?: Set<string>;
  onToggleExam?: (examId: string) => void;
  onToggleAll?: () => void;
  showCheckboxes?: boolean;
}

interface ExamGroup {
  date: string;
  dateFormatted: string;
  exams: Exam[];
}

export const GroupedExamTable: React.FC<GroupedExamTableProps> = ({
  exams,
  loading,
  examAverages,
  onEditExam,
  onDeleteExam,
  selectedExams = new Set(),
  onToggleExam,
  onToggleAll,
  showCheckboxes = false,
  emptyMessage = "لا توجد امتحانات",
  emptyDescription = "ابدأ بإضافة امتحان جديد",
}) => {
  // تجميع الامتحانات حسب التاريخ
  const groupedExams = useMemo(() => {
    const groups: Record<string, ExamGroup> = {};

    exams.forEach((exam) => {
      const dateKey = new Date(exam.date).toISOString().split('T')[0];
      
      if (!groups[dateKey]) {
        groups[dateKey] = {
          date: dateKey,
          dateFormatted: formatDateArabic(exam.date),
          exams: [],
        };
      }
      
      groups[dateKey].exams.push(exam);
    });

    // ترتيب المجموعات حسب التاريخ (الأحدث أولاً)
    return Object.values(groups).sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [exams]);

  if (loading) {
    return <LoadingSpinner size="lg" text="جاري تحميل الامتحانات..." />;
  }

  if (exams.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4">
        <div className="text-6xl mb-4">📝</div>
        <h3 className="text-xl font-bold text-gray-700 mb-2">{emptyMessage}</h3>
        <p className="text-gray-500 text-center">{emptyDescription}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {groupedExams.map((group) => (
        <div key={group.date} className="bg-white rounded-xl shadow-lg border-2 border-emerald-100 overflow-hidden">
          {/* رأس المجموعة - التاريخ */}
          <div className="bg-gradient-to-r from-emerald-600 via-teal-700 to-slate-700 px-6 py-3">
            <div className="flex items-center gap-3">
              <span className="text-2xl">📅</span>
              <div>
                <h3 className="text-lg font-bold text-white">{group.dateFormatted}</h3>
                <p className="text-emerald-50 text-sm">
                  {group.exams.length} {group.exams.length === 1 ? 'امتحان' : 'امتحانات'}
                </p>
              </div>
            </div>
          </div>

          {/* جدول الامتحانات */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-emerald-50 border-b-2 border-emerald-200">
                  {showCheckboxes && (
                    <th className="px-4 py-3 text-center w-12">
                      <input
                        type="checkbox"
                        checked={group.exams.every(e => selectedExams.has(String(e._id ?? e.id)))}
                        onChange={onToggleAll}
                        className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500 cursor-pointer"
                        title="تحديد الكل"
                      />
                    </th>
                  )}
                  <th className="px-4 py-3 text-right text-sm font-bold text-gray-700">الوقت</th>
                  <th className="px-4 py-3 text-right text-sm font-bold text-gray-700">اسم الامتحان</th>
                  <th className="px-4 py-3 text-right text-sm font-bold text-gray-700">المادة</th>
                  <th className="px-4 py-3 text-right text-sm font-bold text-gray-700">النوع</th>
                  <th className="px-4 py-3 text-right text-sm font-bold text-gray-700">الحلقة</th>
                  <th className="px-4 py-3 text-right text-sm font-bold text-gray-700">المدة</th>
                  <th className="px-4 py-3 text-right text-sm font-bold text-gray-700">الدرجة</th>
                  <th className="px-4 py-3 text-right text-sm font-bold text-gray-700">المتوسط</th>
                  <th className="px-4 py-3 text-center text-sm font-bold text-gray-700">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {group.exams.map((exam, index) => {
                  const examId = String(exam._id ?? exam.id);
                  const average = examAverages[examId];

                  const isSelected = selectedExams.has(examId);

                  return (
                    <tr
                      key={examId}
                      className={`border-b border-gray-100 hover:bg-emerald-50/50 transition-colors ${
                        isSelected ? 'bg-emerald-100/50' : index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
                      }`}
                    >
                      {/* Checkbox */}
                      {showCheckboxes && (
                        <td className="px-4 py-3 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => onToggleExam?.(examId)}
                            className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500 cursor-pointer"
                            title="تحديد هذا الامتحان"
                          />
                        </td>
                      )}

                      {/* الوقت */}
                      <td className="px-4 py-3 text-sm text-gray-700 font-medium whitespace-nowrap">
                        {formatTime12Arabic(exam.time)}
                      </td>

                      {/* اسم الامتحان */}
                      <td className="px-4 py-3 text-sm font-bold text-gray-900">
                        {exam.title || exam.name}
                      </td>

                      {/* المادة */}
                      <td className="px-4 py-3 text-sm text-gray-700">
                        <span className="inline-flex px-2 py-1 bg-gray-100 rounded-lg text-xs font-medium">
                          {exam.subject || 'غير محدد'}
                        </span>
                      </td>

                      {/* النوع */}
                      <td className="px-4 py-3 text-sm">
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                          exam.type === 'شفهي'
                            ? 'bg-blue-100 text-blue-700'
                            : exam.type === 'كتابي'
                            ? 'bg-purple-100 text-purple-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}>
                          {exam.type || 'شفهي'}
                        </span>
                      </td>

                      {/* الحلقة */}
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {exam.group || '-'}
                      </td>

                      {/* المدة */}
                      <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                        {exam.duration ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-medium">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {exam.duration} دقيقة
                          </span>
                        ) : (
                          <span className="text-gray-400 text-xs">-</span>
                        )}
                      </td>

                      {/* الدرجة */}
                      <td className="px-4 py-3 text-sm">
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-100 text-emerald-700 rounded-lg font-bold text-xs">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {exam.totalMarks ?? 20}
                        </span>
                      </td>

                      {/* المتوسط */}
                      <td className="px-4 py-3 text-sm">
                        {average !== null && average !== undefined ? (
                          <span className="font-bold text-teal-600">
                            {average.toFixed(1)}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>

                      {/* الإجراءات */}
                      <td className="px-4 py-3 text-center">
                        <ExamActions
                          exam={exam}
                          onEditExam={onEditExam}
                          onDeleteExam={onDeleteExam}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
};
