import { useState } from "react";
import {
  createWarning,
  deleteWarningById,
  deleteWarningByType,
} from "@/Api/warningApi";
import { CreateWarningData, WarningType } from "@/types/warning.types";
import { Alert } from "react-native";

export const useWarningsActions = (onSuccess: () => void) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateWarning = async (data: CreateWarningData) => {
    try {
      setIsSubmitting(true);
      await createWarning(data);
      Alert.alert("نجاح", "تم إضافة الإنذار بنجاح");
      onSuccess();
    } catch (error: any) {
      Alert.alert("خطأ", error?.response?.data?.message || "فشل إضافة الإنذار");
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteWarningByType = async (
    studentId: string,
    warningType: WarningType
  ) => {
    try {
      setIsSubmitting(true);
      await deleteWarningByType(studentId, warningType);
      Alert.alert("نجاح", "تم حذف الإنذار بنجاح");
      onSuccess();
    } catch (error: any) {
      Alert.alert("خطأ", error?.response?.data?.message || "فشل حذف الإنذار");
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteWarningById = async (warningId: string) => {
    try {
      setIsSubmitting(true);
      await deleteWarningById(warningId);
      Alert.alert("نجاح", "تم حذف الإنذار بنجاح");
      onSuccess();
    } catch (error: any) {
      Alert.alert("خطأ", error?.response?.data?.message || "فشل حذف الإنذار");
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    handleCreateWarning,
    handleDeleteWarningByType,
    handleDeleteWarningById,
  };
};
