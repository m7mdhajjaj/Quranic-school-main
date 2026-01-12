// ============================================================================
// WeeklyGridView - عرض شبكة أسبوعية للجدول (مثل Google Calendar)
// ============================================================================

import React from "react";
import type { Session, UserRole } from "../types/timetable.types";
import { WEEK_DAYS, formatDateForAPI } from "../utils";
import { useWeeklyGrid } from "../hooks";
import { Edit, Trash2, MoreVertical } from "lucide-react";
import { DropdownMenu } from "@/components/UI/DropdownMenu";

// ============================================================================
// مكونات فرعية
// ============================================================================

/** بطاقة عرض الحصة */
const SessionCard: React.FC<{
  session: Session;
  role: UserRole;
  onEdit?: (session: Session) => void;
  onDelete?: (session: Session) => void;
  compact?: boolean;
}> = ({ session, role, onEdit, onDelete, compact = false }) => {
  const bgClass = session.sessionType === 'hifz' 
    ? 'bg-gradient-to-br from-blue-50 to-white border-blue-100' 
    : session.sessionType === 'murajaah' 
    ? 'bg-gradient-to-br from-amber-50 to-white border-amber-100'
    : 'bg-gradient-to-br from-purple-50 to-white border-purple-100';

  const dotClass = session.sessionType === 'hifz' 
    ? 'bg-blue-400' 
    : session.sessionType === 'murajaah' 
    ? 'bg-amber-400' 
    : 'bg-purple-400';

  const typeClass = session.sessionType === "hifz" 
    ? "bg-blue-50 text-blue-700 border-blue-200" 
    : session.sessionType === "murajaah" 
    ? "bg-amber-50 text-amber-700 border-amber-200" 
    : "bg-purple-50 text-purple-700 border-purple-200";

  const typeLabel = session.sessionType === "hifz" ? "📖 حفظ" 
    : session.sessionType === "murajaah" ? "🔄 مراجعة" 
    : "📚 شامل";

  return (
    <div className={`
      rounded-xl border shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 
      group cursor-pointer relative h-full flex flex-col justify-between
      ${compact ? 'p-2 sm:p-3 md:p-4' : 'p-3 sm:p-4 md:p-5'} ${bgClass}
    `}>
      <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-r from-transparent via-current to-transparent opacity-20" />

      <div>
        {/* اسم الحلقة */}
        <div className="flex items-start justify-between mb-2 sm:mb-3 md:mb-4">
          <div className={`font-bold text-gray-800 line-clamp-2 leading-tight ${compact ? 'text-xs sm:text-sm md:text-base' : 'text-sm sm:text-base md:text-lg'}`} title={session.note}>
            {session.groupName || session.note || "حلقة"}
          </div>
          <div className={`w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full mt-1 sm:mt-1.5 ${dotClass}`} />
        </div>
        
        {/* معلومات المقطع */}
        {session.sectionDetails && (
          <div className="mb-2 sm:mb-3 space-y-1 sm:space-y-1.5">
            {session.sectionDetails.memorizationSection && (
              <div className="text-[10px] sm:text-xs flex items-center gap-1 sm:gap-1.5 bg-blue-50 text-blue-700 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md border border-blue-100">
                <span className="text-xs sm:text-sm">📖</span>
                <span className="font-medium">حفظ:</span>
                <span className="truncate" title={session.sectionDetails.memorizationSection}>
                  {session.sectionDetails.memorizationSection}
                </span>
              </div>
            )}
            {session.sectionDetails.reviewSection && (
              <div className="text-[10px] sm:text-xs flex items-center gap-1 sm:gap-1.5 bg-amber-50 text-amber-700 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md border border-amber-100">
                <span className="text-xs sm:text-sm">🔄</span>
                <span className="font-medium">مراجعة:</span>
                <span className="truncate" title={session.sectionDetails.reviewSection}>
                  {session.sectionDetails.reviewSection}
                </span>
              </div>
            )}
          </div>
        )}
        
        {/* الوقت */}
        <div className="text-[10px] sm:text-xs md:text-sm text-gray-500 mb-2 sm:mb-3 md:mb-4 font-medium flex items-center gap-1 sm:gap-1.5 md:gap-2 bg-white/60 w-fit px-2 sm:px-2.5 md:px-3 py-1 sm:py-1.5 rounded-lg border border-gray-100/50">
          <span className="text-gray-400 text-xs sm:text-sm">⏰</span>
          <span className="font-mono">{session.startHour} - {session.endHour}</span>
        </div>
      </div>

      <div className="mt-auto pt-2 sm:pt-2.5 md:pt-3 border-t border-gray-100/50 flex items-center justify-between">
        {/* نوع الحصة */}
        {session.sessionType && (
          <span className={`text-[9px] sm:text-[10px] px-1.5 sm:px-2 md:px-2.5 py-0.5 sm:py-1 rounded-full font-bold border flex items-center gap-0.5 sm:gap-1 ${typeClass}`}>
            {typeLabel}
          </span>
        )}

        {/* القائمة المنسدلة */}
        {(role === "admin" || role === "teacher") && (
          <div 
            className="relative z-20 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0"
            onClick={(e) => e.stopPropagation()}
          >
            <DropdownMenu
              trigger={
                <button className="bg-white hover:bg-gray-50 text-gray-400 hover:text-gray-600 p-1 sm:p-1.5 rounded-lg shadow-sm border border-gray-200 transition-all flex items-center justify-center" title="خيارات">
                  <MoreVertical size={14} className="sm:w-4 sm:h-4" />
                </button>
              }
              items={[
                { label: "تعديل", icon: <Edit size={14} />, onClick: () => onEdit?.(session), className: "text-blue-600 hover:bg-blue-50 font-medium" },
                { label: "حذف", icon: <Trash2 size={14} />, onClick: () => onDelete?.(session), variant: "danger", className: "font-medium" },
              ]}
              position="bottom-left"
            />
          </div>
        )}
      </div>
    </div>
  );
};

/** رأس الجدول */
const GridHeader: React.FC<{ isSummer: boolean; weekRangeFormatted: string }> = ({ isSummer, weekRangeFormatted }) => (
  <div className="bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-600 px-3 sm:px-4 md:px-6 py-3 md:py-4 shadow-md relative overflow-hidden">
    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
    <div className="flex flex-col sm:flex-row items-center justify-between relative z-10 gap-3">
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="bg-white/20 p-1.5 sm:p-2 rounded-xl backdrop-blur-sm">
          <span className="text-xl sm:text-2xl">📅</span>
        </div>
        <div>
          <h3 className="text-base sm:text-lg md:text-xl font-bold text-white tracking-wide">الجدول الأسبوعي</h3>
          <p className="text-[10px] sm:text-xs text-emerald-100 font-medium opacity-90">{weekRangeFormatted}</p>
        </div>
      </div>
      
      <div className="flex flex-col items-center sm:items-end gap-1 bg-white/10 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl backdrop-blur-md border border-white/20 shadow-lg transform hover:scale-105 transition-transform duration-300">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <span className="text-base sm:text-lg animate-pulse">{isSummer ? '☀️' : '❄️'}</span>
          <span className="text-xs sm:text-sm font-bold text-white tracking-wide">
            {isSummer ? 'التوقيت الصيفي' : 'التوقيت الشتوي'}
          </span>
        </div>
        <span className="text-[9px] sm:text-[10px] text-white/90 font-mono bg-black/20 px-2 py-0.5 rounded-full">
          {isSummer ? '12:00 PM - 09:00 PM' : '11:00 AM - 08:00 PM'}
        </span>
      </div>
    </div>
  </div>
);

/** تعليمات أسفل الجدول */
const GridLegend: React.FC<{ role: UserRole }> = ({ role }) => (
  <div className="bg-white border-t border-gray-100 px-3 sm:px-4 md:px-6 py-3 md:py-4">
    <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 md:gap-8 text-xs sm:text-sm text-gray-600">
      <div className="flex items-center gap-1.5 sm:gap-2 bg-blue-50 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full border border-blue-100">
        <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-blue-500" />
        <span className="font-bold text-blue-700 text-[10px] sm:text-sm">حفظ</span>
      </div>
      <div className="flex items-center gap-1.5 sm:gap-2 bg-amber-50 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full border border-amber-100">
        <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-amber-500" />
        <span className="font-bold text-amber-700 text-[10px] sm:text-sm">مراجعة</span>
      </div>
      <div className="flex items-center gap-1.5 sm:gap-2 bg-purple-50 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full border border-purple-100">
        <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-purple-500" />
        <span className="font-bold text-purple-700 text-[10px] sm:text-sm">شامل</span>
      </div>
      {role === "admin" && (
        <span className="hidden sm:flex text-xs text-gray-400 items-center gap-1 sm:mr-auto bg-gray-50 px-2 py-1 rounded-md">
          <span>💡</span>
          مرر فوق البطاقة للخيارات
        </span>
      )}
    </div>
  </div>
);

// ============================================================================
// المكون الرئيسي
// ============================================================================

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
  const {
    isSummer,
    hours,
    weekDates,
    weekRangeFormatted,
    isSlotOccupied,
    getSessionsAt,
  } = useWeeklyGrid({ sessions });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden w-full transition-all duration-300 hover:shadow-emerald-100/50" dir="rtl">
      <GridHeader isSummer={isSummer} weekRangeFormatted={weekRangeFormatted} />

      {/* الشبكة */}
      <div className="overflow-hidden w-full bg-gray-50/50">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="sticky right-0 bg-white border-b border-gray-200 p-2 sm:p-3 md:p-4 text-xs sm:text-sm font-bold text-gray-500 w-16 sm:w-24 md:w-32 z-20 shadow-[4px_0_10px_-4px_rgba(0,0,0,0.05)] uppercase tracking-wider backdrop-blur-sm">
                  <div className="flex flex-col items-center gap-0.5 sm:gap-1">
                    <span className="text-emerald-500 text-sm sm:text-base">⏰</span>
                    <span className="text-[10px] sm:text-xs md:text-sm">الوقت</span>
                  </div>
                </th>
                {weekDates.map((date, index) => {
                  const dayName = WEEK_DAYS[index];
                  const dateStr = date.toLocaleDateString('ar-SA', { day: 'numeric', month: 'short' });
                  const dateKey = formatDateForAPI(date);
                  
                  return (
                    <th key={dateKey} className="bg-gray-50/80 border-b border-l border-gray-200 p-2 sm:p-3 md:p-4 text-xs sm:text-sm font-extrabold text-gray-700 shadow-sm min-w-[120px] sm:min-w-[140px] md:min-w-[160px] group transition-colors hover:bg-emerald-50/30">
                      <div className="flex flex-col items-center gap-1 transition-transform group-hover:-translate-y-0.5 duration-300">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 group-hover:scale-125 transition-transform" />
                          {dayName}
                        </div>
                        <span className="text-xs text-gray-400 font-normal">{dateStr}</span>
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {hours.map((hour) => (
                <tr key={hour} className="group/row transition-colors hover:bg-emerald-50/10">
                  <td className="sticky right-0 bg-white group-hover/row:bg-emerald-50/30 transition-colors border-b border-gray-100 border-l border-gray-200 p-2 sm:p-3 md:p-4 text-[10px] sm:text-xs font-bold text-gray-400 text-center z-10 shadow-[4px_0_10px_-4px_rgba(0,0,0,0.05)] font-mono">
                    {hour}
                  </td>
                  {weekDates.map((date) => {
                    const dateKey = formatDateForAPI(date);
                    
                    if (isSlotOccupied(dateKey, hour)) return null;

                    const daySessions = getSessionsAt(dateKey, hour);
                    
                    // حصص متعددة في نفس الوقت
                    if (daySessions.length > 1) {
                      return (
                        <td key={`${dateKey}-${hour}`} className="border-b border-l border-gray-100 p-1 sm:p-1.5 md:p-2 align-top relative bg-transparent hover:bg-gray-50/50 transition-colors">
                          <div className="space-y-1 sm:space-y-1.5 md:space-y-2">
                            {daySessions.map(({ session }) => (
                              <SessionCard key={session._id} session={session} role={role} onEdit={onEdit} onDelete={onDelete} compact />
                            ))}
                          </div>
                        </td>
                      );
                    }
                    
                    return (
                      <td
                        key={`${dateKey}-${hour}`}
                        rowSpan={daySessions.length > 0 ? daySessions[0].rowSpan : 1}
                        className="border-b border-l border-gray-100 p-1 sm:p-1.5 md:p-2 lg:p-3 align-top h-[120px] sm:h-[150px] md:h-[180px] relative bg-transparent hover:bg-gray-50/50 transition-colors"
                      >
                        {daySessions.length > 0 ? (
                          <div className="h-full">
                            {daySessions.map(({ session }) => (
                              <SessionCard key={session._id} session={session} role={role} onEdit={onEdit} onDelete={onDelete} />
                            ))}
                          </div>
                        ) : (
                          <div className="h-full min-h-[120px] sm:min-h-[150px] md:min-h-[180px] rounded-xl border border-dashed border-gray-200/50 flex items-center justify-center group-hover:bg-white/50 group-hover:border-emerald-200/50 transition-all" />
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

      <GridLegend role={role} />
    </div>
  );
};
