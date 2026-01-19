// =================== Timing Constants ===================
export const DEBOUNCE_TIME = {
  SEARCH: 500,           // تأخير البحث
  FILTERS: 500,          // تأخير الفلاتر
  DUPLICATE_CHECK: 500,  // تأخير فحص التكرار
} as const;

export const CACHE_TIME = {
  STATS: 5 * 60 * 1000,      // 5 دقائق للإحصائيات
  ASSISTANTS: 2 * 60 * 1000, // 2 دقيقة للبيانات
  GROUPS: 10 * 60 * 1000,    // 10 دقائق للحلقات
} as const;

// =================== Default Values ===================
export const DEFAULT_VALUES = {
  AGE_RANGE: [0, 100] as [number, number],
  SORT_FIELD: 'assistantId' as const,
  SORT_ORDER: 'desc' as const,
  ITEMS_PER_PAGE: 20,
  MAX_GROUPS_PER_ASSISTANT: 2,
} as const;

// =================== Filter Options ===================
export const GENDER_OPTIONS = ['all', 'ذكر', 'أنثى'] as const;
export const GROUPS_ASSIGNMENT_OPTIONS = ['all', 'true', 'false'] as const;
export const VIEW_MODES = ['table', 'grid'] as const;

// =================== Validation Constants ===================
export const VALIDATION_RULES = {
  ID_NUMBER_LENGTH: 9,
  PHONE_NUMBER_LENGTH: 10,
  MIN_AGE: 16,
  MAX_AGE: 100,
  PASSWORD_MIN_LENGTH: 6,
  EMAIL_REGEX: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
  PHONE_REGEX: /^05\d{8}$/,
  ID_NUMBER_REGEX: /^\d{9}$/,
} as const;

// =================== Messages ===================
export const MESSAGES = {
  SUCCESS: {
    CREATE: 'تم إضافة مساعد المدرس بنجاح',
    UPDATE: 'تم تحديث بيانات مساعد المدرس بنجاح',
    DELETE: 'تم حذف مساعد المدرس بنجاح',
    BULK_DELETE: (count: number) => `تم حذف ${count} مساعد مدرس بنجاح`,
    EXPORT: 'تم تصدير البيانات بنجاح',
  },
  ERROR: {
    CREATE: 'فشل إضافة مساعد المدرس',
    UPDATE: 'فشل تحديث مساعد المدرس',
    DELETE: 'فشل حذف مساعد المدرس',
    BULK_DELETE: 'فشل حذف مساعدي المدرسين',
    EXPORT: 'فشل التصدير',
    FETCH_DATA: 'فشل في جلب بيانات مساعدي المدرسين',
    FETCH_STATS: 'فشل في جلب الإحصائيات',
    UNEXPECTED: 'حدث خطأ غير متوقع',
  },
  INFO: {
    NO_CHANGES: 'لم يتم إجراء أي تغييرات',
    FILL_REQUIRED: 'يرجى ملء البيانات المطلوبة',
  },
} as const;

// =================== Export Constants ===================
export const EXPORT_CONFIG = {
  FILE_NAME: 'teacher_assistants_export',
  SHEET_NAME: 'مساعدي المدرسين',
  FILE_EXTENSION: 'xlsx',
} as const;
