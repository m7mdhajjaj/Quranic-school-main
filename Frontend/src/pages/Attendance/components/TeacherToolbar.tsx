// components/TeacherToolbar.tsx
import { DateRangePicker } from '@/components/UI/DateRangePicker';
import { Users, Check, X, ArrowRight, Search, Save } from 'lucide-react';
import type { TeacherToolbarProps } from '../types/absence.types';

export const TeacherToolbar = ({
  startDate,
  endDate,
  onDateRangeChange,
  availableDates = [],
  currentGroupName,
  onBackToGroups,
  nameQuery,
  onNameQueryChange,
  totalStudents,
  presentCount,
  absentCount,
  attendanceRate,
  isDateTooOld,
  daysAgo,
  onSave,
  isSaving,
  isLoading = false,
  hasUnsavedChanges = false,
}: TeacherToolbarProps) => {
  return (
    <>
      {/* Sticky Header Section */}
      <div className="sticky top-0 z-30 bg-gradient-to-r from-emerald-500/95 to-teal-500/95 backdrop-blur-sm border-b border-emerald-600 shadow-sm py-4 px-4 sm:px-6 -mx-4 sm:mx-0 sm:rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all">
        <div className="flex items-center gap-4 w-full md:w-auto">
          {onBackToGroups && (
            <button 
              onClick={onBackToGroups}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all shadow-sm border border-white/10"
              title="العودة للحلقات"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
          )}
          <div>
            <h2 className="text-lg font-bold text-white">تسجيل الحضور</h2>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
              <p className="text-xs text-emerald-50 font-medium">حلقة: <span className="text-white font-bold">{currentGroupName}</span></p>
            </div>
          </div>
        </div>
        <div className="w-full md:w-auto min-w-[280px]">
          <DateRangePicker 
            startDate={startDate} 
            endDate={endDate} 
            onChange={onDateRangeChange} 
            className="w-full"
            singleDate={true}
            enabledDates={availableDates.length > 0 ? availableDates : undefined}
          />
        </div>
      </div>

      {/* Body Section (Stats & Actions) */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="rounded-2xl p-5 border border-[rgba(0,179,128,0.18)] bg-[rgba(0,179,128,0.06)] flex items-center justify-between hover:bg-[rgba(0,179,128,0.08)] transition-colors">
            <div className="text-right">
              <p className="text-sm font-semibold text-[rgba(0,179,128,1)] mb-1">إجمالي الطلاب</p>
              <p className="text-3xl font-extrabold text-[rgba(0,179,128,1)] leading-none">{totalStudents}</p>
            </div>
            <div className="p-3 bg-white rounded-xl shadow-sm border border-gray-100 text-[rgba(0,179,128,1)]">
              <Users size={22} />
            </div>
          </div>

          <div className="rounded-2xl p-5 border border-[rgba(34,197,94,0.18)] bg-[rgba(34,197,94,0.06)] flex items-center justify-between hover:bg-[rgba(34,197,94,0.08)] transition-colors">
            <div className="text-right">
              <p className="text-sm font-semibold text-[rgba(34,197,94,1)] mb-1">الحاضرون</p>
              <p className="text-3xl font-extrabold text-[rgba(34,197,94,1)] leading-none">{presentCount}</p>
            </div>
            <div className="p-3 bg-white rounded-xl shadow-sm border border-gray-100 text-[rgba(34,197,94,1)]">
              <Check size={22} />
            </div>
          </div>

          <div className="rounded-2xl p-5 border border-[rgba(239,68,68,0.18)] bg-[rgba(239,68,68,0.06)] flex items-center justify-between hover:bg-[rgba(239,68,68,0.08)] transition-colors">
            <div className="text-right">
              <p className="text-sm font-semibold text-[rgba(239,68,68,1)] mb-1">الغائبون</p>
              <p className="text-3xl font-extrabold text-[rgba(239,68,68,1)] leading-none">{absentCount}</p>
            </div>
            <div className="p-3 bg-white rounded-xl shadow-sm border border-gray-100 text-[rgba(239,68,68,1)]">
              <X size={22} />
            </div>
          </div>

          <div className="rounded-2xl p-5 border border-[rgba(168,85,247,0.18)] bg-[rgba(168,85,247,0.06)] flex items-center justify-between hover:bg-[rgba(168,85,247,0.08)] transition-colors">
            <div className="text-right">
              <p className="text-sm font-semibold text-[rgba(168,85,247,1)] mb-1">نسبة الحضور</p>
              <p className="text-3xl font-extrabold text-[rgba(168,85,247,1)] leading-none">{attendanceRate}%</p>
            </div>
            <div className="p-3 bg-white rounded-xl shadow-sm border border-gray-100 text-[rgba(168,85,247,1)]">
              <svg className="w-[22px] h-[22px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col lg:flex-row gap-4 justify-between items-end lg:items-center pt-4 border-t border-gray-100">
          <div className="w-full lg:w-1/3 relative">
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
              <Search size={18} />
            </div>
            <input
              type="text"
              placeholder="بحث عن طالب..."
              value={nameQuery}
              onChange={(e) => onNameQueryChange(e.target.value)}
              className="w-full pl-4 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all outline-none text-sm"
            />
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
            {isDateTooOld && (
              <div className="flex flex-col items-center gap-1 text-red-600 bg-red-50 px-4 py-2.5 rounded-lg text-xs font-medium w-full sm:w-auto border-2 border-red-200">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span className="font-bold">تاريخ قديم ({daysAgo} يوم) - لا يمكن التعديل</span>
                </div>
                <span className="text-[10px] text-red-500">يمكن تعديل الحضور خلال أسبوع فقط من تاريخ أخذه</span>
              </div>
            )}
            
            <button
              onClick={onSave}
              disabled={isDateTooOld || isSaving || !hasUnsavedChanges}
              className={`
                w-full sm:w-auto px-6 py-2.5 rounded-xl font-bold text-white shadow-sm flex items-center justify-center gap-2 transition-all
                ${isDateTooOld || isSaving || !hasUnsavedChanges
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-700 hover:shadow-md active:scale-95'
                }
              `}
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>جاري الحفظ...</span>
                </>
              ) : (
                <>
                  <Save size={18} />
                  <span>حفظ السجل</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
