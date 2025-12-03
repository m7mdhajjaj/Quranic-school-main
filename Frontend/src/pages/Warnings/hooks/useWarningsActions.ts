// ============================================================================
// useWarningsActions Hook - إدارة عمليات الإنذارات
// ============================================================================

import { useState } from "react";
import * as warningApi from "@/Api/warningApi";
import type {
  Student,
  WarningType,
  TeacherStatistics,
  UseWarningsActionsReturn,
} from "../types/warnings";
import {
  showSuccessToast,
  showErrorToast,
} from "@/components/utils/toastUtils";

export const useWarningsActions = (
  refetchData: () => void
): UseWarningsActionsReturn => {
  const [loadingStatistics, setLoadingStatistics] = useState(false);
  const [statistics, setStatistics] = useState<TeacherStatistics | null>(null);

  // جلب إحصائيات المعلم
  const fetchTeacherStatistics = async () => {
    try {
      setLoadingStatistics(true);
      const data = await warningApi.getTeacherStatistics();
      setStatistics(data);
      return data;
    } catch (error) {
      console.error("Error fetching statistics:", error);
      showErrorToast("حدث خطأ أثناء جلب الإحصائيات");
      return null;
    } finally {
      setLoadingStatistics(false);
    }
  };

  // إعطاء إنذار
  const giveWarning = async (
    student: Student,
    type: WarningType,
    reason: string,
    groupName: string,
    teacherId: string
  ) => {
    try {
      await warningApi.createWarning({
        studentId: student._id,
        teacherId,
        groupName,
        type,
        reason,
      });

      showSuccessToast(
        `تم إعطاء الإنذار بنجاح للطالب ${student.firstName} ${student.lastName}`
      );
      refetchData();
      return true;
    } catch (error: any) {
      console.error("Error giving warning:", error);
      const errorMessage =
        error?.response?.data?.message || "حدث خطأ أثناء إعطاء الإنذار";
      showErrorToast(errorMessage);
      return false;
    }
  };

  // حذف إنذار باستخدام endpoint مباشر
  const deleteWarning = async (student: Student, warningType: string) => {
    try {
      // حذف الإنذار مباشرة بدون استدعاء GET أولاً
      await warningApi.deleteWarningByType(student._id, warningType);

      showSuccessToast(
        `تم حذف الإنذار بنجاح من ${student.firstName} ${student.lastName}`
      );
      refetchData();
      return true;
    } catch (error: any) {
      console.error("Error deleting warning:", error);
      const errorMessage =
        error?.response?.data?.message || "حدث خطأ أثناء حذف الإنذار";
      showErrorToast(errorMessage);
      return false;
    }
  };

  // حذف تنبيه بالـ ID
  const deleteWarningById = async (warningId: string) => {
    try {
      await warningApi.deleteWarningById(warningId);
      showSuccessToast("تم حذف التنبيه بنجاح");
      refetchData();
      return true;
    } catch (error: any) {
      console.error("Error deleting warning:", error);
      const errorMessage =
        error?.response?.data?.message || "حدث خطأ أثناء حذف التنبيه";
      showErrorToast(errorMessage);
      return false;
    }
  };

  return {
    statistics,
    loadingStatistics,
    fetchTeacherStatistics,
    giveWarning,
    deleteWarning,
    deleteWarningById,
  };
};
