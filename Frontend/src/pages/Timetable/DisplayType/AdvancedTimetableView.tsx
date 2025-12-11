// ============================================================================
// AdvancedTimetableView - عرض متقدم للجدول مع Slot Times
// ============================================================================

import React, { useMemo } from 'react';
import type { Session, UserRole } from '../types/timetable.types';
import {
  WEEK_DAYS,
  isSummerTime,
  calculateDuration,
  formatDuration,
  organizeSessionsByDay,
} from '../utils';
import { Button } from '@/components/UI/Button';
import { Edit, Trash2, Clock, Calendar, User } from 'lucide-react';

interface AdvancedTimetableViewProps {
  sessions: Session[];
  loading: boolean;
  role: UserRole;
  onEdit?: (session: Session) => void;
  onDelete?: (session: Session) => void;
}

export const AdvancedTimetableView: React.FC<AdvancedTimetableViewProps> = ({
  sessions,
  loading,
  role,
  onEdit,
  onDelete,
}) => {
  // تحديد التوقيت الحالي تلقائياً
  const currentIsSummer = useMemo(() => isSummerTime(), []);

  // تنظيم الحصص حسب اليوم (مع الترتيب التلقائي)
  const sessionsByDay = useMemo(
    () => organizeSessionsByDay(sessions),
    [sessions]
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      {WEEK_DAYS.map((day) => {
        const daySessions = sessionsByDay[day];
        const totalSlots = daySessions.length;
        const totalDuration = daySessions.reduce(
          (sum, session) =>
            sum + calculateDuration(session.startHour, session.endHour),
          0
        );

        return (
          <div
            key={day}
            className="bg-white rounded-2xl shadow-lg border border-emerald-100 overflow-hidden"
          >
            {/* رأس اليوم */}
            <div className="bg-gradient-to-l from-emerald-600 to-emerald-500 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Calendar className="w-6 h-6 text-white" />
                  <h3 className="text-xl font-bold text-white">{day}</h3>
                </div>
                <div className="flex items-center gap-4 text-white text-sm">
                  {role === 'admin' && (
                    <>
                      <div className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full">
                        <Clock className="w-4 h-4" />
                        <span>{totalSlots} حصة</span>
                      </div>
                      {totalDuration > 0 && (
                        <div className="bg-white/20 px-3 py-1 rounded-full">
                          المدة: {formatDuration(totalDuration)}
                        </div>
                      )}
                    </>
                  )}
                  <div className="flex flex-col items-end gap-0.5 bg-white/20 px-3 py-1.5 rounded-lg">
                    <span className="text-xs font-bold">
                      {currentIsSummer ? '☀️ صيفي' : '❄️ شتوي'}
                    </span>
                    <span className="text-[10px] text-white/90">
                      {currentIsSummer ? '12PM-9PM' : '11AM-8PM'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* الحصص */}
            <div className="p-4">
              {daySessions.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">لا توجد حصص مجدولة في هذا اليوم</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {daySessions.map((session) => {
                    const duration = calculateDuration(
                      session.startHour,
                      session.endHour
                    );

                    return (
                      <div
                        key={session._id}
                        className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl p-4 border-2 border-yellow-200 hover:border-yellow-400 hover:shadow-md transition-all duration-200"
                      >
                        {/* معلومات الحلقة */}
                        <div className="space-y-3">
                          {/* اسم الحلقة */}
                          <div className="flex items-start gap-2">
                            <div className="flex-shrink-0 w-2 h-2 rounded-full bg-yellow-500 mt-2 animate-pulse" />
                            <h4 className="font-bold text-yellow-900 text-base leading-tight">
                              {session.note || 'حلقة'}
                            </h4>
                          </div>

                          {/* الوقت والمدة */}
                          <div className="flex items-center gap-2 text-sm text-yellow-800 bg-white/60 px-3 py-2 rounded-lg">
                            <Clock className="w-4 h-4 flex-shrink-0" />
                            <div className="flex-1">
                              <div className="font-semibold">
                                {session.startHour} - {session.endHour}
                              </div>
                              <div className="text-xs text-yellow-700">
                                المدة: {formatDuration(duration)}
                              </div>
                            </div>
                          </div>

                          {/* المعلم */}
                          {session.teacherId && (
                            <div className="flex items-center gap-2 text-sm text-yellow-800 bg-white/60 px-3 py-2 rounded-lg">
                              <User className="w-4 h-4 flex-shrink-0" />
                              <span className="font-medium">
                                {typeof session.teacherId === 'object' &&
                                session.teacherId.firstName
                                  ? `${session.teacherId.firstName} ${session.teacherId.lastName}`
                                  : '👤 معلم الحلقة'}
                              </span>
                            </div>
                          )}

                          {/* نوع الحصة */}
                          {session.sessionType && (
                            <div className="flex items-center gap-2 text-sm text-yellow-800 bg-white/60 px-3 py-2 rounded-lg">
                              <span className="text-base">
                                {session.sessionType === 'hifz' && '📖'}
                                {session.sessionType === 'murajaah' && '🔄'}
                                {session.sessionType === 'both' && '📚'}
                              </span>
                              <span className="font-semibold">
                                {session.sessionType === 'hifz' && 'حفظ'}
                                {session.sessionType === 'murajaah' && 'مراجعة'}
                                {session.sessionType === 'both' &&
                                  'حفظ ومراجعة'}
                              </span>
                            </div>
                          )}

                          {/* الوصف/الملاحظات */}
                          {session.description && (
                            <div className="text-xs text-yellow-700 bg-white/80 px-3 py-2 rounded-lg border border-yellow-200">
                              <span className="font-semibold">
                                📝 ملاحظات:{' '}
                              </span>
                              <span
                                className="line-clamp-3"
                                title={session.description}
                              >
                                {session.description}
                              </span>
                            </div>
                          )}

                          {/* أزرار التحكم - للمدير فقط */}
                          {role === 'admin' && (
                            <div className="flex gap-2 pt-2 border-t border-yellow-200">
                              <Button
                                size="sm"
                                variant="warning"
                                leftIcon={<Edit size={14} />}
                                onClick={() => onEdit?.(session)}
                                fullWidth
                              >
                                تعديل
                              </Button>
                              <Button
                                size="sm"
                                variant="danger"
                                leftIcon={<Trash2 size={14} />}
                                onClick={() => onDelete?.(session)}
                                fullWidth
                              >
                                حذف
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
