// ============================================================================
// StudentHistorySidebar - عرض تاريخ الطالب (History) في سايدبار
// ============================================================================

import React, { useEffect, useState } from 'react';
import { X, AlertTriangle, UserX, Users, CheckCircle, ArrowRight } from 'lucide-react';
import { getStudentHistory } from '@/Api/studentApi';
import { getExpelledStudentsFromGroup } from '@/Api/warningApi';
import type { StudentHistoryEvent } from '@/types/studentHistory';
import { useDisableBodyScroll } from '@/hooks/useDisableBodyScroll';
import Avatar from '@/components/Avatar/Avatar';
import { Badge } from '@/components/UI/Badge';

interface StudentHistorySidebarProps {
  isOpen: boolean;
  onClose: () => void;
  studentId?: string;
  studentName?: string;
  students?: Array<{ _id: string; firstName: string; lastName: string }>;
  groupId?: string; // لجلب المفصولين من الباك اند
}

const EVENT_ICONS = {
  WARNING: <AlertTriangle className="w-5 h-5 text-orange-600" />,
  WARNING_ESCALATION: <AlertTriangle className="w-5 h-5 text-red-600" />,
  WARNING_REMOVAL: <CheckCircle className="w-5 h-5 text-green-600" />,
  SUSPENSION: <UserX className="w-5 h-5 text-orange-600" />,
  EXPULSION: <UserX className="w-5 h-5 text-red-600" />,
  RESTORATION: <CheckCircle className="w-5 h-5 text-emerald-600" />,
};

const EVENT_LABELS = {
  WARNING: 'إنذار',
  WARNING_ESCALATION: 'تصعيد إنذار',
  WARNING_REMOVAL: 'حذف إنذار',
  SUSPENSION: 'تعليق',
  EXPULSION: 'فصل',
  RESTORATION: 'استعادة',
};

const EVENT_COLORS = {
  WARNING: 'bg-orange-50 border-orange-200',
  WARNING_ESCALATION: 'bg-red-50 border-red-200',
  WARNING_REMOVAL: 'bg-green-50 border-green-200',
  SUSPENSION: 'bg-orange-50 border-orange-200',
  EXPULSION: 'bg-red-50 border-red-200',
  RESTORATION: 'bg-emerald-50 border-emerald-200',
};

export const StudentHistorySidebar: React.FC<StudentHistorySidebarProps> = ({
  isOpen,
  onClose,
  studentId: initialStudentId,
  studentName: initialStudentName,
  students = [],
  groupId,
}) => {
  // تعطيل scroll الصفحة عند فتح الـ sidebar
  useDisableBodyScroll(isOpen);
  
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(initialStudentId || null);
  const [selectedStudentName, setSelectedStudentName] = useState<string>(initialStudentName || '');
  const [expelledStudents, setExpelledStudents] = useState<Array<{ _id: string; firstName: string; lastName: string; gender?: string; avatar?: any }>>([]);
  const [history, setHistory] = useState<StudentHistoryEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingExpelled, setLoadingExpelled] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // جلب الطلاب المفصولين من الباك اند
  useEffect(() => {
    if (isOpen && groupId && !students?.length) {
      fetchExpelledStudents();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, groupId]);

  useEffect(() => {
    if (isOpen && selectedStudentId) {
      fetchHistory();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, selectedStudentId]);

  const fetchExpelledStudents = async () => {
    if (!groupId) return;
    
    try {
      setLoadingExpelled(true);
      const data = await getExpelledStudentsFromGroup(groupId);
      setExpelledStudents(data.expelledStudents || []);
    } catch (err) {
      console.error('Error fetching expelled students:', err);
      setExpelledStudents([]);
    } finally {
      setLoadingExpelled(false);
    }
  };

  const handleStudentSelect = (studentId: string, studentName: string) => {
    setSelectedStudentId(studentId);
    setSelectedStudentName(studentName);
  };

  const handleBackToList = () => {
    setSelectedStudentId(null);
    setSelectedStudentName('');
    setHistory([]);
  };

  const fetchHistory = async () => {
    if (!selectedStudentId) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await getStudentHistory(selectedStudentId, { limit: 50 });
      setHistory(data.history || []);
    } catch (err) {
      console.error('Error fetching student history:', err);
      setError('فشل تحميل التاريخ');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isExpelled = history.some(
    (event) => event.eventType === 'EXPULSION' && !history.some(
      (e) => e.eventType === 'RESTORATION' && new Date(e.createdAt) > new Date(event.createdAt)
    )
  );

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 z-[90] ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-full sm:w-[600px] bg-white shadow-2xl transition-transform duration-300 ease-in-out z-[100] ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        dir="rtl"
      >
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-emerald-500 to-teal-600 text-white p-6 shadow-lg z-10">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3 flex-1">
              {selectedStudentId && (students.length > 0 || expelledStudents.length > 0) ? (
                <button
                  onClick={handleBackToList}
                  className="flex items-center gap-2 bg-white text-emerald-600 hover:bg-emerald-50 px-5 py-2.5 rounded-xl transition-all duration-200 hover:scale-105 shadow-lg font-bold"
                  aria-label="رجوع للقائمة"
                >
                  <ArrowRight className="w-5 h-5" />
                  <span>رجوع للقائمة</span>
                </button>
              ) : (
                <UserX className="w-7 h-7" />
              )}
              <div className="flex-1">
                <h2 className="text-xl font-bold">
                  {selectedStudentId ? 'تاريخ الطالب المفصول' : 'الطلاب المفصولين'}
                </h2>
                {selectedStudentName && (
                  <p className="text-red-100 text-sm mt-1 flex items-center gap-2">
                    <span>{selectedStudentName}</span>
                    {isExpelled && (
                      <Badge variant="danger" size="sm" className="bg-red-500/30 border-red-300 text-white">
                        مفصول
                      </Badge>
                    )}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              aria-label="إغلاق"
              className="p-2 hover:bg-white/20 rounded-full transition-colors duration-200 shrink-0"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto h-[calc(100vh-180px)]">
          {!selectedStudentId && loadingExpelled ? (
            // Skeleton Loading
            <div className="space-y-3 animate-fade-in">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="bg-white rounded-lg p-4 border-2 border-gray-100 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse" />
                      <div className="h-3 w-1/3 bg-gray-200 rounded animate-pulse" />
                    </div>
                    <div className="w-5 h-5 bg-gray-200 rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : !selectedStudentId && (students.length > 0 || expelledStudents.length > 0) ? (
            // قائمة الطلاب المفصولين
            <div className="space-y-3 animate-fade-in">
              <p className="text-gray-600 text-sm mb-4">اختر طالباً مفصولاً لعرض تاريخه</p>
              {(students.length > 0 ? students : expelledStudents).map((student) => (
                <button
                  key={student._id}
                  onClick={() => handleStudentSelect(student._id, `${student.firstName} ${student.lastName}`)}
                  className="w-full p-4 bg-white border-2 border-red-200 rounded-xl hover:border-red-400 hover:shadow-xl hover:bg-red-50/50 transition-all duration-200 text-right group animate-fade-in"
                >
                  <div className="flex items-center gap-4">
                    <Avatar
                      user={{
                        _id: student._id,
                        firstName: student.firstName,
                        lastName: student.lastName,
                        gender: (student as any).gender,
                        avatar: (student as any).avatar,
                      }}
                      size="lg"
                      showStatus={true}
                      statusSize="sm"
                      className="shrink-0 ring-2 ring-red-200 group-hover:ring-red-400 transition-all duration-200 rounded-full"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 truncate group-hover:text-red-700 transition-colors text-lg">
                        {student.firstName} {student.lastName}
                      </p>
                      <div className="flex flex-col gap-1 mt-1">
                        <Badge variant="danger" size="sm" icon={<UserX className="w-3 h-3" />}>
                          طالب مفصول
                        </Badge>
                        {(student as any).expulsionDate && (
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <span>📅</span>
                            {new Date((student as any).expulsionDate).toLocaleDateString('ar-EG')}
                          </span>
                        )}
                      </div>
                    </div>
                    <ArrowRight className="w-6 h-6 text-red-500 rotate-180 group-hover:-translate-x-2 transition-transform shrink-0" />
                  </div>
                </button>
              ))}
            </div>
          ) : !selectedStudentId && expelledStudents.length === 0 && !loadingExpelled ? (
            // Empty State
            <div className="text-center py-12 animate-fade-in">
              <CheckCircle className="w-20 h-20 text-emerald-400 mx-auto mb-4" />
              <p className="text-gray-800 font-bold text-lg">لا يوجد طلاب مفصولين 🎉</p>
              <p className="text-gray-500 text-sm mt-2">جميع الطلاب نشطون في الحلقة</p>
            </div>
          ) : loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <p className="text-gray-600">{error}</p>
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-12">
              <UserX className="w-16 h-16 text-emerald-300 mx-auto mb-4" />
              <p className="text-gray-600">لا يوجد تاريخ للطالب المفصول</p>
            </div>
          ) : (
            <div className="space-y-4">
              {history.map((event) => (
                <div
                  key={event._id}
                  className={`border-r-4 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow duration-200 ${
                    EVENT_COLORS[event.eventType]
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-1">{EVENT_ICONS[event.eventType]}</div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-gray-800">
                          {EVENT_LABELS[event.eventType]}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatDate(event.createdAt)}
                        </span>
                      </div>

                      {/* Event Details */}
                      <div className="space-y-1 text-sm text-gray-700">
                        {event.eventType === 'WARNING' && event.warningLevel && (
                          <p>
                            <span className="font-semibold">نوع الإنذار:</span>{' '}
                            {event.warningLevel === 'first' && 'إنذار أول'}
                            {event.warningLevel === 'second' && 'إنذار ثاني'}
                            {event.warningLevel === 'third' && 'إنذار ثالث (فصل)'}
                          </p>
                        )}

                        {event.groupName && (
                          <p>
                            <span className="font-semibold">الحلقة:</span>{' '}
                            {event.groupName}
                          </p>
                        )}

                        {event.teacherName && (
                          <p>
                            <span className="font-semibold">المعلم:</span>{' '}
                            {event.teacherName}
                          </p>
                        )}

                        {event.reason && (
                          <p className="mt-2 p-2 bg-white/50 rounded">
                            <span className="font-semibold">السبب:</span>{' '}
                            {event.reason}
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
};
