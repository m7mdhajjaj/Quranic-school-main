import api from '../api';

// ============================================================================
// Active Surah API - API للسور الفعالة
// ============================================================================

export interface ActiveSurah {
  surahNumber: number;
  surahName: string;
  lastAyahEnd: number;
  isCompleted: boolean;
  startedAt: string | null;
}

export interface CompletedSurah {
  surahNumber: number;
  surahName: string;
  completedAt: string;
  totalSegments: number;
}

export interface SurahStats {
  activeSurah: ActiveSurah | null;
  completedCount: number;
  completedSurahs: CompletedSurah[];
}

export interface ActiveSurahsResponse {
  groupId: string;
  groupName: string;
  memorization: SurahStats;
  review: SurahStats;
}

// ============================================================================
// NEW: Active Surah Info (Detailed) Types
// ============================================================================
export interface ActiveSurahProgress {
  surahNumber: number;
  surahName: string;
  lastAyahEnd: number;
  totalAyahs: number;
  progressPercentage: number;
  startedAt: string | null;
  isCompleted: boolean;
  segmentsCount?: number;
}

export interface ActiveSurahInfoResponse {
  groupId: string;
  groupName: string;
  memorization: {
    activeSurah: ActiveSurahProgress | null;
    canStartNewSurah: boolean;
    nextSuggested?: {
      surahNumber: number;
      surahName: string;
    };
  };
  review: {
    activeSurah: ActiveSurahProgress | null;
    canStartNewSurah: boolean;
    nextSuggested?: {
      surahNumber: number;
      surahName: string;
    };
  };
}

/**
 * Get active surahs for a group (basic info)
 * @param groupId - Group ID
 */
export const getActiveSurahs = async (
  groupId: string
): Promise<{
  success: boolean;
  data?: ActiveSurahsResponse;
  message?: string;
  error?: string;
}> => {
  try {
    const response = await api.get(`/daily-marks/sections/active-surahs/${groupId}`);
    return {
      success: true,
      data: response.data.data,
      message: response.data.message,
    };
  } catch (error: unknown) {
    console.error('Error fetching active surahs:', error);
    const axiosError = error as { response?: { data?: { message?: string } }; message?: string };
    return {
      success: false,
      error: axiosError.response?.data?.message || axiosError.message || 'حدث خطأ في جلب السور الفعالة',
    };
  }
};

/**
 * Get active surah info with progress (detailed)
 * @param groupId - Group ID
 */
export const getActiveSurahInfo = async (
  groupId: string
): Promise<{
  success: boolean;
  data?: ActiveSurahInfoResponse;
  message?: string;
  error?: string;
}> => {
  try {
    const response = await api.get(`/daily-marks/sections/active-surah-info/${groupId}`);
    return {
      success: true,
      data: response.data.data,
      message: response.data.message,
    };
  } catch (error: unknown) {
    console.error('Error fetching active surah info:', error);
    const axiosError = error as { response?: { data?: { message?: string } }; message?: string };
    return {
      success: false,
      error: axiosError.response?.data?.message || axiosError.message || 'حدث خطأ في جلب معلومات السورة الفعالة',
    };
  }
};

/**
 * Mark a surah as completed
 * @param groupId - Group ID
 * @param type - 'memorization' or 'review'
 */
export const completeSurah = async (
  groupId: string,
  type: 'memorization' | 'review'
): Promise<{
  success: boolean;
  data?: {
    completedSurah: {
      surahNumber: number;
      surahName: string;
      type: string;
      totalSegments: number;
    };
  };
  message?: string;
  error?: string;
}> => {
  try {
    const response = await api.post('/daily-marks/sections/complete-surah', {
      groupId,
      type,
    });
    return {
      success: true,
      data: response.data.data,
      message: response.data.message,
    };
  } catch (error: unknown) {
    console.error('Error completing surah:', error);
    const axiosError = error as { response?: { data?: { message?: string } }; message?: string };
    return {
      success: false,
      error: axiosError.response?.data?.message || axiosError.message || 'حدث خطأ في إكمال السورة',
    };
  }
};

/**
 * Reset active surah (Admin/Emergency)
 * @param groupId - Group ID
 * @param type - 'memorization' or 'review'
 */
export const resetActiveSurah = async (
  groupId: string,
  type: 'memorization' | 'review'
): Promise<{
  success: boolean;
  message?: string;
  error?: string;
}> => {
  try {
    const response = await api.post('/daily-marks/sections/reset-active-surah', {
      groupId,
      type,
    });
    return {
      success: true,
      message: response.data.message,
    };
  } catch (error: unknown) {
    console.error('Error resetting active surah:', error);
    const axiosError = error as { response?: { data?: { message?: string } }; message?: string };
    return {
      success: false,
      error: axiosError.response?.data?.message || axiosError.message || 'حدث خطأ في إعادة تعيين السورة الفعالة',
    };
  }
};
