// ============================================================================
// types/suspension.ts - Suspension & Warning Types
// ============================================================================

export type WarningType = 'warning' | 'first' | 'second' | 'third' | 'expulsion';
export type SuspensionType = 'temporary' | 'permanent' | 'none';

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

export interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalMilliseconds: number;
}

export interface Penalties {
  suspensionDays: number;
  activitiesBanMonths: number;
  permanentActivitiesBan: boolean;
  permanentExpulsion: boolean;
}

export interface Warning {
  _id: string;
  studentId: Student | string;
  teacherId: Teacher | string;
  groupId: Group | string;
  type: WarningType;
  suspensionType: SuspensionType;
  reason: string;
  penalties: Penalties;
  startDate: string;
  endDate: string | null;
  isActive: boolean;
  cancelledEarly: boolean;
  cancelledAt?: string;
  cancelledBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SuspendedStudent {
  _id: string;
  student: Student;
  teacher: Teacher;
  group: Group;
  originalGroup?: string; // الحلقة الأصلية للطالب قبل الفصل
  type: WarningType;
  suspensionType: SuspensionType;
  reason: string;
  startDate: string;
  endDate: string | null;
  countdown: string | null;
  timeRemaining: TimeRemaining | null;
  penalties: Penalties;
  createdAt: string;
}

export interface SuspendedStudentsResponse {
  success: boolean;
  total: number;
  temporary: {
    count: number;
    students: SuspendedStudent[];
  };
  permanent: {
    count: number;
    students: SuspendedStudent[];
  };
  all: SuspendedStudent[];
}

export interface StudentSuspensionStatusResponse {
  success: boolean;
  suspended: boolean;
  suspension?: {
    _id: string;
    student: Student;
    teacher: Teacher;
    group: Group;
    type: WarningType;
    suspensionType: SuspensionType;
    reason: string;
    startDate: string;
    endDate: string | null;
    countdown: string | null;
    timeRemaining: TimeRemaining | null;
    penalties: Penalties;
    createdAt: string;
  };
  message?: string;
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
    expulsion: 'فصل نهائي',
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
    expulsion: 'bg-gray-900 text-white',
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
    expulsion: '#1F2937',
  };
  return colors[type] || '#6B7280';
};

/**
 * حساب الوقت المتبقي بصيغة مقروءة
 */
export const formatTimeRemaining = (timeRemaining: TimeRemaining | null): string => {
  if (!timeRemaining) return 'منتهي';

  const { days, hours, minutes, seconds } = timeRemaining;

  if (days > 0) {
    return `${days}d ${String(hours).padStart(2, '0')}h ${String(minutes).padStart(
      2,
      '0'
    )}m ${String(seconds).padStart(2, '0')}s`;
  }

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(
    2,
    '0'
  )}:${String(seconds).padStart(2, '0')}`;
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
  const hasExpulsion = existingWarnings.some((w) => w.type === 'expulsion');

  if (hasExpulsion) {
    return { canGive: false, reason: 'الطالب مفصول بشكل نهائي' };
  }

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

    case 'expulsion':
      if (!hasFirst || !hasSecond || !hasThird) {
        return {
          canGive: false,
          reason: 'يجب إعطاء الإنذارات الثلاثة قبل الفصل النهائي',
        };
      }
      return { canGive: true };

    default:
      return { canGive: false, reason: 'نوع إنذار غير صحيح' };
  }
};

/**
 * الحصول على وصف فترة الفصل
 */
export const getSuspensionDuration = (type: WarningType): string => {
  const durations: Record<WarningType, string> = {
    warning: 'لا يوجد فصل',
    first: '3 أيام',
    second: '7 أيام (أسبوع)',
    third: '30 يوم (شهر)',
    expulsion: 'دائم',
  };
  return durations[type] || 'غير محدد';
};
