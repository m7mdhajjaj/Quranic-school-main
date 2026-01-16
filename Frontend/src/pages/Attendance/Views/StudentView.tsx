// components/StudentView.tsx
import { AR_MONTHS } from "../utils/dateHelpers";
import { useStudentStats } from "../hooks";
import { Calendar, CheckCircle2, CalendarDays, AlertCircle } from "lucide-react";
import type { StudentViewProps } from "../types/absence.types";
import { TotalAbsenceCard, AbsenceRateCard, WeeklyStatsCard } from "../components/StudentStatsCards";

export const StudentView = ({ 
  monthlyStats, 
  weeklyStats, 
  currentMonthStats, 
  currentUserId,
  fetchStudentAbsenceStats,
}: StudentViewProps) => {
  
  // كل المنطق في الـ hook
  const {
    filteredMonthlyStats,
    currentViewStats,
    viewMode,
    selectedYear,
    selectedMonthIndex,
    availableYears,
    handleViewModeChange,
    handleMonthChange,
    handleYearChange
  } = useStudentStats({
    monthlyStats,
    weeklyStats,
    currentMonthStats,
    selectedYear: undefined,
    selectedMonthIndex: undefined,
    viewMode: 'weekly',
    currentUserId,
    fetchStudentAbsenceStats
  });

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header مع gradient جميل */}
      <div className="relative overflow-hidden bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 rounded-3xl shadow-2xl p-8">
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute top-10 right-10 w-32 h-32 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 left-10 w-40 h-40 bg-white rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
             <div className="flex items-center gap-3">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
                  <Calendar className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-white">سجل الحضور والغياب</h2>
                  <p className="text-emerald-50 text-sm mt-1">تابع إحصائياتك الأسبوعية أو الشهرية</p>
                </div>
             </div>
             
             {/* Toggle Switch (Weekly vs Monthly) */}
             <div className="flex p-1 bg-white/20 backdrop-blur-md rounded-xl">
               <button
                 onClick={() => handleViewModeChange('weekly')}
                 className={`px-4 py-2 rounded-lg text-sm font-bold transition-all duration-300 ${
                   viewMode === 'weekly' 
                     ? 'bg-white text-emerald-700 shadow-lg' 
                     : 'text-white hover:bg-white/10'
                 }`}
               >
                 الأسبوع الحالي
               </button>
               <button
                 onClick={() => handleViewModeChange('monthly')}
                 className={`px-4 py-2 rounded-lg text-sm font-bold transition-all duration-300 ${
                   viewMode === 'monthly' 
                     ? 'bg-white text-emerald-700 shadow-lg' 
                     : 'text-white hover:bg-white/10'
                 }`}
               >
                 التقرير الشهري
               </button>
             </div>
          </div>
          
          {/* اختيار الشهر والسنة - يظهر فقط في الوضع الشهري */}
          <div className={`mt-6 transition-all duration-500 overflow-hidden ${viewMode === 'monthly' ? 'max-h-24 opacity-100' : 'max-h-0 opacity-0'}`}>
            <label className="block text-sm font-semibold text-white mb-2 flex items-center gap-2">
              <CalendarDays className="w-4 h-4" />
              تصفية حسب التاريخ
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <select
                aria-label="Select month"
                value={selectedMonthIndex}
                onChange={(e) => handleMonthChange(parseInt(e.target.value, 10))}
                className="flex-1 sm:flex-initial bg-white/95 backdrop-blur-sm border-0 rounded-xl px-4 py-3 text-gray-800 font-medium shadow-lg focus:outline-none focus:ring-4 focus:ring-white/30 transition-all">
                {AR_MONTHS.map((label, idx) => (
                  <option key={idx} value={idx}>{label}</option>
                ))}
              </select>

              <select
                aria-label="Select year"
                value={selectedYear}
                onChange={(e) => handleYearChange(parseInt(e.target.value, 10))}
                className="flex-1 sm:flex-initial sm:w-32 bg-white/95 backdrop-blur-sm border-0 rounded-xl px-4 py-3 text-gray-800 font-medium shadow-lg focus:outline-none focus:ring-4 focus:ring-white/30 transition-all">
                {availableYears.map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* عنوان القسم */}
      <div className="flex items-center gap-3 px-2">
        <div className="h-1 w-12 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-full"></div>
        <h3 className="text-lg font-bold text-gray-800">
          {viewMode === 'weekly' ? 'ملخص الأسبوع الحالي' : `إحصائيات شهر ${AR_MONTHS[selectedMonthIndex]} ${selectedYear}`}
        </h3>
        <div className="h-1 flex-1 bg-gradient-to-r from-teal-600 to-emerald-700 rounded-full"></div>
      </div>

      {/* Grid للإحصائيات المتغيرة حسب الـ ViewMode */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* إجمالي الغياب (للفترة المختارة) */}
        <TotalAbsenceCard 
          count={currentViewStats.absenceCount} 
          label={viewMode === 'weekly' ? 'غيابات هذا الأسبوع' : `غيابات عام ${selectedYear}`} 
        />

        {/* إجمالي الأيام (المقام) */}
        <WeeklyStatsCard 
          totalDays={currentViewStats.totalDays} 
          absenceCount={currentViewStats.absenceCount}
          label={viewMode === 'weekly' ? 'مقاطع هذا الأسبوع' : 'إجمالي المقاطع'}
        />

        {/* نسبة الغياب */}
        <AbsenceRateCard 
          rate={currentViewStats.rate} 
          absenceCount={currentViewStats.absenceCount} 
          totalDays={currentViewStats.totalDays} 
        />
      </div>

      {/* تفاصيل الغياب - قائمة التواريخ */}
      <div className="bg-white rounded-3xl shadow-xl border border-emerald-100 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 py-6 px-8">
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <div className="p-2 bg-white/10 backdrop-blur-sm rounded-xl">
              <CalendarDays className="w-6 h-6" />
            </div>
            {viewMode === 'weekly' ? 'تفاصيل غياب الأسبوع' : 'سجل الحضور الشهري'}
          </h2>
          <p className="text-emerald-50 text-sm mt-2">
            {viewMode === 'weekly' 
              ? 'الأيام التي تغيبت فيها خلال هذا الأسبوع' 
              : 'تفاصيل حضورك وغيابك للشهر المحدد'}
          </p>
        </div>

        {/* Content Area */}
        <div className="p-6 md:p-8">
          {/* منطق العرض الأسبوعي */}
          {viewMode === 'weekly' && (
            <div>
              {currentViewStats.absenceDates && currentViewStats.absenceDates.length > 0 ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-xl border border-red-100 w-fit">
                     <AlertCircle className="w-5 h-5" />
                     <span className="font-bold">فيا يلي تواريخ الغياب المسجلة لهذا الأسبوع:</span>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {currentViewStats.absenceDates.map((date, idx) => (
                      <div key={idx} className="flex items-center gap-3 px-5 py-3 bg-white border border-red-200 rounded-xl shadow-sm hover:shadow-md transition-all">
                        <div className="p-2 bg-red-100 rounded-lg">
                          <Calendar className="w-5 h-5 text-red-600" />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-800">
                            {new Date(date).toLocaleDateString('ar-EG', { weekday: 'long', timeZone: 'Asia/Jerusalem' })}
                          </span>
                          <span className="text-xs text-gray-500 font-medium">
                            {new Date(date).toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Jerusalem' })}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                   <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mb-4">
                      <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                   </div>
                   <h3 className="text-xl font-bold text-gray-800">حضورك مكتمل هذا الأسبوع!</h3>
                   <p className="text-gray-500">بداية موفقة، استمر في الالتزام 💪</p>
                </div>
              )}
            </div>
          )}

          {/* منطق العرض الشهري (Timeline القديم) */}
          {viewMode === 'monthly' && (
             <div className="space-y-6">
               {filteredMonthlyStats.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-6">
                      <Calendar className="w-10 h-10 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">لا توجد بيانات لهذا الشهر</h3>
                    <p className="text-gray-500">اختر شهراً آخر من القائمة أعلاه</p>
                  </div>
               ) : (
                 filteredMonthlyStats.map((m) => (
                    <div key={m.month} className="animate-in fade-in slide-in-from-right duration-500">
                      {/* Reuse the existing card logic for monthly detail */}
                       <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
                          <div className="flex flex-wrap gap-4 items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                              <span className="w-2 h-8 bg-emerald-500 rounded-full"></span>
                              تفاصيل شهر {AR_MONTHS[selectedMonthIndex]}
                            </h3>
                            <div className={`px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 ${
                                m.absenceCount === 0 ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                              }`}>
                                {m.absenceCount === 0 ? <CheckCircle2 className="w-4 h-4"/> : <AlertCircle className="w-4 h-4"/>}
                                {m.absenceCount === 0 ? "حضور كامل" : `إجمالي التغيب: ${m.absenceCount} يوم`}
                            </div>
                          </div>
                          
                          {/* تواريخ الغياب الشهرية */}
                          {m.absenceDates && m.absenceDates.length > 0 ? (
                             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                                {m.absenceDates.map((date, i) => (
                                  <div key={i} className="flex items-center gap-3 px-4 py-3 bg-white rounded-xl border border-gray-200">
                                     <div className="w-2 h-2 rounded-full bg-red-500"></div>
                                     <span className="font-bold text-gray-700">
                                       {new Date(date).toLocaleDateString('ar-EG', { weekday: 'short', day: 'numeric', timeZone: 'Asia/Jerusalem' })}
                                     </span>
                                  </div>
                                ))}
                             </div>
                          ) : (
                             <div className="text-center py-8 text-gray-400 font-medium bg-white rounded-xl border border-dashed border-gray-300">
                                لا توجد أيام غياب مسجلة
                             </div>
                          )}
                       </div>
                    </div>
                 ))
               )}
             </div>
          )}
        </div>

        {/* ملاحظة للطالب */}
        <div className="p-6 bg-gradient-to-br from-teal-50 to-cyan-50 border-t border-teal-100">
          <div className="flex items-start gap-4 p-4 bg-white/70 backdrop-blur-sm rounded-2xl border border-teal-200">
            <div className="flex-shrink-0 p-2 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-xl">
             <AlertCircle className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-teal-900 font-bold mb-2 flex items-center gap-2">
                <span className="w-2 h-2 bg-teal-500 rounded-full"></span>
                ملاحظة مهمة
              </p>
              <p className="text-sm text-teal-800 leading-relaxed">
                الحد المسموح للغياب هو <span className="font-bold text-teal-900">10%</span> من أيام الدراسة. 
                تجاوز هذه النسبة قد يؤثر على <span className="font-bold text-teal-900">التقييم النهائي</span> والحصول على الشهادة.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

