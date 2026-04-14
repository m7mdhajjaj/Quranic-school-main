import { memo, useState, useMemo } from "react";
import {
  BookOpen,
  ChevronDown,
  ChevronUp,
  Calendar,
  Filter,
  TrendingUp,
  Award,
  BookMarked,
} from "lucide-react";
import { useStudentGroupedSections } from "../hooks/data/useStudentGroupedSections";
import type { SurahSegment } from "@/Api/DailyMark/studentGroupedSectionsApi";
import { markDailyMarkAsSeen } from "@/Api/DailyMark/dailyMarksApi";

interface SimpleStudentTableViewProps {
  studentId: string;
  groupId?: string;
}

// أسماء الأشهر بالعربي
const ARABIC_MONTHS = [
  "يناير",
  "فبراير",
  "مارس",
  "أبريل",
  "مايو",
  "يونيو",
  "يوليو",
  "أغسطس",
  "سبتمبر",
  "أكتوبر",
  "نوفمبر",
  "ديسمبر",
];

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
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

// استخراج الشهر والسنة من التاريخ
const getMonthYear = (dateStr: string): { month: number; year: number } => {
  const date = new Date(dateStr);
  return { month: date.getMonth(), year: date.getFullYear() };
};

// نوع السجل في الجدول
interface TableRow {
  date: string;
  dayName: string;
  markId: string | null;
  seenAt: string | null;
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
    const [selectedMonth, setSelectedMonth] = useState<string>("all");
    const [signingMarkId, setSigningMarkId] = useState<string | null>(null);
    const [localSeenAtByMarkId, setLocalSeenAtByMarkId] = useState<
      Record<string, string>
    >({});

    // تحويل البيانات لصيغة الجدول
    const { tableData, availableMonths, stats } = useMemo(() => {
      if (!surahs || surahs.length === 0)
        return {
          tableData: [],
          availableMonths: [],
          stats: {
            totalSessions: 0,
            avgMemorization: 0,
            avgReview: 0,
            totalMemorization: 0,
            totalReview: 0,
          },
        };

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
      const monthsSet = new Set<string>();

      allSegments.forEach((seg) => {
        const dateKey = seg.sectionDate.split("T")[0];
        const { month, year } = getMonthYear(dateKey);
        monthsSet.add(`${year}-${month}`);

        if (!groupedByDate[dateKey]) {
          groupedByDate[dateKey] = {
            date: dateKey,
            dayName: getDayName(dateKey),
            markId: null,
            seenAt: null,
            memorization: null,
            review: null,
          };
        }

        // Capture Mark ID + seenAt (signature) once per date
        if (seg.mark?._id && !groupedByDate[dateKey].markId) {
          groupedByDate[dateKey].markId = seg.mark._id;
          const overriddenSeenAt = localSeenAtByMarkId[seg.mark._id];
          groupedByDate[dateKey].seenAt =
            overriddenSeenAt ?? seg.mark.seenAt ?? null;
        }

        const segmentText =
          seg.ayahStart > 0 && seg.ayahEnd > 0
            ? `${seg.surahName} (${seg.ayahStart}-${seg.ayahEnd})`
            : `${seg.surahName}`;

        if (seg.type === "memorization") {
          if (groupedByDate[dateKey].memorization) {
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

      // تحويل لمصفوفة
      let rows = Object.values(groupedByDate);

      // فلترة حسب الشهر
      if (selectedMonth !== "all") {
        const [filterYear, filterMonth] = selectedMonth.split("-").map(Number);
        rows = rows.filter((row) => {
          const { month, year } = getMonthYear(row.date);
          return month === filterMonth && year === filterYear;
        });
      }

      // ترتيب
      rows.sort((a, b) => {
        const comparison =
          new Date(a.date).getTime() - new Date(b.date).getTime();
        return sortOrder === "desc" ? -comparison : comparison;
      });

      // حساب الإحصائيات
      let memMarks: number[] = [];
      let revMarks: number[] = [];
      rows.forEach((row) => {
        if (
          row.memorization?.mark !== null &&
          row.memorization?.mark !== undefined
        ) {
          memMarks.push(row.memorization.mark);
        }
        if (row.review?.mark !== null && row.review?.mark !== undefined) {
          revMarks.push(row.review.mark);
        }
      });

      const avgMemorization =
        memMarks.length > 0
          ? memMarks.reduce((a, b) => a + b, 0) / memMarks.length
          : 0;
      const avgReview =
        revMarks.length > 0
          ? revMarks.reduce((a, b) => a + b, 0) / revMarks.length
          : 0;

      // ترتيب الأشهر من الأحدث للأقدم
      const sortedMonths = Array.from(monthsSet).sort((a, b) => {
        const [yearA, monthA] = a.split("-").map(Number);
        const [yearB, monthB] = b.split("-").map(Number);
        if (yearA !== yearB) return yearB - yearA;
        return monthB - monthA;
      });

      return {
        tableData: rows,
        availableMonths: sortedMonths,
        stats: {
          totalSessions: rows.length,
          avgMemorization: Math.round(avgMemorization * 10) / 10,
          avgReview: Math.round(avgReview * 10) / 10,
          totalMemorization: memMarks.length,
          totalReview: revMarks.length,
        },
      };
    }, [surahs, sortOrder, selectedMonth, localSeenAtByMarkId]);

    const toggleSort = () => {
      setSortOrder((prev) => (prev === "desc" ? "asc" : "desc"));
    };

    const handleSignSeen = async (markId: string) => {
      if (!markId) return;
      try {
        setSigningMarkId(markId);
        const result = await markDailyMarkAsSeen(markId);
        if (result.success) {
          const seenAtValue =
            result.data?.seenAt ||
            // optimistic fallback in case API doesn't return seenAt
            new Date().toISOString();

          setLocalSeenAtByMarkId((prev) => ({
            ...prev,
            [markId]: seenAtValue,
          }));
        }
      } finally {
        setSigningMarkId(null);
      }
    };

    const getMonthLabel = (monthKey: string): string => {
      const [year, month] = monthKey.split("-").map(Number);
      return `${ARABIC_MONTHS[month]} ${year}`;
    };

    // حالة التحميل
    if (loading) {
      return (
        <div
          className="min-h-screen bg-linear-to-br from-emerald-50/30 via-slate-50 to-teal-50/20 flex items-center justify-center"
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
          className="min-h-screen bg-linear-to-br from-emerald-50/30 via-slate-50 to-teal-50/20 flex items-center justify-center"
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
    if (tableData.length === 0 && availableMonths.length === 0) {
      return (
        <div
          className="min-h-screen bg-linear-to-br from-emerald-50/30 via-slate-50 to-teal-50/20 flex items-center justify-center"
          dir="rtl">
          <div className="text-center py-20">
            <div className="bg-linear-to-br from-emerald-50 to-teal-50 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6 shadow-lg">
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
        className="min-h-screen bg-linear-to-br from-emerald-50/50 via-white to-teal-50/30"
        dir="rtl">
        {/* Header */}
        <div className="bg-linear-to-r from-emerald-600 via-emerald-700 to-teal-700 text-white">
          <div className="p-6 pb-8">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
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

              {/* Month Filter */}
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2">
                <Filter className="w-5 h-5 text-white/80" />
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="bg-transparent text-white border-none outline-none cursor-pointer font-medium text-sm min-w-35">
                  <option value="all" className="text-slate-800">
                    كل الأشهر
                  </option>
                  {availableMonths.map((monthKey) => (
                    <option
                      key={monthKey}
                      value={monthKey}
                      className="text-slate-800">
                      {getMonthLabel(monthKey)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Stats Cards - الإحصائيات */}
          <div className="px-6 pb-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              {/* عدد الجلسات */}
              <div className="bg-white/95 backdrop-blur rounded-2xl p-4 shadow-lg border border-white/50">
                <div className="flex items-center gap-3">
                  <div className="bg-emerald-100 p-2 rounded-xl">
                    <Calendar className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">الجلسات</p>
                    <p className="text-2xl font-bold text-slate-800">
                      {stats.totalSessions}
                    </p>
                  </div>
                </div>
              </div>

              {/* معدل الحفظ */}
              <div className="bg-white/95 backdrop-blur rounded-2xl p-4 shadow-lg border border-white/50">
                <div className="flex items-center gap-3">
                  <div className="bg-teal-100 p-2 rounded-xl">
                    <TrendingUp className="w-5 h-5 text-teal-600" />
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">معدل الحفظ</p>
                    <p className="text-2xl font-bold text-teal-700">
                      {stats.avgMemorization}
                    </p>
                  </div>
                </div>
              </div>

              {/* معدل المراجعة */}
              <div className="bg-white/95 backdrop-blur rounded-2xl p-4 shadow-lg border border-white/50">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 p-2 rounded-xl">
                    <BookMarked className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">معدل المراجعة</p>
                    <p className="text-2xl font-bold text-blue-700">
                      {stats.avgReview}
                    </p>
                  </div>
                </div>
              </div>

              {/* إجمالي العلامات */}
              <div className="bg-white/95 backdrop-blur rounded-2xl p-4 shadow-lg border border-white/50">
                <div className="flex items-center gap-3">
                  <div className="bg-amber-100 p-2 rounded-xl">
                    <Award className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">علامات مرصودة</p>
                    <p className="text-2xl font-bold text-amber-700">
                      {stats.totalMemorization + stats.totalReview}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Table Container */}
        <div className="p-4 md:p-6">
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200/80 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-linear-to-r from-slate-50 to-slate-100 border-b-2 border-slate-200">
                    <th
                      className="px-5 py-4 text-right font-bold text-slate-700 cursor-pointer hover:bg-slate-100 transition-colors"
                      onClick={toggleSort}>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-emerald-600" />
                        <span>التاريخ</span>
                        {sortOrder === "desc" ? (
                          <ChevronDown className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <ChevronUp className="w-4 h-4 text-emerald-600" />
                        )}
                      </div>
                    </th>
                    <th className="px-5 py-4 text-right font-bold text-slate-700">
                      اليوم
                    </th>
                    <th className="px-5 py-4 text-right font-bold text-emerald-700 bg-emerald-50/50">
                      مقطع الحفظ
                    </th>
                    <th className="px-5 py-4 text-center font-bold text-emerald-700 bg-emerald-50/50">
                      العلامة
                    </th>
                    <th className="px-5 py-4 text-right font-bold text-blue-700 bg-blue-50/50">
                      مقطع المراجعة
                    </th>
                    <th className="px-5 py-4 text-center font-bold text-blue-700 bg-blue-50/50">
                      العلامة
                    </th>
                    <th className="px-5 py-4 text-center font-bold text-slate-700">
                      تمت المشاهدة
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {tableData.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-5 py-12 text-center">
                        <div className="text-slate-400">
                          <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                          <p className="font-medium">
                            لا توجد بيانات لهذا الشهر
                          </p>
                          <button
                            onClick={() => setSelectedMonth("all")}
                            className="mt-3 text-emerald-600 hover:text-emerald-700 font-medium text-sm underline">
                            عرض كل الأشهر
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    tableData.map((row, index) => (
                      <tr
                        key={row.date}
                        className={`border-b border-slate-100 hover:bg-emerald-50/30 transition-all duration-200 ${
                          index % 2 === 0 ? "bg-white" : "bg-slate-50/50"
                        }`}>
                        {/* التاريخ */}
                        <td className="px-5 py-4">
                          <span className="text-slate-900 font-semibold">
                            {formatDate(row.date)}
                          </span>
                        </td>

                        {/* اليوم */}
                        <td className="px-5 py-4">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-slate-100 text-slate-700">
                            {row.dayName}
                          </span>
                        </td>

                        {/* مقطع الحفظ */}
                        <td className="px-5 py-4 bg-emerald-50/30">
                          {row.memorization ? (
                            <span className="text-emerald-800 font-medium">
                              {row.memorization.segment}
                            </span>
                          ) : (
                            <span className="text-slate-400 italic">-</span>
                          )}
                        </td>

                        {/* علامة الحفظ */}
                        <td className="px-5 py-4 text-center bg-emerald-50/30">
                          {row.memorization?.mark !== null &&
                          row.memorization?.mark !== undefined ? (
                            <span
                              className={`inline-flex items-center justify-center w-11 h-11 rounded-xl font-bold text-white shadow-md transition-transform hover:scale-105 ${
                                row.memorization.mark >= 8
                                  ? "bg-linear-to-br from-emerald-400 to-emerald-600"
                                  : row.memorization.mark >= 5
                                    ? "bg-linear-to-br from-amber-400 to-amber-600"
                                    : "bg-linear-to-br from-red-400 to-red-600"
                              }`}>
                              {row.memorization.mark}
                            </span>
                          ) : row.memorization ? (
                            <span className="text-slate-400 text-sm italic">
                              لم تُرصد
                            </span>
                          ) : (
                            <span className="text-slate-300">-</span>
                          )}
                        </td>

                        {/* مقطع المراجعة */}
                        <td className="px-5 py-4 bg-blue-50/30">
                          {row.review ? (
                            <span className="text-blue-800 font-medium">
                              {row.review.segment}
                            </span>
                          ) : (
                            <span className="text-slate-400 italic">-</span>
                          )}
                        </td>

                        {/* علامة المراجعة */}
                        <td className="px-5 py-4 text-center bg-blue-50/30">
                          {row.review?.mark !== null &&
                          row.review?.mark !== undefined ? (
                            <span
                              className={`inline-flex items-center justify-center w-11 h-11 rounded-xl font-bold text-white shadow-md transition-transform hover:scale-105 ${
                                row.review.mark >= 8
                                  ? "bg-linear-to-br from-blue-400 to-blue-600"
                                  : row.review.mark >= 5
                                    ? "bg-linear-to-br from-amber-400 to-amber-600"
                                    : "bg-linear-to-br from-red-400 to-red-600"
                              }`}>
                              {row.review.mark}
                            </span>
                          ) : row.review ? (
                            <span className="text-slate-400 text-sm italic">
                              لم تُرصد
                            </span>
                          ) : (
                            <span className="text-slate-300">-</span>
                          )}
                        </td>

                        {/* التوقيع / تمت المشاهدة */}
                        <td className="px-5 py-4 text-center">
                          {(() => {
                            const hasAnyMark =
                              (row.memorization?.mark !== null &&
                                row.memorization?.mark !== undefined) ||
                              (row.review?.mark !== null &&
                                row.review?.mark !== undefined);

                            if (!hasAnyMark || !row.markId) {
                              return <span className="text-slate-300">-</span>;
                            }

                            if (row.seenAt) {
                              const seenDate = new Date(row.seenAt);
                              return (
                                <div className="text-emerald-700 font-semibold text-sm">
                                  تمت
                                  <div className="text-[11px] text-slate-500 font-medium mt-1">
                                    {isNaN(seenDate.getTime())
                                      ? ""
                                      : seenDate.toLocaleString("ar-SA")}
                                  </div>
                                </div>
                              );
                            }

                            const isLoadingSign = signingMarkId === row.markId;
                            return (
                              <button
                                type="button"
                                disabled={isLoadingSign}
                                onClick={() => handleSignSeen(row.markId!)}
                                className="px-4 py-2 rounded-xl text-sm font-bold bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors">
                                {isLoadingSign ? "..." : "شاهدت العلامة"}
                              </button>
                            );
                          })()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer with summary */}
            <div className="bg-linear-to-r from-slate-50 to-slate-100 px-5 py-4 border-t-2 border-slate-200">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <p className="text-slate-600 text-sm">
                  إجمالي الجلسات المعروضة:{" "}
                  <span className="font-bold text-emerald-700 text-base">
                    {tableData.length}
                  </span>
                </p>
                {selectedMonth !== "all" && (
                  <span className="text-sm bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full font-medium">
                    {getMonthLabel(selectedMonth)}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  },
);

SimpleStudentTableView.displayName = "SimpleStudentTableView";
