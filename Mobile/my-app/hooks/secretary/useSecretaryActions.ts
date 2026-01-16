// ============================================================================
// useSecretaryActions Hook - عمليات السكرتير (إضافة، تعديل، حذف)
// ============================================================================

import { useState, useCallback } from "react";
import {
  createSecretary,
  updateSecretary,
  deleteSecretary,
  updateSecretaryPermissions,
  type SecretaryFormData,
  type SecretaryPermissions,
} from "@/Api/secretaryApi";

interface ActionResult {
  success: boolean;
  message?: string;
}

interface UseSecretaryActionsReturn {
  loading: boolean;
  createNewSecretary: (data: SecretaryFormData) => Promise<ActionResult>;
  updateExistingSecretary: (
    id: string,
    data: Partial<SecretaryFormData>
  ) => Promise<ActionResult>;
  deleteExistingSecretary: (id: string) => Promise<ActionResult>;
  updatePermissions: (
    id: string,
    permissions: SecretaryPermissions
  ) => Promise<ActionResult>;
}

export const useSecretaryActions = (): UseSecretaryActionsReturn => {
  const [loading, setLoading] = useState(false);

  const createNewSecretary = useCallback(
    async (data: SecretaryFormData): Promise<ActionResult> => {
      try {
        setLoading(true);
        const response = await createSecretary(data);
        return {
          success: response.success,
          message: response.message,
        };
      } catch (error) {
        console.error("Error creating secretary:", error);
        return {
          success: false,
          message: "حدث خطأ أثناء إنشاء السكرتير",
        };
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const updateExistingSecretary = useCallback(
    async (
      id: string,
      data: Partial<SecretaryFormData>
    ): Promise<ActionResult> => {
      try {
        setLoading(true);
        const response = await updateSecretary(id, data);
        return {
          success: response.success,
          message: response.message,
        };
      } catch (error) {
        console.error("Error updating secretary:", error);
        return {
          success: false,
          message: "حدث خطأ أثناء تحديث بيانات السكرتير",
        };
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const deleteExistingSecretary = useCallback(
    async (id: string): Promise<ActionResult> => {
      try {
        setLoading(true);
        const response = await deleteSecretary(id);
        return {
          success: response.success,
          message: response.message,
        };
      } catch (error) {
        console.error("Error deleting secretary:", error);
        return {
          success: false,
          message: "حدث خطأ أثناء حذف السكرتير",
        };
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const updatePermissions = useCallback(
    async (
      id: string,
      permissions: SecretaryPermissions
    ): Promise<ActionResult> => {
      try {
        setLoading(true);
        const response = await updateSecretaryPermissions(id, permissions);
        return {
          success: response.success,
          message: response.message,
        };
      } catch (error) {
        console.error("Error updating permissions:", error);
        return {
          success: false,
          message: "حدث خطأ أثناء تحديث الصلاحيات",
        };
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    loading,
    createNewSecretary,
    updateExistingSecretary,
    deleteExistingSecretary,
    updatePermissions,
  };
};

export default useSecretaryActions;
