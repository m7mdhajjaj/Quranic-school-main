// ============================================================================
// types/suspension.ts - Warning Types
// ============================================================================

export type WarningType = 'warning' | 'first' | 'second' | 'third';

export interface Student {
  _id: string;
  firstName: string;
  lastName: string;
  username?: string;
  profileImage?: string;
}

export interface Teacher {
  _id: string;
  firstName: string;
  lastName: string;
}

export interface Group {
  _id: string;
  name: string;
}

export interface Warning {
  _id: string;
  studentId: Student | string;
  teacherId: Teacher | string;
  groupId: Group | string;
  type: WarningType;
  reason: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateWarningRequest {
  studentId: string;
  teacherId: string;
  groupId?: string;
  groupName?: string;
  type: WarningType;
  reason: string;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * الحصول على اسم الإنذار بالعربية
 */
export const getWarningTypeLabel = (type: WarningType): string => {
  const labels: Record<WarningType, string> = {
    warning: 'تنبيه',
    first: 'إنذار أول',
    second: 'إنذار ثاني',
    third: 'إنذار ثالث',
  };
  return labels[type] || type;
};

/**
 * الحصول على فئة CSS للإنذار
 */
export const getWarningTypeBadgeClass = (type: WarningType): string => {
  const badges: Record<WarningType, string> = {
    warning: 'bg-blue-100 text-blue-800',
    first: 'bg-yellow-100 text-yellow-800',
    second: 'bg-orange-100 text-orange-800',
    third: 'bg-red-100 text-red-800',
  };
  return badges[type] || 'bg-gray-100 text-gray-800';
};

/**
 * الحصول على لون الإنذار
 */
export const getWarningTypeColor = (type: WarningType): string => {
  const colors: Record<WarningType, string> = {
    warning: '#3B82F6',
    first: '#F59E0B',
    second: '#F97316',
    third: '#EF4444',
  };
  return colors[type] || '#6B7280';
};

/**
 * التحقق من إمكانية إعطاء إنذار معين
 */
export const canGiveWarning = (
  type: WarningType,
  existingWarnings: Warning[]
): { canGive: boolean; reason?: string } => {
  if (type === 'warning') {
    return { canGive: true };
  }

  const hasFirst = existingWarnings.some((w) => w.type === 'first');
  const hasSecond = existingWarnings.some((w) => w.type === 'second');
  const hasThird = existingWarnings.some((w) => w.type === 'third');

  switch (type) {
    case 'first':
      return hasFirst
        ? { canGive: false, reason: 'الطالب حاصل على الإنذار الأول مسبقاً' }
        : { canGive: true };

    case 'second':
      if (!hasFirst) {
        return { canGive: false, reason: 'يجب إعطاء الإنذار الأول أولاً' };
      }
      return hasSecond
        ? { canGive: false, reason: 'الطالب حاصل على الإنذار الثاني مسبقاً' }
        : { canGive: true };

    case 'third':
      if (!hasFirst || !hasSecond) {
        return { canGive: false, reason: 'يجب إعطاء الإنذار الأول والثاني أولاً' };
      }
      return hasThird
        ? { canGive: false, reason: 'الطالب حاصل على الإنذار الثالث مسبقاً' }
        : { canGive: true };

    default:
      return { canGive: false, reason: 'نوع إنذار غير صحيح' };
  }
};
