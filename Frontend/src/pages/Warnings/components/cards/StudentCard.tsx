// ============================================================================
// StudentCard Component - بطاقة الطالب
// ============================================================================

import type { StudentCardProps, WarningType } from '../../types/warnings';
import { Card } from '@/components/UI/Card';
import Avatar from '@/components/Avatar/Avatar';
import { Button } from '@/components/UI/Button';
import { WarningBadge } from '../shared/WarningBadge';

export const StudentCard: React.FC<StudentCardProps> = ({
  student,
  onGiveWarning,
  onDeleteWarning,
  onDeleteWarningById,
}) => {
  const warningTypes: WarningType[] = [
    'warning',
    'first',
    'second',
    'third',
    'expulsion',
  ];

  // التحقق إذا كان الإنذار موجود
  const hasWarningType = (type: WarningType) => {
    if (type === 'warning') return false; // التنبيه يمكن تكراره
    return student.existingWarningTypes?.includes(type);
  };

  // الحصول على عدد التنبيهات من Backend مباشرة
  const warningsCount = student.warningsOnlyCount || 0;

  // أسماء الأزرار
  const buttonLabels: Record<WarningType, string> = {
    warning: '⚠️ تنبيه',
    first: '🔴 إنذار أول',
    second: '🔴🔴 إنذار ثاني',
    third: '🔴🔴🔴 إنذار ثالث',
    expulsion: '❌ فصل',
  };

  return (
    <Card className="group hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-white to-gray-50/50 border border-gray-100 hover:border-blue-200 relative overflow-hidden" padding="lg">
      {/* Background Animation */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/3 to-purple-500/3 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      
      <div className="flex items-center justify-between flex-wrap gap-4 relative z-10">
        {/* معلومات الطالب */}
        <div className="flex items-center gap-4 flex-1 min-w-[200px]">
          <Avatar 
            user={student} 
            size="lg" 
            showStatus={true}
            statusSize="lg"
          />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <h3 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent group-hover:from-blue-600 group-hover:to-purple-600 transition-all duration-300">
                {student.firstName} {student.lastName}
              </h3>

              {/* عرض الإنذارات الموجودة */}
              {student.existingWarningTypes &&
                student.existingWarningTypes.length > 0 && (
                  <div className="flex gap-1 flex-wrap">
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
                )}
            </div>

            {/* عرض التنبيهات */}
            {warningsCount > 0 && (
              <div className="mt-2">
                <p className="text-xs text-gray-500 mb-1">
                  التنبيهات ({warningsCount}):
                </p>
                <div className="flex flex-wrap gap-1">
                  {student.allWarnings
                    ?.filter((w) => w.type === 'warning')
                    .map((warning, index) => (
                      <div
                        key={warning._id}
                        className="group inline-flex items-center gap-1"
                      >
                        <WarningBadge
                          type="warning"
                          count={index + 1}
                          showDelete
                          onDelete={() => onDeleteWarningById(warning._id)}
                        />
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* أزرار الإنذارات */}
        <div className="flex flex-wrap gap-2">
          {warningTypes.map((type) => {
            const isDisabled = hasWarningType(type);

            return (
              <Button
                key={type}
                onClick={() => !isDisabled && onGiveWarning(type)}
                disabled={isDisabled}
                size="sm"
                className={
                  isDisabled
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:scale-105 transition-transform'
                }
              >
                {buttonLabels[type]}
              </Button>
            );
          })}
        </div>
      </div>
    </Card>
  );
};
