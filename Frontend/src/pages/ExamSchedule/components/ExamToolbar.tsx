import React, { useState } from 'react';
import { Search, Plus, X, SlidersHorizontal } from 'lucide-react';
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
  role: 'student' | 'teacher' | 'admin';
  teacherGroups?: string[]; // Optional since we removed the check
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

  // تحديد الألوان حسب الدور - جميع المستخدمين يستخدمون اللون الأخضر
  const colors = {
    student: {
      bg: 'from-emerald-500 to-teal-600',
      hover: 'hover:from-emerald-600 hover:to-teal-700',
      border: 'border-emerald-100',
      focus: 'focus:border-emerald-400 focus:ring-emerald-50',
      text: 'text-emerald-400 group-focus-within:text-emerald-600',
      filterBg: 'from-emerald-50/50 to-teal-50/50',
      filterActive: 'bg-emerald-50 border-emerald-400 text-emerald-700',
      filterHover: 'hover:border-emerald-300',
      filterDot: 'bg-emerald-500',
    },
    teacher: {
      bg: 'from-emerald-500 to-teal-600',
      hover: 'hover:from-emerald-600 hover:to-teal-700',
      border: 'border-emerald-100',
      focus: 'focus:border-emerald-400 focus:ring-emerald-50',
      text: 'text-emerald-400 group-focus-within:text-emerald-600',
      filterBg: 'from-emerald-50/50 to-teal-50/50',
      filterActive: 'bg-emerald-50 border-emerald-400 text-emerald-700',
      filterHover: 'hover:border-emerald-300',
      filterDot: 'bg-emerald-500',
    },
    admin: {
      bg: 'from-emerald-500 to-teal-600',
      hover: 'hover:from-emerald-600 hover:to-teal-700',
      border: 'border-emerald-100',
      focus: 'focus:border-emerald-400 focus:ring-emerald-50',
      text: 'text-emerald-400 group-focus-within:text-emerald-600',
      filterBg: 'from-emerald-50/50 to-teal-50/50',
      filterActive: 'bg-emerald-50 border-emerald-400 text-emerald-700',
      filterHover: 'hover:border-emerald-300',
      filterDot: 'bg-emerald-500',
    },
  };

  const colorScheme = colors[role];
  const hasActiveFilters = query || dateFilter || typeFilter || marksFilter;

  const clearAllFilters = () => {
    setQuery('');
    setDateFilter('');
    setTypeFilter('');
    setMarksFilter('');
  };

  return (
    <div className={`bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border ${colorScheme.border} overflow-hidden`}>
      <div className="p-4 md:p-5">
        <div className="flex flex-col lg:flex-row gap-3">
          {/* البحث */}
          <div className="flex-1 relative group">
            <Search className={`absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 ${colorScheme.text} transition-colors`} />
            <input
              type="text"
              placeholder="ابحث عن امتحان بالاسم أو المادة..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className={`w-full pr-12 pl-4 py-3 rounded-xl border-2 ${colorScheme.border} bg-white ${colorScheme.focus} outline-none transition-all text-sm md:text-base placeholder:text-gray-400 focus:ring-4`}
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute left-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-100 transition-colors"
                title="مسح البحث"
                aria-label="مسح البحث"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            )}
          </div>

          {/* أزرار الإجراءات */}
          <div className="flex gap-2">
            {/* زر الفلاتر */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 transition-all font-medium text-sm ${hasActiveFilters
                ? colorScheme.filterActive
                : `bg-white ${colorScheme.border} text-gray-700 ${colorScheme.filterHover}`
                }`}
              title="فتح الفلاتر"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span className="hidden sm:inline">فلاتر</span>
              {hasActiveFilters && (
                <span className={`w-2 h-2 ${colorScheme.filterDot} rounded-full animate-pulse`} />
              )}
            </button>

            {/* زر إضافة امتحان */}
            {(role === 'teacher' || role === 'admin') && (
              <button
                onClick={onAddExamClick}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r ${colorScheme.bg} text-white font-medium ${colorScheme.hover} active:scale-95 transition-all shadow-lg hover:shadow-xl text-sm`}
              >
                <Plus className="w-5 h-5" />
                <span className="hidden sm:inline">إضافة امتحان</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* لوحة الفلاتر المتقدمة */}
      {showFilters && (
        <div className={`border-t-2 ${colorScheme.border} bg-gradient-to-br ${colorScheme.filterBg} p-4 md:p-5 animate-slideDown`}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* فلتر التاريخ */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-700">
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
              <label className="block text-sm font-bold text-gray-700">
                نوع الامتحان
              </label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className={`w-full h-[50px] px-4 py-3 border-2 ${colorScheme.border} rounded-xl ${colorScheme.focus} outline-none transition-all text-base bg-white focus:ring-4`}
                title="فلتر نوع الامتحان"
              >
                <option value="">جميع الأنواع</option>
                <option value="شفهي">شفهي</option>
                <option value="كتابي">كتابي</option>
                <option value="تقييم شامل">تقييم شامل</option>
              </select>
            </div>

            {/* فلتر حالة العلامات */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-700">
                حالة العلامات
              </label>
              <select
                value={marksFilter}
                onChange={(e) => setMarksFilter(e.target.value)}
                className={`w-full h-[50px] px-4 py-3 border-2 ${colorScheme.border} rounded-xl ${colorScheme.focus} outline-none transition-all text-base bg-white focus:ring-4`}
                title="فلتر حالة العلامات"
              >
                <option value="">الكل</option>
                <option value="graded">مرصود</option>
                <option value="not-graded">غير مرصود</option>
              </select>
            </div>
          </div>

          {/* زر مسح الفلاتر */}
          {hasActiveFilters && (
            <div className="flex justify-end pt-4">
              <button
                onClick={clearAllFilters}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-all"
              >
                <X className="w-4 h-4" />
                مسح جميع الفلاتر
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
