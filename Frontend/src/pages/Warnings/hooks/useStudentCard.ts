// ============================================================================
// useStudentCard Hook - منطق بطاقة الطالب
// ============================================================================

import { useState, useMemo, useCallback, useEffect } from 'react';
import type { Student, WarningType } from '../types/warnings';

// ثوابت خارج الـ Hook لتجنب إعادة الإنشاء
const WARNING_TYPES: readonly WarningType[] = ['warning', 'first', 'second', 'third', 'expulsion'] as const;

const BUTTON_LABELS: Readonly<Record<WarningType, string>> = {
  warning: 'تنبيه',
  first: 'إنذار أول',
  second: 'إنذار ثاني',
  third: 'إنذار ثالث',
  expulsion: 'فصل',
};

const BUTTON_STYLES: Readonly<Record<WarningType, string>> = {
  warning: 'bg-amber-500 hover:bg-amber-600 text-white',
  first: 'bg-yellow-500 hover:bg-yellow-600 text-white',
  second: 'bg-orange-500 hover:bg-orange-600 text-white',
  third: 'bg-rose-500 hover:bg-rose-600 text-white',
  expulsion: 'bg-red-600 hover:bg-red-700 text-white',
};

const EXISTING_WARNING_LABELS: Readonly<Record<WarningType, string>> = {
  warning: '',
  first: 'الطالب لديه إنذار أول بالفعل',
  second: 'الطالب لديه إنذار ثاني بالفعل',
  third: 'الطالب لديه إنذار ثالث بالفعل',
  expulsion: 'الطالب مفصول بالفعل',
};

interface UseStudentCardProps {
  student: Student;
}

export const useStudentCard = ({ student }: UseStudentCardProps) => {
  // ===== حالات Component =====
  const [hoveredButton, setHoveredButton] = useState<WarningType | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  // ===== أنيميشن دخول البطاقة =====
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  // ===== البيانات المحسوبة =====
  const existingTypes = useMemo(() => student.existingWarningTypes || [], [student.existingWarningTypes]);
  
  const warningsCount = useMemo(() => student.warningsOnlyCount || 0, [student.warningsOnlyCount]);
  
  const warningsList = useMemo(
    () => student.allWarnings?.filter((w) => w.type === 'warning') || [],
    [student.allWarnings]
  );

  const hasAnyWarnings = useMemo(
    () => existingTypes.length > 0 || warningsCount > 0,
    [existingTypes.length, warningsCount]
  );

  // ===== دوال التحقق =====
  const hasWarningType = useCallback(
    (type: WarningType): boolean => {
      if (type === 'warning') return false;
      return existingTypes.includes(type);
    },
    [existingTypes]
  );

  const canGiveWarning = useCallback(
    (type: WarningType): boolean => {
      if (type === 'warning') return true;
      if (hasWarningType(type)) return false;

      switch (type) {
        case 'first':
          return true;
        case 'second':
          return existingTypes.includes('first');
        case 'third':
          return existingTypes.includes('first') && existingTypes.includes('second');
        case 'expulsion':
          return (
            existingTypes.includes('first') &&
            existingTypes.includes('second') &&
            existingTypes.includes('third')
          );
        default:
          return false;
      }
    },
    [existingTypes, hasWarningType]
  );

  const getDisabledTooltip = useCallback(
    (type: WarningType): string => {
      if (type === 'warning') return '';

      if (hasWarningType(type)) {
        return EXISTING_WARNING_LABELS[type];
      }

      if (type === 'second' && !existingTypes.includes('first')) {
        return 'يجب إعطاء الإنذار الأول أولاً';
      }

      if (type === 'third') {
        if (!existingTypes.includes('first')) {
          return 'يجب إعطاء الإنذار الأول أولاً';
        }
        if (!existingTypes.includes('second')) {
          return 'يجب إعطاء الإنذار الثاني أولاً';
        }
      }

      if (type === 'expulsion') {
        const missingWarnings = !existingTypes.includes('first') || 
                               !existingTypes.includes('second') || 
                               !existingTypes.includes('third');
        if (missingWarnings) {
          return 'يجب إعطاء الإنذارات الثلاثة أولاً';
        }
      }

      return '';
    },
    [existingTypes, hasWarningType]
  );

  // ===== Event Handlers =====
  const handleMouseEnter = useCallback((type: WarningType) => {
    setHoveredButton(type);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setHoveredButton(null);
  }, []);

  return {
    // States
    hoveredButton,
    isVisible,
    
    // Data
    warningTypes: WARNING_TYPES,
    buttonLabels: BUTTON_LABELS,
    buttonStyles: BUTTON_STYLES,
    existingTypes,
    warningsCount,
    warningsList,
    hasAnyWarnings,
    
    // Functions
    hasWarningType,
    canGiveWarning,
    getDisabledTooltip,
    handleMouseEnter,
    handleMouseLeave,
  };
};
