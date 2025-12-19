// ============================================================================
// StudentFullHistorySidebar - عرض تاريخ الطالب الكامل
// ============================================================================

import React from 'react';
import { X, AlertTriangle, UserX, Users, CheckCircle, Calendar, History } from 'lucide-react';
import { useDisableBodyScroll } from '@/hooks/useDisableBodyScroll';
import { useStudentHistory } from '../hooks/useStudentHistory';
import Avatar from '@/components/Avatar/Avatar';
import { Badge } from '@/components/UI/Badge';
import type { StudentHistoryEvent } from '@/types/studentHistory';

interface StudentFullHistorySidebarProps {
  isOpen: boolean;
  onClose: () => void;
  studentId: string;
  studentName: string;
  student?: {
    firstName?: string;
    lastName?: string;
    gender?: string;
    avatar?: { url?: string; publicId?: string };
  };
}

// ============================================================================
// Constants
// ============================================================================

const EVENT_CONFIG = {
  WARNING: {
    icon: AlertTriangle,
    label: 'إنذار',
    color: 'bg-orange-50 border-orange-200',
    iconColor: 'text-orange-600',
  },
  WARNING_ESCALATION: {
    icon: AlertTriangle,
    label: 'تصعيد إنذار',
    color: 'bg-red-50 border-red-200',
    iconColor: 'text-red-600',
  },
  WARNING_REMOVAL: {
    icon: CheckCircle,
    label: 'حذف إنذار',
    color: 'bg-green-50 border-green-200',
    iconColor: 'text-green-600',
  },
  SUSPENSION: {
    icon: UserX,
    label: 'تعليق',
    color: 'bg-orange-50 border-orange-200',
    iconColor: 'text-orange-600',
  },
  EXPULSION: {
    icon: UserX,
    label: 'فصل',
    color: 'bg-red-50 border-red-200',
    iconColor: 'text-red-600',
  },
  RESTORATION: {
    icon: CheckCircle,
    label: 'استعادة',
    color: 'bg-emerald-50 border-emerald-200',
    iconColor: 'text-emerald-600',
  },
} as const;

const WARNING_LEVELS = {
  warning: { label: 'تنبيه', variant: 'info' as const },
  first: { label: 'إنذار أول', variant: 'info' as const },
  second: { label: 'إنذار ثاني', variant: 'warning' as const },
  third: { label: 'إنذار ثالث', variant: 'danger' as const },
};

const formatDate = (date: string | Date) =>
  new Date(date).toLocaleDateString('ar-SA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

// ============================================================================
// Sub-Components
// ============================================================================

const ExpulsionCard: React.FC<{ expulsion: StudentHistoryEvent }> = ({ expulsion }) => (
  <div className="mb-6 bg-gradient-to-br from-red-50 to-rose-50 border-2 border-red-300 rounded-xl p-5 shadow-lg animate-fade-in">
    <div className="flex items-start gap-4">
      <div className="flex-shrink-0 w-12 h-12 bg-red-500 rounded-full flex items-center justify-center shadow-md">
        <UserX className="w-6 h-6 text-white" />
      </div>
      <div className="flex-1">
        <h3 className="text-xl font-bold text-red-900 mb-2 flex items-center gap-2">
          الطالب مفصول حالياً
          <Badge variant="danger" size="sm">
            فصل نهائي
          </Badge>
        </h3>

        <div className="space-y-3 mt-4">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-red-600" />
            <span className="text-gray-700 font-semibold">تاريخ الفصل:</span>
            <span className="text-gray-900">{formatDate(expulsion.createdAt)}</span>
          </div>

          {expulsion.reason && (
            <div className="bg-white/70 rounded-lg p-3 border border-red-200">
              <p className="text-sm font-semibold text-red-700 mb-1">السبب:</p>
              <p className="text-sm text-gray-800">{expulsion.reason}</p>
            </div>
          )}

          {expulsion.actionBy?.userName && (
            <div className="flex items-center gap-2 text-xs text-gray-600 pt-2 border-t border-red-200">
              <span>تم بواسطة:</span>
              <span className="font-semibold text-gray-800">{expulsion.actionBy.userName}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
);

const EventCard: React.FC<{ event: StudentHistoryEvent; isLast: boolean }> = ({ event, isLast }) => {
  const config = EVENT_CONFIG[event.eventType];
  const Icon = config.icon;

  return (
    <div className="relative pb-8 last:pb-0">
      {!isLast && (
        <div className="absolute right-[22px] top-12 bottom-0 w-0.5 bg-gradient-to-b from-emerald-200 to-gray-200" />
      )}

      <div className="relative flex gap-4 group">
        <div
          className={`flex-shrink-0 w-11 h-11 rounded-full ${config.color} flex items-center justify-center ring-4 ring-white shadow-md z-10 group-hover:scale-110 transition-transform duration-200`}
        >
          <Icon className={`w-5 h-5 ${config.iconColor}`} />
        </div>

        <div className={`flex-1 ${config.color} border-2 rounded-xl p-4 shadow-sm hover:shadow-lg transition-all duration-200`}>
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                {config.label}
                {event.eventType === 'WARNING' && event.warningLevel && (
                  <Badge variant={WARNING_LEVELS[event.warningLevel].variant} size="sm">
                    {WARNING_LEVELS[event.warningLevel].label}
                  </Badge>
                )}
              </h3>
              <p className="text-xs text-gray-500 mt-1">{formatDate(event.createdAt)}</p>
            </div>
          </div>

          {event.reason && (
            <div className="mb-3">
              <p className="text-sm font-semibold text-gray-700 mb-1">السبب:</p>
              <p className="text-sm text-gray-600 bg-white/50 p-2 rounded-lg">{event.reason}</p>
            </div>
          )}

          {event.actionBy?.userName && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                بواسطة: <span className="font-semibold text-gray-700">{event.actionBy.userName}</span>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// Main Component
// ============================================================================

export const StudentFullHistorySidebar: React.FC<StudentFullHistorySidebarProps> = ({
  isOpen,
  onClose,
  studentId,
  studentName,
  student,
}) => {
  useDisableBodyScroll(isOpen);

  const { history, loading, error, isExpelled, lastExpulsion, stats, refetch } = useStudentHistory({
    studentId,
    isOpen,
  });

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 z-40 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      <div
        className={`fixed top-0 left-0 h-full w-full sm:w-[700px] bg-white shadow-2xl transition-transform duration-300 ease-in-out z-[120] ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        dir="rtl"
      >
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-br from-emerald-600 via-teal-500 to-emerald-600 text-white p-6 shadow-lg z-10">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3 flex-1">
              {student && (
                <Avatar
                  user={student}
                  size="lg"
                  showStatus={true}
                  statusSize="sm"
                  className="ring-2 ring-white shadow-lg rounded-full"
                />
              )}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <History className="w-6 h-6" />
                  <h2 className="text-xl font-bold">تاريخ الطالب</h2>
                </div>
                <p className="text-emerald-100 text-sm flex items-center gap-2">
                  <span>{studentName}</span>
                  {isExpelled && (
                    <Badge variant="danger" size="sm" className="bg-red-500/30 border-red-300 text-white">
                      مفصول
                    </Badge>
                  )}
                </p>
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

          {stats.total > 0 && (
            <div className="grid grid-cols-2 gap-2 mt-4">
              {[
                { value: stats.total, label: 'إجمالي الأحداث' },
                { value: stats.warnings, label: 'الإنذارات' },
              ].map((stat, i) => (
                <div key={i} className="bg-white/10 rounded-lg p-2 text-center">
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="text-xs text-emerald-100">{stat.label}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto h-[calc(100vh-220px)]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mb-4" />
              <p className="text-gray-600">جاري تحميل التاريخ...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <p className="text-red-600 font-medium">{error}</p>
              <button
                onClick={refetch}
                className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
              >
                إعادة المحاولة
              </button>
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-20 h-20 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 font-medium text-lg">لا يوجد تاريخ لهذا الطالب</p>
              <p className="text-gray-500 text-sm mt-2">لم يتم تسجيل أي أحداث بعد</p>
            </div>
          ) : (
            <>
              {isExpelled && lastExpulsion && <ExpulsionCard expulsion={lastExpulsion} />}
              <div className="relative">
                {history.map((event, index) => (
                  <EventCard key={event._id || index} event={event} isLast={index === history.length - 1} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};
