import React from 'react';
import { 
  ChevronRight, 
  ChevronLeft, 
  Calendar as CalendarIcon, 
  Clock, 
  MoreVertical,
  Edit,
  Trash2,
  RefreshCw
} from 'lucide-react';
import dayjs from 'dayjs';
import { WEEK_DAYS } from '../utils';
import type { Session, UserRole } from '../types/timetable.types';
import { DropdownMenu } from '@/components/UI/DropdownMenu';
import { Modal } from '@/components/UI/Modal';
import { useMonthlyTimetable } from '../hooks/display/useMonthlyTimetable';

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
  onDelete,
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
    refresh,
    // ✅ استخدام منطق المودال من الهوك
    selectedDate,
    isDayModalOpen,
    openDayModal,
    closeDayModal,
  } = useMonthlyTimetable(initialSessions);

  const isLoading = initialLoading || monthlyLoading;

  const selectedSessions = selectedDate ? getDailySessions(selectedDate) : [];

  return (
    <div className="space-y-6" dir="rtl">
      {/* Modal عرض تفاصيل اليوم */}
      <Modal
        isOpen={isDayModalOpen}
        onClose={closeDayModal}
        title={`مواعيد ${selectedDate?.format('dddd DD MMMM YYYY')}`}
        size="lg"
      >
        <div className="space-y-4 max-h-[70vh] overflow-y-auto px-1">
          {selectedSessions.length > 0 ? (
            selectedSessions.map((session) => (
              <div 
                key={session._id} 
                className={`
                  relative border rounded-xl p-4 transition-all hover:shadow-md
                  ${session.sessionType === 'hifz' ? 'bg-blue-50/30 border-blue-100 hover:border-blue-300' : 
                    session.sessionType === 'murajaah' ? 'bg-amber-50/30 border-amber-100 hover:border-amber-300' :
                    'bg-white border-gray-200 hover:border-emerald-300'}
                `}
              >
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  {/* القسم الأيمن: التفاصيل */}
                  <div className="flex-1 space-y-3">
                    {/* العنوان والوقت */}
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-bold text-gray-800 text-lg mb-1">
                           {session.groupName || session.note || "حلقة"}
                        </h4>
                        {/* اسم المعلم */}
                        {session.teacherId && typeof session.teacherId === 'object' && (
                          <div className="flex items-center gap-1 mb-2">
                            <span className="text-xs text-gray-500">👨‍🏫</span>
                            <span className="text-xs text-gray-600 font-medium">
                              {session.teacherId.firstName} {session.teacherId.lastName}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-sm text-gray-500 font-mono bg-gray-50 w-fit px-2 py-1 rounded">
                          <Clock size={16} className="text-emerald-500" />
                          <span dir="ltr">{session.startHour} - {session.endHour}</span>
                        </div>
                      </div>

                      {/* نوع الحصة */}
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                          session.sessionType === 'hifz' ? 'bg-blue-100 text-blue-700 border-blue-200' : 
                          session.sessionType === 'murajaah' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                          'bg-purple-100 text-purple-700 border-purple-200'
                      }`}>
                          {session.sessionType === 'hifz' ? 'حفظ' : session.sessionType === 'murajaah' ? 'مراجعة' : 'شامل'}
                      </span>
                    </div>

                    {/* تفاصيل المقطع */}
                    {(session.sectionDetails || session.sectionInfo) && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {/* عرض مقطع الحفظ فقط إذا كان نوع الحصة hifz أو both */}
                        {(session.sectionDetails?.memorizationSection || session.sectionInfo?.memorizationSection) && (session.sessionType === 'hifz' || session.sessionType === 'both') && (
                          <div className="flex items-center gap-2 text-sm text-blue-800 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">
                            <span className="text-lg">📖</span>
                            <span className="font-bold">حفظ:</span>
                            <span>{session.sectionDetails?.memorizationSection || session.sectionInfo?.memorizationSection}</span>
                          </div>
                        )}
                        {/* عرض مقطع المراجعة فقط إذا كان نوع الحصة murajaah أو both */}
                        {(session.sectionDetails?.reviewSection || session.sectionInfo?.reviewSection) && (session.sessionType === 'murajaah' || session.sessionType === 'both') && (
                          <div className="flex items-center gap-2 text-sm text-amber-800 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-100">
                            <span className="text-lg">🔄</span>
                            <span className="font-bold">مراجعة:</span>
                            <span>{session.sectionDetails?.reviewSection || session.sectionInfo?.reviewSection}</span>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* ملاحظات */}
                    {session.description && (
                      <p className="text-sm text-gray-600 bg-gray-50/50 p-2 rounded border border-gray-100 mt-2">
                        {session.description}
                      </p>
                    )}
                  </div>

                  {/* إجراءات - للمعلم فقط */}
                  {role === "teacher" && (
                    <div className="flex md:flex-col gap-2 justify-center border-t md:border-t-0 md:border-r border-gray-100 pt-3 md:pt-0 md:pr-4">
                      <button 
                        onClick={() => { closeDayModal(); onEdit?.(session); }}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors text-sm font-medium w-full justify-center"
                      >
                        <Edit size={16} />
                        تعديل
                      </button>

                      <button 
                        onClick={() => { closeDayModal(); onDelete?.(session); }}
                        className="flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors text-sm font-medium w-full justify-center"
                      >
                        <Trash2 size={16} />
                        حذف
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-10 text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
              <CalendarIcon className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>لا توجد مواعيد في هذا اليوم</p>
            </div>
          )}
        </div>
      </Modal>

      {/* رأس التقويم */}
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 p-3 sm:p-4 flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
          <div className="p-2 sm:p-3 bg-emerald-50 rounded-lg sm:rounded-xl relative">
            <CalendarIcon className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" />
            {isLoading && (
               <span className="absolute top-0 right-0 -mt-1 -mr-1 w-2 h-2 sm:w-3 sm:h-3 bg-red-500 rounded-full animate-ping"></span>
            )}
          </div>
          <div>
            <h2 className="text-base sm:text-lg md:text-xl font-bold text-gray-800 flex items-center gap-2">
               {currentDate.format('MMMM YYYY')}
            </h2>
            <p className="text-gray-500 text-xs sm:text-sm">عرض الخطة الشهرية المعتمدة</p>
          </div>
        </div>

        <div className="flex items-center gap-1 sm:gap-2 bg-gray-50 p-1 rounded-lg sm:rounded-xl">
          <button 
            onClick={prevMonth}
            className="p-1.5 sm:p-2 hover:bg-white hover:shadow-sm rounded-md sm:rounded-lg transition-all text-gray-600"
            title="الشهر السابق"
          >
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          
          <button 
            onClick={goToToday}
            className="px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 bg-white shadow-sm rounded-md sm:rounded-lg text-xs sm:text-sm font-medium text-gray-700 hover:text-emerald-600 transition-colors"
          >
            اليوم
          </button>

          <button 
            onClick={nextMonth}
            className="p-1.5 sm:p-2 hover:bg-white hover:shadow-sm rounded-md sm:rounded-lg transition-all text-gray-600"
            title="الشهر التالي"
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          <div className="w-px h-4 sm:h-6 bg-gray-300 mx-0.5 sm:mx-1"></div>

          <button 
            onClick={() => { refresh(); refetchSessions?.(); }}
            className={`p-1.5 sm:p-2 hover:bg-white hover:shadow-sm rounded-md sm:rounded-lg transition-all text-gray-600 ${isLoading ? 'animate-spin' : ''}`}
            title="تحديث البيانات"
          >
            <RefreshCw className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="linear-progress-container h-1 w-full bg-emerald-100 overflow-hidden rounded-full font-sans">
             <div className="h-full bg-emerald-500 animate-slide-in-right w-full origin-right"></div>
        </div>
      )}

      {/* الجدول الشهري */}
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl border border-gray-200 overflow-hidden min-h-[400px] sm:min-h-[500px] md:min-h-[600px] flex flex-col">
        {/* Days Header */}
        <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50/50">
          {WEEK_DAYS.map((day) => (
            <div key={day} className="py-2 sm:py-3 md:py-4 text-center text-xs sm:text-sm font-bold text-gray-600">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 flex-1 auto-rows-fr bg-gray-200 gap-px">
          {calendarDays.map(( dayInfo, index) => {
            const sessionsForDay = getDailySessions(dayInfo.date);
            const isToday = dayInfo.date.isSame(dayjs(), 'day');
            const hasSessions = sessionsForDay.length > 0;
            
            return (
              <div 
                key={index}
                onClick={() => hasSessions && openDayModal(dayInfo.date)} 
                className={`
                   min-h-[80px] sm:min-h-[100px] md:min-h-[120px] lg:min-h-[140px] bg-white p-2 sm:p-3 md:p-4 relative transition-all flex flex-col
                   ${!dayInfo.isCurrentMonth ? 'bg-gray-50/50 opacity-60' : ''}
                   ${isToday ? 'bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-100 ring-2 ring-emerald-400 shadow-lg' : ''}
                   ${hasSessions && dayInfo.isCurrentMonth ? 'cursor-pointer hover:shadow-xl hover:ring-2 hover:ring-emerald-300 hover:z-10 hover:scale-105' : ''}
                `}
              >
                {/* Day Header */}
                <div className="flex justify-between items-center mb-2">
                    <span className={`
                        w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 flex items-center justify-center rounded-full text-xs sm:text-sm md:text-base font-bold transition-all
                        ${isToday ? 'bg-emerald-600 text-white shadow-lg ring-2 ring-emerald-300 ring-offset-2 animate-pulse' : 
                          !dayInfo.isCurrentMonth ? 'text-gray-400' : 'text-gray-700 bg-gray-100'}
                    `}>
                        {dayInfo.date.format('D')}
                    </span>
                    
                    {dayInfo.isCurrentMonth && hasSessions && (
                        <div className="flex flex-col items-end gap-1">
                          <span className="flex items-center gap-1 text-[10px] sm:text-xs bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-2 py-1 rounded-full font-bold shadow-md">
                            <span>{sessionsForDay.length}</span>
                            <span className="hidden sm:inline">موعد</span>
                          </span>
                          <span className="text-[9px] text-emerald-600 font-medium">اضغط للتفاصيل</span>
                        </div>
                    )}
                </div>

                {/* Session Indicators - عرض مبسط جداً */}
                {dayInfo.isCurrentMonth && hasSessions && (
                  <div className="flex-1 flex flex-col justify-center items-center gap-2">
                    <div className="flex flex-wrap gap-1.5 justify-center">
                      {sessionsForDay.slice(0, 3).map((session) => (
                        <div 
                          key={session._id}
                          className={`
                            w-2 h-2 rounded-full shadow-md
                            ${session.sessionType === 'hifz' ? 'bg-blue-500' : 
                              session.sessionType === 'murajaah' ? 'bg-amber-500' : 
                              'bg-purple-500'}
                          `}
                          title={session.groupName || session.note}
                        />
                      ))}
                      {sessionsForDay.length > 3 && (
                        <span className="text-[9px] text-gray-500 font-bold">+{sessionsForDay.length - 3}</span>
                      )}
                    </div>
                    
                    {/* أيقونة تشير للضغط */}
                    <div className="text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity">
                      <CalendarIcon className="w-5 h-5 animate-bounce" />
                    </div>
                  </div>
                )}

                {/* Empty State */}
                {dayInfo.isCurrentMonth && !hasSessions && (
                  <div className="flex-1 flex items-center justify-center">
                    <span className="text-xs text-gray-300">-</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
