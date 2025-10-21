import React from 'react';
import { PillButton } from './PillButton';

type SortKey = 'date' | 'name';

interface ExamToolbarProps {
  query: string;
  setQuery: (v: string) => void;
  sortKey: SortKey;
  setSortKey: (k: SortKey) => void;
  sortDir: 'asc' | 'desc';
  setSortDir: (d: 'asc' | 'desc') => void;
  loadingExams: boolean;
  role: 'student' | 'teacher' | 'admin';
  teacherGroups: string[];
  onAddExamClick: () => void;
}

export const ExamToolbar: React.FC<ExamToolbarProps> = ({
  query,
  setQuery,
  sortKey,
  setSortKey,
  sortDir,
  setSortDir,
  loadingExams,
  role,
  teacherGroups,
  onAddExamClick,
}) => {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl border-2 border-emerald-100 shadow-lg p-4 md:p-6">
      {/* Search and Sort Controls */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        {/* Search Input */}
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="🔍 ابحث عن امتحان..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full border-2 border-emerald-200 rounded-xl px-4 py-2.5 text-sm md:text-base bg-white/90 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-all shadow-sm hover:shadow-md"
          />
        </div>
        
        {/* Sort Controls */}
        <div className="flex items-center gap-2 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl px-3 py-2 border border-emerald-200">
          <span className="text-xs md:text-sm font-medium text-emerald-700 whitespace-nowrap">ترتيب:</span>
          <select
            title="اختيار مفتاح الفرز"
            aria-label="اختيار مفتاح الفرز"
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value as SortKey)}
            className="flex-1 border-2 border-emerald-200 rounded-lg px-2 py-1.5 bg-white text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-all"
          >
            <option value="date">📅 التاريخ</option>
            <option value="name">📝 الاسم</option>
          </select>
          <button
            className="border-2 border-emerald-300 rounded-lg px-3 py-1.5 text-sm bg-white hover:bg-gradient-to-r hover:from-emerald-500 hover:to-teal-500 hover:text-white transition-all active:scale-95 font-bold shadow-sm hover:shadow-md"
            onClick={() => setSortDir(sortDir === 'asc' ? 'desc' : 'asc')}
            title="عكس اتجاه الفرز"
            aria-label="عكس اتجاه الفرز"
          >
            {sortDir === 'asc' ? '↑' : '↓'}
          </button>
        </div>
      </div>

      {/* Add Exam Button */}
      {(role === 'teacher' || role === 'admin') && (
        <div className="flex items-center justify-center sm:justify-end mt-4">
          {loadingExams ? (
            <div
              className="h-11 w-full sm:w-64 md:w-80 rounded-xl bg-gradient-to-r from-emerald-100 via-emerald-200 to-emerald-100 bg-[length:200%_100%] animate-shimmer shadow-md"
              aria-hidden="true"
            />
          ) : role === 'teacher' && teacherGroups.length === 0 ? (
            <div className="bg-amber-50 border-2 border-amber-300 rounded-xl px-4 py-2.5 text-amber-700 text-xs md:text-sm flex items-center gap-2 justify-center shadow-sm">
              <span>⚠️</span>
              <span className="font-medium">لا يوجد لديك حلقات مسجلة</span>
            </div>
          ) : (
            <PillButton 
              onClick={onAddExamClick} 
              disabled={role === 'teacher' && teacherGroups.length === 0}
              className="w-full sm:w-auto text-sm md:text-base px-5 py-2.5 shadow-lg hover:shadow-xl"
            >
              <span className="flex items-center gap-2">
                <span>➕</span>
                <span className="hidden sm:inline">
                  {role === 'teacher' ? 'إضافة امتحان للحلقة' : 'إضافة امتحان لكل الطلاب'}
                </span>
                <span className="sm:hidden">إضافة امتحان</span>
              </span>
            </PillButton>
          )}
        </div>
      )}
    </div>
  );
};
