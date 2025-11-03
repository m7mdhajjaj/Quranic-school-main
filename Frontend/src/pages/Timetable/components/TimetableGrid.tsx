// ============================================================================
// TimetableGrid - مكون الجدول الأسبوعي للحصص
// ============================================================================

import React, { useMemo, type JSX } from "react";
import type { Session, UserRole } from "../types/timetable.types";
import { WEEK_DAYS, generateHours } from "../utils/timetableHelpers";
import { Button } from "../../../components/UI/Button";
import { Edit, Trash2 } from "lucide-react";

interface TimetableGridProps {
  sessions: Session[];
  loading: boolean;
  role: UserRole;
  onEdit?: (session: Session) => void;
  onDelete?: (session: Session) => void;
}

export const TimetableGrid: React.FC<TimetableGridProps> = ({
  sessions,
  loading,
  role,
  onEdit,
  onDelete,
}) => {
  const hours = useMemo(() => generateHours(), []);

  const hourIndex = (h: string) => hours.indexOf(h);

  // بناء خلايا صف اليوم مع دمج الأعمدة
  const renderDayRowCells = (day: string) => {
    const tds: JSX.Element[] = [];
    let i = 0;

    while (i < hours.length) {
      const sessionIndex = sessions.findIndex(
        (s) => s.day === day && hourIndex(s.startHour) === i
      );

      if (sessionIndex !== -1) {
        const session = sessions[sessionIndex];
        const si = hourIndex(session.startHour);
        const ei = hourIndex(session.endHour);
        const span = Math.max(1, ei - si);

        tds.push(
          <td
            key={`${day}-${session.startHour}-${session.endHour}`}
            colSpan={span}
            className="border border-emerald-100/70 bg-gradient-to-b from-yellow-200 via-yellow-200/90 to-yellow-100 text-yellow-900 font-semibold text-center align-middle relative rounded-md shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] animate-fadeIn">
            <div className="flex flex-col items-center justify-center py-2 px-1">
              <div className="inline-flex items-center gap-2 flex-wrap justify-center">
                <span className="inline-block h-2 w-2 rounded-full bg-yellow-500 shadow animate-pulse" />
                <span className="tracking-wide text-xs md:text-sm">
                  {session.note
                    ? `${session.note} (${session.startHour} - ${session.endHour})`
                    : `حلقة (${session.startHour} - ${session.endHour})`}
                </span>
              </div>

              {(role === "teacher" || role === "admin") && (
                <div className="mt-2 flex gap-2">
                  <Button
                    size="xs"
                    variant="warning"
                    leftIcon={<Edit size={14} />}
                    onClick={() => onEdit?.(session)}>
                    تعديل
                  </Button>
                  <Button
                    size="xs"
                    variant="danger"
                    leftIcon={<Trash2 size={14} />}
                    onClick={() => onDelete?.(session)}>
                    حذف
                  </Button>
                </div>
              )}
            </div>
          </td>
        );

        i = ei; // نتخطى الأعمدة المدموجة
      } else {
        tds.push(
          <td
            key={`${day}-${hours[i]}`}
            className="border border-emerald-100/60 bg-white h-12 min-w-[54px] hover:bg-emerald-50/30 transition-colors"
          />
        );
        i += 1;
      }
    }
    return tds;
  };

  return (
    <div className="bg-white/90 backdrop-blur rounded-2xl border border-emerald-100 shadow-[0_10px_30px_rgba(16,185,129,0.08)] overflow-hidden">
      <div className="overflow-x-auto w-full scrollbar-thin scrollbar-thumb-emerald-400 scrollbar-track-emerald-50">
        <table className="min-w-max w-full text-center border-separate border-spacing-0 text-[13px] md:text-base">
          <thead className="sticky top-0 z-10">
            <tr className="bg-gradient-to-l from-emerald-600 to-emerald-500 text-white">
              <th className="sticky right-0 bg-emerald-600/95 px-2 md:px-4 py-2 md:py-3 text-sm md:text-base font-bold border-l border-emerald-500">
                اليوم / الوقت
              </th>
              {hours.map((h) => (
                <th
                  key={`h-${h}`}
                  className="px-2 md:px-3 py-2 md:py-3 text-[10px] md:text-xs font-semibold border-l border-emerald-500/30 whitespace-nowrap"
                  title={h}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {loading
              ? // Skeleton loader
                WEEK_DAYS.map((day, r) => (
                  <tr
                    key={day}
                    className={r % 2 ? "bg-emerald-50/20" : "bg-white"}>
                    <td className="sticky right-0 bg-emerald-50/90 backdrop-blur px-2 md:px-4 py-2 md:py-3 font-bold text-emerald-800 border-t border-b border-emerald-100 text-[13px] md:text-base">
                      {day}
                    </td>
                    {hours.map((hour, idx) => (
                      <td
                        key={`skeleton-${day}-${hour}`}
                        className="border border-emerald-100/60 bg-white h-12 min-w-[54px]">
                        {idx % 4 === 0 && (
                          <div className="animate-pulse">
                            <div className="h-8 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-md mx-1"></div>
                          </div>
                        )}
                      </td>
                    ))}
                  </tr>
                ))
              : // عرض الحصص الفعلية
                WEEK_DAYS.map((day, r) => (
                  <tr
                    key={day}
                    className={r % 2 ? "bg-emerald-50/20" : "bg-white"}>
                    <td className="sticky right-0 bg-emerald-50/90 backdrop-blur px-2 md:px-4 py-2 md:py-3 font-bold text-emerald-800 border-t border-b border-emerald-100 text-[13px] md:text-base">
                      {day}
                    </td>
                    {renderDayRowCells(day)}
                  </tr>
                ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
