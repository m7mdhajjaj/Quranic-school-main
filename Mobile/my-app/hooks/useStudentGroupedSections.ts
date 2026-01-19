import { useState, useEffect, useCallback } from "react";
import {
  getStudentSectionsGrouped,
  StudentSectionsGroupedResponse,
  GroupedSurah,
} from "@/Api/studentGroupedSectionsApi";
import {
  getActiveSurahs,
  ActiveSurah,
  ActiveSurahsResponse,
} from "@/Api/activeSurahApi";

interface UseStudentGroupedSectionsProps {
  studentId: string;
  groupId: string;
}

// نوع السورة الفعالة المبسط للاستخدام في الواجهة
export interface ActiveSurahItem extends ActiveSurah {
  type: "memorization" | "review";
}

interface UseStudentGroupedSectionsReturn {
  data: GroupedSurah[];
  activeSurahs: ActiveSurahItem[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useStudentGroupedSections({
  studentId,
  groupId,
}: UseStudentGroupedSectionsProps): UseStudentGroupedSectionsReturn {
  const [data, setData] = useState<GroupedSurah[]>([]);
  const [activeSurahs, setActiveSurahs] = useState<ActiveSurahItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!studentId || !groupId) {
      setData([]);
      setActiveSurahs([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // جلب البيانات بالتوازي
      const [sectionsResponse, activeSurahsResponse] = await Promise.all([
        getStudentSectionsGrouped(studentId, groupId),
        getActiveSurahs(groupId),
      ]);

      if (sectionsResponse?.success && sectionsResponse?.data?.surahs) {
        setData(sectionsResponse.data.surahs);
      } else {
        setData([]);
      }

      if (activeSurahsResponse?.success && activeSurahsResponse?.data) {
        // تحويل البيانات من الـ API إلى مصفوفة مبسطة
        const activeItems: ActiveSurahItem[] = [];
        const apiData = activeSurahsResponse.data;

        if (
          apiData.memorization?.activeSurah &&
          !apiData.memorization.activeSurah.isCompleted
        ) {
          activeItems.push({
            ...apiData.memorization.activeSurah,
            type: "memorization",
          });
        }

        if (
          apiData.review?.activeSurah &&
          !apiData.review.activeSurah.isCompleted
        ) {
          activeItems.push({
            ...apiData.review.activeSurah,
            type: "review",
          });
        }

        setActiveSurahs(activeItems);
      } else {
        setActiveSurahs([]);
      }
    } catch (err) {
      console.error("Error fetching student grouped sections:", err);
      setError(
        err instanceof Error ? err.message : "حدث خطأ أثناء تحميل البيانات",
      );
      setData([]);
      setActiveSurahs([]);
    } finally {
      setIsLoading(false);
    }
  }, [studentId, groupId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    activeSurahs,
    isLoading,
    error,
    refetch: fetchData,
  };
}

// دالة مساعدة للتحقق إذا كانت السورة فعالة للحفظ
export function isActiveSurahForMemorization(
  surahNumber: number,
  activeSurahs: ActiveSurahItem[],
): boolean {
  return activeSurahs.some(
    (s) => s.surahNumber === surahNumber && s.type === "memorization",
  );
}

// دالة مساعدة للتحقق إذا كانت السورة فعالة للمراجعة
export function isActiveSurahForReview(
  surahNumber: number,
  activeSurahs: ActiveSurahItem[],
): boolean {
  return activeSurahs.some(
    (s) => s.surahNumber === surahNumber && s.type === "review",
  );
}

// دالة مساعدة للحصول على معلومات السورة الفعالة
export function getActiveSurahInfo(
  surahNumber: number,
  activeSurahs: ActiveSurah[],
): ActiveSurah | undefined {
  return activeSurahs.find((s) => s.surahNumber === surahNumber);
}
