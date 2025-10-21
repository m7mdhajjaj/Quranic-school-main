// ============================================================================
// MarksModal.tsx - Modal for Managing Exam Marks
// ============================================================================

import React from 'react';
import { TransparentModal, PillButton } from '../components';
import { formatDateArabic, formatTime12Arabic, safeExamId } from '../utils';
import type { Exam, StudentDoc } from '../../../Api/examApi';

interface MarksModalProps {
  open: boolean;
  onClose: () => void;
  onCancel: () => void;
  selectedExam: Exam | null;
  loading: boolean;
  students: StudentDoc[];
  marks: Record<string, { mark: string; detail: string }>;
  setMarks: React.Dispatch<React.SetStateAction<Record<string, { mark: string; detail: string }>>>;
  onSubmitAll: (e: React.FormEvent) => Promise<void>;
  onSaveSingleMark: (studentId: string, fullName: string) => Promise<void>;
  onDeleteMark: (examId: string | number, studentId: string | number) => Promise<void>;
}

export const MarksModal: React.FC<MarksModalProps> = ({
  open,
  onClose,
  onCancel,
  selectedExam,
  loading,
  students,
  marks,
  setMarks,
  onSubmitAll,
  onSaveSingleMark,
  onDeleteMark,
}) => {
  return (
    <TransparentModal
      open={open && !!selectedExam}
      onClose={onClose}
      maxWidth="max-w-4xl"
      ariaLabel="إضافة علامات الطلاب للامتحان"
    >
      <div className="mb-5">
        <h3 className="text-2xl font-extrabold text-center text-emerald-700">
          إضافة علامات للامتحان
        </h3>
        <div className="mt-3 bg-emerald-50 border-2 border-emerald-200 rounded-xl p-3">
          <div className="flex flex-wrap items-center justify-center gap-3 text-sm">
            <span className="inline-flex items-center gap-2 text-emerald-800 font-semibold">
              <span className="bg-emerald-100 text-emerald-700 w-6 h-6 rounded-lg flex items-center justify-center">📘</span>
              {selectedExam?.name}
            </span>
            {selectedExam?.group && (
              <span className="inline-flex items-center gap-2 text-blue-800 font-medium">
                <span className="bg-blue-100 text-blue-700 w-6 h-6 rounded-lg flex items-center justify-center">📚</span>
                {selectedExam.group}
              </span>
            )}
            <span className="inline-flex items-center gap-2 text-emerald-700">
              <span className="bg-emerald-100 text-emerald-700 w-6 h-6 rounded-lg flex items-center justify-center">📅</span>
              {formatDateArabic(String(selectedExam?.date ?? ''))}
            </span>
            <span className="inline-flex items-center gap-2 text-emerald-700">
              <span className="bg-emerald-100 text-emerald-700 w-6 h-6 rounded-lg flex items-center justify-center">⏰</span>
              {formatTime12Arabic(String(selectedExam?.time ?? ''))}
            </span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8 text-emerald-600">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          جاري تحميل الطلاب...
        </div>
      ) : students.length === 0 ? (
        <div className="text-center py-8 text-emerald-600">
          <div className="text-xl mb-2">📋</div>
          لا يوجد طلاب مسجلين في النظام حالياً
        </div>
      ) : (
        <form onSubmit={onSubmitAll} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 max-h-[500px] overflow-y-auto p-2">
            {students.map((student) => {
              const sid = student._id as unknown as string;
              const fullName = student.name ?? `${student.firstName ?? ''} ${student.lastName ?? ''}`.trim();
              return (
                <div
                  key={sid}
                  className="bg-white hover:bg-emerald-50/50 border-2 border-emerald-100 hover:border-emerald-300 rounded-2xl p-5 shadow-md hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
                >
                  {/* Student Name Badge */}
                  <div className="flex items-center justify-center mb-4">
                    <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-4 py-2 rounded-full shadow-lg">
                      <div className="flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span className="font-bold text-sm">{fullName || 'طالب'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {/* Mark Input */}
                    <div>
                      <label className="flex items-center gap-2 text-sm font-bold text-emerald-700 mb-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        العلامة (من 100)
                      </label>
                      <input
                        className="w-full border-2 border-emerald-200 focus:border-emerald-500 rounded-xl px-4 py-3 focus:outline-none focus:ring-4 focus:ring-emerald-100 bg-white text-center text-lg font-bold transition-all duration-200"
                        type="number"
                        min="0"
                        max="100"
                        value={marks[sid]?.mark ?? ''}
                        onChange={(e) =>
                          setMarks((m) => ({
                            ...m,
                            [sid]: {
                              ...(m[sid] ?? { mark: '', detail: '' }),
                              mark: e.target.value,
                            },
                          }))
                        }
                        placeholder="0"
                      />
                    </div>

                    {/* Action Buttons */}
                    {marks[sid]?.mark && (
                      <div className="flex gap-2 pt-2">
                        <PillButton
                          variant="primary"
                          type="button"
                          className="text-xs flex-1 !bg-gradient-to-r !from-emerald-500 !to-teal-600 hover:!from-emerald-600 hover:!to-teal-700"
                          onClick={async () => {
                            await onSaveSingleMark(sid, fullName);
                          }}
                        >
                          💾 حفظ
                        </PillButton>

                        <PillButton
                          variant="danger"
                          type="button"
                          className="text-xs flex-1"
                          onClick={() => {
                            const examId = selectedExam ? safeExamId(selectedExam) : null;
                            if (!examId) return;
                            onDeleteMark(examId, sid);
                          }}
                        >
                          🗑️ حذف
                        </PillButton>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-between items-center pt-6 border-t-2 border-emerald-100">
            <PillButton type="submit" className="text-lg px-8 py-3 !bg-gradient-to-r !from-emerald-600 !to-teal-700 hover:!from-emerald-700 hover:!to-teal-800 !shadow-lg hover:!shadow-xl !transform hover:!scale-[1.02]">
              💾 حفظ جميع العلامات
            </PillButton>
            <PillButton
              type="button"
              variant="neutral"
              className="text-lg px-8 py-3"
              onClick={onCancel}
            >
              ✖️ إلغاء
            </PillButton>
          </div>
        </form>
      )}
    </TransparentModal>
  );
};
