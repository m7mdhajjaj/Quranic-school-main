// ============================================================================
// StudentHistorySidebar - عرض الطلاب المفصولين في سايدبار محسّن
// ============================================================================

import React from 'react';
import { X, AlertTriangle, UserX, CheckCircle, ArrowRight } from 'lucide-react';
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
        <div className="sticky top-0 bg-gradient-to-br from-rose-600 via-red-600 to-pink-600 text-white p-6 shadow-xl z-10 border-b-4 border-white/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
              {selectedStudentId && expelledStudents.length > 0 ? (
                <button
                  onClick={handleBackToList}
                  className="flex items-center gap-2.5 bg-white/95 text-red-700 hover:bg-white px-5 py-2.5 rounded-xl transition-all duration-200 hover:scale-105 shadow-lg font-bold backdrop-blur-sm border border-red-200"
                  aria-label="رجوع للقائمة"
                >
                  <ArrowRight className="w-5 h-5" />
                  <span>رجوع</span>
                </button>
              ) : (
                <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm border border-white/30 shadow-lg">
                  <UserX className="w-7 h-7" />
                </div>
              )}
              <div className="flex-1">
                <h2 className="text-xl font-bold drop-shadow-md">
                  {selectedStudentId ? 'تاريخ الطالب' : 'الطلاب المفصولين'}
                </h2>
                {selectedStudentName && (
                  <p className="text-white/95 text-sm mt-1.5 font-medium flex items-center gap-2">
                    <span>{selectedStudentName}</span>
                    {isExpelled && (
                      <span className="text-xs bg-red-500/40 backdrop-blur-sm px-3 py-1 rounded-full border border-white/30 font-bold shadow-sm">
                        مفصول
                      </span>
                    )}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              aria-label="إغلاق"
              className="p-2.5 hover:bg-white/20 rounded-xl transition-all duration-200 hover:scale-110 backdrop-blur-sm border border-white/0 hover:border-white/30"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 pb-6 overflow-y-auto h-[calc(100vh-88px)]">
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
            <div className="space-y-3">
              <div className="bg-gradient-to-r from-red-50 to-rose-50 rounded-xl p-4 border-2 border-red-200 shadow-sm mb-4">
                <p className="text-red-800 font-bold text-sm flex items-center gap-2">
                  <UserX className="w-4 h-4" />
                  اختر طالباً لعرض تاريخه الكامل
                </p>
              </div>
              {expelledStudents.map((student) => (
                <button
                  key={student._id}
                  onClick={() => handleStudentSelect(student._id, `${student.firstName} ${student.lastName}`)}
                  className="w-full p-4 bg-gradient-to-br from-white to-gray-50 border-2 border-red-200 rounded-xl hover:border-red-400 hover:shadow-xl hover:from-red-50 hover:to-rose-50 transition-all duration-300 text-right group transform hover:scale-[1.02]"
                >
                  <div className="flex items-center gap-4">
                    <Avatar
                      user={student}
                      size="lg"
                      showStatus={false}
                      className="ring-2 ring-red-300 group-hover:ring-red-500 transition-all rounded-full shadow-md group-hover:shadow-lg"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 truncate group-hover:text-red-700 transition-colors text-lg mb-1">
                        {student.firstName} {student.lastName}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 text-xs text-red-700 bg-red-100 px-3 py-1 rounded-full font-bold border border-red-300 group-hover:bg-red-200 transition-colors">
                          <UserX className="w-3.5 h-3.5" />
                          طالب مفصول
                        </span>
                      </div>
                    </div>
                    <div className="bg-red-100 group-hover:bg-red-200 p-2.5 rounded-full transition-colors">
                      <ArrowRight className="w-5 h-5 text-red-600 -scale-x-100" />
                    </div>
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
