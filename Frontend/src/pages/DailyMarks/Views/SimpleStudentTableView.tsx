import { memo, useState, useMemo } from "react";
import { BookOpen, ChevronDown, ChevronUp, Calendar } from "lucide-react";
import { useStudentGroupedSections } from "../hooks/data/useStudentGroupedSections";
import type { SurahSegment } from "@/Api/DailyMark/studentGroupedSectionsApi";

interface SimpleStudentTableViewProps {
  studentId: string;
  groupId?: string;
}

// تحويل التاريخ لاسم اليوم بالعربي
const getDayName = (dateStr: string): string => {
  const days = [
    "الأحد",
    "الإثنين",
    "الثلاثاء",
    "الأربعاء",
    "الخميس",
    "الجمعة",
    "السبت",
  ];
  const date = new Date(dateStr);
  return days[date.getDay()];
};

// تنسيق التاريخ
const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("ar-SA", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

// نوع السجل في الجدول
interface TableRow {
  date: string;
  dayName: string;
  memorization: {
    segment: string;
    mark: number | null;
  } | null;
  review: {
    segment: string;
    mark: number | null;
  } | null;
}

/**
 * Simple Student Table View - جدول بسيط للطالب
 * يعرض: التاريخ، اليوم، مقطع الحفظ، علامة الحفظ، مقطع المراجعة، علامة المراجعة
 */
export const SimpleStudentTableView = memo<SimpleStudentTableViewProps>(
  ({ studentId, groupId }) => {
    const { surahs, loading, error, refetch } = useStudentGroupedSections(
      studentId,
      groupId,
    );
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

    // تحويل البيانات لصيغة الجدول
    const tableData = useMemo(() => {
      if (!surahs || surahs.length === 0) return [];

      // تجميع كل المقاطع من كل السور
      const allSegments: (SurahSegment & { surahName: string })[] = [];

      surahs.forEach((surah) => {
        surah.segments.forEach((seg) => {
          allSegments.push({
            ...seg,
            surahName: surah.surahName,
          });
        });
      });

      // تجميع المقاطع حسب التاريخ
      const groupedByDate: Record<string, TableRow> = {};

      allSegments.forEach((seg) => {
        const dateKey = seg.sectionDate.split("T")[0];

        if (!groupedByDate[dateKey]) {
          groupedByDate[dateKey] = {
            date: dateKey,
            dayName: getDayName(dateKey),
            memorization: null,
            review: null,
          };
        }

        const segmentText = `${seg.surahName} (${seg.ayahStart}-${seg.ayahEnd})`;

        if (seg.type === "memorization") {
          if (groupedByDate[dateKey].memorization) {
            // إضافة للحفظ الموجود
            groupedByDate[dateKey].memorization = {
              segment:
                groupedByDate[dateKey].memorization!.segment +
                " | " +
                segmentText,
              mark:
                seg.mark?.memorizationMark ??
                groupedByDate[dateKey].memorization!.mark,
            };
          } else {
            groupedByDate[dateKey].memorization = {
              segment: segmentText,
              mark: seg.mark?.memorizationMark ?? null,
            };
          }
        } else if (seg.type === "review") {
          if (groupedByDate[dateKey].review) {
            // إضافة للمراجعة الموجودة
            groupedByDate[dateKey].review = {
              segment:
                groupedByDate[dateKey].review!.segment + " | " + segmentText,
              mark: seg.mark?.reviewMark ?? groupedByDate[dateKey].review!.mark,
            };
          } else {
            groupedByDate[dateKey].review = {
              segment: segmentText,
              mark: seg.mark?.reviewMark ?? null,
            };
          }
        }
      });

      // تحويل لمصفوفة وترتيب
      const rows = Object.values(groupedByDate);
      rows.sort((a, b) => {
        const comparison =
          new Date(a.date).getTime() - new Date(b.date).getTime();
        return sortOrder === "desc" ? -comparison : comparison;
      });

      return rows;
    }, [surahs, sortOrder]);

    const toggleSort = () => {
      setSortOrder((prev) => (prev === "desc" ? "asc" : "desc"));
    };

    // حالة التحميل
    if (loading) {
      return (
        <div
          className="min-h-screen bg-gradient-to-br from-emerald-50/30 via-slate-50 to-teal-50/20 flex items-center justify-center"
          dir="rtl">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600 font-medium">جاري تحميل البيانات...</p>
          </div>
        </div>
      );
    }

    // حالة الخطأ
    if (error) {
      return (
        <div
          className="min-h-screen bg-gradient-to-br from-emerald-50/30 via-slate-50 to-teal-50/20 flex items-center justify-center"
          dir="rtl">
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center max-w-md">
            <p className="text-red-700 font-medium mb-4">{error}</p>
            <button
              onClick={() => refetch()}
              className="bg-red-100 hover:bg-red-200 text-red-700 px-6 py-2 rounded-lg font-medium transition-colors">
              إعادة المحاولة
            </button>
          </div>
        </div>
      );
    }

    // حالة لا توجد بيانات
    if (tableData.length === 0) {
      return (
        <div
          className="min-h-screen bg-gradient-to-br from-emerald-50/30 via-slate-50 to-teal-50/20 flex items-center justify-center"
          dir="rtl">
          <div className="text-center py-20">
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6 shadow-lg">
              <BookOpen className="w-12 h-12 text-emerald-600" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">
              لا توجد مقاطع بعد
            </h3>
            <p className="text-slate-500 max-w-sm mx-auto">
              سيقوم المعلم بتعيين مقاطع الحفظ والمراجعة لك قريباً
            </p>
          </div>
        </div>
      );
    }

    return (
      <div
        className="min-h-screen bg-gradient-to-br from-emerald-50/30 via-slate-50 to-teal-50/20"
        dir="rtl">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-700 to-slate-700 text-white p-6">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 backdrop-blur-md p-3 rounded-2xl shadow-lg">
              <BookOpen className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold tracking-tight">
                سجل الحفظ والمراجعة
              </h1>
              <p className="text-white/80 text-sm mt-0.5">
                جميع المقاطع والعلامات
              </p>
            </div>
          </div>
        </div>

        {/* Table Container */}
        <div className="p-4 md:p-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th
                      className="px-4 py-4 text-right font-bold text-slate-700 cursor-pointer hover:bg-slate-100 transition-colors"
                      onClick={toggleSort}>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>التاريخ</span>
                        {sortOrder === "desc" ? (
                          <ChevronDown className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <ChevronUp className="w-4 h-4 text-emerald-600" />
                        )}
                      </div>
                    </th>
                    <th className="px-4 py-4 text-right font-bold text-slate-700">
                      اليوم
                    </th>
                    <th className="px-4 py-4 text-right font-bold text-emerald-700">
                      مقطع الحفظ
                    </th>
                    <th className="px-4 py-4 text-center font-bold text-emerald-700">
                      علامة الحفظ
                    </th>
                    <th className="px-4 py-4 text-right font-bold text-slate-600">
                      مقطع المراجعة
                    </th>
                    <th className="px-4 py-4 text-center font-bold text-slate-600">
                      علامة المراجعة
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {tableData.map((row, index) => (
                    <tr
                      key={row.date}
                      className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${
                        index % 2 === 0 ? "bg-white" : "bg-slate-50/30"
                      }`}>
                      {/* التاريخ */}
                      <td className="px-4 py-4 text-slate-900 font-medium">
                        {formatDate(row.date)}
                      </td>

                      {/* اليوم */}
                      <td className="px-4 py-4 text-slate-600">
                        {row.dayName}
                      </td>

                      {/* مقطع الحفظ */}
                      <td className="px-4 py-4">
                        {row.memorization ? (
                          <span className="text-emerald-700 font-medium">
                            {row.memorization.segment}
                          </span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>

                      {/* علامة الحفظ */}
                      <td className="px-4 py-4 text-center">
                        {row.memorization?.mark !== null &&
                        row.memorization?.mark !== undefined ? (
                          <span
                            className={`inline-flex items-center justify-center w-10 h-10 rounded-full font-bold text-white ${
                              row.memorization.mark >= 8
                                ? "bg-emerald-500"
                                : row.memorization.mark >= 5
                                  ? "bg-yellow-500"
                                  : "bg-red-500"
                            }`}>
                            {row.memorization.mark}
                          </span>
                        ) : row.memorization ? (
                          <span className="text-slate-400 text-sm">
                            لم تُرصد
                          </span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>

                      {/* مقطع المراجعة */}
                      <td className="px-4 py-4">
                        {row.review ? (
                          <span className="text-slate-700 font-medium">
                            {row.review.segment}
                          </span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>

                      {/* علامة المراجعة */}
                      <td className="px-4 py-4 text-center">
                        {row.review?.mark !== null &&
                        row.review?.mark !== undefined ? (
                          <span
                            className={`inline-flex items-center justify-center w-10 h-10 rounded-full font-bold text-white ${
                              row.review.mark >= 8
                                ? "bg-slate-600"
                                : row.review.mark >= 5
                                  ? "bg-yellow-500"
                                  : "bg-red-500"
                            }`}>
                            {row.review.mark}
                          </span>
                        ) : row.review ? (
                          <span className="text-slate-400 text-sm">
                            لم تُرصد
                          </span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Footer with count */}
            <div className="bg-slate-50 px-4 py-3 border-t border-slate-200">
              <p className="text-slate-600 text-sm">
                إجمالي الجلسات:{" "}
                <span className="font-bold text-emerald-700">
                  {tableData.length}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  },
);

SimpleStudentTableView.displayName = "SimpleStudentTableView";
