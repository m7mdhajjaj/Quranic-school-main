// ============================================================================
// StudentCard Component - بطاقة الطالب
// ============================================================================

import React, { useMemo, useCallback } from 'react';
import type { StudentCardProps, WarningType } from '../../types/warnings';
import { Card } from '@/components/UI/Card';
import Avatar from '@/components/Avatar/Avatar';
import { Button } from '@/components/UI/Button';
import { WarningBadge } from '../shared/WarningBadge';

export const StudentCard: React.FC<StudentCardProps> = React.memo(({
  student,
  onGiveWarning,
  onDeleteWarning,
  onDeleteWarningById,
}) => {
  // ✅ استخدام useMemo للقيم المحسوبة
  const warningTypes: WarningType[] = useMemo(() => [
    'warning',
    'first',
    'second',
    'third',
    'expulsion',
  ], []);

  // التحقق إذا كان الإنذار موجود - محسّن بـ useCallback
  const hasWarningType = useCallback((type: WarningType) => {
    if (type === 'warning') return false; // التنبيه يمكن تكراره
    return student.existingWarningTypes?.includes(type);
  }, [student.existingWarningTypes]);

  // الحصول على عدد التنبيهات من Backend مباشرة - محسّن بـ useMemo
  const warningsCount = useMemo(() => student.warningsOnlyCount || 0, [student.warningsOnlyCount]);
  
  // ✅ حساب التنبيهات المفلترة مرة واحدة
  const warningsList = useMemo(() => 
    student.allWarnings?.filter((w) => w.type === 'warning') || [],
    [student.allWarnings]
  );
  
  // ✅ حساب حالة الطالب مرة واحدة
  const studentStatus = useMemo(() => {
    if (student.existingWarningTypes && student.existingWarningTypes.length > 0) {
      return { type: 'danger', count: student.existingWarningTypes.length, label: 'إنذار' };
    } else if (warningsCount > 0) {
      return { type: 'warning', count: warningsCount, label: 'تنبيه' };
    }
    return { type: 'success', count: 0, label: 'سجل نظيف' };
  }, [student.existingWarningTypes, warningsCount]);

  // أسماء الأزرار
  const buttonLabels: Record<WarningType, string> = {
    warning: '⚠️ تنبيه',
    first: '🔴 إنذار أول',
    second: '🔴🔴 إنذار ثاني',
    third: '🔴🔴🔴 إنذار ثالث',
    expulsion: '❌ فصل',
  };

  return (
    <Card className="group relative overflow-hidden bg-gradient-to-br from-white to-blue-50/50 border-2 border-transparent hover:border-blue-200 shadow-xl hover:shadow-2xl transition-shadow duration-300 will-change-[box-shadow]" padding="lg">
      {/* خلفية متناسقة */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      
      <div className="relative z-10">
        {/* رأس البطاقة - الاسم والصورة */}
        <div className="flex items-center gap-4 mb-5 pb-5 border-b-2 border-indigo-200">
          <div className="relative shrink-0">
            <Avatar 
              user={student} 
              size="lg" 
              showStatus={true}
              statusSize="lg"
            />
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent group-hover:from-blue-600 group-hover:to-purple-600 transition-all duration-300 mb-1 truncate">
              {student.firstName} {student.lastName}
            </h3>
            <div className="flex items-center gap-2">
              {studentStatus.type === 'danger' ? (
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full">
                  <span className="w-2 h-2 bg-rose-400 rounded-full animate-pulse" />
                  {studentStatus.count} {studentStatus.label}
                </span>
              ) : studentStatus.type === 'warning' ? (
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full">
                  <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                  {studentStatus.count} {studentStatus.label}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                  <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                  {studentStatus.label}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* محتوى البطاقة */}
        <div className="space-y-4">
          {/* الإنذارات الرسمية */}
          {student.existingWarningTypes && student.existingWarningTypes.length > 0 && (
            <div className="bg-rose-50/70 rounded-lg p-4 border-l-3 border-rose-300">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-rose-800 flex items-center gap-2">
                  <span className="flex items-center justify-center w-7 h-7 bg-rose-400 text-white rounded-lg text-xs">
                    🚨
                  </span>
                  الإنذارات الرسمية
                </h4>
                <span className="text-xs font-semibold text-rose-600 bg-rose-100 px-2.5 py-1 rounded-md">
                  {student.existingWarningTypes.length}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {student.existingWarningTypes.includes('first') && (
                  <WarningBadge
                    type="first"
                    showDelete
                    onDelete={() => onDeleteWarning('first')}
                  />
                )}
                {student.existingWarningTypes.includes('second') && (
                  <WarningBadge
                    type="second"
                    showDelete
                    onDelete={() => onDeleteWarning('second')}
                  />
                )}
                {student.existingWarningTypes.includes('third') && (
                  <WarningBadge
                    type="third"
                    showDelete
                    onDelete={() => onDeleteWarning('third')}
                  />
                )}
                {student.existingWarningTypes.includes('expulsion') && (
                  <WarningBadge
                    type="expulsion"
                    showDelete
                    onDelete={() => onDeleteWarning('expulsion')}
                  />
                )}
              </div>
            </div>
          )}

          {/* التنبيهات */}
          {warningsCount > 0 && (
            <div className="bg-amber-50/60 rounded-lg p-4 border-l-3 border-amber-400">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-amber-900 flex items-center gap-2">
                  <span className="flex items-center justify-center w-7 h-7 bg-amber-500 text-white rounded-lg text-xs">
                    ⚠️
                  </span>
                  التنبيهات
                </h4>
                <span className="text-xs font-semibold text-amber-700 bg-amber-100 px-2.5 py-1 rounded-md">
                  {warningsCount}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {warningsList.map((warning, index) => (
                  <WarningBadge
                    key={warning._id}
                    type="warning"
                    count={index + 1}
                    showDelete
                    onDelete={() => onDeleteWarningById(warning._id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* أزرار الإجراءات */}
          <div className="grid grid-cols-5 gap-2 pt-2">
            {warningTypes.map((type) => {
              const isDisabled = hasWarningType(type);
              return (
                <Button
                  key={type}
                  onClick={() => !isDisabled && onGiveWarning(type)}
                  disabled={isDisabled}
                  size="sm"
                  variant={isDisabled ? "ghost" : "default"}
                  className={`text-xs whitespace-nowrap transition-shadow duration-200 ${
                    isDisabled 
                      ? 'opacity-40 cursor-not-allowed' 
                      : 'hover:shadow-md'
                  }`}
                >
                  {buttonLabels[type]}
                </Button>
              );
            })}
          </div>
        </div>
      </div>
    </Card>
  );
}, (prevProps, nextProps) => {
  // ✅ مقارنة مخصصة لتجنب Re-render غير ضروري
  return (
    prevProps.student._id === nextProps.student._id &&
    prevProps.student.warningsOnlyCount === nextProps.student.warningsOnlyCount &&
    prevProps.student.existingWarningTypes?.length === nextProps.student.existingWarningTypes?.length &&
    prevProps.student.allWarnings?.length === nextProps.student.allWarnings?.length &&
    prevProps.student.isActive === nextProps.student.isActive
  );
});
