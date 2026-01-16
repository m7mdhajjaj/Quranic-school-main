// ============================================================================
// Notification Utilities
// ============================================================================
// Helper functions للإشعارات - محدث ليدعم جميع أنواع الإشعارات
// ✅ يستخدم توقيت فلسطين (Asia/Jerusalem) الموحد

import type { DailyMarkAction, NotificationType, NotificationAction, NotificationCategory } from '../types';
import { TIMEZONE } from '@/utils/timezone';

/**
 * أنواع الإشعارات المدعومة - متطابقة مع Backend
 */
export const NOTIFICATION_TYPES = {
  GENERAL: ['general', 'system', 'success', 'alert', 'warning', 'message', 'mention', 'news', 'chat', 'reminder'],
  ACADEMIC: ['grade', 'daily_marks', 'exam', 'attendance', 'quran_progress', 'memorization', 'review', 'test_result', 'student_update', 'timetable'],
  ADMIN: [
    'teacher_added', 'teacher_updated', 'teacher_deleted',
    'student_added', 'student_updated', 'student_deleted',
    'group_assigned', 'group_updated', 'group_deleted', 'group_transferred',
    'secretary_added', 'secretary_updated', 'secretary_deleted',
    'admin_action', 'user_approval', 'role_change', 'system_update',
  ],
  OTHER: ['prayer_time', 'goal', 'achievement', 'points', 'ranking', 'other'],
} as const;

/**
 * تحديد الفئة من النوع
 */
export const getCategoryFromType = (type: NotificationType): NotificationCategory => {
  if (NOTIFICATION_TYPES.ACADEMIC.includes(type as any)) return 'academic';
  if (NOTIFICATION_TYPES.ADMIN.includes(type as any)) return 'admin';
  if (NOTIFICATION_TYPES.OTHER.includes(type as any)) return 'other';
  return 'general';
};

/**
 * الحصول على أيقونة أكثر تفصيلاً للعلامات اليومية
 */
export const getDailyMarkIcon = (action: DailyMarkAction): string => {
  const actionIcons: Record<DailyMarkAction, string> = {
    section_added: '📚',
    section_updated: '✏️',
    section_deleted: '🗑️',
    mark_added: '⭐',
    mark_updated: '📝',
    mark_deleted: '❌',
  };
  return actionIcons[action] || '📊';
};

/**
 * الحصول على نص وصفي للعملية
 */
export const getDailyMarkActionText = (action: DailyMarkAction): string => {
  const actionTexts: Record<DailyMarkAction, string> = {
    section_added: 'إضافة مقطع جديد',
    section_updated: 'تعديل مقطع',
    section_deleted: 'حذف مقطع',
    mark_added: 'إضافة علامة جديدة',
    mark_updated: 'تحديث علامة',
    mark_deleted: 'حذف علامة',
  };
  return actionTexts[action] || 'عملية غير محددة';
};

/**
 * الحصول على نص وصفي لأي عملية (action)
 */
export const getActionText = (action: NotificationAction | string): string => {
  const actionTexts: Record<string, string> = {
    // Section actions
    section_added: 'إضافة مقطع جديد',
    section_updated: 'تعديل مقطع',
    section_deleted: 'حذف مقطع',
    // Mark actions
    mark_added: 'إضافة علامة جديدة',
    mark_updated: 'تحديث علامة',
    mark_deleted: 'حذف علامة',
    // Group actions
    group_assigned: 'تعيين حلقة',
    group_updated: 'تحديث حلقة',
    group_deleted: 'حذف حلقة',
    group_transferred: 'نقل حلقة',
    group_transferred_from: 'نقل حلقة منك',
    group_transferred_to: 'نقل حلقة إليك',
    group_renamed: 'تغيير اسم الحلقة',
    // Student actions
    student_added: 'إضافة طالب',
    student_added_by_admin: 'إضافة طالب بواسطة الإدارة',
    student_added_to_group: 'إضافة للحلقة',
    student_removed: 'إزالة طالب',
    student_removed_by_admin: 'إزالة طالب بواسطة الإدارة',
    student_moved: 'نقل طالب',
    student_moved_out_by_admin: 'نقل طالب من الحلقة',
    student_moved_in_by_admin: 'نقل طالب إلى الحلقة',
    student_group_changed_by_admin: 'تغيير حلقة الطالب',
    // Teacher actions
    teacher_assigned_to_group: 'تعيين معلم للحلقة',
    teacher_removed_from_group: 'إزالة معلم من الحلقة',
    teacher_info_updated: 'تحديث بيانات المعلم',
    // General actions
    created: 'إنشاء',
    updated: 'تحديث',
    deleted: 'حذف',
  };
  return actionTexts[action] || action || 'عملية غير محددة';
};

/**
 * الحصول على أيقونة الإشعار حسب النوع
 */
export const getNotificationIcon = (type: string, data?: any): string => {
  // للعلامات اليومية، نستخدم أيقونة مخصصة حسب العملية
  if (type === 'daily_marks' && data?.action) {
    return getDailyMarkIcon(data.action);
  }
  
  const icons: Record<string, string> = {
    // General
    grade: '🎯',
    message: '💬',
    prayer_time: '🕌',
    attendance: '⚡',
    exam: '📝',
    news: '📰',
    general: '🔔',
    daily_marks: '📊',
    warning: '⚠️',
    system: '⚙️',
    success: '✅',
    alert: '🚨',
    chat: '💬',
    timetable: '📅',
    mention: '💬',
    reminder: '⏰',
    // Academic
    quran_progress: '📖',
    memorization: '📗',
    review: '📘',
    test_result: '📋',
    student_update: '👨‍🎓',
    // Admin - Teacher
    teacher_added: '👨‍🏫',
    teacher_updated: '✏️',
    teacher_deleted: '🗑️',
    // Admin - Student
    student_added: '👨‍🎓',
    student_updated: '✏️',
    student_deleted: '🗑️',
    // Admin - Group
    group_assigned: '📚',
    group_updated: '✏️',
    group_deleted: '🗑️',
    group_transferred: '🔄',
    // Admin - Secretary
    secretary_added: '👤',
    secretary_updated: '✏️',
    secretary_deleted: '🗑️',
    // Admin - New types
    admin_action: '🔧',
    user_approval: '✅',
    role_change: '👥',
    system_update: '🔄',
    // Other
    goal: '🎯',
    achievement: '🏆',
    points: '⭐',
    ranking: '🏅',
    other: '🔔',
  };
  return icons[type] || '🔔';
};

/**
 * الحصول على لون الإشعار حسب النوع
 */
export const getNotificationColor = (type: string): string => {
  const colors: Record<string, string> = {
    // General
    attendance: 'from-yellow-400 to-orange-500',
    grade: 'from-green-400 to-green-600',
    message: 'from-blue-400 to-blue-600',
    prayer_time: 'from-purple-400 to-purple-600',
    exam: 'from-pink-400 to-pink-600',
    news: 'from-cyan-400 to-cyan-600',
    general: 'from-gray-400 to-gray-600',
    daily_marks: 'from-emerald-400 to-emerald-600',
    warning: 'from-red-400 to-red-600',
    system: 'from-slate-400 to-slate-600',
    success: 'from-teal-400 to-teal-600',
    alert: 'from-rose-400 to-rose-600',
    chat: 'from-blue-400 to-blue-600',
    timetable: 'from-indigo-400 to-indigo-600',
    mention: 'from-violet-400 to-violet-600',
    reminder: 'from-amber-400 to-amber-600',
    // Academic
    quran_progress: 'from-green-400 to-green-600',
    memorization: 'from-emerald-400 to-emerald-600',
    review: 'from-teal-400 to-teal-600',
    test_result: 'from-blue-400 to-blue-600',
    student_update: 'from-cyan-400 to-cyan-600',
    // Admin - Teacher
    teacher_added: 'from-green-400 to-green-600',
    teacher_updated: 'from-blue-400 to-blue-600',
    teacher_deleted: 'from-red-400 to-red-600',
    // Admin - Student
    student_added: 'from-green-400 to-green-600',
    student_updated: 'from-blue-400 to-blue-600',
    student_deleted: 'from-red-400 to-red-600',
    // Admin - Group
    group_assigned: 'from-emerald-400 to-emerald-600',
    group_updated: 'from-blue-400 to-blue-600',
    group_deleted: 'from-red-400 to-red-600',
    group_transferred: 'from-amber-400 to-amber-600',
    // Admin - Secretary
    secretary_added: 'from-green-400 to-green-600',
    secretary_updated: 'from-blue-400 to-blue-600',
    secretary_deleted: 'from-red-400 to-red-600',
    // Admin - New types
    admin_action: 'from-slate-400 to-slate-600',
    user_approval: 'from-green-400 to-green-600',
    role_change: 'from-purple-400 to-purple-600',
    system_update: 'from-blue-400 to-blue-600',
    // Other
    goal: 'from-amber-400 to-amber-600',
    achievement: 'from-yellow-400 to-yellow-600',
    points: 'from-orange-400 to-orange-600',
    ranking: 'from-rose-400 to-rose-600',
    other: 'from-gray-400 to-gray-600',
  };
  return colors[type] || 'from-gray-400 to-gray-600';
};

/**
 * الحصول على لون الفئة
 */
export const getCategoryColor = (category: NotificationCategory): string => {
  const colors: Record<NotificationCategory, string> = {
    general: 'from-gray-400 to-gray-600',
    academic: 'from-emerald-400 to-emerald-600',
    admin: 'from-blue-400 to-blue-600',
    other: 'from-purple-400 to-purple-600',
  };
  return colors[category] || 'from-gray-400 to-gray-600';
};

/**
 * الحصول على اسم الفئة بالعربية
 */
export const getCategoryName = (category: NotificationCategory): string => {
  const names: Record<NotificationCategory, string> = {
    general: 'عامة',
    academic: 'أكاديمية',
    admin: 'إدارية',
    other: 'أخرى',
  };
  return names[category] || 'عامة';
};

/**
 * تنسيق الوقت النسبي (منذ متى) - ديناميكي ومتجدد تلقائياً
 */
export const formatRelativeTime = (dateString: string): string => {
  try {
    const date = new Date(dateString);

    // التحقق من صحة التاريخ
    if (isNaN(date.getTime())) {
      console.warn('⚠️ Invalid date:', dateString);
      return 'توقيت غير صحيح';
    }

    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);
    const diffInWeeks = Math.floor(diffInDays / 7);
    const diffInMonths = Math.floor(diffInDays / 30);
    const diffInYears = Math.floor(diffInDays / 365);

    // تم الإرسال الآن (أقل من 10 ثواني)
    if (diffInSeconds < 10) return 'تم الإرسال الآن';

    // تم الإرسال قبل X ثانية (أقل من دقيقة)
    if (diffInSeconds < 60) {
      return `قبل ${diffInSeconds} ثانية`;
    }

    // تم الإرسال قبل X دقيقة (أقل من ساعة)
    if (diffInMinutes < 60) {
      return `قبل ${diffInMinutes} ${diffInMinutes === 1 ? 'دقيقة' : diffInMinutes === 2 ? 'دقيقتين' : 'دقائق'}`;
    }

    // تم الإرسال قبل X ساعة (أقل من 24 ساعة)
    if (diffInHours < 24) {
      return `قبل ${diffInHours} ${diffInHours === 1 ? 'ساعة' : diffInHours === 2 ? 'ساعتين' : 'ساعات'}`;
    }

    // تم الإرسال منذ X يوم (أقل من أسبوع)
    if (diffInDays < 7) {
      return `منذ ${diffInDays} ${diffInDays === 1 ? 'يوم' : diffInDays === 2 ? 'يومين' : 'أيام'}`;
    }

    // تم الإرسال منذ X أسبوع (أقل من شهر)
    if (diffInDays < 30) {
      return `منذ ${diffInWeeks} ${diffInWeeks === 1 ? 'أسبوع' : diffInWeeks === 2 ? 'أسبوعين' : 'أسابيع'}`;
    }

    // تم الإرسال منذ X شهر (أقل من سنة)
    if (diffInDays < 365) {
      return `منذ ${diffInMonths} ${diffInMonths === 1 ? 'شهر' : diffInMonths === 2 ? 'شهرين' : 'أشهر'}`;
    }

    // أكثر من سنة
    if (diffInYears === 1) {
      return 'منذ سنة';
    } else if (diffInYears === 2) {
      return 'منذ سنتين';
    } else if (diffInYears < 10) {
      return `منذ ${diffInYears} سنوات`;
    }

    // أكثر من 10 سنوات - نعرض التاريخ الكامل
    return date.toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: TIMEZONE
    });
  } catch (error) {
    console.error('❌ Error formatting date:', dateString, error);
    return 'توقيت غير صحيح';
  }
};

/**
 * الحصول على badge للأولوية
 */
export const getPriorityBadge = (priority: string): { text: string; className: string } | null => {
  if (priority === 'urgent') {
    return {
      text: '⚡ عاجل',
      className: 'px-2 py-0.5 bg-red-100 text-red-600 rounded-full font-semibold animate-pulse',
    };
  }
  if (priority === 'high') {
    return {
      text: '⭐ مهم',
      className: 'px-2 py-0.5 bg-orange-100 text-orange-600 rounded-full font-semibold',
    };
  }
  return null;
};
