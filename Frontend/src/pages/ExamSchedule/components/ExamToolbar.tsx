import React, { useState } from 'react';
import { Search, Plus, X, SlidersHorizontal, ChevronDown } from 'lucide-react';
import { DatePicker } from '@/components/UI';

interface ExamToolbarProps {
  query: string;
  setQuery: (v: string) => void;
  dateFilter: string;
  setDateFilter: (v: string) => void;
  typeFilter: string;
  setTypeFilter: (v: string) => void;
  marksFilter: string;
  setMarksFilter: (v: string) => void;
  loadingExams: boolean;
  role: 'student' | 'teacher' | 'admin' | 'secretary';
  teacherGroups?: string[];
  onAddExamClick: () => void;
}

export const ExamToolbar: React.FC<ExamToolbarProps> = ({
  query,
  setQuery,
  dateFilter,
  setDateFilter,
  typeFilter,
  setTypeFilter,
  marksFilter,
  setMarksFilter,
  role,
  onAddExamClick,
}) => {
  const [showFilters, setShowFilters] = useState(false);

  const hasActiveFilters = query || dateFilter || typeFilter || marksFilter;
  const activeFiltersCount = [query, dateFilter, typeFilter, marksFilter].filter(Boolean).length;

  const clearAllFilters = () => {
    setQuery('');
    setDateFilter('');
    setTypeFilter('');
    setMarksFilter('');
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header with gradient */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-700 to-slate-700 px-5 py-4">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/15 backdrop-blur-sm p-2.5 rounded-xl">
              <Search className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-white font-bold text-base">البحث والفلترة</h3>
              <p className="text-white/70 text-xs">ابحث في الامتحانات أو استخدم الفلاتر</p>
            </div>
          </div>

          {/* أزرار الإجراءات */}
          <div className="flex gap-2 items-center">
            {/* زر الفلاتر مع toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all font-medium text-sm ${hasActiveFilters
                ? 'bg-white text-emerald-700'
                : 'bg-white/15 hover:bg-white/25 text-white'
                }`}
              title="فتح الفلاتر"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>فلاتر</span>
              {activeFiltersCount > 0 && (
                <span className="bg-emerald-500 text-white text-xs px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                  {activeFiltersCount}
                </span>
              )}
              <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${showFilters ? 'rotate-180' : ''}`} />
            </button>

            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="flex items-center gap-1.5 px-3 py-2 bg-white/15 hover:bg-white/25 backdrop-blur-sm rounded-xl text-white text-sm font-medium transition-all"
              >
                <X className="w-4 h-4" />
                مسح
              </button>
            )}

            {/* زر إضافة امتحان */}
            {(role === 'teacher' || role === 'admin') && (
              <button
                onClick={onAddExamClick}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-white text-emerald-700 font-semibold hover:bg-emerald-50 active:scale-95 transition-all shadow-sm text-sm"
              >
                <Plus className="w-5 h-5" />
                <span className="hidden sm:inline">إضافة امتحان</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* محتوى البحث والفلاتر - Collapsible */}
      <div className={`transition-all duration-300 overflow-hidden ${showFilters ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="p-5 bg-gradient-to-br from-slate-50 via-emerald-50/20 to-teal-50/30 space-y-4">
          {/* البحث */}
          <div className="relative group">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
            <input
              type="text"
              placeholder="ابحث عن امتحان بالاسم أو المادة..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pr-12 pl-4 py-3 rounded-xl border border-slate-200 bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition-all text-sm md:text-base placeholder:text-slate-400 shadow-sm"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute left-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-slate-100 transition-colors"
                title="مسح البحث"
                aria-label="مسح البحث"
              >
                <X className="w-4 h-4 text-slate-400" />
              </button>
            )}
          </div>

          {/* الفلاتر */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* فلتر التاريخ */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">
                تاريخ الامتحان
              </label>
              <DatePicker
                value={dateFilter}
                onChange={setDateFilter}
                className="h-[50px] text-base"
              />
            </div>

            {/* فلتر نوع الامتحان */}
            <div className="space-y-2">
              <label htmlFor="exam-type-filter" className="block text-sm font-semibold text-slate-700">
                نوع الامتحان
              </label>
              <select
                id="exam-type-filter"
                title="فلتر نوع الامتحان"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full h-[50px] px-4 py-3 border border-slate-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition-all text-base bg-white shadow-sm"
              >
                <option value="">جميع الأنواع</option>
                <option value="شفهي">شفهي</option>
                <option value="كتابي">كتابي</option>
                <option value="تقييم شامل">تقييم شامل</option>
              </select>
            </div>

            {/* فلتر حالة العلامات */}
            <div className="space-y-2">
              <label htmlFor="marks-status-filter" className="block text-sm font-semibold text-slate-700">
                حالة العلامات
              </label>
              <select
                id="marks-status-filter"
                title="فلتر حالة العلامات"
                value={marksFilter}
                onChange={(e) => setMarksFilter(e.target.value)}
                className="w-full h-[50px] px-4 py-3 border border-slate-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition-all text-base bg-white shadow-sm"
              >
                <option value="">الكل</option>
                <option value="graded">مرصود</option>
                <option value="not-graded">غير مرصود</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
