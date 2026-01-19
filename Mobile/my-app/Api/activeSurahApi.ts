import api from "./api";

// ============================================================================
// Active Surah API - API للسور الفعالة
// ============================================================================

export interface ActiveSurah {
  surahNumber: number;
  surahName: string;
  lastAyahEnd: number;
  isCompleted: boolean;
  startedAt: string | null;
  totalAyahs?: number;
  remainingAyahs?: number;
  progressPercent?: number;
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

export interface ActiveSurahProgress {
  isActive: boolean;
  canStartNewSurah: boolean;
  surahNumber?: number;
  surahName?: string;
  lastAyahEnd?: number;
  totalAyahs?: number;
  remainingAyahs?: number;
  progressPercent?: number;
  nextAyahStart?: number;
  startedAt?: string | null;
  message?: string;
  lastCompleted?: {
    surahNumber: number;
    surahName: string;
    completedAt: string;
  };
}

export interface ActiveSurahInfoResponse {
  groupId: string;
  groupName: string;
  memorization: ActiveSurahProgress;
  review: ActiveSurahProgress;
  completedSurahs: {
    memorization: CompletedSurah[];
    review: CompletedSurah[];
  };
}

/**
 * Get active surahs for a group (basic info)
 * @param groupId - Group ID
 */
export const getActiveSurahs = async (
  groupId: string,
): Promise<{
  success: boolean;
  data?: ActiveSurahsResponse;
  message?: string;
  error?: string;
}> => {
  try {
    const response = await api.get(
      `/daily-marks/sections/active-surahs/${groupId}`,
    );
    return {
      success: true,
      data: response.data.data,
      message: response.data.message,
    };
  } catch (error: any) {
    console.error("Error fetching active surahs:", error);
    return {
      success: false,
      error:
        error.response?.data?.message ||
        error.message ||
        "حدث خطأ في جلب السور الفعالة",
    };
  }
};

/**
 * Get detailed active surah info for a group
 * @param groupId - Group ID
 */
export const getActiveSurahInfo = async (
  groupId: string,
): Promise<{
  success: boolean;
  data?: ActiveSurahInfoResponse;
  message?: string;
  error?: string;
}> => {
  try {
    const response = await api.get(
      `/daily-marks/sections/active-surah-info/${groupId}`,
    );
    return {
      success: true,
      data: response.data.data,
      message: response.data.message,
    };
  } catch (error: any) {
    console.error("Error fetching active surah info:", error);
    return {
      success: false,
      error:
        error.response?.data?.message ||
        error.message ||
        "حدث خطأ في جلب معلومات السورة الفعالة",
    };
  }
};
