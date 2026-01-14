import api from '../api';

/**
 * ============================================================================
 * Smart Scheduler API
 * ============================================================================
 * API للجدولة الذكية وسد الفجوات والتحقق من صلاحية التواريخ
 */

// Types
export interface SchedulerSuggestion {
  surahNumber: number;
  surahName: string;
  ayahStart: number;
  ayahEnd: number;
  size: number;
  date: string;
  dateKey: string;
  reason: string;
  canonicalKey: string;
  displayText?: string;
}

export interface GapInfo {
  ayahStart: number;
  ayahEnd: number;
  size: number;
  isEndOfSurah?: boolean;
}

export interface SuggestGapsResponse {
  success: boolean;
  hasGaps: boolean;
  message: string;
  suggestions: SchedulerSuggestion[];
  gaps: GapInfo[];
  warnings: string[];
  finalCheck?: {
    isValid: boolean;
    violations: Array<{ type: string; message: string }>;
  };
  stats: {
    surahName: string;
    totalAyahs: number;
    existingSegments: number;
    gapsFound: number;
    chunksProposed: number;
    totalGapSize: number;
  };
}

// ✅ V8 Enhanced: Updated to match new backend response with multiple alternatives
export interface ValidateBeforeInsertResponse {
  success: boolean;
  validation: {
    isValid: boolean;
    reason?: string;
    originalReason?: string;
    proposedDate?: string;
    message?: string;
    conflictingSegment?: {
      date: string;
      ayahStart: number;
      ayahEnd: number;
    } | null;
    constraints?: {
      minDate: string | null;
      maxDate: string | null;
      minDateReason?: string;
      maxDateReason?: string;
    };
    // ✅ V8: قائمة من التواريخ البديلة
    suggestedAlternatives?: Array<{
      date: string;
      dateKey: string;
      dayName: string;
      weekNumber: number;
      isPreferred: boolean;
      reason: string;
    }>;
    // للتوافق مع الكود القديم
    suggestedAlternative?: {
      date: string;
      dateKey: string;
      dayName?: string;
      weekNumber?: number;
      reason: string;
      constraints?: object;
    } | null;
    debugInfo?: {
      existingSegmentsCount: number;
      proposedAyahRange: string;
      alternativesFound?: number;
    };
  };
}

export interface AvailableDateSlot {
  date: string;
  dateKey: string;
  dayName: string;
  weekNumber: number;
  isPreferred: boolean;
  reason: string;
}

export interface AvailableDatesResponse {
  success: boolean;
  dates: AvailableDateSlot[];
  requested: number;
  found: number;
  shortfall: number;
  warnings: string[];
}

export interface WeeklyUsage {
  weekNumber: number;
  start: string;
  end: string;
  dateKey: string;
  count: number;
  remaining: number;
  isFull: boolean;
}

export interface WeeklyUsageResponse {
  success: boolean;
  weeks: WeeklyUsage[];
}

export interface DetectGapsResponse {
  success: boolean;
  surahNumber: number;
  surahName: string;
  totalAyahs: number;
  existingSegments: number;
  gaps: GapInfo[];
  hasGaps: boolean;
  totalGapSize: number;
}

export interface SplitChunkResponse {
  success: boolean;
  originalGap: {
    surahNumber: number;
    surahName: string;
    ayahStart: number;
    ayahEnd: number;
    size: number;
  };
  chunks: Array<{
    surahNumber: number;
    ayahStart: number;
    ayahEnd: number;
    size: number;
    displayText: string;
  }>;
  totalChunks: number;
}

export interface SuggestSingleDateResponse {
  success: boolean;
  suggestion?: {
    surahNumber: number;
    surahName: string;
    ayahStart: number;
    ayahEnd: number;
    size: number;
    date: string;
    dateKey: string;
    reason: string;
    canonicalKey: string;
  };
  message?: string;
  constraints?: {
    minDate: string | null;
    maxDate: string | null;
  };
}

// ✅ NEW: Auto-fix validation response
export interface ValidateAndAutoFixResponse {
  success: boolean;
  validation: {
    isValid: boolean;
    reason?: string;
    suggestedAlternative?: {
      date: string;
      dateKey: string;
      reason: string;
    } | null;
  };
  // Additional debug info when invalid
  debugInfo?: {
    proposedDate: string;
    constraints: {
      minDate: string | null;
      maxDate: string | null;
      minDateReason?: string;
      maxDateReason?: string;
    };
    existingSegmentsCount: number;
  };
}

// ✅ NEW: Debug order response
export interface DebugOrderResponse {
  success: boolean;
  surahNumber: number;
  surahName: string;
  segments: Array<{
    date: string;
    ayahStart: number;
    ayahEnd: number;
    canonicalKey: string;
  }>;
  isMonotonicValid: boolean;
  violations?: Array<{
    type: string;
    message: string;
  }>;
}

// ============================================================================
// API FUNCTIONS
// ============================================================================

/**
 * اقتراح جدول كامل لسد فجوات سورة معينة
 */
export const suggestGapFilling = async (
  groupId: string,
  surahNumber: number,
  options?: {
    chunkSize?: number;
    priorityDate?: string;
    preferredDays?: number[];
    maxChunks?: number;
    type?: 'memorization' | 'review';
  }
): Promise<SuggestGapsResponse> => {
  const response = await api.post('/daily-marks/scheduler/suggest-gaps', {
    groupId,
    surahNumber,
    ...options,
  });
  return response.data;
};

/**
 * اقتراح تاريخ واحد لمقطع جديد
 */
export const suggestSingleDate = async (
  groupId: string,
  surahNumber: number,
  ayahStart: number,
  ayahEnd?: number
): Promise<SuggestSingleDateResponse> => {
  const response = await api.post('/daily-marks/scheduler/suggest-date', {
    groupId,
    surahNumber,
    ayahStart,
    ayahEnd,
  });
  return response.data;
};

/**
 * 🔒 التحقق من صلاحية تاريخ معين قبل الإدراج
 * يمنع تعارض التواريخ مع ترتيب الآيات
 */
export const validateBeforeInsert = async (
  groupId: string,
  surahNumber: number,
  ayahStart: number,
  ayahEnd: number,
  proposedDate: string
): Promise<ValidateBeforeInsertResponse> => {
  const response = await api.post('/daily-marks/scheduler/validate', {
    groupId,
    surahNumber,
    ayahStart,
    ayahEnd,
    proposedDate,
  });
  return response.data;
};

/**
 * جلب التواريخ المتاحة لحلقة معينة
 */
export const getAvailableDates = async (
  groupId: string,
  count?: number,
  startDate?: string
): Promise<AvailableDatesResponse> => {
  const params = new URLSearchParams();
  params.append('groupId', groupId);
  if (count) params.append('count', count.toString());
  if (startDate) params.append('startDate', startDate);

  const response = await api.get(`/daily-marks/scheduler/available-dates?${params.toString()}`);
  return response.data;
};

/**
 * اكتشاف الفجوات في سورة معينة
 */
export const detectGaps = async (
  groupId: string,
  surahNumber: number,
  type?: 'memorization' | 'review'
): Promise<DetectGapsResponse> => {
  const params = type ? `?type=${type}` : '';
  const response = await api.get(`/daily-marks/scheduler/gaps/${groupId}/${surahNumber}${params}`);
  return response.data;
};

/**
 * تقسيم فجوة معينة إلى مقاطع (للمعاينة)
 */
export const splitChunk = async (
  surahNumber: number,
  ayahStart: number,
  ayahEnd: number,
  chunkSize?: number
): Promise<SplitChunkResponse> => {
  const response = await api.post('/daily-marks/scheduler/split-chunk', {
    surahNumber,
    ayahStart,
    ayahEnd,
    chunkSize,
  });
  return response.data;
};

/**
 * استعراض استخدام الأسابيع القادمة
 */
export const getWeeklyUsage = async (
  groupId: string,
  weeks?: number
): Promise<WeeklyUsageResponse> => {
  const params = weeks ? `?weeks=${weeks}` : '';
  const response = await api.get(`/daily-marks/scheduler/weekly-usage/${groupId}${params}`);
  return response.data;
};

/**
 * 🔒 التحقق من صلاحية تاريخ معين مع اقتراح بديل تلقائي
 * يمنع تعارض التواريخ مع ترتيب الآيات (Monotonic Order)
 * إذا كان التاريخ غير صالح، يقترح تاريخاً بديلاً تلقائياً
 */
export const validateAndAutoFix = async (
  groupId: string,
  surahNumber: number,
  ayahStart: number,
  ayahEnd: number,
  proposedDate: string
): Promise<ValidateAndAutoFixResponse> => {
  const response = await api.post('/daily-marks/scheduler/validate-auto-fix', {
    groupId,
    surahNumber,
    ayahStart,
    ayahEnd,
    proposedDate,
  });
  return response.data;
};

/**
 * 🔍 عرض ترتيب المقاطع للتصحيح (Debug)
 * يعرض جميع المقاطع مرتبة بالتاريخ مع التحقق من صحة الترتيب
 */
export const debugOrder = async (
  groupId: string,
  surahNumber: number
): Promise<DebugOrderResponse> => {
  const response = await api.get(`/daily-marks/scheduler/debug-order/${groupId}/${surahNumber}`);
  return response.data;
};

export default {
  suggestGapFilling,
  suggestSingleDate,
  validateBeforeInsert,
  validateAndAutoFix,
  debugOrder,
  getAvailableDates,
  detectGaps,
  splitChunk,
  getWeeklyUsage,
};
