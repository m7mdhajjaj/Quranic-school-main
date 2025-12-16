// ============================================================================
// Notification Utilities
// ============================================================================
// Helper functions للإشعارات

import type { DailyMarkAction, DailyMarkNotificationData } from '../types';

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
 * الحصول على أيقونة الإشعار حسب النوع
 */
export const getNotificationIcon = (type: string, data?: any): string => {
  // للعلامات اليومية، نستخدم أيقونة مخصصة حسب العملية
  if (type === 'daily_marks' && data?.action) {
    return getDailyMarkIcon(data.action);
  }
  
  const icons: Record<string, string> = {
    grade: '🎯',
    message: '💬',
    prayer_time: '🕌',
    activity: '✨',
    attendance: '⚡',
    exam: '📝',
    assignment: '📚',
    news: '📰',
    general: '🔔',
    daily_marks: '📊',
    warning: '⚠️',
    system: '⚙️',
    success: '✅',
    alert: '🚨',
  };
  return icons[type] || '🔔';
};

/**
 * الحصول على لون الإشعار حسب النوع
 */
export const getNotificationColor = (type: string): string => {
  const colors: Record<string, string> = {
    attendance: 'from-yellow-400 to-orange-500',
    grade: 'from-green-400 to-green-600',
    message: 'from-blue-400 to-blue-600',
    prayer_time: 'from-purple-400 to-purple-600',
    activity: 'from-orange-400 to-orange-600',
    exam: 'from-pink-400 to-pink-600',
    assignment: 'from-indigo-400 to-indigo-600',
    news: 'from-cyan-400 to-cyan-600',
    general: 'from-gray-400 to-gray-600',
    daily_marks: 'from-emerald-400 to-emerald-600',
    warning: 'from-red-400 to-red-600',
    system: 'from-slate-400 to-slate-600',
    success: 'from-teal-400 to-teal-600',
    alert: 'from-rose-400 to-rose-600',
  };
  return colors[type] || 'from-gray-400 to-gray-600';
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
