// ============================================================================
// useWarningsActions Hook - إدارة عمليات الإنذارات
// ============================================================================

import { useState } from "react";
import api from "../../../Api/api";
import type {
  Student,
  WarningType,
  TeacherStatistics,
} from "../types/warnings";
import {
  showSuccessToast,
  showErrorToast,
} from "../../../components/utils/toastUtils";

export const useWarningsActions = (refetchData: () => void) => {
  const [loadingStatistics, setLoadingStatistics] = useState(false);
  const [statistics, setStatistics] = useState<TeacherStatistics | null>(null);

  // جلب إحصائيات المعلم
  const fetchTeacherStatistics = async () => {
    try {
      setLoadingStatistics(true);
      const response = await api.get("/warnings/statistics/teacher");
      setStatistics(response.data);
      return response.data;
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
      await api.post("/warnings", {
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

  // حذف إنذار
  const deleteWarning = async (student: Student, warningType: string) => {
    try {
      // جلب إنذارات الطالب
      const warningsRes = await api.get(`/warnings/student/${student._id}`);
      const studentWarnings = Array.isArray(warningsRes.data)
        ? warningsRes.data
        : [];

      // العثور على الإنذار
      const warningToDelete = studentWarnings.find(
        (w: any) => w.type === warningType
      );

      if (!warningToDelete) {
        showErrorToast("لم يتم العثور على الإنذار");
        return false;
      }

      // حذف الإنذار
      await api.delete(`/warnings/${warningToDelete._id}`);

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
      await api.delete(`/warnings/${warningId}`);
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
