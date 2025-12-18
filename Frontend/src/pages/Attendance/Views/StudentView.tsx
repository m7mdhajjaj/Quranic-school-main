// components/StudentView.tsx
import { useState, useMemo } from "react";
import { AR_MONTHS } from "../utils/dateHelpers";
import { useStudentStats } from "../hooks";
import { Calendar, AlertCircle, CheckCircle2, TrendingUp, CalendarDays } from "lucide-react";
import type { StudentViewProps } from "../types/absence.types";

export const StudentView = ({ monthlyStats }: StudentViewProps) => {
  // السنة والشهر المختارين
  const [yearMonth, setYearMonth] = useState<string>(
    new Date().toISOString().substring(0, 7)
  );

  const selectedYear = useMemo(
    () => parseInt(yearMonth.split("-")[0], 10),
    [yearMonth]
  );
  const selectedMonthIndex = useMemo(
    () => Math.max(0, parseInt(yearMonth.split("-")[1], 10) - 1),
    [yearMonth]
  );

  // استخدام hook منفصل لحساب الإحصائيات
  const { filteredMonthlyStats, yearTotals } = useStudentStats({
    monthlyStats,
    selectedYear,
    selectedMonthIndex,
  });

  // الحصول على السنوات المتاحة (السنة الحالية + آخر 5 سنوات)
  const availableYears = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const years: number[] = [];
    
    // إنشاء مصفوفة من السنة الحالية لـ 5 سنوات ماضية
    for (let i = 0; i <= 5; i++) {
      years.push(currentYear - i);
    }
    
    return years; // مرتبة تلقائياً (2025, 2024, 2023, 2022, 2021, 2020)
  }, []); // لا يعتمد على monthlyStats، فقط السنة الحالية

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header مع gradient جميل */}
      <div className="relative overflow-hidden bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 rounded-3xl shadow-2xl p-8">
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute top-10 right-10 w-32 h-32 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 left-10 w-40 h-40 bg-white rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
              <Calendar className="w-8 h-8 text-white" />
            </div>
          <div>
              <h2 className="text-3xl font-bold text-white">سجل الحضور والغياب</h2>
              <p className="text-emerald-50 text-sm mt-1">تابع حضورك الشهري والسنوي</p>
            </div>
          </div>
          
          {/* اختيار الشهر والسنة */}
          <div className="mt-6">
            <label className="block text-sm font-semibold text-white mb-2 flex items-center gap-2">
              <CalendarDays className="w-4 h-4" />
              اختر الشهر والسنة
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              {/* اختيار الشهر */}
              <select
                aria-label="Select month"
                value={selectedMonthIndex}
                onChange={(e) => {
                  const newMonth = parseInt(e.target.value, 10);
                  setYearMonth(
                    `${selectedYear}-${String(newMonth + 1).padStart(2, "0")}`
                  );
                }}
                className="flex-1 sm:flex-initial bg-white/95 backdrop-blur-sm border-0 rounded-xl px-4 py-3 text-gray-800 font-medium shadow-lg focus:outline-none focus:ring-4 focus:ring-white/30 transition-all">
                {AR_MONTHS.map((label, idx) => (
                  <option key={idx} value={idx}>
                    {label}
                  </option>
                ))}
              </select>

              {/* اختيار السنة */}
              <select
                aria-label="Select year"
                value={selectedYear}
                onChange={(e) => {
                  const newYear = parseInt(e.target.value, 10);
                  setYearMonth(
                    `${newYear}-${String(selectedMonthIndex + 1).padStart(2, "0")}`
                  );
                }}
                className="flex-1 sm:flex-initial sm:w-32 bg-white/95 backdrop-blur-sm border-0 rounded-xl px-4 py-3 text-gray-800 font-medium shadow-lg focus:outline-none focus:ring-4 focus:ring-white/30 transition-all">
                {availableYears.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
            </div>
          </div>
        </div>

      {/* عنوان القسم */}
      <div className="flex items-center gap-3 px-2">
        <div className="h-1 w-12 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-full"></div>
        <h3 className="text-lg font-bold text-gray-800">الإحصائيات الإجمالية - عام {selectedYear}</h3>
        <div className="h-1 flex-1 bg-gradient-to-r from-teal-600 to-emerald-700 rounded-full"></div>
      </div>

      {/* إجمالي السنة - Stat Cards عصرية متناسقة */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* إجمالي الغياب */}
        <div className="group relative overflow-hidden bg-gradient-to-br from-rose-50 via-pink-50 to-red-100 rounded-3xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500 border border-rose-200">
          <div className="absolute top-0 left-0 w-full h-full opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-rose-300 rounded-full blur-3xl"></div>
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-rose-500/10 to-pink-500/10 backdrop-blur-sm rounded-2xl">
                <AlertCircle className="w-6 h-6 text-rose-600" />
              </div>
              <div className="px-3 py-1 bg-rose-100 rounded-full border border-rose-200">
                <span className="text-xs font-bold text-rose-700">عدد الأيام</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm font-semibold text-rose-700">إجمالي الغياب</p>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black bg-gradient-to-br from-rose-600 to-pink-600 bg-clip-text text-transparent">
              {yearTotals.absenceCount}
                </span>
                <span className="text-sm text-rose-500 font-semibold">يوم</span>
              </div>
              <p className="text-xs text-rose-600/70 font-medium">للسنة {selectedYear}</p>
            </div>
          </div>
        </div>

        {/* إجمالي الأيام */}
        <div className="group relative overflow-hidden bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-100 rounded-3xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500 border border-emerald-200">
          <div className="absolute top-0 left-0 w-full h-full opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-300 rounded-full blur-3xl"></div>
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 backdrop-blur-sm rounded-2xl">
                <Calendar className="w-6 h-6 text-emerald-600" />
              </div>
              <div className="px-3 py-1 bg-emerald-100 rounded-full border border-emerald-200">
                <span className="text-xs font-bold text-emerald-700">المجموع</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm font-semibold text-emerald-700">إجمالي الأيام</p>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black bg-gradient-to-br from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              {yearTotals.totalDays}
                </span>
                <span className="text-sm text-emerald-500 font-semibold">يوم</span>
              </div>
              <p className="text-xs text-emerald-600/70 font-medium">للسنة {selectedYear}</p>
            </div>
          </div>
        </div>

        {/* نسبة الغياب */}
        <div className="group relative overflow-hidden bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-100 rounded-3xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500 border border-amber-200">
          <div className="absolute top-0 left-0 w-full h-full opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-300 rounded-full blur-3xl"></div>
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-amber-500/10 to-orange-500/10 backdrop-blur-sm rounded-2xl">
                <TrendingUp className="w-6 h-6 text-amber-600" />
              </div>
              <div className="px-3 py-1 bg-amber-100 rounded-full border border-amber-200">
                <span className="text-xs font-bold text-amber-700">النسبة</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm font-semibold text-amber-700">نسبة الغياب الإجمالية</p>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black bg-gradient-to-br from-amber-600 to-orange-600 bg-clip-text text-transparent">
                  {yearTotals.rate.toFixed(1)}
                </span>
                <span className="text-2xl bg-gradient-to-br from-amber-500 to-orange-500 bg-clip-text text-transparent font-black">%</span>
              </div>
              <p className="text-xs text-amber-600/70 font-medium">
                {yearTotals.absenceCount} غياب من أصل {yearTotals.totalDays} يوم دراسة
              </p>
              
              {/* Progress Bar */}
              <div className="mt-3 w-full bg-amber-200/50 rounded-full h-2.5 overflow-hidden shadow-inner">
                <div 
                  className="h-full bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 rounded-full transition-all duration-1000 shadow-lg"
                  style={{ width: `${Math.min(yearTotals.rate, 100)}%` }}
                ></div>
              </div>
            </div>
            </div>
            </div>
        </div>

      {/* سجل الحضور - Timeline عصري */}
      <div className="bg-white rounded-3xl shadow-xl border border-emerald-100 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 py-6 px-8">
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <div className="p-2 bg-white/10 backdrop-blur-sm rounded-xl">
              <CalendarDays className="w-6 h-6" />
            </div>
            سجل الحضور الشهري
          </h2>
          <p className="text-emerald-50 text-sm mt-2">تفاصيل حضورك وغيابك للشهر المحدد</p>
        </div>

        {/* Content */}
        <div className="p-6 md:p-8">
              {filteredMonthlyStats.length === 0 ? (
            /* Empty State جميل */
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full mb-6">
                <CheckCircle2 className="w-10 h-10 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">لا توجد بيانات</h3>
              <p className="text-gray-500 max-w-md mx-auto">
                {monthlyStats.length > 0 
                  ? `لا توجد بيانات لشهر ${AR_MONTHS[selectedMonthIndex]} ${selectedYear}. جرب شهر آخر من القائمة أعلاه.`
                  : 'لم يتم رصد أي حضور أو غياب بعد. سيتم تحديث السجل بشكل تلقائي عند رصد المعلم للحضور.'
                }
              </p>
            </div>
              ) : (
            /* Timeline View */
            <div className="space-y-6">
              {filteredMonthlyStats.map((m, index) => (
                <div 
                  key={m.month} 
                  className="group animate-in fade-in slide-in-from-right duration-500"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Month Card */}
                  <div className="relative bg-gradient-to-br from-slate-50 to-gray-50 rounded-2xl p-6 border border-slate-200 hover:shadow-xl transition-all duration-300">
                    {/* Month Badge */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl">
                          <Calendar className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-800">{m.month}</h3>
                      </div>
                      
                      {/* Status Badge */}
                      <div className={`px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 ${
                            m.absenceCount === 0
                          ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                              : m.absenceCount <= 2
                          ? "bg-amber-100 text-amber-700 border border-amber-200"
                          : "bg-red-100 text-red-700 border border-red-200"
                          }`}>
                        {m.absenceCount === 0 ? (
                          <>
                            <CheckCircle2 className="w-4 h-4" />
                            <span>حضور مثالي</span>
                          </>
                        ) : (
                          <>
                            <AlertCircle className="w-4 h-4" />
                            <span>{m.absenceCount} أيام غياب</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      {/* أيام الغياب */}
                      <div className="bg-white rounded-xl p-4 border border-gray-100 text-center hover:shadow-md transition-shadow">
                        <div className="text-2xl font-black text-red-600 mb-1">
                          {m.absenceCount}
                        </div>
                        <div className="text-xs font-medium text-gray-600">أيام الغياب</div>
                      </div>

                      {/* إجمالي الأيام */}
                      <div className="bg-white rounded-xl p-4 border border-gray-100 text-center hover:shadow-md transition-shadow">
                        <div className="text-2xl font-black text-emerald-600 mb-1">
                        {m.totalDays}
                        </div>
                        <div className="text-xs font-medium text-gray-600">إجمالي الأيام</div>
                      </div>

                      {/* نسبة الغياب */}
                      <div className="bg-white rounded-xl p-4 border border-gray-100 text-center hover:shadow-md transition-shadow">
                        <div className="text-2xl font-black text-amber-600 mb-1">
                          {m.rate.toFixed(1)}%
                        </div>
                        <div className="text-xs font-medium text-gray-600">نسبة الغياب</div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-semibold text-gray-600">معدل الحضور للشهر</span>
                        <span className="text-xs font-bold text-emerald-600">{(100 - m.rate).toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden shadow-inner">
                          <div
                          className={`h-full rounded-full transition-all duration-1000 ${
                              m.rate === 0
                              ? "bg-gradient-to-r from-emerald-500 to-teal-600"
                                : m.rate <= 10
                              ? "bg-gradient-to-r from-emerald-500 to-teal-500"
                              : m.rate <= 25
                              ? "bg-gradient-to-r from-amber-500 to-orange-500"
                              : "bg-gradient-to-r from-red-500 to-rose-500"
                            }`}
                          style={{ width: `${100 - m.rate}%` }}
                        ></div>
                      </div>
                        </div>

                    {/* تواريخ الغياب */}
                    {m.absenceDates && m.absenceDates.length > 0 && (
                      <div className="mt-4 p-4 bg-red-50/50 rounded-xl border border-red-100">
                        <div className="flex items-center gap-2 mb-3">
                          <AlertCircle className="w-4 h-4 text-red-600" />
                          <span className="text-sm font-bold text-red-800">تواريخ الغياب</span>
                        </div>
                            <div className="flex flex-wrap gap-2">
                              {m.absenceDates.map((date, idx) => (
                            <div 
                              key={idx} 
                              className="group/date relative px-4 py-2 bg-white border-2 border-red-200 rounded-xl hover:border-red-400 hover:shadow-md transition-all duration-300"
                            >
                              <div className="flex items-center gap-2">
                                <Calendar className="w-3.5 h-3.5 text-red-500" />
                                <span className="text-sm font-semibold text-red-700">
                                  {new Date(date).toLocaleDateString('ar-EG', { 
                                    weekday: 'short', 
                                    day: 'numeric',
                                    month: 'short'
                                  })}
                                </span>
                              </div>
                            </div>
                              ))}
                            </div>
                          </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ملاحظة للطالب */}
        <div className="p-6 bg-gradient-to-br from-teal-50 to-cyan-50 border-t border-teal-100">
          <div className="flex items-start gap-4 p-4 bg-white/70 backdrop-blur-sm rounded-2xl border border-teal-200">
            <div className="flex-shrink-0 p-2 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-xl">
            <svg
              xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-white"
              viewBox="0 0 20 20"
              fill="currentColor">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
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
