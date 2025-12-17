// components/StudentView.tsx
import { useState, useMemo } from "react";
import { Card } from "@/components/UI/Card";
import { AR_MONTHS } from "../utils/dateHelpers";
import { useStudentStats } from "../hooks";
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

  return (
    <div className="grid grid-cols-1 gap-6">
      {/* شريط أدوات الطالب */}
      <Card>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              الشهر:
            </label>
            <div className="flex gap-3 items-center">
              {/* اختيار من قائمة عربية */}
              <select
                aria-label="Select month"
                value={selectedMonthIndex}
                onChange={(e) => {
                  const newMonth = parseInt(e.target.value, 10);
                  const newYear = selectedYear;
                  setYearMonth(
                    `${newYear}-${String(newMonth + 1).padStart(2, "0")}`
                  );
                }}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500">
                {AR_MONTHS.map((label, idx) => (
                  <option key={idx} value={idx}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </Card>

      {/* إجمالي السنة */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card
            variant="elevated"
            className="text-center border-r-4 border-emerald-500">
            <div className="text-sm text-gray-600 mb-1">إجمالي الغياب</div>
            <div className="text-2xl font-bold text-red-600">
              {yearTotals.absenceCount}
            </div>
          </Card>
          <Card
            variant="elevated"
            className="text-center border-r-4 border-teal-500">
            <div className="text-sm text-gray-600 mb-1">إجمالي الأيام</div>
            <div className="text-2xl font-bold text-teal-600">
              {yearTotals.totalDays}
            </div>
          </Card>
          <Card
            variant="elevated"
            className="text-center border-r-4 border-amber-500">
            <div className="text-sm text-gray-600 mb-1">نسبة الغياب</div>
            <div className="text-2xl font-bold text-amber-600">
              {yearTotals.rate}%
            </div>
          </Card>
        </div>

      {/* جدول السجل (الشهر المحدد فقط) */}
      <Card variant="elevated" className="overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-600 to-teal-500 py-4 px-6">
          <h2 className="text-xl font-bold text-white">
            سجل الغيابات للشهر المحدد
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-3 px-4 text-right text-sm font-medium text-gray-500">
                  الشهر
                </th>
                <th className="py-3 px-4 text-center text-sm font-medium text-gray-500">
                  أيام الغياب
                </th>
                <th className="py-3 px-4 text-center text-sm font-medium text-gray-500">
                  إجمالي الأيام
                </th>
                <th className="py-3 px-4 text-center text-sm font-medium text-gray-500">
                  نسبة الغياب
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredMonthlyStats.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-6 text-gray-500">
                    لا توجد بيانات للعرض في هذا الشهر
                  </td>
                </tr>
              ) : (
                filteredMonthlyStats.map((m) => (
                  <>
                    <tr key={m.month} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {m.month}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            m.absenceCount === 0
                              ? "bg-green-100 text-green-800"
                              : m.absenceCount <= 2
                              ? "bg-amber-100 text-amber-800"
                              : "bg-red-100 text-red-800"
                          }`}>
                          {m.absenceCount}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center text-sm text-gray-500">
                        {m.totalDays}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-1 mx-auto max-w-[150px]">
                          <div
                            className={`h-2.5 rounded-full ${
                              m.rate === 0
                                ? "bg-green-500"
                                : m.rate <= 10
                                ? "bg-amber-500"
                                : "bg-red-500"
                            }`}
                            style={{ width: `${m.rate}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500">{m.rate}%</span>
                      </td>
                    </tr>
                    {m.absenceDates && m.absenceDates.length > 0 && (
                      <tr className="bg-red-50/30">
                        <td colSpan={4} className="px-4 py-3">
                          <div className="flex flex-col gap-2">
                            <span className="text-xs font-bold text-red-800">تواريخ الغياب:</span>
                            <div className="flex flex-wrap gap-2">
                              {m.absenceDates.map((date, idx) => (
                                <span key={idx} className="px-2 py-1 bg-white border border-red-200 rounded text-xs text-red-600 font-mono">
                                  {new Date(date).toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                </span>
                              ))}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ملاحظة للطالب */}
        <div className="p-4 bg-gray-50">
          <div className="flex items-start p-3 bg-teal-50 rounded-lg">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 ml-2 text-teal-500 mt-0.5 flex-shrink-0"
              viewBox="0 0 20 20"
              fill="currentColor">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            <div>
              <p className="text-sm text-teal-800 font-medium mb-1">
                ملاحظة مهمة
              </p>
              <p className="text-xs text-teal-700">
                الحد المسموح للغياب هو 10% من أيام الدراسة. تجاوز هذه النسبة قد
                يؤثر على التقييم النهائي.
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
