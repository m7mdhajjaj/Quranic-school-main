// ============================================================================
// AddExamModal.tsx - Modal for Adding New Exam
// ============================================================================

import { useState, useEffect, useCallback } from 'react';
import { TransparentModal } from '../components/TransparentModal';
import { DatePicker } from '@/components/UI';

interface ExamFormData {
  name: string;
  date: string;
  time: string;
  subject?: string;
  type?: string;
  duration?: number;
  totalMarks?: number;
  passingMarks?: number;
}

interface AddExamModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (examData: ExamFormData, selectedGroup: string) => Promise<void>;
  role: string;
  teacherGroups: string[];
}

// Helper function to get current date in YYYY-MM-DD format
const getCurrentDate = () => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

// Helper function to get current time in HH:MM format
const getCurrentTime = () => {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
};

export const AddExamModal = ({
  open,
  onClose,
  onSubmit,
  role,
  teacherGroups,
}: AddExamModalProps) => {
  // تعيين أول حلقة كقيمة افتراضية إذا كان المعلم لديه حلقات صحيحة
  const getDefaultGroup = useCallback(() => {
    if (role === 'teacher' && teacherGroups.length > 0) {
      const firstGroup = teacherGroups[0];
      return firstGroup && firstGroup.trim() ? firstGroup : '';
    }
    return '';
  }, [role, teacherGroups]);

  const [newExam, setNewExam] = useState<ExamFormData>({ 
    name: '', 
    date: getCurrentDate(), 
    time: getCurrentTime(),
    subject: '',
    type: 'شفهي',
    duration: 60,
    totalMarks: 100,
    passingMarks: 50
  });
  
  const [selectedGroupForExam, setSelectedGroupForExam] = useState(() => {
    if (role === 'teacher' && teacherGroups.length > 0) {
      const firstGroup = teacherGroups[0];
      return firstGroup && firstGroup.trim() ? firstGroup : '';
    }
    return '';
  });

  // Reset to current date/time when modal opens
  useEffect(() => {
    if (open) {
      setNewExam({ 
        name: '', 
        date: getCurrentDate(), 
        time: getCurrentTime(),
        subject: '',
        type: 'شفهي',
        duration: 60,
        totalMarks: 100,
        passingMarks: 50
      });
      // إعادة تعيين الحلقة عند فتح الـ modal
      setSelectedGroupForExam(getDefaultGroup());
    }
  }, [open, getDefaultGroup]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(newExam, selectedGroupForExam);
    setNewExam({ 
      name: '', 
      date: getCurrentDate(), 
      time: getCurrentTime() 
    });
    // إعادة تعيين الحلقة الافتراضية
    setSelectedGroupForExam(getDefaultGroup());
  };

  const handleClose = () => {
    setNewExam({ 
      name: '', 
      date: getCurrentDate(), 
      time: getCurrentTime(),
      subject: '',
      type: 'شفهي',
      duration: 60,
      totalMarks: 100,
      passingMarks: 50
    });
    // إعادة تعيين الحلقة الافتراضية
    setSelectedGroupForExam(getDefaultGroup());
    onClose();
  };

  return (
    <TransparentModal
      open={open}
      onClose={handleClose}
      maxWidth="max-w-4xl"
      ariaLabel="إضافة امتحان جديد"
      title="إضافة امتحان جديد"
      gradientFrom="emerald-500"
      gradientTo="teal-600"
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
            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
          />
        </svg>
      }>
      {role === 'teacher' && teacherGroups.length > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-blue-600 flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div className="text-sm text-blue-800">
              <p className="font-bold mb-1">ملاحظة:</p>
              <p>سيتم إضافة هذا الامتحان فقط لطلاب الحلقة المحددة أدناه.</p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* القسم الأول: المعلومات الأساسية */}
        <div className="bg-gray-50 rounded-xl p-5 space-y-4">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            المعلومات الأساسية
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* اسم الامتحان */}
            <div>
              <label className="flex items-center gap-2 text-gray-700 text-sm font-bold mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                اسم الامتحان
                <span className="text-rose-600">*</span>
              </label>
              <input
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition duration-200 outline-none"
                type="text"
                value={newExam.name}
                onChange={(e) => setNewExam((p) => ({ ...p, name: e.target.value }))}
                placeholder="مثلاً: اختبار القرآن الشهري"
                required
              />
            </div>

            {/* المادة */}
            <div>
              <label className="flex items-center gap-2 text-gray-700 text-sm font-bold mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                المادة
              </label>
              <input
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition duration-200 outline-none"
                type="text"
                value={newExam.subject || ''}
                onChange={(e) => setNewExam((p) => ({ ...p, subject: e.target.value }))}
                placeholder="مثلاً: القرآن الكريم"
              />
            </div>
          </div>

          {/* نوع الامتحان والحلقة */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* نوع الامتحان */}
            <div>
              <label className="flex items-center gap-2 text-gray-700 text-sm font-bold mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                نوع الامتحان
              </label>
              <select
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition duration-200 outline-none bg-white"
                value={newExam.type || 'شفهي'}
                onChange={(e) => setNewExam((p) => ({ ...p, type: e.target.value }))}>
                <option value="شفهي">شفهي</option>
                <option value="كتابي">كتابي</option>
                <option value="عملي">عملي</option>
                <option value="مشروع">مشروع</option>
                <option value="تقييم شامل">تقييم شامل</option>
              </select>
            </div>

            {/* اختيار الحلقة */}
            {role === 'teacher' && teacherGroups.length > 0 && (
              <div>
                <label className="flex items-center gap-2 text-gray-700 text-sm font-bold mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  الحلقة
                  <span className="text-rose-600">*</span>
                </label>
                <select
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition duration-200 outline-none bg-white"
                  value={selectedGroupForExam}
                  onChange={(e) => setSelectedGroupForExam(e.target.value)}
                  required>
                  {teacherGroups.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* القسم الثاني: التوقيت */}
        <div className="bg-blue-50 rounded-xl p-5 space-y-4">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            موعد الامتحان
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* التاريخ */}
            <div className="md:col-span-2">
              <DatePicker
                label="التاريخ"
                value={newExam.date}
                onChange={(date) => setNewExam((p) => ({ ...p, date }))}
                required
              />
            </div>

            {/* الوقت */}
            <div>
              <label className="flex items-center gap-2 text-gray-700 text-sm font-bold mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                الوقت
                <span className="text-rose-600">*</span>
              </label>
              <input
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition duration-200 outline-none"
                type="time"
                min="09:00"
                max="19:00"
                value={newExam.time}
                onChange={(e) => setNewExam((p) => ({ ...p, time: e.target.value }))}
                required
              />
            </div>

            {/* المدة */}
            <div className="md:col-span-1">
              <label className="flex items-center gap-2 text-gray-700 text-sm font-bold mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                المدة (دقيقة)
              </label>
              <input
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition duration-200 outline-none"
                type="number"
                min="5"
                max="480"
                value={newExam.duration || 60}
                onChange={(e) => setNewExam((p) => ({ ...p, duration: parseInt(e.target.value) || 60 }))}
              />
            </div>
          </div>
        </div>

        {/* القسم الثالث: الدرجات */}
        <div className="bg-purple-50 rounded-xl p-5 space-y-4">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
            نظام التقييم
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* مجموع الدرجات */}
            <div>
              <label className="flex items-center gap-2 text-gray-700 text-sm font-bold mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                مجموع الدرجات
              </label>
              <input
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition duration-200 outline-none"
                type="number"
                min="1"
                max="1000"
                value={newExam.totalMarks || 100}
                onChange={(e) => setNewExam((p) => ({ ...p, totalMarks: parseInt(e.target.value) || 100 }))}
              />
            </div>

            {/* درجة النجاح */}
            <div>
              <label className="flex items-center gap-2 text-gray-700 text-sm font-bold mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                درجة النجاح
              </label>
              <input
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition duration-200 outline-none"
                type="number"
                min="0"
                max={newExam.totalMarks || 100}
                value={newExam.passingMarks || 50}
                onChange={(e) => setNewExam((p) => ({ ...p, passingMarks: parseInt(e.target.value) || 50 }))}
              />
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 mt-8">
          <button
            type="button"
            onClick={handleClose}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-6 rounded-xl transition duration-200 border-2 border-gray-200">
            إلغاء
          </button>
          <button
            type="submit"
            className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-medium py-3 px-8 rounded-xl transition duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02]">
            إضافة الامتحان
          </button>
        </div>
      </form>
    </TransparentModal>
  );
};
