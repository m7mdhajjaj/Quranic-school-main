// ============================================================================
// SuspendedStudentsList - قائمة الطلاب المفصولين مع عداد تنازلي
// ============================================================================

import React, { useEffect, useState } from 'react';
import type { SuspendedStudent } from '../../types/suspension';
import { Clock, User, Calendar, AlertTriangle } from 'lucide-react';
import { getWarningTypeLabel, getWarningTypeBadgeClass } from '../../types/suspension';
import { EmptyState } from '@/components/UI/EmptyState';
import { LoadingSpinner } from '@/components/UI/LoadingSpinner';

interface SuspendedStudentsListProps {
  students: SuspendedStudent[];
  loading?: boolean;
  onStudentClick?: (student: SuspendedStudent) => void;
}

export const SuspendedStudentsList: React.FC<SuspendedStudentsListProps> = ({
  students,
  loading,
  onStudentClick,
}) => {
  const [currentTime, setCurrentTime] = useState(Date.now());

  // ⏰ تحديث الوقت كل ثانية لتحديث العداد التنازلي
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // 🕐 حساب العداد التنازلي
  const calculateCountdown = (endDate: string | null): string => {
    if (!endDate) return 'دائم';

    const now = currentTime;
    const end = new Date(endDate).getTime();
    const diff = end - now;

    if (diff <= 0) return 'منتهي';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    if (days > 0) {
      return `${days} يوم ${hours.toString().padStart(2, '0')}:${minutes
        .toString()
        .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <LoadingSpinner size="lg" color="red" text="جاري تحميل الطلاب المفصولين..." />
      </div>
    );
  }

  if (!students || students.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <EmptyState
          icon="✅"
          title="لا يوجد طلاب مفصولين"
          description="جميع الطلاب في حلقاتك نشطون"
        />
      </div>
    );
  }

  // 📊 تصنيف الطلاب حسب نوع الفصل
  const temporarySuspended = students.filter(s => s.suspensionType === 'temporary');
  const permanentSuspended = students.filter(s => s.suspensionType === 'permanent');

  return (
    <div className="space-y-4">
      {/* 🔶 الفصل المؤقت */}
      {temporarySuspended.length > 0 && (
        <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl shadow-md p-4 border border-orange-200">
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-orange-300">
            <Clock className="w-5 h-5 text-orange-600" />
            <h3 className="text-lg font-bold text-gray-800">
              مؤقت ({temporarySuspended.length})
            </h3>
          </div>

          <div className="space-y-2">
            {temporarySuspended.map((suspension) => {
              const student = typeof suspension.student === 'string' 
                ? { _id: suspension.student, firstName: '', lastName: '' }
                : suspension.student;
              
              const group = typeof suspension.group === 'string'
                ? { _id: suspension.group, name: suspension.originalGroup || '' }
                : suspension.group;

              const groupName = group?.name || suspension.originalGroup || 'غير محدد';

              const countdown = calculateCountdown(suspension.endDate);
              const isExpired = countdown === 'منتهي';
              const isPermanent = countdown === 'دائم';

              return (
                <div
                  key={suspension._id}
                  onClick={() => onStudentClick?.(suspension)}
                  className={`
                    relative overflow-hidden rounded-lg border transition-all duration-300
                    ${isExpired 
                      ? 'bg-green-50 border-green-300 hover:border-green-400' 
                      : 'bg-white border-orange-300 hover:border-orange-400'
                    }
                    ${onStudentClick ? 'cursor-pointer hover:shadow-md' : ''}
                    p-3
                  `}
                >
                  {/* شريط علوي ملون */}
                  <div className={`
                    absolute top-0 left-0 right-0 h-0.5
                    ${isExpired ? 'bg-green-500' : 'bg-orange-500'}
                  `} />

                  <div className="space-y-2">
                    {/* معلومات الطالب */}
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-600" />
                      <span className="font-semibold text-gray-900 text-sm">
                        {student.firstName} {student.lastName}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{groupName}</span>
                    </div>

                    {/* نوع الإنذار */}
                    <div className="flex items-center gap-2">
                      <span className={`
                        px-2 py-0.5 rounded-full text-xs font-semibold
                        ${getWarningTypeBadgeClass(suspension.type)}
                      `}>
                        {getWarningTypeLabel(suspension.type)}
                      </span>
                    </div>

                    {/* السبب */}
                    <p className="text-xs text-gray-700 bg-white/70 rounded-md p-2">
                      <span className="font-semibold">السبب:</span> {suspension.reason}
                    </p>

                    {/* العداد التنازلي */}
                    <div className={`
                      ${isExpired 
                        ? 'bg-green-100 border-green-300 text-green-700' 
                        : 'bg-orange-100 border-orange-300 text-orange-700'
                      }
                      border rounded-lg px-3 py-2 text-center
                    `}>
                      <div className="text-xs font-medium mb-0.5">
                        {isExpired ? '✅ انتهى' : '⏱️ متبقي'}
                      </div>
                      <div className={`
                        text-lg font-bold font-mono
                        ${isExpired ? 'text-green-700' : 'text-orange-700'}
                      `}>
                        {countdown}
                      </div>
                      {suspension.endDate && !isExpired && (
                        <div className="text-xs text-gray-600 mt-1">
                          {new Date(suspension.endDate).toLocaleDateString('ar-SA')}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 🔴 الفصل الدائم */}
      {permanentSuspended.length > 0 && (
        <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-xl shadow-md p-4 border border-red-200">
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-red-300">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <h3 className="text-lg font-bold text-gray-800">
              دائم ({permanentSuspended.length})
            </h3>
          </div>

          <div className="space-y-2">
            {permanentSuspended.map((suspension) => {
              const student = typeof suspension.student === 'string' 
                ? { _id: suspension.student, firstName: '', lastName: '' }
                : suspension.student;
              
              const group = typeof suspension.group === 'string'
                ? { _id: suspension.group, name: suspension.originalGroup || '' }
                : suspension.group;

              const groupName = group?.name || suspension.originalGroup || 'غير محدد';

              return (
                <div
                  key={suspension._id}
                  onClick={() => onStudentClick?.(suspension)}
                  className={`
                    relative overflow-hidden rounded-lg border bg-white border-red-300 
                    transition-all duration-300
                    ${onStudentClick ? 'cursor-pointer hover:border-red-400 hover:shadow-md' : ''}
                    p-3
                  `}
                >
                  {/* شريط علوي أحمر */}
                  <div className="absolute top-0 left-0 right-0 h-0.5 bg-red-500" />

                  <div className="space-y-2">
                    {/* معلومات الطالب */}
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-600" />
                      <span className="font-semibold text-gray-900 text-sm">
                        {student.firstName} {student.lastName}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{groupName}</span>
                    </div>

                    {/* نوع الإنذار */}
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-900 text-white">
                        فصل نهائي
                      </span>
                    </div>

                    {/* السبب */}
                    <p className="text-xs text-gray-700 bg-white/70 rounded-md p-2">
                      <span className="font-semibold">السبب:</span> {suspension.reason}
                    </p>

                    {/* علامة دائم */}
                    <div className="bg-red-100 border border-red-300 rounded-lg px-3 py-2 text-center">
                      <div className="text-red-700 font-bold text-sm">
                        ⛔ دائم
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
