// ============================================================================
// EditExamModal.tsx - Modal for Editing Existing Exam
// ============================================================================

import { TransparentModal } from '../components/TransparentModal';
import { DatePicker } from '@/components/UI';
import type { Exam } from "@/Api/exam.api";

interface EditExamModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  exam: Exam | null;
  onExamChange: (updater: (exam: Exam | null) => Exam | null) => void;
  role: string;
}

export const EditExamModal = ({
  open,
  onClose,
  onSubmit,
  exam,
  onExamChange,
  role,
}: EditExamModalProps) => {
  if (!exam) return null;

  const isAuthorized = role === 'teacher' || role === 'admin';

  return (
    <TransparentModal
      open={open && isAuthorized && !!exam}
      onClose={onClose}
      maxWidth="max-w-4xl"
      ariaLabel="تعديل الامتحان"
      title="تعديل الامتحان"
      gradientFrom="amber-500"
      gradientTo="orange-600"
      icon={
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 text-white"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
          />
        </svg>
      }>
      <form onSubmit={onSubmit} className="space-y-6">
        {/* اسم الامتحان */}
        <div>
          <label className="flex items-center gap-2 text-gray-700 text-sm font-bold mb-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-amber-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            اسم الامتحان
            <span className="text-rose-600">*</span>
          </label>
          <input
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:ring-4 focus:ring-amber-100 transition duration-200 outline-none"
            type="text"
            value={exam.name}
            onChange={(e) =>
              onExamChange((p) => (p ? { ...p, name: e.target.value } : p))
            }
            required
            placeholder="أدخل اسم الامتحان"
            title="اسم الامتحان"
          />
        </div>

        {/* المادة ونوع الامتحان */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="flex items-center gap-2 text-gray-700 text-sm font-bold mb-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-amber-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
              المادة
            </label>
            <input
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:ring-4 focus:ring-amber-100 transition duration-200 outline-none"
              type="text"
              value={exam.subject || ''}
              onChange={(e) =>
                onExamChange((p) => (p ? { ...p, subject: e.target.value } : p))
              }
              placeholder="مثلاً: القرآن الكريم"
            />
          </div>
          <div>
            <label className="flex items-center gap-2 text-gray-700 text-sm font-bold mb-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-amber-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              نوع الامتحان
            </label>
            <select
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:ring-4 focus:ring-amber-100 transition duration-200 outline-none bg-white"
              value={exam.type || 'شفهي'}
              onChange={(e) =>
                onExamChange((p) => (p ? { ...p, type: e.target.value } : p))
              }
              aria-label="نوع الامتحان"
              title="نوع الامتحان"
            >
              <option value="شفهي">شفهي</option>
              <option value="كتابي">كتابي</option>
              <option value="عملي">عملي</option>
              <option value="مشروع">مشروع</option>
              <option value="تقييم شامل">تقييم شامل</option>
            </select>
          </div>
        </div>

        {/* التاريخ والوقت والمدة */}
        <div className="space-y-4">
          {/* Date - Full Width */}
          <div>
            <DatePicker
              label="التاريخ"
              value={
                typeof exam.date === 'string'
                  ? exam.date.split('T')[0]
                  : exam.date instanceof Date
                  ? exam.date.toISOString().split('T')[0]
                  : ''
              }
              onChange={(date) => onExamChange((p) => (p ? { ...p, date } : p))}
              required
            />
          </div>
          {/* Time and Duration - Side by Side */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-2 text-gray-700 text-sm font-bold mb-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-amber-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                الوقت
                <span className="text-rose-600">*</span>
              </label>
              <input
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:ring-4 focus:ring-amber-100 transition duration-200 outline-none"
                type="time"
                min="12:00"
                max="21:00"
                value={exam.time}
                onChange={(e) =>
                  onExamChange((p) => (p ? { ...p, time: e.target.value } : p))
                }
                required
                placeholder="أدخل وقت الامتحان"
                title="وقت الامتحان"
              />
            </div>
            <div>
              <label className="flex items-center gap-2 text-gray-700 text-sm font-bold mb-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-amber-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                المدة (دقيقة)
              </label>
              <input
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:ring-4 focus:ring-amber-100 transition duration-200 outline-none"
                type="number"
                min="5"
                max="480"
                value={exam.duration || 60}
                onChange={(e) =>
                  onExamChange((p) => (p ? { ...p, duration: parseInt(e.target.value) || 60 } : p))
                }
                placeholder="أدخل مدة الامتحان بالدقائق"
                title="مدة الامتحان بالدقائق"
              />
            </div>
          </div>
        </div>

        {/* الدرجات */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="flex items-center gap-2 text-gray-700 text-sm font-bold mb-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-amber-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                />
              </svg>
              مجموع الدرجات
            </label>
            <input
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:ring-4 focus:ring-amber-100 transition duration-200 outline-none"
              type="number"
              min="1"
              max="1000"
              value={exam.totalMarks || 100}
              onChange={(e) =>
                onExamChange((p) => (p ? { ...p, totalMarks: parseInt(e.target.value) || 100 } : p))
              }
              placeholder="أدخل مجموع الدرجات"
              title="مجموع الدرجات"
            />
          </div>
          <div>
            <label className="flex items-center gap-2 text-gray-700 text-sm font-bold mb-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-amber-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              درجة النجاح
            </label>
            <input
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:ring-4 focus:ring-amber-100 transition duration-200 outline-none"
              type="number"
              min="0"
              max={exam.totalMarks || 100}
              value={exam.passingMarks || 50}
              onChange={(e) =>
                onExamChange((p) => (p ? { ...p, passingMarks: parseInt(e.target.value) || 50 } : p))
              }
              placeholder="أدخل درجة النجاح"
              title="درجة النجاح"
            />
          </div>
        </div>

        {/* عرض الحلقة فقط للمعلم */}
        {exam.group && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-4">
            <div className="flex items-center gap-2 text-sm text-blue-800">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-blue-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              <span className="font-semibold">الحلقة:</span>
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
                <span>📚</span>
                {exam.group}
              </span>
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-3 mt-8">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-6 rounded-xl transition duration-200 border-2 border-gray-200">
            إلغاء
          </button>
          <button
            type="submit"
            className="flex-1 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-medium py-3 px-8 rounded-xl transition duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02]">
            حفظ التعديل
          </button>

        </div>
      </form>
    </TransparentModal>
  );
};
