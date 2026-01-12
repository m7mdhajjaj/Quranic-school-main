import React from 'react';
import { 
  ChevronRight, 
  ChevronLeft, 
  Calendar as CalendarIcon, 
  Clock, 
  MoreVertical,
  Edit,
  RefreshCw
} from 'lucide-react';
import dayjs from 'dayjs';
import { WEEK_DAYS } from '../utils';
import type { Session, UserRole } from '../types/timetable.types';
import { DropdownMenu } from '@/components/UI/DropdownMenu';
import { useMonthlyTimetable } from '../hooks/useMonthlyTimetable';

interface AdvancedTimetableViewProps {
  sessions: Session[]; // تُستخدم كـ trigger للتحديث
  loading: boolean;
  role: UserRole;
  onEdit?: (session: Session) => void;
  onDelete?: (session: Session) => void;
  refetchSessions?: () => void;
}

export const AdvancedTimetableView: React.FC<AdvancedTimetableViewProps> = ({
  sessions: initialSessions,
  loading: initialLoading,
  role,
  onEdit,
  refetchSessions 
}) => {
  // ✅ استخدام الـ Hook الجديد لفصل المنطق
  const {
    currentDate,
    loading: monthlyLoading,
    calendarDays,
    nextMonth,
    prevMonth,
    goToToday,
    getDailySessions,
    refresh
  } = useMonthlyTimetable(initialSessions);

  const isLoading = initialLoading || monthlyLoading;

  return (
    <div className="space-y-6" dir="rtl">
      {/* رأس التقويم */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-emerald-50 rounded-xl relative">
            <CalendarIcon className="w-6 h-6 text-emerald-600" />
            {isLoading && (
               <span className="absolute top-0 right-0 -mt-1 -mr-1 w-3 h-3 bg-red-500 rounded-full animate-ping"></span>
            )}
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
               {currentDate.format('MMMM YYYY')}
            </h2>
            <p className="text-gray-500 text-sm">عرض الخطة الشهرية المعتمدة</p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-xl">
          <button 
            onClick={prevMonth}
            className="p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all text-gray-600"
            title="الشهر السابق"
          >
            <ChevronRight size={20} />
          </button>
          
          <button 
            onClick={goToToday}
            className="px-4 py-2 bg-white shadow-sm rounded-lg text-sm font-medium text-gray-700 hover:text-emerald-600 transition-colors"
          >
            اليوم
          </button>

          <button 
            onClick={nextMonth}
            className="p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all text-gray-600"
            title="الشهر التالي"
          >
            <ChevronLeft size={20} />
          </button>

          <div className="w-px h-6 bg-gray-300 mx-1"></div>

          <button 
            onClick={() => { refresh(); refetchSessions?.(); }}
            className={`p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all text-gray-600 ${isLoading ? 'animate-spin' : ''}`}
            title="تحديث البيانات"
          >
            <RefreshCw size={18} />
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="linear-progress-container h-1 w-full bg-emerald-100 overflow-hidden rounded-full font-sans">
             <div className="h-full bg-emerald-500 animate-slide-in-right w-full origin-right"></div>
        </div>
      )}

      {/* الجدول الشهري */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden min-h-[600px] flex flex-col">
        {/* Days Header */}
        <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50/50">
          {WEEK_DAYS.map((day) => (
            <div key={day} className="py-4 text-center text-sm font-bold text-gray-600">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 flex-1 auto-rows-fr bg-gray-200 gap-px">
          {calendarDays.map(( dayInfo, index) => {
            const sessionsForDay = getDailySessions(dayInfo.date);
            const isToday = dayInfo.date.isSame(dayjs(), 'day');
            
            return (
              <div 
                key={index} 
                className={`
                   min-h-[140px] bg-white p-2 relative group transition-colors flex flex-col gap-2
                   ${!dayInfo.isCurrentMonth ? 'bg-gray-50/50 opacity-60' : ''}
                   ${isToday ? 'bg-emerald-50/20' : ''}
                `}
              >
                {/* Day Header */}
                <div className="flex justify-between items-start">
                    <span className={`
                        w-7 h-7 flex items-center justify-center rounded-full text-sm font-bold transition-all
                        ${isToday ? 'bg-emerald-600 text-white shadow-md scale-110' : 
                          !dayInfo.isCurrentMonth ? 'text-gray-400' : 'text-gray-700'}
                    `}>
                        {dayInfo.date.format('D')}
                    </span>
                    
                    {dayInfo.isCurrentMonth && sessionsForDay.length > 0 && (
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-md font-medium">
                            {sessionsForDay.length}
                        </span>
                    )}
                </div>

                {/* Sessions List */}
                <div className="flex-1 space-y-1.5 overflow-y-auto max-h-[120px] custom-scrollbar pr-1">
                  {sessionsForDay.map(session => (
                    <div 
                      key={session._id} 
                      className="group/item relative bg-white border border-emerald-100/80 rounded-lg p-1.5 hover:shadow-md hover:border-emerald-300 transition-all cursor-default"
                    >
                      <div className="flex items-center justify-between gap-1">
                        <div className="flex items-center gap-1 min-w-0">
                           <Clock size={10} className="text-emerald-500 shrink-0" />
                           <span className="text-[10px] font-bold text-gray-700 truncate dir-ltr font-mono">
                             {session.startHour}
                           </span>
                        </div>
                        
                        {(role === "admin" || role === "teacher") && (
                            <div className="opacity-0 group-hover/item:opacity-100 transition-opacity absolute top-1 left-1 bg-white/80 rounded z-10">
                                <DropdownMenu
                                    trigger={
                                        <button className="p-0.5 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-600" title="خيارات الجلسة">
                                            <MoreVertical size={12} />
                                        </button>
                                    }
                                    items={[
                                        {
                                          label: "تعديل الأصل",
                                          icon: <Edit size={14} />,
                                          onClick: () => {
                                            const originalSession = { ...session };
                                            onEdit?.(originalSession)
                                          },
                                        },
                                    ]}
                                    position="bottom-left"
                                    menuClassName="w-32 text-xs"
                                />
                            </div>
                        )}
                      </div>
                      
                      <div className="mt-1 text-[10px] text-gray-500 truncate" title={session.groupId || session.note}>
                         <div className="font-medium text-emerald-700 truncate">
                            {session.groupId || session.note}
                         </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
