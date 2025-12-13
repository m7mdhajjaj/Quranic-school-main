// hooks/useProfileValidation.ts
import { useState } from "react";
import { validateField, type FieldErrors } from "@/Validation/profileValidation";
import type { UserProfile } from "../types/profile.types";

export const useProfileValidation = (user: UserProfile | null) => {
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const validateFieldValue = async (
    fieldName: string,
    value: string | undefined
  ) => {
    if (!user) return;

    // Skip duplicate check for phoneNumber (handled separately)
    if (fieldName === "phoneNumber") {
      // Only validate format
      const errorMessage = await validateField(
        fieldName,
        value,
        user.role as "student" | "teacher" | "admin"
      );
      if (errorMessage) {
        setFieldErrors((prev: FieldErrors) => ({
          ...prev,
          [fieldName]: errorMessage,
        }));
      }
      return;
    }

    const errorMessage = await validateField(
      fieldName,
      value,
      user.role as "student" | "teacher" | "admin"
    );
    if (errorMessage) {
      setFieldErrors((prev: FieldErrors) => ({
        ...prev,
        [fieldName]: errorMessage,
      }));
    } else {
      setFieldErrors((prev) => {
        const { [fieldName]: _, ...rest } = prev;
        return rest;
      });
    }
  };

  const clearFieldError = (fieldName: string) => {
    setFieldErrors((prev) => {
      const { [fieldName]: _, ...rest } = prev;
      return rest;
    });
  };

  const clearAllErrors = () => {
    setFieldErrors({});
  };

  return {
    fieldErrors,
    setFieldErrors,
    validateFieldValue,
    clearFieldError,
    clearAllErrors,
  };
};
