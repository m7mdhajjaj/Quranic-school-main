// ============================================================================
// WeeklyGridView - عرض شبكة أسبوعية للجدول (مثل Google Calendar)
// ============================================================================

import React, { useMemo } from "react";
import type { Session, UserRole } from "../types/timetable.types";
import { WEEK_DAYS, generateHours, isSummerTime } from "../utils";
import { Edit, Trash2, MoreVertical } from "lucide-react";
import { DropdownMenu } from "@/components/UI/DropdownMenu";

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
        const rowSpan = endIndex - startIndex;
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
      
      for (const { session } of sessionsInPrevSlot) {
        const sessionStartIndex = hours.indexOf(session.startHour);
        const sessionEndIndex = hours.indexOf(session.endHour);
        
        // التحقق إذا كان السلوت الحالي ضمن نطاق الحصة (بين البداية والنهاية، غير شامل البداية)
        // السلوت الحالي يجب أن يكون بعد البداية وقبل أو يساوي النهاية
        if (sessionStartIndex !== -1 && sessionEndIndex !== -1) {
          if (currentIndex > sessionStartIndex && currentIndex < sessionEndIndex) {
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
    <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden w-full transition-all duration-300 hover:shadow-emerald-100/50" dir="rtl">
      {/* رأس الجدول */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-600 px-6 py-4 shadow-md relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3">
             <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
                <span className="text-2xl">📅</span>
             </div>
             <div>
                <h3 className="text-xl font-bold text-white tracking-wide">الجدول الأسبوعي</h3>
                <p className="text-xs text-emerald-100 font-medium opacity-90">تنظيم وتنسيق المواعيد الدراسية</p>
             </div>
          </div>
          
          <div className="flex flex-col items-end gap-1 bg-white/10 px-4 py-2 rounded-xl backdrop-blur-md border border-white/20 shadow-lg transform hover:scale-105 transition-transform duration-300">
            <div className="flex items-center gap-2">
                <span className="text-lg animate-pulse">{currentIsSummer ? '☀️' : '❄️'}</span>
                <span className="text-sm font-bold text-white tracking-wide">
                {currentIsSummer ? 'التوقيت الصيفي' : 'التوقيت الشتوي'}
                </span>
            </div>
            <span className="text-[10px] text-white/90 font-mono bg-black/20 px-2 py-0.5 rounded-full">
              {currentIsSummer ? '12:00 PM - 09:00 PM' : '11:00 AM - 08:00 PM'}
            </span>
          </div>
        </div>
      </div>

      {/* الشبكة */}
      <div className="overflow-hidden w-full bg-gray-50/50">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="sticky right-0 bg-white border-b border-gray-200 p-4 text-sm font-bold text-gray-500 w-32 z-20 shadow-[4px_0_10px_-4px_rgba(0,0,0,0.05)] uppercase tracking-wider backdrop-blur-sm">
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-emerald-500">⏰</span>
                    <span>الوقت</span>
                  </div>
                </th>
                {WEEK_DAYS.map((day) => (
                  <th
                    key={day}
                    className="bg-gray-50/80 border-b border-l border-gray-200 p-4 text-sm font-extrabold text-gray-700 shadow-sm min-w-[160px] group transition-colors hover:bg-emerald-50/30">
                    <div className="flex items-center justify-center gap-2 transition-transform group-hover:-translate-y-0.5 duration-300">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 group-hover:scale-125 transition-transform"></span>
                        {day}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
          <tbody>
            {hours.map((hour) => (
              <tr key={hour} className="group/row transition-colors hover:bg-emerald-50/10">
                <td className="sticky right-0 bg-white group-hover/row:bg-emerald-50/30 transition-colors border-b border-gray-100 border-l border-gray-200 p-4 text-xs font-bold text-gray-400 text-center z-10 shadow-[4px_0_10px_-4px_rgba(0,0,0,0.05)] font-mono">
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
                        className="border-b border-l border-gray-100 p-2 align-top relative bg-transparent hover:bg-gray-50/50 transition-colors">
                        <div className="space-y-2">
                          {daySessions.map(({ session }) => (
                            <div
                              key={session._id}
                              className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm hover:shadow-md hover:border-emerald-300 hover:-translate-y-0.5 transition-all duration-300 group cursor-pointer relative overflow-hidden">
                              <div className="absolute top-0 right-0 w-1 h-full bg-emerald-400 opacity-50"></div>
                              
                              {/* اسم الحلقة */}
                              <div className="font-bold text-base text-gray-800 mb-2 truncate pl-2" title={session.note}>
                                {session.note || "حلقة"}
                              </div>
                              
                              {/* الوقت */}
                              <div className="text-xs text-gray-500 mb-2 font-medium flex items-center gap-1 bg-gray-50 w-fit px-2 py-1 rounded-md">
                                <span>🕒</span>
                                <span>{session.startHour} - {session.endHour}</span>
                              </div>

                              {/* المعلم */}
                              {session.teacherId && typeof session.teacherId === 'object' && (
                                <div className="text-xs text-emerald-600 truncate mb-2 flex items-center gap-1 font-medium" title={`${session.teacherId.firstName} ${session.teacherId.lastName}`}>
                                  <span>👨‍🏫</span>
                                  <span>{session.teacherId.firstName} {session.teacherId.lastName}</span>
                                </div>
                              )}

                              {/* الوصف */}
                              {session.description && (
                                <div className="text-[10px] text-gray-500 line-clamp-1 mb-2 px-1" title={session.description}>
                                  <span className="font-bold text-gray-400 ml-1">الوصف:</span>
                                  <span className="italic">{session.description}</span>
                                </div>
                              )}

                              {/* نوع الحصة */}
                              {session.sessionType && (
                                <div className="flex items-center gap-1 mt-2">
                                  <span className={`text-xs px-2 py-1 rounded-full font-bold border ${
                                     session.sessionType === "hifz" ? "bg-blue-50 text-blue-600 border-blue-100" :
                                     session.sessionType === "murajaah" ? "bg-amber-50 text-amber-600 border-amber-100" :
                                     "bg-purple-50 text-purple-600 border-purple-100"
                                  }`}>
                                    {session.sessionType === "hifz" && "📖 حفظ"}
                                    {session.sessionType === "murajaah" && "🔄 مراجعة"}
                                    {session.sessionType === "both" && "📚 شامل"}
                                  </span>
                                </div>
                              )}

                              {/* القائمة المنسدلة للإجراءات */}
                              {(role === "admin" || role === "teacher") && (
                                <div 
                                  className="absolute top-1 left-1 opacity-0 group-hover:opacity-100 transition-all duration-300 z-20"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <DropdownMenu
                                    trigger={
                                      <button 
                                        className="bg-white hover:bg-gray-50 text-gray-400 hover:text-gray-600 p-1.5 rounded-lg shadow-sm border border-gray-100 transition-all"
                                        title="خيارات"
                                      >
                                        <MoreVertical size={16} />
                                      </button>
                                    }
                                    items={[
                                      {
                                        label: "تعديل",
                                        icon: <Edit size={14} />,
                                        onClick: () => onEdit?.(session),
                                        className: "text-blue-600 hover:bg-blue-50",
                                      },
                                      {
                                        label: "حذف",
                                        icon: <Trash2 size={14} />,
                                        onClick: () => onDelete?.(session),
                                        variant: "danger",
                                      },
                                    ]}
                                    position="bottom-left"
                                  />
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
                      className="border-b border-l border-gray-100 p-2 lg:p-3 align-top h-[180px] relative bg-transparent hover:bg-gray-50/50 transition-colors">
                      {daySessions.length > 0 ? (
                        <div className="h-full">
                          {daySessions.map(({ session }) => (
                            <div
                              key={session._id}
                              className={`
                                rounded-xl p-5 border shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group cursor-pointer relative h-full flex flex-col justify-between
                                ${session.sessionType === 'hifz' ? 'bg-gradient-to-br from-blue-50 to-white border-blue-100' : 
                                  session.sessionType === 'murajaah' ? 'bg-gradient-to-br from-amber-50 to-white border-amber-100' :
                                  'bg-gradient-to-br from-purple-50 to-white border-purple-100'}
                              `}>
                              
                              <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-r from-transparent via-current to-transparent opacity-20"></div>

                              <div>
                                  {/* اسم الحلقة */}
                                  <div className="flex items-start justify-between mb-4">
                                    <div className="font-bold text-lg text-gray-800 line-clamp-2 leading-tight" title={session.note}>
                                        {session.note || "حلقة"}
                                    </div>
                                    <div className={`w-2 h-2 rounded-full mt-1.5 ${
                                         session.sessionType === 'hifz' ? 'bg-blue-400' : 
                                         session.sessionType === 'murajaah' ? 'bg-amber-400' :
                                         'bg-purple-400'
                                    }`}></div>
                                  </div>
                                  
                                  {/* الوقت */}
                                  <div className="text-sm text-gray-500 mb-4 font-medium flex items-center gap-2 bg-white/60 w-fit px-3 py-1.5 rounded-lg border border-gray-100/50">
                                    <span className="text-gray-400">⏰</span>
                                    <span className="font-mono">{session.startHour} - {session.endHour}</span>
                                  </div>

                                  {/* المعلم */}
                                  {session.teacherId && typeof session.teacherId === 'object' && (
                                    <div className="text-sm text-gray-600 truncate mb-4 flex items-center gap-2" title={`${session.teacherId.firstName} ${session.teacherId.lastName}`}>
                                      <div className={`p-1 rounded-full ${
                                         session.sessionType === 'hifz' ? 'bg-blue-100 text-blue-600' : 
                                         session.sessionType === 'murajaah' ? 'bg-amber-100 text-amber-600' :
                                         'bg-purple-100 text-purple-600'
                                      }`}>
                                        <MoreVertical size={0} className="hidden" /> {/* Dummy for imports if needed */}
                                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                                      </div>
                                      <span className="font-medium">{session.teacherId.firstName} {session.teacherId.lastName}</span>
                                    </div>
                                  )}

                                  {/* الوصف */}
                                  {session.description && (
                                    <div className="text-xs text-gray-500 mb-4 bg-gray-50/50 p-2.5 rounded-lg border border-gray-100" title={session.description}>
                                      <div className="text-[10px] font-bold text-gray-400 mb-1">الوصف:</div>
                                      <div className="italic line-clamp-2 leading-relaxed">
                                        {session.description}
                                      </div>
                                    </div>
                                  )}
                              </div>

                              <div className="mt-auto pt-3 border-t border-gray-100/50 flex items-center justify-between">
                                  {/* نوع الحصة */}
                                  {session.sessionType && (
                                    <div className="flex items-center">
                                      <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold border flex items-center gap-1 ${
                                         session.sessionType === "hifz" ? "bg-blue-50 text-blue-700 border-blue-200" :
                                         session.sessionType === "murajaah" ? "bg-amber-50 text-amber-700 border-amber-200" :
                                         "bg-purple-50 text-purple-700 border-purple-200"
                                      }`}>
                                        {session.sessionType === "hifz" && <span>📖 حفظ</span>}
                                        {session.sessionType === "murajaah" && <span>🔄 مراجعة</span>}
                                        {session.sessionType === "both" && <span>📚 شامل</span>}
                                      </span>
                                    </div>
                                  )}

                                  {/* القائمة المنسدلة للإجراءات */}
                                  {(role === "admin" || role === "teacher") && (
                                    <div 
                                      className="relative z-20 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <DropdownMenu
                                        trigger={
                                          <button 
                                            className="bg-white hover:bg-gray-50 text-gray-400 hover:text-gray-600 p-1.5 rounded-lg shadow-sm border border-gray-200 transition-all flex items-center justify-center"
                                            title="خيارات"
                                          >
                                            <MoreVertical size={16} />
                                          </button>
                                        }
                                        items={[
                                          {
                                            label: "تعديل",
                                            icon: <Edit size={14} />,
                                            onClick: () => onEdit?.(session),
                                            className: "text-blue-600 hover:bg-blue-50 font-medium",
                                          },
                                          {
                                            label: "حذف",
                                            icon: <Trash2 size={14} />,
                                            onClick: () => onDelete?.(session),
                                            variant: "danger",
                                            className: "font-medium"
                                          },
                                        ]}
                                        position="bottom-left"
                                      />
                                    </div>
                                  )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="h-full min-h-[180px] rounded-xl border border-dashed border-gray-200/50 flex items-center justify-center group-hover:bg-white/50 group-hover:border-emerald-200/50 transition-all">
                          {/* <span className="text-xl text-gray-100 group-hover:text-emerald-100 transition-colors duration-500">+</span> */}
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
      <div className="bg-white border-t border-gray-100 px-6 py-4">
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-sm text-gray-600">
          <div className="flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-full border border-blue-100">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            <span className="font-bold text-blue-700">حفظ</span>
          </div>
          <div className="flex items-center gap-2 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-100">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            <span className="font-bold text-amber-700">مراجعة</span>
          </div>
          <div className="flex items-center gap-2 bg-purple-50 px-3 py-1.5 rounded-full border border-purple-100">
            <span className="w-2 h-2 rounded-full bg-purple-500"></span>
            <span className="font-bold text-purple-700">شامل</span>
          </div>
          {role === "admin" && (
            <span className="text-xs text-gray-400 flex items-center gap-1 mr-auto bg-gray-50 px-2 py-1 rounded-md">
              <span className="info-icon">💡</span>
              مرر فوق البطاقة للخيارات
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
