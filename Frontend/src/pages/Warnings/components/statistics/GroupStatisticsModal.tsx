// ============================================================================
// GroupStatisticsModal - نافذة إحصائيات الحلقة
// ============================================================================

import React, { useMemo } from 'react';
import { X, Users, AlertTriangle, TrendingUp, ShieldAlert, AlertOctagon, Ban } from 'lucide-react';
import { 
  getWarningLabel, 
  getWarningColorClasses, 
  MEDAL_COLORS, 
  WARNING_TYPE_KEYS 
} from '../../types/Constans';
import type { GroupStatisticsModalProps } from '../../types/warnings';
import { useDisableBodyScroll } from '@/hooks/useDisableBodyScroll';

// ✅ Icon mapping
const WARNING_ICONS = {
  warning: <AlertTriangle className="w-5 h-5" />,
  first: <ShieldAlert className="w-5 h-5" />,
  second: <AlertOctagon className="w-5 h-5" />,
  third: <Ban className="w-5 h-5" />,
} as const;

export const GroupStatisticsModal: React.FC<GroupStatisticsModalProps> = React.memo(({
  isOpen,
  onClose,
  statistics,
  loading = false,
}) => {
  // ✅ تعطيل سكرول الصفحة الخلفية عند فتح المودال
  useDisableBodyScroll(isOpen);

  // ✅ Memoize check for top students
  const hasTopStudents = useMemo(() => 
    statistics?.topStudents && statistics.topStudents.length > 0,
    [statistics?.topStudents]
  );

  // ✅ Memoize check for students details
  const hasStudentsDetails = useMemo(() => 
    statistics?.studentsDetails && statistics.studentsDetails.length > 0,
    [statistics?.studentsDetails]
  );

  if (!isOpen) return null;
  
  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-fade-in">
        <div className="bg-white rounded-[2rem] shadow-2xl border-4 border-emerald-500/20 p-8">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-emerald-500 border-t-transparent"></div>
            <p className="text-gray-700 font-medium">جاري تحميل الإحصائيات...</p>
          </div>
        </div>
      </div>
    );
  }
  
  if (!statistics) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-[2rem] shadow-2xl border-4 border-emerald-500/20 max-w-[95vw] w-full max-h-[90vh] overflow-auto scrollbar-hide animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
        dir="rtl"
      >
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-6 rounded-t-[2rem] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">إحصائيات الحلقة</h2>
              <p className="text-emerald-100 text-sm">{statistics.groupName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            title="إغلاق"
            aria-label="إغلاق النافذة"
            className="p-2 hover:bg-white/20 rounded-xl transition-colors duration-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 bg-emerald-50">
          {/* أكثر الطلاب تنبيهات */}
          {hasTopStudents && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <div className="p-2 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-lg">
                  <AlertTriangle className="w-4 h-4 text-white" />
                </div>
                الطلاب الأكثر تنبيهات
              </h3>
              <div className="space-y-3">
                {statistics.topStudents.map((student, index) => {
                  const medalColor = MEDAL_COLORS[index] || 'from-gray-400 to-gray-500';
                  return (
                    <div
                      key={`${student.name}-${index}`}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-full bg-gradient-to-br ${medalColor} flex items-center justify-center text-white font-bold text-sm shadow-md`}
                        >
                          {index + 1}
                        </div>
                        <span className="font-medium text-gray-800">
                          {student.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-teal-600">
                          {student.warningsCount}
                        </span>
                        <span className="text-xs text-gray-500">تنبيه</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* توزيع التنبيهات */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg">
                <TrendingUp className="w-4 h-4 text-white" />
              </div>
              توزيع التنبيهات حسب النوع
            </h3>
            <div className="space-y-4">
              {WARNING_TYPE_KEYS.map((type) => {
                  const count = statistics.warningsByType[type];
                  const percentage =
                    statistics.totalWarnings > 0
                      ? (count / statistics.totalWarnings) * 100
                      : 0;
                  const color = getWarningColorClasses(type);

                  return (
                    <div key={type} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">
                            {WARNING_ICONS[type as keyof typeof WARNING_ICONS]}
                          </span>
                          <span className="text-sm font-medium text-gray-700">
                            {getWarningLabel(type)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-bold ${color.text}`}>
                            {count}
                          </span>
                          <span className="text-xs text-gray-500">
                            ({Math.round(percentage)}%)
                          </span>
                        </div>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${color.bg} rounded-full transition-all duration-500`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          </div>

          {/* تفاصيل الطلاب - جدول إحصائي */}
          {hasStudentsDetails && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-4">
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    تفاصيل الطلاب والإنذارات
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-emerald-50">
                      <tr>
                        <th className="text-right p-4 text-sm font-bold text-gray-700 border-b border-gray-200">
                          #
                        </th>
                        <th className="text-right p-4 text-sm font-bold text-gray-700 border-b border-gray-200">
                          اسم الطالب
                        </th>
                        <th className="text-center p-4 text-sm font-bold text-gray-700 border-b border-gray-200">
                          تنبيهات
                        </th>
                        <th className="text-center p-4 text-sm font-bold text-gray-700 border-b border-gray-200">
                          إنذار أول
                        </th>
                        <th className="text-center p-4 text-sm font-bold text-gray-700 border-b border-gray-200">
                          إنذار ثاني
                        </th>
                        <th className="text-center p-4 text-sm font-bold text-gray-700 border-b border-gray-200">
                          إنذار ثالث
                        </th>
                        <th className="text-center p-4 text-sm font-bold text-gray-700 border-b border-gray-200">
                          فصل
                        </th>
                        <th className="text-center p-4 text-sm font-bold text-gray-700 border-b border-gray-200">
                          المجموع
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {statistics.studentsDetails!.map((student, index) => (
                        <tr
                          key={student._id}
                          className="hover:bg-emerald-50/50 transition-colors"
                        >
                          <td className="p-4 text-sm text-gray-600 border-b border-gray-100">
                            {index + 1}
                          </td>
                          <td className="p-4 text-sm font-medium text-gray-800 border-b border-gray-100">
                            {student.name}
                          </td>
                          <td className="p-4 text-center border-b border-gray-100">
                            <span
                              className={`inline-flex items-center justify-center w-8 h-8 rounded-lg font-bold text-sm ${
                                student.warningsOnlyCount > 0
                                  ? 'bg-amber-100 text-amber-700'
                                  : 'bg-gray-100 text-gray-400'
                              }`}
                            >
                              {student.warningsOnlyCount || 0}
                            </span>
                          </td>
                          <td className="p-4 text-center border-b border-gray-100">
                            <span
                              className={`inline-flex items-center justify-center w-8 h-8 rounded-lg font-bold text-sm ${
                                student.existingWarningTypes?.includes('first')
                                  ? 'bg-yellow-100 text-yellow-700'
                                  : 'bg-gray-100 text-gray-400'
                              }`}
                            >
                              {student.existingWarningTypes?.includes('first')
                                ? '✓'
                                : '-'}
                            </span>
                          </td>
                          <td className="p-4 text-center border-b border-gray-100">
                            <span
                              className={`inline-flex items-center justify-center w-8 h-8 rounded-lg font-bold text-sm ${
                                student.existingWarningTypes?.includes('second')
                                  ? 'bg-orange-100 text-orange-700'
                                  : 'bg-gray-100 text-gray-400'
                              }`}
                            >
                              {student.existingWarningTypes?.includes('second')
                                ? '✓'
                                : '-'}
                            </span>
                          </td>
                          <td className="p-4 text-center border-b border-gray-100">
                            <span
                              className={`inline-flex items-center justify-center w-8 h-8 rounded-lg font-bold text-sm ${
                                student.existingWarningTypes?.includes('third')
                                  ? 'bg-rose-100 text-rose-700'
                                  : 'bg-gray-100 text-gray-400'
                              }`}
                            >
                              {student.existingWarningTypes?.includes('third')
                                ? '✓'
                                : '-'}
                            </span>
                          </td>
                          <td className="p-4 text-center border-b border-gray-100">
                            <span
                              className={`inline-flex items-center justify-center w-8 h-8 rounded-lg font-bold text-sm ${
                                student.existingWarningTypes?.includes(
                                  'expulsion'
                                )
                                  ? 'bg-red-100 text-red-700'
                                  : 'bg-gray-100 text-gray-400'
                              }`}
                            >
                              {student.existingWarningTypes?.includes(
                                'expulsion'
                              )
                                ? '✓'
                                : '-'}
                            </span>
                          </td>
                          <td className="p-4 text-center border-b border-gray-100">
                            <span className="inline-flex items-center justify-center w-10 h-8 rounded-lg font-bold text-sm bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-sm">
                              {student.warningsCount || 0}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // ✅ Custom comparison for better performance
  return (
    prevProps.isOpen === nextProps.isOpen &&
    prevProps.loading === nextProps.loading &&
    prevProps.statistics?.groupName === nextProps.statistics?.groupName &&
    prevProps.statistics?.totalWarnings === nextProps.statistics?.totalWarnings
  );
});

GroupStatisticsModal.displayName = 'GroupStatisticsModal';
