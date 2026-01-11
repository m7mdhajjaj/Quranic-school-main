// ============================================================================
// useStudentsActions - Hook لإجراءات الطلاب (CRUD)
// ============================================================================

import { useState } from "react";
import { createStudent, updateStudent, deleteStudent } from "@/Api/studentApi";
import type { StudentFormData } from "@/types/student.types";

export const useStudentsActions = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateStudent = async (data: StudentFormData) => {
    try {
      setLoading(true);
      setError(null);

      const result = await createStudent(data);

      if (!result.success) {
        setError(result.message || "فشل في إضافة الطالب");
        return { success: false, message: result.message };
      }

      return { success: true, data: result.data };
    } catch (err: any) {
      const errorMsg = err?.message || "حدث خطأ غير متوقع";
      setError(errorMsg);
      return { success: false, message: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStudent = async (id: string, data: StudentFormData) => {
    try {
      setLoading(true);
      setError(null);

      const result = await updateStudent(id, data);

      if (!result.success) {
        setError(result.message || "فشل في تحديث الطالب");
        return { success: false, message: result.message };
      }

      return { success: true, data: result.data };
    } catch (err: any) {
      const errorMsg = err?.message || "حدث خطأ غير متوقع";
      setError(errorMsg);
      return { success: false, message: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStudent = async (id: string) => {
    try {
      setLoading(true);
      setError(null);

      const result = await deleteStudent(id);

      if (!result.success) {
        setError(result.message || "فشل في حذف الطالب");
        return { success: false, message: result.message };
      }

      return { success: true };
    } catch (err: any) {
      const errorMsg = err?.message || "حدث خطأ غير متوقع";
      setError(errorMsg);
      return { success: false, message: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    createStudent: handleCreateStudent,
    updateStudent: handleUpdateStudent,
    deleteStudent: handleDeleteStudent,
  };
};
