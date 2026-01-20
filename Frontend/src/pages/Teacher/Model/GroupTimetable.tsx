import React, { useState, useEffect } from "react";
import { X, Clock, Calendar, Loader2, GraduationCap, Sparkles, CalendarDays } from "lucide-react";
import { getGroupTimetable } from "@/Api/groupApi";

interface TimetableEntry {
  _id: string;
  day: string;
  startHour: string;
  endHour: string;
  teacherId?: {
    firstName: string;
    lastName: string;
  };
  note?: string;
  sessionDateInWeek?: string;
  sessionDateFormatted?: string;
}

interface WeekInfo {
  startOfWeek: string;
  endOfWeek: string;
  startFormatted: string;
  endFormatted: string;
}

interface GroupTimetableModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupId: string;
  groupName: string;
}

const daysOrder = [
  "السبت",
  "الأحد",
  "الاثنين",
  "الثلاثاء",
  "الأربعاء",
  "الخميس",
  "الجمعة",
];

export const GroupTimetableModal: React.FC<GroupTimetableModalProps> = ({
  isOpen,
  onClose,
  groupId,
  groupName,
}) => {
  const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
  const [weekInfo, setWeekInfo] = useState<WeekInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && groupId) {
      fetchTimetable();
    } else {
      // Reset state when modal closes
      setTimetable([]);
      setWeekInfo(null);
      setError(null);
    }
  }, [isOpen, groupId]);

  const fetchTimetable = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await getGroupTimetable(groupId);
      if (result.success && result.data) {
        // Ensure timetable is an array - use timetables from new API structure
        const timetableData = result.data.timetables;
        setTimetable(Array.isArray(timetableData) ? timetableData : []);
        // Store week info
        if (result.data.weekInfo) {
          setWeekInfo(result.data.weekInfo);
        }
      } else {
        setError(result.message || "فشل في جلب مواقيت الحلقة");
      }
    } catch (err) {
      console.error("Error fetching timetable:", err);
      setError("حدث خطأ أثناء جلب مواقيت الحلقة");
    } finally {
      setIsLoading(false);
    }
  };

  // Sort timetable by day order (ensure timetable is an array)
  const sortedTimetable = (Array.isArray(timetable) ? timetable : []).sort((a, b) => {
    return daysOrder.indexOf(a.day) - daysOrder.indexOf(b.day);
  });

  // Group by day
  const groupedByDay = sortedTimetable.reduce((acc, entry) => {
    if (!acc[entry.day]) {
      acc[entry.day] = [];
    }
    acc[entry.day].push(entry);
    return acc;
  }, {} as Record<string, TimetableEntry[]>);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-200"
      dir="rtl"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative bg-gradient-to-br from-emerald-600 via-teal-700 to-slate-700 p-6 overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-24 -mb-24"></div>
          
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative p-4 bg-white/20 backdrop-blur-md rounded-2xl shadow-lg ring-2 ring-white/30">
                <Calendar className="w-7 h-7 text-white" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
              </div>
              <div>
                <h2 className="text-3xl font-bold text-white drop-shadow-lg">مواقيت الحلقة</h2>
                <div className="flex items-center gap-2 mt-2">
                  <GraduationCap className="w-4 h-4 text-emerald-100" />
                  <p className="text-emerald-50 text-base font-medium">{groupName}</p>
                </div>
                {/* Week Info */}
                {weekInfo && (
                  <div className="flex items-center gap-2 mt-2 bg-white/15 backdrop-blur-sm px-3 py-1.5 rounded-lg">
                    <CalendarDays className="w-4 h-4 text-yellow-300" />
                    <span className="text-white text-sm font-medium">
                      {weekInfo.startFormatted} - {weekInfo.endFormatted}
                    </span>
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2.5 hover:bg-white/20 rounded-xl transition-all hover:rotate-90 duration-300 group"
              aria-label="إغلاق"
            >
              <X className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-gradient-to-b from-gray-50 to-white">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="relative">
                <Loader2 className="w-16 h-16 text-emerald-500 animate-spin" />
                <div className="absolute inset-0 bg-emerald-100 rounded-full blur-xl opacity-50 animate-pulse"></div>
              </div>
              <p className="text-gray-600 mt-6 text-lg font-medium">جاري تحميل المواقيت...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-8 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <X className="w-8 h-8 text-red-600" />
              </div>
              <p className="text-red-700 font-semibold text-lg mb-2">{error}</p>
              <button
                onClick={fetchTimetable}
                className="mt-6 px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all shadow-lg hover:shadow-xl font-medium"
              >
                المحاولة مرة أخرى
              </button>
            </div>
          ) : sortedTimetable.length === 0 ? (
            <div className="text-center py-16">
              <div className="relative inline-block mb-6">
                <Clock className="w-20 h-20 text-gray-300 mx-auto" />
                <Sparkles className="w-6 h-6 text-emerald-400 absolute -top-2 -right-2 animate-pulse" />
              </div>
              <p className="text-gray-700 text-xl font-bold mb-2">لا توجد مواقيت مسجلة</p>
              <p className="text-gray-500 text-base">لم يتم تحديد مواقيت لهذه الحلقة بعد</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {daysOrder.map((day) => {
                const daySessions = groupedByDay[day];
                if (!daySessions || daySessions.length === 0) return null;

                // Get date for this day from first session
                const dayDate = daySessions[0]?.sessionDateFormatted;

                return (
                  <div
                    key={day}
                    className="bg-white rounded-xl border-2 border-emerald-100 overflow-hidden shadow-md hover:shadow-lg transition-all duration-200"
                  >
                    {/* Day Header */}
                    <div className="relative bg-gradient-to-r from-emerald-600 via-teal-700 to-slate-700 px-4 py-3 overflow-hidden">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12"></div>
                      <div className="relative flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-bold text-white drop-shadow-md">{day}</h3>
                          {dayDate && (
                            <span className="bg-white/25 backdrop-blur-sm text-white text-xs font-medium px-2 py-0.5 rounded-md">
                              {dayDate}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm px-2.5 py-1 rounded-lg">
                          <Clock className="w-3.5 h-3.5 text-white" />
                          <span className="text-white text-xs font-semibold">
                            {daySessions.length}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Sessions */}
                    <div className="p-4 space-y-2.5">
                      {daySessions.map((session, index) => (
                        <div
                          key={session._id}
                          className="group relative bg-gradient-to-br from-emerald-50 to-teal-50/50 rounded-lg p-3 border border-emerald-200 hover:border-emerald-400 shadow-sm hover:shadow transition-all duration-200"
                        >
                          <div className="flex items-center gap-3">
                            {/* Number Badge */}
                            <div className="flex-shrink-0 w-7 h-7 bg-gradient-to-br from-emerald-600 via-teal-700 to-slate-700 rounded-lg flex items-center justify-center shadow-sm">
                              <span className="text-white text-xs font-bold">{index + 1}</span>
                            </div>
                            
                            {/* Time Info */}
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg shadow-sm border border-emerald-100">
                                  <span className="text-lg font-bold text-emerald-700">
                                    {session.startHour}
                                  </span>
                                  <span className="text-emerald-400 text-sm font-semibold">←</span>
                                  <span className="text-lg font-bold text-teal-700">
                                    {session.endHour}
                                  </span>
                                </div>
                              </div>
                              {session.note && (
                                <div className="flex items-center gap-1.5 mt-1.5">
                                  <div className="w-1 h-1 bg-emerald-500 rounded-full"></div>
                                  <p className="text-xs text-gray-600 font-medium">{session.note}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t-2 border-emerald-100 p-5 bg-gradient-to-r from-emerald-50 to-teal-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-lg shadow-sm border border-emerald-200">
                <Calendar className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <span className="text-sm text-gray-600 font-medium block">إجمالي المواقيت</span>
                <span className="text-2xl font-bold bg-gradient-to-r from-emerald-600 via-teal-700 to-slate-700 bg-clip-text text-transparent">
                  {sortedTimetable.length}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="px-8 py-3 bg-gradient-to-r from-emerald-600 via-teal-700 to-slate-700 text-white rounded-xl hover:from-emerald-700 hover:via-teal-800 hover:to-slate-800 transition-all shadow-lg hover:shadow-xl font-semibold text-base transform hover:scale-105 duration-200"
            >
              إغلاق
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
