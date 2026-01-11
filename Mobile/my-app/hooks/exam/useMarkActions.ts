import { useState } from "react";
import { addOrUpdateMark, deleteMark, getExamMarks } from "@/Api/examApi";
import { Mark } from "@/types/exam.types";
import { Alert } from "react-native";

export const useMarkActions = (
  examId: string | null,
  onSuccess: () => void
) => {
  const [marks, setMarks] = useState<Mark[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchMarks = async () => {
    if (!examId) return;
    try {
      setLoading(true);
      const data = await getExamMarks(examId);
      setMarks(data);
    } catch (error: any) {
      Alert.alert(
        "خطأ",
        error?.response?.data?.message || "فشل تحميل العلامات"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAddOrUpdateMark = async (studentId: string, mark: number) => {
    if (!examId) return;
    try {
      setIsSubmitting(true);
      await addOrUpdateMark(examId, studentId, mark);
      Alert.alert("نجاح", "تم حفظ العلامة بنجاح");
      await fetchMarks();
      onSuccess();
    } catch (error: any) {
      Alert.alert("خطأ", error?.response?.data?.message || "فشل حفظ العلامة");
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteMark = async (studentId: string) => {
    if (!examId) return;
    try {
      setIsSubmitting(true);
      await deleteMark(examId, studentId);
      Alert.alert("نجاح", "تم حذف العلامة بنجاح");
      await fetchMarks();
      onSuccess();
    } catch (error: any) {
      Alert.alert("خطأ", error?.response?.data?.message || "فشل حذف العلامة");
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    marks,
    loading,
    isSubmitting,
    fetchMarks,
    handleAddOrUpdateMark,
    handleDeleteMark,
  };
};
