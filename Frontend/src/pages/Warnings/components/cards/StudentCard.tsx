// ============================================================================
// StudentCard Component - بطاقة الطالب
// ============================================================================

import React from 'react';
import { AlertTriangle, ShieldAlert, CheckCircle2 } from 'lucide-react';
import type { StudentCardProps } from '../../types/warnings';
import { Card } from '@/components/UI/Card';
import Avatar from '@/components/Avatar/Avatar';
import { Button } from '@/components/UI/Button';
import { WarningBadge } from '../shared/WarningBadge';
import { useStudentCard } from '../../hooks/useStudentCard';

export const StudentCard: React.FC<StudentCardProps> = React.memo(({
  student,
  onGiveWarning,
  onDeleteWarning,
  onDeleteWarningById,
}) => {
  const {
    hoveredButton,
    isVisible,
    warningTypes,
    buttonLabels,
    buttonStyles,
    existingTypes,
    warningsCount,
    warningsList,
    hasAnyWarnings,
    canGiveWarning,
    getDisabledTooltip,
    handleMouseEnter,
    handleMouseLeave,
  } = useStudentCard({ student });

  return (
    <Card 
      className={`group relative overflow-hidden bg-white border border-gray-200 hover:border-blue-300 shadow-sm hover:shadow-lg transition-all duration-300 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`} 
      padding="md"
    >
      {/* خط علوي ملون */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />
      
      <div className="relative z-10 pt-2">
        {/* رأس البطاقة - الاسم والصورة */}
        <div className="flex items-center gap-3 mb-4">
          <div className="relative shrink-0">
            <Avatar 
              user={student} 
              size="md" 
              showStatus={true}
              statusSize="md"
            />
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-gray-800 truncate">
              {student.firstName} {student.lastName}
            </h3>
          </div>
        </div>

        {/* محتوى البطاقة */}
        <div className="space-y-3">
          {/* الإنذارات الرسمية */}
          {existingTypes.length > 0 && (
            <div className="bg-rose-50 rounded-lg p-3 border border-rose-200">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-semibold text-rose-700 flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  الإنذارات الرسمية
                </h4>
                <span className="text-xs font-medium text-rose-600 bg-rose-100 px-2 py-0.5 rounded">
                  {existingTypes.length}
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {existingTypes.includes('first') && (
                  <WarningBadge
                    type="first"
                    showDelete
                    onDelete={() => onDeleteWarning('first')}
                  />
                )}
                {existingTypes.includes('second') && (
                  <WarningBadge
                    type="second"
                    showDelete
                    onDelete={() => onDeleteWarning('second')}
                  />
                )}
                {existingTypes.includes('third') && (
                  <WarningBadge
                    type="third"
                    showDelete
                    onDelete={() => onDeleteWarning('third')}
                  />
                )}
                {existingTypes.includes('expulsion') && (
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
            <div className="bg-amber-50 rounded-lg p-3 border border-amber-200">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-semibold text-amber-700 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  التنبيهات
                </h4>
                <span className="text-xs font-medium text-amber-600 bg-amber-100 px-2 py-0.5 rounded">
                  {warningsCount}
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
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

          {/* حالة السجل النظيف */}
          {!hasAnyWarnings && (
            <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-200">
              <div className="flex items-center gap-2 text-emerald-700">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                <div>
                  <h4 className="text-sm font-bold">سجل نظيف</h4>
                  <p className="text-xs text-emerald-600">لا توجد إنذارات أو تنبيهات</p>
                </div>
              </div>
            </div>
          )}

          {/* أزرار الإجراءات */}
          <div className="grid grid-cols-5 gap-1.5 pt-1">
            {warningTypes.map((type) => {
              const isDisabled = !canGiveWarning(type);
              const tooltip = getDisabledTooltip(type);
              return (
                <div key={type} className="relative group/button">
                  <Button
                    onClick={() => !isDisabled && onGiveWarning(type)}
                    disabled={isDisabled}
                    onMouseEnter={() => handleMouseEnter(type)}
                    onMouseLeave={handleMouseLeave}
                    size="sm"
                    className={`w-full text-[10px] whitespace-nowrap transition-all duration-200 font-medium px-2 py-1.5 ${
                      isDisabled 
                        ? 'opacity-40 cursor-not-allowed bg-gray-100 text-gray-500 border border-gray-200' 
                        : `${buttonStyles[type]} hover:scale-[1.02] active:scale-95`
                    }`}
                  >
                    {buttonLabels[type]}
                  </Button>
                  
                  {/* Tooltip للأزرار المعطلة */}
                  {isDisabled && hoveredButton === type && tooltip && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-[10px] rounded shadow-xl whitespace-nowrap z-50 animate-fadeIn">
                      {tooltip}
                      <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-3 border-transparent border-t-gray-900" />
                    </div>
                  )}
                </div>
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
