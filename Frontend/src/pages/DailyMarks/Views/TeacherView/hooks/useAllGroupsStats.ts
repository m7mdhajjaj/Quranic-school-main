import { useState, useEffect, useMemo, useRef } from "react";
import { getGroupStats } from "@/Api/DailyMark/dailyMarksApi";

interface GroupStatsData {
  studentsCount: number;
  sectionsCount: number;
  loading: boolean;
}

// ✅ Cache للإحصائيات - يبقى لمدة 5 دقائق
const statsCache: Record<string, { data: GroupStatsData; timestamp: number }> = {};
const CACHE_DURATION = 5 * 60 * 1000; // 5 دقائق

/**
 * Custom hook لجلب إحصائيات جميع الحلقات بشكل متوازي
 * ✅ محسّن: يستخدم cache ويجلب فقط 4 حلقات في المرة الواحدة (batching)
 */
export const useAllGroupsStats = (
  teacherGroups: string[],
  selectedGroup: string | null,
  selectedMonth: number | null,
  selectedYear: number | null
) => {
  const [groupsStats, setGroupsStats] = useState<
    Record<string, GroupStatsData>
  >({});
  const fetchingRef = useRef(false);

  // جلب إحصائيات الحلقات مع التحسينات
  useEffect(() => {
    // لا تجلب إذا كان هناك group محدد
    if (selectedGroup && selectedGroup !== "all") {
      setGroupsStats({});
      return;
    }

    // لا تجلب إذا لم تكن هناك حلقات
    if (!teacherGroups || teacherGroups.length === 0) {
      setGroupsStats({});
      return;
    }

    // منع الجلب المتزامن
    if (fetchingRef.current) return;

    let isMounted = true;
    fetchingRef.current = true;

    const fetchAllStats = async () => {
      const now = Date.now();
      const cacheKey = `${selectedMonth}-${selectedYear}`;
      
      // ✅ تحقق من الـ Cache أولاً
      const cachedStats: Record<string, GroupStatsData> = {};
      const groupsToFetch: string[] = [];
      
      teacherGroups.forEach((group) => {
        const cached = statsCache[`${group}-${cacheKey}`];
        if (cached && (now - cached.timestamp) < CACHE_DURATION) {
          cachedStats[group] = cached.data;
        } else {
          groupsToFetch.push(group);
        }
      });

      // إذا كل البيانات موجودة في الـ Cache
      if (groupsToFetch.length === 0) {
        if (isMounted) {
          setGroupsStats(cachedStats);
          fetchingRef.current = false;
        }
        return;
      }

      // تعيين البيانات من الـ Cache + loading للباقي
      setGroupsStats(() => {
        const newStats: Record<string, GroupStatsData> = { ...cachedStats };
        groupsToFetch.forEach((group) => {
          newStats[group] = {
            studentsCount: 0,
            sectionsCount: 0,
            loading: true,
          };
        });
        return newStats;
      });

      try {
        // ✅ جلب بـ batches (4 حلقات في المرة) لتقليل الضغط
        const BATCH_SIZE = 4;
        const batches: string[][] = [];
        for (let i = 0; i < groupsToFetch.length; i += BATCH_SIZE) {
          batches.push(groupsToFetch.slice(i, i + BATCH_SIZE));
        }

        for (const batch of batches) {
          if (!isMounted) break;

          const batchResults = await Promise.all(
            batch.map(async (group) => {
              try {
                const response = await getGroupStats(
                  group,
                  selectedMonth || undefined,
                  selectedYear || undefined
                );

                const result = {
                  group,
                  studentsCount: response.success ? response.data?.studentsCount || 0 : 0,
                  sectionsCount: response.success ? response.data?.sectionsCount || 0 : 0,
                };

                // ✅ حفظ في الـ Cache
                statsCache[`${group}-${cacheKey}`] = {
                  data: { ...result, loading: false },
                  timestamp: now,
                };

                return result;
              } catch {
                return { group, studentsCount: 0, sectionsCount: 0 };
              }
            })
          );

          if (!isMounted) break;

          // تحديث الحالة تدريجياً
          setGroupsStats((prev) => {
            const updated = { ...prev };
            batchResults.forEach((result) => {
              updated[result.group] = {
                studentsCount: result.studentsCount,
                sectionsCount: result.sectionsCount,
                loading: false,
              };
            });
            return updated;
          });
        }
      } catch {
        // Silent error
      } finally {
        fetchingRef.current = false;
      }
    };

    fetchAllStats();

    return () => {
      isMounted = false;
    };
  }, [teacherGroups, selectedGroup, selectedMonth, selectedYear]);

  // دمج الحلقات مع إحصائياتها
  const groupsWithStats = useMemo(() => {
    return teacherGroups.map((group) => {
      const stats = groupsStats[group] || {
        studentsCount: 0,
        sectionsCount: 0,
        loading: false,
      };
      return {
        name: group,
        studentsCount: stats.studentsCount || 0,
        sectionsCount: stats.sectionsCount || 0,
        hasStudents: stats.studentsCount > 0,
        loading: stats.loading,
      };
    });
  }, [teacherGroups, groupsStats]);

  // التحقق إذا كان أي حلقة ما زالت تحمل
  const isAnyGroupLoading = useMemo(() => {
    return Object.values(groupsStats).some((stat) => stat.loading);
  }, [groupsStats]);

  return {
    groupsWithStats,
    isAnyGroupLoading,
  };
};
