import { useState, useCallback } from "react";
import { 
  deleteTeacherAssistant as deleteTeacherAssistantApi,
  createTeacherAssistant as createTeacherAssistantApi,
  updateTeacherAssistant as updateTeacherAssistantApi,
  bulkDeleteTeacherAssistants as bulkDeleteTeacherAssistantsApi
} from "@/Api/teacherAssistantApi";
import { MESSAGES } from "../constants";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TeacherAssistantFormData = any;

// Custom Error Class for better error handling
class TeacherAssistantError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'TeacherAssistantError';
  }
}

export const useTeacherAssistantsActions = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Helper function to extract error message
  const extractErrorMessage = (response: any, defaultMessage: string): string => {
    return response.message || 
      (response.errors && Array.isArray(response.errors) ? response.errors.join('\n') : null) ||
      defaultMessage;
  };

  const createTeacherAssistant = useCallback(async (data: TeacherAssistantFormData) => {
    setIsSubmitting(true);
    try {
      const response = await createTeacherAssistantApi(data);
      if (!response.success) {
        const errorMsg = extractErrorMessage(response, MESSAGES.ERROR.CREATE);
        throw new TeacherAssistantError(errorMsg, 'CREATE_ERROR');
      }
      return response;
    } catch (error) {
      if (error instanceof TeacherAssistantError) throw error;
      throw new TeacherAssistantError(
        error instanceof Error ? error.message : MESSAGES.ERROR.UNEXPECTED,
        'CREATE_ERROR'
      );
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const updateTeacherAssistant = useCallback(async (id: string, data: Partial<TeacherAssistantFormData>) => {
    setIsSubmitting(true);
    try {
      const response = await updateTeacherAssistantApi(id, data);
      if (!response.success) {
        const errorMsg = extractErrorMessage(response, MESSAGES.ERROR.UPDATE);
        throw new TeacherAssistantError(errorMsg, 'UPDATE_ERROR');
      }
      return response;
    } catch (error) {
      if (error instanceof TeacherAssistantError) throw error;
      throw new TeacherAssistantError(
        error instanceof Error ? error.message : MESSAGES.ERROR.UNEXPECTED,
        'UPDATE_ERROR'
      );
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const deleteTeacherAssistant = useCallback(async (id: string) => {
    setIsSubmitting(true);
    try {
      const response = await deleteTeacherAssistantApi(id);
      if (!response.success) {
        const errorMsg = extractErrorMessage(response, MESSAGES.ERROR.DELETE);
        throw new TeacherAssistantError(errorMsg, 'DELETE_ERROR');
      }
      return response;
    } catch (error) {
      if (error instanceof TeacherAssistantError) throw error;
      throw new TeacherAssistantError(
        error instanceof Error ? error.message : MESSAGES.ERROR.UNEXPECTED,
        'DELETE_ERROR'
      );
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const bulkDeleteTeacherAssistants = useCallback(async (ids: string[]) => {
    setIsSubmitting(true);
    try {
      const response = await bulkDeleteTeacherAssistantsApi(ids);
      if (!response.success) {
        const errorMsg = extractErrorMessage(response, MESSAGES.ERROR.BULK_DELETE);
        throw new TeacherAssistantError(errorMsg, 'BULK_DELETE_ERROR');
      }
      return response;
    } catch (error) {
      if (error instanceof TeacherAssistantError) throw error;
      throw new TeacherAssistantError(
        error instanceof Error ? error.message : MESSAGES.ERROR.UNEXPECTED,
        'BULK_DELETE_ERROR'
      );
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  return {
    createTeacherAssistant,
    updateTeacherAssistant,
    deleteTeacherAssistant,
    bulkDeleteTeacherAssistants,
    isSubmitting,
  };
};
