// components/StudentsTable.tsx
import { useState } from "react";
import { Card } from "@/components/UI/Card";
import type {
  AttendanceStudent,
  StudentsTableProps,
} from "../types/absence.types";

export const StudentsTable = ({
  students,
  selectedAll,
  onToggleAll,
  onTogglePresence,
}: StudentsTableProps) => {
  const [expandedStudentId, setExpandedStudentId] = useState<string | null>(
    null
  );

  return (
    <Card variant="elevated" className="overflow-hidden">
      <div className="bg-gradient-to-r from-emerald-600 to-teal-500 py-4 sm:py-6 px-4 sm:px-8 flex justify-between items-center">
        <h2 className="text-xl sm:text-3xl font-bold text-white">قائمة الطلاب</h2>
        {/* زر تحديد الكل للموبايل */}
        <div className="md:hidden flex items-center gap-2 bg-white/20 px-3 py-2 rounded-lg">
          <input
            type="checkbox"
            checked={selectedAll}
            onChange={onToggleAll}
            className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500"
            aria-label="تحديد الكل"
          />
          <span className="text-sm text-white font-medium">الكل</span>
        </div>
      </div>

      {students.length === 0 ? (
        <div className="text-center py-10 text-lg sm:text-xl text-gray-500">
          لا يوجد طلاب مطابقين للفلترة/البحث
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto relative">
            <table className="w-full table-fixed">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr className="min-h-[60px]">
                  <th className="py-5 px-6 text-right text-lg font-bold text-gray-700 w-[140px]">
                    رقم الطالب
                  </th>
                  <th className="py-5 px-6 text-right text-lg font-bold text-gray-700 w-[250px]">
                    اسم الطالب
                  </th>
                  <th className="py-5 px-6 text-right text-lg font-bold text-gray-700 w-[150px]">
                    الحلقة
                  </th>
                  <th className="py-5 px-6 text-center text-lg font-bold text-gray-700 w-[160px]">
                    عدد الغيابات
                  </th>
                  <th className="py-5 px-6 text-center text-lg font-bold text-gray-700 w-[180px]">
                    تواريخ الغيابات
                  </th>
                  <th className="py-5 px-8 text-center text-lg font-bold text-gray-700 w-[160px]">
                    <div className="flex items-center justify-center gap-3">
                      <input
                        type="checkbox"
                        checked={selectedAll}
                        onChange={onToggleAll}
                        className="w-6 h-6 text-emerald-600 rounded focus:ring-emerald-500"
                        aria-label="تحديد الكل"
                        title="تحديد الكل"
                      />
                      <span className="text-lg">الحضور</span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {students.map((s) => (
                  <tr
                    key={s._id}
                    className="hover:bg-gray-50 cursor-pointer transition-colors min-h-[70px]"
                    onClick={() => onTogglePresence(s._id)}
                  >
                    <td className="px-6 py-5 text-lg text-gray-600 font-medium">
                      {s.studentId}
                    </td>
                    <td className="px-6 py-5 text-lg font-bold text-gray-900">
                      {s.name}
                    </td>
                    <td className="px-6 py-5 text-lg text-gray-600">
                      {s.group ?? "-"}
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span
                        className={`inline-flex items-center justify-center w-12 h-12 rounded-full text-lg font-bold ${
                          (s.totalAbsences ?? 0) === 0
                            ? "bg-green-100 text-green-700"
                            : (s.totalAbsences ?? 0) <= 3
                            ? "bg-yellow-100 text-yellow-700"
                            : (s.totalAbsences ?? 0) <= 7
                            ? "bg-orange-100 text-orange-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {s.totalAbsences ?? 0}
                      </span>
                    </td>
                    <td
                      className="px-6 py-5 text-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {(s.absenceDates ?? []).length === 0 ? (
                        <span className="text-base text-gray-400 italic">
                          لا يوجد غيابات
                        </span>
                      ) : (
                        <div className="relative inline-block">
                          <button
                            onClick={() =>
                              setExpandedStudentId(
                                expandedStudentId === s._id ? null : s._id
                              )
                            }
                            className="text-base bg-blue-50 hover:bg-blue-100 text-blue-700 px-5 py-2 rounded-full font-bold transition-colors"
                          >
                            {expandedStudentId === s._id
                              ? "إخفاء"
                              : `عرض (${s.absenceDates?.length})`}
                          </button>

                          {expandedStudentId === s._id && (
                            <div className="absolute left-1/2 transform -translate-x-1/2 top-full mt-2 w-56 bg-white border-2 border-blue-200 rounded-lg shadow-2xl z-50 max-h-64 overflow-hidden">
                              <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 font-bold text-sm flex items-center justify-between">
                                <span>تواريخ الغيابات</span>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setExpandedStudentId(null);
                                  }}
                                  className="hover:bg-blue-700 rounded-full w-6 h-6 flex items-center justify-center transition-colors"
                                >
                                  ✕
                                </button>
                              </div>

                              <div className="max-h-48 overflow-y-auto p-3">
                                <ul className="space-y-2">
                                  {s.absenceDates?.map((date, idx) => (
                                    <li
                                      key={idx}
                                      className="flex items-center gap-2 text-sm bg-red-50 hover:bg-red-100 px-3 py-2 rounded-lg transition-colors"
                                    >
                                      <span className="text-red-500 font-bold">
                                        📅
                                      </span>
                                      <span className="text-gray-700 font-medium">
                                        {date}
                                      </span>
                                    </li>
                                  ))}
                                </ul>
                              </div>

                              <div className="bg-gray-50 px-4 py-2 border-t border-gray-200 text-center">
                                <span className="text-xs text-gray-600">
                                  إجمالي:{" "}
                                  <span className="font-bold text-red-600">
                                    {s.absenceDates?.length}
                                  </span>{" "}
                                  غياب
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </td>
                    <td
                      className="px-8 py-5 text-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="checkbox"
                        checked={s.isPresent}
                        onChange={() => onTogglePresence(s._id)}
                        className="w-7 h-7 text-emerald-600 rounded focus:ring-emerald-500 cursor-pointer"
                        aria-label={`حضور ${s.name}`}
                        title={`حضور ${s.name}`}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden divide-y divide-gray-200">
            {students.map((s) => (
              <div
                key={s._id}
                className="p-4 hover:bg-gray-50 transition-colors"
              >
                {/* Header - Name and Presence */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">
                      {s.name}
                    </h3>
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <span className="font-medium">الرقم:</span>
                        <span className="font-bold">{s.studentId}</span>
                      </span>
                      {s.group && (
                        <>
                          <span className="text-gray-400">•</span>
                          <span className="flex items-center gap-1">
                            <span className="font-medium">الحلقة:</span>
                            <span className="font-bold">{s.group}</span>
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <div
                    className="flex-shrink-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <label className="flex flex-col items-center gap-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={s.isPresent}
                        onChange={() => onTogglePresence(s._id)}
                        className="w-8 h-8 text-emerald-600 rounded focus:ring-emerald-500"
                        aria-label={`حضور ${s.name}`}
                      />
                      <span className="text-xs font-medium text-gray-600">
                        حاضر
                      </span>
                    </label>
                  </div>
                </div>

                {/* Absence Info */}
                <div className="flex items-center gap-3 flex-wrap">
                  {/* Absence Count Badge */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-600">
                      الغيابات:
                    </span>
                    <span
                      className={`inline-flex items-center justify-center min-w-[36px] h-9 px-2 rounded-full text-sm font-bold ${
                        (s.totalAbsences ?? 0) === 0
                          ? "bg-green-100 text-green-700"
                          : (s.totalAbsences ?? 0) <= 3
                          ? "bg-yellow-100 text-yellow-700"
                          : (s.totalAbsences ?? 0) <= 7
                          ? "bg-orange-100 text-orange-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {s.totalAbsences ?? 0}
                    </span>
                  </div>

                  {/* Absence Dates Button */}
                  {(s.absenceDates ?? []).length > 0 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setExpandedStudentId(
                          expandedStudentId === s._id ? null : s._id
                        );
                      }}
                      className="text-sm bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-1.5 rounded-full font-bold transition-colors"
                    >
                      {expandedStudentId === s._id
                        ? "إخفاء التواريخ"
                        : `عرض التواريخ (${s.absenceDates?.length})`}
                    </button>
                  )}
                </div>

                {/* Expanded Absence Dates */}
                {expandedStudentId === s._id &&
                  (s.absenceDates ?? []).length > 0 && (
                    <div className="mt-3 bg-blue-50 rounded-lg p-3">
                      <div className="text-sm font-bold text-blue-900 mb-2">
                        تواريخ الغيابات:
                      </div>
                      <ul className="space-y-1.5">
                        {s.absenceDates?.map((date, idx) => (
                          <li
                            key={idx}
                            className="flex items-center gap-2 text-sm bg-white px-3 py-1.5 rounded"
                          >
                            <span className="text-red-500">📅</span>
                            <span className="text-gray-700 font-medium">
                              {date}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
              </div>
            ))}
          </div>
        </>
      )}
    </Card>
  );
};
