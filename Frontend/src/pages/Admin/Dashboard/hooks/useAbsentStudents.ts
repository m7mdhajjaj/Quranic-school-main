import { useState, useEffect, useCallback } from "react";
import { getAbsentStudentsToday, type AbsentStudentToday } from "@/Api/attendanceApi";
import { useDashboardSocket } from "@/Socket/useDashboardSocket";

/**
 * Hook لإدارة بيانات الطلاب الغائبين لهذا اليوم
 * يتعامل مع جلب البيانات، التحديثات من Socket، وإدارة الحالة
 */
export const useAbsentStudents = () => {
  const [absentStudents, setAbsentStudents] = useState<AbsentStudentToday[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // دالة جلب البيانات من API
  const fetchAbsentStudents = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log("🔄 [useAbsentStudents] جلب الطلاب الغائبين...");
      const response = await getAbsentStudentsToday();
      if (response.success) {
        const students = response.data || [];
        console.log(`✅ [useAbsentStudents] تم جلب ${students.length} طالب غائب`);
        setAbsentStudents(students);
        setLastUpdate(new Date());
      }
    } catch (error) {
      console.error("❌ [useAbsentStudents] خطأ في جلب الطلاب الغائبين:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // دالة معالجة تحديثات Socket
  const handleSocketUpdate = useCallback(
    (data?: { data?: AbsentStudentToday[]; count?: number }) => {
      // إذا كانت البيانات موجودة في Socket event، استخدمها مباشرة
      if (data?.data && Array.isArray(data.data)) {
        // استخدام queueMicrotask لتأجيل setState قليلاً وتحسين أداء معالج Socket
        queueMicrotask(() => {
          setAbsentStudents(data.data as AbsentStudentToday[]);
          setLastUpdate(new Date());
        });
        return;
      }

      // إذا لم تكن البيانات موجودة، اجلبها من API (fallback)
      // استخدام queueMicrotask لتأجيل API call
      queueMicrotask(() => {
        fetchAbsentStudents();
      });
    },
    [fetchAbsentStudents]
  );

  // جلب البيانات عند التحميل
  useEffect(() => {
    fetchAbsentStudents();
  }, [fetchAbsentStudents]);

  // الاستماع لتحديثات Socket.IO (تحديث فوري عند حفظ الحضور)
  // ملاحظة: التحديثات التلقائية تتم من Backend عبر cron jobs:
  // - Backend يرسل Socket event "absentStudentsUpdated" عند 00:00:00 (منتصف الليل)
  // - Backend يرسل Socket event "absentStudentsUpdated" كل ساعة كـ backup
  useDashboardSocket(handleSocketUpdate);

  return {
    absentStudents,
    isLoading,
    lastUpdate,
    refetch: fetchAbsentStudents,
  };
};
