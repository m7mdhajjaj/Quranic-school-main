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
import { Edit, Trash2, Clock, Calendar, User, MoreVertical } from 'lucide-react';
import { DropdownMenu } from '@/components/UI/DropdownMenu';

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
    <div className="space-y-8 pb-10 max-w-[1920px] mx-auto" dir="rtl">
      {WEEK_DAYS.map((day, index) => {
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
            className="group/day relative bg-white rounded-[2rem] shadow-xl shadow-gray-200/50 border border-emerald-100/50 overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-emerald-900/5"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            {/* الخلفية الجمالية */}
            
            {/* رأس اليوم */}
            <div className="relative overflow-hidden bg-gradient-to-l from-emerald-600 via-teal-500 to-emerald-600 px-6 py-5 md:px-8">
                <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.1)_25%,rgba(255,255,255,0.1)_50%,transparent_50%,transparent_75%,rgba(255,255,255,0.1)_75%,rgba(255,255,255,0.1)_100%)] bg-[length:24px_24px] opacity-20"></div>
                
                <div className="relative flex items-center justify-between z-10">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-[inset_0_0_20px_rgba(255,255,255,0.2)] border border-white/30 text-white transform group-hover/day:scale-105 group-hover/day:rotate-3 transition-all duration-500">
                        <Calendar className="w-7 h-7 drop-shadow-md" strokeWidth={2.5} />
                      </div>
                      <div>
                        <h3 className="text-2xl font-black text-white tracking-tight drop-shadow-sm">{day}</h3>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="bg-emerald-800/30 backdrop-blur-sm text-emerald-50 text-xs px-2.5 py-0.5 rounded-full border border-white/10 font-medium">
                                {totalSlots} حصص
                            </span>
                            {totalDuration > 0 && (
                                <span className="bg-emerald-800/30 backdrop-blur-sm text-emerald-50 text-xs px-2.5 py-0.5 rounded-full border border-white/10 font-medium font-mono">
                                    ⏱️ {formatDuration(totalDuration)}
                                </span>
                            )}
                        </div>
                      </div>
                    </div>

                    <div className="hidden sm:flex flex-col items-end gap-1">
                        <div className="bg-white/15 backdrop-blur-md border border-white/20 px-4 py-1.5 rounded-full flex items-center gap-2 text-white text-xs font-bold shadow-sm">
                            <span>{currentIsSummer ? '☀️ التوقيت الصيفي' : '❄️ التوقيت الشتوي'}</span>
                        </div>
                        <span className="text-[10px] text-emerald-100/80 font-mono pr-2">
                           {currentIsSummer ? '12:00 PM - 09:00 PM' : '11:00 AM - 08:00 PM'}
                        </span>
                    </div>
                </div>
            </div>

            {/* شبكة الحصص */}
            <div className="p-6 md:p-8 bg-gray-50/30 min-h-[200px]">
              {daySessions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-gray-400 group/empty">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4 group-hover/empty:scale-110 group-hover/empty:bg-emerald-50 transition-all duration-500">
                      <Calendar className="w-10 h-10 text-gray-300 group-hover/empty:text-emerald-400 transition-colors" strokeWidth={1.5} />
                    </div>
                    <p className="text-gray-500 font-medium">لا توجد حصص مجدولة في هذا اليوم</p>
                    <p className="text-sm text-gray-400 mt-1">يمكنك إضافة حصص جديدة من لوحة التحكم</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {daySessions.map((session, sIndex) => {
                    const duration = calculateDuration(
                      session.startHour,
                      session.endHour
                    );
                    
                    const isHifz = session.sessionType === 'hifz';
                    const isMurajaah = session.sessionType === 'murajaah';
                    
                    // تحديد الألوان بناءً على نوع الحصة
                    const colorClasses = isHifz 
                        ? { bg: 'bg-white', border: 'border-blue-100', accent: 'bg-blue-500', text: 'text-blue-700', light: 'bg-blue-50', hover: 'hover:border-blue-300 hover:shadow-blue-100' }
                        : isMurajaah
                        ? { bg: 'bg-white', border: 'border-amber-100', accent: 'bg-amber-500', text: 'text-amber-700', light: 'bg-amber-50', hover: 'hover:border-amber-300 hover:shadow-amber-100' }
                        : { bg: 'bg-white', border: 'border-purple-100', accent: 'bg-purple-500', text: 'text-purple-700', light: 'bg-purple-50', hover: 'hover:border-purple-300 hover:shadow-purple-100' };

                    return (
                      <div
                        key={session._id}
                        className={`
                            relative group rounded-2xl p-5 border shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl
                            ${colorClasses.bg} ${colorClasses.border} ${colorClasses.hover}
                        `}
                        style={{ animationDelay: `${sIndex * 50}ms` }}
                      >
                        
                        {/* شريط علوي ملون */}
                        <div className={`absolute top-0 inset-x-0 h-1.5 rounded-t-2xl ${colorClasses.accent} opacity-80`}></div>

                        {/* المحتوى */}
                        <div className="space-y-4 pt-2">
                          
                          {/* العنوان والنوع */}
                          <div className="flex items-start justify-between gap-3">
                              <div>
                                  <h4 className="font-bold text-gray-800 text-lg leading-snug line-clamp-1" title={session.note}>
                                    {session.note || 'حلقة'}
                                  </h4>
                                  <div className={`text-[10px] mt-1.5 px-2 py-0.5 rounded-md w-fit font-bold border ${colorClasses.light} ${colorClasses.text} border-current opacity-80`}>
                                    {isHifz && '📖 حفظ للقرآن'}
                                    {isMurajaah && '🔄 مراجعة وتثبيت'}
                                    {!isHifz && !isMurajaah && '📚 حفظ ومراجعة'}
                                  </div>
                              </div>
                              <div className={`flex-shrink-0 w-8 h-8 rounded-full ${colorClasses.light} flex items-center justify-center`}>
                                <div className={`w-2.5 h-2.5 rounded-full ${colorClasses.accent} animate-pulse`}></div>
                              </div>
                          </div>

                          <div className="w-full h-px bg-gray-100"></div>

                          {/* التوقيت */}
                          <div className="bg-gray-50 rounded-xl p-3 border border-gray-100/50 flex items-center justify-between group-hover:bg-gray-50/80 transition-colors">
                            <div className="flex items-center gap-2">
                                <span className="text-lg">⏰</span>
                                <div>
                                    <div className="text-xs text-gray-400 font-medium mb-0.5">التوقيت</div>
                                    <div className="text-sm font-bold text-gray-700 font-mono tracking-tight">{session.startHour} - {session.endHour}</div>
                                </div>
                            </div>
                            <div className="text-[10px] bg-white px-2 py-1 rounded-md border border-gray-200 text-gray-500 font-medium">
                                ⌛ {formatDuration(duration)}
                            </div>
                          </div>

                          {/* المعلم */}
                          {session.teacherId && (
                            <div className="flex items-center gap-3 px-1">
                                <div className={`w-8 h-8 rounded-full ${colorClasses.light} flex items-center justify-center text-lg shadow-sm border border-white`}>
                                    👨‍🏫
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-[10px] text-gray-400 font-medium">المعلم</div>
                                    <div className="text-sm font-bold text-gray-700 truncate" title={typeof session.teacherId === 'object' ? `${session.teacherId.firstName} ${session.teacherId.lastName}` : ''}>
                                        {typeof session.teacherId === 'object' && session.teacherId.firstName
                                          ? `${session.teacherId.firstName} ${session.teacherId.lastName}`
                                          : 'معلم الحلقة'}
                                    </div>
                                </div>
                            </div>
                          )}

                          {/* الوصف */}
                          {session.description && (
                            <div className="text-xs text-gray-600 bg-gray-50/50 p-3 rounded-xl border border-gray-100/80 mt-2 relative group-hover:bg-amber-50/30 transition-colors">
                              <span className="absolute top-2 left-2 text-gray-300 text-xl font-serif">"</span>
                              <div className="text-[10px] font-bold text-gray-400 mb-1">📝 ملاحظات:</div>
                              <div className="italic line-clamp-2 leading-relaxed opacity-90 pl-1">
                                {session.description}
                              </div>
                            </div>
                          )}

                          {/* زر الإجراءات */}
                          {(role === "admin" || role === "teacher") && (
                            <div className="absolute top-4 left-4 opacity-0 group-hover:opacity-100 transition-all duration-300 scale-90 group-hover:scale-100">
                              <DropdownMenu
                                trigger={
                                  <button
                                    className="bg-white hover:bg-gray-50 p-2 rounded-xl shadow-md text-gray-400 hover:text-gray-600 transition-all border border-gray-100 hover:border-emerald-200"
                                    title="إدارة الحلقة"
                                  >
                                    <MoreVertical size={18} />
                                  </button>
                                }
                                items={[
                                  {
                                    label: "تعديل البيانات",
                                    icon: <Edit size={15} />,
                                    onClick: () => onEdit?.(session),
                                    className: "text-blue-600 hover:bg-blue-50 font-medium",
                                  },
                                  {
                                    label: "حذف الحلقة",
                                    icon: <Trash2 size={15} />,
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
