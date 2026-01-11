import { useState } from "react";
import { createExam, updateExam, deleteExam } from "@/Api/examApi";
import { ExamFormData } from "@/types/exam.types";
import { Alert } from "react-native";

export const useExamActions = (onSuccess: () => void) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateExam = async (data: ExamFormData) => {
    try {
      setIsSubmitting(true);
      await createExam(data);
      Alert.alert("نجاح", "تم إنشاء الامتحان بنجاح");
      onSuccess();
    } catch (error: any) {
      Alert.alert(
        "خطأ",
        error?.response?.data?.message || "فشل إنشاء الامتحان"
      );
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateExam = async (
    examId: string,
    data: Partial<ExamFormData>
  ) => {
    try {
      setIsSubmitting(true);
      await updateExam(examId, data);
      Alert.alert("نجاح", "تم تحديث الامتحان بنجاح");
      onSuccess();
    } catch (error: any) {
      Alert.alert(
        "خطأ",
        error?.response?.data?.message || "فشل تحديث الامتحان"
      );
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteExam = async (examId: string) => {
    try {
      setIsSubmitting(true);
      await deleteExam(examId);
      Alert.alert("نجاح", "تم حذف الامتحان بنجاح");
      onSuccess();
    } catch (error: any) {
      Alert.alert("خطأ", error?.response?.data?.message || "فشل حذف الامتحان");
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    handleCreateExam,
    handleUpdateExam,
    handleDeleteExam,
  };
};
