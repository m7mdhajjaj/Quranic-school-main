// ============================================================================
// WeeklyGridView - عرض شبكة أسبوعية للجدول (مثل Google Calendar)
// ============================================================================

import React, { useMemo } from "react";
import type { Session, UserRole } from "../types/timetable.types";
import { WEEK_DAYS, generateHours, isSummerTime } from "../utils";
import { Edit, Trash2 } from "lucide-react";

interface WeeklyGridViewProps {
  sessions: Session[];
  loading: boolean;
  role: UserRole;
  onEdit?: (session: Session) => void;
  onDelete?: (session: Session) => void;
}

export const WeeklyGridView: React.FC<WeeklyGridViewProps> = ({
  sessions,
  loading,
  role,
  onEdit,
  onDelete,
}) => {
  // تحديد التوقيت الحالي تلقائياً
  const currentIsSummer = useMemo(() => isSummerTime(), []);
  const hours = useMemo(() => generateHours(currentIsSummer), [currentIsSummer]);

  // تنظيم الحصص - الحصة تظهر في سلوت البداية فقط مع معلومات الامتداد
  const sessionGrid = useMemo(() => {
    const grid: Record<string, Record<string, { session: Session; rowSpan: number }[]>> = {};
    
    // تهيئة الشبكة
    WEEK_DAYS.forEach(day => {
      grid[day] = {};
      hours.forEach(hour => {
        grid[day][hour] = [];
      });
    });

    // ترتيب الحصص حسب وقت البداية لضمان عرض صحيح
    const sortedSessions = [...sessions].sort((a, b) => {
      const aIndex = hours.indexOf(a.startHour);
      const bIndex = hours.indexOf(b.startHour);
      if (aIndex !== bIndex) return aIndex - bIndex;
      // إذا كانت نفس وقت البداية، رتب حسب وقت النهاية
      const aEndIndex = hours.indexOf(a.endHour);
      const bEndIndex = hours.indexOf(b.endHour);
      return aEndIndex - bEndIndex;
    });

    // ملء الشبكة - الحصة تظهر في سلوت البداية فقط
    sortedSessions.forEach(session => {
      if (!grid[session.day]) return;
      
      const startIndex = hours.indexOf(session.startHour);
      const endIndex = hours.indexOf(session.endHour);
      
      if (startIndex !== -1 && endIndex !== -1 && startIndex <= endIndex && grid[session.day][session.startHour]) {
        // حساب عدد السلوتات (rowSpan) - يشمل سلوت البداية وسلوت النهاية
        // مثلا: من 12:00 لـ 12:30 = 2 سلوت (12:00 و 12:30)
        const rowSpan = endIndex - startIndex + 1;
        grid[session.day][session.startHour].push({ session, rowSpan });
      }
    });

    return grid;
  }, [sessions, hours]);

  // دالة للتحقق إذا كان السلوت مشغول بحصة ممتدة من سلوت سابق
  const isSlotOccupied = (day: string, currentHour: string): boolean => {
    const currentIndex = hours.indexOf(currentHour);
    if (currentIndex === -1) return false;

    // البحث في جميع السلوتات السابقة عن حصص ممتدة لهذا السلوت
    for (let i = 0; i < currentIndex; i++) {
      const prevHour = hours[i];
      const sessionsInPrevSlot = sessionGrid[day]?.[prevHour] || [];
      
      for (const { session, rowSpan } of sessionsInPrevSlot) {
        const sessionStartIndex = hours.indexOf(session.startHour);
        const sessionEndIndex = hours.indexOf(session.endHour);
        
        // التحقق إذا كان السلوت الحالي ضمن نطاق الحصة (بين البداية والنهاية، غير شامل البداية)
        // السلوت الحالي يجب أن يكون بعد البداية وقبل أو يساوي النهاية
        if (sessionStartIndex !== -1 && sessionEndIndex !== -1) {
          if (currentIndex > sessionStartIndex && currentIndex <= sessionEndIndex) {
            return true;
          }
        }
      }
    }
    
    return false;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-emerald-100 overflow-hidden w-full" dir="rtl">
      {/* رأس الجدول */}
      <div className="bg-gradient-to-l from-emerald-600 to-emerald-500 px-4 py-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white flex-1 text-center">الجدول الأسبوعي</h3>
          <div className="flex flex-col items-end gap-0.5 bg-white/20 px-3 py-1.5 rounded-lg">
            <span className="text-xs font-bold text-white">
              {currentIsSummer ? '☀️ صيفي' : '❄️ شتوي'}
            </span>
            <span className="text-[10px] text-white/90">
              {currentIsSummer ? '12PM-9PM' : '11AM-8PM'}
            </span>
          </div>
        </div>
      </div>

      {/* الشبكة */}
      <div className="overflow-hidden w-full">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="sticky right-0 bg-gradient-to-br from-gray-50 to-gray-100 border-b-2 border-l-2 border-emerald-200 p-4 text-base font-bold text-gray-700 w-32 z-10 shadow-sm">
                  الوقت
                </th>
                {WEEK_DAYS.map((day) => (
                  <th
                    key={day}
                    className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-b-2 border-l border-emerald-200 p-3 text-sm font-bold text-emerald-900 shadow-sm min-w-[140px]">
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
          <tbody>
            {hours.map((hour) => (
              <tr key={hour} className="hover:bg-emerald-50/30 transition-colors">
                <td className="sticky right-0 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-l-2 border-emerald-200 p-4 text-sm font-bold text-gray-700 text-center z-10 shadow-sm">
                  {hour}
                </td>
                {WEEK_DAYS.map((day) => {
                  // تحقق إذا كان السلوت مشغول بحصة ممتدة من سلوت سابق
                  if (isSlotOccupied(day, hour)) {
                    return null; // لا نعرض td لأن الحصة ممتدة من الصف السابق
                  }

                  const daySessions = sessionGrid[day]?.[hour] || [];
                  
                  // إذا كان هناك أكثر من حصة في نفس الوقت، نحتاج لعرضهم بطريقة مختلفة
                  if (daySessions.length > 1) {
                    // عرض الحصص المتعددة بشكل رأسي مع ارتفاع مناسب
                    return (
                      <td
                        key={`${day}-${hour}`}
                        className="border-b border-l border-emerald-100 p-2 align-top relative bg-white hover:bg-emerald-50/20 transition-colors">
                        <div className="space-y-2">
                          {daySessions.map(({ session }) => (
                            <div
                              key={session._id}
                              className="bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50 rounded-lg p-3 border-2 border-yellow-300/60 hover:border-yellow-400 hover:shadow-lg transition-all duration-200 group cursor-pointer relative shadow-sm min-h-[80px]">
                              {/* اسم الحلقة */}
                              <div className="font-bold text-sm text-yellow-900 mb-2 truncate" title={session.note}>
                                {session.note || "حلقة"}
                              </div>
                              
                              {/* الوقت */}
                              <div className="text-xs text-yellow-700 mb-1 font-medium flex items-center gap-1">
                                <span>⏰</span>
                                <span>{session.startHour} - {session.endHour}</span>
                              </div>

                              {/* المعلم */}
                              {session.teacherId && typeof session.teacherId === 'object' && (
                                <div className="text-xs text-yellow-600 truncate mb-1 flex items-center gap-1" title={`${session.teacherId.firstName} ${session.teacherId.lastName}`}>
                                  <span>👤</span>
                                  <span>{session.teacherId.firstName} {session.teacherId.lastName}</span>
                                </div>
                              )}

                              {/* نوع الحصة */}
                              {session.sessionType && (
                                <div className="flex items-center gap-1 mt-2 bg-white/50 px-2 py-1 rounded-lg">
                                  <span className="text-sm">
                                    {session.sessionType === "hifz" && "📖"}
                                    {session.sessionType === "murajaah" && "🔄"}
                                    {session.sessionType === "both" && "📚"}
                                  </span>
                                  <span className="text-[10px] text-yellow-800 font-bold">
                                    {session.sessionType === "hifz" && "حفظ"}
                                    {session.sessionType === "murajaah" && "مراجعة"}
                                    {session.sessionType === "both" && "كلاهما"}
                                  </span>
                                </div>
                              )}

                              {/* أزرار التحكم (تظهر عند hover) - للمدير فقط */}
                              {role === "admin" && (
                                <div className="absolute top-1 left-1 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onEdit?.(session);
                                    }}
                                    className="bg-orange-500 hover:bg-orange-600 text-white p-1 rounded shadow-sm"
                                    title="تعديل">
                                    <Edit size={12} />
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onDelete?.(session);
                                    }}
                                    className="bg-red-500 hover:bg-red-600 text-white p-1 rounded shadow-sm"
                                    title="حذف">
                                    <Trash2 size={12} />
                                  </button>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </td>
                    );
                  }
                  
                  return (
                    <td
                      key={`${day}-${hour}`}
                      rowSpan={daySessions.length > 0 ? daySessions[0].rowSpan : 1}
                      className="border-b border-l border-emerald-100 p-3 align-top min-h-[80px] relative bg-white hover:bg-emerald-50/20 transition-colors">
                      {daySessions.length > 0 ? (
                        <div className="h-full">
                          {daySessions.map(({ session }) => (
                            <div
                              key={session._id}
                              className="bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50 rounded-xl p-5 border-2 border-yellow-300/60 hover:border-yellow-400 hover:shadow-xl transition-all duration-200 group cursor-pointer relative h-full flex flex-col shadow-md">
                              {/* اسم الحلقة */}
                              <div className="font-bold text-lg text-yellow-900 mb-3 truncate" title={session.note}>
                                {session.note || "حلقة"}
                              </div>
                              
                              {/* الوقت */}
                              <div className="text-sm text-yellow-700 mb-2 font-medium flex items-center gap-2">
                                <span className="text-base">⏰</span>
                                <span>{session.startHour} - {session.endHour}</span>
                              </div>

                              {/* المعلم */}
                              {session.teacherId && typeof session.teacherId === 'object' && (
                                <div className="text-sm text-yellow-600 truncate mb-2 flex items-center gap-2" title={`${session.teacherId.firstName} ${session.teacherId.lastName}`}>
                                  <span className="text-base">👤</span>
                                  <span>{session.teacherId.firstName} {session.teacherId.lastName}</span>
                                </div>
                              )}

                              {/* نوع الحصة */}
                              {session.sessionType && (
                                <div className="flex items-center gap-2 mt-3 bg-white/50 px-3 py-2 rounded-lg">
                                  <span className="text-lg">
                                    {session.sessionType === "hifz" && "📖"}
                                    {session.sessionType === "murajaah" && "🔄"}
                                    {session.sessionType === "both" && "📚"}
                                  </span>
                                  <span className="text-xs text-yellow-800 font-bold">
                                    {session.sessionType === "hifz" && "حفظ"}
                                    {session.sessionType === "murajaah" && "مراجعة"}
                                    {session.sessionType === "both" && "حفظ ومراجعة"}
                                  </span>
                                </div>
                              )}
                              
                              {/* الوصف/الملاحظات */}
                              {session.description && (
                                <div className="mt-2 text-xs text-yellow-700 bg-white/60 px-3 py-2 rounded-lg border border-yellow-200">
                                  <span className="font-semibold">📝 </span>
                                  <span className="line-clamp-2" title={session.description}>{session.description}</span>
                                </div>
                              )}

                              {/* أزرار التحكم (تظهر عند hover) - للمدير فقط */}
                              {role === "admin" && (
                                <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onEdit?.(session);
                                    }}
                                    className="bg-orange-500 hover:bg-orange-600 text-white p-1.5 rounded shadow-sm"
                                    title="تعديل">
                                    <Edit size={14} />
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onDelete?.(session);
                                    }}
                                    className="bg-red-500 hover:bg-red-600 text-white p-1.5 rounded shadow-sm"
                                    title="حذف">
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="h-full min-h-[70px] flex items-center justify-center text-gray-300">
                          <span className="text-xs">•</span>
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>

      {/* تعليمات */}
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border-t-2 border-emerald-200 px-6 py-4">
        <div className="flex items-center justify-center gap-8 text-sm text-gray-700">
          <span className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg shadow-sm border border-emerald-100">
            <span className="text-lg">📖</span> 
            <span className="font-medium">حفظ</span>
          </span>
          <span className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg shadow-sm border border-emerald-100">
            <span className="text-lg">🔄</span> 
            <span className="font-medium">مراجعة</span>
          </span>
          <span className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg shadow-sm border border-emerald-100">
            <span className="text-lg">📚</span> 
            <span className="font-medium">حفظ ومراجعة</span>
          </span>
          {role === "admin" && (
            <span className="mr-4 text-gray-500 italic text-xs">• مرر فوق الموعد للتعديل أو الحذف</span>
          )}
        </div>
      </div>
    </div>
  );
};
