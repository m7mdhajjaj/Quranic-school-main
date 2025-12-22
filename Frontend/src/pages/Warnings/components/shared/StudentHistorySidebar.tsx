// ============================================================================
// StudentHistorySidebar - عرض الطلاب المفصولين في سايدبار محسّن
// ============================================================================

import React from 'react';
import { X, AlertTriangle, UserX, CheckCircle, ArrowRight } from 'lucide-react';
import { useDisableBodyScroll } from '@/hooks/useDisableBodyScroll';
import { useStudentHistory } from '../../hooks/useStudentHistory';
import { getEventLabel, getEventColor, getEventIconColor } from '../../types/Constans';
import type { StudentHistorySidebarProps, StudentEventType } from '../../types/warnings';
import Avatar from '@/components/Avatar/Avatar';

// ✅ Event Icons Map
const EVENT_ICONS: Record<StudentEventType, React.ReactNode> = {
  WARNING: <AlertTriangle className="w-5 h-5" />,
  WARNING_ESCALATION: <AlertTriangle className="w-5 h-5" />,
  WARNING_REMOVAL: <CheckCircle className="w-5 h-5" />,
  SUSPENSION: <UserX className="w-5 h-5" />,
  EXPULSION: <UserX className="w-5 h-5" />,
  RESTORATION: <CheckCircle className="w-5 h-5" />,
};

export const StudentHistorySidebar: React.FC<StudentHistorySidebarProps> = React.memo(({
  isOpen,
  onClose,
  groupId,
}) => {
  useDisableBodyScroll(isOpen);
  
  // ✅ Custom hook لإدارة البيانات والمنطق
  const {
    selectedStudentId,
    selectedStudentName,
    expelledStudents,
    history,
    loading,
    loadingExpelled,
    isExpelled,
    handleStudentSelect,
    handleBackToList,
    formatDate,
  } = useStudentHistory(isOpen, groupId);

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 z-[9997] ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-full sm:w-[500px] bg-white shadow-2xl transition-transform duration-300 ease-in-out z-[9998] overflow-hidden ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        dir="rtl"
      >
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-red-500 to-rose-600 text-white p-5 shadow-lg z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              {selectedStudentId && expelledStudents.length > 0 ? (
                <button
                  onClick={handleBackToList}
                  className="flex items-center gap-2 bg-white text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105 shadow-md font-semibold"
                  aria-label="رجوع للقائمة"
                >
                  <ArrowRight className="w-4 h-4" />
                  <span>رجوع</span>
                </button>
              ) : (
                <UserX className="w-6 h-6" />
              )}
              <div className="flex-1">
                <h2 className="text-lg font-bold">
                  {selectedStudentId ? 'تاريخ الطالب' : 'الطلاب المفصولين'}
                </h2>
                {selectedStudentName && (
                  <p className="text-white/90 text-sm mt-0.5">
                    {selectedStudentName}
                    {isExpelled && (
                      <span className="mr-2 text-xs bg-white/20 px-2 py-0.5 rounded">مفصول</span>
                    )}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              aria-label="إغلاق"
              className="p-2 hover:bg-white/20 rounded-lg transition-colors duration-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto h-[calc(100vh-100px)]">
          {!selectedStudentId && loadingExpelled ? (
            // ⚡ Skeleton Loading
            <div className="space-y-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3 w-1/2 bg-gray-200 rounded animate-pulse" />
                      <div className="h-2.5 w-1/3 bg-gray-200 rounded animate-pulse" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : !selectedStudentId && expelledStudents.length > 0 ? (
            // ✅ Students List
            <div className="space-y-2">
              <p className="text-gray-500 text-sm mb-3">اختر طالباً لعرض تاريخه</p>
              {expelledStudents.map((student) => (
                <button
                  key={student._id}
                  onClick={() => handleStudentSelect(student._id, `${student.firstName} ${student.lastName}`)}
                  className="w-full p-3 bg-white border border-red-200 rounded-lg hover:border-red-400 hover:shadow-md hover:bg-red-50/30 transition-all duration-200 text-right group"
                >
                  <div className="flex items-center gap-3">
                    <Avatar
                      user={student}
                      size="md"
                      showStatus={false}
                      className="ring-1 ring-red-200 group-hover:ring-red-400 transition-all rounded-full"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate group-hover:text-red-700 transition-colors">
                        {student.firstName} {student.lastName}
                      </p>
                      <span className="text-xs text-red-600 flex items-center gap-1 mt-0.5">
                        <UserX className="w-3 h-3" />
                        طالب مفصول
                      </span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-red-600 transition-colors -scale-x-100" />
                  </div>
                </button>
              ))}
            </div>
          ) : !selectedStudentId && expelledStudents.length === 0 ? (
            // Empty State
            <div className="text-center py-16 text-gray-400">
              <UserX className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p className="text-base">لا يوجد طلاب مفصولين في هذه الحلقة</p>
            </div>
          ) : loading ? (
            // ⚡ Loading Spinner
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-2 border-red-600 border-t-transparent"></div>
            </div>
          ) : history.length === 0 ? (
            // Empty History
            <div className="text-center py-12 text-gray-400">
              <AlertTriangle className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>لا يوجد تاريخ للطالب</p>
            </div>
          ) : (
            // ✅ History Timeline
            <div className="space-y-3">
              {history.map((event) => (
                <div
                  key={event._id}
                  className={`border-r-4 rounded-lg p-3 shadow-sm hover:shadow-md transition-all duration-200 ${
                    getEventColor(event.eventType)
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <div className={`mt-0.5 shrink-0 ${getEventIconColor(event.eventType)}`}>
                      {EVENT_ICONS[event.eventType]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-gray-800 text-sm">
                          {getEventLabel(event.eventType)}
                        </span>
                        <span className="text-xs text-gray-500 shrink-0">
                          {formatDate(event.createdAt)}
                        </span>
                      </div>

                      {/* Event Details */}
                      <div className="space-y-1 text-sm text-gray-700">
                        {event.eventType === 'WARNING' && event.warningLevel && (
                          <p className="text-xs">
                            <span className="font-medium">النوع:</span>{' '}
                            {event.warningLevel === 'first' && 'إنذار أول'}
                            {event.warningLevel === 'second' && 'إنذار ثاني'}
                            {event.warningLevel === 'third' && 'إنذار ثالث'}
                          </p>
                        )}

                        {event.groupName && (
                          <p className="text-xs">
                            <span className="font-medium">الحلقة:</span> {event.groupName}
                          </p>
                        )}

                        {event.teacherName && (
                          <p className="text-xs">
                            <span className="font-medium">المعلم:</span> {event.teacherName}
                          </p>
                        )}

                        {event.reason && (
                          <p className="mt-1.5 p-2 bg-white/60 rounded text-xs">
                            <span className="font-medium">السبب:</span> {event.reason}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
});

StudentHistorySidebar.displayName = 'StudentHistorySidebar';
